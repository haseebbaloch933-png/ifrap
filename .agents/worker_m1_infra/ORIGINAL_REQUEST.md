## 2026-08-02T04:13:33Z
You are Worker M1 (Core Infrastructure & Identity) for the World Bank Component 3 Anthropological Monitoring Platform.
Working Directory: C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m1_infra

Your instructions:
1. Read Explorer 1's analysis at C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_wb_1\analysis.md and SCOPE.md at C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\orchestrator\SCOPE.md.
2. Implement Requirement R1:
   a. Next.js 15 App Router architecture: Update package.json to Next.js 15 (^15.0.0) or ensure Next 15 compatibility across App Router routes and next.config.js.
   b. Vercel Edge Middleware SAML 2.0 / OIDC SSO RBAC Middleware:
      - Create C:\Users\Administrator\teamwork_projects\anthropology_portfolio\middleware.ts (with edge runtime matcher guarding private routes: `/esf-telemetry`, `/field-log`, `/grm`, `/gis-impact`, `/me-results`, `/telemetry`, `/usufruct`, `/webgis`, `/api/export`, `/api/agent`).
      - Implement SAML 2.0 / OIDC SSO token extraction and RBAC role checks (`FIELD_ENUMERATOR`, `PROVINCIAL_PIU`, `FPMU_DIRECTOR`). Allow public routes (`/`, `/login`, `/_next`, `/public`).
      - Create `lib/auth/saml-edge.ts` and `lib/auth/rbac.ts`.
   c. Database schema with PostGIS and pgvector:
      - Update `backend/db/init_schema.sql` with `CREATE EXTENSION IF NOT EXISTS vector;` and `CREATE EXTENSION IF NOT EXISTS postgis;`.
      - Create table schemas for `qualitative_field_logs` (including `embedding vector(1536)` and `location GEOMETRY(Point, 4326)`) and `anthropological_field_vectors`.
3. Verify your implementation by running `npm run build` via command tool. Ensure clean compilation.
4. Document all changed files, build results, and verification in C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\worker_m1_infra\handoff.md.
5. Send a message to parent with your summary and handoff report path.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
