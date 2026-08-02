# Scope: Milestone 2 — Decolonial WebGIS Mapbox Component

## Architecture
Next.js 14 App Router component (`components/DecolonialMap.tsx`) and page (`app/webgis/page.tsx`) integrating Mapbox GL JS with custom geojson/route layers, layer toggle controls, and glassmorphic UI overlay.

## Requirements Checklist
1. `components/DecolonialMap.tsx` ('use client' component).
2. Import `mapbox-gl` (`import mapboxgl from 'mapbox-gl'`).
3. Parse Balochistan archaeological route coordinates (e.g. Karez water systems, Mehrgarh, Nausharo, indigenous hydrology routes).
4. Implement interactive layer toggle between:
   - "Technocratic Standard" (standard vector map styling & state infrastructure annotations)
   - "Decolonial ITK Layer" (Indigenous Technical Knowledge layer — customary Karez water rights, pastoral routes, indigenous place names).
5. Tailwind CSS glassmorphic controls (`backdrop-blur`, translucent panel overlays).
6. WebGIS page at `app/webgis/page.tsx` displaying the Decolonial Map with interactive details sidebar.
7. Verification via build & test pass (`npm run build` and `npm test`).

## Interface Contracts
- `components/DecolonialMap.tsx`
  - Props: optional `initialCenter?: [number, number]`, `zoom?: number`, `onSelectFeature?: (feature: any) => void`
  - Layers: Technocratic vs Decolonial ITK
  - Data source: `lib/map-data.ts` or GeoJSON structures containing Balochistan coordinates (Mehrgarh, Nausharo, Karez water systems, Quetta basin, etc.)
- `app/webgis/page.tsx`
  - Renders DecolonialMap and a glassmorphic sidebar detailing selected location / layer metadata / ITK annotations.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M2 | Decolonial WebGIS Mapbox Component | `components/DecolonialMap.tsx`, `lib/map-data.ts`, `app/webgis/page.tsx`, tests | M1 | IN_PROGRESS |
