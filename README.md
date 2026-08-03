# IFRAP AnthropoGIS — Applied Telemetry & WebGIS Platform

A Next.js 16 platform for **World Bank IFRAP Component 3** (Balochistan water
governance): field ethnography capture, a Grievance Redress Mechanism (GRM),
customary-usufruct certificate issuance, a decolonial WebGIS, ESF safeguard
telemetry, and Senian-MPI M&E dashboards — with role-based access control,
PII scrubbing, and offline-first field data collection.

> [!IMPORTANT]
> **Deployment status: demo / prototype.** Authentication is mocked (three
> hardcoded accounts) and data persists to a local JSON file store. This is
> the right shape for stakeholder demos and pilots with **synthetic** data, but
> it is **not** ready to handle real beneficiary PII under World Bank ESF or
> Government of Pakistan data-protection rules. See
> [Production readiness](#production-readiness) before going live.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then set NEXTAUTH_SECRET (see below)
npm run dev                    # http://localhost:3000
```

Generate a session secret for `.env.local` (the app won't boot without one):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Demo accounts (development only)

The login screen shows these **only when `NODE_ENV !== 'production'`**. Password
for all three is `demo123`.

| Email | Role | Sees |
|---|---|---|
| `enumerator@ifrap.gov.pk` | Field Enumerator | Field log, GRM, maps |
| `piu@ifrap.gov.pk` | Provincial PIU | + usufruct issuance, export |
| `director@ifrap.gov.pk` | FPMU Director | + admin console (director-only) |

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build (`output: 'standalone'`) |
| `npm run start` | Serve the production build |
| `npm run lint` | Next.js lint |
| `npm test` | E2E/contract test suite (`tests/run-tests.js`) |

Run the middleware/RBAC drift guard directly:

```bash
node tests/matcher-coverage.test.js
```

---

## Architecture

```
Browser ── Next.js App Router (app/) ── Edge middleware (RBAC gate)
                    │
                    ├── API routes (app/api/*)  ── lib/server/store.ts
                    │     grm · field-logs · fiduciary · export · agent   (→ .data/*.json)
                    │
                    └── MapLibre GL JS (react-map-gl) over a CARTO basemap
```

- **Auth / RBAC** — NextAuth (JWT). `middleware.ts` verifies the session with
  `getToken` and enforces `PROTECTED_ROUTES` from `lib/auth/rbac.ts`. The two
  must stay in sync; `tests/matcher-coverage.test.js` fails if they drift.
- **Persistence** — `lib/server/store.ts` is a file-backed JSON store under the
  gitignored `.data/` directory (atomic writes, per-collection locking). It sits
  behind a repository seam (`getAll/insert/update/transaction`) designed to be
  swapped for Postgres/pgvector **without touching the API routes**.
- **PII** — `lib/privacy/ner-pii-scrubber.ts` scrubs field-log payloads at rest
  and fuzzes GeoJSON coordinates. Offline drafts are AES-256 encrypted in
  IndexedDB and sync to `/api/field-logs` when back online.
- **WebGIS** — real MapLibre GL JS maps on `/webgis` and `/gis-impact`
  (`components/DecolonialMap.tsx`, `components/gis-impact/GisImpactMapper.tsx`).

### Intended production backend (not yet wired)

`docker-compose.yml` and `backend/` define the target production stack —
Express ingest API, PostGIS + pgvector, GeoServer, Redis, on an isolated DB
network. **The frontend does not call this backend today**; it uses its own
Next API routes + file store. Wiring the two (or migrating the file store to
Postgres via the seam) is the main pilot-stage task.

---

## Security posture

Shipped and verified:

- Cryptographic session verification (`getToken`) on every protected route —
  the earlier "accept any bearer string" bypass has been removed.
- `NEXTAUTH_SECRET` is **required**; no hardcoded fallback.
- Security headers in `next.config.js`: Content-Security-Policy (dev-aware,
  allow-lists CARTO tiles + HMR), HSTS, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `poweredByHeader: false`.
- RBAC edge gate with a drift-guard test; demo credentials gated to non-production.

---

## Deployment

The build emits a standalone server (`output: 'standalone'`). Container images
are defined in `Dockerfile.prod` (frontend) and `backend/Dockerfile`; the full
stack is orchestrated by `docker-compose.yml`.

Required environment for the frontend: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
(see [`.env.example`](.env.example)). Replace **all** default credentials in
`docker-compose.yml` with secrets-managed values before any real deployment.

---

## Production readiness

Before this platform can process **real** IFRAP data, the following must close.
These are scoping items, not bugs:

**Blockers**
- Replace mock auth (`lib/auth.ts`) with real SSO (SAML/OIDC to the FPMU/GoP
  identity provider) + MFA + per-user account lifecycle.
- Move off the single-instance file store onto Postgres (seam is ready) and
  wire the frontend to the backend, or consolidate on Next routes + Postgres.
- Replace `docker-compose.yml` default credentials with managed secrets.
- Self-host map tiles (GeoServer) instead of the external CARTO CDN for
  data-locality, and formalize the heuristic PII scrubber into a tested standard.

**Regulatory (require the FPMU's legal/security officers + an accredited assessor)**
- **World Bank ESF/ESS10:** DPIA, data classification & retention policy,
  immutable access/audit logging, end-to-end encryption of grievance data.
- **Government of Pakistan:** in-country data localization, Personal Data
  Protection alignment (lawful basis, consent, subject access, breach
  notification), and NTISB security certification for a `.gov.pk` system.

---

## Repository layout

```
app/                Next.js App Router pages + API routes
components/          UI (dashboards, map, field log, GRM, usufruct, admin)
lib/
  auth/             RBAC matrix + role helpers
  server/store.ts   file-backed persistence (Postgres-swappable seam)
  privacy/          PII scrubber
  agent/ · rag/     LangGraph agent + lexical retriever (template-based)
middleware.ts       Edge RBAC gate (keep matcher in sync with rbac.ts)
backend/            Intended production backend (Express + Python worker + SQL)
tests/              E2E/contract suite + matcher drift guard
docker-compose.yml  Target production stack (frontend + backend + PostGIS + GeoServer + Redis)
```
