import React from 'react';
import type { Metadata } from 'next';
import {
  IFRAP_PDO,
  IFRAP_INSTRUMENT,
  RESULTS_FRAMEWORK,
  getResultsFrameworkSummary,
  type IndicatorStatus,
} from '@/lib/results-framework';

export const metadata: Metadata = {
  title: 'Results Framework | World Bank IFRAP Programme',
  description:
    'World Bank IPF Results Framework for the IFRAP programme — PDO and intermediate indicators by component. Draft scaffold pending the official PAD Results Framework / PC-I.',
};

const STATUS_STYLES: Record<IndicatorStatus, string> = {
  ON_TRACK: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  AT_RISK: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  OFF_TRACK: 'text-red-300 bg-red-500/10 border-red-500/30',
  PENDING: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
};

const STATUS_LABEL: Record<IndicatorStatus, string> = {
  ON_TRACK: 'On track',
  AT_RISK: 'At risk',
  OFF_TRACK: 'Off track',
  PENDING: 'Pending',
};

export default function ResultsFrameworkPage() {
  const summary = getResultsFrameworkSummary();

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" aria-hidden="true" />
          Results Framework • IFRAP Programme
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Results Framework &amp; M&amp;E Spine
        </h1>
        <p className="text-sm text-slate-400">{IFRAP_INSTRUMENT}</p>
      </section>

      {/* Draft banner */}
      <div
        role="note"
        className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200"
      >
        <p className="font-semibold">Draft scaffold — indicators pending the official Results Framework.</p>
        <p className="mt-1 text-amber-200/90">
          The PDO, financing instrument, and component list below are the confirmed IFRAP
          (P180323) structure. The indicator rows are <strong>placeholders</strong>; populate each
          with the exact indicator, baseline, target, frequency, and data source from the project&apos;s
          <em> PAD Results Framework annex / PC-I</em>. See <code>docs/results-framework.md</code>.
        </p>
      </div>

      {/* PDO */}
      <section className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Project Development Objective</h2>
        <p className="mt-2 text-base sm:text-lg text-slate-100 leading-relaxed">{IFRAP_PDO}</p>
      </section>

      {/* Summary strip */}
      <section aria-label="Indicator summary" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Indicators', value: summary.total, tone: 'text-cyan-400' },
          { label: 'Pending population', value: summary.pending, tone: 'text-slate-300' },
          { label: 'On track', value: summary.onTrack, tone: 'text-emerald-400' },
          { label: 'At risk', value: summary.atRisk, tone: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-900/50 p-4 text-center">
            <div className={`text-3xl font-extrabold font-mono ${s.tone}`}>{s.value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-slate-400">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Indicator table */}
      <section aria-label="Results Framework indicators" className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="bg-slate-900 text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-3 py-3 font-semibold">Indicator</th>
                <th className="px-3 py-3 font-semibold">Level</th>
                <th className="px-3 py-3 font-semibold">Component</th>
                <th className="px-3 py-3 font-semibold">Unit</th>
                <th className="px-3 py-3 font-semibold">Baseline</th>
                <th className="px-3 py-3 font-semibold">Target</th>
                <th className="px-3 py-3 font-semibold">Actual</th>
                <th className="px-3 py-3 font-semibold">Frequency</th>
                <th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RESULTS_FRAMEWORK.map((r) => (
                <tr key={r.id} className="bg-slate-950/40 hover:bg-slate-900/60 align-top">
                  <td className="px-3 py-3 text-slate-100">
                    {r.name}
                    {r.note ? <span className="block mt-1 text-[11px] text-slate-500">{r.note}</span> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{r.level}</td>
                  <td className="px-3 py-3 text-slate-300">{r.component}</td>
                  <td className="px-3 py-3 text-slate-400 font-mono whitespace-nowrap">{r.unit}</td>
                  <td className="px-3 py-3 text-slate-400 font-mono whitespace-nowrap">{r.baseline}</td>
                  <td className="px-3 py-3 text-slate-100 font-mono whitespace-nowrap">{r.target}</td>
                  <td className="px-3 py-3 text-slate-400 font-mono whitespace-nowrap">{r.actual}</td>
                  <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{r.frequency}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-md border text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-slate-500">
        Reporting cadence: World Bank ISR (semi-annual) and MoPD&amp;SI PC-III. Keep this framework
        in sync with the ESCP tracker and the GRM/field-log evidence base.
      </p>
    </div>
  );
}
