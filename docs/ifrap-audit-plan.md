# The IFRAP Digital Operations Backbone — Audit & Realignment Plan

> **Audit & Realignment Plan · Draft for FPMU Review**

A single role-based platform — one "digital brain and headquarters" — that connects
every actor from the field enumerator to the FPMU Director, and is built to be tested
against **World Bank ESF / Results-Framework** and **Ministry of Planning, Development &
Special Initiatives (MoPD&SI)** requirements.

| | |
|---|---|
| **Prepared for** | IFRAP Federal Project Management Unit (FPMU) |
| **Project** | Integrated Flood Resilience & Adaptation Project (P180323) |
| **Instrument** | Investment Project Financing · Series of Projects (SOP) |
| **Version** | 1.0 — Draft |
| **Date** | August 2026 |

---

## Executive summary

The platform in its current form is a strong prototype with genuinely valuable parts — a
role-based access model, a tamper-evident audit log, an offline-first field-capture
pipeline, and a working Grievance Redress Mechanism. But its **positioning, framing, and
several technical foundations are incoherent** with how the World Bank and the Ministry of
Planning actually operate, and with the real definition of the IFRAP project itself.

This document is a two-part audit. **Part A (theoretical)** realigns the platform's
concept, methodology, and vocabulary to the operational culture of the funders and the
government. **Part B (technical)** fixes the engineering, security, and data-governance
gaps. Together they form a phased roadmap ending in a **formal acceptance test** against
World Bank and MoPD&SI requirements.

- **The single objective** — make one platform the operational nerve-centre of IFRAP
  delivery: the place where field evidence becomes results-framework reporting, and where
  the Director, the Bank, and the Ministry read the same truth.
- **The core problem** — the app is branded and scoped as an "anthropology / Component 3
  water-governance portfolio." The real IFRAP Component 3 is *Hydromet & Institutional
  Strengthening*. The platform's true home is cross-cutting M&E + safeguards under
  Component 5 and the ESF.
- **The deliverable** — a repositioned, hardened, results-framework-driven platform that a
  Bank Task Team Leader and an MoPD reviewer can audit against their own checklists — and pass.

> **🔴 Headline finding.** The platform must be **repositioned from "IFRAP Component 3
> water governance" to "IFRAP Operations & Results Backbone"** — a cross-cutting system
> serving Component 5 (Project Management & Institutional Strengthening) and the
> Environmental & Social Commitment Plan (ESCP), with an optional information-systems
> module that plugs into the *actual* Component 3 (Hydromet / Early-Warning). Every other
> fix depends on getting this framing right first.

---

## Section 1 · Reference baseline — the standards we are auditing against

An audit is only as good as its yardstick. These are the frameworks the platform will be
measured by, and the confirmed facts of the IFRAP operation that the platform must reflect.

### 1.1 The IFRAP project — confirmed facts

| Attribute | Confirmed value |
|---|---|
| Project | Integrated Flood Resilience & Adaptation Project (IFRAP), World Bank `P180323` |
| Instrument | Investment Project Financing (IPF); first in a Series of Projects (SOP) |
| Approved / financing | 12 May 2023, US$213M; Additional Financing scaling housing 35,100 → 97,000 beneficiaries |
| PDO | "To improve livelihoods and essential services and enhance flood-hazard-resilient housing units and livelihoods in Balochistan." |
| Components | (1) Community Infrastructure Rehabilitation · (2) Housing Reconstruction · **(3) Hydromet & Institutional Strengthening** · (4) Livelihood Support & Watershed Management · (5) Project Management & Institutional Strengthening · (+CERC) |
| FPMU mandate | Implements **Components 3 and 5** |

### 1.2 World Bank requirements

- **IPF Results Framework** — a PDO statement backed by a Theory of Change; PDO-level
  outcome indicators; intermediate results indicators grouped by component; each with unit,
  baseline, annual/cumulative targets, end target, frequency, data source, and
  responsibility; plus mandatory WBG Corporate Scorecard (FY24–30) indicators.
- **ISR cadence** — results reported semi-annually through the Implementation Status &
  Results report; changes only via Restructuring Papers (IFRAP has already had a Level-2
  restructuring).
- **Environmental & Social Framework (ESS1–ESS10)** — especially ESS5 (land & tenure), ESS7
  principles (traditional/underserved communities), and ESS10 (stakeholder engagement + a
  functioning GRM).
- **ESCP** — the binding Environmental & Social Commitment Plan, tracked to evidence.
- **Fiduciary & data protection** — FM/procurement traceability, and protection of
  beneficiary personal data.

### 1.3 Ministry of Planning & Government of Balochistan requirements

- **PC-I / PC-III / PC-IV** lifecycle and the DDWP → PDWP → CDWP → ECNEC approval /
  reporting chain.
- **Results-based M&E** aligned to the national and provincial planning cycle and MTBF.
- **National MPI** — Pakistan's official Multidimensional Poverty Index (Planning
  Commission / OPHI) is the recognized poverty lens; alignment to it is an asset if bound
  to project indicators.
- **Data sovereignty** — in-country data localization, alignment with the Personal Data
  Protection framework, and NTISB security expectations for a `.gov.pk` system.

---

## Section 2 · Findings register — incoherencies identified

Each finding carries a severity and a required fix. Three technical findings raised during
the code review have **already been remediated** in the current codebase and are marked
resolved. File references point to the exact locations to change.

### 2.1 Conceptual & positioning

| ID | Finding | Severity | Required fix |
|---|---|---|---|
| C-01 | **Scope-label mismatch.** App branded "Component 3 = water governance"; real Component 3 is Hydromet & Institutional Strengthening. | 🔴 Critical | Reposition as "Operations & Results Backbone" (Component 5 + ESF/ESCP); expose an optional Component 3 information-systems/EWS module. |
| C-02 | **"Decolonial" cartography frames the state cadastre as adversary** — the state is the client (MoPD, provincial line dept). | 🟠 High | Reframe to "locally-led / participatory / customary-tenure overlay" serving ESS5 tenure-risk analysis. |
| C-03 | **"Indigenous / ESS7" labelling** is politically contested in Pakistan; GoP disputes the designation. | 🟠 High | Apply ESS7 *principles* and use "customary / traditional knowledge"; drop the "Indigenous" label. |
| C-04 | **MPI / capability metric stands alone**, not rolled up into the project Results Framework. | 🟡 Medium | Bind each MPI dimension to a PDO or intermediate RF indicator with baseline–target–frequency–source. |

### 2.2 Claim honesty & credibility

| ID | Finding | Severity | Required fix |
|---|---|---|---|
| H-01 | **Overstated capability** — "Antigravity Agent / pgvector semantic RAG" is a template responder over a lexical retriever (`lib/rag/retriever.ts`, `lib/agent/antigravity-graph.ts`). | 🟠 High | Describe honestly as "safeguards decision-support / evidence retrieval"; wire real embeddings only if warranted. |
| H-02 | **Mocked authentication** — three hard-coded demo accounts (`lib/auth.ts`). | 🟠 High | Wire real OIDC SSO to the FPMU/GoP identity provider; enforce MFA at the IdP. |
| H-03 | **Single-instance file store** as default persistence (`lib/server/file-store.ts`). | 🟡 Medium | Complete and verify the Postgres migration behind the existing seam (`lib/server/store.ts`). |

### 2.3 Technical & security

| ID | Finding | Severity | Status / fix |
|---|---|---|---|
| T-01 | **Email→role privilege escalation.** Any email containing "director"/"admin" maps to `FPMU_DIRECTOR` when the IdP omits a role claim (`lib/auth/rbac.ts`). | 🔴 Critical | Restrict elevation to an explicit allowlist; default to least privilege. |
| T-02 | **Tests are static source-shape checks**, not behavior/e2e — "98 passing" overstates assurance. | 🟠 High | Add real route/RBAC/PII/MPI tests + Playwright smoke tests; run in CI. |
| T-03 | **No input-size limits / rate limiting** on POST routes (agent, GRM, field-logs). | 🟡 Medium | Enforce max lengths + per-actor throttling. |
| T-04 | **Five `@ts-ignore`** around the agent graph edges (`lib/agent/antigravity-graph.ts`). | 🟡 Medium | Type the graph correctly or isolate behind a typed adapter. |
| T-05 | **Next.js 16 deprecation** — `middleware.ts` convention is deprecated (build warns). | 🟡 Medium | Migrate to the `proxy` convention before the next major. |
| T-06 | **Heavy client bundles** — 600–850-line dashboards + data ship to the browser. | 🟡 Medium | Lazy-load the map; move static data server-side; code-split. |
| T-07 | **Dead placeholder Mapbox token** inlined (`next.config.js`). | 🟡 Medium | Remove — MapLibre needs no token. |
| R-01 | **GRM grievances stored without PII scrubbing.** | ✅ Resolved | Descriptions & resolution notes now scrubbed at write time. |
| R-02 | **Agent route not audited.** | ✅ Resolved | Denied + successful queries now written to the audit chain. |
| R-03 | **RAG `matchThreshold` ignored.** | ✅ Resolved | Relevance cutoff now honored; agent claims are truthful. |

### 2.4 Compliance & data governance

| ID | Finding | Severity | Required fix |
|---|---|---|---|
| D-01 | **No Data Protection Impact Assessment (DPIA)** for beneficiary PII. | 🔴 Critical | Conduct DPIA with the FPMU legal/security officers before any real data. |
| D-02 | **No data classification / retention policy.** | 🟠 High | Classify data; define retention, minimization, and subject-access processes. |
| D-03 | **Grievance data not end-to-end encrypted** (open ESS10 item). | 🟠 High | Encrypt sensitive grievance/tenure data at rest and in transit. |
| D-04 | **Data locality** — external CARTO tiles; hosting not confirmed in-country. | 🟠 High | Self-host map tiles; host on GoP-approved in-country infrastructure. |
| D-05 | **SSO not federated** to the FPMU/GoP IdP; MFA + account lifecycle unproven. | 🟠 High | Federate OIDC; confirm MFA and per-user lifecycle at the IdP. |
| D-06 | **Audit log is fail-open** — a store error lets the sensitive op proceed unlogged. | 🟡 Medium | Offer a fail-closed policy switch for production (FPMU decision). |

---

## Part A · Theoretical audit & realignment — making the platform coherent as an operating model

### A.1 Reposition the platform

Stop presenting the system as an academic anthropology portfolio scoped to "Component 3
water governance." Present it as the **IFRAP Operations & Results Backbone**: the digital
brain that turns field activity into results-framework reporting and safeguards evidence,
serving **Component 5** (project management, M&E, institutional strengthening) and the
**cross-cutting ESF/ESCP**. Where it touches the real Component 3, it does so as a
*monitoring information system / early-warning data layer* — not as "decolonial cartography."

### A.2 Keep the anthropology — change the grammar

The interpretive/ethnographic depth is a genuine asset for the *quality* of GRM triage,
tenure-dispute analysis, and consultation evidence. Keep it as the interpretive layer; add
a results-based spine on top and translate the vocabulary into the instruments the funders
act on.

| Current framing | Reframe to (operational grammar) |
|---|---|
| Decolonial WebGIS | Participatory / customary-tenure overlay for ESS5 tenure-risk mapping |
| Senian MPI dashboard (standalone) | MPI dimensions bound to PDO / intermediate RF indicators |
| Indigenous Technical Knowledge (ITK) | Customary / traditional knowledge; FPIC & consultation evidence (ESS7 principles) |
| "Antigravity Agent" | Safeguards decision-support & evidence retrieval (described honestly) |
| Anthropology portfolio | IFRAP Operations & Results Backbone |

### A.3 Applied M&E method-mix for operational speed

- **Results spine.** Theory of Change → Results Framework → indicator tracking that rolls
  up to the ISR. The non-negotiable operational core.
- **Fast qualitative signal.** Contribution analysis, Outcome Harvesting, Most Significant
  Change, and SenseMaker — narrative depth that still quantifies and reports cleanly.
- **Field velocity.** Rapid Ethnographic Assessment, PRA/PLA tools, and phone-based
  iterative monitoring over the existing structured, PII-scrubbed forms.
- **Rigor where it counts.** Quasi-experimental / DIME-style evaluation only for the
  specific impact questions that justify the cost.

### A.4 One backbone, five layers — the "digital brain"

A single identity, a single data model, and a single audit spine, surfaced as
role-appropriate views from the field to the Director and out to the funders. Evidence
rolls up; decisions flow down.

| Layer | What lives there |
|---|---|
| **5 · Oversight & Reporting** | Director cockpit · ISR export · aide-mémoire pack · PC-III / MoPD M&E · WBG scorecard |
| **4 · HQ Command** | Results Framework · ESCP tracker · GRM console · admin & audit |
| **3 · Core Services** | Identity · SSO · RBAC · Postgres persistence · hash-chained audit · PII / data governance · APIs |
| **2 · Field Operations** | Offline-first capture · encrypted drafts · GRM intake · geo-tagging |
| **1 · People & Sources** | Field enumerators · communities / complainants · PMD hydromet / EWS feeds · damage-assessment / beneficiary data |

### A.5 The actors — and how one platform serves each

| Tier | Actor | What the platform gives them |
|---|---|---|
| Tier 1 | Field Enumerator | Captures logs and GRM intake, offline and encrypted |
| Tier 2 | Provincial PIU | Validates data, issues usufruct/tenure records, exports |
| Tier 3 | FPMU | Consolidates results, manages ESCP & GRM SLAs |
| Tier 4 | FPMU Director | Reads the RF cockpit and audit integrity; sign-off |
| Funders | World Bank · MoPD&SI | Receive ISR / PC-III-shaped reporting |

---

## Part B · Technical audit & remediation — engineering the backbone to a testable standard

- **B.1 Architecture & persistence** — complete and verify the Postgres migration behind
  the existing seam; confirm multi-instance safety; standalone container deploy; self-host
  map tiles for data locality.
- **B.2 Identity & access** — federate OIDC SSO to the FPMU/GoP IdP; enforce MFA and account
  lifecycle at the IdP; remove demo credentials in production; **fix the email→role
  escalation (T-01)**; least-privilege defaults.
- **B.3 Data governance & privacy** — DPIA; data classification & retention; evolve the
  heuristic PII scrubber toward a tested NER standard; end-to-end encryption of
  grievance/tenure data; in-country hosting.
- **B.4 Auditability & integrity** — keep the hash-chained log; extend coverage to all
  sensitive routes; add a fail-closed production switch; provide a verifiable export for
  Bank supervision.
- **B.5 Results-Framework & MIS engine** — model indicators (unit, baseline, targets,
  frequency, source, responsibility, disaggregation); ISR & PC-III exports; WBG scorecard
  indicator; the ESCP commitment tracker. **The operational spine.**
- **B.6 GRM & ESS10** — SLA timers (present), PII scrubbing (done), anonymous intake,
  referral & escalation, and a closed feedback loop to complainants.
- **B.7 Field operations** — offline-first sync (present), on-device encryption at rest,
  resilient conflict handling, and structured forms that roll up to RF indicators.
- **B.8 Quality engineering** — replace static checks with real behavior + Playwright e2e +
  contract tests in CI; rate limiting & input caps (T-03); error hygiene; middleware→proxy
  migration (T-05); bundle/perf (T-06).
- **B.9 Integrations & interoperability** — PMD hydromet/EWS feeds (real Component 3),
  damage-assessment/beneficiary registries, GIS layers, and export APIs shaped for WB & MoPD
  systems.

---

## Section 3 · Remediation roadmap — sequenced to a fundable, testable platform

| Phase | Focus | Exit criteria |
|---|---|---|
| **0 · Reposition & hygiene** | Rename off "Component 3"; reframe vocabulary (C-01–C-03); honest capability copy (H-01); remove dead config (T-07). No new features — coherence only. | Positioning note approved by FPMU; brand & copy consistent. |
| **1 · Identity & data-governance foundation** | Federate SSO + MFA (H-02, D-05); fix privilege escalation (T-01); DPIA + data classification/retention (D-01, D-02); Postgres verified (H-03). | Real auth in a staging tenant; DPIA signed; DB path proven. |
| **2 · Results-Framework & safeguards core** | Build the RF/MIS engine and ESCP tracker (B.5); bind MPI to indicators (C-04); E2E-encrypt grievance data (D-03); fail-closed audit option (D-06). | Indicators roll up to an ISR-shaped export; ESCP evidence tracked. |
| **3 · Field operations & integrations** | Harden offline sync + on-device encryption (B.7); wire PMD/EWS & beneficiary registries (B.9); in-country hosting + self-hosted tiles (D-04). | A district pilot runs field-to-HQ on real infrastructure. |
| **4 · Quality & acceptance testing** | Real behavior + e2e test suite in CI (T-02); rate limits (T-03); middleware→proxy (T-05); perf (T-06); run the acceptance matrix with the TTL & MoPD. | World Bank & MoPD acceptance criteria met on the pilot. |
| **5 · Scale to production** | Roll out across IFRAP components and PIUs; NTISB security certification; operations runbook and support model. | Production go-live with certification and a support SLA. |

---

## Section 4 · Acceptance & compliance matrix — how the World Bank & Ministry will test it

This is the checklist to hand to a Task Team Leader or an MoPD reviewer. Each requirement
pairs with an acceptance criterion — an observable that either passes or fails — and the
platform capability that satisfies it.

| Requirement | Acceptance criterion (observable) | Platform capability |
|---|---|---|
| WB · Results Framework | Every PDO & intermediate indicator shows unit, baseline, target, actual, frequency, source, RAG status; exports to ISR shape | RF/MIS engine (B.5) |
| WB · Corporate Scorecard | The FY24–30 scorecard indicator is tracked and disaggregated | RF engine + disaggregation |
| WB · ESS10 GRM | Grievances logged, SLA-tracked, PII-protected, escalated, and closed with complainant feedback | GRM console (B.6) · PII scrubbing ✓ |
| WB · ESCP | Each ESCP commitment maps to status + evidence | ESCP tracker (B.5) |
| WB · ESS5 tenure | Customary-tenure overlay supports land/tenure risk review | Tenure overlay (A.2) |
| WB/GoP · Data protection | DPIA on file; PII redacted at rest; grievance data encrypted; in-country hosting | D-01–D-04 remediation |
| WB/GoP · Access control | Real SSO + MFA; least-privilege RBAC; no privilege escalation; full audit trail | Identity & access (B.2) · audit ✓ |
| MoPD · Results-based M&E | Indicators map to PC-III reporting; MPI bound to project indicators | RF engine + MPI binding (C-04) |
| MoPD · Data sovereignty | In-country hosting; PDP alignment; NTISB security certification | D-04 + Phase 5 |
| Engineering assurance | Behavior + e2e tests green in CI; rate-limited; forward-compatible build | Quality engineering (B.8) |

---

## Section 5 · Appendix

> **⚠️ Validation caveat.** The exact Results-Framework indicator rows live in the IFRAP
> Project Appraisal Document (RF annex) and the project's PC-I — sources the World Bank
> document servers did not permit fetching when this plan was drafted. This plan is built on
> the confirmed PDO, instrument, and component structure; **the indicator table must be
> populated from the PAD RF / PC-I**, and the whole plan validated with the Bank Task Team
> Leader and the FPMU before adoption.

### Glossary

| Term | Meaning |
|---|---|
| IPF | Investment Project Financing — the World Bank lending instrument for IFRAP |
| PDO | Project Development Objective |
| RF | Results Framework |
| ISR | Implementation Status & Results report |
| ESF / ESS | Environmental & Social Framework / Standards (ESS1–ESS10) |
| ESCP | Environmental & Social Commitment Plan |
| GRM | Grievance Redress Mechanism (ESS10) |
| FPMU / PIU | Federal Project Management Unit / Provincial Implementation Unit |
| MoPD&SI | Ministry of Planning, Development & Special Initiatives |
| MPI | Multidimensional Poverty Index |
| DPIA | Data Protection Impact Assessment |
| PMD | Pakistan Meteorological Department (hydromet, Component 3) |

### Sources

- [World Bank — IFRAP (P180323) project documentation](https://documents1.worldbank.org/curated/en/099061825231029557/pdf/P180323-907c8a81-5d64-4d09-948c-474ee0d34dd7.pdf)
- [World Bank — IFRAP Restructuring Paper (RES00344)](https://documents1.worldbank.org/curated/en/099102924122512218/pdf/P180323-30c5347c-f50b-4580-99b2-5f89ea8260f3.pdf)
- [ReliefWeb — WB approves US$213M for Balochistan flood recovery](https://reliefweb.int/report/pakistan/post-floods-reconstruction-and-building-climate-resilience-world-bank-approves-213-million-flood-affected-communities-balochistan)
- [IFRAP — About](https://ifrap.org.pk/about-ifrap/) · [Component 3: Modernization of Hydromet Services](https://ifrap.org.pk/modernization-hydromet-services-pakistan/) · [Component 4: Livelihood & Watershed](https://ifrap.org.pk/livelihood-support-and-watershed-management/)
- [World Bank — Measuring & Reporting Results (factsheet)](https://thedocs.worldbank.org/en/doc/7b776fece25d919127d83a8a6a396da2-0290032021/original/Measuring-and-reporting-results-factsheet.pdf)
- [World Bank IEG — Designing a Results Framework (how-to guide)](https://documents1.worldbank.org/curated/en/331541563854787772/pdf/Designing-a-Results-Framework-for-Achieving-Results-A-How-to-Guide.pdf)

---

*Prepared for the IFRAP FPMU · for validation with the World Bank TTL & MoPD&SI · Draft v1.0 · August 2026*
