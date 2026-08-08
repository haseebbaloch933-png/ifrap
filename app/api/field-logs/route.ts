import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAll, insert } from '@/lib/server/store';
import { scrubPayload, getScrubAudit } from '@/lib/privacy/ner-pii-scrubber';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { guardMutation, BODY_LIMITS, RATE_LIMITS } from '@/lib/server/api-guards';
import { IS_DEMO } from '@/lib/demo-mode';

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

// Synthetic sample logs so the Field Log screen is populated in the demo.
// Empty in a real deployment (see lib/demo-mode.ts). Payloads are already
// PII-scrubbed in shape (names redacted, coordinates fuzzed to ~1.1km).
const FIELD_LOG_SEED: StoredFieldLog[] = IS_DEMO
  ? [
      {
        id: 'FL-DEMO-0003',
        receivedAt: '2026-08-05T09:12:00.000Z',
        submittedBy: 'enumerator@ifrap.gov.pk',
        offlineSynced: true,
        piiAudit: { piiDetected: true, scrubbedFields: ['PERSON_NAME'], redactedCount: 1 },
        payload: {
          district: 'Pishin',
          theme: 'Karez rehabilitation — customary allocation',
          narrative:
            '[REDACTED_PERSON] and the Mirab council described the 24-Shabana time-share on the ancestral Karez; downstream orchards report improved dry-season flow after channel de-silting.',
          geopoint: '30.58 66.99',
        },
      },
      {
        id: 'FL-DEMO-0002',
        receivedAt: '2026-08-03T14:40:00.000Z',
        submittedBy: 'enumerator@ifrap.gov.pk',
        offlineSynced: false,
        piiAudit: { piiDetected: false, scrubbedFields: [], redactedCount: 0 },
        payload: {
          district: 'Mastung',
          theme: 'Livelihood & watershed',
          narrative:
            'Community consultation on watershed check-dams; women-led kitchen-garden group requests seed support ahead of the next season.',
          geopoint: '29.80 66.85',
        },
      },
      {
        id: 'FL-DEMO-0001',
        receivedAt: '2026-08-01T07:05:00.000Z',
        submittedBy: 'enumerator@ifrap.gov.pk',
        offlineSynced: true,
        piiAudit: { piiDetected: true, scrubbedFields: ['TELEPHONE_NUMBER'], redactedCount: 1 },
        payload: {
          district: 'Quetta',
          theme: 'Flood-resilient housing',
          narrative:
            'Housing reconstruction site visit; beneficiary reachable at [REDACTED_PHONE]. Resilience standards observed on 3 of 4 plots.',
          geopoint: '30.18 66.98',
        },
      },
    ]
  : [];

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
  const logs = await getAll<StoredFieldLog>(COLLECTION, FIELD_LOG_SEED);
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

  await insert<StoredFieldLog>(COLLECTION, record, FIELD_LOG_SEED);
  await recordAudit({ actor: actorFromToken(token), method: 'POST', route: ROUTE, action: 'INGEST', status: 201, target: record.id });
  return NextResponse.json({ id: record.id, status: 'ingested', piiAudit }, { status: 201 });
}
