# Handoff Report — Milestone 2 Decolonial WebGIS Investigation

## 1. Observation

- **Project Root**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio`
- **Working Directory**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\teamwork_preview_explorer_m2_1_gen3`
- **Dependencies (`package.json`)**:
  - Line 16: `"mapbox-gl": "^3.7.0"`
  - Line 23: `"@types/mapbox-gl": "^3.4.0"`
  - Line 17: `"next": "^14.2.15"`
  - Line 18: `"react": "^18.3.1"`
- **Mapbox Access Token Configuration (`next.config.js`)**:
  - Line 9: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94LWZhbGxiYWNrIiwicSI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6In0.placeholder'`
- **UI Architecture & Layout (`app/layout.tsx`)**:
  - Line 87: Top navbar includes link to `/webgis` (`WebGIS Map`).
  - Lines 42-48: Dark glassmorphic background layer (`bg-slate-950`, radial gradient overlays, backdrop blur).
- **Test Infrastructure (`tests/run-tests.js` & `tests/e2e/tier2_webgis.test.js`)**:
  - Tier 2 tests expect coordinate bounds validation (`[lng, lat]` where `lng >= -180 && lng <= 180`), GeoJSON feature format (`{ type: 'Feature', geometry: { coordinates: [...] } }`), and dynamic map layer toggles (`technocratic` vs `itk`).

---

## 2. Logic Chain

1. **Observation**: `mapbox-gl` uses browser globals (`window`, `document`, WebGL context) which fail in SSR.
   **Reasoning**: React Server Components execute during server rendering; hence, `components/DecolonialMap.tsx` must be designated with `'use client'`.
2. **Observation**: DOM container binding requires React hooks (`useRef<HTMLDivElement>`) and initialization inside `useEffect`.
   **Reasoning**: Mounting Mapbox inside `useEffect` ensures execution occurs strictly on the browser DOM after hydration. Storing the map instance in `useRef<mapboxgl.Map | null>` prevents unwanted component re-renders while keeping the instance mutable across renders.
3. **Observation**: Page level loading in App Router (`app/webgis/page.tsx`) needs `next/dynamic` with `ssr: false`.
   **Reasoning**: Disabling SSR on the component wrapper guarantees Next.js pre-renderer will render a glassmorphic skeleton loader on Node.js without attempting to execute WebGL factory methods.
4. **Observation**: Balochistan archaeological & hydrology datasets require multi-layer GeoJSON representations.
   **Reasoning**: Standardizing `lib/map-data.ts` around GeoJSON `FeatureCollection` with WGS 84 `[longitude, latitude]` format satisfies both Mapbox GL JS source contracts (`map.addSource('balochistan-itk', { type: 'geojson', data })`) and Tier 2 E2E test assertions (`TC-T2-F2-01` through `TC-T2-F2-05`).

---

## 3. Caveats

- Mapbox GL JS relies on a valid access token for production tile fetching. A fallback token is configured in `next.config.js`, but custom Mapbox vector styles require internet access to Mapbox tile servers when running live in browser.
- In test environments running Node.js (`tests/run-tests.js`), Mapbox GL JS is mocked via `tests/utils/mock-context.js` (`createMockMapbox()`).

---

## 4. Conclusion

The technical foundation and spatial dataset design for Milestone 2 are fully specified:
1. **Mapbox GL JS Architecture**: `'use client'`, `useRef` for DOM container & map instance, client-only `useEffect` lifecycle, `next/dynamic` with `{ ssr: false }` for App Router page integration, and explicit CSS importing.
2. **GeoJSON Schema (`lib/map-data.ts`)**: Strongly-typed GeoJSON dataset covering Karez water systems (Quetta, Pishin, Mastung), archaeological nodes (Mehrgarh `[67.6167, 29.2127]`, Nausharo `[67.8800, 29.3500]`, Rana Ghundai `[68.3200, 30.3000]`), Bolan/Zhob pastoral migration routes, and technocratic state infrastructure annotations.
3. **Layer Toggle System**: Dual-mode rendering switching between "Technocratic Standard" and "Decolonial ITK Layer".

---

## 5. Verification Method

- **TypeScript Verification**:
  ```bash
  npx tsc --noEmit
  ```
- **Test Suite Execution**:
  ```bash
  npm test
  ```
  or
  ```bash
  node tests/run-tests.js
  ```
- **Files to Inspect**:
  - `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\teamwork_preview_explorer_m2_1_gen3\analysis.md`
  - `lib/map-data.ts` (when implemented)
  - `components/DecolonialMap.tsx` (when implemented)
  - `app/webgis/page.tsx` (when implemented)
