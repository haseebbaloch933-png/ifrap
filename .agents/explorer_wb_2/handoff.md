# Handoff Report — Explorer 2 (Offline PWA & Data Privacy)

**Agent Role**: Explorer 2 (Offline PWA & Data Privacy)  
**Milestone**: Phase 2 (R2) Investigation & Specification  
**Working Directory**: `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_wb_2`  
**Target Project**: World Bank Component 3 Anthropological Monitoring Platform (`C:\Users\Administrator\teamwork_projects\anthropology_portfolio`)

---

## 1. Observation

Direct evidence collected during codebase inspection of `C:\Users\Administrator\teamwork_projects\anthropology_portfolio`:

1. **Absence of PWA Assets & Service Worker Configuration**:
   - `public/` directory does NOT exist at project root (`C:\Users\Administrator\teamwork_projects\anthropology_portfolio\public`).
   - Neither `public/sw.js` nor `public/manifest.json` exist.
   - `package.json` contains dependencies `next` (v14.2.15), `react`, `framer-motion`, `mapbox-gl`, `express`, `redis`, `pg`, `next-auth`, but does NOT contain `next-pwa` or workbox libraries.
   - `app/layout.tsx` lacks `<link rel="manifest">` and Service Worker registration hooks.

2. **Absence of Client-Side Local Encrypted Storage**:
   - No `lib/offline/` or `lib/storage/` directory exists.
   - `components/UsufructGenerator.tsx` (lines 91-103) executes direct `fetch('/api/fiduciary')`. When a network request fails, line 117 catches the error (`setValidationError(...)`), but does NOT store the payload locally in IndexedDB.
   - Web Crypto AES-256 encryption engine (`crypto.subtle`) is not implemented anywhere in `lib/`.

3. **Absence of Automated PII Anonymization & NER Pipeline**:
   - `backend/worker.py` (lines 100-136, 144-187): `extract_payload_data` extracts raw `cnic` (line 100) and raw `name` (line 106). `process_payload_db` inserts raw `name` and `cnic` directly into `la_party` (`INSERT INTO la_party (full_name, cnic_number, party_type) VALUES (%s, %s, 'Individual')`).
   - `backend/ingest.js` (lines 42-72): `validatePayload` checks presence of unredacted `cnic` or `respondent_name` strings without applying anonymization or regex scrubbing before Redis queueing (`kobo_payloads`).
   - No Named Entity Recognition (NER) pipeline or regex scrubbing module exists in `lib/privacy/`, `lib/ner/`, or `backend/privacy/`.

---

## 2. Logic Chain

1. **From Observation 1**: Because `public/` and `sw.js` do not exist, the Next.js application runs as a standard Web application without service worker caching. If a field monitor in offline areas of Balochistan loses internet connectivity, page reloads fail and static asset bundles cannot be served.
   - *Deduction*: To achieve R2 compliance, a custom Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.json`), SW Registration Component (`components/PWARegister.tsx`), and Offline Banner (`components/OfflineIndicator.tsx`) must be created.

2. **From Observation 2**: Because `lib/offline/` is missing and `UsufructGenerator.tsx` relies exclusively on online `fetch` calls, offline form submissions fail without local retention.
   - *Deduction*: To achieve R2 compliance, an IndexedDB database (`WB_IFRAP_OfflineDB` in `lib/offline/db.ts`) with Web Crypto AES-256 encryption (`lib/offline/crypto.ts`) and an offline sync manager (`lib/offline/syncManager.ts`) must be built to buffer and auto-sync forms upon network reconnection.

3. **From Observation 3**: Because `backend/worker.py` and `backend/ingest.js` process raw respondent names and CNIC numbers (e.g. `54400-1234567-1`) without scrubbing, confidential personal identity information (PII) is exposed in PostGIS database records (`la_party`) and telemetry logs, violating World Bank ESS5/ESS10 directives.
   - *Deduction*: To achieve R2 compliance, a PII Anonymization / NER Scrubbing pipeline (`lib/privacy/piiScrubber.ts` and `backend/privacy/ner_scrubber.py`) must be implemented to redact/hash names, CNIC numbers, phone/email strings, and fuzz spatial coordinates prior to local storage or backend persistence.

---

## 3. Caveats

- **Network Constraints**: The investigation was conducted in `CODE_ONLY` mode. External NPM package installation (e.g. `npm install next-pwa idb`) was not executed. The proposed architecture relies on native Web APIs (native Service Worker API, native `window.indexedDB`, and native `window.crypto.subtle`) to ensure complete offline reliability without third-party runtime external dependencies.
- **PostgreSQL / Redis Running Environment**: Database insertions in `backend/worker.py` operate in resilient dry-run mode when live PostgreSQL / Redis containers are offline. PII scrubbing must function identically in both dry-run and live database execution modes.

---

## 4. Conclusion

The current codebase (`anthropology_portfolio`) provides solid Phase 1 foundations (Next.js 14 App Router, WebGIS mapping, SAML auth wrappers, Express/Python ETL backend). However, **Phase 2 (R2) requirements are 100% unimplemented**. 

To fulfill R2, the implementer agent must execute the following 3 core tasks:
1. **PWA Infrastructure**: Create `public/manifest.json`, `public/sw.js`, `components/PWARegister.tsx`, and `components/OfflineIndicator.tsx`.
2. **Encrypted Offline Storage**: Create `lib/offline/crypto.ts` (AES-256-GCM Web Crypto), `lib/offline/db.ts` (IndexedDB queue), `lib/offline/syncManager.ts` (auto-sync manager), and integrate into `components/UsufructGenerator.tsx`.
3. **Automated PII/NER Pipeline**: Create `lib/privacy/piiScrubber.ts` (JS CNIC hashing, NER name masking, coordinate fuzzing) and `backend/privacy/ner_scrubber.py` (Python PII worker sanitizer), updating `backend/worker.py` and `backend/ingest.js`.

Detailed architectural specifications and component schemas are documented in `C:\Users\Administrator\teamwork_projects\anthropology_portfolio\.agents\explorer_wb_2\analysis.md`.

---

## 5. Verification Method

To independently verify the investigation findings and subsequent R2 implementation:

1. **Inspect Code Files**:
   - Check if `public/sw.js` and `public/manifest.json` exist.
   - Check if `lib/offline/crypto.ts`, `lib/offline/db.ts`, `lib/offline/syncManager.ts`, and `lib/privacy/piiScrubber.ts` exist.
   - Check if `backend/worker.py` invokes PII scrubbing before PostGIS SQL execution.

2. **Programmatic Verification Commands**:
   - Next.js build compilation: `npm run build`
   - Python worker dry-run: `python backend/worker.py --dry-run`
   - Test suite execution: `npm test` or `node tests/run-tests.js`

3. **Invalidation Conditions**:
   - Any raw CNIC (`\d{5}-\d{7}-\d`) or unredacted respondent name stored directly in PostGIS `la_party` table or IndexedDB queue without `CNIC_HASH_` or `ANON_NAME_` prefix.
   - Network failure on form submission resulting in unrecoverable data loss instead of IndexedDB encrypted queueing.
