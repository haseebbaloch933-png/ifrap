import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyAndDecodeSAMLOrOIDCToken } from '@/lib/auth/saml-edge';
import { runAntigravityAgent } from '@/lib/agent/antigravity-graph';

export async function POST(req: NextRequest) {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: SAML 2.0 / OIDC SSO token required' }, { status: 401 });
    }

    const claims = await verifyAndDecodeSAMLOrOIDCToken(token);
    if (!claims || !claims.role) {
      return NextResponse.json({ error: 'Unauthorized: Invalid SAML 2.0 / OIDC SSO token' }, { status: 401 });
    }

    const body = await req.json();
    const { query, district } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Bad Request: Missing or invalid query' }, { status: 400 });
    }

    const result = await runAntigravityAgent({
      query,
      userRole: claims.role,
      district,
    });

    return NextResponse.json({
      success: true,
      data: result,
      user: { sub: claims.sub, role: claims.role },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
