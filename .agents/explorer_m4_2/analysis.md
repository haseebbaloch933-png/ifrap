# Milestone 4 Technical Requirements & Data Structure Analysis
**Component**: Security & Fiduciary Shield Usufruct Generator (`lib/firebase-sim.ts` and `components/UsufructGenerator.tsx`)
**Author**: `explorer_m4_2`
**Date**: 2026-07-23

---

## 1. Executive Summary & Architectural Overview

Milestone 4 implements the **Security & Fiduciary Shield Usufruct Generator** for the Next.js Applied Anthropology Portfolio & M&E Telemetry Dashboard. The system provides indigenous communities and tribal federations in Balochistan with a cryptographically verifiable digital ledger for customary water and land rights (Karez irrigation systems).

### Core Components:
1. **Simulated Firebase SDK (`lib/firebase-sim.ts`)**:
   - Manages state for certificates, claims, and compliance audit logs.
   - Calculates cryptographic SHA-256 block hash attestations (Web Crypto API + Node.js fallback).
   - Tracks real-time document synchronization state (`SYNCED`, `VERIFIED`, `REGISTERED`).
   - Exposes listener registration for live UI synchronization.
   - Provides compatibility functions (`createMockFirebase`) matching E2E test runner specs (`tier3`, `tier4`).

2. **Usufruct Rights Generator Component (`components/UsufructGenerator.tsx`)**:
   - Interactive Client Component (`'use client'`).
   - Form fields: Community Name (`clan`), District (`district`), Karez Parcel ID (`parcelId`), Customary Water Volume (`customaryWaterVolume`), Area Hectares (`areaHectares`), Karez Canal ID (`karezCanalId`), Trustee Signature (`trusteeSignature`), and Customary Rights Type (`customaryRightsType`).
   - Input sanitization & validation (XSS defense, numerical bounds, SQL/NoSQL payload filtering).
   - Real-time digital ledger UI with Tailwind glassmorphism (`backdrop-blur-md`, `backdrop-blur-xl`, translucency, glowing status badges).
   - Offline queueing via `localStorage` and automatic re-sync on network reconnect.

3. **Page Integration (`app/fiduciary/page.tsx`)**:
   - App Router page presenting the Usufruct Certificate Generator, executive statistics summary, and legal compliance context.

---

## 2. `lib/firebase-sim.ts` Requirements & Data Structures

### 2.1 TypeScript Type Definitions

```typescript
export type SyncStatus = 'SYNCED' | 'VERIFIED' | 'REGISTERED';

export type CustomaryRightsType =
  | 'INALIENABLE_COMMUNAL_USUFRUCT'
  | 'TEMPORARY_SEASONAL'
  | 'CUSTOMARY_WATER_RIGHT'
  | 'PASTORAL_PASTURE_ACCESS';

export interface UsufructCertificate {
  id: string;
  clan: string;
  district: string;
  parcelId: string;
  areaHectares: number;
  customaryWaterVolume: number; // m3/day or cusecs
  karezCanalId: string;
  trusteeSignature: string;
  customaryRightsType: CustomaryRightsType | string;
  hash: string; // Cryptographic SHA-256 block hash attestation
  status: SyncStatus;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
  metadata?: Record<string, any>;
}

export interface ComplianceLogEntry {
  id: string;
  timestamp: string; // ISO 8601 timestamp
  action: 'ADD' | 'SET' | 'VERIFY' | 'SYNC' | 'REGISTER' | 'CERTIFICATE_ISSUED';
  path: string;
  data?: any;
  hash?: string;
  previousHash?: string;
}

export interface OfflineClaim {
  clan: string;
  district?: string;
  parcelId?: string;
  area?: number;
  areaHectares?: number;
  customaryWaterVolume?: number;
  karezCanalId?: string;
  trusteeSignature?: string;
  customaryRightsType?: string;
  timestamp: number;
}
```

### 2.2 Cryptographic Hash Calculation Strategy

`lib/firebase-sim.ts` requires a robust SHA-256 calculation method that functions seamlessly across both Browser execution (`'use client'`) and Node.js server/testing environments.

```typescript
import crypto from 'crypto';

/**
 * Computes a SHA-256 cryptographic hash attestation block for a given input payload.
 * Supports Web Crypto API in browser environments and Node.js 'crypto' module fallback.
 */
export async function calculateSHA256(data: string | object): Promise<string> {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
  
  // 1. Web Crypto API in Browser
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(jsonString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // 2. Node.js Crypto Module Fallback
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Synchronous SHA-256 hash generator for node test execution
 */
export function calculateSHA256Sync(data: string | object): string {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}
```

### 2.3 In-Memory State & Event Subscription API

`lib/firebase-sim.ts` should maintain an internal reactive state store with subscriber notifications:

```typescript
class FirebaseSimEngine {
  private certificates = new Map<string, UsufructCertificate>();
  private claims = new Map<string, any>();
  private ledgerLogs: ComplianceLogEntry[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.seedDefaultData();
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public getCertificates(): UsufructCertificate[] {
    return Array.from(this.certificates.values());
  }

  public getLedgerLogs(): ComplianceLogEntry[] {
    return [...this.ledgerLogs];
  }

  public async addCertificate(
    input: Omit<UsufructCertificate, 'id' | 'hash' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<UsufructCertificate> {
    const id = `doc_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();
    
    // Hash payload includes essential proof fields
    const hashPayload = {
      id,
      clan: input.clan,
      district: input.district,
      parcelId: input.parcelId,
      areaHectares: input.areaHectares,
      customaryWaterVolume: input.customaryWaterVolume,
      karezCanalId: input.karezCanalId,
      trusteeSignature: input.trusteeSignature,
      customaryRightsType: input.customaryRightsType,
      createdAt: now,
    };
    
    const hash = await calculateSHA256(hashPayload);
    const cert: UsufructCertificate = {
      ...input,
      id,
      hash,
      status: 'SYNCED',
      createdAt: now,
      updatedAt: now,
    };

    this.certificates.set(id, cert);
    this.logEvent('ADD', `usufruct_certificates/${id}`, cert, hash);
    this.notify();
    return cert;
  }

  public async updateCertificateStatus(id: string, status: SyncStatus): Promise<UsufructCertificate> {
    const cert = this.certificates.get(id);
    if (!cert) throw new Error(`Certificate ${id} not found`);

    const updatedCert: UsufructCertificate = {
      ...cert,
      status,
      updatedAt: new Date().toISOString(),
    };

    const action = status === 'VERIFIED' ? 'VERIFY' : status === 'REGISTERED' ? 'REGISTER' : 'SET';
    this.certificates.set(id, updatedCert);
    this.logEvent(action, `usufruct_certificates/${id}`, updatedCert, updatedCert.hash);
    this.notify();
    return updatedCert;
  }

  public logEvent(
    action: ComplianceLogEntry['action'],
    path: string,
    data?: any,
    hash?: string
  ): ComplianceLogEntry {
    const prevLog = this.ledgerLogs[this.ledgerLogs.length - 1];
    const logEntry: ComplianceLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      path,
      data,
      hash,
      previousHash: prevLog ? prevLog.hash : '0000000000000000000000000000000000000000000000000000000000000000',
    };
    this.ledgerLogs.push(logEntry);
    return logEntry;
  }

  public async syncOfflineClaims(claims: any[]): Promise<UsufructCertificate[]> {
    const synced: UsufructCertificate[] = [];
    for (const claim of claims) {
      const cert = await this.addCertificate({
        clan: claim.clan || 'Unknown Clan',
        district: claim.district || 'Pishin',
        parcelId: claim.parcelId || `PARCEL-${Date.now()}`,
        areaHectares: claim.areaHectares || claim.area || 10,
        customaryWaterVolume: claim.customaryWaterVolume || 500,
        karezCanalId: claim.karezCanalId || 'KAREZ-SYS-01',
        trusteeSignature: claim.trusteeSignature || 'Verified Offline Elder',
        customaryRightsType: claim.customaryRightsType || 'INALIENABLE_COMMUNAL_USUFRUCT',
      });
      synced.push(cert);
    }
    return synced;
  }
}
```

### 2.4 E2E Test Compatibility Export (`createMockFirebase`)

`lib/firebase-sim.ts` must also export a factory function or object compatible with `createMockFirebase()` as specified in `tests/e2e/tier4_security.test.js`:

```typescript
export function createMockFirebase() {
  const store: Record<string, any> = {};
  const ledgerLogs: ComplianceLogEntry[] = [];

  return {
    auth: {
      currentUser: { uid: 'usr_test_123', email: 'auditor@applied-anthropology.org' },
      signInWithCustomToken: async () => true,
    },
    firestore: {
      collection: (name: string) => ({
        doc: (id: string) => ({
          set: async (data: any) => {
            store[`${name}/${id}`] = { ...data, updatedAt: new Date().toISOString() };
            ledgerLogs.push({
              id: `log_${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'SET',
              path: `${name}/${id}`,
              data,
            });
            return true;
          },
          get: async () => ({
            exists: Boolean(store[`${name}/${id}`]),
            data: () => store[`${name}/${id}`],
          }),
        }),
        add: async (data: any) => {
          const id = 'doc_' + Math.random().toString(36).substr(2, 9);
          store[`${name}/${id}`] = { ...data, createdAt: new Date().toISOString() };
          ledgerLogs.push({
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'ADD',
            path: `${name}/${id}`,
            data,
          });
          return { id };
        },
      }),
    },
    ledgerLogs,
    store,
  };
}
```

---

## 3. `components/UsufructGenerator.tsx` Component Requirements

### 3.1 State Management & Controlled Input Fields

`components/UsufructGenerator.tsx` manages the interactive form state and digital ledger view:

| Field Name | Type | UI Control | Validation Constraints |
|---|---|---|---|
| `clan` | string | Text Input | Non-empty, min 2 chars, XSS sanitized |
| `district` | string | Text Input | Non-empty, default "Pishin" |
| `parcelId` | string | Text Input | Alphanumeric with dashes (`KAREZ-PISHIN-44`) |
| `areaHectares` | number | Number Input | > 0, <= 1,000,000 hectares |
| `customaryWaterVolume` | number | Number Input | > 0 m3/day |
| `karezCanalId` | string | Text Input | Non-empty |
| `trusteeSignature` | string | Text Input | Non-empty string signature |
| `customaryRightsType` | string | Select Dropdown | Valid option from `CustomaryRightsType` |

### 3.2 Security & Input Sanitization Logic

To satisfy adversarial security tests (`TC-T5-01` and `TC-T2-F4-04`):

```typescript
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/(\$|DROP|DELETE|UPDATE|INSERT|SELECT|--|;)/gi, '');
}
```

### 3.3 Digital Ledger UI & Glassmorphic Design

The UI must implement Tailwind CSS glassmorphic aesthetics:
- Container backdrop blur: `backdrop-blur-xl bg-slate-900/65 border border-white/12 shadow-2xl`
- Input field styling: `bg-slate-950/60 backdrop-blur-md border border-white/15 text-slate-100 placeholder-slate-400 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/20`
- Status Badges:
  - **SYNCED**: `bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm shadow-[0_0_12px_rgba(245,158,11,0.2)]`
  - **VERIFIED**: `bg-teal-500/20 text-teal-300 border border-teal-500/40 backdrop-blur-sm shadow-[0_0_12px_rgba(45,212,191,0.2)]`
  - **REGISTERED**: `bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm shadow-[0_0_12px_rgba(16,185,129,0.2)]`
- Real-Time Digital Ledger Panel:
  - Displays audit logs with truncated block hash (e.g. `e3b0c442...8557`).
  - Action buttons to advance certificate verification status (`SYNCED` -> `VERIFIED` -> `REGISTERED`).
  - Certificate detail drawer / modal displaying official document preview, QR code placeholder, trustee signature badge, and JSON export button.

### 3.4 Offline Resilience & Auto Re-Sync Workflow (`TC-T4-05`)

```typescript
useEffect(() => {
  const handleOnline = async () => {
    const rawQueue = localStorage.getItem('pending_claims');
    if (!rawQueue) return;
    try {
      const claims = JSON.parse(rawQueue);
      if (Array.isArray(claims) && claims.length > 0) {
        await firebaseSim.syncOfflineClaims(claims);
        localStorage.removeItem('pending_claims');
      }
    } catch (e) {
      console.error('Failed to sync offline claims', e);
    }
  };

  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, []);
```

---

## 4. `app/fiduciary/page.tsx` Integration Plan

The `/fiduciary` page will serve as the dedicated route:
1. **Header & Context Hero**:
   - Title: *Security & Fiduciary Shield Usufruct Generator*
   - Subtitle: *Decolonial Customary Rights & Karez Water Governance Ledger for Applied Anthropology*
   - Badges: `Web Crypto SHA-256`, `Inalienable Usufruct`, `Real-Time Audit Stream`
2. **Stat Cards Section**:
   - Total Registered Certificates
   - Protected Land Hectares
   - Active Karez Irrigation Systems
   - Verification Consensus Rate
3. **Main Workspace Component**:
   - `<UsufructGenerator />`

---

## 5. Summary of Recommended Implementer Action Items

1. Create `lib/firebase-sim.ts`:
   - Export interfaces `SyncStatus`, `CustomaryRightsType`, `UsufructCertificate`, `ComplianceLogEntry`.
   - Implement `calculateSHA256` supporting browser Web Crypto API + Node fallback.
   - Implement `firebaseSim` instance with `addCertificate`, `updateCertificateStatus`, `getLedgerLogs`, `subscribe`, `syncOfflineClaims`.
   - Export `createMockFirebase` compatibility function for test suite runner.

2. Create `components/UsufructGenerator.tsx`:
   - Mark as `'use client'`.
   - Build form with inputs: `clan`, `district`, `parcelId`, `areaHectares`, `customaryWaterVolume`, `karezCanalId`, `trusteeSignature`, `customaryRightsType`.
   - Implement `sanitizeInput` for security.
   - Implement digital ledger view with real-time audit log stream and status transition controls.
   - Implement glassmorphic styling (`backdrop-blur-md`/`xl`, translucency, glow effects).

3. Create `app/fiduciary/page.tsx`:
   - Export `FiduciaryPage`.
   - Include metadata/header, summary stats, and `<UsufructGenerator />`.

4. Run Test Suite:
   - Execute `& "C:\Program Files\nodejs\node.exe" tests/run-tests.js`.
   - Verify all 80 tests pass cleanly.
