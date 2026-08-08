'use client';

import dynamic from 'next/dynamic';

/**
 * Client wrapper that lazy-loads the GIS Impact Mapper. The page that renders
 * it (app/gis-impact/page.tsx) is a Server Component, where `next/dynamic`
 * with `ssr: false` is not allowed — so the browser-only MapLibre component is
 * deferred here instead, keeping maplibre-gl out of the route's initial bundle.
 */
const GisImpactMapper = dynamic(
  () => import('./GisImpactMapper').then((m) => m.GisImpactMapper),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center min-h-[480px] rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 text-sm"
        role="status"
        aria-live="polite"
      >
        Loading impact map…
      </div>
    ),
  }
);

export function GisImpactMapperLazy() {
  return <GisImpactMapper />;
}
