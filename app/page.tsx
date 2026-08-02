'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/GlassCard';
import { useI18n } from '@/lib/i18n-context';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* Hero Header Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" aria-hidden="true" />
          Applied Anthropology Portfolio & Research Telemetry
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-tight drop-shadow-2xl">
          Decolonial WebGIS &{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-violet-400 bg-clip-text text-transparent animate-gradient-x">
            M&E Telemetry
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
          Bridging customary water governance in Balochistan with quantitative monitoring. 
          Integrating Indigenous Technical Knowledge (ITK) Karez spatial layers, Senian Multidimensional 
          Poverty Index capability metrics (MPI = H × A), and Usufruct fiduciary land rights protection.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/webgis"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t.nav.webgis}
          </Link>
          <Link
            href="/telemetry"
            className="px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-bold border border-white/10 hover:border-white/30 transition-all duration-300 backdrop-blur-md hover:-translate-y-1 active:scale-95 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t.nav.telemetry}
          </Link>
        </div>
      </section>

      {/* Quantitative Project Overview Stats Strip */}
      <section aria-label="Project Key Stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard glowColor="cyan" animate delay={0.1} hoverEffect={false}>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">14</span>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Karez Systems Mapped</p>
            <p className="text-[11px] text-slate-400">Balochistan ITK Routes</p>
          </div>
        </GlassCard>

        <GlassCard glowColor="emerald" animate delay={0.2} hoverEffect={false}>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">H × A</span>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Senian MPI Engine</p>
            <p className="text-[11px] text-slate-400">Capability Deprivation</p>
          </div>
        </GlassCard>

        <GlassCard glowColor="violet" animate delay={0.3} hoverEffect={false}>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-violet-400 font-mono">100%</span>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Usufruct Compliance</p>
            <p className="text-[11px] text-slate-400">Customary Rights Ledger</p>
          </div>
        </GlassCard>

        <GlassCard glowColor="amber" animate delay={0.4} hoverEffect={false}>
          <div className="text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">IFRAP C3</span>
            <p className="text-xs sm:text-sm font-medium text-slate-300">Water Infrastructure</p>
            <p className="text-[11px] text-slate-400">M&E Component Tracked</p>
          </div>
        </GlassCard>
      </section>

      {/* Feature Navigation Cards Grid */}
      <section aria-label="Applied Anthropology Modules" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Core Applied Anthropology Modules
          </h2>
          <p className="text-sm text-slate-400">
            Select a module below to explore spatial, capability, or fiduciary governance systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Module Card 1: WebGIS */}
          <Link href="/webgis" aria-label={t.nav.webgis} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl">
            <GlassCard glowColor="cyan" animate delay={0.1} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 012-2h1.065M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {t.nav.webgis}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Interactive MapLibre GL JS interface visualizing customary Karez water channels in Balochistan. 
                    Toggle dynamically between technocratic state infrastructure layers and indigenous ITK spatial boundaries.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">MapLibre GL JS</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">ITK Layers</span>
                </div>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Map &rarr;
                </span>
              </div>
            </GlassCard>
          </Link>

          {/* Module Card 2: Telemetry & MPI Engine */}
          <Link href="/telemetry" aria-label={t.nav.telemetry} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl">
            <GlassCard glowColor="emerald" animate delay={0.2} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {t.nav.telemetry}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Quantitative Monitoring & Evaluation dashboard calculating Amartya Sen&apos;s Multidimensional 
                    Poverty Index (MPI = H × A). Tracks capability deprivation across IFRAP Component 3 water projects.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">MPI H×A</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">IFRAP C3</span>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Metrics &rarr;
                </span>
              </div>
            </GlassCard>
          </Link>

          {/* Module Card 3: Fiduciary Shield Ledger */}
          <Link href="/fiduciary" aria-label={t.nav.fiduciary} className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl">
            <GlassCard glowColor="violet" animate delay={0.3} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                    {t.nav.fiduciary}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Cryptographic customary land tenure protection system. Issues Usufruct Rights Certificates 
                    and logs compliance validation streams powered by simulated Firebase real-time ledger.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 font-mono">Firebase SDK</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Usufruct Rights</span>
                </div>
                <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Access Ledger &rarr;
                </span>
              </div>
            </GlassCard>
          </Link>

        </div>
      </section>

      {/* Applied Anthropology Context Summary */}
      <section aria-label="Methodological Context">
        <GlassCard glowColor="none" className="bg-slate-900/40">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-200">
                Methodological Note: Applied Anthropology & Decolonial M&E
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Traditional technocratic monitoring frequently erases customary rights and indigenous infrastructure 
                by imposing top-down indicators. This portfolio demonstrates how applied anthropology integrates 
                spatial WebGIS mapping with Senian capability metrics to safeguard water usufruct rights in arid environments.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Target Region:</span>
                  <span className="text-cyan-400">Balochistan, PK</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Framework:</span>
                  <span className="text-emerald-400">Sen (1999) MPI</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Project Unit:</span>
                  <span className="text-violet-400">IFRAP Component 3</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

    </div>
  );
}
