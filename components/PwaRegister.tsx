'use client';

import React, { useEffect, useState } from 'react';
import { offlineDB, syncOfflineQueue } from '@/lib/offline/indexed-db';

interface SyncToast {
  message: string;
  tone: 'success' | 'error' | 'info';
  showSignIn?: boolean;
}

// Turns a sync result into an honest, actionable toast — never claims success
// when drafts are still queued. This is the fix for the bug where a fully
// failed sync (e.g. an expired session) showed "Online — Queue synced".
function describeSyncResult(res: { synced: number; failed: number; authFailure: boolean }): SyncToast {
  if (res.failed === 0) {
    return res.synced > 0
      ? { message: `Successfully synced ${res.synced} offline item(s).`, tone: 'success' }
      : { message: 'Online — nothing queued to sync.', tone: 'info' };
  }
  if (res.authFailure) {
    return {
      message: res.synced > 0
        ? `Synced ${res.synced} item(s); ${res.failed} could not sync — your session may have expired.`
        : `${res.failed} item(s) could not sync — your session may have expired. Sign in again to submit them.`,
      tone: 'error',
      showSignIn: true,
    };
  }
  return {
    message: res.synced > 0
      ? `Synced ${res.synced} item(s); ${res.failed} failed — still queued. Check your connection and try again.`
      : `${res.failed} item(s) failed to sync — still queued. Check your connection and try again.`,
    tone: 'error',
  };
}

export function PwaRegister() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<SyncToast | null>(null);

  useEffect(() => {
    // 1. Initial network status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    // 2. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PwaRegister] ServiceWorker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PwaRegister] ServiceWorker registration failed:', err);
          });
      });

      // Listen to messages from Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
          handleTriggerSync();
        }
      });
    }

    // 3. Update pending count
    const refreshPendingCount = async () => {
      try {
        const count = await offlineDB.getPendingCount();
        setPendingCount(count);
      } catch (err) {
        console.warn('[PwaRegister] Could not fetch pending draft count:', err);
      }
    };

    refreshPendingCount();

    // 4. Window network status listeners
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncToast({ message: 'Network restored. Flushing offline queue...', tone: 'info' });
      setIsSyncing(true);
      try {
        const res = await syncOfflineQueue();
        const toast = describeSyncResult(res);
        setSyncToast(toast);
        if (toast.tone !== 'error') {
          setTimeout(() => setSyncToast(null), 5000);
        }
      } catch (err: any) {
        // A thrown error (vs. a per-draft failure already counted in `failed`)
        // means the sync couldn't even run — still an honest failure state,
        // not a success, and stays visible like any other error toast.
        setSyncToast({ message: `Sync failed: ${err.message || String(err)} — items remain queued.`, tone: 'error' });
      } finally {
        setIsSyncing(false);
        refreshPendingCount();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncToast({ message: 'Offline Mode — Submissions will buffer locally in IndexedDB', tone: 'info' });
      setTimeout(() => setSyncToast(null), 5000);
      refreshPendingCount();
    };

    const handleSyncComplete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const toast = describeSyncResult({
        synced: detail?.synced || 0,
        failed: detail?.failed || 0,
        authFailure: !!detail?.authFailure,
      });
      setSyncToast(toast);
      refreshPendingCount();
      if (toast.tone !== 'error') {
        setTimeout(() => setSyncToast(null), 4000);
      }
    };

    const handleDraftSaved = () => {
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-sync-complete', handleSyncComplete);
    window.addEventListener('offline-draft-saved', handleDraftSaved);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-sync-complete', handleSyncComplete);
      window.removeEventListener('offline-draft-saved', handleDraftSaved);
    };
  }, []);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncOfflineQueue();
      const toast = describeSyncResult(res);
      setSyncToast(toast);
      if (toast.tone !== 'error') {
        setTimeout(() => setSyncToast(null), 5000);
      }
      const count = await offlineDB.getPendingCount();
      setPendingCount(count);
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't render banner if online and no pending count and no active toast
  if (isOnline && pendingCount === 0 && !syncToast && !isSyncing) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-2 pointer-events-auto"
    >
      {/* Network Status Badge */}
      <div
        className={`p-3 rounded-xl backdrop-blur-xl border shadow-2xl flex items-center justify-between text-xs font-medium transition-all duration-300 ${
          !isOnline
            ? 'bg-amber-950/80 border-amber-500/40 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
            : isSyncing
            ? 'bg-blue-950/80 border-blue-500/40 text-blue-200 shadow-[0_0_25px_rgba(59,130,246,0.2)]'
            : 'bg-slate-900/80 border-slate-700/50 text-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full animate-pulse ${
              !isOnline
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                : isSyncing
                ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
            }`}
            aria-hidden="true"
          />
          <div>
            <div className="font-semibold tracking-wide">
              {!isOnline
                ? 'OFFLINE MODE — Remote Balochistan'
                : isSyncing
                ? 'SYNCING OFFLINE QUEUE...'
                : 'ONLINE MODE'}
            </div>
            {pendingCount > 0 && (
              <div className="text-[11px] opacity-80 mt-0.5">
                {pendingCount} AES-256 encrypted payload(s) pending sync
              </div>
            )}
          </div>
        </div>

        {isOnline && pendingCount > 0 && (
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="ml-3 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div
          role={syncToast.tone === 'error' ? 'alert' : undefined}
          className={`p-2.5 rounded-lg border shadow-lg animate-fade-in flex items-start gap-2 text-xs ${
            syncToast.tone === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-slate-900/90 border-white/10 text-slate-200'
          }`}
        >
          <svg
            className={`w-4 h-4 shrink-0 mt-0.5 ${syncToast.tone === 'error' ? 'text-rose-400' : 'text-cyan-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="block">{syncToast.message}</span>
            {syncToast.showSignIn && (
              <a
                href="/login"
                className="inline-block mt-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold transition-colors"
              >
                Sign In Again
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
