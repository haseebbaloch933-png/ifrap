import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAll, transaction } from '@/lib/server/store';
import { recordAudit, actorFromSession, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { guardMutation, capString, BODY_LIMITS, RATE_LIMITS } from '@/lib/server/api-guards';
import { FIDUCIARY_COLLECTION as COLLECTION, USUFRUCT_SEED, type UsufructCertRecord } from '@/lib/fiduciary-ledger';

// crypto + the file-backed store require the Node runtime (not Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROUTE = '/api/fiduciary';

export type { UsufructCertRecord };

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
