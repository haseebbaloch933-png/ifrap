# R1 Architectural Analysis: Core Infrastructure & Identity

**Role:** Explorer 1 (Core Infra & Identity)  
**Target:** World Bank Component 3 Anthropological Monitoring Platform  
**Date:** 2026-08-02  
**Working Directory:** `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_wb_1`

---

## Executive Summary

This report presents an exhaustive architectural analysis of the current codebase for Requirement **R1: Phase 1: Core Infrastructure & Identity**. The R1 requirements demand:
1. Next.js 15 App Router architecture with clean compilation.
2. Vercel Edge Middleware SAML 2.0 / OIDC SSO integration enforcing strict Role-Based Access Control (RBAC) across public and protected routes.
3. PostgreSQL database provisioned with PostGIS and pgvector extensions for spatial vector persistence.

---

## 1. Next.js 15 App Router Structure Analysis

### Current State
* **Version:** `package.json` specifies `"next": "^14.2.15"`, `"react": "^18.3.1"`, `"react-dom": "^18.3.1"`. Execution of `npm run build` confirms `▲ Next.js 14.2.35`.
* **App Router Structure:** The project currently implements Next.js App Router under `app/`:
  - `app/layout.tsx`: Root layout with `outfit` font, `AccessibilityProvider`, `I18nProvider`, `RBACProvider`, `AuthProvider`, `NavbarHeader`, and `JSON-LD` script.
  - `app/page.tsx`: Home page with glassmorphic cards and navigation links.
  - `app/webgis/page.tsx`: Decolonial MapLibre GIS viewer.
  - `app/telemetry/page.tsx`: Senian MPI capability reduction telemetry dashboard.
  - `app/fiduciary/page.tsx`: Usufruct rights certificates & digital ledger UI.
  - `app/grm/page.tsx`: Grievance Redress Mechanism ticketing portal.
  - `app/admin/page.tsx`: FPMU Director admin control panel.
  - `app/login/page.tsx`: NextAuth login page.
  - `app/api/`: API routes for `auth/[...nextauth]`, `export`, `fiduciary`, and `telemetry`.
* **Build Status:** Verified via `npm run build` (`cmd /c "npm run build"`). The project compiles **successfully** with 0 errors, generating 11 static pages and 4 dynamic routes.

### Required Refactoring / Upgrades for R1
1. **Dependency Upgrade:** Upgrade `package.json` from Next.js 14 (`^14.2.15`) to Next.js 15 (`^15.0.0` or `15.x`) and update `react` / `react-dom` to compatible versions (`^19.0.0` or `18.3.x` per Next 15 release specs).
2. **Async Request Handling:** Next.js 15 requires `params`, `searchParams`, `headers()`, and `cookies()` to be treated as `Promise` types. Existing dynamic routes and API handlers must be audited for `await params` compatibility.
3. **`next.config.js` Cleanup:** Remove deprecated options like `swcMinify` which are enabled by default in Next.js 15.

---

## 2. Vercel Edge Middleware SAML 2.0 / OIDC SSO & RBAC Analysis

### Current State
* **Missing Edge Middleware:** No `middleware.ts`, `middleware.js`, or `lib/auth/middleware.ts` exists in the repository.
* **Legacy Authentication:** The application relies on NextAuth v4 (`next-auth@^4.24.15`) configured in `lib/auth.ts` with a mock `CredentialsProvider` accepting hardcoded emails (`enumerator@ifrap.gov.pk`, `piu@ifrap.gov.pk`, `director@ifrap.gov.pk`).
* **Legacy Route Protection:** Protection is enforced client-side or per-page:
  - `app/admin/page.tsx` checks `getServerSession(authOptions)` and issues `redirect('/telemetry')`.
  - `lib/rbac-context.tsx` defines client-side `RoleGate` components based on `FIELD_ENUMERATOR`, `PROVINCIAL_PIU`, and `FPMU_DIRECTOR`.
* **Vulnerability / Architectural Gap:** Unauthenticated or unauthorized users can bypass edge routing. Edge-level SAML 2.0 / OIDC SSO verification is missing.

### R1 Implementation Plan for Edge Middleware
1. **Edge Middleware File:** Create `middleware.ts` at project root (or `lib/auth/middleware.ts` imported in `middleware.ts`).
2. **SAML 2.0 / OIDC SSO Edge Integration:**
   - Implement JWT / session token parsing at Vercel Edge.
   - Support SAML 2.0 / OIDC claims decoding to extract user identity and assigned RBAC role (`FIELD_ENUMERATOR`, `PROVINCIAL_PIU`, `FPMU_DIRECTOR`).
3. **Route Guard Rules:**
   - **Public Routes:** `/login`, `/api/auth/*`, `/_next/*`, `/favicon.ico`, `/robots.txt`.
   - **Protected Routes (Authenticated):** `/webgis`, `/telemetry`, `/fiduciary`, `/grm`, `/api/*`.
   - **Role-Restricted Protected Routes (FPMU_DIRECTOR / PROVINCIAL_PIU):** `/admin`, `/api/export`, `/api/fiduciary`.
   - **Behavior:** Unauthenticated requests to protected routes redirect to `/login?callbackUrl=...`. Unauthorized role access returns 403 Forbidden or redirects to `/telemetry`.

---

## 3. PostgreSQL with PostGIS and pgvector Persistence Analysis

### Current State
* **Database Schema (`backend/db/init_schema.sql`):**
  - Enables PostGIS (`CREATE EXTENSION IF NOT EXISTS postgis;`) and UUID (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`).
  - Defines Land Administration Domain Model (LADM ISO 19152) tables: `la_versioned_object`, `la_party`, `la_spatial_unit` (with `GEOMETRY(Geometry, 4326)` and GiST index `idx_la_spatial_unit_geom`), `la_ba_unit`, `la_rrr`, `la_source`.
* **Missing pgvector Extension:** `backend/db/init_schema.sql` does NOT enable `pgvector` (`CREATE EXTENSION IF NOT EXISTS vector;`).
* **Missing Vector Schema:** No tables or vector embedding columns (e.g. `vector(1536)` or `vector(768)`) exist for storing vector embeddings of field log notes, qualitative narrative reports, or ESF safeguard compliance documents.
* **Docker Image Gap (`docker-compose.yml`):** The `db-postgis` service uses standard image `postgis/postgis:15-3.3`, which does not include the `pgvector` extension by default.

### R1 Implementation Plan for Database Schema
1. **Docker Service Upgrade:** Update `docker-compose.yml` to use an image supporting both PostGIS and pgvector (e.g. `ankane/pgvector` or custom `pgvector` image with PostGIS).
2. **SQL Migration Script (`backend/db/init_schema.sql` & `lib/db/schema.sql`):**
   - Add `CREATE EXTENSION IF NOT EXISTS vector;`.
   - Create vector embedding table for qualitative field logs and RAG documents:
     ```sql
     CREATE TABLE IF NOT EXISTS anthropological_field_vectors (
         vector_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
         spatial_unit_id UUID REFERENCES la_spatial_unit(spatial_unit_id),
         party_id UUID REFERENCES la_party(party_id),
         content_summary TEXT NOT NULL,
         embedding vector(1536), -- OpenAI / Vercel AI SDK embedding dimension
         metadata JSONB,
         created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
     );
     CREATE INDEX IF NOT EXISTS idx_field_vectors_hnsw ON anthropological_field_vectors USING hnsw (embedding vector_cosine_ops);
     ```

---

## 4. Matrix of Existing Code vs. Implementation Needed for R1

| Component | Existing Code | Status / Action Needed for R1 |
|---|---|---|
| **Next.js Version** | Next.js `14.2.15` in `package.json` | **Upgrade required:** Upgrade to `next@^15.0.0`, `react@^19.0.0` or compatible. |
| **App Router Routes** | `app/` contains 7 pages & 4 API routes | **Audit required:** Update dynamic page/API routes for async `params`/`headers` in Next 15. |
| **Edge Middleware** | None (`middleware.ts` missing) | **New implementation required:** Create `middleware.ts` with Edge SAML 2.0 / OIDC SSO & RBAC guards. |
| **SAML 2.0 / OIDC SSO** | `next-auth` Credentials provider with mock hardcoded emails | **Refactor required:** Add Edge OIDC/SAML JWT verification and claims parsing. |
| **PostgreSQL + PostGIS** | `backend/db/init_schema.sql` with PostGIS & LADM schema | **Existing & functional:** Retain LADM tables (`la_party`, `la_spatial_unit`, etc.). |
| **pgvector Extension** | Missing in SQL schema & Docker image | **New implementation required:** Enable `vector` extension, create `anthropological_field_vectors` with HNSW index, update Docker container. |
| **Build Integrity** | `npm run build` passes with zero errors | **Verified:** Clean build confirmed on current codebase. |

---

## 5. Conclusion & Recommendations for Implementation

1. **Phase 1 Infrastructure Task Checklist:**
   - Update `package.json` dependencies for Next.js 15.
   - Write `middleware.ts` at repository root with Vercel Edge Middleware handling SAML 2.0 / OIDC SSO tokens and public vs protected route enforcement.
   - Update `backend/db/init_schema.sql` (and add TypeScript DB client in `lib/db/`) to enable `vector` extension and define `anthropological_field_vectors` table with HNSW indexing.
   - Update `docker-compose.yml` `db-postgis` container configuration to support `pgvector`.
2. **Build Verification:** Run `cmd /c "npm run build"` post-upgrade to confirm zero compilation or routing errors.
