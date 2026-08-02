# Phase 2 (R2) Technical Gap Analysis & Architectural Specification
**World Bank Component 3 Anthropological Monitoring Platform ("Antigravity AI Agent Ecosystem")**
**Focus**: Offline-First PWA, IndexedDB AES-256 Encrypted Storage, and Automated PII Anonymization / NER Pipeline.

---

## Executive Summary
This document presents the comprehensive investigation of the `anthropology_portfolio` codebase against Phase 2 (R2) requirements. The platform currently possesses a functional Next.js 14 App Router frontend (with MapLibre WebGIS, M&E analytics widgets, Usufruct certificate generator, and SAML/RBAC auth wrappers) and an Express/Python ETL backend (`backend/ingest.js`, `backend/worker.py`). 

However, **Phase 2 (R2) requirements are entirely unimplemented** in the current repository:
1. **No PWA or Service Worker**: `public/` directory does not exist; zero service worker files (`public/sw.js`), web app manifests (`public/manifest.json`), or registration hooks are present.
2. **No IndexedDB or AES-256 Storage**: No client-side database (`lib/offline/` or `lib/storage/`) or Web Crypto AES-256 encryption layer exists. Network failures in forms (`UsufructGenerator.tsx`) cause error states without local persistence.
3. **No PII Anonymization or NER Pipeline**: Both `backend/worker.py` and `backend/ingest.js` process raw respondent names, CNIC numbers (`54400-1234567-1`), and exact GPS coordinates without scrubbing or anonymization before PostGIS database insertion.

Below is the exhaustive architectural specification of existing vs. required code assets for Phase 2 implementation.

---

## 1. Requirement 1: Offline-First PWA Implementation

### 1.1 Existing Code Base Assessment
- **`public/` directory**: Non-existent.
- **Service Worker (`public/sw.js`)**: Not present.
- **Manifest (`public/manifest.json` / `app/manifest.ts`)**: Not present.
- **Service Worker Registration**: Missing in `app/layout.tsx`.
- **Offline Network Detection**: `components/TelemetryDashboard.tsx` and `components/MEAnalyticsWidgets.tsx` have basic `try/catch` fallbacks to static JSON objects, but do not cache API network responses or allow offline form submission queueing.

### 1.2 Required Architecture for R2
To convert the platform into an enterprise-grade Progressive Web App (PWA):

#### A. Web App Manifest (`public/manifest.json` or `app/manifest.ts`)
- **Purpose**: Defines app installation attributes for mobile/desktop field devices.
- **Attributes**:
  - `name`: "World Bank Component 3 Anthropological Monitoring Platform"
  - `short_name`: "WB-IFRAP M&E"
  - `start_url`: "/"
  - `display`: "standalone"
  - `background_color`: "#0f172a" (Slate-900 canvas)
  - `theme_color`: "#0f172a"
  - `icons`: 192x192 and 512x512 maskable PNGs.

#### B. Custom Service Worker (`public/sw.js`)
- **Purpose**: Intercept network requests and serve cached assets/responses during offline field operations.
- **Caching Strategies**:
  1. **App Shell & Static Assets** (`/`, `/webgis`, `/telemetry`, `/fiduciary`, JS/CSS bundles): **Stale-While-Revalidate**.
  2. **API Data Endpoints** (`/api/export`, `/api/telemetry`): **Network-First with Cache Fallback**. Reads from Service Worker Cache / IndexedDB when offline.
  3. **Offline Fallback Page**: Serves custom offline shell (`/offline.html` or `/offline`) when navigator is offline and asset is not cached.
- **Events Handled**:
  - `install`: Pre-caches core app shell assets (`CACHE_NAME = 'wb-ifrap-v1'`).
  - `activate`: Cleans up legacy caches.
  - `fetch`: Implements caching routing strategy.
  - `sync`: Listens for `background-sync` events (tag: `sync-field-payloads`) to trigger IndexedDB queue flush.

#### C. Service Worker Registration Hook (`hooks/useServiceWorker.ts` / `components/PWARegister.tsx`)
- **Location**: `components/PWARegister.tsx` (imported into `app/layout.tsx`).
- **Functionality**:
  - Checks if `'serviceWorker' in navigator` and registers `/sw.js` on mount.
  - Tracks update states (`onupdatefound`) and provides user toast notification when a new version is available.

#### D. Offline Banner & Status Component (`components/OfflineIndicator.tsx`)
- **Location**: `components/OfflineIndicator.tsx` (integrated into `components/NavbarHeader.tsx` or sticky banner).
- **State**: Monitors `navigator.onLine`, `online` and `offline` window events.
- **UI**: Displays glowing amber glass badge (`[OFFLINE MODE - 3 Pending Syncs]`) when disconnected.

---

## 2. Requirement 2: IndexedDB Local AES-256 Encrypted Storage

### 2.1 Existing Code Base Assessment
- **`lib/offline/` or `lib/storage/`**: Non-existent.
- **Current Data Persistence**:
  - `components/UsufructGenerator.tsx`: Submits data to `/api/fiduciary` via `fetch`. On error, displays string error without offline retention.
  - `backend/ingest.js`: Express endpoint pushes raw JSON to Redis queue (`kobo_payloads`). If Redis is unavailable, it logs fallback warning without storing locally on client.
  - No client-side database or encryption algorithms present.

### 2.2 Required Architecture for R2
To guarantee client-side zero-trust data protection for offline field enumerators in Balochistan:

#### A. AES-256 Web Crypto Module (`lib/offline/crypto.ts`)
- **Purpose**: Encrypt all sensitive offline payloads (field logs, Usufruct certificates, Kobo survey responses) before storing in IndexedDB.
- **Algorithm**: `AES-GCM` with a 256-bit key.
- **Key Derivation**:
  - Uses `PBKDF2` with 100,000 iterations to derive an encryption key from a session secret / user ID salt (`crypto.subtle.deriveKey`).
  - Generates a unique 12-byte Initialization Vector (`IV`) per record.
- **Functions**:
  - `encryptPayload(data: object, key: CryptoKey): Promise<{ ciphertext: string, iv: string }>`
  - `decryptPayload(ciphertext: string, iv: string, key: CryptoKey): Promise<object>`
  - `getOrCreateSessionKey(): Promise<CryptoKey>` (persisted securely in memory / session storage).

#### B. IndexedDB Store Architecture (`lib/offline/db.ts`)
- **Database Name**: `WB_IFRAP_OfflineDB` (version 1).
- **Object Stores**:
  1. `pending_sync`: Primary queue for offline form submissions.
     - Key path: `id` (auto-generated UUID / timestamp).
     - Indexes: `type` (e.g. `USUFRUCT_CERT`, `FIELD_LOG`, `GRM_TICKET`, `KOBO_PAYLOAD`), `createdAt`, `status` (`PENDING`, `SYNCING`, `FAILED`).
     - Field contents: `encryptedData` (AES-256 string), `iv`, `endpoint`.
  2. `cached_api`: Local cache of M&E metrics and GIS layer data for offline viewing.
     - Key path: `key` (URL / endpoint string).
     - Field contents: `data` (encrypted/compressed JSON), `timestamp`.
  3. `pii_audit_log`: Client-side audit log recording scrubbing events.

#### C. Offline Sync Queue Manager (`lib/offline/syncManager.ts`)
- **Purpose**: Standardized API wrapper for forms across the Next.js app.
- **Workflow**:
  1. When form is submitted (`UsufructGenerator`, `FieldLogForm`, `GRMTicketForm`), `syncManager.submit(endpoint, payload)` checks `navigator.onLine`.
  2. If **Online**: Runs payload through client-side PII Scrubber -> posts to API endpoint. If network request fails, falls back to offline queue.
  3. If **Offline**:
     - Runs payload through PII Scrubber.
     - Encrypts payload with AES-256 key.
     - Writes encrypted envelope into IndexedDB `pending_sync` store.
     - Registers Service Worker Background Sync (`sw.sync.register('sync-field-payloads')`).
     - Returns `{ queued: true, status: 'QUEUED_OFFLINE' }` to UI.
  4. On **Reconnection**:
     - `window.addEventListener('online', syncManager.flushQueue)`.
     - Reads all `PENDING` records from IndexedDB.
     - Decrypts envelope -> posts to backend endpoint -> marks record as `SYNCED` or deletes from IndexedDB.
     - Dispatches custom browser event `offline-sync-complete` to update UI sync counters.

---

## 3. Requirement 3: Automated PII Anonymization & NER Pipeline

### 3.1 Existing Code Base Assessment
- **`backend/worker.py` Lines 100-136**: `extract_payload_data()` extracts raw `cnic` (`payload.get('cnic')`) and raw `name` (`payload.get('respondent_name')`), without redacting or anonymizing.
- **`backend/worker.py` Lines 144-152**: `process_payload_db()` executes:
  `INSERT INTO la_party (full_name, cnic_number, party_type) VALUES (%s, %s, 'Individual')` with unscrubbed name and CNIC strings.
- **`backend/ingest.js` Lines 42-72**: Validates presence of `cnic` and `name` without scrubbing.
- **`components/UsufructGenerator.tsx` Line 77-88**: Performs basic HTML sanitization against XSS (`sanitizeHtml`), but leaves raw beneficiary name in output payload.
- **No NER (Named Entity Recognition)** engine or anonymization rule set exists in `lib/` or `backend/`.

### 3.2 Required Architecture for R2
To comply with World Bank ESS5/ESS10 privacy directives and GoP data protection mandates, all field logs and survey payloads must pass through an automated PII anonymization pipeline before backend sync and database insertion.

#### A. Client-Side PII Scrubber Module (`lib/privacy/piiScrubber.ts`)
- **Purpose**: Scrubs sensitive data on the field enumerator device before storing in IndexedDB or transmitting over the network.
- **Scrubbing Modules**:
  1. **CNIC Anonymization Engine**:
     - Regex match for Pakistani CNICs: `/\b\d{5}[-\s]?\d{7}[-\s]?\d\b/g`.
     - Transformation: Computes HMAC-SHA256 hash using project salt: `CNIC_HASH_<sha256_prefix_12chars>`. Retains exact matching capability for DB deduplication without exposing raw 13-digit identity numbers.
  2. **Named Entity Recognition (NER) & Heuristic Name Masking**:
     - Regex heuristic patterns for person names (e.g. `Name:`, `Respondent:`, `Malik`, `Khan`, `Bibi`, `Son of`, `W/O`, `D/O`).
     - Dictionary & NLP Tokenizer: Matches common regional Pakistani names (Baloch, Pashtun, Brahui, Sindhi, Punjabi naming patterns).
     - Transformation: Replaces name tokens with deterministic pseudonyms `ANON_NAME_<hash_6chars>` or redacted placeholders `[REDACTED_PERSON]`.
  3. **Spatial Coordinate Obfuscation (Fuzzing Engine)**:
     - Safeguards vulnerable indigenous/customary communities by obfuscating high-precision GPS points in public/unprivileged field logs.
     - Adds controlled spatial noise (truncating latitude/longitude to 3 decimal places ~110m grid, or adding $\pm 0.001^\circ$ random offset) for non-PIU/non-FPMU operational logs while maintaining administrative district mapping (`district`, `tehsil`, `union_council`).
  4. **Free-Text Field Log Scrubbing**:
     - Scans qualitative anthropologist notes for telephone numbers (`/\b(\+92|03)\d{9}\b/g`), email addresses (`/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g`), and exact street addresses, replacing them with `[REDACTED_PHONE]`, `[REDACTED_EMAIL]`, `[REDACTED_LOCATION]`.

#### B. Backend Python NER Scrubbing Worker (`backend/privacy/ner_scrubber.py` or `backend/worker.py` enhancement)
- **Purpose**: Backend safety net for incoming KoboToolbox survey payloads (`backend/ingest.js` & `backend/worker.py`).
- **Python Implementation**:
  - Implements regex & spaCy / NLTK fallback NER regex scrubbers.
  - Updates `extract_payload_data()` in `backend/worker.py` to invoke `scrub_pii_payload(payload)` before SQL insertion into `la_party` and `la_spatial_unit`.
  - Ensures `la_party.full_name` receives `ANON_NAME_...` and `la_party.cnic_number` receives `CNIC_HASH_...`.

---

## 4. Implementation Inventory (Existing vs. Needed)

| Module / Component | Current File Path | Status | Planned Action for R2 Implementation |
|---|---|---|---|
| Service Worker | `public/sw.js` | ❌ Missing | Create custom SW with asset pre-caching, dynamic API caching, and background sync event listeners. |
| Web App Manifest | `public/manifest.json` | ❌ Missing | Create PWA manifest with theme colors, icons, display mode `standalone`. |
| SW Registration Component | `components/PWARegister.tsx` | ❌ Missing | Build client component registering `/sw.js` and wrap in `app/layout.tsx`. |
| Offline Network Banner | `components/OfflineIndicator.tsx` | ❌ Missing | Build glowing glass indicator displaying online/offline status and pending sync count. |
| Web Crypto AES-256 Engine | `lib/offline/crypto.ts` | ❌ Missing | Build Web Crypto API wrapper (AES-GCM-256, PBKDF2 key derivation, IV generation). |
| IndexedDB Database Wrapper | `lib/offline/db.ts` | ❌ Missing | Create IndexedDB store (`WB_IFRAP_OfflineDB`) for `pending_sync` and `cached_api`. |
| Offline Sync Manager | `lib/offline/syncManager.ts` | ❌ Missing | Build sync engine handling queue insertion, background sync, and online flush logic. |
| PII Scrubber & NER Engine (JS) | `lib/privacy/piiScrubber.ts` | ❌ Missing | Build CNIC hashing, NER name masking, phone/email redaction, and coordinate fuzzing. |
| Python NER Scrubbing Module | `backend/privacy/ner_scrubber.py` | ❌ Missing | Create Python PII scrubber module for KoboToolbox payloads. |
| Python ETL Worker Scrubbing | `backend/worker.py` | ⚠️ Incomplete | Refactor `extract_payload_data` & `process_payload_db` to sanitize CNIC/Names via NER scrubber. |
| Express Ingestion Listener | `backend/ingest.js` | ⚠️ Incomplete | Add payload PII pre-validation and scrubbing before Redis queueing. |
| Usufruct Generator Form | `components/UsufructGenerator.tsx` | ⚠️ Incomplete | Integrate `syncManager` for encrypted IndexedDB queueing when offline. |
| App Root Layout | `app/layout.tsx` | ⚠️ Incomplete | Add `PWARegister` and manifest link to root HTML `<head>`. |

---

## 5. Risk Assessment & Verification Strategy

### 5.1 Technical Risks
1. **IndexedDB Browser Support**: Web Crypto API and IndexedDB require secure contexts (`https://` or `localhost`). Fallback in-memory storage must be provided for non-secure test runners.
2. **PostGIS Schema Compatibility**: CNIC hashes (`CNIC_HASH_...`) must fit within `la_party.cnic_number` column width defined in `backend/db/init_schema.sql` (VARCHAR(64)).
3. **PWA Cache Invalidation**: Stale-while-revalidate strategy must avoid caching SAML auth endpoints (`/api/auth/*`) to prevent session leakage.

### 5.2 Verification Strategy
- **Unit & E2E Testing**:
  - Verify Service Worker registration and caching in build output (`npm run build`).
  - Test Web Crypto AES-256 encryption/decryption roundtrip with mock payloads.
  - Test PII scrubber against raw Pakistani CNICs (`54400-1234567-1`), names ("Gul Khan"), and GPS coordinates.
  - Verify offline form submission queues into IndexedDB when `navigator.onLine = false` and auto-flushes when `online`.
