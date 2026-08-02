# Project: Next.js WebGIS Portfolio & M&E Telemetry Dashboard

## Architecture
Next.js App Router project with TypeScript, Tailwind CSS, Framer Motion, Mapbox GL JS, and simulated Firebase SDK for applied anthropology portfolio and telemetry dashboard.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UI Architecture & App Setup | Next.js App Router setup, package.json dependencies (`next`, `react`, `tailwindcss`, `mapbox-gl`, `framer-motion`), Tailwind glassmorphic theme with backdrop-blur & translucency, core layout | none | PLANNED |
| M2 | Decolonial WebGIS Mapbox Component | `components/DecolonialMap.tsx` with mapbox-gl, Balochistan route coordinates parsing, layer toggle logic ("Technocratic Standard" vs "Decolonial ITK Layer") | M1 | PLANNED |
| M3 | Telemetry & Senian MPI Logic Engine | Telemetry dashboard page, Senian Multidimensional Poverty Index capability reduction formulas, bind visual progress bars to IFRAP Component 3 data modules | M1 | PLANNED |
| M4 | Security & Fiduciary Shield | `components/UsufructGenerator.tsx`, simulated Firebase backend, digital ledger UI, compliance validation logs | M1 | PLANNED |
| M5 | SEO & Structured Data Optimization | Next.js layout metadata, JSON-LD schemas for freelance applied anthropology consulting | M1 | PLANNED |
| M6 | Final E2E Test Verification & Coverage Hardening | Run 100% E2E test suite (Tiers 1-4) and Tier 5 adversarial coverage hardening | M1, M2, M3, M4, M5, TEST_READY | PLANNED |

## Interface Contracts
### `components/DecolonialMap.tsx`
- Props: optional `initialCenter?: [number, number]`, `zoom?: number`
- Renders Mapbox map with toggle state between Technocratic Standard layer and Decolonial ITK layer
- Imports `mapbox-gl`

### `components/UsufructGenerator.tsx`
- Renders Usufruct Rights Certificates generator
- Includes simulated Firebase backend integration, compliance validation logging, digital ledger UI

### Telemetry & Senian MPI Logic (`lib/mpi.ts` or `components/TelemetryDashboard.tsx`)
- Implements Senian MPI formulas: $MPI = H \times A$ or capability reduction metrics.
- Binds values to IFRAP Component 3 data modules with progress bars.

### SEO & Layout (`app/layout.tsx`)
- Exports `metadata` object (title, description, keywords, og:image)
- Renders JSON-LD schema (`<script type="application/ld+json">`)

## Code Layout
```
anthropology_portfolio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── telemetry/
│   │   └── page.tsx
│   └── globals.css
├── components/
│   ├── DecolonialMap.tsx
│   ├── UsufructGenerator.tsx
│   ├── TelemetryDashboard.tsx
│   └── GlassCard.tsx
├── lib/
│   ├── mpi.ts
│   ├── firebase-sim.ts
│   └── map-data.ts
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```
