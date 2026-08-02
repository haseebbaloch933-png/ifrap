# Decolonial WebGIS Mapbox Component: Architectural Analysis & Data Design

## 1. Executive Summary

This report establishes the implementation architecture and spatial dataset design for **Milestone 2 (Decolonial WebGIS Mapbox Component)** in the Next.js App Router applied anthropology portfolio project (`anthropology_portfolio`).

The investigation covers two primary technical domains:
1. **Mapbox GL JS Setup & Next.js App Router SSR/Client Rendering Strategy**: Managing DOM reference lifecycle (`useRef`), client-only initialization (`useEffect`), dynamic import code-splitting (`next/dynamic` with `ssr: false`), CSS asset injection, and Mapbox instance cleanup.
2. **Balochistan Archaeological & Indigenous Hydrology GeoJSON Schema (`lib/map-data.ts`)**: Designing strongly-typed spatial GeoJSON structures capturing Karez underground aqueduct channels, archaeological settlement nodes (Mehrgarh, Nausharo, Rana Ghundai), transhumance/pastoral migration routes, and technocratic state infrastructure annotations.

---

## 2. Codebase Architecture & Current System State

### 2.1 File & Layout Inspection
- **`PROJECT.md`**: Defines Milestone 2 scope: `components/DecolonialMap.tsx` with Mapbox GL JS, Balochistan route coordinates, layer toggle logic between "Technocratic Standard" and "Decolonial ITK Layer".
- **`package.json`**:
  - `mapbox-gl`: `^3.7.0`
  - `@types/mapbox-gl`: `^3.4.0`
  - `next`: `^14.2.15`
  - `react`: `^18.3.1`
  - `framer-motion`: `^11.11.9`
  - `tailwindcss`: `^3.4.1`
- **`tailwind.config.js`**: Glassmorphic color palette (`glass.base`, `glass.emerald`, `glass.teal`, `glass.border`), backdrop blur utilities (`backdrop-blur-md`, `backdrop-blur-xl`), custom glowing box-shadows (`glow-emerald`, `glow-teal`, `glow-amber`).
- **`next.config.js`**: Exposes `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` environment variable with fallback token handling.
- **`app/layout.tsx`**: Provides dark-mode glassmorphic shell with responsive top navigation (`/webgis`, `/telemetry`, `/fiduciary`) and background radial ambient blur layers.

---

## 3. Mapbox GL JS Setup & Next.js App Router SSR/Client Strategy

### 3.1 Client-Side Execution Requirement (`'use client'`)
Mapbox GL JS (`mapbox-gl`) directly accesses browser-only APIs (`window`, `document`, `HTMLCanvasElement`, `WebGLRenderingContext`, `Worker`). In Next.js App Router, components are React Server Components (RSC) by default.
- **Directive**: `components/DecolonialMap.tsx` MUST start with `'use client'`.
- **SSR Safety**: Any attempt to execute `new mapboxgl.Map(...)` on the Node.js server during pre-rendering or build time throws `ReferenceError: window is not defined` or WebGL context failures.

### 3.2 DOM Lifecycle & React Hooks Pattern
The standard React component pattern for Mapbox GL JS involves:
```tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Token configuration
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94LWZhbGxiYWNrIiwicSI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6In0.placeholder';

export interface DecolonialMapProps {
  initialCenter?: [number, number]; // [lng, lat]
  zoom?: number;
  onSelectFeature?: (feature: any) => void;
}

export const DecolonialMap: React.FC<DecolonialMapProps> = ({
  initialCenter = [67.0, 29.5], // Balochistan default center
  zoom = 7.5,
  onSelectFeature,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [activeLayer, setActiveLayer] = useState<'technocratic' | 'itk'>('itk');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Instantiate map instance strictly on client mount
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: zoom,
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsLoaded(true);
      // Load sources & layers here...
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter, zoom]);

  // Layer toggle effect
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;
    const map = mapRef.current;
    
    const visibility = activeLayer === 'itk' ? 'visible' : 'none';
    if (map.getLayer('itk-karez-lines')) {
      map.setLayoutProperty('itk-karez-lines', 'visibility', visibility);
    }
    // Toggle technocratic vs ITK layers...
  }, [activeLayer, isLoaded]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Glassmorphic Layer Control Panel Overlay */}
    </div>
  );
};
```

### 3.3 Dynamic Import Strategy for App Router Pages
When importing `DecolonialMap` inside `app/webgis/page.tsx`, dynamic importing prevents Next.js from rendering Mapbox on the server side:
```tsx
import dynamic from 'next/dynamic';

const DecolonialMap = dynamic(
  () => import('@/components/DecolonialMap').then((mod) => mod.DecolonialMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-400 font-mono text-sm">
        <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping mr-3" />
        Initializing Decolonial Spatial Layers...
      </div>
    ),
  }
);
```

### 3.4 CSS Loading & Asset Resolution
Mapbox GL JS requires stylesheet assets (`mapbox-gl/dist/mapbox-gl.css`) for marker positioning, popup containers, and control buttons.
- Importing `import 'mapbox-gl/dist/mapbox-gl.css'` inside `DecolonialMap.tsx` or in `app/globals.css` ensures complete styling without layout shift or misaligned map controls.

---

## 4. GeoJSON Data Architecture (`lib/map-data.ts`)

### 4.1 Coordinate Conventions & Spatial Reference System
- **CRS**: WGS 84 (EPSG:4326), standard GeoJSON coordinate tuple format: `[longitude, latitude]`.
- **Region**: Balochistan Province, Pakistan (Focus on Quetta, Pishin, Mastung, Bolan Pass, Kachi Plain, Zhob Valley).

### 4.2 GeoJSON Feature Categories & Schema

#### 1. Karez Water Systems (Customary Hydrology & Aqueducts)
- **Geometry**: `LineString` (Aqueduct alignment) & `Point` (Mother wells / *Sari Karez*, Daylighting points / *Mora*).
- **Attributes**:
  - `id`: Unique identifier (e.g., `'karez-pishin-01'`, `'karez-mastung-01'`)
  - `name`: Indigenous name (*Karez Mastung Main Aqueduct*, *Karez Pishin Customary Channel*)
  - `basin`: Watershed basin (`Quetta`, `Pishin`, `Mastung`)
  - `flowRate`: Hydraulic output (e.g., `1.2 cusec`, `0.85 cusec`)
  - `depthMeters`: Underground shaft depth (`15-30m`)
  - `waterRightsType`: Customary ancestral water shares (*shabana*, *tapa*, *tasu* rotation rights)
  - `layerType`: `'itk'`
  - `status`: `'Functional (Customary)'` vs `'Threatened by Tubewell Depletion'`

#### 2. Archaeological Settlement Nodes
- **Geometry**: `Point`
- **Coordinates & Attributes**:
  - **Mehrgarh**: `[67.6167, 29.2127]` (Neolithic/Chalcolithic site, early zebu domestication & customary floodwater farming, 7000 BCE - 2000 BCE)
  - **Nausharo**: `[67.8800, 29.3500]` (Harappan Period settlement, ceramic & copper metallurgy, 2800 BCE - 1900 BCE)
  - **Rana Ghundai**: `[68.3200, 30.3000]` (Loralai/Zhob pastoral horizon node, early ceramic stratigraphy, 4500 BCE - 2000 BCE)
  - **Pirak**: `[67.8900, 29.2800]` (Post-Harappan technological transition, early iron & horse domestication, 1800 BCE - 800 BCE)
- **Attributes**:
  - `siteName`, `chronology`, `hydrologicalTech` (e.g. *Customary Bunding & Sheet-Flow Diversion*), `culturalSignificance`, `layerType`: `'itk'` / `'archaeological'`

#### 3. Transhumance / Pastoral Migration Routes
- **Geometry**: `LineString`
- **Routes**:
  - **Bolan Pass Transhumance Route**: `[[66.97, 30.17], [67.12, 29.85], [67.60, 29.50], [67.88, 29.35]]` (Highland Kalat/Quetta to Lowland Kachi Plain seasonal migration)
  - **Zhob-Pishin Pastoral Corridor**: `[[68.32, 30.30], [67.50, 30.50], [67.00, 30.58]]` (Northern Sulaiman foothill grazing migration)
- **Attributes**:
  - `routeName`, `season` (*Autumn/Spring*), `groups` (*Brahui*, *Baloch*, *Pashtun Powindah*), `grazingCommons` (*Pahar / Traditional Pasture Rights*), `layerType`: `'itk'`

#### 4. State Infrastructure Annotations (Technocratic Layer)
- **Geometry**: `Point` & `Polygon` / `LineString`
- **Nodes**:
  - **Mirani Dam Hydraulic Diversion**: `[62.33, 26.01]` (State megaproject altering Dasht River flow)
  - **Sabakzai Dam Irrigation Diversion**: `[68.85, 30.82]` (Technocratic dam on Sawar Stream)
  - **Quetta Basin Deep Tubewell Electrification Grid**: `[66.97, 30.18]` (State-subsidized tube wells causing 3m/year groundwater decline)
  - **District Technocratic Administrative Border**: Administrative boundary lines severing tribal customary watersheds.
- **Attributes**:
  - `name`, `impactType` (*Aquifer Depletion*, *Disruption of Usufruct Rights*, *Top-Down Engineering Failure*), `layerType`: `'technocratic'`

---

## 5. Layer Toggle Architecture: Technocratic Standard vs Decolonial ITK Layer

| Feature Aspect | Technocratic Standard Layer | Decolonial ITK Layer |
|---|---|---|
| **Base Map Style** | Mapbox Light / Standard Vector (`mapbox://styles/mapbox/light-v11`) | Mapbox Dark / Satellite Glass (`mapbox://styles/mapbox/dark-v11`) |
| **Primary Visual Accent** | Slate / Gray administrative vectors & red state infrastructure markers | Cyan (`#2dd4bf`), Emerald (`#10b981`), and Amber (`#f59e0b`) glowing vectors |
| **Data Focus** | State dams, canal diversions, deep tube-well grids, administrative district lines | Karez underground aqueducts, mother wells (*sari karez*), pastoral migration corridors, customary water rights |
| **Place Names** | Official post-colonial administrative district names | Indigenous Brahui/Baloch/Pashtun place names & customary watershed designations |
| **Hydrological Model** | Top-down volumetric reservoir storage | Customary water-sharing rotation (*shabana*, *tapa*, *tasu*) & gravity-fed aquifer preservation |

---

## 6. Implementation Specifications for Next Phases

1. **`lib/map-data.ts`**:
   - Export strongly-typed GeoJSON feature collections: `karezGeoJson`, `archaeologicalSitesGeoJson`, `transhumanceRoutesGeoJson`, `stateInfrastructureGeoJson`, `balochistanCombinedGeoJson`.
   - Export helper functions: `getFeaturesByLayer(layer: 'itk' | 'technocratic')`, default coordinates `BALOCHISTAN_CENTER: [number, number] = [67.0, 29.5]`, `DEFAULT_ZOOM = 7.5`.
2. **`components/DecolonialMap.tsx`**:
   - `'use client'` component.
   - Interactive glassmorphic overlay for switching between "Technocratic Standard" and "Decolonial ITK Layer".
   - Popup info card on feature click returning metadata to parent page via `onSelectFeature` callback.
3. **`app/webgis/page.tsx`**:
   - WebGIS page rendering `DecolonialMap` dynamically (`ssr: false`) alongside a glassmorphic sidebar detailing selected location metadata, ITK customary rights, and Senian capability index impact.

---

## 7. Verification Method

- Verify module structure using TypeScript type checker (`npx tsc --noEmit`).
- Verify E2E integration test suite (`npm test` / `node tests/run-tests.js`).
- Verify WebGIS component rendering and map initialization tests in Tier 1 and Tier 2 (`tests/e2e/tier1_ui_arch.test.js` & `tests/e2e/tier2_webgis.test.js`).
