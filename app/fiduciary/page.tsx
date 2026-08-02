'use client';

import React from 'react';
import { UsufructGenerator } from '@/components/UsufructGenerator';
import { RoleGate } from '@/lib/rbac-context';

export default function FiduciaryPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Fiduciary Shield • Usufruct Digital Ledger
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Customary Legal Usufruct &{' '}
          <span className="bg-gradient-to-r from-violet-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Fiduciary Shield
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
          Digital compliance validation ledger safeguarding ancestral customary water and land rights 
          for indigenous Balochistan clans against elite capture and predatory infrastructure encroachment.
        </p>
      </section>

      <RoleGate allowedRoles={['PROVINCIAL_PIU', 'FPMU_DIRECTOR']}>
        {null}
      </RoleGate>
      <UsufructGenerator />
    </div>
  );
}
