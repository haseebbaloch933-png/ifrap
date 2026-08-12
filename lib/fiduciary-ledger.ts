/**
 * Shared usufruct (customary-tenure) certificate ledger definitions.
 *
 * Extracted so BOTH the issuance/list route (app/api/fiduciary/route.ts) and
 * the data-export route (app/api/export/route.ts) read the SAME record shape,
 * collection name, canonical hash, and demo seed from one source of truth.
 *
 * Previously the export route read a separate, orphaned in-memory store
 * (lib/firebase-sim) that the live issuance flow never wrote to, so its
 * usufruct export was always empty and disconnected from the real ledger. Both
 * paths now go through the persistence seam (lib/server/store) under this
 * collection, so an export contains exactly the certificates a reviewer sees
 * on the fiduciary screen (including the demo seed).
 */
import crypto from 'crypto';
import { IS_DEMO } from '@/lib/demo-mode';

/** Persistence-seam collection key for issued usufruct certificates. */
export const FIDUCIARY_COLLECTION = 'usufruct-certs';

export interface UsufructCertRecord {
  id: string;
  certNumber: string;
  beneficiary: string;
  clan: string;
  district: string;
  parcelId: string;
  areaHectares: number;
  customaryRightsType: string;
  issuedAt: string;
  hash: string;
  status: 'ACTIVE';
}

/** Canonical SHA-256 fingerprint over the cert's identifying fields. */
export function certHash(
  c: Pick<UsufructCertRecord, 'certNumber' | 'beneficiary' | 'parcelId' | 'areaHectares' | 'issuedAt'>
): string {
  return crypto
    .createHash('sha256')
    .update(`${c.certNumber}|${c.beneficiary}|${c.parcelId}|${c.areaHectares}|${c.issuedAt}`)
    .digest('hex');
}

/** Synthetic certificates so the ledger is populated in the demo; empty otherwise. */
export const USUFRUCT_SEED: UsufructCertRecord[] = IS_DEMO
  ? (
      [
        { certNumber: 'IFRAP-PIS-4821', beneficiary: 'Mir Jan Raisani', clan: 'Raisani', district: 'Pishin', parcelId: 'PSH-KZ-014', areaHectares: 2.4, customaryRightsType: 'INALIENABLE_USUFRUCT', issuedAt: '2026-07-22T10:15:00.000Z' },
        { certNumber: 'IFRAP-MAS-3390', beneficiary: 'Bibi Bakhtawar', clan: 'Shahwani', district: 'Mastung', parcelId: 'MAS-AL-207', areaHectares: 1.1, customaryRightsType: 'CUSTOMARY_TRIBAL_COMMONS', issuedAt: '2026-07-28T08:40:00.000Z' },
        { certNumber: 'IFRAP-QUE-5108', beneficiary: 'Malik Dost Muhammad', clan: 'Kakar', district: 'Quetta', parcelId: 'QUE-SL-051', areaHectares: 3.7, customaryRightsType: 'LINEAGE_ALLUVIAL_USUFRUCT', issuedAt: '2026-08-02T13:05:00.000Z' },
      ] as Array<Omit<UsufructCertRecord, 'id' | 'hash' | 'status'>>
    ).map((c) => ({ ...c, id: c.certNumber, hash: certHash(c), status: 'ACTIVE' as const }))
  : [];
