import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAll, insert } from '@/lib/server/store';
import { scrubPayload, getScrubAudit } from '@/lib/privacy/ner-pii-scrubber';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { guardMutation, BODY_LIMITS, RATE_LIMITS } from '@/lib/server/api-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION = 'field-logs';
const ROUTE = '/api/field-logs';

export interface StoredFieldLog {
  id: string;
  receivedAt: string;
  submittedBy: string;
  offlineSynced: boolean;
  piiAudit: { piiDetected: boolean; scrubbedFields: string[]; redactedCount: number };
  payload: Record<string, any>;
}

async function requireAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.role) return null;
  return token;
}

// List ingested field logs (already PII-scrubbed at write time).
export async function GET(req: NextRequest) {
  const token = await requireAuth(req);
  if (!token) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'GET', route: ROUTE, action: 'DENIED', status: 401 });
    return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
  }
  const logs = await getAll<StoredFieldLog>(COLLECTION, []);
  await recordAudit({ actor: actorFromToken(token), method: 'GET', route: ROUTE, action: 'LIST', status: 200 });
  return NextResponse.json({ count: logs.length, logs });
}

// Ingest a field log (the offline queue POSTs decrypted drafts here). PII is
// scrubbed server-side before anything is persisted — data at rest is redacted.
export async function POST(req: NextRequest) {
  const token = await requireAuth(req);
  if (!token) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'POST', route: ROUTE, action: 'DENIED', status: 401 });
    return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
  }
  // Per-actor rate limit + body-size cap (T-03). Field logs allow a larger body
  // than other routes (narratives + geo), still bounded.
  const guard = await guardMutation(req, {
    actorId: String(token.sub || token.email || ''),
    route: ROUTE,
    limit: RATE_LIMITS.fieldLogs,
    maxBytes: BODY_LIMITS.fieldLogs,
  });
  if (!guard.ok) return guard.response;
  const body = guard.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Field log payload required' }, { status: 400 });
  }

  const piiAudit = getScrubAudit(body);
  const scrubbed = scrubPayload(body);

  const record: StoredFieldLog = {
    id: `FL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    receivedAt: new Date().toISOString(),
    submittedBy: String(token.email || token.sub || 'unknown'),
    offlineSynced: req.headers.get('x-offline-synced') === 'true',
    piiAudit,
    payload: scrubbed,
  };

  await insert<StoredFieldLog>(COLLECTION, record, []);
  await recordAudit({ actor: actorFromToken(token), method: 'POST', route: ROUTE, action: 'INGEST', status: 201, target: record.id });
  return NextResponse.json({ id: record.id, status: 'ingested', piiAudit }, { status: 201 });
}
