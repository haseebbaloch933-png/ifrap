'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n-context';

export function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useI18n();

  return (
    <button
      onClick={toggleLanguage}
      aria-label={t.accessibility.langToggle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/15 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <svg
        className="w-4 h-4 text-emerald-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.198 15.605 6 18.75"
        />
      </svg>
      <span className="font-mono font-bold uppercase">
        {language === 'en' ? 'EN' : 'UR'}
      </span>
      <span className="hidden md:inline text-[11px] text-slate-400">
        {language === 'en' ? '(اردو)' : '(EN)'}
      </span>
    </button>
  );
}
