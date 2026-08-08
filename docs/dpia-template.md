# Data Protection Impact Assessment (DPIA) — MIRAB / IFRAP Operations & Results Backbone

> **STATUS: DRAFT TEMPLATE.** This document is a starting scaffold prepared to
> address audit finding **D-01**. It is **not** a completed DPIA and **not
> legal advice**. It must be completed and signed off by the FPMU's data
> protection / legal and security officers, in consultation with the World Bank
> Task Team and an accredited assessor, before the platform processes any
> **real** beneficiary data. Fields marked **[FPMU TO COMPLETE]** require a
> decision this template cannot make.

---

## 1. Document control

| Field | Value |
|---|---|
| Document owner / DPO | **[FPMU TO COMPLETE]** |
| Version | 0.1 (draft) |
| Date | **[FPMU TO COMPLETE]** |
| Classification of this document | Confidential |
| Related documents | `docs/data-classification-policy.md`, `docs/ifrap-audit-plan.md`, project ESCP / SEP |
| Approvers | DPO · FPMU Director · Security Officer · WB Social Safeguards Specialist |

## 2. Why a DPIA is required

The platform processes **personal data of vulnerable beneficiaries and
complainants** (grievances, land/tenure records, field ethnography) at scale,
for a `.gov.pk` system under World Bank **ESS10** and the **Government of
Pakistan Personal Data Protection** framework. This meets the threshold for a
mandatory DPIA (large-scale processing of sensitive personal data of
potentially vulnerable individuals).

## 3. Description of the processing

### 3.1 Nature and purpose
MIRAB is the operations, results and safeguards backbone for the IFRAP
programme (Balochistan). It captures field evidence, runs the Grievance Redress
Mechanism, issues customary-tenure/usufruct records, and produces monitoring &
evaluation reporting.

### 3.2 Data inventory (as built)

| # | Data category | Examples (fields) | Store (collection) | Data subjects | Special category? |
|---|---|---|---|---|---|
| 1 | Grievance records | submitter name, description (free text), district, category, status, resolution notes | `grm` | Complainants (beneficiaries) | **Likely yes** — grievances can reveal disputes, ethnicity, political/tribal affiliation |
| 2 | Field logs | ethnographic narrative, geo-coordinates, submitter | `field-logs` | Beneficiaries, informants, field staff | **Possibly** — narratives may contain sensitive detail |
| 3 | Usufruct / tenure certificates | beneficiary name, clan, parcel ID, district, area | `usufruct-certs` | Beneficiaries, communities | Personal + land tenure |
| 4 | Access / audit log | actor id/email/role, route, action, timestamp, hash chain | `audit-log` | Platform staff (enumerators/PIU/director) | Personal (staff) |
| 5 | M&E telemetry / MPI | district-level indicators, capability metrics | telemetry | Aggregate — **should be non-identifying** | No (if properly aggregated) |
| 6 | Authentication / session | email, role, session token | IdP / session JWT | Platform staff | Personal (staff) |
| 7 | Offline drafts (device) | any of the above, pre-sync | IndexedDB (AES-256 encrypted) | As above | As above |

> **[FPMU TO COMPLETE]** Confirm/adjust this inventory against live forms; in
> particular confirm whether CNIC, phone, or exact GPS are captured anywhere,
> and whether MPI/telemetry is truly aggregate (re-identification risk).

### 3.3 Purposes of processing
Programme delivery and monitoring; grievance handling (ESS10); tenure-rights
recognition; results reporting to the World Bank and MoPD&SI; safeguards
compliance.

### 3.4 Legal basis / lawful ground
**[FPMU TO COMPLETE]** — state the lawful basis under the GoP Personal Data
Protection framework and the programme's legal mandate (e.g., public
task / consent / legal obligation). Consent mechanics for grievance submitters
must be described here.

### 3.5 Data subjects and scale
Beneficiaries (up to ~97,000 housing beneficiaries; ~2.7M people in target
districts), complainants, community members, and platform staff.
**[FPMU TO COMPLETE]** exact expected volumes per data category.

### 3.6 Recipients and data sharing
Internal: field enumerators, Provincial PIU, FPMU, Director (role-scoped via
RBAC). External: World Bank (supervision/ISR — aggregate/where lawful), MoPD&SI
(PC-III reporting). **[FPMU TO COMPLETE]** — list any third-party processors and
attach data-processing agreements.

### 3.7 Retention
Governed by `docs/data-classification-policy.md` §6. **[FPMU TO COMPLETE]**
retention periods per category.

### 3.8 International transfers / data localization
**[FPMU TO COMPLETE].** Requirement: host in-country on GoP-approved
infrastructure (audit **D-04**). Note the current use of an **external map-tile
CDN (CARTO)** and the decision to **decline Vercel Web Analytics** (PR #12) as
relevant external-egress considerations. No beneficiary personal data may be
sent to out-of-country third parties without an explicit lawful basis and DPA.

## 4. Consultation
Record consultation with: the DPO; platform users (enumerators/PIU/director);
and — critically for ESS10 — **affected communities / grievance submitters**
about how their data is handled. **[FPMU TO COMPLETE].**

## 5. Necessity and proportionality
Assess data minimisation (collect only what the RF/GRM needs), accuracy,
purpose limitation, and whether less-intrusive alternatives exist (e.g., not
storing submitter identity where anonymous grievances suffice).
**[FPMU TO COMPLETE].**

## 6. Risk assessment

Rate **Likelihood** and **Severity** (Low/Medium/High) and derive **Residual
risk** after existing controls. Controls already in the platform are pre-filled;
gaps reference audit findings.

| Risk to data subjects | Likelihood | Severity | Existing controls (in platform) | Gaps / mitigation needed | Owner |
|---|---|---|---|---|---|
| Unauthorized access to grievance/tenure data | [ ] | [ ] | RBAC edge gate (`proxy.ts` + `lib/auth/rbac.ts`); cryptographic session verify (`getToken`); no email→role escalation (T-01 fixed) | Federate SSO + MFA to GoP IdP (**D-05**) | [ ] |
| Re-identification from stored PII | [ ] | [ ] | Server-side PII scrubber on field logs & GRM (`lib/privacy/ner-pii-scrubber.ts`); GPS fuzzing | Scrubber is heuristic, not trained NER (bare names a known gap); consider stronger de-identification | [ ] |
| Grievance data intercepted / read at rest | [ ] | [ ] | Offline drafts AES-256 (IndexedDB); TLS in transit; HSTS/CSP | **End-to-end encryption of grievance data at rest not yet implemented (D-03)** | [ ] |
| Tampering with / repudiation of access records | [ ] | [ ] | Hash-chained, tamper-evident audit log (`lib/server/audit-log.ts`), verifiable via `npm run verify:audit` | Consider fail-closed audit mode in production | [ ] |
| Data loss / multi-instance corruption | [ ] | [ ] | File-store lock + boot guard; Postgres adapter available | Move to Postgres for production (**H-03**); backups & DR plan | [ ] |
| Data leaving the country | [ ] | [ ] | Vercel Analytics declined (PR #12) | Self-host map tiles; in-country hosting (**D-04**) | [ ] |
| Abuse / flooding of intake endpoints | [ ] | [ ] | Per-actor rate limiting + body-size caps (`lib/server/api-guards.ts`, T-03) | Shared-store limiter for multi-instance | [ ] |
| Excessive data collection / retention | [ ] | [ ] | — | Data-minimisation review; retention schedule (classification policy §6) | [ ] |

## 7. Measures to reduce risk (action plan)
Summarise agreed actions, owners, and target dates. Cross-reference the audit
roadmap phases (`docs/ifrap-audit-plan.md` §3). **[FPMU TO COMPLETE].**

## 8. Outcome and sign-off

| Role | Name | Decision (approve / approve-with-conditions / reject) | Date | Signature |
|---|---|---|---|---|
| Data Protection Officer | [ ] | [ ] | [ ] | [ ] |
| FPMU Director | [ ] | [ ] | [ ] | [ ] |
| Security Officer (NTISB liaison) | [ ] | [ ] | [ ] | [ ] |
| WB Social Safeguards Specialist | [ ] | [ ] | [ ] | [ ] |

## 9. Review schedule
Review on any material change to processing, and at minimum **[FPMU TO
COMPLETE: e.g., annually]**.
