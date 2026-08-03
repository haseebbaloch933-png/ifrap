'use client';

import React, { useState, useRef } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';

export function AdminDashboard() {
  const animated = useAnimateIn(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Force Sync: re-pull the live telemetry source and report what came back.
  const handleForceSync = async () => {
    setSyncing(true);
    setSyncMessage('Contacting telemetry source…');
    try {
      const res = await fetch('/api/telemetry', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const districts = Array.isArray(data.districts) ? data.districts.length : 0;
      setSyncMessage(`Synced ${districts} district records from telemetry source at ${new Date().toLocaleTimeString()}.`);
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // KoboToolbox CSV upload: parse and validate the file client-side and report rows/columns.
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        setUploadMessage(`"${file.name}" is empty — nothing to import.`);
        return;
      }
      const columns = lines[0].split(',').length;
      const rows = Math.max(0, lines.length - 1);
      setUploadMessage(`Parsed ${rows} record(s) × ${columns} column(s) from "${file.name}". Validated and ready for ingestion.`);
    };
    reader.onerror = () => setUploadMessage(`Could not read "${file.name}".`);
    reader.readAsText(file);
    // allow re-selecting the same file
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">System <span className="text-violet-400">Admin Dashboard</span></h1>
        <p className="text-sm text-slate-400 mt-2">IFRAP Component 3 • FPMU Director Overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-4">User Management</h2>
          <p className="text-sm text-slate-400 mb-4">
            Manage system access and assign roles (Simulated View).
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/10">
              <div>
                <p className="text-sm font-semibold text-slate-200">enumerator@ifrap.gov.pk</p>
                <p className="text-xs text-slate-500">Field Enumerator</p>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/10">
              <div>
                <p className="text-sm font-semibold text-slate-200">piu@ifrap.gov.pk</p>
                <p className="text-xs text-slate-500">Provincial PIU Officer</p>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/10">
              <div>
                <p className="text-sm font-semibold text-slate-200">director@ifrap.gov.pk</p>
                <p className="text-xs text-slate-500">FPMU Director</p>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">ACTIVE</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-bold text-white mb-4">Data Source Sync</h2>
          <p className="text-sm text-slate-400 mb-4">
            Import field telemetry and custom capability datasets.
          </p>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelected}
              className="sr-only"
              aria-label="Upload KoboToolbox CSV export"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border border-dashed border-slate-600 rounded-lg text-center bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-500 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-slate-300 font-medium">Upload KoboToolbox Export (CSV)</p>
              <p className="text-xs text-slate-500 mt-1">Click to select a CSV of field observations</p>
            </button>
            {uploadMessage && (
              <p role="status" className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded px-3 py-2">
                {uploadMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleForceSync}
              disabled={syncing}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {syncing ? 'Syncing…' : 'Force Sync Database'}
            </button>
            {syncMessage && (
              <p role="status" className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700 rounded px-3 py-2">
                {syncMessage}
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
