# Original User Request

## Initial Request — 2026-07-23T18:50:03Z

<USER_REQUEST>
# Teamwork Project Prompt

Build a comprehensive Next.js WebGIS Portfolio and M&E Telemetry Dashboard tailored for a freelance applied anthropologist, integrating Mapbox, Firebase, and mathematical poverty reduction models.

Working directory: `~/teamwork_projects/anthropology_portfolio`
Integrity mode: demo

## Requirements

### R1. Glassmorphic UI & Architecture
Generate the Next.js App Router structure with strict TypeScript. Implement a "Google Antigravity Premium" glassmorphic aesthetic using Tailwind CSS (translucent panels, background blurs) and Framer Motion for transitions.

### R2. Decolonial WebGIS Mapbox Component
Construct a WebGIS map using Mapbox GL JS (`components/DecolonialMap.tsx`). It must parse the Balochistan archaeological route coordinates and implement a toggle between a "Technocratic Standard" and "Decolonial ITK Layer".

### R3. Telemetry & Logic Engine
Build the M&E telemetry interface implementing the Senian MPI (Multidimensional Poverty Index) capability reduction formulas. Bind these real-time visual progress bars to the IFRAP Component 3 data modules.

### R4. Security & Database (Fiduciary Shield)
Create the Usufruct Rights Certificates generator component (`components/UsufructGenerator.tsx`). Connect it to a simulated Firebase backend to track compliance validation logs with a digital ledger UI.

### R5. SEO & Optimization
Ingest metadata and structured JSON-LD schemas into the Next.js layout to maximize organic search indexing for freelance consulting gigs.

## Acceptance Criteria

### Programmatic Verification
- [ ] The Next.js application compiles successfully without TypeScript errors (`npm run build`).
- [ ] `components/DecolonialMap.tsx` exists, imports `mapbox-gl`, and contains the layer toggle logic.
- [ ] `components/UsufructGenerator.tsx` exists and correctly implements the simulated synchronization logic.
- [ ] The `package.json` includes `next`, `react`, `tailwindcss`, `mapbox-gl`, and `framer-motion`.

### Visual & Structural Criteria
- [ ] The styling explicitly utilizes Tailwind's `backdrop-blur` and transparency utilities for the glassmorphic effect.
- [ ] The telemetry page mathematically calculates and displays the MPI capability reduction as specified in the framework.
</USER_REQUEST>

## Follow-up — 2026-07-31T05:37:14Z

<USER_REQUEST>
# Teamwork Project Prompt

Build a robust Node.js/Python ETL pipeline that ingests KoboToolbox v2 REST API survey payloads, buffers them in Redis, and transforms spatial geometries into a PostGIS database for the IFRAP Component 3 Digital Oversight Platform.

Working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Integrity mode: development

## Requirements

### R1. Express Webhook Listener
Create a Node.js Express endpoint (e.g., `backend/ingest.js`) that receives raw JSON payloads from KoboToolbox mobile surveys, validates the basic structural integrity of the payload, and pushes the raw payload onto a Redis queue.

### R2. Python ETL Processing Worker
Create a Python consumer script (e.g., `backend/worker.py`) that polls the Redis queue. The worker must extract CNIC, respondent name, and raw spatial strings (geopoint, geotrace, geoshape) from the payload.

### R3. Geometry Parsing and PostGIS Upserts
The Python worker must include a parsing routine to convert KoboToolbox spatial strings into valid PostGIS Well-Known Text (WKT). It must then execute atomic database transactions to upsert the data into the existing `la_party`, `la_spatial_unit`, and `la_rrr` tables.

## Acceptance Criteria

### Programmatic Verification
- [ ] `npm run start` (or equivalent) successfully boots the Express ingestion server.
- [ ] A test script (`backend/test_payload.js`) successfully submits a mock KoboToolbox payload containing a "geoshape" string to the ingestion endpoint.
- [ ] The Python worker successfully connects to Redis, consumes the payload, and prints a success log indicating the spatial polygon was formatted into WKT correctly.
- [ ] The codebase contains no syntax errors and all dependencies (express, redis, psycopg2) are documented in package.json/requirements.txt.
</USER_REQUEST>

## Follow-up — 2026-07-31T06:11:18+05:00

<USER_REQUEST>
# Teamwork Project Prompt

Refactor the Next.js React frontend to integrate the new backend APIs, implement WCAG 2.1 AA accessibility (Urdu localization), and upgrade the MapLibre GL JS map to support GeoServer vector tile streaming and toggleable spatial layers.

Working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Integrity mode: development

## Requirements

### R1. GIS Visualization Enhancements
Refactor `components/DecolonialMap.tsx` to integrate GeoServer vector tile sources. Implement interactive, toggleable spatial layers (historical 2022 flood extents, active river basin buffer zones, infrastructure reconstruction sites, and land parcel tenure status).

### R2. Real-time M&E Analytics Widgets
Build and integrate dashboard widgets that fetch data from the Phase 4 Node.js APIs (e.g., `/api/export`). Display metrics such as total displaced households assisted, compensation budget burn rates, and pending versus resolved GRM tickets.

### R3. Accessibility and Localization
Implement WCAG 2.1 AA accessibility features across the frontend. Add an Urdu language localization toggle (i18n) and a high-contrast styling mode for visually impaired users.

### R4. Role-Based Access Control (RBAC) Interface
Implement a frontend RBAC system to differentiate views for field enumerators, provincial PIU officers, and FPMU directors (e.g., hiding financial burn rate widgets from enumerators).

## Acceptance Criteria

### Programmatic Verification
- [ ] `npm run build` compiles the Next.js application successfully without TypeScript or ESLint errors.
- [ ] The `DecolonialMap` component includes layer toggle state management and GeoServer source bindings.
- [ ] The application includes a functional i18n/localization context for switching between English and Urdu strings.
- [ ] A mock test script can successfully mount the M&E analytics widgets without crashing.
</USER_REQUEST>

## Follow-up — 2026-07-31T11:42:28Z

<USER_REQUEST>
# Teamwork Project Prompt — Draft

Conduct an exhaustive architectural code audit and critical survey of the IFRAP Digital Oversight Platform codebase against the "Comprehensive Architectural and Regulatory Research Strategy" PDF. Identify any gaps between the implemented codebase and the formal regulatory/technical specifications, and actively write code to fix any missing compliance requirements.

Working directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio
Integrity mode: demo

## Requirements

### R1. Codebase Gap Analysis
Analyze the Next.js, Node.js, and Python codebase against the provided PDF to identify missing components (e.g., `docker-compose.yml`, PostGIS migrations, NITB WAF headers, ESS5/ESS10 compliance reports).

### R2. Compliance Remediation
Actively generate and modify code to fix all identified compliance gaps to ensure the system perfectly matches the GoP NITB and World Bank ESS5/ESS10 architectural standards defined in the PDF.

### R3. Visual UI Verification
After implementing the backend/infrastructure fixes, you must invoke the `browser` subagent to visually confirm that the web dashboard remains fully functional, WCAG 2.1 AA accessible, and that the spatial mapping layers render correctly.

## Acceptance Criteria

### Programmatic Verification
- [ ] A final Markdown report (`compliance_audit_report.md`) is generated listing all identified gaps and the specific code changes made to fix them.
- [ ] `npm run build` compiles the Next.js application successfully without errors after all fixes are applied.
- [ ] The `node backend/test_security_audit.js` script exits with code 0, confirming OWASP ASVS Level 2 compliance.
- [ ] The `browser` QA agent successfully navigates to `http://localhost:3000`, confirms the dashboard loads without errors, and captures visual proof.
</USER_REQUEST>

## Follow-up — 2026-08-02T04:07:30+05:00

<USER_REQUEST>
Implement the World Bank Component 3 Anthropological Monitoring Platform ("Antigravity AI Agent Ecosystem") as detailed in the provided architectural PDF. The platform must transition the existing Next.js portfolio into an enterprise-grade, offline-first Progressive Web App (PWA) with Vercel Edge SSO middleware, PostGIS/pgvector persistence, and an autonomous AI agent orchestration layer for safeguard compliance.

Working directory: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio`
Integrity mode: demo

## Requirements

### R1. Phase 1: Core Infrastructure & Identity
Implement Next.js 15 App Router architecture with Vercel Edge Middleware SAML 2.0 / OIDC SSO integration enforcing strict Role-Based Access Control (RBAC). Provision PostgreSQL with PostGIS and pgvector extensions.

### R2. Phase 2: Offline PWA & Data Privacy
Implement an offline-first PWA using Service Workers for caching and IndexedDB for local AES-256 encrypted storage. Implement an automated PII anonymization pipeline using Named Entity Recognition (NER) to scrub personal data before backend synchronization.

### R3. Phase 3: AI Agent Orchestration
Integrate the Vercel AI SDK and LangGraph to create the Antigravity Agent. Enable semantic RAG queries over pgvector embeddings for qualitative field logs.

### R4. Phase 4: ESF Safeguard Modules
Develop the domain-specific modules: ESF Telemetry Portal, Field Anthropologist Log, GRM Ticketing Center, GIS Impact Mapper, and M&E Results Engine.

## Acceptance Criteria

### Infrastructure & Security
- [ ] Vercel deployment builds successfully with zero routing errors.
- [ ] All public routes are blocked by the SAML edge middleware guard.
- [ ] PII scrubbing pipeline successfully redacts names/coordinates before database insertion.

### Offline & Agent Functionality
- [ ] Offline form submissions successfully persist to local IndexedDB and sync upon reconnection.
- [ ] Semantic vector RAG queries return relevant historical field logs using pgvector.
</USER_REQUEST>

