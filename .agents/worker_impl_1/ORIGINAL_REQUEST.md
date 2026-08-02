## 2026-07-24T02:13:02Z

You are a teamwork_preview_worker implementing the code for the Next.js WebGIS Portfolio & M&E Telemetry Dashboard project.

Project directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Your working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_impl_1

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Tasks to implement:
1. Create `lib/map-data.ts`:
   - Define Balochistan archaeological route coordinates and Karez GeoJSON features (`coordinates: [number, number][]`, Karez metadata).

2. Create `components/DecolonialMap.tsx`:
   - Named export `DecolonialMap`.
   - Imports `mapbox-gl`.
   - Props: `initialCenter?: [number, number]` (default `[66.975, 30.1798]`), `zoom?: number` (default `9`).
   - Layer toggle state: `"Technocratic Standard"` vs `"Decolonial ITK Layer"`.
   - Handles boundary conditions: empty route coordinates array, out-of-range zoom clamp (0 to 24), invalid layer toggle ID.

3. Create `app/webgis/page.tsx`:
   - Default export `WebGISPage` rendering `DecolonialMap` with glassmorphic control overlay panel.

4. Create `lib/mpi.ts`:
   - Function `calculateMPI(H: number, A: number)` returning `H * A` rounded to 4 decimal places, clamped between 0 and 1.
   - IFRAP Component 3 data modules structure (`water_access`, `land_usufruct`, `poverty_index`).

5. Create `components/TelemetryDashboard.tsx`:
   - Named export `TelemetryDashboard`.
   - District selector filter: Quetta (`[66.975, 30.1798]`), Pishin (`[67.0, 30.58]`), Mastung (`[66.84, 29.79]`).
   - Visual progress bars bound to IFRAP Component 3 data modules.
   - Calculates and displays Senian MPI metrics.

6. Create `app/telemetry/page.tsx`:
   - Named export `TelemetryPage` rendering `TelemetryDashboard`.

7. Create `lib/firebase-sim.ts`:
   - Export simulated Firebase SDK module (`auth`, `firestore`, `ledgerLogs`).
   - Default user: `auditor@applied-anthropology.org`.
   - Firestore collection `usufruct_certificates` with `.add()` method returning `{ id: string }`.
   - `ledgerLogs` array tracking `{ action: string, timestamp: number, metadata?: any }`.
   - Export utility functions: `sanitizeHtml`, `sanitizeQueryParam`, `validateFilePath`, `safeMerge`.

8. Create `components/UsufructGenerator.tsx`:
   - Named export `UsufructGenerator`.
   - Certificate generation form with inputs for clan, district, parcelId, areaHectares, customaryRightsType (`INALIENABLE_USUFRUCT` / `INALIENABLE_COMMUNAL_USUFRUCT`).
   - Client-side validation: empty beneficiary check, zero area check, extreme area check (1,000,000 ha), XSS & SQL/NoSQL injection payload sanitization.
   - Store entries in simulated Firebase `usufruct_certificates` collection and update compliance validation ledger log UI.

9. Create `app/fiduciary/page.tsx`:
   - Page rendering `UsufructGenerator` and digital ledger log interface.

10. Create `app/api/export/route.ts`:
    - API route handling `GET` request with query param `type` (`telemetry`, `karez`, `usufruct`).
    - `telemetry` -> returns CSV formatted string (`text/csv`).
    - `karez` -> returns GeoJSON (`application/json`).
    - `usufruct` -> returns JSON payload (`application/json`).
    - Validate query params & filenames against path traversal (`..`, `/`, `\`) and injection payloads.

11. Update `app/layout.tsx`:
    - Ensure `metadata` export is preserved.
    - Include `<script type="application/ld+json">` rendering JSON-LD schema for `@type: "ProfessionalService"` applied anthropology portfolio.

12. Verification:
    - Run `npm run build` to ensure clean TypeScript compilation.
    - Run `npm test` (`node tests/run-tests.js`) to verify all 80 E2E tests pass 100%.

13. Report:
    - Create `.agents/worker_impl_1/handoff.md` summarizing changes, build output, and test suite execution results.
    - Send message to caller with path to handoff.md.
