import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAll, insert } from '@/lib/server/store';

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

    const certNumber = `IFRAP-${String(data.district).substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issuedAt = new Date().toISOString();

    // Generate true SHA-256 fingerprint over the canonical cert fields.
    const rawData = `${certNumber}|${data.beneficiary}|${data.parcelId}|${data.areaHectares}|${issuedAt}`;
    const hash = crypto.createHash('sha256').update(rawData).digest('hex');

    const record: UsufructCertRecord = {
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

    // Persist to the durable ledger so issued certificates survive a reload/restart.
    await insert<UsufructCertRecord>(COLLECTION, record, []);

    return NextResponse.json({
      success: true,
      message: 'Usufruct Certificate registered on the durable ledger',
      certificate: record,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing fiduciary request' }, { status: 500 });
  }
}
