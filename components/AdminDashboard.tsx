'use client';

import React from 'react';
import { GlassCard } from '@/components/GlassCard';
import { useAnimateIn } from '@/hooks/useAnimateIn';

export function AdminDashboard() {
  const animated = useAnimateIn(100);

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
            <div className="p-4 border border-dashed border-slate-600 rounded-lg text-center bg-slate-900/50">
              <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-slate-300 font-medium">Upload KoboToolbox Export (CSV)</p>
              <p className="text-xs text-slate-500 mt-1">Sync new field observations to the live database</p>
            </div>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors text-sm font-semibold">
              Force Sync Database
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
