import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuditEntries, verifyAuditChain } from '@/lib/server/audit-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The access/audit log is itself sensitive (it names who touched what), so it
// is Director-only — stricter than the sensitive routes it records. Also gated
// at the edge via PROTECTED_ROUTES + the middleware matcher.
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || String(token.role) !== 'FPMU_DIRECTOR') {
    return NextResponse.json({ error: 'Forbidden: FPMU Director role required' }, { status: 403 });
  }

  const [entries, verification] = await Promise.all([getAuditEntries(), verifyAuditChain()]);
  return NextResponse.json({ count: entries.length, verification, entries });
}
