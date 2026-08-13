# Certification Readiness Checklist — AnthropoGIS / IFRAP Component 3

> **Purpose.** A pre-assessment self-review, mapping each security/privacy
> control to concrete, checkable evidence, so an accredited assessor (e.g.
> NTISB for a `.gov.pk` system) or the World Bank task team can verify status
> quickly — and so the FPMU knows exactly what is done vs. outstanding before
> commissioning a formal assessment.
>
> **This is a self-assessment, not a certification.** "Implemented" means the
> control exists in code and was verified in development; it does **not** claim
> any external body has certified it. Certification is granted only by the
> relevant authority after their own review.

**Codebase revision:** `main` (post audit Phases 0–3 + immutable audit log).

### Status legend
- ✅ **Implemented** — in code, verified in dev (evidence cited)
- 🟡 **Partial** — implemented but with a documented limitation/gap
- 🔧 **Config/deploy** — code-ready; requires a deployment/env decision to activate
- ⬜ **Open** — not started; process or infrastructure work (owner named)

---

## A. Authentication & session

| # | Control | Status | Evidence |
|---|---|---|---|
| A1 | Cryptographic session verification (no bypass) | ✅ | `middleware.ts`, `app/api/*` use `getToken`; the old "any bearer string" verifier was removed |
| A2 | Session secret required, no hardcoded fallback | ✅ | `lib/auth.ts::getAuthSecret` throws if `NEXTAUTH_SECRET` unset/short |
| A3 | SSO federation to an external identity provider (OIDC) | 🔧 | `lib/auth.ts` enables OIDC when `OIDC_*` env set; demo creds dropped in prod when SSO on |
| A4 | Multi-factor authentication | ⬜ | Enforced at the **IdP**, not this app — owner: FPMU IT / identity team |
| A5 | Account lifecycle (joiner/mover/leaver) | ⬜ | IdP-side — owner: FPMU IT |

---

## B. Authorization / access control

| # | Control | Status | Evidence |
|---|---|---|---|
| B1 | Role-based access control (3 roles) | ✅ | `lib/auth/rbac.ts`, `lib/rbac-context.tsx` |
| B2 | Edge gate ↔ route table kept in sync (drift guard) | ✅ | `node tests/matcher-coverage.test.js` (16 protected routes) |
| B3 | Least-privilege default on unknown role | ✅ | `lib/auth.ts::resolveRoleFromProfile` defaults to `FIELD_ENUMERATOR` |
| B4 | Sensitive surfaces Director-only | ✅ | `/admin`, `/api/audit-log` restricted in `rbac.ts` + middleware |
| B5 | Access denials are visible, not silent | ✅ | `/telemetry?error=Forbidden` banner; role-filtered nav |

---

## C. Data protection & privacy

| # | Control | Status | Evidence |
|---|---|---|---|
| C1 | PII redaction before persistence (CNIC/name/phone/email) | 🟡 | `lib/privacy/ner-pii-scrubber.ts`; `npm run verify:pii`. **Gap:** regex-based, not trained NER — bare un-honorific names are a documented known miss |
| C2 | GPS coordinate fuzzing (~1.1 km) | ✅ | `fuzzCoordinates` / `fuzzGeoJSONCoordinates` in the scrubber |
| C3 | Offline drafts encrypted on-device (AES-256-GCM) | ✅ | `lib/offline/crypto-storage.ts` |
| C4 | Encryption of grievance/tenure data **at rest** (server) | ✅ | `lib/server/field-crypto.ts` (AES-256-GCM, field-level) seals GRM narrative/name, usufruct beneficiary/clan, field-log payload; env-gated by `DATA_ENCRYPTION_KEY`; `npm run verify:crypto` + verified on-disk (ciphertext at rest, cleartext via API). **Requires the key set in prod (secrets manager).** Key rotation is a follow-up |
| C5 | Data minimization documented | 🟡 | Controls exist; formal necessity/proportionality sign-off pending (DPIA §7) |
| C6 | DPIA completed & approved | ⬜ | Skeleton drafted ([DPIA.md](./DPIA.md)); legal/policy half + sign-off — owner: FPMU DPO |
| C7 | Data classification & retention policy | ⬜ | Not defined; records currently retained indefinitely — owner: FPMU DPO |

---

## D. Audit & accountability

| # | Control | Status | Evidence |
|---|---|---|---|
| D1 | Access/audit log over sensitive routes (GRM, fiduciary, field-logs) | ✅ | `lib/server/audit-log.ts`; records LIST/CREATE/UPDATE/INGEST/ISSUE_CERT/DENIED |
| D2 | Tamper-evident (immutable) log | ✅ | Hash-chained; `npm run verify:audit` proves edit/reorder/deletion are detected |
| D3 | Director review surface + integrity status | ✅ | `/api/audit-log` + Admin dashboard panel with chain-integrity banner |
| D4 | Real-time alerting on anomalous access | ⬜ | Not implemented — future enhancement (owner: FPMU IT/SOC) |
| D5 | Log retention/export policy | ⬜ | Tied to C7 retention policy |

---

## E. Transport & application security

| # | Control | Status | Evidence |
|---|---|---|---|
| E1 | Content-Security-Policy (dev-aware) | ✅ | `next.config.js` |
| E2 | HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy | ✅ | `next.config.js` |
| E3 | `poweredByHeader` disabled | ✅ | `next.config.js` |
| E4 | HTTPS/TLS termination | 🔧 | Deployment concern — owner: FPMU infra |
| E5 | Secrets managed (no defaults in prod) | 🟡 | App secret enforced (A2); `docker-compose.yml` still ships dev-default Postgres credentials (`DB_USER`/`DB_PASS`) to replace |

---

## F. Data integrity & persistence

| # | Control | Status | Evidence |
|---|---|---|---|
| F1 | Durable persistence behind a single seam | ✅ | `lib/server/store.ts` (file ↔ Postgres by `DATABASE_URL`) |
| F2 | Concurrency-safe multi-instance store (Postgres) | 🔧 | `lib/server/pg-store.ts` (advisory locks); `DATABASE_URL=... npm run verify:store` |
| F3 | Multi-instance data-loss guard on file store | ✅ | `lib/server/file-store.ts` refuses unsafe prod writes unless acknowledged |
| F4 | ID-collision safety (tickets, certificates) | ✅ | Max-based GRM numbering; transactional uniqueness retry for cert numbers |

---

## G. Secure SDLC / assurance

| # | Control | Status | Evidence |
|---|---|---|---|
| G1 | Type safety | ✅ | `npx tsc --noEmit` clean |
| G2 | Production build integrity | ✅ | `npm run build` clean (standalone output) |
| G3 | Automated test suite | ✅ | `npm test` — 98/98 passing |
| G4 | Targeted verification scripts | ✅ | `verify:store`, `verify:pii`, `verify:audit` |
| G5 | No build-process scaffolding in delivered repo | ✅ | `.agents/` and orphaned backend removed (audit Phase 0) |

---

## H. Data residency & external dependencies

| # | Control | Status | Evidence |
|---|---|---|---|
| H1 | In-country data hosting (localization) | ⬜ | Deployment decision — owner: FPMU infra |
| H2 | Self-hosted map tiles (no external CDN) | ⬜ | Currently CARTO CDN; self-host tiles (e.g. GeoServer/tile server) — owner: FPMU infra |

---

## I. Formal certification

| # | Item | Status | Owner |
|---|---|---|---|
| I1 | NTISB security assessment / certification | ⬜ | Commissioned by FPMU after A4/C4/C6/H1 close |
| I2 | World Bank ESF/ESS10 safeguards sign-off | ⬜ | WB task team |

---

## How to read the outstanding work

The ✅ items are the assessor's *evidence pack* — hand them the file paths and
the `verify:*` commands. The ⬜ items cluster into a clear critical path:

**DPIA & classification (C6, C7)** → **encryption at rest (C4)** →
**identity/MFA (A4, A5)** → **in-country hosting & tiles (H1, H2)** →
**formal certification (I1, I2)**.

That ordering is deliberate: the DPIA defines the requirements, encryption and
hosting implement them, identity is a certification prerequisite, and formal
assessment comes last, once the rest is in place.
