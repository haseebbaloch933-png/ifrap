import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAll, transaction, update } from '@/lib/server/store';
import { GRM_SEED, GrmTicketRecord, buildNewTicket, isValidStatus } from '@/lib/grm-data';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { scrubPayload } from '@/lib/privacy/ner-pii-scrubber';
import { guardMutation, capString, BODY_LIMITS, RATE_LIMITS } from '@/lib/server/api-guards';

const MAX_RESOLUTION_NOTES_LEN = 4000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION = 'grm';
const ROUTE = '/api/grm';

async function requireAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.role) return null;
  return token;
}

// List all tickets (seeded from GRM_SEED on first access).
export async function GET(req: NextRequest) {
  const token = await requireAuth(req);
  if (!token) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'GET', route: ROUTE, action: 'DENIED', status: 401 });
    return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
  }
  const tickets = await getAll<GrmTicketRecord>(COLLECTION, GRM_SEED);
  await recordAudit({ actor: actorFromToken(token), method: 'GET', route: ROUTE, action: 'LIST', status: 200 });
  return NextResponse.json({ tickets });
}

// File a new complaint ticket (persisted).
export async function POST(req: NextRequest) {
  const token = await requireAuth(req);
  if (!token) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'POST', route: ROUTE, action: 'DENIED', status: 401 });
    return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
  }
  // Per-actor rate limit + body-size cap (T-03).
  const guard = await guardMutation(req, {
    actorId: String(token.sub || token.email || ''),
    route: ROUTE,
    limit: RATE_LIMITS.grm,
    maxBytes: BODY_LIMITS.grm,
  });
  if (!guard.ok) return guard.response;
  const body = guard.body;

  if (!body?.description || !String(body.description).trim()) {
    return NextResponse.json({ error: 'A ticket description is required' }, { status: 400 });
  }
  const ticket = await transaction<GrmTicketRecord, GrmTicketRecord>(COLLECTION, GRM_SEED, (data) => {
    const t = buildNewTicket(body, data);
    // Grievance descriptions are free text and routinely embed PII (names,
    // CNICs, phone/email). Scrub before persisting so data at rest is redacted,
    // matching how /api/field-logs treats its payloads (ESS5/ESS10).
    t.description = scrubPayload(t.description);
    data.unshift(t);
    return t;
  });
  await recordAudit({ actor: actorFromToken(token), method: 'POST', route: ROUTE, action: 'CREATE', status: 201, target: ticket.id });
  return NextResponse.json({ ticket }, { status: 201 });
}

// Update a ticket's workflow status / resolution notes (persisted).
export async function PATCH(req: NextRequest) {
  const token = await requireAuth(req);
  if (!token) {
    await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'PATCH', route: ROUTE, action: 'DENIED', status: 401 });
    return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
  }
  // Per-actor rate limit + body-size cap (T-03).
  const guard = await guardMutation(req, {
    actorId: String(token.sub || token.email || ''),
    route: ROUTE,
    limit: RATE_LIMITS.grm,
    maxBytes: BODY_LIMITS.grm,
  });
  if (!guard.ok) return guard.response;
  const body = guard.body;

  if (!body?.id) return NextResponse.json({ error: 'Ticket id is required' }, { status: 400 });
  if (!isValidStatus(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const patch: Partial<GrmTicketRecord> = {
    status: body.status,
    // Resolution notes are staff-authored free text — cap length, then scrub PII.
    resolutionNotes:
      typeof body.resolutionNotes === 'string'
        ? scrubPayload(capString(body.resolutionNotes, MAX_RESOLUTION_NOTES_LEN))
        : undefined,
    resolvedAt: body.status === 'RESOLVED' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
  };
  // Drop undefined keys so we don't overwrite existing values with undefined.
  Object.keys(patch).forEach((k) => (patch as any)[k] === undefined && delete (patch as any)[k]);

  const updated = await update<GrmTicketRecord>(COLLECTION, body.id, patch, GRM_SEED);
  if (!updated) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  await recordAudit({ actor: actorFromToken(token), method: 'PATCH', route: ROUTE, action: 'UPDATE', status: 200, target: updated.id });
  return NextResponse.json({ ticket: updated });
}
