# Progress Log - Explorer 3

- **2026-07-23T14:24:00Z**: Inspected project UI architecture, tailwind.config.js, app/globals.css, layout.tsx, page.tsx, GlassCard.tsx.
- **2026-07-23T14:28:00Z**: Completed UI design specifications for DecolonialMap.tsx and app/webgis/page.tsx details sidebar.
- **2026-07-23T14:30:00Z**: Compiled complete UI design analysis and 5-component handoff report.
- Last visited: 2026-07-23T14:30:00Z

---

# UI Design Analysis & Interface Specifications (Milestone 2 Explorer 3)

## 1. Project UI Design Pattern & Styling Audit

### 1.1 Color System & Theme Design Tokens
From `tailwind.config.js` and `app/globals.css`:
- **Base Background**: `slate-950` (`#070b14`), `slate-900` (`#0f172a`), `slate-850` (`#111927`).
- **Glass Palette**:
  - `glass-base`: `rgba(15, 23, 42, 0.65)`
  - `glass-light`: `rgba(30, 41, 59, 0.5)`
  - `glass-dark`: `rgba(7, 11, 20, 0.75)`
  - `glass-emerald`: `rgba(16, 185, 129, 0.08)`
  - `glass-teal`: `rgba(20, 184, 166, 0.08)`
  - `glass-border`: `rgba(255, 255, 255, 0.12)`
  - `glass-border-emerald`: `rgba(16, 185, 129, 0.3)`
  - `glass-border-teal`: `rgba(45, 212, 191, 0.3)`
  - `glass-border-amber`: `rgba(245, 158, 11, 0.3)`
- **Accent Glow System**:
  - Cyan (`cyan-400`/`cyan-500`): WebGIS layer toggles, active map highlights, standard spatial vectors.
  - Emerald (`emerald-400`/`emerald-500`): Decolonial ITK layer elements, customary water rights, Karez underground channels.
  - Amber (`amber-400`/`amber-500`): Archaeological sites, ancient historical depth markers (Mehrgarh, Nausharo).
  - Violet (`violet-400`/`violet-500`): Fiduciary ledger, legal customary land tenure indicators.
- **Glass Utility Classes (`app/globals.css`)**:
  - `.glass-card`: `backdrop-filter: blur(16px); background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.12); shadow-xl;`
  - `.glass-panel`: `backdrop-filter: blur(24px); background: rgba(11, 19, 36, 0.82); border: 1px solid rgba(255, 255, 255, 0.15);`
  - `.glass-btn`: `backdrop-filter: blur(8px); background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15);`
  - `.glass-input`: `backdrop-filter: blur(8px); background: rgba(7, 11, 20, 0.6);`

### 1.2 Mapbox GL Glassmorphic Overrides (`app/globals.css`)
- `.mapboxgl-popup-content`: `background: rgba(11, 19, 36, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.18);`
- `.mapboxgl-ctrl-group`: `background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15);`
- Navigation control icons and attributes styled with high contrast text (`#2dd4bf` teal links, `#94a3b8` slate metadata).

---

## 2. Decolonial WebGIS Interface Design Specifications

### 2.1 Component Architecture Overview
1. `components/DecolonialMap.tsx` — Interactive Client Component wrapping Mapbox GL JS map canvas, floating glassmorphic control overlays, dynamic layer toggling, feature selection handler, and legend.
2. `app/webgis/page.tsx` — Responsive WebGIS View layout containing header breadcrumbs/stats bar, `DecolonialMap`, interactive details sidebar/drawer displaying selected feature metadata (ITK vs Colonial names, customary water rights, archaeological era, hydrological depth, and usufruct status), and responsive drawer controls.

---

### 2.2 Component Interface Specifications (`components/DecolonialMap.tsx`)

#### TypeScript Props & Types Interface
```typescript
export interface CustomaryWaterRights {
  governanceModel: string;      // e.g. "Mirab / Tribal Water Distribution Council"
  waterShareUnit: string;       // e.g. "Shabana (24-hour cycle share)"
  protectedStatus: boolean;    // Customary usufruct rights protection status
  legalLedgerId?: string;       // Reference ID to Fiduciary Usufruct Ledger
}

export interface FeatureMetadata {
  id: string;
  nameITK: string;                // Indigenous place name (e.g., "Karez Chashma-e-Zindag")
  nameColonial: string;           // Colonial/Technocratic name (e.g., "State Canal Drain 4-B")
  type: 'karez_channel' | 'archaeological_site' | 'customary_boundary' | 'state_aqueduct';
  era: string;                    // Historical depth (e.g. "Pre-Harappan / ~7000 BCE", "Early Bronze Age", "19th C. Colonial")
  customaryRights: CustomaryWaterRights;
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
  depthMeters?: number;           // Tunnel depth for Karez systems (m)
  dischargeLitersSec?: number;    // Flow rate telemetry (L/s)
  district: string;               // e.g., "Quetta Basin", "Kachhi Plain", "Kalat District"
}

export interface DecolonialMapProps {
  initialCenter?: [number, number]; // Default: [67.01, 29.85] (Balochistan region)
  zoom?: number;                    // Default: 7.5
  onSelectFeature?: (feature: FeatureMetadata | null) => void;
  activeLayerMode?: 'decolonial' | 'technocratic' | 'hybrid';
  className?: string;
}
```

#### Glassmorphic Control Panel Overlay Specs
- **Positioning**: `absolute top-4 left-4 z-20 max-w-xs sm:max-w-sm w-full`.
- **Classes**: `bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-4`.
- **Header**:
  - Title: "Spatial Layer Control" (`text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2`).
  - Active layer badge: `px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30`.
- **Layer Toggle Controls**:
  - **Decolonial ITK Toggle**: Button styled with `w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]` when active. Renders customary Karez channels (emerald line stroke with dasharray animation), ITK place labels, and archaeological settlements.
  - **Technocratic Standard Toggle**: Button styled with `w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]` when active. Renders state canal networks, modern tubewell points, and colonial administration boundaries.
  - **Hybrid Dual Overlay Toggle**: Button styled with `w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.25)]` when active. Highlights overlay conflict & water table displacement points.
- **Glassmorphic Legend**:
  - Color-coded vector indicators for Karez channels (emerald), archaeological sites (amber), customary usufruct zones (violet), and state tubewells (rose).

---

### 2.3 WebGIS View Page Layout (`app/webgis/page.tsx`) & Details Sidebar

#### Layout Architecture
- **Desktop (≥ 768px)**: Flex row container (`flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] w-full`).
  - Main Map View (`flex-1 relative rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-slate-950`).
  - Details Sidebar (`w-96 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border border-white/12 rounded-2xl p-6 overflow-y-auto space-y-6 shadow-2xl`).
- **Mobile (< 768px)**:
  - Map Viewport (`w-full h-[65vh] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative`).
  - Interactive Bottom Sheet / Drawer (`fixed inset-x-0 bottom-0 z-30 bg-slate-950/90 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto shadow-[0_-10px_40px_rgba(0,0,0,0.8)]`).

#### Feature Details Sidebar Metadata Content
1. **Header Card**:
   - ITK Place Name (`text-xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]`).
   - Colonial Name Sub-pill (`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-white/10 text-xs font-mono text-slate-400`).
2. **Historical & Archaeological Depth**:
   - Era Badge: e.g. "Pre-Harappan / Mehrgarh Culture (c. 7000 – 2500 BCE)" (`bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-mono font-semibold`).
   - Hydro Specs Grid: Tunnel length (`3.4 km`), Mother well depth (`28 m`), Water discharge rate (`42 L/s`).
3. **Customary Water Rights & Governance**:
   - Governance Model: `Mirab / Tribal Water Council Assembly` (`text-sm font-semibold text-slate-200`).
   - Water Share Allocation: `Shabana System (24-hour cycle share)` (`text-xs text-slate-300`).
   - Usufruct Security Status: `Usufruct Protection Verified` pill badge (`bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5`).
4. **Anthropological Context & Decolonial Analysis**:
   - Translucent box (`p-4 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-300 leading-relaxed`) highlighting gravity-fed Karez sustainability vs state tubewell water table depletion.
5. **Interactive Quick Actions**:
   - Primary: `Inspect Fiduciary Usufruct Certificate` button (`w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20`).
   - Secondary: `Focus Map on Feature` button (`w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-white/10 transition-colors`).

---

## 3. Tailwind Styling Breakdown & Class Dictionary

| Element | Tailwind Classes & CSS Utilities | Purpose |
|---|---|---|
| Map Container Wrapper | `relative w-full h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-slate-950` | Outer WebGIS map viewport container |
| Control Panel Overlay | `absolute top-4 left-4 z-20 max-w-xs sm:max-w-sm w-full bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl space-y-4` | Floating glassmorphic layer control panel |
| Active Layer Toggle (Decolonial) | `w-full py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-medium text-xs flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all` | Glass button for ITK layer activation |
| Active Layer Toggle (Technocratic) | `w-full py-2 px-3 rounded-xl bg-slate-800/60 border border-white/10 text-slate-400 font-medium text-xs hover:bg-slate-800 hover:text-slate-200 transition-all` | Glass button for standard state map |
| Sidebar Viewport (Desktop) | `w-96 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border border-white/12 rounded-2xl p-6 overflow-y-auto space-y-6 shadow-2xl` | Right sidebar for metadata rendering |
| Sidebar Bottom Sheet (Mobile) | `fixed inset-x-0 bottom-0 z-30 bg-slate-950/90 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto transition-transform duration-300 ease-out` | Responsive mobile drawer for feature metadata |
| ITK Name Header | `text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300` | Dual-tone decolonial title header |
| Colonial Name Sub-pill | `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/70 border border-white/10 text-xs font-mono text-slate-400` | Strikethrough or distinct technocratic label |
| Customary Rights Card | `p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-2` | Specialized glass card highlighting customary water laws |

---

# Handoff Report (5-Component Handoff)

## 1. Observation
- Inspected `tailwind.config.js` lines 1-98: confirmed extended colors (`slate-850/900/950`, `emerald`, `teal`, `amber`, `glass-base`, `glass-light`, `glass-dark`, `glass-emerald`, `glass-teal`, `glass-border`, `glass-border-emerald`, `glass-border-teal`, `glass-border-amber`), backdrop blur tokens (`xs` through `3xl`), shadows (`glass-card`, `glass-nav`, `glow-emerald`, `glow-teal`, `glow-amber`), animations (`pulse-slow`, `glow-pulse`, `shimmer`, `radar-scan`).
- Inspected `app/globals.css` lines 1-222: verified custom `@layer components` (`.glass-card`, `.glass-panel`, `.glass-nav`, `.glass-btn`, `.glass-input`), `@layer utilities` (`.glow-emerald`, `.glow-teal`, `.glow-amber`, `.text-glow-emerald`, `.text-glow-teal`), and Mapbox GL overrides (`.mapboxgl-popup-content`, `.mapboxgl-ctrl-group`, `.mapboxgl-ctrl-attrib`).
- Inspected `app/layout.tsx` lines 1-143 & `components/GlassCard.tsx`: verified font configuration (Inter font, dark theme root class), global ambient gradient overlays, sticky glass header navigation bar, and `GlassCard` Framer Motion wrapper pattern.
- Inspected `SCOPE.md` lines 1-29 & `PROJECT.md` lines 1-58: confirmed requirements for `components/DecolonialMap.tsx` and `app/webgis/page.tsx`.

## 2. Logic Chain
- Step 1: `tailwind.config.js` and `app/globals.css` already provide a comprehensive glassmorphic design token system (`backdrop-blur-md`/`xl`, translucent slate dark backgrounds, glowing border highlights).
- Step 2: The Mapbox GL CSS overrides in `app/globals.css` establish popup and control styling contracts matching the dark glass theme.
- Step 3: `DecolonialMap.tsx` requires an absolute floating glass panel overlay (`absolute top-4 left-4 z-20`) using `.glass-panel` or `bg-slate-900/80 backdrop-blur-md border border-white/15` for mode toggling between Decolonial ITK, Technocratic Standard, and Hybrid views.
- Step 4: `app/webgis/page.tsx` requires a responsive container (`flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]`) housing the map canvas on the left/center and an interactive details sidebar (`w-96 flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border border-white/12 rounded-2xl p-6`) on the right (collapsible into a bottom sheet on mobile).
- Step 5: Metadata fields (ITK vs Colonial place names, archaeological era, customary water rights, Usufruct protection status, and decolonial narrative) are styled using existing color codes (emerald for ITK/usufruct, cyan for technocratic/map controls, amber for historical depth, violet for fiduciary rights).

## 3. Caveats
- Mapbox GL JS canvas requires `'use client'` directive and client-side map container ref initialization.
- Mobile viewport height (`h-[calc(100vh-8rem)]`) should accommodate mobile browser address bar dynamic resizes cleanly.
- No source code files outside of agent metadata were modified during this read-only exploration.

## 4. Conclusion
- The UI architecture for `DecolonialMap.tsx` and `app/webgis/page.tsx` is completely specified with full TypeScript contracts, Tailwind class mappings, glassmorphic overlay designs, and metadata sidebar structures.

## 5. Verification Method
- Inspect `.agents/teamwork_preview_explorer_m2_3/progress.md` for complete design specifications.
- Run `npm test` or `npm run build` after Implementer creates `components/DecolonialMap.tsx` and `app/webgis/page.tsx` to verify component rendering and CSS compilation without errors.


