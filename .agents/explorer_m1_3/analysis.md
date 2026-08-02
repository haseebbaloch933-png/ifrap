# M1 UI Architecture & App Router Blueprint Analysis

**Explorer**: Explorer M1-3  
**Milestone**: M1 - UI Architecture & App Setup  
**Target Project**: Next.js WebGIS Portfolio & M&E Telemetry Dashboard  
**Date**: 2026-07-23  

---

## 1. Executive Summary & Design System Rationale

This analysis provides the complete design, layout architecture, and production-ready React component blueprints for the **Next.js WebGIS Portfolio & M&E Telemetry Dashboard**. 

The UI architecture adheres strictly to Google Antigravity dark glassmorphism standards:
- **Color Palette**: Dark Slate background (`#020617` / `bg-slate-950`), translucent Slate surfaces (`bg-slate-900/60`), and vibrant accent colors (Cyan `#06b6d4`, Emerald `#10b981`, Violet `#8b5cf6`, Amber `#f59e0b`).
- **Glassmorphic Texture**: Multi-layered `backdrop-blur-md` and `backdrop-blur-xl`, subtle translucent borders (`border-white/10`), ambient radial lighting glows, and soft inner shadows.
- **Micro-Interactions**: Framer Motion entrance animations, smooth hover translation (`-translate-y-1`), and color-coded glow effects.
- **Applied Anthropology Domain Context**: Seamlessly integrates portfolio framing for applied anthropology research in Balochistan (Karez water channels, Indigenous Technical Knowledge / ITK), Senian Multidimensional Poverty Index (MPI) telemetry for IFRAP Component 3, and digital Usufruct fiduciary land rights tracking.

---

## 2. Base Layout Architecture (`app/layout.tsx`)

### 2.1 Technical Architecture
`app/layout.tsx` serves as the root layout shell for the Next.js 14+ App Router application. Key design elements include:
1. **Google Font Integration**: Standardized `Inter` font loaded via `next/font/google` configured with variable font support (`--font-sans`).
2. **Metadata & SEO**: Comprehensive root `metadata` configuration (Title, Description, Keywords, OpenGraph framing for Applied Anthropology consulting).
3. **Global Ambient Glass Background**: A fixed, non-interactive canvas layer (`pointer-events-none fixed inset-0 z-0`) rendering glowing radial gradient orbs (Cyan top-left, Violet right, Emerald bottom) behind the glassmorphic UI.
4. **Header & Navigation Bar**: Sticky, translucent glass navbar (`bg-slate-950/70 backdrop-blur-xl border-b border-white/10`) featuring:
   - Brand logo and title: *"Applied Anthropology GIS"*
   - Navigation links: `Overview` (`/`), `WebGIS Map` (`/webgis`), `M&E Telemetry` (`/telemetry`), `Fiduciary Shield` (`/fiduciary`)
   - Real-time System Status Pill badge (`System Online`).
5. **Footer**: Glassmorphic footer displaying project citations (IFRAP Component 3, Balochistan Karez Water Studies), customary rights disclaimer, and copyright details.

### 2.2 Component Blueprint: `app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Applied Anthropology WebGIS & M&E Telemetry Dashboard',
  description: 'Integrative Decolonial WebGIS, Senian Multidimensional Poverty Index (MPI) Analytics, & Fiduciary Usufruct Ledger for Balochistan Water Infrastructure.',
  keywords: [
    'Applied Anthropology',
    'WebGIS',
    'Balochistan Karez',
    'Senian MPI',
    'IFRAP Component 3',
    'Indigenous Technical Knowledge',
    'Usufruct Rights',
    'Telemetry Dashboard',
  ],
  authors: [{ name: 'Applied Anthropology Research Team' }],
  openGraph: {
    title: 'Applied Anthropology WebGIS & M&E Telemetry',
    description: 'Decolonial spatial analytics and Senian capability metrics for water resource management.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark scroll-smooth`}>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
        
        {/* Global Ambient Glass Background Layer */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-500/15 rounded-full blur-[128px]" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-slate-950/60 to-slate-950" />
        </div>

        {/* Global Glass Header & Navbar */}
        <header className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Logo & Branding */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg p-1"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-violet-600 p-[1px]">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-bold text-base bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                  AnthropoGIS
                </span>
                <span className="hidden sm:inline text-xs text-slate-400 block -mt-1 font-medium">
                  Applied Telemetry & WebGIS
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/webgis"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              >
                WebGIS Map
              </Link>
              <Link
                href="/telemetry"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
              >
                Telemetry Dashboard
              </Link>
              <Link
                href="/fiduciary"
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
              >
                Fiduciary Shield
              </Link>
            </nav>

            {/* System Telemetry Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Active</span>
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>

        {/* Global Glass Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-300">
                Applied Anthropology Portfolio & M&E Telemetry
              </p>
              <p className="mt-1">
                Integrating Indigenous Technical Knowledge (ITK) & Senian Capability Deprivation Index for IFRAP Component 3.
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Balochistan Karez Systems</span>
              <span>•</span>
              <span>Usufruct Digital Ledger</span>
              <span>•</span>
              <span>Mapbox GL JS</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
```

---

## 3. Landing Page Architecture (`app/page.tsx`)

### 3.1 Technical Architecture
`app/page.tsx` is the primary entry point landing page. It introduces the applied anthropology portfolio framing and provides structured, interactive entry points into the project's core feature modules:
1. **Hero Header Section**:
   - Styled badge: `"APPLIED ANTHROPOLOGY PORTFOLIO & RESEARCH"`
   - Main Headline: *"Decolonial WebGIS & M&E Telemetry Platform"* with multi-color gradient text (`Cyan` to `Emerald` to `Violet`).
   - Executive Overview: Explicitly details the research framework (Balochistan customary water management, Karez subsurface channels, Senian Capability Deprivation $MPI = H \times A$, and Usufruct land rights protection).
2. **Interactive Module Grid**:
   - Uses `GlassCard` components wrapped in Framer Motion grid layouts.
   - **Card 1: Decolonial WebGIS Map**: Direct link to `/webgis`. Highlights Technocratic vs. ITK customary map layers, Mapbox GL integration, and Balochistan Karez routes.
   - **Card 2: M&E Telemetry & Senian MPI Engine**: Direct link to `/telemetry`. Highlights capability deprivation formulas ($MPI = H \times A$), progress bars, and IFRAP Component 3 metrics.
   - **Card 3: Fiduciary Shield Ledger**: Direct link to `/fiduciary`. Highlights Usufruct rights certificates, compliance logs, and simulated Firebase blockchain ledger.
3. **Quantitative Metric Highlights Strip**:
   - Four glassmorphic stats cards showing real-time capability indicators (e.g. 14 Customary Karez Routes, $H \times A$ Formula Bounded, 100% Usufruct Compliance, 3 IFRAP Sub-modules).

### 3.2 Component Blueprint: `app/page.tsx`

```tsx
'use client';

import Link from 'next/link';
import { GlassCard } from '@/components/GlassCard';

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      
      {/* Hero Header Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Applied Anthropology Portfolio & Research Telemetry
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Decolonial WebGIS &{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
            M&E Telemetry Platform
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
          Bridging customary water governance in Balochistan with quantitative monitoring. 
          Integrating Indigenous Technical Knowledge (ITK) Karez spatial layers, Senian Multidimensional 
          Poverty Index capability metrics ($MPI = H \times A$), and Usufruct fiduciary land rights protection.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/webgis"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
          >
            Launch WebGIS Map
          </Link>
          <Link
            href="/telemetry"
            className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-md hover:-translate-y-0.5"
          >
            View Telemetry Dashboard
          </Link>
        </div>
      </section>

      {/* Quantitative Project Overview Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      <section className="space-y-6">
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
          <Link href="/webgis" className="group focus:outline-none">
            <GlassCard glowColor="cyan" animate delay={0.1} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V11a2 2 0 012-2h1.065M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    Decolonial WebGIS Map
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Interactive Mapbox GL interface visualizing customary Karez water channels in Balochistan. 
                    Toggle dynamically between technocratic state infrastructure layers and indigenous ITK spatial boundaries.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono">Mapbox GL</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">ITK Layers</span>
                </div>
                <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Map &rarr;
                </span>
              </div>
            </GlassCard>
          </Link>

          {/* Module Card 2: Telemetry & MPI Engine */}
          <Link href="/telemetry" className="group focus:outline-none">
            <GlassCard glowColor="emerald" animate delay={0.2} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                    Senian MPI Telemetry Engine
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                    Quantitative Monitoring & Evaluation dashboard calculating Amartya Sen&apos;s Multidimensional 
                    Poverty Index ($MPI = H \times A$). Tracks capability deprivation across IFRAP Component 3 water projects.
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
          <Link href="/fiduciary" className="group focus:outline-none">
            <GlassCard glowColor="violet" animate delay={0.3} className="h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-violet-300 transition-colors">
                    Fiduciary Shield Ledger
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
      <section>
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
```

---

## 4. Reusable GlassCard Component (`components/GlassCard.tsx`)

### 4.1 Technical Architecture
`components/GlassCard.tsx` is the foundation component for all cards and elevated containers across the application.
- **Client Directive**: Marked `'use client'` to support Framer Motion animations and interactive hover handlers.
- **Props Interface**:
  - `children`: React content node.
  - `className`: Optional custom Tailwind classes merged with standard classes via `clsx` / `tailwind-merge` utility or clean string concatenation.
  - `hoverEffect`: Boolean flag (default `true`) toggling vertical translation (`-translate-y-1`), shadow expansion, and border brightness on hover.
  - `glowColor`: Color variant enum (`'cyan' | 'emerald' | 'violet' | 'amber' | 'blue' | 'none'`, default `'cyan'`).
  - `animate`: Boolean flag (default `true`) controlling Framer Motion fade-in/slide-up.
  - `delay`: Entrance delay in seconds (default `0`).
  - `onClick`: Optional click callback function.

### 4.2 Glow Color Styling Mapping
- **`cyan`**: `hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]`
- **`emerald`**: `hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]`
- **`violet`**: `hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]`
- **`amber`**: `hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]`
- **`blue`**: `hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]`
- **`none`**: `hover:border-white/20 hover:shadow-lg hover:shadow-black/40`

### 4.3 Component Blueprint: `components/GlassCard.tsx`

```tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'cyan' | 'emerald' | 'violet' | 'amber' | 'blue' | 'none';
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
}

const glowColorClasses: Record<NonNullable<GlassCardProps['glowColor']>, string> = {
  cyan: 'hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
  emerald: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
  violet: 'hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]',
  amber: 'hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
  blue: 'hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  none: 'hover:border-white/20 hover:shadow-lg hover:shadow-black/40',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  glowColor = 'cyan',
  animate = true,
  delay = 0,
  onClick,
}) => {
  const baseClasses = 'relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 shadow-xl shadow-black/20';
  const hoverClasses = hoverEffect ? `hover:-translate-y-1 cursor-pointer ${glowColorClasses[glowColor]}` : '';
  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`.trim();

  if (!animate) {
    return (
      <div className={combinedClasses} onClick={onClick}>
        {/* Sheen effect accent line */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={combinedClasses}
      onClick={onClick}
    >
      {/* Sheen effect accent line */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      {children}
    </motion.div>
  );
};
```

---

## 5. Implementation & Integration Guidelines

### 5.1 Package Dependencies Checklist
To ensure the code blueprints compile seamlessly without missing module errors, `package.json` must include:
- `next`: `^14.0.0` or higher
- `react`: `^18.2.0`
- `react-dom`: `^18.2.0`
- `framer-motion`: `^10.0.0` or `^11.0.0`
- `tailwindcss`: `^3.3.0`
- `@types/react`: `^18.2.0`
- `@types/node`: `^20.0.0`
- `typescript`: `^5.0.0`

### 5.2 Tailwind CSS Globals Configuration (`app/globals.css`)
Ensure `app/globals.css` includes standard Tailwind directives and smooth scroll rules:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-950 text-slate-100;
  }
}
```

### 5.3 Verification Procedure
1. Create `components/GlassCard.tsx`, `app/layout.tsx`, and `app/page.tsx` with the blueprints specified above.
2. Run `npm run build` or `npx next build` to verify standard SSR compilation.
3. Test layout responsiveness across mobile (`< 640px`), tablet (`640px - 1024px`), and desktop (`> 1024px`).
