# Scope & Milestones — World Bank Component 3 Anthropological Monitoring Platform

## Architecture
Next.js 15 App Router architecture with Vercel Edge SAML 2.0 / OIDC SSO RBAC Middleware, PostgreSQL with PostGIS & pgvector, Offline-first PWA (Service Worker + IndexedDB AES-256), NER PII Anonymization Pipeline, Vercel AI SDK + LangGraph Antigravity Agent with semantic vector RAG, and 5 domain-specific ESF Safeguard Modules.

## Milestones Table
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Infrastructure & SAML/RBAC Identity | Next.js 15 App Router compatibility, `middleware.ts` for Edge SAML/OIDC SSO RBAC route protection, PostGIS + pgvector database schema setup | None | PLANNED |
| M2 | Offline PWA & Data Privacy | Service Worker `public/sw.js`, Web App Manifest, client-side IndexedDB with AES-256 encrypted local storage, automated NER PII anonymization pipeline | M1 | PLANNED |
| M3 | AI Agent Orchestration & Vector RAG | Vercel AI SDK + LangGraph Antigravity Agent endpoint (`app/api/agent/route.ts`), pgvector semantic vector RAG retriever (`lib/rag/retriever.ts`) | M1 | PLANNED |
| M4 | ESF Safeguard Modules | 5 ESF modules: ESF Telemetry Portal, Field Anthropologist Log, GRM Ticketing Center, GIS Impact Mapper, M&E Results Engine | M1, M2, M3 | PLANNED |
| M5 | E2E Verification & Test Suite Integration | Update zero-dependency E2E test suite in `tests/` for all acceptance criteria (Edge SSO, PII redaction, IndexedDB offline sync, pgvector RAG queries) | M1, M2, M3, M4 | PLANNED |
| M6 | Forensic Integrity Audit & Victory Hand-off | Forensic Integrity Audit run (`teamwork_preview_auditor`), Victory Claim Report generation, Sentinel handoff | M1-M5 | PLANNED |

## Interface Contracts
### Edge Middleware (`middleware.ts`)
- Edge runtime execution guarding `/esf-telemetry`, `/field-log`, `/grm`, `/gis-impact`, `/me-results`, `/telemetry`, `/usufruct`, `/webgis`, `/api/export`, `/api/agent`.
- Public routes: `/`, `/login`, `/auth/sso`, `/_next`, `/public`.
- Parses SAML 2.0 / OIDC tokens and enforces RBAC roles (`FIELD_ENUMERATOR`, `PROVINCIAL_PIU`, `FPMU_DIRECTOR`).

### Offline Storage & PII Scrubbing (`lib/offline/`, `lib/privacy/`)
- `lib/offline/crypto-storage.ts`: Encrypts/decrypts client payload using Web Crypto API AES-GCM 256-bit.
- `lib/offline/indexed-db.ts`: IndexedDB database `AntigravityOfflineDB` with sync queue.
- `lib/privacy/ner-pii-scrubber.ts`: Redacts names, CNICs (`\d{5}-\d{7}-\d{1}`), phone/email, and rounds GPS coordinates (fuzzing).

### AI Agent & Vector RAG (`app/api/agent/route.ts`, `lib/rag/retriever.ts`)
- `app/api/agent/route.ts`: Streaming AI response using Vercel AI SDK `streamText` & LangGraph Antigravity state graph.
- `lib/rag/retriever.ts`: Executes cosine similarity search over `qualitative_field_logs` using `pgvector`.

### ESF Safeguard Modules (`app/esf-telemetry/`, `app/field-log/`, `app/grm/`, `app/gis-impact/`, `app/me-results/`)
- Standardized Next.js 15 App Router page routes & glassmorphic TSX components.

## Code Layout
```
anthropology_portfolio/
├── middleware.ts
├── public/
│   ├── sw.js
│   └── manifest.json
├── app/
│   ├── esf-telemetry/page.tsx
│   ├── field-log/page.tsx
│   ├── grm/page.tsx
│   ├── gis-impact/page.tsx
│   ├── me-results/page.tsx
│   ├── api/
│   │   ├── agent/route.ts
│   │   └── export/route.ts
├── components/
│   ├── esf/EsfTelemetryPortal.tsx
│   ├── field-log/FieldAnthropologistLog.tsx
│   ├── grm/GrmTicketingCenter.tsx
│   ├── gis-impact/GisImpactMapper.tsx
│   ├── me-results/MeResultsEngine.tsx
│   └── PwaRegister.tsx
├── lib/
│   ├── auth/saml-edge.ts
│   ├── offline/indexed-db.ts
│   ├── offline/crypto-storage.ts
│   ├── privacy/ner-pii-scrubber.ts
│   ├── agent/antigravity-graph.ts
│   ├── rag/retriever.ts
│   └── vector/pgvector-embeddings.ts
└── backend/
    ├── db/init_schema.sql
    └── pii_scrubber.py
```
