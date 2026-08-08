# Data Classification & Retention Policy — MIRAB / IFRAP Operations & Results Backbone

> **STATUS: DRAFT TEMPLATE.** Prepared to address audit finding **D-02**. This
> is a scaffold, **not** an adopted policy and **not** legal advice. It must be
> reviewed and approved by the FPMU's data protection / legal and security
> officers (with World Bank and MoPD&SI input). Fields marked **[FPMU TO
> COMPLETE]** — especially **retention periods** and **lawful bases** — require
> decisions this template cannot make.

---

## 1. Document control

| Field | Value |
|---|---|
| Owner / DPO | **[FPMU TO COMPLETE]** |
| Version | 0.1 (draft) |
| Date | **[FPMU TO COMPLETE]** |
| Related | `docs/dpia-template.md`, `docs/ifrap-audit-plan.md`, project ESCP / SEP |

## 2. Purpose & scope
Defines how data in the MIRAB platform is classified, handled, retained, and
disposed of, so the programme meets World Bank **ESS10** and GoP **Personal
Data Protection** obligations. Scope: all data processed by the platform
(server stores, client/offline storage, exports, backups, logs).

## 3. Classification tiers

| Tier | Definition | Examples in MIRAB |
|---|---|---|
| **PUBLIC** | Cleared for open release; no harm if disclosed | Published aggregate results, public map layers |
| **INTERNAL** | Operational, non-personal; low harm | System config, non-personal telemetry, RF indicator definitions |
| **CONFIDENTIAL** | Personal data; harm if disclosed | Staff accounts/roles, audit log, usufruct/tenure records |
| **RESTRICTED (Sensitive Personal)** | Sensitive personal data of vulnerable subjects; serious harm if disclosed | Grievance records, field-log narratives, any CNIC/contact/precise GPS |

Default: if unsure, classify **RESTRICTED** and review down, never up.

## 4. Data inventory → classification map (as built)

| Data category | Store | Tier | Lawful basis | Storage location | Encryption | Access (roles) |
|---|---|---|---|---|---|---|
| Grievance records | `grm` | **RESTRICTED** | [FPMU] | In-country (**D-04**) | At rest **[D-03 pending]** + TLS | Enumerator/PIU/Director (RBAC) |
| Field logs | `field-logs` | **RESTRICTED** | [FPMU] | In-country | PII-scrubbed at rest; offline AES-256; TLS | Enumerator/PIU/Director |
| Usufruct / tenure certs | `usufruct-certs` | **CONFIDENTIAL** | [FPMU] | In-country | TLS; hash fingerprint | PIU/Director (elevated) |
| Access / audit log | `audit-log` | **CONFIDENTIAL** | Legal obligation (ESS10) | In-country | Hash-chained + TLS | Director only |
| M&E telemetry / MPI | telemetry | **INTERNAL** (if aggregate) | [FPMU] | In-country | TLS | All authenticated |
| Auth / session | IdP / JWT | **CONFIDENTIAL** | [FPMU] | IdP | Encrypted JWE; TLS | System |
| Offline drafts (device) | IndexedDB | **RESTRICTED** | [FPMU] | Field device | AES-256 at rest | Device holder |

> **[FPMU TO COMPLETE]** Confirm tiers against live fields; if CNIC/phone/exact
> GPS are captured, those records are **RESTRICTED**.

## 5. Handling rules by tier

| Control | INTERNAL | CONFIDENTIAL | RESTRICTED |
|---|---|---|---|
| Access | Authenticated users | Role-scoped (RBAC), least privilege | Role-scoped + strong justification; audit every access |
| Encryption in transit | TLS | TLS | TLS |
| Encryption at rest | Recommended | Required | **Required, incl. field-level for grievances (D-03)** |
| Storage location | In-country | In-country | In-country only; no out-of-country transfer without DPA |
| Sharing / export | Aggregate freely | Need-to-know + logged | Need-to-know + logged + minimised/de-identified |
| Logging | Standard | Access audited (hash-chain) | Access audited; alert on bulk export |
| Disposal | Standard delete | Secure delete | Secure/cryptographic erasure |

## 6. Retention schedule

> **[FPMU TO COMPLETE] — retention periods must be set by the FPMU/legal team**
> per GoP law, WB requirements, and programme need. Placeholders shown.

| Data category | Retention period | Trigger | Disposal method |
|---|---|---|---|
| Grievance records | [e.g., programme life + N years] | Case closure | Secure erasure |
| Field logs | [ ] | Ingestion date | Secure erasure |
| Usufruct / tenure certs | [likely long / archival] | Issuance | Archive per land-records law |
| Access / audit log | [e.g., ≥ programme life for auditability] | Entry date | Secure erasure after retention |
| M&E telemetry (aggregate) | [ ] | Reporting period | Standard |
| Auth / session | Session lifetime + [ ] | Logout/expiry | Automatic |
| Offline drafts | Until sync + [short] | Successful sync | Auto-purge from device |

## 7. Roles & responsibilities

| Role | Responsibility |
|---|---|
| Data Owner (FPMU Director) | Accountable for the data; approves classification & retention |
| Data Protection Officer | Maintains this policy + the DPIA; handles subject-rights requests |
| Data Custodian (IT/Ops) | Implements controls (hosting, encryption, backups, access) |
| Processors (field/PIU staff) | Handle data per tier rules; report incidents |

## 8. Data subject rights
Describe how access, correction, and erasure requests from beneficiaries/
complainants are received and fulfilled, and the response SLA. **[FPMU TO
COMPLETE].**

## 9. Breach handling
Reference the incident-response / breach-notification procedure (who is
notified, within what window, and how — GoP + WB requirements). **[FPMU TO
COMPLETE].**

## 10. Review
Review on material change and at least **[FPMU TO COMPLETE: e.g., annually]**.
Alignment with the technical controls is verifiable in-repo: RBAC drift guard
(`npm test` / `tests/matcher-coverage.test.js`), audit-chain integrity
(`npm run verify:audit`), and PII scrubbing (`npm run verify:pii`).
