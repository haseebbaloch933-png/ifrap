# Explorer 2 Analysis: Backend API Endpoints & M&E Telemetry Integration

**Project**: Next.js Applied Anthropology Portfolio & Balochistan IFRAP M&E Telemetry Dashboard  
**Working Directory**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_2`  
**Date**: 2026-07-31  
**Investigator**: Explorer 2 (Read-Only Analysis)

---

## Executive Summary

This investigation analyzes the backend API landscape, telemetry components, and data structure requirements for the Anthropology Portfolio frontend refactoring project. The system comprises two distinct API layers: a Next.js App Router API endpoint (`app/api/export/route.ts`) serving client-side CSV/GeoJSON/JSON streams, and a standalone Express microservice (`backend/ingest.js` & `backend/exports.js`) coupled with a Python background worker (`backend/worker.py`) connected to PostgreSQL/PostGIS and Redis.

To support stakeholder requirements for Monitoring & Evaluation (M&E) analytics, we have identified existing data structures and specified missing interfaces for:
1. **Displaced households assisted** (ESS5 Involuntary Resettlement)
2. **Compensation budget burn rates** (Fiduciary/Financial tracking)
3. **Pending vs resolved GRM (Grievance Redress Mechanism) tickets** (ESS10 Compliance)

---

## 1. Backend API Endpoint Architecture

### 1.1 Dual API Layer Mapping

| API Layer | Primary Location | Port / Host | Supported Endpoints | Key Responsibilities & Data Handled |
|---|---|---|---|---|
| **Next.js App Router API** | `app/api/export/route.ts` | 3000 (Next server) | `GET /api/export?type=telemetry`<br>`GET /api/export?type=karez`<br>`GET /api/export?type=usufruct` | - Fast client-side dataset streaming.<br>- `telemetry`: Generates CSV of IFRAP district population, Karez count, Senian MPI ($H \times A$).<br>- `karez`: Generates GeoJSON FeatureCollection of spatial points and routes.<br>- `usufruct`: Filters `lib/firebase-sim.ts` store for active usufruct land certificates. |
| **Express Backend App** | `backend/ingest.js`<br>`backend/exports.js` | 4000 (Express process) | `GET /health`<br>`POST /webhook`<br>`POST /api/v2/ingest`<br>`GET /api/export/csv/usufruct`<br>`GET /api/export/pdf/grm` | - KoboToolbox survey payload ingestion & validation.<br>- Redis queuing into `kobo_payloads`.<br>- PostGIS database queries (`la_rrr`, `la_party`, `la_source`).<br>- Server-side PDF generation (`pdfkit`) for ESS10 GRM reports.<br>- Server-side CSV generation (`json2csv`) for ESS5 Usufruct ledgers. |
| **Python Worker** | `backend/worker.py` | Background | Polling Redis list `kobo_payloads` | - Converts KoboToolbox `geopoint`, `geotrace`, `geoshape` strings to PostGIS WKT (`POINT`, `LINESTRING`, `POLYGON`).<br>- Executes atomic database transactions into `la_party`, `la_spatial_unit`, `la_rrr`. |

### 1.2 Endpoint Analysis & Security Mechanisms

#### Next.js Route (`app/api/export/route.ts`)
- **Input Sanitization & Path Traversal Guard**:
  ```typescript
  // Line 12-15 in app/api/export/route.ts
  const fileCheck = validateFilePath(rawType);
  if (!fileCheck.valid) {
    return NextResponse.json({ error: 'PATH_TRAVERSAL_DETECTED' }, { status: 400 });
  }
  ```
  `validateFilePath` (from `lib/firebase-sim.ts`) rejects parameters containing `..`, `/`, or `\`.
- **Query Parameter Whitelisting**:
  Supported types are strictly constrained to `['telemetry', 'karez', 'usufruct']`. Any other type yields a 400 status with `{ error: 'UNSUPPORTED_EXPORT_FORMAT' }`.
- **Headers & Dispositions**:
  - `telemetry` -> `Content-Type: text/csv; charset=utf-8`, attachment `ifrap_telemetry_export.csv`.
  - `karez` -> `Content-Type: application/json`, attachment `karez_spatial_data.geojson`.
  - `usufruct` -> `Content-Type: application/json`, attachment `usufruct_ledger_certificates.json`.

#### Express Microservice (`backend/ingest.js` & `backend/exports.js`)
- **Router Mounting**:
  In `backend/ingest.js` (line 101): `app.use('/api/export', exportsRouter);`
- **Sub-routes**:
  - `GET /api/export/csv/usufruct`: Queries table `la_rrr` joined with `la_party` where `is_active = TRUE`, formats CSV with fields `rrr_id`, `rrr_type`, `stakeholder_name`, `cnic_number`, `share`, `approval_status`, `valid_from`.
  - `GET /api/export/pdf/grm`: Queries table `la_source` joined with `la_rrr` where `document_type = 'GRM_Record'`, streams PDF with incident summaries (`source_id`, `approval_status`, `uploaded_at`, `file_path`).

#### Architectural Recommendation for API Consolidation
Currently, `/api/export` exists in both Next.js and Express. In frontend production deployments where Next.js runs as the main web application:
- Next.js can act as a reverse proxy via `next.config.js` rewrites (forwarding `/api/v2/*` and `/api/export/pdf/*` to Express at `http://localhost:4000`), or
- Next.js API routes can import shared backend library modules for unified data access while handling offline fallback gracefully.

---

## 2. M&E Analytics Data Structures

### 2.1 Existing Data Models

Currently, `components/TelemetryDashboard.tsx` and `lib/ifrap-data.ts` model district-level capability metrics and progress bars:
- **`IFRAPDistrictData`** (`lib/ifrap-data.ts:25-37`):
  Contains `population`, `karezSystemsCount`, `rehabilitatedKarezes`, `beneficiaryHouseholds`, `headcountRatio`, `povertyIntensity`, `progressBars` (water infrastructure, customary governance, climate resilience, economic capability), and `mirabCouncilStatus`.
- **Database Schema** (`backend/db/init_schema.sql`):
  - `la_party`: Party records (`Individual`, `Household`, `Community`, `Organization`, `VRC`) with `is_vulnerable` boolean.
  - `la_spatial_unit`: Land parcels and flood zones (`area_sqm`, `district`, `tehsil`, `union_council`).
  - `la_rrr`: Rights, Restrictions, and Responsibilities (`rrr_type IN ('Ownership', 'Usufruct', 'Customary_Right', 'Tenancy', 'Restriction')`, `approval_status`).
  - `la_source`: Supporting documents (`document_type IN ('Survey_Payload', 'CNIC_Copy', 'Customary_Deed', 'VRC_Resolution', 'GRM_Record')`).

### 2.2 Missing M&E Analytics Data Structures & Recommended Specifications

To meet M&E dashboard requirements, three targeted data structures must be added to the telemetry module (`lib/ifrap-data.ts` or a new `lib/me-analytics.ts` module):

```typescript
/**
 * 1. Displaced Households Assisted (World Bank ESS5 Compliance)
 */
export interface DisplacedHouseholdsWidgetData {
  totalDisplacedHouseholds: number;
  assistedHouseholdsCount: number;
  pendingAssistanceCount: number;
  transitionalHousingAllocated: number;
  vulnerableHouseholdsCount: number;
  assistanceTypeBreakdown: {
    resettlementGrant: number;
    livelihoodRestoration: number;
    temporaryShelter: number;
  };
  districtBreakdown: Array<{
    districtId: string;
    districtName: string;
    displacedCount: number;
    assistedCount: number;
    completionPercentage: number;
  }>;
}

/**
 * 2. Compensation Budget Burn Rates (Fiduciary Financial Progress)
 */
export interface CompensationBudgetBurnData {
  totalAllocatedBudgetPKR: number;    // e.g. 500,000,000 PKR
  disbursedAmountPKR: number;        // e.g. 345,000,000 PKR
  encumberedBudgetPKR: number;       // Committed funds
  remainingBudgetPKR: number;
  burnRatePercentage: number;        // (disbursed / allocated) * 100
  quarterlyBurnHistory: Array<{
    quarter: string;                 // e.g. "2026-Q1"
    targetDisbursementPKR: number;
    actualDisbursementPKR: number;
  }>;
  categoryBreakdown: {
    landAcquisitionPKR: number;
    cropLossCompensationPKR: number;
    customaryWaterRightsCompensationPKR: number;
    livelihoodRestorationPKR: number;
  };
}

/**
 * 3. Pending vs Resolved GRM (Grievance Redress Mechanism) Tickets (ESS10)
 */
export interface GRMTicketAnalyticsData {
  totalTicketsCount: number;
  pendingTicketsCount: number;
  inReviewTicketsCount: number;
  resolvedTicketsCount: number;
  resolutionRatePercentage: number;  // (resolved / total) * 100
  avgResolutionDays: number;
  categoryBreakdown: Array<{
    category: 'Usufruct_Dispute' | 'Water_Allocation' | 'Compensation_Delay' | 'Environmental_Damage';
    total: number;
    resolved: number;
    pending: number;
  }>;
  severityBreakdown: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentTickets: Array<{
    ticketId: string;
    district: string;
    category: string;
    status: 'Pending' | 'In_Review' | 'Resolved';
    submittedAt: string;
    resolvedAt?: string;
  }>;
}
```

---

## 3. Real-Time & Offline Fetch Integration Architecture

### 3.1 Widget Fetch & Offline Fallback Strategy

To build resilient React/Next.js dashboard widgets consuming `/api/export` or `/api/me-analytics`:

```
┌─────────────────────────────────────────────────────────────┐
│                 React Telemetry Widget Component            │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
       [ Online Fetch ]              [ Offline / Fallback ]
  fetch('/api/export?type=telemetry')    Import local mock dataset
  or fetch('/api/export/pdf/grm')        (lib/ifrap-data.ts)
               │                               │
               ├─────── Client Offline? ───────┤
               │   Network Error / Timeout?    │
               ▼                               ▼
     Parse CSV/JSON/PDF             Display Cached Data with
    Update Component State           "Offline Mode" Badge
```

### 3.2 Code Design Pattern for Real-Time Async Fetching Hook

```typescript
// Proposed custom hook: lib/hooks/useM&EAnalytics.ts
import { useState, useEffect } from 'react';
import { IFRAP_DISTRICTS } from '@/lib/ifrap-data';

export function useMEAnalytics() {
  const [data, setData] = useState<any>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchAnalytics() {
      try {
        setLoading(true);
        // Attempt to fetch from Next.js export route or Express API
        const response = await fetch('/api/export?type=telemetry', {
          headers: { 'Accept': 'text/csv' },
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const csvText = await response.text();
        const parsed = parseTelemetryCsv(csvText);
        
        if (isMounted) {
          setData(parsed);
          setIsOffline(false);
          setError(null);
        }
      } catch (err: any) {
        console.warn('[M&E Telemetry] Network fetch failed, falling back to local dataset:', err.message);
        if (isMounted) {
          // Fallback to local static/simulated store
          setData(getLocalFallbackAnalytics());
          setIsOffline(true);
          setError(null); // Silent recovery with UI badge
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAnalytics();
    
    // Real-time polling every 15 seconds
    const interval = setInterval(fetchAnalytics, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, isOffline, loading, error };
}
```

### 3.3 Offline & Fallback Handling Verification
1. **Network Disconnection Simulation**: If the client browser loses connection or Express is down, the widget catches the exception and immediately renders data from local constants.
2. **Visual Offline Indicator**: Widgets display a glowing amber/slate pill (`Offline Mode • Cached Data`) when operating from fallback state.
3. **Data Integrity**: Local fallback data strictly mirrors the production interface contract so UI layouts do not break or re-flow when transitioning between online and offline modes.

---

## 4. Summary of Recommendations for Implementation Team

1. **API Routing Hardening**: Maintain Next.js `app/api/export/route.ts` as the primary client-facing API endpoint for fast frontend exports, while configuring optional proxying to Express `backend/exports.js` for server-generated PDFs.
2. **Widget Data Structure Provisioning**: Create `lib/me-analytics-data.ts` providing standard types and initial fallback datasets for:
   - Displaced households assisted
   - Compensation budget burn rates
   - Pending vs resolved GRM tickets
3. **Widget Component Expansion**: Refactor `components/TelemetryDashboard.tsx` to include an "M&E Safeguards Analytics" section rendering these 3 widgets with real-time fetch and offline fallback capabilities.
