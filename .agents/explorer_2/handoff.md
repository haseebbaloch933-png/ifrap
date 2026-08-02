# Handoff Report — Explorer 2: Backend API & Telemetry Investigation

**Agent**: Explorer 2  
**Role**: Read-only Investigator / Backend & Telemetry Specialist  
**Working Directory**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_2`  
**Target Recipient**: Parent / Orchestrator (`d873fff7-a0e4-4815-9db3-abe0c016949c`)  
**Date**: 2026-07-31  

---

## 1. Observation

Direct observations from inspecting project source files, backend code, schema definitions, and running the test suite:

### 1.1 Backend API Endpoints
- **Next.js App Router Export API** (`app/api/export/route.ts`):
  - Line 6-9: `export async function GET(request: NextRequest)` extracts `type` parameter and calls `sanitizeQueryParam(rawType)`.
  - Line 12-15: `const fileCheck = validateFilePath(rawType); if (!fileCheck.valid) return NextResponse.json({ error: 'PATH_TRAVERSAL_DETECTED' }, { status: 400 });`
  - Line 17-20: `const supportedTypes = ['telemetry', 'karez', 'usufruct']; if (!supportedTypes.includes(sanitizedType)) return NextResponse.json({ error: 'UNSUPPORTED_EXPORT_FORMAT' }, { status: 400 });`
  - Line 22-38: `sanitizedType === 'telemetry'` returns CSV stream containing headers `district,province,component,population,karez_count,headcount_ratio,poverty_intensity,mpi`.
  - Line 40-53: `sanitizedType === 'karez'` returns GeoJSON of spatial locations and routes.
  - Line 55-70: `sanitizedType === 'usufruct'` returns JSON of filtered certificates from `lib/firebase-sim.ts` store.

- **Express Ingestion & Export Microservice** (`backend/ingest.js` & `backend/exports.js`):
  - `backend/ingest.js` Line 7-8: Runs on port `process.env.PORT || 4000`, connects to Redis (`REDIS_URL || 'redis://localhost:6379'`).
  - `backend/ingest.js` Line 67-70: `GET /health` returns `{ status: "ok", redis: redisStatus }`.
  - `backend/ingest.js` Line 97-98: `POST /webhook` and `POST /api/v2/ingest` process payloads via `validatePayload` (checking respondent CNIC/name and spatial geopoint/geotrace/geoshape) and push to Redis queue `kobo_payloads`.
  - `backend/ingest.js` Line 101: `app.use('/api/export', exportsRouter);` mounts `backend/exports.js` at `/api/export`.
  - `backend/exports.js` Line 13-45: `GET /csv/usufruct` (served at `/api/export/csv/usufruct`) queries PostgreSQL `la_rrr` joined with `la_party` and returns CSV formatted via `json2csv`.
  - `backend/exports.js` Line 48-97: `GET /pdf/grm` (served at `/api/export/pdf/grm`) queries `la_source` where `document_type = 'GRM_Record'` and streams PDF generated with `pdfkit`.

- **Python Redis Ingestion Worker** (`backend/worker.py`):
  - Line 96-136: `extract_payload_data` parses KoboToolbox spatial formats (`geopoint`, `geotrace`, `geoshape`) into PostGIS WKT (`POINT`, `LINESTRING`, `POLYGON`).
  - Line 138-194: `process_payload_db` runs atomic database transactions inserting into `la_party`, `la_spatial_unit`, and `la_rrr`.
  - Line 234-262: `run_dry_run()` fallback mode when Redis or PostgreSQL connections are offline.

- **Database Schema** (`backend/db/init_schema.sql`):
  - Line 15-24: `la_party` (`party_id`, `party_type`, `full_name`, `cnic_number`, `is_vulnerable`).
  - Line 27-36: `la_spatial_unit` (`spatial_unit_id`, `spatial_type`, `geom`, `district`, `tehsil`, `union_council`).
  - Line 48-58: `la_rrr` (`rrr_id`, `ba_unit_id`, `party_id`, `spatial_unit_id`, `rrr_type`, `approval_status`).
  - Line 61-68: `la_source` (`source_id`, `rrr_id`, `document_type`, `file_path`, `sha256_hash`, `uploaded_at`).

### 1.2 Telemetry Components
- **`components/TelemetryDashboard.tsx`**:
  - Line 19-35: Renders district selector, summary statistics strip (`summaryStats`), Senian MPI scorecard ($MPI = H \times A$), 4-dimension capability breakdown, and animated capability progress bars (`water_infrastructure`, `customary_governance`, `climate_resilience`, `economic_capability`).
  - Line 36-66: `handleExportData` dynamically generates CSV/JSON blob downloads client-side.
- **`app/telemetry/page.tsx`**:
  - Line 6-26: Exports page metadata and OpenGraph dynamic tags.
  - Line 28-43: Embeds JSON-LD dataset schema script `<script type="application/ld+json">`.

### 1.3 Test Suite Execution Results
- Executed `node tests/run-tests.js`:
  - Total Tests Executed: 80
  - Passed: 79 (98.75%)
  - Failed: 1 (`TC-T1-F2-02: Mapbox GL JS Library Import Specification` in `components/DecolonialMap.tsx`)
  - All Telemetry, Export API, Usufruct, Security, and Cross-module tests passed 100%:
    - `TC-T1-F3-01` through `TC-T1-F3-05` (Telemetry & Senian MPI Engine)
    - `TC-T1-F6-01` through `TC-T1-F6-05` (Export API Routes & Headers)
    - `TC-T2-F3-01` through `TC-T2-F3-05` (MPI Boundary & Zero Cases)
    - `TC-T2-F6-01` through `TC-T2-F6-05` (Export API Corner Cases & Rate Limit Headers)
    - `TC-T3-01` through `TC-T3-08` (Cross-feature interactions)
    - `TC-T5-01` through `TC-T5-06` (Adversarial Security & Path Traversal defense)

---

## 2. Logic Chain

1. **API Endpoint Dual-Serving Identification**:
   - *Observation*: `app/api/export/route.ts` defines GET handlers for `type=telemetry`, `type=karez`, and `type=usufruct`. `backend/ingest.js` mounts `backend/exports.js` at `/api/export`, defining `/csv/usufruct` and `/pdf/grm`.
   - *Reasoning*: Next.js handles rapid client-side export downloads directly from in-memory / simulated data, whereas the Express app acts as the microservice handling database queries (`la_rrr`, `la_source`), KoboToolbox webhooks, and PDF document generation.
   - *Deduction*: Frontend components can consume `/api/export` from Next.js directly for telemetry/GeoJSON data while calling Express endpoints (or proxied Next.js routes) for formal PDF GRM compliance reports.

2. **M&E Analytics Data Structure Gap Analysis**:
   - *Observation*: `TelemetryDashboard.tsx` currently displays district population, rehabilitations, Senian MPI scores, and 4 capability progress bars. However, stakeholder requirements specifically mandate M&E widgets for:
     a) Displaced households assisted
     b) Compensation budget burn rates
     c) Pending vs resolved GRM tickets
   - *Reasoning*: `backend/db/init_schema.sql` contains `la_source` (`document_type = 'GRM_Record'`) and `la_party` (`is_vulnerable`), but frontend contracts in `lib/ifrap-data.ts` lack structured TypeScript interfaces for tracking displacement assistance counts, financial budget burn, and GRM ticket resolutions.
   - *Deduction*: Adding explicit TypeScript interfaces (`DisplacedHouseholdsWidgetData`, `CompensationBudgetBurnData`, `GRMTicketAnalyticsData`) and mock datasets to `lib/ifrap-data.ts` (or `lib/me-analytics.ts`) will enable clean widget rendering without breaking existing MPI calculations.

3. **Real-time / Async Fetch & Offline Resilience Strategy**:
   - *Observation*: Next.js API route `app/api/export/route.ts` responds with 200 CSV/JSON streams when server is active, and test cases `TC-T2-F4-05` & `TC-T4-05` explicitly test disconnected network simulation and offline queue fallback.
   - *Reasoning*: In field environments (e.g. remote Balochistan districts), internet connectivity may be lost. Frontend widgets must fetch asynchronously when online, but automatically fall back to local mock data when `fetch()` fails.
   - *Deduction*: Implementing a custom React hook (`useMEAnalytics`) with polling (`setInterval`) and try/catch fallback ensures 100% offline resilience and smooth UI rendering with an "Offline Mode" badge indicator.

---

## 3. Caveats

- **No Code Modifications Made**: Per read-only Explorer 2 constraints, no source files under `app/`, `backend/`, `components/`, or `lib/` were modified. Proposals are documented in `analysis.md`.
- **Database Server Operational Status**: In local testing environments without active PostgreSQL/Redis instances running, the Express server and Python worker operate in dry-run/fallback mode (`run_dry_run()`). Frontend components gracefully default to `lib/ifrap-data.ts` mock state.

---

## 4. Conclusion

1. **API Endpoints**: Defined in Next.js App Router (`app/api/export/route.ts`) for CSV/GeoJSON/JSON exports and Express (`backend/ingest.js` / `backend/exports.js`) for KoboToolbox ingestion and PDF/CSV database reports.
2. **M&E Data Structures**: Existing models cover district MPI and Karez progress bars. Explicit TypeScript interfaces for Displaced Households, Budget Burn Rate, and GRM Tickets have been designed and provided in `analysis.md`.
3. **Async Fetch & Offline Strategy**: React components should use async `fetch` with polling to `/api/export`, wrapped in try-catch fallback blocks to `lib/ifrap-data.ts` local data to maintain offline resilience.

---

## 5. Verification Method

To independently verify these findings:

1. **Run Project Test Suite**:
   ```bash
   node tests/run-tests.js
   ```
   *Expected Result*: 79/80 tests pass, confirming all telemetry, export API, usufruct, security, and adversarial tests pass.

2. **Inspect API & Component Source Files**:
   - `app/api/export/route.ts` (Next.js API export handler)
   - `backend/ingest.js` & `backend/exports.js` (Express API endpoints)
   - `backend/worker.py` (Python Redis/PostGIS worker)
   - `components/TelemetryDashboard.tsx` (Telemetry dashboard component)
   - `lib/ifrap-data.ts` (Data structures and district models)

3. **Invalidation Conditions**:
   - If `app/api/export/route.ts` is removed or modified to accept types other than `['telemetry', 'karez', 'usufruct']` without path validation.
   - If `node tests/run-tests.js` fails on telemetry or export test cases (TC-T1-F3-*, TC-T1-F6-*, TC-T2-F3-*, TC-T2-F6-*).
