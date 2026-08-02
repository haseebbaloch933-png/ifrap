'use client';

import React, { useState } from 'react';
import { useRBAC, UserRole } from '@/lib/rbac-context';
import { useI18n } from '@/lib/i18n-context';
import { useSession, signIn, signOut } from 'next-auth/react';

export function RoleSwitcher() {
  const { role, setRole } = useRBAC();
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { key: UserRole; label: string; badgeColor: string; description: string }[] = [
    {
      key: 'FIELD_ENUMERATOR',
      label: t.roles.enumerator,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Spatial map, field survey input, basic telemetry. Restricted from financial burn rate & budget.',
    },
    {
      key: 'PROVINCIAL_PIU',
      label: t.roles.officer,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description: 'Regional telemetry, GRM tickets, spatial layers, operational summaries, burn rate.',
    },
    {
      key: 'FPMU_DIRECTOR',
      label: t.roles.director,
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      description: 'Full admin access: budget allocations, burn rates, compliance logs, export APIs.',
    },
  ];

  const currentRoleInfo = roles.find((r) => r.key === role) || roles[0];

  if (status === 'loading') {
    return (
      <div className="w-24 h-8 bg-slate-800 rounded animate-pulse" />
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="px-4 py-1.5 text-xs font-semibold bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 rounded-sm transition-colors"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left z-30">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider hidden md:inline">
          {session.user?.name}:
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`${t.roles.currentRole}: ${currentRoleInfo.label}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={`px-3 py-1.5 rounded-sm border text-xs font-semibold flex items-center gap-2 transition-all ${currentRoleInfo.badgeColor} hover:opacity-90 focus:outline-none`}
        >
          <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
          <span>{currentRoleInfo.label}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 ltr:right-0 rtl:left-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl backdrop-blur-xl p-2 space-y-1.5 focus:outline-none z-50">
          <div className="px-3 py-2 border-b border-white/10">
            <p className="text-xs font-bold text-slate-200">{session.user?.name}</p>
            <p className="text-[10px] text-slate-400">{session.user?.email}</p>
          </div>

          <div className="p-2 bg-slate-800/50 rounded-lg my-2 border border-slate-700">
            <div className="flex items-center justify-between font-bold text-xs text-slate-300 mb-1">
              <span>Current Role</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentRoleInfo.badgeColor}`}>{currentRoleInfo.label}</span>
            </div>
            <p className="text-[10px] text-slate-400">{currentRoleInfo.description}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-between"
          >
            Sign Out
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
