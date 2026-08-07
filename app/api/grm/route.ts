import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAll, transaction, update } from '@/lib/server/store';
import { GRM_SEED, GrmTicketRecord, buildNewTicket, isValidStatus } from '@/lib/grm-data';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { sealFields, openFields } from '@/lib/server/field-crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION = 'grm';
const ROUTE = '/api/grm';

// Person/free-text fields encrypted at rest; district/status/dates stay clear
// so filtering, SLA math, and district counts still work without decrypting.
const SENSITIVE: (keyof GrmTicketRecord)[] = ['description', 'submitterName', 'resolutionNotes'];

// Seed sealed too, so the demo/seed tickets aren't the one plaintext gap when
// encryption is enabled. Passthrough (clear) when no key is configured.
function seed(): GrmTicketRecord[] {
  return GRM_SEED.map((t) => sealFields(t, SENSITIVE));
}

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
  const stored = await getAll<GrmTicketRecord>(COLLECTION, seed());
  const tickets = stored.map((t) => openFields(t, SENSITIVE));
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
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body?.description || !String(body.description).trim()) {
    return NextResponse.json({ error: 'A ticket description is required' }, { status: 400 });
  }
  const ticket = await transaction<GrmTicketRecord, GrmTicketRecord>(COLLECTION, seed(), (data) => {
    const t = buildNewTicket(body, data);
    data.unshift(sealFields(t, SENSITIVE)); // store sealed
    return t; // return cleartext to the caller
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
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body?.id) return NextResponse.json({ error: 'Ticket id is required' }, { status: 400 });
  if (!isValidStatus(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const patch: Partial<GrmTicketRecord> = {
    status: body.status,
    resolutionNotes: typeof body.resolutionNotes === 'string' ? body.resolutionNotes : undefined,
    resolvedAt: body.status === 'RESOLVED' ? new Date().toISOString().replace('T', ' ').slice(0, 16) : undefined,
  };
  // Drop undefined keys so we don't overwrite existing values with undefined.
  Object.keys(patch).forEach((k) => (patch as any)[k] === undefined && delete (patch as any)[k]);

  // Seal sensitive fields in the patch before it's merged into the stored record.
  const sealedPatch = sealFields(patch as GrmTicketRecord, SENSITIVE);
  const updated = await update<GrmTicketRecord>(COLLECTION, body.id, sealedPatch, seed());
  if (!updated) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  await recordAudit({ actor: actorFromToken(token), method: 'PATCH', route: ROUTE, action: 'UPDATE', status: 200, target: updated.id });
  return NextResponse.json({ ticket: openFields(updated, SENSITIVE) });
}
