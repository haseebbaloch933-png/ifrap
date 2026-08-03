import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAll, transaction } from '@/lib/server/store';

// crypto + the file-backed store require the Node runtime (not Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION = 'usufruct-certs';

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

const ELEVATED = ['PROVINCIAL_PIU', 'FPMU_DIRECTOR'];

async function requireElevated() {
  const session = await getServerSession(authOptions);
  const role = session?.user ? (session.user as any).role : null;
  if (!session || !role || !ELEVATED.includes(role)) return null;
  return session;
}

// List the persisted usufruct certificate ledger (issued certs survive restarts).
export async function GET() {
  if (!(await requireElevated())) {
    return NextResponse.json({ error: 'Unauthorized: Elevated privileges required' }, { status: 403 });
  }
  const certificates = await getAll<UsufructCertRecord>(COLLECTION, []);
  return NextResponse.json({ count: certificates.length, certificates });
}

export async function POST(request: Request) {
  try {
    if (!(await requireElevated())) {
      return NextResponse.json({ error: 'Unauthorized: Elevated privileges required' }, { status: 403 });
    }

    const data = await request.json();

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
    const record = await transaction<UsufructCertRecord, UsufructCertRecord>(COLLECTION, [], (existing) => {
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
        beneficiary: String(data.beneficiary),
        clan: String(data.clan),
        district: String(data.district),
        parcelId: String(data.parcelId),
        areaHectares: Number(data.areaHectares),
        customaryRightsType: String(data.customaryRightsType ?? 'INALIENABLE_USUFRUCT'),
        issuedAt,
        hash,
        status: 'ACTIVE',
      };
      existing.unshift(newRecord);
      return newRecord;
    });

    return NextResponse.json({
      success: true,
      message: 'Usufruct Certificate registered on the durable ledger',
      certificate: record,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing fiduciary request' }, { status: 500 });
  }
}
