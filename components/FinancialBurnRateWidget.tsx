'use client';

import React from 'react';
import { GlassCard } from '@/components/GlassCard';
import { RoleGate } from '@/lib/rbac-context';
import { useAnimateIn } from '@/hooks/useAnimateIn';

export interface FinancialBurnRateWidgetProps {
  districtName?: string;
  totalAllocatedPKR: number;
  disbursedPKR: number;
}

const formatPKR = (amount: number) => `${(amount / 1000000).toFixed(1)}M PKR`;

export function FinancialBurnRateWidget({
  districtName = 'Balochistan Overall',
  totalAllocatedPKR,
  disbursedPKR,
}: FinancialBurnRateWidgetProps) {
  const animated = useAnimateIn(100);
  const percentage = totalAllocatedPKR > 0 ? Math.round((disbursedPKR / totalAllocatedPKR) * 100) : 0;

  return (
    <RoleGate allowedRoles={['PROVINCIAL_PIU', 'FPMU_DIRECTOR']}>
      <GlassCard glowColor="amber" className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-base font-bold text-slate-100">
              Financial Compensation Burn Rate & Budget Allocation
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 uppercase">
            Restricted Fiduciary View
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Total Allocation (IFRAP C3)</span>
            <div className="text-xl font-bold text-emerald-400">{formatPKR(totalAllocatedPKR)}</div>
            <p className="text-[10px] text-slate-500 font-sans">{districtName} Grant Allocation</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Disbursed Compensation</span>
            <div className="text-xl font-bold text-amber-400">{formatPKR(disbursedPKR)}</div>
            <p className="text-[10px] text-slate-500 font-sans">{percentage}% Burn Rate Executed</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Remaining Reserve</span>
            <div className="text-xl font-bold text-cyan-400">{formatPKR(totalAllocatedPKR - disbursedPKR)}</div>
            <p className="text-[10px] text-slate-500 font-sans">Unallocated Contingency</p>
          </div>
        </div>

        {/* Burn Rate Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Disbursement Progress</span>
            <span className="text-amber-300 font-bold">{percentage}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400"
              style={{
                width: animated ? `${percentage}%` : '0%',
                transition: 'width 1s ease-out'
              }}
            />
          </div>
        </div>
      </GlassCard>
    </RoleGate>
  );
}
