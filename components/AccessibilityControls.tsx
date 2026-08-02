'use client';

import React, { useState } from 'react';
import { useAccessibility, TextSize } from '@/lib/accessibility-context';
import { useI18n } from '@/lib/i18n-context';

export function AccessibilityControls() {
  const { highContrast, toggleHighContrast, textSize, setTextSize } = useAccessibility();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1.5">
        {/* Quick High Contrast Toggle Button */}
        <button
          onClick={toggleHighContrast}
          aria-label={t.accessibility.highContrastToggle}
          aria-pressed={highContrast}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
            highContrast
              ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold shadow-md shadow-yellow-400/20'
              : 'bg-slate-900/80 text-slate-200 border-white/15 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <svg
            className={`w-4 h-4 ${highContrast ? 'text-slate-950' : 'text-amber-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v18m0-18a9 9 0 019 9 9 9 0 01-9 9m0-18a9 9 0 00-9 9 9 9 0 009 9"
            />
          </svg>
          <span className="hidden sm:inline font-mono">
            {highContrast ? 'HC ON' : 'HC'}
          </span>
        </button>

        {/* Text Sizing Dropdown / Popover Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t.accessibility.textSize}
          aria-expanded={isOpen}
          aria-controls="accessibility-menu"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/15 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <span className="font-bold text-sm">A</span>
          <span className="font-bold text-xs">A</span>
          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Popover Menu for Text Size Settings */}
      {isOpen && (
        <div
          id="accessibility-menu"
          role="region"
          aria-label={t.accessibility.title}
          className="absolute right-0 ltr:right-0 rtl:left-0 mt-2 w-56 p-3 rounded-xl bg-slate-900 border border-white/20 shadow-2xl z-50 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-slate-100">{t.accessibility.title}</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Close accessibility menu"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 text-[11px] font-medium block">{t.accessibility.textSize}</span>
            <div className="grid grid-cols-3 gap-1">
              {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  aria-pressed={textSize === size}
                  className={`py-1 px-2 rounded-lg text-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    textSize === size
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {size === 'normal' ? '100%' : size === 'large' ? '115%' : '130%'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
