import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Enforce API-level RBAC (Server-Side)
    if (!session || !session.user || !['PROVINCIAL_PIU', 'FPMU_DIRECTOR'].includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized: Elevated privileges required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.beneficiary || !data.district || !data.clan || !data.parcelId) {
      return NextResponse.json({ error: 'Missing required fiduciary data fields' }, { status: 400 });
    }

    // In a real app, this would generate the cryptographic hash and store it in Firestore/PostgreSQL
    // Here we simulate the processing
    const certNumber = `IFRAP-${data.district.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issuedAt = new Date().toISOString();
    
    // Generate true SHA-256 fingerprint
    const rawData = `${certNumber}|${data.beneficiary}|${data.parcelId}|${data.areaHectares}|${issuedAt}`;
    const hash = crypto.createHash('sha256').update(rawData).digest('hex');
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({
      success: true,
      message: 'Usufruct Certificate successfully registered on the ledger',
      certificate: {
        certNumber,
        ...data,
        issuedAt,
        hash,
        status: 'ACTIVE'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error processing fiduciary request' }, { status: 500 });
  }
}
