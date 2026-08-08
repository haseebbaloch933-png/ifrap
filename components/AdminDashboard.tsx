'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';

interface AuditEntry {
  id: string;
  seq: number;
  at: string;
  actor: { sub: string; email: string; role: string };
  method: string;
  route: string;
  action: string;
  status: number;
  target?: string;
}
interface AuditVerification {
  valid: boolean;
  entries: number;
  brokenAtSeq?: number;
  reason?: string;
}

export function AdminDashboard() {
  const animated = useAnimateIn(100);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditVerification, setAuditVerification] = useState<AuditVerification | null>(null);
  const [auditState, setAuditState] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadAuditLog = useCallback(async () => {
    setAuditState('loading');
    try {
      const res = await fetch('/api/audit-log', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAuditEntries(Array.isArray(data.entries) ? data.entries : []);
      setAuditVerification(data.verification ?? null);
      setAuditState('ready');
    } catch {
      setAuditState('error');
    }
  }, []);

  useEffect(() => {
    loadAuditLog();
  }, [loadAuditLog]);

  // Pull the live telemetry source and report what came back.
  const handleForceSync = async () => {
    setSyncing(true);
    setSyncMessage('Contacting telemetry source…');
    try {
      const res = await fetch('/api/telemetry', { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const districts = Array.isArray(data.districts) ? data.districts.length : 0;
      setSyncMessage(`Pulled ${districts} district records from telemetry source at ${new Date().toLocaleTimeString()}.`);
    } catch (err: any) {
      setSyncMessage(`Pull failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Parse a single CSV line honoring simple double-quote quoting.
  const parseCsvLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        out.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };

  // KoboToolbox CSV upload: parse client-side, then ACTUALLY ingest each row via
  // /api/field-logs (PII is scrubbed and persisted server-side there) and report
  // how many were persisted. Bounded to keep a huge export from stalling the demo.
  const MAX_INGEST_ROWS = 500;
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setUploadMessage(`"${file.name}" has no data rows — nothing to import.`);
        return;
      }
      const headers = parseCsvLine(lines[0]);
      const dataLines = lines.slice(1);
      const capped = dataLines.slice(0, MAX_INGEST_ROWS);

      setUploadMessage(`Ingesting ${capped.length} record(s) from "${file.name}"…`);

      let ingested = 0;
      let failed = 0;
      for (const line of capped) {
        const cells = parseCsvLine(line);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => { row[h || `col_${i}`] = cells[i] ?? ''; });
        try {
          const res = await fetch('/api/field-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source: 'kobo-csv', filename: file.name, ...row }),
          });
          if (res.ok) ingested++; else failed++;
        } catch {
          failed++;
        }
      }

      const dropped = dataLines.length - capped.length;
      const parts = [`Ingested & persisted ${ingested} record(s) × ${headers.length} column(s) from "${file.name}".`];
      if (failed > 0) parts.push(`${failed} failed.`);
      if (dropped > 0) parts.push(`${dropped} row(s) beyond the ${MAX_INGEST_ROWS}-row cap were skipped.`);
      setUploadMessage(parts.join(' '));
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
        <p className="text-sm text-slate-400 mt-2">IFRAP Programme • FPMU Director Overview</p>
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
              {syncing ? 'Pulling…' : 'Pull Latest Telemetry'}
            </button>
            {syncMessage && (
              <p role="status" className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700 rounded px-3 py-2">
                {syncMessage}
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Immutable Access / Audit Log (ESS10) */}
      <GlassCard>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Access &amp; Audit Log</h2>
            <p className="text-sm text-slate-400 mt-1">
              Tamper-evident record of every access to grievance, land-tenure, and field data
              (GRM, fiduciary, field-logs). World Bank ESS10.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAuditLog}
            disabled={auditState === 'loading'}
            className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-xs font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {auditState === 'loading' ? 'Verifying…' : 'Re-verify chain'}
          </button>
        </div>

        {/* Chain integrity banner */}
        {auditVerification && (
          <div
            role="status"
            className={`mb-4 px-3 py-2 rounded border text-xs font-semibold ${
              auditVerification.valid
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}
          >
            {auditVerification.valid
              ? `✓ Chain intact — ${auditVerification.entries} entr${auditVerification.entries === 1 ? 'y' : 'ies'} verified, no tampering detected.`
              : `✗ Chain integrity FAILED at entry #${auditVerification.brokenAtSeq ?? '?'}${auditVerification.reason ? ` (${auditVerification.reason})` : ''}. Records may have been altered.`}
          </div>
        )}

        {auditState === 'error' && (
          <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded px-3 py-2">
            Could not load the audit log.
          </p>
        )}

        {auditState === 'ready' && auditEntries.length === 0 && (
          <p className="text-sm text-slate-400">No access recorded yet.</p>
        )}

        {auditEntries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">#</th>
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">Time (UTC)</th>
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">Actor</th>
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">Action</th>
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">Route</th>
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">Target</th>
                  <th className="py-2 pr-3 font-semibold whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditEntries.slice(0, 100).map((e) => (
                  <tr key={e.id} className="text-slate-300">
                    <td className="py-2 pr-3 font-mono text-slate-500 whitespace-nowrap">{e.seq}</td>
                    <td className="py-2 pr-3 font-mono whitespace-nowrap">{e.at.replace('T', ' ').replace('Z', '').slice(0, 19)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className="text-slate-200">{e.actor.email || e.actor.sub}</span>
                      {e.actor.role && <span className="ml-1.5 text-[10px] text-slate-500">{e.actor.role}</span>}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          e.action === 'DENIED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : e.action === 'LIST'
                            ? 'bg-slate-600/40 text-slate-300'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        {e.action}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-slate-400 whitespace-nowrap">{e.route}</td>
                    <td className="py-2 pr-3 font-mono text-slate-400 whitespace-nowrap">{e.target ?? '—'}</td>
                    <td className="py-2 pr-3 font-mono whitespace-nowrap">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {auditEntries.length > 100 && (
              <p className="text-[11px] text-slate-500 mt-2">Showing the 100 most recent of {auditEntries.length} entries.</p>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
