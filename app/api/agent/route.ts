import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { runAntigravityAgent } from '@/lib/agent/antigravity-graph';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';
import { guardMutation, capString, BODY_LIMITS, RATE_LIMITS } from '@/lib/server/api-guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROUTE = '/api/agent';
const MAX_QUERY_LEN = 4000;
const MAX_DISTRICT_LEN = 120;

export async function POST(req: NextRequest) {
  try {
    // Cryptographically verify the NextAuth session token (see proxy.ts).
    const claims = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!claims || !claims.role) {
      // The agent retrieves field-log-derived evidence, so denied attempts are
      // audited alongside the other sensitive routes (GRM/field-logs/fiduciary).
      await recordAudit({ actor: ANONYMOUS_ACTOR, method: 'POST', route: ROUTE, action: 'DENIED', status: 401 });
      return NextResponse.json({ error: 'Unauthorized: valid session required' }, { status: 401 });
    }

    // Per-actor rate limit + body-size cap (T-03).
    const guard = await guardMutation(req, {
      actorId: String(claims.sub || claims.email || ''),
      route: ROUTE,
      limit: RATE_LIMITS.agent,
      maxBytes: BODY_LIMITS.agent,
    });
    if (!guard.ok) return guard.response;

    const { query: rawQuery, district: rawDistrict } = guard.body;

    if (!rawQuery || typeof rawQuery !== 'string' || !rawQuery.trim()) {
      return NextResponse.json({ error: 'Bad Request: Missing or invalid query' }, { status: 400 });
    }
    const query = capString(rawQuery, MAX_QUERY_LEN);
    const district = rawDistrict != null ? capString(rawDistrict, MAX_DISTRICT_LEN) : undefined;

    const role = String(claims.role);

    const result = await runAntigravityAgent({
      query,
      userRole: role,
      district,
    });

    // Record the successful query against the tamper-evident audit chain.
    await recordAudit({
      actor: actorFromToken(claims),
      method: 'POST',
      route: ROUTE,
      action: 'QUERY',
      status: 200,
      target: typeof district === 'string' ? district : undefined,
    });

    return NextResponse.json({
      success: true,
      data: result,
      user: { sub: claims.sub, role },
    });
  } catch (err: any) {
    // Log the detail server-side; return a generic message so internals aren't
    // leaked to the client.
    console.error('[api/agent] request failed:', err?.message || err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
