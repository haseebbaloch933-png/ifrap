import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAll, transaction } from '@/lib/server/store';
import { recordAudit, actorFromSession, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { guardMutation, capString, BODY_LIMITS, RATE_LIMITS } from '@/lib/server/api-guards';
import { IS_DEMO } from '@/lib/demo-mode';

// crypto + the file-backed store require the Node runtime (not Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION = 'usufruct-certs';
const ROUTE = '/api/fiduciary';

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

/** Same canonical fingerprint the issuance path computes, reused for seeds. */
function certHash(c: Pick<UsufructCertRecord, 'certNumber' | 'beneficiary' | 'parcelId' | 'areaHectares' | 'issuedAt'>): string {
  return crypto
    .createHash('sha256')
    .update(`${c.certNumber}|${c.beneficiary}|${c.parcelId}|${c.areaHectares}|${c.issuedAt}`)
    .digest('hex');
}

/** Synthetic certificates so the ledger is populated in the demo; empty otherwise. */
const USUFRUCT_SEED: UsufructCertRecord[] = IS_DEMO
  ? (
      [
        { certNumber: 'IFRAP-PIS-4821', beneficiary: 'Mir Jan Raisani', clan: 'Raisani', district: 'Pishin', parcelId: 'PSH-KZ-014', areaHectares: 2.4, customaryRightsType: 'INALIENABLE_USUFRUCT', issuedAt: '2026-07-22T10:15:00.000Z' },
        { certNumber: 'IFRAP-MAS-3390', beneficiary: 'Bibi Bakhtawar', clan: 'Shahwani', district: 'Mastung', parcelId: 'MAS-AL-207', areaHectares: 1.1, customaryRightsType: 'CUSTOMARY_TRIBAL_COMMONS', issuedAt: '2026-07-28T08:40:00.000Z' },
        { certNumber: 'IFRAP-QUE-5108', beneficiary: 'Malik Dost Muhammad', clan: 'Kakar', district: 'Quetta', parcelId: 'QUE-SL-051', areaHectares: 3.7, customaryRightsType: 'LINEAGE_ALLUVIAL_USUFRUCT', issuedAt: '2026-08-02T13:05:00.000Z' },
      ] as Array<Omit<UsufructCertRecord, 'id' | 'hash' | 'status'>>
    ).map((c) => ({ ...c, id: c.certNumber, hash: certHash(c), status: 'ACTIVE' as const }))
  : [];

const ELEVATED = ['PROVINCIAL_PIU', 'FPMU_DIRECTOR'];

async function requireElevated() {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as any).role : null;
  if (!session || !role || !ELEVATED.includes(role)) return null;
  return session;
}

// List the persisted usufruct certificate ledger (issued certs survive restarts).
export async function GET() {
  const session = await requireElevated();
  if (!session) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'GET', route: ROUTE, action: 'DENIED', status: 403 });
    return NextResponse.json({ error: 'Unauthorized: Elevated privileges required' }, { status: 403 });
  }
  const certificates = await getAll<UsufructCertRecord>(COLLECTION, USUFRUCT_SEED);
  await recordAudit({ actor: actorFromSession(session), method: 'GET', route: ROUTE, action: 'LIST', status: 200 });
  return NextResponse.json({ count: certificates.length, certificates });
}

export async function POST(request: Request) {
  try {
    const session = await requireElevated();
    if (!session) {
      await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'POST', route: ROUTE, action: 'DENIED', status: 403 });
      return NextResponse.json({ error: 'Unauthorized: Elevated privileges required' }, { status: 403 });
    }

    // Per-actor rate limit + body-size cap (T-03).
    const guard = await guardMutation(request, {
      actorId: String((session.user as any)?.id || session.user?.email || ''),
      route: ROUTE,
      limit: RATE_LIMITS.fiduciary,
      maxBytes: BODY_LIMITS.fiduciary,
    });
    if (!guard.ok) return guard.response;
    const data = guard.body;

    // Validate required fields
    if (!data.beneficiary || !data.district || !data.clan || !data.parcelId) {
      return NextResponse.json({ error: 'Missing required fiduciary data fields' }, { status: 400 });
    }

    const districtPrefix = String(data.district).substring(0, 3).toUpperCase();
    const issuedAt = new Date().toISOString();

    // Generate the cert number and persist inside one atomic transaction, so a
    // colliding random 4-digit suffix (two officers issuing in the same
    // district on the same day — a real, non-negligible chance with only 9000
    // combinations) is caught and retried instead of silently landing two
    // different beneficiaries under the "same" certificate number.
    const record = await transaction<UsufructCertRecord, UsufructCertRecord>(COLLECTION, USUFRUCT_SEED, (existing) => {
      const existingIds = new Set(existing.map((c) => c.certNumber));
      let certNumber = '';
      for (let attempt = 0; attempt < 20; attempt++) {
        const candidate = `IFRAP-${districtPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        if (!existingIds.has(candidate)) {
          certNumber = candidate;
          break;
        }
      }
      if (!certNumber) {
        throw new Error('Could not generate a unique certificate number after 20 attempts');
      }

      // Generate true SHA-256 fingerprint over the canonical cert fields.
      const rawData = `${certNumber}|${data.beneficiary}|${data.parcelId}|${data.areaHectares}|${issuedAt}`;
      const hash = crypto.createHash('sha256').update(rawData).digest('hex');

      const newRecord: UsufructCertRecord = {
        id: certNumber,
        certNumber,
        beneficiary: capString(data.beneficiary, 200),
        clan: capString(data.clan, 160),
        district: capString(data.district, 160),
        parcelId: capString(data.parcelId, 120),
        areaHectares: Number.isFinite(Number(data.areaHectares)) ? Number(data.areaHectares) : 0,
        customaryRightsType: capString(data.customaryRightsType ?? 'INALIENABLE_USUFRUCT', 120),
        issuedAt,
        hash,
        status: 'ACTIVE',
      };
      existing.unshift(newRecord);
      return newRecord;
    });

    await recordAudit({ actor: actorFromSession(session), method: 'POST', route: ROUTE, action: 'ISSUE_CERT', status: 200, target: record.certNumber });

    return NextResponse.json({
      success: true,
      message: 'Usufruct Certificate registered on the durable ledger',
      certificate: record,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing fiduciary request' }, { status: 500 });
  }
}
