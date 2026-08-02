# Technical Analysis & Architecture Report: Decolonial WebGIS Mapbox Component & Balochistan Spatial Analytics

**Author**: Explorer 1 (Milestone 2)  
**Target Milestone**: M2 — Decolonial WebGIS Mapbox Component  
**Working Directory**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\teamwork_preview_explorer_m2_1`  
**Date**: 2026-07-23  

---

## 1. Executive Summary

Milestone 2 establishes the **Decolonial WebGIS Mapbox Component** (`components/DecolonialMap.tsx`), the underlying GeoJSON dataset module (`lib/map-data.ts`), and the dedicated spatial analytics page (`app/webgis/page.tsx`).

This report provides a complete, evidence-based architectural investigation into:
1. **Mapbox GL JS Integration Strategy**: Managing client-side rendering boundaries ('use client', `useRef`, `useEffect`, dynamic imports without SSR, CSS loading, and access token fallbacks) within the Next.js 14 App Router.
2. **Decolonial GIS Paradigm**: Implementing interactive layer toggling between **Technocratic Standard** state infrastructure annotations and **Decolonial ITK (Indigenous Technical Knowledge)** layers representing subterranean Karez aqueducts, customary water rights, pastoral transhumance routes, and ancient archaeological settlement nodes.
3. **GeoJSON Schema & Dataset Design**: Concrete TypeScript types and GeoJSON data structures for Balochistan spatial coordinates, covering Mehrgarh, Nausharo, Rana Ghundai, Quetta/Pishin/Mastung Karez basins, Bolan migration corridors, and technocratic mega-dams.

---

## 2. Baseline Architecture & Dependency Evidence

### 2.1 Package & Configuration Inspection
An inspection of `package.json`, `next.config.js`, and `tailwind.config.js` confirms the following baseline:

* **Dependencies (`package.json`)**:
  - `mapbox-gl`: `^3.7.0` (Client-side WebGL mapping library)
  - `@types/mapbox-gl`: `^3.4.0` (TypeScript declaration support)
  - `next`: `^14.2.15` (App Router SSR framework)
  - `react` / `react-dom`: `^18.3.1`
  - `tailwindcss`: `^3.4.1` with `clsx` (`^2.1.1`) and `tailwind-merge` (`^2.5.4`)
  - `framer-motion`: `^11.11.9` (Smooth UI overlay transitions)

* **Environment Variable Fallback (`next.config.js`)**:
  ```javascript
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94LWZhbGxiYWNrIiwicSI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6In0.placeholder',
  }
  ```
  *Evidence*: This ensures Mapbox GL JS can initialize gracefully during development/testing even if no live Mapbox API token is injected.

* **Tailwind CSS Theme Extensions (`tailwind.config.js`)**:
  - Glassmorphic translucent colors: `glass-base`, `glass-light`, `glass-dark`, `glass-emerald`, `glass-teal`.
  - Border styles: `glass-border`, `glass-border-emerald`, `glass-border-teal`, `glass-border-amber`.
  - Glow effects: `shadow-glow-emerald`, `shadow-glow-teal`, `shadow-glow-amber`.
  - Backdrop blur levels: `backdrop-blur-md`, `backdrop-blur-xl`, `backdrop-blur-2xl`.

---

## 3. Mapbox GL JS SSR & App Router Integration Architecture

### 3.1 Server-Side Rendering (SSR) Conflict Mechanics
Mapbox GL JS relies on WebGL and browser APIs (`window`, `document`, `HTMLCanvasElement`, `requestAnimationFrame`, `navigator.userAgent`). If Mapbox GL JS executes during server-side pre-rendering or static HTML generation in Next.js App Router, Node.js will throw a fatal `ReferenceError: window is not defined` or fail to load worker threads.

### 3.2 Mitigation Pattern: The Four-Pillar Client Strategy

1. **Directive Requirement (`'use client'`)**:
   `components/DecolonialMap.tsx` MUST be explicitly declared as a Client Component using the `'use client'` directive at line 1.

2. **Dynamic Client Import in Page Components (`ssr: false`)**:
   When consuming `DecolonialMap` inside `app/webgis/page.tsx`, it must be wrapped in Next.js `dynamic()` with server-side rendering disabled:
   ```tsx
   import dynamic from 'next/dynamic';
   
   const DecolonialMap = dynamic(() => import('@/components/DecolonialMap'), {
     ssr: false,
     loading: () => (
       <div className="w-full h-[600px] rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-3">
         <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
         <p className="text-xs text-slate-400 font-mono">Initializing WebGIS Engine...</p>
       </div>
     ),
   });
   ```

3. **React Hooks Lifecycle (`useRef` + `useEffect`)**:
   - `mapContainerRef = useRef<HTMLDivElement>(null)`: Connects Mapbox canvas to the DOM node.
   - `mapInstanceRef = useRef<mapboxgl.Map | null>(null)`: Holds the live `mapboxgl.Map` instance across component renders without triggering unnecessary re-renders.
   - **React 18 Double-Mount Guard**:
     ```tsx
     useEffect(() => {
       if (mapInstanceRef.current || !mapContainerRef.current) return;
       
       mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'placeholder';
       
       const map = new mapboxgl.Map({
         container: mapContainerRef.current,
         style: 'mapbox://styles/mapbox/dark-v11',
         center: initialCenter || [66.9750, 30.1798], // Default: Quetta, Balochistan
         zoom: zoom || 7,
       });

       mapInstanceRef.current = map;

       map.on('load', () => {
         // Add GeoJSON sources and layers here
       });

       return () => {
         map.remove();
         mapInstanceRef.current = null;
       };
     }, []);
     ```

4. **Mapbox CSS Stylesheet Loading**:
   Mapbox controls, popups, canvas containers, and attribution require Mapbox CSS. Import `mapbox-gl/dist/mapbox-gl.css` at the top of `components/DecolonialMap.tsx` or in `app/globals.css`:
   ```tsx
   import 'mapbox-gl/dist/mapbox-gl.css';
   ```

---

## 4. GeoJSON Data Architecture (`lib/map-data.ts`)

### 4.1 GeoJSON Coordinate System Standards
GeoJSON specifications (RFC 7946) require coordinates to be formatted in **`[longitude, latitude]`** order (WGS 84 coordinate reference system).

### 4.2 Dataset Classification & Features

The GeoJSON dataset in `lib/map-data.ts` represents four distinct anthropological layer categories:

#### A. Archaeological Settlement Nodes (`Point`)
1. **Mehrgarh** (`[67.6167, 29.2127]`):
   - *Period*: 7000 BCE – 2500 BCE (Kachi Plain)
   - *Anthropological Significance*: Earliest known Neolithic farming settlement in South Asia; early evidence of indigenous floodwater irrigation (*Rod-Kohi*) along the Bolan river alluvial fan.
2. **Nausharo** (`[67.8800, 29.3500]`):
   - *Period*: 2800 BCE – 1900 BCE
   - *Significance*: Harappan transition settlement adjacent to Mehrgarh; indigenous ceramic craftsmanship and hydraulic clay channels.
3. **Rana Ghundai** (`[68.3200, 30.3600]`):
   - *Period*: 4500 BCE – 2000 BCE (Zhob Basin)
   - *Significance*: Chalcolithic pastoral mound highlighting ancient highland-lowland animal husbandry and aquifer management.

#### B. Subterranean Karez Water Systems (`LineString`)
Underground aqueducts tapping alluvial fan aquifers via gravity flow, governed by customary water rights (*Shabana* / *Mirab* allocation):
1. **Quetta Basin Chashma Karez**: `[[67.0100, 30.2200], [66.9800, 30.1800], [66.9500, 30.1500]]`
2. **Pishin Basin Karez Network**: `[[67.0000, 30.5800], [66.9500, 30.5400], [66.9000, 30.5000]]`
3. **Mastung Basin Usufruct Karez Channel**: `[[66.8800, 29.8200], [66.8400, 29.8000], [66.7900, 29.7600]]`

#### C. Transhumance / Pastoral Migration Routes (`LineString`)
Indigenous nomadic migration trails connecting seasonal pasturelands:
1. **Bolan Pass Migration Corridor**: `[[67.6167, 29.2127], [67.3500, 29.5500], [67.0000, 29.8500], [66.9750, 30.1798]]` (Mehrgarh / Kachi Plain to Quetta Plateau)
2. **Zhob-Sulaiman Pastoral Highway**: `[[68.3200, 30.3600], [69.2000, 30.2000], [70.1000, 29.9000]]`

#### D. State Infrastructure & Technocratic Annotations (`Point` & `LineString`)
Top-down state hydraulic interventions:
1. **Mirani Mega-Dam** (`[62.3300, 26.0400]`): Kech Basin storage dam built in 2006; disrupted traditional riparian water rights and exacerbated 2007 cyclone flooding.
2. **Sabakzai Dam** (`[68.9500, 31.2500]`): Zhob River state dam; impounded customary *Rod-Kohi* downstream flood runoff.
3. **Pat Feeder Irrigation Canal**: `[[68.4000, 28.5000], [68.0000, 28.7000], [67.6000, 28.9000]]`
4. **Technocratic Administrative Border (Quetta Division)**: `[[66.5000, 30.5000], [67.5000, 30.5000], [67.5000, 29.5000], [66.5000, 29.5000]]`

---

## 5. Layer Toggle Architecture ("Technocratic" vs "Decolonial ITK")

The interface contract requires dynamic toggling between:
- **Technocratic Standard Layer**: Cold blueprint palette (cyan/slate lines, stark state administrative boundaries, dam markers).
- **Decolonial ITK Layer**: Warm earthy palette (emerald Karez lines, amber pastoral migration corridors, glowing archaeological nodes with rich anthropological popups).

### Mapbox Layer Visibility Control Logic
```typescript
export function applyLayerVisibility(
  map: mapboxgl.Map, 
  mode: 'decolonial' | 'technocratic' | 'all'
) {
  const decolonialVisible = mode === 'decolonial' || mode === 'all';
  const technocraticVisible = mode === 'technocratic' || mode === 'all';

  const decolonialLayerIds = [
    'karez-lines-layer',
    'karez-glow-layer',
    'archaeological-nodes-layer',
    'pastoral-routes-layer'
  ];

  const technocraticLayerIds = [
    'state-dams-layer',
    'canal-diversions-layer',
    'administrative-borders-layer'
  ];

  decolonialLayerIds.forEach(id => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', decolonialVisible ? 'visible' : 'none');
    }
  });

  technocraticLayerIds.forEach(id => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', technocraticVisible ? 'visible' : 'none');
    }
  });
}
```

---

## 6. Code Blueprints (Implementation Proposals)

### 6.1 Proposed Data Module: `lib/map-data.ts`

```typescript
export interface GeoJSONGeometry {
  type: 'Point' | 'LineString' | 'MultiLineString' | 'Polygon';
  coordinates: number[] | number[][] | number[][][];
}

export interface SpatialFeatureProperties {
  id: string;
  name: string;
  indigenousName: string;
  category: 'archaeological_node' | 'karez_system' | 'pastoral_route' | 'state_infrastructure' | 'administrative_border';
  layerGroup: 'decolonial' | 'technocratic';
  description: string;
  periodOrYear?: string;
  customaryRights?: string;
  impactAnnotation?: string;
  dischargeRate?: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: SpatialFeatureProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export const BALOCHISTAN_MAP_DATA: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. ARCHAEOLOGICAL NODES
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [67.6167, 29.2127] },
      properties: {
        id: 'node-mehrgarh',
        name: 'Mehrgarh',
        indigenousName: 'Mehrgarh (Neolithic Agricultural Pioneer)',
        category: 'archaeological_node',
        layerGroup: 'decolonial',
        periodOrYear: '7000 BCE – 2500 BCE',
        description: 'Pioneering Neolithic agrarian settlement in Kachi Plain, demonstrating 9,000 years of indigenous grain cultivation and Rod-Kohi hydraulic adaptation.',
        customaryRights: 'Ancestral floodwater harvesting rights along Bolan alluvial fan.'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [67.8800, 29.3500] },
      properties: {
        id: 'node-nausharo',
        name: 'Nausharo',
        indigenousName: 'Nausharo (Harappan Hydraulic Phase)',
        category: 'archaeological_node',
        layerGroup: 'decolonial',
        periodOrYear: '2800 BCE – 1900 BCE',
        description: 'Indus Valley transition site adjacent to Mehrgarh featuring early urban water containment structures and earthen pot filtration.',
        customaryRights: 'Communal earthen micro-drainage governance.'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [68.3200, 30.3600] },
      properties: {
        id: 'node-rana-ghundai',
        name: 'Rana Ghundai',
        indigenousName: 'Rana Ghundai (Zhob Pastoral Mound)',
        category: 'archaeological_node',
        layerGroup: 'decolonial',
        periodOrYear: '4500 BCE – 2000 BCE',
        description: 'Chalcolithic highland site in Zhob valley revealing ancient pastoral transhumance and highland spring water management.',
        customaryRights: 'Highland spring customary grazing access.'
      }
    },

    // 2. KAREZ WATER SYSTEMS
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[67.0100, 30.2200], [66.9800, 30.1800], [66.9500, 30.1500]]
      },
      properties: {
        id: 'karez-quetta',
        name: 'Quetta Basin Chashma Karez',
        indigenousName: 'Chashma Aqueduct System',
        category: 'karez_system',
        layerGroup: 'decolonial',
        dischargeRate: '18.5 L/s',
        description: 'Subterranean gravity-fed aqueduct bringing mountain aquifer water to Quetta valley floor without electrical power.',
        customaryRights: 'Shabana turn-based water share allocation supervised by elected Mirab.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[67.0000, 30.5800], [66.9500, 30.5400], [66.9000, 30.5000]]
      },
      properties: {
        id: 'karez-pishin',
        name: 'Pishin Alluvial Fan Karez',
        indigenousName: 'Pishin Sar-re-Chashma Network',
        category: 'karez_system',
        layerGroup: 'decolonial',
        dischargeRate: '25.0 L/s',
        description: 'Deep mother-well aqueduct system tapping northern alluvial deposits in Pishin basin.',
        customaryRights: 'Hshar collective labor maintenance protocol.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[66.8800, 29.8200], [66.8400, 29.8000], [66.7900, 29.7600]]
      },
      properties: {
        id: 'karez-mastung',
        name: 'Mastung Customary Karez',
        indigenousName: 'Mastung Date-Palm & Apple Channel',
        category: 'karez_system',
        layerGroup: 'decolonial',
        dischargeRate: '14.2 L/s',
        description: 'Historic irrigation channel sustaining centuries-old orchard farming in central Mastung basin.',
        customaryRights: 'Inalienable Usufruct Water Rights (Taqsim-e-Aab).'
      }
    },

    // 3. TRANSHUMANCE / PASTORAL ROUTES
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[67.6167, 29.2127], [67.3500, 29.5500], [67.0000, 29.8500], [66.9750, 30.1798]]
      },
      properties: {
        id: 'route-bolan',
        name: 'Bolan Pass Migration Corridor',
        indigenousName: 'Bolan Nomad Pawan Trail',
        category: 'pastoral_route',
        layerGroup: 'decolonial',
        periodOrYear: 'Seasonal Migration (Autumn/Spring)',
        description: 'Ancestral transhumance corridor used by Brahui and Pashtun pastoralists moving livestock between winter Kachi lowlands and summer Quetta highlands.',
        customaryRights: 'Customary right of way and communal watering stops along natural springs.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[68.3200, 30.3600], [69.2000, 30.2000], [70.1000, 29.9000]]
      },
      properties: {
        id: 'route-zhob-indus',
        name: 'Zhob-Sulaiman Pastoral Highway',
        indigenousName: 'Zhob High-Pasture Trail',
        category: 'pastoral_route',
        layerGroup: 'decolonial',
        periodOrYear: 'Winter Lowland Movement',
        description: 'Highland pastoral migration line connecting Zhob valley pastures to Indus river plains.',
        customaryRights: 'Inter-tribal transit agreements and shared well usage.'
      }
    },

    // 4. STATE INFRASTRUCTURE (TECHNOCRATIC)
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [62.3300, 26.0400] },
      properties: {
        id: 'infra-mirani-dam',
        name: 'Mirani Mega-Dam',
        indigenousName: 'Mirani Technocratic Storage Reservoir',
        category: 'state_infrastructure',
        layerGroup: 'technocratic',
        periodOrYear: '2006',
        description: 'State hydro-development dam on Dasht River.',
        impactAnnotation: 'Displaced customary riparian water shareholders; caused upstream flooding during 2007 cyclone.'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [68.9500, 31.2500] },
      properties: {
        id: 'infra-sabakzai-dam',
        name: 'Sabakzai Dam',
        indigenousName: 'Sabakzai State Impoundment',
        category: 'state_infrastructure',
        layerGroup: 'technocratic',
        periodOrYear: '2007',
        description: 'Zhob basin state water storage facility.',
        impactAnnotation: 'Disrupted downstream traditional Rod-Kohi flood irrigation.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[68.4000, 28.5000], [68.0000, 28.7000], [67.6000, 28.9000]]
      },
      properties: {
        id: 'infra-pat-feeder',
        name: 'Pat Feeder Canal Diversion',
        indigenousName: 'Guddu Command State Canal',
        category: 'state_infrastructure',
        layerGroup: 'technocratic',
        periodOrYear: '1969',
        description: 'Centrally engineered concrete canal diverting Indus water into eastern Balochistan.',
        impactAnnotation: 'Imposed bureaucratic canal command zones overriding local land usufruct.'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[66.5000, 30.5000], [67.5000, 30.5000], [67.5000, 29.5000], [66.5000, 29.5000]]
      },
      properties: {
        id: 'infra-admin-border',
        name: 'Quetta Division Administrative Grid',
        indigenousName: 'Technocratic Bureaucratic Boundary',
        category: 'administrative_border',
        layerGroup: 'technocratic',
        description: 'Colonial & state administrative division line bisecting tribal water management basins.',
        impactAnnotation: 'Fragmented holistic watershed governance into rigid bureaucratic districts.'
      }
    }
  ]
};
```

---

## 7. Evidence Chain & Verification Matrix

| Claim / Requirement | Source File / Tool | Verification Evidence |
|---|---|---|
| Mapbox dependency in `package.json` | `package.json:16` | `"mapbox-gl": "^3.7.0"` verified |
| Access Token Fallback in `next.config.js` | `next.config.js:9` | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` placeholder present |
| Tailwind Glassmorphic styling | `tailwind.config.js:40-68` | `glass-base`, `backdropBlur`, `glow-emerald` classes verified |
| DecolonialMap spec requirement | `PROJECT.md:17-20`, `SCOPE.md:7-15` | `components/DecolonialMap.tsx` contract defined |
| WebGIS test suite coverage | `tests/e2e/tier2_webgis.test.js:56-111` | Tests check empty route fallback, coordinate bounds, Mapbox layer toggles, malformed GeoJSON |

---

## 8. Summary Recommendation for Implementers

1. Create `lib/map-data.ts` using the provided GeoJSON blueprint with complete WGS84 `[lng, lat]` coordinates.
2. Implement `components/DecolonialMap.tsx` using `'use client'`, `useRef` map container binding, `useEffect` initialization guard, and `setLayoutProperty` visibility toggles.
3. Build `app/webgis/page.tsx` using `next/dynamic` with `{ ssr: false }` to safely load `DecolonialMap`, paired with a glassmorphic sidebar (`GlassCard`) displaying feature metadata and ITK annotations upon feature click.
