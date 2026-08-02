# Milestone 4: Testing & Page Integration Strategy Analysis

## 1. Executive Summary

This report establishes the comprehensive testing, component architecture, and page integration strategy for **Milestone 4: Security & Fiduciary Shield**.

The investigation confirms that the project relies on a zero-dependency native Node.js test runner (`tests/run-tests.js`) that evaluates 5 tiers of tests. Currently, 80 tests pass cleanly (100% pass rate) and `next build` compiles without errors.

Milestone 4 introduces three key files:
1. `lib/firebase-sim.ts`: Simulated Firebase SDK for cryptographic attestations, compliance validation logging, and document synchronization state management.
2. `components/UsufructGenerator.tsx`: Client component rendering an interactive form for Usufruct Rights Certificate issuance, live digital ledger feed, and status state badges (`SYNCED`, `VERIFIED`, `REGISTERED`).
3. `app/fiduciary/page.tsx`: Next.js App Router Server Component providing page routing, layout, and static SEO metadata export for the `/fiduciary` path.

---

## 2. Codebase Architecture & File Relationships

```
anthropology_portfolio/
├── app/
│   ├── layout.tsx                # Global Glassmorphic layout (includes nav link to /fiduciary)
│   └── fiduciary/
│       └── page.tsx              # Server Component: SEO metadata + renders UsufructGenerator
├── components/
│   ├── GlassCard.tsx             # Reusable glassmorphic container component
│   └── UsufructGenerator.tsx     # Client Component ('use client'): form, preview, digital ledger UI
├── lib/
│   └── firebase-sim.ts           # Simulated Firebase SDK: SHA-256 attestations, ledger logs, sync state
└── tests/
    ├── run-tests.js              # Native Node.js CLI test runner
    ├── utils/
    │   ├── ast-helpers.js        # File presence, AST pattern matching, export assertions
    │   └── mock-context.js       # Window, DOM, LocalStorage & Firebase mock helpers
    └── e2e/
        ├── tier1_ui_arch.test.js # Tier 1 structural & export assertions
        ├── tier2_webgis.test.js  # Tier 2 boundary & validation tests
        ├── tier3_telemetry.test.js # Tier 3 integration & state sync tests
        ├── tier4_security.test.js  # Tier 4 real-world user workflow tests
        └── tier5_seo_hardening.test.js # Tier 5 security & sanitization tests
```

---

## 3. Test Runner Infrastructure Analysis

- **Execution Command**: `node tests/run-tests.js` (or `npm test` via npm script).
- **Environment**: Node.js v24.18.0 native runtime.
- **Reporting**: Writes JSON execution reports to `tests/reports/e2e-report.json` and updates `TEST_READY.md`.
- **Mock Infrastructure**: `tests/utils/mock-context.js` provides `createMockFirebase()`, `createMockWindow()`, and `createMockNextRequest()`.
- **Integrity Constraints**: Zero hardcoded test values, no fake test passes. All tests must verify real exported functions, AST structures, or dynamic state logic.

---

## 4. Unit Test Specifications for `lib/firebase-sim.ts`

`lib/firebase-sim.ts` acts as the simulated backend service for legal compliance and cryptographic record verification.

### Suite 1: Cryptographic Hash & Attestation Generator
- **UT-FB-01: SHA-256 Attestation Format**:
  - *Input*: `{ communityName: 'Kakar Tribal Council', waterVolume: 500, karezId: 'KAREZ-PISHIN-44' }`
  - *Expected*: `generateAttestation(payload)` returns a 64-character hexadecimal SHA-256 hash string.
- **UT-FB-02: Hash Determinism & Tamper Detection**:
  - *Input*: Two identical record objects vs. one modified record (e.g. `waterVolume: 501`).
  - *Expected*: Identical objects yield identical hashes; modified object yields a distinctly different hash.

### Suite 2: Document Sync State Machine (`SYNCED` -> `VERIFIED` -> `REGISTERED`)
- **UT-FB-03: Certificate Initialization**:
  - *Input*: `createCertificate(data)`
  - *Expected*: Newly created certificate record has `status: 'SYNCED'` and a valid timestamp.
- **UT-FB-04: Status Transition to VERIFIED**:
  - *Input*: `updateSyncStatus(certificateId, 'VERIFIED')`
  - *Expected*: Status transitions to `'VERIFIED'`, updating `updatedAt` timestamp and logging a `STATUS_UPDATE` compliance event.
- **UT-FB-05: Status Transition to REGISTERED**:
  - *Input*: `updateSyncStatus(certificateId, 'REGISTERED')`
  - *Expected*: Status transitions to `'REGISTERED'`, setting legal ledger lock.
- **UT-FB-06: Invalid Status Transition Prevention**:
  - *Input*: Direct leap from `'SYNCED'` to `'REGISTERED'` without verification or passing an invalid status string.
  - *Expected*: Throws an error or returns `false`, preserving current status.

### Suite 3: Compliance Validation Logging
- **UT-FB-07: Event Logging Contract**:
  - *Input*: `logComplianceEvent('CERTIFICATE_ISSUED', { holder: 'Tribal Elders Council' })`
  - *Expected*: Log entry created with `id`, `timestamp`, `action`, `metadata`, `hash`, and `status`.
- **UT-FB-08: Log Retrieval & Filtering**:
  - *Input*: `getComplianceLogs()` and `getComplianceLogs({ action: 'CERTIFICATE_ISSUED' })`
  - *Expected*: Returns array of logs sorted descending by timestamp; filtered call returns only matching action records.

### Suite 4: Offline Queue & Re-sync Handling
- **UT-FB-09: Offline Enqueuing**:
  - *Input*: `queueOfflineClaim(claimData)` when `isOnline` is set to `false`.
  - *Expected*: Claim added to offline queue array and saved in local storage fallback.
- **UT-FB-10: Re-sync Execution**:
  - *Input*: `syncOfflineQueue()` when `isOnline` transitions to `true`.
  - *Expected*: All queued items processed into simulated Firestore collection, compliance events logged, offline queue cleared.

---

## 5. Component Test Specifications for `components/UsufructGenerator.tsx`

`components/UsufructGenerator.tsx` is an interactive Client Component ('use client').

### Suite 1: Rendering & Form Controls
- **CT-UG-01: Form Field Verification**:
  - *Check*: Renders 4 input controls: Community Name (`communityName`), Customary Water Volume (`waterVolume`), Karez Canal ID (`karezId`), Trustee Signature (`trusteeSignature`).
- **CT-UG-02: Digital Ledger UI Render**:
  - *Check*: Renders digital ledger feed panel displaying log entries with timestamps, action labels, block hashes, and status badges.
- **CT-UG-03: Glassmorphic Styling**:
  - *Check*: Form container includes `backdrop-blur-md`, `bg-slate-900/60`, and `border-white/10` classes.

### Suite 2: Form Interaction & Validation
- **CT-UG-04: Required Fields Validation**:
  - *Trigger*: Click "Generate Certificate" button with empty fields.
  - *Expected*: Renders validation error text for required fields; submission is blocked.
- **CT-UG-05: Positive Numeric Bound Protection**:
  - *Trigger*: Enter negative or zero value in `waterVolume`.
  - *Expected*: Renders error message "Water volume must be a positive number".
- **CT-UG-06: Sanitization & XSS Prevention**:
  - *Trigger*: Enter `<script>alert('xss')</script>` in Karez ID or Community Name.
  - *Expected*: Sanitizes string before state update/preview render.

### Suite 3: Certificate Generation & Real-Time Sync
- **CT-UG-07: Certificate Preview Issuance**:
  - *Trigger*: Fill valid fields and submit form.
  - *Expected*: Renders Certificate Preview displaying Community Name, Volume, Karez ID, Trustee Signature, and generated SHA-256 block hash.
- **CT-UG-08: Automatic Ledger Feed Update**:
  - *Trigger*: Successful form submission.
  - *Expected*: A new compliance log item appears in the Digital Ledger feed showing action `'CERTIFICATE_ISSUED'` and status `'SYNCED'`.
- **CT-UG-09: Interactive Status Transition Buttons**:
  - *Trigger*: Click "Verify" or "Register" button on a ledger item.
  - *Expected*: Badge updates live from `SYNCED` -> `VERIFIED` -> `REGISTERED`.

---

## 6. Page Integration Strategy for `app/fiduciary/page.tsx`

### Architectural Rules:
1. **Server Component Page**:
   - `app/fiduciary/page.tsx` MUST NOT contain `'use client'`.
   - It serves as a Next.js Server Component to allow exporting static `metadata`.
2. **Metadata Configuration**:
   ```typescript
   import type { Metadata } from 'next';
   import UsufructGenerator from '@/components/UsufructGenerator';

   export const metadata: Metadata = {
     title: 'Fiduciary Shield & Usufruct Rights Ledger | AnthropoGIS',
     description: 'Cryptographic attestation, customary legal water rights certification, and compliance ledger for Balochistan Karez management.',
     keywords: [
       'Fiduciary Shield',
       'Usufruct Rights',
       'Karez Water Rights',
       'Balochistan',
       'Compliance Ledger',
       'Decolonial Water Management',
     ],
   };

   export default function FiduciaryPage() {
     return (
       <div className="space-y-8 max-w-7xl mx-auto">
         <div className="border-b border-white/10 pb-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono mb-3">
             Milestone 4 • Security & Fiduciary Shield
           </div>
           <h1 className="text-3xl font-bold text-slate-100">
             Fiduciary Shield & Usufruct Rights Ledger
           </h1>
           <p className="text-slate-400 mt-2 max-w-3xl">
             Customary legal water rights certification, cryptographic block hash attestation, and real-time compliance validation ledger for Balochistan Karez systems.
           </p>
         </div>

         <UsufructGenerator />
       </div>
     );
   }
   ```
3. **Header Link Compatibility**:
   - `app/layout.tsx` already contains link pointing to `/fiduciary`.

---

## 7. Verification Method

1. **Static Analysis & Structure Verification**:
   - Verify `lib/firebase-sim.ts`, `components/UsufructGenerator.tsx`, and `app/fiduciary/page.tsx` exist.
   - Run static assertions in `tests/e2e/tier1_ui_arch.test.js`.

2. **Automated Test Execution**:
   - Run `node tests/run-tests.js` to verify all test tiers (Tiers 1-5) pass with 100% pass rate.

3. **Production Build Verification**:
   - Run `node node_modules/next/dist/bin/next build` (or `npm run build`) to ensure TypeScript compilation, App Router metadata export, and bundle generation complete with 0 errors.
