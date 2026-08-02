'use client';

import React, { useEffect, useState } from 'react';
import { offlineDB, syncOfflineQueue } from '@/lib/offline/indexed-db';

export function PwaRegister() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

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
      setSyncToast('Network restored. Flushing offline queue...');
      setIsSyncing(true);
      try {
        const res = await syncOfflineQueue();
        if (res.synced > 0) {
          setSyncToast(`Successfully synced ${res.synced} offline item(s).`);
        } else {
          setSyncToast('Online — Queue synced');
        }
      } catch (err: any) {
        setSyncToast(`Sync completed with errors: ${err.message || String(err)}`);
      } finally {
        setIsSyncing(false);
        refreshPendingCount();
        setTimeout(() => setSyncToast(null), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncToast('Offline Mode — Submissions will buffer locally in IndexedDB');
      setTimeout(() => setSyncToast(null), 5000);
      refreshPendingCount();
    };

    const handleSyncComplete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSyncToast(`Synced ${detail?.synced || 0} offline records`);
      refreshPendingCount();
      setTimeout(() => setSyncToast(null), 4000);
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
      await syncOfflineQueue();
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
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-white/10 text-slate-200 text-xs shadow-lg animate-fade-in flex items-center gap-2">
          <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">{syncToast}</span>
        </div>
      )}
    </div>
  );
}
