import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { runAntigravityAgent } from '@/lib/agent/antigravity-graph';

export async function POST(req: NextRequest) {
  try {
    // Cryptographically verify the NextAuth session token (see middleware.ts).
    const claims = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!claims || !claims.role) {
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

    return NextResponse.json({
      success: true,
      data: result,
      user: { sub: claims.sub, role },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
