import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { runAntigravityAgent } from '@/lib/agent/antigravity-graph';
import { recordAudit, actorFromToken, ANONYMOUS_ACTOR } from '@/lib/server/audit-log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROUTE = '/api/agent';

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

    const body = await req.json();
    const { query, district } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Bad Request: Missing or invalid query' }, { status: 400 });
    }

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
