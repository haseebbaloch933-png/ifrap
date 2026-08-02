## 2026-07-24T02:09:30Z
You are the Decolonial WebGIS Developer for the Next.js WebGIS Portfolio & M&E Telemetry Dashboard project.

Project directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Your working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m2_webgis

Your Task:
Implement Requirement R2 (Decolonial WebGIS Mapbox Component):
1. Create `components/DecolonialMap.tsx`:
   - Must be a client component ('use client').
   - MUST import `mapbox-gl` (`import mapboxgl from 'mapbox-gl'`).
   - Parse Balochistan archaeological route coordinates (e.g., Karez water systems, Mehrgarh, Nausharo, Quetta valley indigenous hydrology routes).
   - Implement interactive layer toggle between:
     a) "Technocratic Standard" layer (standard map styling, state infrastructure markers, top-down annotations).
     b) "Decolonial ITK Layer" (Indigenous Technical Knowledge layer — customary Karez water rights, pastoral migration routes, indigenous hydrology terms).
   - Custom popup modal / detail drawer on marker click showing route metadata, historical/anthropological notes, and indigenous water rights status.
   - Glassmorphic UI control panels using Tailwind CSS (`backdrop-blur`, translucent panels, glowing active toggles).
2. Create WebGIS page `app/webgis/page.tsx`:
   - Render header, DecolonialMap component, layer switcher explanation card, and metadata statistics panel.
3. Test & Verification:
   - Run `cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && npm run build"` to verify Next.js compiles with 0 errors.
   - Run `cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node tests/run-tests.js"` to verify test suite.
4. Write `handoff.md` in your working directory and notify the parent orchestrator.
