'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/GlassCard';

// The programme's delivery chain, expressed as the "one backbone" idea: evidence
// captured in the field flows up through each tier to the decisions and the
// funders. Rendered as an accessible flow on the landing page.
const DELIVERY_CHAIN = [
  { who: 'Field Enumerator', does: 'Captures grievances & field evidence' },
  { who: 'Provincial PIU', does: 'Validates & records tenure' },
  { who: 'FPMU', does: 'Consolidates results & safeguards' },
  { who: 'FPMU Director', does: 'Reviews & signs off' },
  { who: 'World Bank · MoPD', does: 'ISR / PC-III reporting' },
];

// The operational modules, in plain language, each mapped to a real screen.
// Descriptions say what the module DOES for the programme — no implementation
// jargon, no fabricated metrics.
const MODULES = [
  {
    href: '/webgis',
    glow: 'cyan' as const,
    title: 'Participatory WebGIS',
    body: "Map Balochistan's Karez water systems with customary-tenure overlays, so land-and-water risks are visible before works begin (ESS5).",
    tags: ['Spatial map', 'Customary tenure'],
    cta: 'Open the map',
  },
  {
    href: '/grm',
    glow: 'emerald' as const,
    title: 'Grievance Redress (GRM)',
    body: 'Log, triage and SLA-track community complaints from first report to resolution — personal data scrubbed, every action audited (ESS10).',
    tags: ['ESS10', 'SLA-tracked'],
    cta: 'Open GRM',
  },
  {
    href: '/field-log',
    glow: 'amber' as const,
    title: 'Field Log',
    body: 'Offline-first capture for field teams working where connectivity is poor. Personal identifiers are redacted before anything is stored.',
    tags: ['Offline-first', 'PII-protected'],
    cta: 'Open field log',
  },
  {
    href: '/me-results',
    glow: 'emerald' as const,
    title: 'Monitoring & Results',
    body: "Track who the programme is actually reaching, using a multidimensional poverty lens aligned to Pakistan's national MPI.",
    tags: ['M&E', 'National MPI'],
    cta: 'View results',
  },
  {
    href: '/results-framework',
    glow: 'violet' as const,
    title: 'Results Framework',
    body: 'The programme PDO and component indicators in one ISR-shaped cockpit — a draft scaffold ready to be populated from the official PAD Results Framework.',
    tags: ['WB IPF RF', 'Draft'],
    cta: 'View framework',
  },
  {
    href: '/fiduciary',
    glow: 'violet' as const,
    title: 'Customary-tenure ledger',
    body: 'Issue use-right (usufruct) certificates for customary land and water, each sealed with a cryptographic fingerprint. Elevated roles only.',
    tags: ['Tamper-evident', 'Elevated only'],
    cta: 'Open ledger',
  },
];

const STATS = [
  { color: 'text-cyan-400', value: '6', label: 'IFRAP components', sub: 'Delivery tracked end to end' },
  { color: 'text-emerald-400', value: 'Field→Dir', label: 'Connected user tiers', sub: 'Least-privilege access' },
  { color: 'text-violet-400', value: 'ESS 1–10', label: 'ESF safeguards', sub: 'Compliance-tracked' },
  { color: 'text-amber-400', value: 'Audit', label: 'Tamper-evident log', sub: 'Hash-chained access trail' },
];

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">

      {/* Hero */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" aria-hidden="true" />
          MIRAB · IFRAP Operations &amp; Results Backbone
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight drop-shadow-2xl">
          One connected backbone,{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-violet-400 bg-clip-text text-transparent animate-gradient-x">
            field to funder
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
          MIRAB links every actor in IFRAP delivery — field enumerators, the Provincial PIU, the FPMU
          and its Director, and the World Bank and Ministry of Planning — on one secure platform. Evidence
          from communities in Balochistan flows straight into results reporting and safeguards decisions,
          so the programme reaches people faster and more accountably.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/telemetry"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Open the dashboard
          </Link>
          <Link
            href="/webgis"
            className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-bold border border-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-md hover:-translate-y-1 active:scale-95 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            Explore the map
          </Link>
        </div>
      </section>

      {/* Structural facts (no fabricated performance metrics) */}
      <section aria-label="Platform at a glance" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <GlassCard key={s.label} glowColor={['cyan', 'emerald', 'violet', 'amber'][i] as any} animate delay={0.1 * (i + 1)} hoverEffect={false}>
            <div className="text-center space-y-1">
              <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${s.color}`}>{s.value}</span>
              <p className="text-xs sm:text-sm font-medium text-slate-300">{s.label}</p>
              <p className="text-[11px] text-slate-400">{s.sub}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* The "one backbone" idea, made concrete: the delivery chain */}
      <section aria-label="How MIRAB connects the programme">
        <GlassCard glowColor="none" className="bg-slate-900/40">
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">How MIRAB connects the programme</h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                One record, one identity, one audit trail beneath every role. Each tier sees what it needs —
                and the evidence moves up the chain without being re-keyed or lost.
              </p>
            </div>
            <ol className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-1" aria-label="IFRAP delivery chain">
              {DELIVERY_CHAIN.map((step, i) => (
                <li key={step.who} className="flex items-center gap-2 sm:gap-1">
                  <div className="min-w-[140px] max-w-[180px] p-3 rounded-xl bg-slate-950/70 border border-white/10 text-center">
                    <p className="text-xs font-bold text-slate-100">{step.who}</p>
                    <p className="mt-1 text-[11px] text-slate-400 leading-snug">{step.does}</p>
                  </div>
                  {i < DELIVERY_CHAIN.length - 1 && (
                    <span className="text-emerald-400 font-bold text-lg select-none" aria-hidden="true">→</span>
                  )}
                </li>
              ))}
            </ol>
            <p className="text-center text-xs text-slate-500">
              MIRAB also carries traditional and customary knowledge — Karez water rights, tribal commons — alongside
              the quantitative indicators, so local realities inform programme decisions.
            </p>
          </div>
        </GlassCard>
      </section>

      {/* Operational modules — mapped to real screens, plain language */}
      <section aria-label="Operational modules" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">The operational modules</h2>
          <p className="text-sm text-slate-400">
            Each screen serves a role in IFRAP delivery — from field capture to Director sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((m, i) => (
            <Link
              key={m.href}
              href={m.href}
              aria-label={m.title}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl"
            >
              <GlassCard glowColor={m.glow} animate delay={0.08 * (i + 1)} className="h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{m.body}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-2">
                    {m.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform whitespace-nowrap">
                    {m.cta} &rarr;
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Honest context note (replaces the academic "methodological note") */}
      <section aria-label="About this platform">
        <GlassCard glowColor="none" className="bg-slate-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-200">
                Built for the programme — demonstrated on synthetic data
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                MIRAB brings IFRAP&apos;s delivery evidence into one place: grievances, field observations,
                tenure records and spatial data roll up into World Bank Results-Framework / ISR reporting, ESF
                safeguards, and the Ministry of Planning&apos;s PC-III M&amp;E. This demonstration runs entirely
                on synthetic data with role-based demo accounts; no real beneficiary data is used until the World
                Bank approves a pilot and a formal data-access authorisation is in place.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Programme:</span>
                  <span className="text-violet-400">IFRAP (P180323)</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Region:</span>
                  <span className="text-cyan-400">Balochistan, PK</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Data:</span>
                  <span className="text-emerald-400">Synthetic (demo)</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

    </div>
  );
}
