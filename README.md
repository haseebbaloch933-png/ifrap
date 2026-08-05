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

- **Auth / RBAC** — NextAuth (JWT), SSO-ready. Set `OIDC_ISSUER` /
  `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` to federate login to a real OpenID
  Connect identity provider (the FPMU/GoP IdP); leave them unset for the demo
  email/password login. In production, configuring SSO removes the demo
  password provider entirely. Roles come from a configurable IdP claim
  (default `role`), falling back to email-pattern mapping and ultimately the
  least-privileged role. `middleware.ts` verifies the session with `getToken`
  and enforces `PROTECTED_ROUTES` from `lib/auth/rbac.ts`; the two must stay in
  sync (`tests/matcher-coverage.test.js` fails if they drift).
- **Audit log** — `lib/server/audit-log.ts` records a hash-chained,
  tamper-evident entry for every access to the sensitive routes (GRM,
  fiduciary, field-logs). Directors read it and its chain-integrity status at
  `/api/audit-log` and on the Admin dashboard; `npm run verify:audit` proves
  any edit/reorder/deletion of a past entry is detected.
- **Persistence** — `lib/server/store.ts` is a dispatcher behind a repository
  seam (`getAll/insert/update/transaction`). It selects the backend by env:
  - `DATABASE_URL` **unset** → file store (`lib/server/file-store.ts`) under the
    gitignored `.data/` dir (atomic writes, per-collection lock) — the dev default.
    **Not safe across more than one running instance** — in production
    without `DATABASE_URL`, the app refuses to write (throws on the first
    attempted write) unless `ACKNOWLEDGE_SINGLE_INSTANCE_STORE=true` is
    explicitly set.
  - `DATABASE_URL` **set** → Postgres adapter (`lib/server/pg-store.ts`):
    concurrency-safe (per-collection advisory locks), multi-instance — the pilot
    target. Switching is a pure env change; **no route/component code changes**.
- **PII** — `lib/privacy/ner-pii-scrubber.ts` scrubs field-log payloads at rest
  and fuzzes GeoJSON coordinates. Offline drafts are AES-256 encrypted in
  IndexedDB and sync to `/api/field-logs` when back online.
- **WebGIS** — real MapLibre GL JS maps on `/webgis` and `/gis-impact`
  (`components/DecolonialMap.tsx`, `components/gis-impact/GisImpactMapper.tsx`).

An earlier Express + Python + Redis ETL pipeline and a GeoServer tile server
were removed from this repository — they were fully built but never called by
the shipped app (see the audit report referenced in git history). The app
talks to Postgres directly through its own persistence seam; there is no
separate backend API layer.

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

The build emits a standalone server (`output: 'standalone'`). The frontend
container image is defined in `Dockerfile.prod`; `docker-compose.yml`
orchestrates it alongside a Postgres+PostGIS+pgvector database.

Required environment for the frontend: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
(see [`.env.example`](.env.example)). Replace **all** default credentials in
`docker-compose.yml` with secrets-managed values before any real deployment.

---

## Production readiness

Before this platform can process **real** IFRAP data, the following must close.
These are scoping items, not bugs:

**Blockers**
- ~~Replace mock auth with real SSO~~ **(wired)** — `lib/auth.ts` enables a
  real OIDC provider when `OIDC_ISSUER`/`OIDC_CLIENT_ID`/`OIDC_CLIENT_SECRET`
  are set, and drops the demo password provider in production. Remaining: point
  it at the actual FPMU/GoP identity provider and confirm MFA + per-user
  account lifecycle are enforced there (IdP-side, not app-side).
- ~~Move off the single-instance file store onto Postgres~~ **(started)** — a
  Postgres adapter now sits behind the seam and turns on via `DATABASE_URL`
  (see [Pilot: Postgres migration](#pilot-postgres-migration)); the file store
  now also refuses to write unattended in a production deployment without a
  database configured (`ACKNOWLEDGE_SINGLE_INSTANCE_STORE`). Remaining: run
  the Postgres path against the pilot DB, then design a normalized domain schema
  for production if the generic JSONB store isn't sufficient long-term.
- Replace `docker-compose.yml` default credentials with managed secrets.
- Self-host map tiles instead of the external CARTO CDN for data-locality.
- ~~Formalize the heuristic PII scrubber into a tested standard~~ **(started)**
  — regression-tested against realistic Balochistan-context inputs (see
  `npm run verify:pii`); still not a trained NER model, and bare names with
  no honorific are a documented, known gap.

**Regulatory (require the FPMU's legal/security officers + an accredited assessor)**
- **World Bank ESF/ESS10:** DPIA, data classification & retention policy,
  ~~immutable access/audit logging~~ **(implemented)** — a hash-chained,
  tamper-evident log records every access to the sensitive routes (GRM,
  fiduciary, field-logs); Directors review it and its integrity status on the
  Admin dashboard, and `npm run verify:audit` proves tampering is detected.
  Remaining ESS10 items: end-to-end encryption of grievance data, data
  classification & retention policy, and the DPIA itself.
- **Government of Pakistan:** in-country data localization, Personal Data
  Protection alignment (lawful basis, consent, subject access, breach
  notification), and NTISB security certification for a `.gov.pk` system.

---

## Pilot: Postgres migration

The persistence seam supports Postgres today — the pilot step is to point it at
a real database and verify.

```bash
# 1. Bring up the pilot database (PostGIS + pgvector) from the compose stack.
docker compose up -d db-postgis

# 2. Point the app at it (dev). The adapter self-creates its tables on first
#    use; applying db/01_app_store.sql is optional but recommended.
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/ifrap_production"

# 3. Verify the adapter end-to-end (seed, insert/prepend, update, transaction).
npm run verify:store        # prints PASS; SKIPs cleanly if DATABASE_URL is unset

# 4. Run the app against Postgres.
npm run dev
```

- The store keys records by `(collection, id)` in a generic JSONB table
  (`app_store`) with seed-once tracking (`app_store_meta`); ordering matches the
  file store (newest first).
- With `DATABASE_URL` unset, everything falls back to the file store, so dev and
  the test suite are unaffected.
- **Follow-up (production):** design a normalized domain schema if the generic
  JSONB store isn't sufficient long-term — it can coexist in the same database.

## Repository layout

```
app/                Next.js App Router pages + API routes
components/          UI (dashboards, map, field log, GRM, usufruct, admin)
lib/
  auth/             RBAC matrix + role helpers
  server/store.ts   persistence seam dispatcher (file-store | pg-store by DATABASE_URL)
  privacy/          PII scrubber
  agent/ · rag/     LangGraph agent + lexical retriever (template-based)
middleware.ts       Edge RBAC gate (keep matcher in sync with rbac.ts)
db/                 SQL applied to db-postgis on first init (docker-entrypoint-initdb.d)
tests/              E2E/contract suite + matcher drift guard
docker-compose.yml  Frontend + Postgres/PostGIS/pgvector database
```
