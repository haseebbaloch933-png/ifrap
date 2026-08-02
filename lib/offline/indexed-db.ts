/**
 * IndexedDB Offline Storage & Re-Sync Manager (`AntigravityOfflineDB`)
 * Provides encrypted persistence for field log drafts, survey forms, and GRM tickets
 * with automated network restoration re-syncing (`syncOfflineQueue()`).
 */

import { encryptPayload, decryptPayload, EncryptedEnvelope } from './crypto-storage';
import { scrubPayload } from '../privacy/ner-pii-scrubber';

export type DraftType = 'FIELD_LOG' | 'SURVEY_FORM' | 'GRM_TICKET' | 'USUFRUCT_CERT';

export interface PendingSyncRecord {
  id: string;
  type: DraftType;
  endpoint: string;
  envelope: EncryptedEnvelope;
  createdAt: number;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retries: number;
  lastError?: string;
}

export interface DecryptedDraft<T = Record<string, any>> {
  id: string;
  type: DraftType;
  endpoint: string;
  createdAt: number;
  data: T;
}

const DB_NAME = 'AntigravityOfflineDB';
const DB_VERSION = 1;
const STORE_PENDING = 'pending_sync';
const STORE_CACHE = 'cached_api';

export class AntigravityOfflineDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[AntigravityOfflineDB] Reconnection detected. Triggering auto-sync queue...');
        this.syncOfflineQueue().catch((err) => {
          console.error('[AntigravityOfflineDB] Auto-sync failed:', err);
        });
      });
    }
  }

  /**
   * Initializes or returns the open IndexedDB instance.
   */
  private async getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB is not available in current environment context.');
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Pending sync object store
        if (!db.objectStoreNames.contains(STORE_PENDING)) {
          const pendingStore = db.createObjectStore(STORE_PENDING, { keyPath: 'id' });
          pendingStore.createIndex('by_type', 'type', { unique: false });
          pendingStore.createIndex('by_status', 'syncStatus', { unique: false });
          pendingStore.createIndex('by_createdAt', 'createdAt', { unique: false });
        }

        // Cached API object store
        if (!db.objectStoreNames.contains(STORE_CACHE)) {
          const cacheStore = db.createObjectStore(STORE_CACHE, { keyPath: 'url' });
          cacheStore.createIndex('by_timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Scrubs PII, encrypts payload with AES-256-GCM, and persists to IndexedDB.
   */
  public async saveEncryptedDraft<T extends Record<string, any>>(
    type: DraftType,
    rawPayload: T,
    endpoint: string = '/api/telemetry'
  ): Promise<string> {
    const db = await this.getDB();
    const id = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // 1. Scrub PII from payload
    const sanitizedPayload = scrubPayload(rawPayload);

    // 2. Encrypt scrubbed payload
    const envelope = await encryptPayload(sanitizedPayload);

    const record: PendingSyncRecord = {
      id,
      type,
      endpoint,
      envelope,
      createdAt: Date.now(),
      syncStatus: 'PENDING',
      retries: 0,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      const store = tx.objectStore(STORE_PENDING);
      const request = store.put(record);

      request.onsuccess = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('offline-draft-saved', {
              detail: { id, type, count: 1 },
            })
          );
        }
        resolve(id);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves and decrypts all pending offline drafts.
   */
  public async getPendingDrafts(): Promise<DecryptedDraft[]> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readonly');
      const store = tx.objectStore(STORE_PENDING);
      const index = store.index('by_status');
      const request = index.getAll('PENDING');

      request.onsuccess = async () => {
        const records: PendingSyncRecord[] = request.result || [];
        const decryptedList: DecryptedDraft[] = [];

        for (const rec of records) {
          try {
            const data = await decryptPayload<Record<string, any>>(rec.envelope);
            decryptedList.push({
              id: rec.id,
              type: rec.type,
              endpoint: rec.endpoint,
              createdAt: rec.createdAt,
              data,
            });
          } catch (err) {
            console.error(`[AntigravityOfflineDB] Decryption failed for record ${rec.id}:`, err);
          }
        }

        resolve(decryptedList);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Returns count of currently pending offline sync items.
   */
  public async getPendingCount(): Promise<number> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_PENDING, 'readonly');
        const store = tx.objectStore(STORE_PENDING);
        const index = store.index('by_status');
        const request = index.count('PENDING');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return 0;
    }
  }

  /**
   * Deletes a draft record by ID from IndexedDB.
   */
  public async deleteDraft(id: string): Promise<void> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PENDING, 'readwrite');
      const store = tx.objectStore(STORE_PENDING);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Automatic re-sync routine: flushes pending queue when internet connection returns.
   */
  public async syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('[AntigravityOfflineDB] Device is offline. Skipping sync queue execution.');
      return { synced: 0, failed: 0 };
    }

    const pendingDrafts = await this.getPendingDrafts();
    if (pendingDrafts.length === 0) {
      return { synced: 0, failed: 0 };
    }

    console.log(`[AntigravityOfflineDB] Attempting auto-sync for ${pendingDrafts.length} pending draft(s)...`);

    let synced = 0;
    let failed = 0;

    for (const draft of pendingDrafts) {
      try {
        const response = await fetch(draft.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Offline-Synced': 'true',
          },
          body: JSON.stringify(draft.data),
        });

        if (response.ok) {
          await this.deleteDraft(draft.id);
          synced++;
          console.log(`[AntigravityOfflineDB] Successfully synced draft ${draft.id}`);
        } else {
          failed++;
          console.warn(`[AntigravityOfflineDB] Sync server responded with HTTP ${response.status} for draft ${draft.id}`);
        }
      } catch (err: any) {
        failed++;
        console.error(`[AntigravityOfflineDB] Network error syncing draft ${draft.id}:`, err.message);
      }
    }

    if (synced > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('offline-sync-complete', {
          detail: { synced, failed, remaining: pendingDrafts.length - synced },
        })
      );
    }

    return { synced, failed };
  }
}

// Singleton instance export
export const offlineDB = new AntigravityOfflineDB();

/**
 * Global helper routine for auto-syncing offline queue when connectivity returns.
 */
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  return offlineDB.syncOfflineQueue();
}
