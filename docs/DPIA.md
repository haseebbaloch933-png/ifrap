# Data Protection Impact Assessment (DPIA) — AnthropoGIS / IFRAP Component 3

> **STATUS: DRAFT SKELETON — NOT A COMPLETED ASSESSMENT.**
> This document was drafted to accelerate the DPIA process. The **technical
> half** (system description, data inventory, implemented controls — §3–§5, §8)
> is filled in from the codebase and is factual as of the revision below.
> The **legal/policy half** (lawful basis, consent, data-subject rights,
> retention periods, risk acceptance — marked `‹TO BE COMPLETED›`) MUST be
> completed and signed off by the FPMU's Data Protection Officer and the World
> Bank task team's safeguards specialist. Nothing here constitutes legal advice
> or a compliance determination.

---

## 1. Document control

| Field | Value |
|---|---|
| System | AnthropoGIS — IFRAP Component 3 Digital Oversight Platform |
| Codebase revision at drafting | `main` (post audit Phases 0–3 + audit-log) |
| Drafted | ‹date› |
| DPIA owner (accountable) | ‹FPMU Data Protection Officer — name/title› |
| Contributors | ‹FPMU IT›, ‹WB safeguards specialist›, engineering |
| Review status | ☐ Draft ☐ Under review ☐ Approved |
| Approval signatures | ‹DPO›, ‹FPMU Director›, ‹WB task team› + dates |

---

## 2. Purpose & scope

**Purpose of processing (why this system exists):** ‹TO BE COMPLETED — the DPO's
statement of the program purpose, e.g. monitoring Karez rehabilitation,
recording grievances, and registering customary usufruct rights under IFRAP
Component 3.›

**Scope of this DPIA:** the AnthropoGIS web platform and its data stores. It
does **not** cover the upstream identity provider (OIDC/IdP) or any downstream
systems the FPMU may export data to; those require their own assessment.

---

## 3. Description of the processing (system-derived — factual)

The platform collects, stores, displays, and exports data across these flows:

- **Grievances (GRM)** — community members (sometimes anonymous) file complaints;
  PIU officers process and resolve them.
- **Field logs** — field enumerators record ethnographic narratives about
  customary water rights, offline-capable, syncing when connectivity returns.
- **Usufruct certificates** — PIU officers/Directors issue customary land-rights
  certificates to clans/beneficiaries.
- **M&E / telemetry & ESF dashboards** — aggregate, district-level indicators
  (not individual personal data).
- **Access/audit log** — records who accessed the sensitive routes.

Storage is via a single persistence seam (`lib/server/store.ts`): a local JSON
file store in dev/single-instance, or PostgreSQL when `DATABASE_URL` is set.
Offline drafts are held in the browser's IndexedDB, encrypted (AES-256-GCM).

---

## 4. Data inventory (system-derived — factual)

> Legend — **Sensitivity**: 🔴 high (identifies/endangers an individual) ·
> 🟠 moderate · 🟢 low/aggregate.

| Data element | Where collected | Where stored | Sensitivity | Notes |
|---|---|---|---|---|
| Complainant name (`submitterName`) | GRM ticket form | store: `grm` | 🔴 | May be "Anonymous"; free-choice |
| Grievance narrative (`description`) | GRM ticket form | store: `grm` | 🔴 | Free text — may name people, disputes, locations |
| District / category / status | GRM | store: `grm` | 🟠 | |
| Field-log narrative | Field log form | store: `field-logs` | 🔴 | Ethnographic free text; **PII-scrubbed at rest** |
| GPS coordinates | Field log / GIS | store / map data | 🟠 | **Fuzzed to ~1.1 km** before persistence |
| CNIC (national ID) | Field/GRM free text | (scrubbed) | 🔴 | Detected & hashed by the scrubber, not stored raw |
| Phone / email | Free text | (scrubbed) | 🟠 | Redacted by the scrubber |
| Beneficiary / clan name | Usufruct form | store: `usufruct-certs` | 🔴 | Land-rights holder identity |
| Parcel ID / area / rights type | Usufruct form | store: `usufruct-certs` | 🟠 | |
| Certificate SHA-256 fingerprint | Generated | store: `usufruct-certs` | 🟢 | Integrity value, not personal |
| Actor identity (email, role, sub) | Session | store: `audit-log` | 🟠 | Staff, not beneficiaries |
| User account (email, role) | Auth / IdP | JWT session (+ IdP) | 🟠 | Real accounts live in the IdP, not this app |

**Data NOT collected:** passwords (handled by the IdP under SSO; demo-only in
dev), payment/financial-account details, biometric data.

---

## 5. Data subjects & heightened-risk categories

**Data subjects:** grievance complainants (incl. anonymous and potentially
**vulnerable or minority-clan** individuals), customary land-rights
beneficiaries, individuals named within field narratives, and platform staff.

**Heightened-risk considerations (for the DPO to weigh):**
- **CNIC** is a national identity number — high re-identification value.
- **Grievance content** can reveal disputes *between clans*; disclosure could
  expose a complainant to real-world retaliation. This is arguably the single
  most safety-critical dataset in the system.
- **Precise location** + a small community can re-identify an individual even
  without a name (mitigated by coordinate fuzzing — see §8).
- **Minority/vulnerable status** may be inferable from grievance context.

---

## 6. Lawful basis, consent & transparency — ‹TO BE COMPLETED (legal)›

- Lawful basis for each processing flow: ‹…›
- How consent (or alternative basis) is obtained and recorded, incl. for
  anonymous grievances and for naming third parties in narratives: ‹…›
- Privacy notice provided to data subjects: ‹…›

---

## 7. Necessity & proportionality (data minimization)

Implemented minimization measures (factual):
- **PII scrubbing at rest** (`lib/privacy/ner-pii-scrubber.ts`): CNIC hashing,
  name/phone/email redaction on field-log ingestion — raw PII is not persisted
  for that flow. Regression-tested via `npm run verify:pii`.
- **Coordinate fuzzing** to ~1.1 km grid before storage/display.
- **Role-based access** limits who sees which data (see §8).

‹TO BE COMPLETED (DPO): confirmation that each collected element is necessary
and proportionate to the stated purpose; justification for any 🔴 element
retained in identifiable form (e.g. beneficiary/complainant names).›

---

## 8. Implemented technical & organizational controls (system-derived — factual)

| Control | Where | Evidence |
|---|---|---|
| Cryptographic session verification on every protected route | `middleware.ts` (`getToken`) | RBAC drift test |
| Role-based access control (3 roles) | `lib/auth/rbac.ts`, `lib/rbac-context.tsx` | `tests/matcher-coverage.test.js` |
| SSO-ready federation to an external IdP | `lib/auth.ts` (OIDC, env-gated) | provider discovery |
| PII redaction + coordinate fuzzing before persistence | `lib/privacy/ner-pii-scrubber.ts` | `npm run verify:pii` |
| Immutable, tamper-evident access/audit log | `lib/server/audit-log.ts` | `npm run verify:audit` |
| Offline drafts encrypted on-device (AES-256-GCM) | `lib/offline/crypto-storage.ts` | — |
| **Encryption of sensitive fields at rest** (AES-256-GCM) | `lib/server/field-crypto.ts` | `npm run verify:crypto` |
| Security headers (CSP, HSTS, X-Frame-Options, etc.) | `next.config.js` | — |
| Multi-instance data-loss guard | `lib/server/file-store.ts` | boot guard |

---

## 9. Risk register (starter — extend & rate with the DPO)

> Rate each: Likelihood × Impact → risk level; then Owner + target date.

| # | Risk to data subjects | Existing mitigation | Residual / open | Rating ‹DPO› |
|---|---|---|---|---|
| R1 | Complainant re-identified from grievance text → retaliation | Role gates; audit log; anonymity option; **grievance text + name encrypted at rest** | Free-text may still name people to authorized readers; scrubber coverage is heuristic | ‹…› |
| R2 | CNIC exposure | Detected & hashed by scrubber | Depends on scrubber coverage (regex, not trained NER — known gaps documented) | ‹…› |
| R3 | Location re-identification | Coordinate fuzzing ~1.1 km | Fuzz radius adequacy to be confirmed for small settlements | ‹…› |
| R4 | Unauthorized internal access | RBAC + Director-only sensitive surfaces + audit log | Access is logged but not yet alerted on; retention undefined | ‹…› |
| R5 | Data residency / cross-border exposure | — | **Data not yet guaranteed in-country; map tiles use an external CDN** | ‹…› |
| R6 | Data kept longer than necessary | — | **No retention/deletion policy defined yet** | ‹…› |
| R7 | Grievance data readable at rest by infra operators | **Sensitive fields AES-256-GCM encrypted at rest** (`DATA_ENCRYPTION_KEY`) | Depends on the key being set in prod & held in a secrets manager; key rotation is a follow-up | ‹…› |

---

## 10. Data subject rights — ‹TO BE COMPLETED (legal)›

Access, rectification, erasure, objection, and complaint procedures; how a
data subject exercises them and expected response times: ‹…›

---

## 11. Retention & deletion — ‹TO BE COMPLETED (policy)›

Retention period per data category, deletion/archival mechanism, and who
authorizes deletion. **Note (factual):** the system currently retains records
indefinitely; no automated retention is implemented. This is an open item.

---

## 12. International transfer / data localization — ‹TO BE COMPLETED›

Confirm hosting location and that personal data resides in-country per GoP
requirements. **Note (factual):** basemap tiles are currently served from an
external CDN (CARTO); self-hosting is an open item.

---

## 13. Sign-off & review

- Residual-risk acceptance: ‹DPO / FPMU Director / WB task team›
- DPIA review cadence (e.g. annually or on material change): ‹…›
- Linked artifacts: [Certification Readiness Checklist](./CERTIFICATION-READINESS.md)
