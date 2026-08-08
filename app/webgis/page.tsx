'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GlassCard } from '@/components/GlassCard';

// Lazy-load the MapLibre map: keeps maplibre-gl and the Balochistan map dataset
// (lib/map-data.ts) out of this route's initial bundle and off the server
// render (the map is browser-only). It loads on demand with a placeholder.
const DecolonialMap = dynamic(
  () => import('@/components/DecolonialMap').then((m) => m.DecolonialMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center min-h-[420px] rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 text-sm"
        role="status"
        aria-live="polite"
      >
        Loading interactive map…
      </div>
    ),
  }
);

export default function WebGISPage() {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Participatory WebGIS • Balochistan Karez Hydrology
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Participatory Spatial Hydrology &{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
            WebGIS Map
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
          Interactive spatial mapping overlaying technocratic state irrigation infrastructure grids 
          against traditional & customary knowledge, Mirab water allocation schedules,
          and historical Karez subterranean aqueduct networks.
        </p>
      </section>

      {/* Main Mapbox Container with Glassmorphic Card Overlay */}
      <GlassCard glowColor="cyan" className="p-2 sm:p-4">
        <DecolonialMap initialCenter={[66.975, 30.1798]} zoom={9} />
      </GlassCard>
    </div>
  );
}

