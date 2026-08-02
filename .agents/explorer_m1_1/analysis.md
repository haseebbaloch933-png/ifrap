# Milestone 1: UI Architecture & App Setup — Technical Analysis & Implementation Plan

## Executive Summary
This document provides the comprehensive technical analysis and step-by-step implementation strategy for Milestone 1 (UI Architecture & App Setup) of the Next.js WebGIS Portfolio & M&E Telemetry Dashboard project.

---

## 1. System Environment & Execution Context

- **Project Root**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio`
- **Node.js Executable**: `C:\Program Files\nodejs\node.exe` (`v24.18.0`)
- **NPM Executable**: `C:\Program Files\nodejs\npm.cmd` (`v11.16.0`)
- **Shell Consideration**: On Windows PowerShell, the Node binary path `C:\Program Files\nodejs` must be prepended to `$env:Path` when running CLI build commands, or commands must invoke `& "C:\Program Files\nodejs\npm.cmd"`.

---

## 2. Next.js App Router Initialization Strategy

Since the project folder `C:\Users\Administrator\teamwork_projects\anthropology_portfolio` already contains initial metadata files (`.agents/`, `PROJECT.md`), standard `create-next-app` will fail if executed directly inside the non-empty directory. 

### Recommended Initialization Workflow for Implementer:
1. Manually write `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`, and `postcss.config.js` into the project root.
2. Execute `& "C:\Program Files\nodejs\npm.cmd" install` to fetch and link all dependencies cleanly.
3. Create the required directory structure:
   - `app/` (App Router pages, layout, global styles)
   - `components/` (UI components including `GlassCard.tsx`)
   - `lib/` (Utility functions & data models)
   - `public/` (Static assets)

---

## 3. Package Specification (`package.json`)

The `package.json` specifies strict stable versions ensuring full compatibility between Next.js 14, React 18, Mapbox GL JS, Tailwind CSS v3, and Framer Motion.

```json
{
  "name": "anthropology-portfolio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "framer-motion": "^11.11.9",
    "lucide-react": "^0.453.0",
    "mapbox-gl": "^3.7.0",
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/mapbox-gl": "^3.4.0",
    "@types/node": "^20.17.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.6.3"
  }
}
```

### Key Dependency Justifications:
- **`next@^14.2.15`**: Production-ready App Router stability with React 18.
- **`mapbox-gl@^3.7.0` & `@types/mapbox-gl@^3.4.0`**: Provides WebGL map rendering for Balochistan applied anthropology route visualization.
- **`framer-motion@^11.11.9`**: Smooth animations for telemetry cards and modal overlays.
- **`clsx` & `tailwind-merge`**: Safe utility function (`cn()`) for merging Tailwind classes dynamically without precedence bugs.
- **`lucide-react@^0.453.0`**: Icon set for GIS, Telemetry, and Usufruct certificate UI components.

---

## 4. Strict TypeScript Configuration (`tsconfig.json`)

The TypeScript configuration enforces strict type-checking, preventing implicit any types and unhandled null values, while configuring path aliases (`@/*`).

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 5. Next.js Configuration (`next.config.js`)

Configuration file to ensure optimized builds, strict React mode, and Mapbox environment access:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94LWZhbGxiYWNrIiwicSI6ImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6In0.placeholder',
  },
};

module.exports = nextConfig;
```

---

## 6. Tailwind CSS & PostCSS Configuration

### `tailwind.config.js`
Configured to support Google Antigravity Premium glassmorphism aesthetics (`backdrop-blur`, custom translucent color schemes, subtle borders, glowing highlights):

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(15, 23, 42, 0.65)',
          border: 'rgba(255, 255, 255, 0.12)',
          glow: 'rgba(56, 189, 248, 0.15)',
          accent: '#38bdf8',
        },
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        xl: '20px',
      },
    },
  },
  plugins: [],
};
```

### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-sky-500/30 selection:text-sky-200;
  }
}

.glass-panel {
  @apply bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl shadow-black/40;
}
```

---

## 7. Actionable Implementation Checklist for Implementer

1. Write `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`.
2. Create helper `lib/utils.ts` for class merging (`cn`).
3. Run `& "C:\Program Files\nodejs\npm.cmd" install`.
4. Create base directories: `app/`, `components/`, `lib/`, `public/`.
5. Implement `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, and `components/GlassCard.tsx`.
6. Run `& "C:\Program Files\nodejs\npm.cmd" run build` to verify compilation.
