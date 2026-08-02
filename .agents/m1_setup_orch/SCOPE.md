# Scope: Milestone 1 - UI Architecture & App Setup

## Objective
Initialize Next.js App Router project structure in `C:\Users\Administrator\teamwork_projects\anthropology_portfolio` with TypeScript, Tailwind CSS (configured for `backdrop-blur` and translucency), Framer Motion, and Mapbox GL JS.

## Requirements
- Initialize Next.js project structure with App Router.
- `package.json` must include dependencies: `next`, `react`, `react-dom`, `tailwindcss`, `mapbox-gl`, `framer-motion`, `@types/mapbox-gl`, `@types/node`, `@types/react`, `typescript`, `postcss`, `autoprefixer`, `lucide-react`, `clsx`, `tailwind-merge`.
- Configure `tailwind.config.js` and `app/globals.css` to support Google Antigravity Premium glassmorphism aesthetics (`backdrop-blur`, custom translucent colors, subtle borders, glow effects).
- Create base layout `app/layout.tsx` with glassmorphic background styling and global provider/containers.
- Create base home page `app/page.tsx` displaying the Applied Anthropology Portfolio landing header, project overview, and navigation to WebGIS, Telemetry, and Fiduciary Shield sections.
- Reusable Glassmorphism Card component `components/GlassCard.tsx`.
- Ensure `npm run build` compiles without errors.
