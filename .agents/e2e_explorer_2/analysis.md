# 4-Tier E2E Test Specification & Strategy Design

**Project Target**: Next.js WebGIS Portfolio & M&E Telemetry Dashboard  
**Author**: Explorer 2 (`e2e_explorer_2`) — E2E Testing Track  
**Date**: 2026-07-23  
**Status**: COMPLETE — TEST SPECIFICATION APPROVED  

---

## 1. Executive Summary & Dual-Track Testing Principles

This specification defines the comprehensive 4-tier End-to-End (E2E) testing framework for the **Next.js WebGIS Portfolio & M&E Telemetry Dashboard**. Built on applied anthropology domain principles and modern WebGIS/telemetry architectures, the test suite verifies end-to-end functionality across visual rendering, GIS spatial mapping, Senian Multidimensional Poverty Index ($MPI = H \times A$) computations, digital Usufruct ledger transactions, SEO structured data, and REST data export APIs.

### Dual-Track Testing Principles
1. **Opaque-Box User Interface & Behavioral Verification**: Tests evaluate system behavior from the end-user perspective, verifying UI state changes, visual DOM assertions, network API contracts, and workflow outcomes without relying on internal private state.
2. **Deterministic Mathematical & Spatial Assertions**: Calculations (e.g. Senian MPI headcount vs. intensity formulas, GeoJSON boundary intersections, Usufruct SHA-256 hash generation) are validated against exact mathematical ground truth.
3. **Resilience & Adversarial Boundary Shielding**: Systems are subjected to extreme inputs, out-of-bounds spatial coordinates, empty/malformed payloads, network drops, and rate limits to guarantee fault tolerance.
4. **End-to-End Real-World Scenario Simulation**: Test workflows mirror actual field monitoring operations in Balochistan, applied anthropology research presentations, and customary land rights protection activities.

---

## 2. Feature Extraction & Identification Matrix ($N=6$)

Based on detailed analysis of `PROJECT.md`, `SCOPE.md`, codebase architecture, and milestone specifications, the application comprises **$N = 6$ distinct core features**:

| Feature ID | Feature Name | Core Component / Route | Scope & Description |
|---|---|---|---|
| **F1** | **Glassmorphic UI & Portfolio Navigation** | `app/layout.tsx`<br>`app/page.tsx`<br>`components/GlassCard.tsx` | Next.js App Router root layout, dark slate theme, backdrop-blur frosted glass containers, responsive navigation bar, hero overview, summary metrics, and status badges. |
| **F2** | **Decolonial WebGIS Mapbox Component** | `components/DecolonialMap.tsx`<br>`app/webgis/page.tsx`<br>`lib/map-data.ts` | Mapbox GL JS map engine, Balochistan Karez route coordinates parsing, interactive spatial popups, and layer toggle state ("Technocratic Standard" vs. "Decolonial ITK Layer"). |
| **F3** | **M&E Telemetry & Senian MPI Logic Engine** | `app/telemetry/page.tsx`<br>`lib/mpi.ts`<br>`components/TelemetryDashboard.tsx` | Senian Multidimensional Poverty Index calculator ($MPI = H \times A$), IFRAP Component 3 progress bar data binding, capability deprivation indicator filters, and data tables. |
| **F4** | **Fiduciary Shield Usufruct Generator & Ledger** | `components/UsufructGenerator.tsx`<br>`app/fiduciary/page.tsx`<br>`lib/firebase-sim.ts` | Usufruct Rights Certificate generator, simulated Firebase real-time ledger synchronization, cryptographic hash generation, digital ledger table, and compliance validation logging. |
| **F5** | **SEO & Structured Data Optimization Engine** | `app/layout.tsx`<br>`app/page.tsx` | Dynamic metadata object (title, description, keywords, OpenGraph tags), JSON-LD structured data (`application/ld+json`) for applied anthropology consulting, and semantic HTML5 tags. |
| **F6** | **Telemetry & WebGIS Data Export API Engine** | `app/api/telemetry/export/route.ts`<br>`app/api/geojson/karez/route.ts`<br>`app/api/usufruct/certificates/route.ts` | RESTful data export endpoints delivering CSV telemetry files, GeoJSON Karez spatial features, certified Usufruct JSON payloads, query parameter filtering, and rate limiting. |

---

## 3. Mathematical Test Count Verification Matrix

The 4-tier testing architecture satisfies all mathematical thresholds defined in the dual-track testing protocol.

### Threshold Formulas & Verification

- **Feature Count ($N$)**: $6$
- **Tier 1 (Feature Coverage)**: $\text{Count} \ge 5 \times N = 5 \times 6 = 30$
- **Tier 2 (Boundary & Corner Cases)**: $\text{Count} \ge 5 \times N = 5 \times 6 = 30$
- **Tier 3 (Cross-Feature Combinations)**: $\text{Count} \ge N = 6$
- **Tier 4 (Real-World Application Scenarios)**: $\text{Count} \ge \max(5, \lfloor N / 2 \rfloor) = \max(5, 3) = 5$
- **Total Test Suite Floor Formula**: $\text{Total} \ge 11 \times N + \max(5, \lfloor N / 2 \rfloor) = 11 \times 6 + 5 = 71$

### Designed Test Case Distribution

| Testing Tier | Description / Objective | Formula Requirement | Designed Count | Status |
|---|---|---|---|---|
| **Tier 1** | Feature Coverage (>=5 per feature) | $\ge 30$ | **30** | PASS ($\ge 30$) |
| **Tier 2** | Boundary & Corner Cases (>=5 per feature) | $\ge 30$ | **30** | PASS ($\ge 30$) |
| **Tier 3** | Cross-Feature Combinations (Pairwise) | $\ge 6$ | **8** | PASS ($\ge 6$) |
| **Tier 4** | Real-World Application Scenarios | $\ge 5$ | **6** | PASS ($\ge 5$) |
| **GRAND TOTAL** | **Complete E2E Specification Suite** | $\ge 71$ | **74** | **PASS ($\ge 71$)** |

---

## 4. Tier 1: Feature Coverage Test Specifications (30 Test Cases)

Each test case targets a specific feature, executing core workflows and asserting expected outcomes.

### Feature 1: Glassmorphic UI & Portfolio Navigation (F1)

- **`TC-T1-F1-01`: Glass Card Container Rendering & Translucency Styling**
  - *Target Component*: `components/GlassCard.tsx`
  - *Input/Action*: Render `GlassCard` with `glowColor="cyan"` and `hoverEffect={true}`.
  - *Expected Assertion*: Element contains CSS classes `bg-slate-900/60`, `backdrop-blur-md`, `border-white/10`; hover state triggers translation `-translate-y-1` and cyan shadow.

- **`TC-T1-F1-02`: Responsive Header Navbar & Link Navigation**
  - *Target Component*: `app/layout.tsx` Header
  - *Input/Action*: Click navbar route links (`Overview`, `WebGIS Map`, `Telemetry Dashboard`, `Fiduciary Shield`).
  - *Expected Assertion*: Active URL changes to `/`, `/webgis`, `/telemetry`, `/fiduciary` respectively; active link displays distinct color highlight.

- **`TC-T1-F1-03`: System Telemetry Active Badge Display**
  - *Target Component*: `app/layout.tsx` Navigation
  - *Input/Action*: Inspect header badge on desktop viewport (>1024px).
  - *Expected Assertion*: Badge text reads "Telemetry Active" with an animated green pulse indicator (`animate-pulse`).

- **`TC-T1-F1-04`: Hero Header & Quantitative Summary Metric Cards**
  - *Target Component*: `app/page.tsx`
  - *Input/Action*: Load home page root URL (`/`).
  - *Expected Assertion*: Hero title renders "Decolonial WebGIS & M&E Telemetry Platform"; 4 metric cards display "14 Karez Systems Mapped", "H x A Senian MPI Engine", "100% Usufruct Compliance", and "IFRAP C3".

- **`TC-T1-F1-05`: Glassmorphic Footer Citations & Disclaimer**
  - *Target Component*: `app/layout.tsx` Footer
  - *Input/Action*: Scroll to page bottom.
  - *Expected Assertion*: Footer displays text referencing "Balochistan Karez Systems", "Usufruct Digital Ledger", and "IFRAP Component 3".

### Feature 2: Decolonial WebGIS Mapbox Component (F2)

- **`TC-T1-F2-01`: Mapbox GL Canvas Initialization & Regional Centering**
  - *Target Component*: `components/DecolonialMap.tsx`
  - *Input/Action*: Mount `DecolonialMap` component with default props.
  - *Expected Assertion*: Mapbox GL map canvas initializes without errors; center coordinates point to Balochistan region (approx `[66.9, 30.1]`).

- **`TC-T1-F2-02`: Technocratic Standard Layer Default Render**
  - *Target Component*: `components/DecolonialMap.tsx`
  - *Input/Action*: Verify initial layer state.
  - *Expected Assertion*: "Technocratic Standard" layer toggle is selected by default; state infrastructure vector lines are visible on map.

- **`TC-T1-F2-03`: Decolonial ITK Layer Toggle Execution**
  - *Target Component*: `components/DecolonialMap.tsx`
  - *Input/Action*: Click layer toggle button to switch to "Decolonial ITK Layer".
  - *Expected Assertion*: Technocratic layer visibility turns off; customary Karez subsurface water channel GeoJSON layer renders with emerald glow styling.

- **`TC-T1-F2-04`: Karez Feature Interactive Popup Tooltip Display**
  - *Target Component*: `components/DecolonialMap.tsx`
  - *Input/Action*: Click on a customary Karez line or point marker.
  - *Expected Assertion*: Mapbox popup opens displaying Karez channel name, customary discharge volume (L/s), and community usufruct owner group.

- **`TC-T1-F2-05`: Navigation Viewport Controls (Zoom & Pitch)**
  - *Target Component*: `components/DecolonialMap.tsx`
  - *Input/Action*: Click Zoom In button, then Zoom Out, then Reset View.
  - *Expected Assertion*: Map zoom level increments/decrements accordingly; camera view repositions to initial Balochistan bounds.

### Feature 3: M&E Telemetry & Senian MPI Logic Engine (F3)

- **`TC-T1-F3-01`: Senian MPI Headcount ($H$) and Intensity ($A$) Calculation**
  - *Target Module*: `lib/mpi.ts` / `app/telemetry/page.tsx`
  - *Input/Action*: Set headcount ratio $H = 0.40$ and intensity of deprivation $A = 0.55$.
  - *Expected Assertion*: Calculated Senian Multidimensional Poverty Index yields exact value $MPI = 0.40 \times 0.55 = 0.220$.

- **`TC-T1-F3-02`: IFRAP Component 3 Progress Bar Data Binding**
  - *Target Component*: `components/TelemetryDashboard.tsx`
  - *Input/Action*: Load telemetry dashboard page.
  - *Expected Assertion*: Progress bars render completion percentages for IFRAP Sub-projects (e.g. Karez Rehabilitation: 78%, Water Distributary Security: 64%, Household Usufruct Mapping: 92%).

- **`TC-T1-F3-03`: Telemetry Indicator Filter Selection**
  - *Target Component*: `components/TelemetryDashboard.tsx`
  - *Input/Action*: Click filter option "Water Deprivation Only".
  - *Expected Assertion*: Data cards and table rows filter to display only water capability indicators; non-matching rows hidden.

- **`TC-T1-F3-04`: Real-Time Telemetry Data Table Pagination & Sorting**
  - *Target Component*: `components/TelemetryDashboard.tsx`
  - *Input/Action*: Click column header "Deprivation Score (A)" to sort descending; click "Next Page".
  - *Expected Assertion*: Rows reorder from highest to lowest intensity score; page 2 of records renders.

- **`TC-T1-F3-05`: Capability Deprivation Status Indicator Color Coding**
  - *Target Component*: `components/TelemetryDashboard.tsx`
  - *Input/Action*: Inspect status badges for scores $< 0.10$, $0.10 - 0.30$, and $> 0.30$.
  - *Expected Assertion*: Scores $< 0.10$ display Emerald badge ("Low Deprivation"); $0.10-0.30$ display Amber ("Moderate"); $> 0.30$ display Red ("Severe Deprivation").

### Feature 4: Fiduciary Shield Usufruct Generator & Backend Ledger (F4)

- **`TC-T1-F4-01`: Usufruct Certificate Form Input & Submission**
  - *Target Component*: `components/UsufructGenerator.tsx`
  - *Input/Action*: Fill form fields (Grantee Name: "Mastung Farmers Cooperative", Land Parcel ID: "Karez-M-104", Land Area: "12.5 acres", Water Rights Share: "4.5 hours/cycle") and click "Generate Certificate".
  - *Expected Assertion*: Certificate modal renders generated document containing entered details.

- **`TC-T1-F4-02`: Simulated Firebase Backend Synchronization**
  - *Target Module*: `lib/firebase-sim.ts`
  - *Input/Action*: Submit valid Usufruct certificate.
  - *Expected Assertion*: Simulated Firebase SDK call `addDoc('usufruct_certificates')` completes successfully; returns record ID with status `SYNCED`.

- **`TC-T1-F4-03`: Cryptographic Certificate Hash Generation**
  - *Target Component*: `components/UsufructGenerator.tsx`
  - *Input/Action*: Inspect generated certificate details.
  - *Expected Assertion*: Displays 64-character SHA-256 string (e.g. `0x8f3a2b...`) uniquely calculated from parcel ID and timestamp.

- **`TC-T1-F4-04`: Digital Ledger Record Table Listing & Search Filter**
  - *Target Component*: `components/UsufructGenerator.tsx`
  - *Input/Action*: Enter "Mastung" into ledger search field.
  - *Expected Assertion*: Ledger table dynamically filters to display matching certificate entry for Mastung Farmers Cooperative.

- **`TC-T1-F4-05`: Compliance Validation Log Stream Event Logging**
  - *Target Component*: `components/UsufructGenerator.tsx`
  - *Input/Action*: Generate new certificate and trigger compliance audit check.
  - *Expected Assertion*: Compliance validation console appends real-time log string `[TIMESTAMP] COMPLIANCE_PASSED: Usufruct Rights Validated against Karez Water Customary Statute`.

### Feature 5: SEO & Structured Data Optimization Engine (F5)

- **`TC-T1-F5-01`: Dynamic Page Title & Meta Description Verification**
  - *Target Module*: `app/layout.tsx` metadata
  - *Input/Action*: Inspect DOM `<head>` on home page.
  - *Expected Assertion*: `<title>` contains "Applied Anthropology WebGIS & M&E Telemetry Dashboard"; `<meta name="description">` matches project summary text.

- **`TC-T1-F5-02`: OpenGraph Social Metadata Tag Inspection**
  - *Target Module*: `app/layout.tsx` metadata
  - *Input/Action*: Query DOM for `meta[property^="og:"]`.
  - *Expected Assertion*: `og:title`, `og:description`, `og:type` ("website"), and `og:image` tags exist with valid string content.

- **`TC-T1-F5-03`: JSON-LD Structured Data Script Parsing**
  - *Target Module*: `app/layout.tsx`
  - *Input/Action*: Parse content of `<script type="application/ld+json">`.
  - *Expected Assertion*: Parsed JSON matches `@context: "https://schema.org"`, `@type: "ResearchProject"` or `"ProfessionalService"`, with valid `name` and `description`.

- **`TC-T1-F5-04`: Semantic HTML5 Element Structure Validation**
  - *Target Module*: `app/layout.tsx` & `app/page.tsx`
  - *Input/Action*: Inspect root DOM structure.
  - *Expected Assertion*: Page uses valid semantic elements `<header>`, `<main>`, `<section>`, `<footer>`; no duplicate `<h1>` tags.

- **`TC-T1-F5-05`: Canonical URL Tag Verification**
  - *Target Module*: `app/layout.tsx`
  - *Input/Action*: Inspect DOM for `<link rel="canonical">`.
  - *Expected Assertion*: Link element contains valid canonical origin URL.

### Feature 6: Telemetry & WebGIS Data Export API Engine (F6)

- **`TC-T1-F6-01`: Telemetry Dataset CSV Export Endpoint (`/api/telemetry/export`)**
  - *Target API*: `GET /api/telemetry/export`
  - *Input/Action*: Issue GET request to `/api/telemetry/export`.
  - *Expected Assertion*: Response status HTTP 200; `Content-Type: text/csv`; body contains header `indicator_id,region,mpi_h,mpi_a,mpi_score,status`.

- **`TC-T1-F6-02`: Karez WebGIS GeoJSON Stream Endpoint (`/api/geojson/karez`)**
  - *Target API*: `GET /api/geojson/karez`
  - *Input/Action*: Issue GET request to `/api/geojson/karez`.
  - *Expected Assertion*: Response status HTTP 200; `Content-Type: application/json`; payload is valid GeoJSON `FeatureCollection` containing Karez LineString and Point features.

- **`TC-T1-F6-03`: Usufruct Rights Certificates JSON Endpoint (`/api/usufruct/certificates`)**
  - *Target API*: `GET /api/usufruct/certificates`
  - *Input/Action*: Issue GET request to `/api/usufruct/certificates`.
  - *Expected Assertion*: Response status HTTP 200; returns array of certificate objects containing `certificateId`, `grantee`, `parcelId`, `areaAcres`, `hash`.

- **`TC-T1-F6-04`: REST API Query Parameter Filtering (`?region=balochistan`)**
  - *Target API*: `GET /api/telemetry/export?region=balochistan`
  - *Input/Action*: Request telemetry export filtered by region parameter.
  - *Expected Assertion*: Response contains only telemetry records matching region "balochistan".

- **`TC-T1-F6-05`: Export Data File Content & Column Integrity Check**
  - *Target API*: `GET /api/telemetry/export`
  - *Input/Action*: Parse CSV payload lines.
  - *Expected Assertion*: Every CSV row contains exactly 6 comma-separated fields matching column header schema.

---

## 5. Tier 2: Boundary & Corner Case Specifications (30 Test Cases)

Focuses on input validation limits, zero values, extreme spatial coordinates, network timeouts, malformed payloads, rate limits, and fallback UI rendering.

### Feature 1: Glassmorphic UI & Portfolio Navigation (F1)

- **`TC-T2-F1-01`: Ultra-Narrow Viewport Rendering (320px Mobile Screen)**
  - *Boundary Condition*: Viewport resized to `width: 320px`, `height: 568px`.
  - *Expected Result*: Glass nav links collapse into mobile hamburger or overflow-scroll menu without horizontal viewport scrollbar or broken layouts.

- **`TC-T2-F1-02`: Missing Web Font Load Fallback**
  - *Boundary Condition*: Block network request for Inter Google Font stylesheet.
  - *Expected Result*: System font stack (`system-ui`, `sans-serif`) renders legibly without visual text overlap or font layout shifts.

- **`TC-T2-F1-03`: Low-Power Device GPU Acceleration Fallback**
  - *Boundary Condition*: Browser engine with `backdrop-filter: none` support (legacy mode).
  - *Expected Result*: `.glass-card` elements fall back to high-opacity solid background (`rgba(15, 23, 42, 0.95)`), preserving text contrast.

- **`TC-T2-F1-04`: Rapid Route Switching Stress Test**
  - *Boundary Condition*: Trigger 20 rapid clicks between `/webgis` and `/telemetry` within 1 second.
  - *Expected Result*: React state transitions complete smoothly without memory leaks, unmounted component state update warnings, or page freeze.

- **`TC-T2-F1-05`: Zero-Length Custom Class Merge Handling**
  - *Boundary Condition*: Render `GlassCard` with `className=""` or `className={undefined}`.
  - *Expected Result*: Base glassmorphic CSS classes apply correctly without string interpolation errors like `undefined` or `null`.

### Feature 2: Decolonial WebGIS Mapbox Component (F2)

- **`TC-T2-F2-01`: Extreme Spatial Coordinates (Pole to Pole Boundaries)**
  - *Boundary Condition*: Pass feature coordinates `[180.0, 90.0]` and `[-180.0, -90.0]`.
  - *Expected Result*: Map engine clamps view safely or handles coordinate bounds without canvas WebGL crashes or infinite loops.

- **`TC-T2-F2-02`: Invalid Mapbox Access Token Fallback**
  - *Boundary Condition*: Supply invalid token `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="invalid_token_123"`.
  - *Expected Result*: Fallback glass card displays user notice ("Map preview unavailable — offline mode active") instead of white screen error.

- **`TC-T2-F2-03`: Empty GeoJSON Feature Collection Payload**
  - *Boundary Condition*: GeoJSON API returns `{ "type": "FeatureCollection", "features": [] }`.
  - *Expected Result*: Map renders base vector tiles cleanly; displays informational banner ("No customary Karez channels found for this area").

- **`TC-T2-F2-04`: Rapid Layer Toggle Stress Test**
  - *Boundary Condition*: Toggle between "Technocratic Standard" and "Decolonial ITK" layers 50 times consecutively.
  - *Expected Result*: Map layer rendering stays synchronized with state button; no duplicate Mapbox source/layer registration errors thrown.

- **`TC-T2-F2-05`: Malformed GeoJSON Geometry Coordinate Parsing**
  - *Boundary Condition*: GeoJSON feature contains `coordinates: [null, undefined]`.
  - *Expected Result*: Component filters out invalid geometry feature without halting layer render process.

### Feature 3: M&E Telemetry & Senian MPI Logic Engine (F3)

- **`TC-T2-F3-01`: Zero Boundary Input Values ($H = 0.0, A = 0.0$)**
  - *Boundary Condition*: Inputs set to $H = 0.0$, $A = 0.0$.
  - *Expected Result*: Senian MPI returns exact $MPI = 0.000$; progress bar displays 0%; status badge displays "No Deprivation".

- **`TC-T2-F3-02`: Maximum Boundary Input Values ($H = 1.0, A = 1.0$)**
  - *Boundary Condition*: Inputs set to $H = 1.0$, $A = 1.0$.
  - *Expected Result*: Senian MPI returns exact $MPI = 1.000$; progress bar displays 100%; status badge displays "Critical Deprivation".

- **`TC-T2-F3-03`: Out-of-Range Negative & Greater-Than-One Inputs**
  - *Boundary Condition*: Input values $H = -0.5$ or $A = 1.45$.
  - *Expected Result*: Calculator traps error, displays inline validation message ("Headcount and Intensity ratios must be between 0.0 and 1.0"), clamping calculated $MPI$ value.

- **`TC-T2-F3-04`: Non-Numeric String Injection in Calculation Fields**
  - *Boundary Condition*: Input payload `$H = "abc"$, $A = "<script>alert(1)</script>"$`.
  - *Expected Result*: Input sanitizer strips non-numeric characters; prevents `NaN` propagation or script execution.

- **`TC-T2-F3-05`: Floating Point Precision Rounding Validation**
  - *Boundary Condition*: Inputs $H = 0.33333333$, $A = 0.66666666$.
  - *Expected Result*: MPI result cleanly rounded to 3 decimal places ($MPI = 0.222$) without floating point artifacts like `0.222222221114`.

### Feature 4: Fiduciary Shield Usufruct Generator & Backend Ledger (F4)

- **`TC-T2-F4-01`: Empty Required Form Field Submission**
  - *Boundary Condition*: Submit Usufruct certificate form with all blank text inputs.
  - *Expected Result*: Submission blocked; validation error highlights required fields ("Grantee Name and Parcel ID are required").

- **`TC-T2-F4-02`: Extreme Character Length & Malformed Payload Submission**
  - *Boundary Condition*: Field input string containing 5,000 characters and SQL injection string `' OR 1=1 --`.
  - *Expected Result*: Text fields truncate string to max length limit (255 chars); input sanitized safely before ledger write.

- **`TC-T2-F4-03`: Network Failure / Firebase Connection Offline Simulation**
  - *Boundary Condition*: Simulate offline state (`navigator.onLine = false`).
  - *Expected Result*: Form caches generated certificate in local browser storage (`IndexedDB`/`localStorage`); logs status `QUEUED_OFFLINE` with auto-sync prompt.

- **`TC-T2-F4-04`: Duplicate Certificate SHA-256 Hash Submission**
  - *Boundary Condition*: Submit identical parcel ID and timestamp payload twice.
  - *Expected Result*: System detects duplicate hash key, appends unique nonce sequence to guarantee distinct certificate hash generation.

- **`TC-T2-F4-05`: Zero Usufruct Acreage Entry ($0.00$ Acres)**
  - *Boundary Condition*: Enter land area acreage `0.00`.
  - *Expected Result*: Validation error displays ("Land acreage must be greater than zero for Usufruct certificate issuance").

### Feature 5: SEO & Structured Data Optimization Engine (F5)

- **`TC-T2-F5-01`: Undefined Metadata Field Null Safety**
  - *Boundary Condition*: Pass empty object to dynamic layout metadata generator.
  - *Expected Result*: Metadata falls back to default fallback strings defined in `app/layout.tsx` without throwing rendering exceptions.

- **`TC-T2-F5-02`: Extremely Long Meta Title String (> 300 Characters)**
  - *Boundary Condition*: Inject 350-character title string into dynamic metadata.
  - *Expected Result*: Title is safely handled or truncated to max SEO length (~60-70 chars) for standard tag rendering.

- **`TC-T2-F5-03`: JSON-LD Syntax Exception Shielding**
  - *Boundary Condition*: Inject special quote characters `"` or unescaped newlines into JSON-LD property values.
  - *Expected Result*: JSON serializer properly escapes quotes (`\"`); `<script type="application/ld+json">` parses as valid JSON without syntax errors.

- **`TC-T2-F5-04`: Multilingual Unicode String Metadata Support (Urdu / Balochi Characters)**
  - *Boundary Condition*: Inject Urdu/Balochi text (e.g. `"کاریز بلوچستان"`) into page title and JSON-LD schema.
  - *Expected Result*: HTML document metadata encodes characters in UTF-8 without mangled replacement characters (e.g. `???`).

- **`TC-T2-F5-05`: Dynamic Non-Existent 404 Route Metadata**
  - *Boundary Condition*: Navigate to non-existent route `/non-existent-page`.
  - *Expected Result*: 404 layout metadata sets `title: "Page Not Found | AnthropoGIS"` and `robots: "noindex, nofollow"`.

### Feature 6: Telemetry & WebGIS Data Export API Engine (F6)

- **`TC-T2-F6-01`: Empty Query Filter CSV Export Response**
  - *Boundary Condition*: Request `/api/telemetry/export?region=non_existent_region`.
  - *Expected Result*: Response HTTP 200; body contains CSV column header row followed by 0 data rows (empty payload handled gracefully).

- **`TC-T2-F6-02`: Large Payload Export Memory Limit Test**
  - *Boundary Condition*: Request export of 50,000 telemetry records.
  - *Expected Result*: Server streams CSV response in chunks without exceeding Node.js memory limits or timing out.

- **`TC-T2-F6-03`: API Rate Limiting Burst Request Enforcement**
  - *Boundary Condition*: Issue 100 GET requests to `/api/telemetry/export` within 5 seconds from single IP.
  - *Expected Result*: First $N$ requests return HTTP 200; subsequent requests return HTTP 429 ("Too Many Requests") with `Retry-After` header.

- **`TC-T2-F6-04`: Unsupported File Format Request**
  - *Boundary Condition*: Issue GET request `/api/telemetry/export?format=exe`.
  - *Expected Result*: Response HTTP 400 Bad Request; body returns JSON `{ "error": "Invalid format. Supported formats: csv, json" }`.

- **`TC-T2-F6-05`: Malformed JSON POST Request Body to Certificate API**
  - *Boundary Condition*: Issue POST request to `/api/usufruct/certificates` with broken JSON payload `{ "grantee": "Mastung", `.
  - *Expected Result*: Response HTTP 400 Bad Request with JSON error message ("Malformed JSON payload").

---

## 6. Tier 3: Cross-Feature Combination Specifications (8 Test Cases)

Verifies multi-feature interactions, state synchronization, and pairwise workflows.

| Test ID | Cross-Feature Interaction | Workflow Steps & Actions | Expected State Synchronization |
|---|---|---|---|
| **`TC-T3-01`** | **F3 (Telemetry) + F2 (WebGIS Map)** | 1. Open Telemetry Dashboard.<br>2. Filter by high MPI deprivation ($MPI > 0.30$).<br>3. Click "Sync to WebGIS Map". | WebGIS map updates viewport bounds to center on affected Karez spatial cluster; map markers filter to highlight high-deprivation channels. |
| **`TC-T3-02`** | **F2 (WebGIS Map) + F4 (Usufruct Generator)** | 1. Click customary Karez point marker on Decolonial Map.<br>2. Click popup action "Issue Certificate for Channel". | Navigates to Usufruct Generator; pre-populates form fields with spatial coordinates and customary land group ID. |
| **`TC-T3-03`** | **F4 (Usufruct Generator) + F3 (Telemetry)** | 1. Submit and certify new Usufruct Certificate.<br>2. Navigate to Telemetry Dashboard. | Telemetry IFRAP Component 3 "Land Rights Security" progress bar increments immediately to reflect updated certificate count. |
| **`TC-T3-04`** | **F3 (Telemetry) + F2 (WebGIS) + F6 (Export API)** | 1. Apply multi-indicator telemetry filter.<br>2. Click "Export Synchronized Package". | Triggers dual export downloading matching CSV telemetry file AND filtered GeoJSON spatial feature layer simultaneously. |
| **`TC-T3-05`** | **F5 (SEO Engine) + F2 (WebGIS Spatial Data)** | 1. Render WebGIS map page `/webgis`.<br>2. Inspect page JSON-LD schema script. | JSON-LD `geo` property dynamically contains bounding box coordinates matching currently active WebGIS map viewport. |
| **`TC-T3-06`** | **F1 (Glassmorphic UI) + F2 (WebGIS) + F3 (Telemetry)** | 1. Toggle UI theme accent from Emerald to Cyan.<br>2. Inspect UI components. | `GlassCard` borders, Mapbox overlay panel highlights, and Telemetry status badges switch accent glow color in unison. |
| **`TC-T3-07`** | **F4 (Digital Ledger) + F2 (WebGIS Camera)** | 1. Search Usufruct Ledger for parcel `Karez-M-104`.<br>2. Click ledger action "Fly to Parcel on Map". | Triggers smooth Mapbox `flyTo` camera animation, centering map canvas on parcel coordinates with high zoom level. |
| **`TC-T3-08`** | **F6 (Rate Limiter API) + F2 (WebGIS Data Stream)** | 1. Trigger API rate limit on live spatial stream.<br>2. Observe WebGIS map state. | Map gracefully degrades to cached local GeoJSON dataset, displaying subtle notice ("Using cached spatial data") without UI failure. |

---

## 7. Tier 4: Real-World Application Scenarios (6 Test Cases)

Simulates complex, end-to-end user workflows matching actual field operations, research presentations, and fiduciary governance.

### Scenario 1: `TC-T4-01` — End-to-End M&E Field Monitor Workflow (Balochistan Karez Assessment)
- **Actor Role**: M&E Field Monitoring Specialist
- **Workflow Steps**:
  1. Field monitor opens application on portable device in Mastung District, Balochistan.
  2. Navigates to `/webgis`, selects "Decolonial ITK Layer" to display customary Karez subsurface water channels.
  3. Selects Karez channel "Karez-Takht-02", inspects flow volume telemetry (12.4 L/s, -35% vs baseline).
  4. Navigates to `/telemetry`, inputs field survey metrics ($H = 0.45$, $A = 0.50$), generating $MPI = 0.225$.
  5. Navigates to `/fiduciary`, inputs land tenure details for 18 customary farming households, generating certified Usufruct Rights Certificate.
  6. Exports combined CSV report and GeoJSON map package for regional review.
- **Assertions**: All steps complete without errors; certificate appears in digital ledger; export files contain complete telemetry and spatial data.

### Scenario 2: `TC-T4-02` — Applied Anthropology Portfolio Presentation Workflow
- **Actor Role**: Applied Anthropology Lead Researcher / Consultant
- **Workflow Steps**:
  1. Researcher launches home page `/` during live client presentation to international water governance agency.
  2. Demonstrates hero quantitative summary cards (14 Karez Systems, Senian MPI Engine, 100% Usufruct Compliance).
  3. Navigates to `/webgis`, toggles between "Technocratic Standard" and "Decolonial ITK" layers to highlight customary water rights erasure by top-down canal projects.
  4. Opens `/telemetry`, adjusts Senian MPI headcount and intensity sliders live to demonstrate capability deprivation modeling ($MPI = H \times A$).
  5. Inspects DOM source code to display structured JSON-LD schema validating academic search indexability.
- **Assertions**: UI maintains smooth 60fps rendering during glassmorphic visual transitions; layer toggles update instantaneously; JSON-LD schema passes validation.

### Scenario 3: `TC-T4-03` — Customary Land Tenure Rights Protection Workflow
- **Actor Role**: Community Indigenous Rights Legal Representative
- **Workflow Steps**:
  1. Representative identifies encroaching infrastructure work near customary Karez channels.
  2. Opens `/fiduciary` page, searches digital ledger for existing customary parcel registrations.
  3. Fills Usufruct Generator form with customary community land boundaries and historical water distribution shares.
  4. Generates new Usufruct Certificate; system computes SHA-256 cryptographic hash and syncs to simulated Firebase ledger.
  5. Reviews real-time compliance log stream confirming verification against customary water law rules.
- **Assertions**: Generated SHA-256 hash is verified unique; ledger record is persistent; compliance log streams `COMPLIANCE_PASSED`.

### Scenario 4: `TC-T4-04` — Spatial Telemetry & IFRAP Component 3 Analytics Review Workflow
- **Actor Role**: Senior M&E Data Analyst
- **Workflow Steps**:
  1. Data analyst loads `/telemetry` dashboard for quarterly IFRAP Component 3 performance evaluation.
  2. Filters dataset by "High Deprivation ($MPI > 0.20$)".
  3. Sorts indicator table by intensity of deprivation ($A$) descending.
  4. Syncs filtered results to WebGIS map to inspect spatial clustering of water insecurity in arid Balochistan basins.
  5. Triggers CSV export via `/api/telemetry/export?min_mpi=0.20` to feed external econometric software.
- **Assertions**: CSV export exactly matches filtered UI dataset row count; progress bar indicators accurately reflect IFRAP sub-project completion status.

### Scenario 5: `TC-T4-05` — Adversarial Field Data Entry & Offline Recovery Workflow
- **Actor Role**: Field Surveyor in Remote Area with Intermittent Connectivity
- **Workflow Steps**:
  1. Surveyor attempts field data entry with device offline (`navigator.onLine = false`).
  2. Surveyor enters malformed out-of-bounds headcount ratio ($H = 2.5$) and extreme text strings into Usufruct form.
  3. System traps validation errors inline, preventing bad data entry.
  4. Surveyor corrects input values ($H = 0.35$, valid parcel ID); submits form while offline.
  5. Certificate is queued in local offline store; network reconnects (`navigator.onLine = true`), auto-syncing record to simulated Firebase backend.
- **Assertions**: Form validation catches invalid inputs cleanly; zero data lost during offline transition; record syncs seamlessly upon network restoration.

### Scenario 6: `TC-T4-06` — Multi-Device Field Tablet Responsiveness Workflow
- **Actor Role**: Mobile Field Inspector using 8-inch Rugged Tablet
- **Workflow Steps**:
  1. Field inspector accesses dashboard on 768px width tablet screen in landscape and portrait orientation.
  2. Interacts via touch gestures with Mapbox map controls, layer toggles, and popups.
  3. Uses touch sliders on `/telemetry` page to adjust Senian MPI parameters.
  4. Verifies glassmorphic containers render smoothly without screen lag or clipped content.
- **Assertions**: Viewport adapts layout cleanly; touch targets maintain min 44x44px touch area; map gestures (pan, pinch-zoom) execute responsively.

---

## 8. Implementation & Automated Test Execution Plan

### Test Runner & Tooling Stack
- **Framework**: Vitest / Playwright or Jest Node-based test runner setup.
- **Location**: `tests/e2e/` and `tests/unit/` directories.
- **Execution Command**: `npm test` or `npx vitest run`.

### Automated Release Verification (`TEST_READY.md`)
Upon completion of test suite execution, the test framework writes `TEST_READY.md` to project root (`C:\Users\Administrator\teamwork_projects\anthropology_portfolio\TEST_READY.md`) containing:
1. Complete 74-test-case execution breakdown.
2. Build verification confirmation (`npm run build` zero-error status).
3. Test suite coverage statistics across Tiers 1-4.
