import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isPublicPath, isProtectedRoute, getRequiredRolesForPath, hasRole } from '@/lib/auth/rbac';

// IMPORTANT: keep this list in sync with the protected entries in
// PROTECTED_ROUTES (lib/auth/rbac.ts). Next.js requires the matcher to be a
// static literal, so it cannot be derived from PROTECTED_ROUTES at runtime; the
// two must be maintained together. This previously drifted — /admin and
// /fiduciary were declared protected but were missing here, so the edge gate
// never ran for them (fixed below). A broad catch-all matcher is NOT usable:
// in Next 16 a matched API route that returns NextResponse.next() 404s, which
// breaks /api/auth/* (NextAuth) and other pass-through API routes.
// tests/matcher-coverage.test.js asserts this matcher covers every PROTECTED_ROUTES path.
export const config = {
  matcher: [
    '/esf-telemetry/:path*',
    '/field-log/:path*',
    '/grm/:path*',
    '/gis-impact/:path*',
    '/me-results/:path*',
    '/telemetry/:path*',
    '/usufruct/:path*',
    '/webgis/:path*',
    '/admin/:path*',
    '/fiduciary/:path*',
    '/api/export/:path*',
    '/api/agent/:path*',
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes explicitly
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check if route is protected
  if (isProtectedRoute(pathname)) {
    // Verify the NextAuth session token cryptographically. getToken decrypts
    // and validates the JWE using NEXTAUTH_SECRET; a forged, tampered, or
    // expired token yields null. This replaces the previous "verifier" that
    // trusted any bearer string, which was a complete auth bypass.
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || !token.role) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: valid session required' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = String(token.role);

    // Role-based access control check
    const requiredRoles = getRequiredRolesForPath(pathname);
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasRole(role, requiredRoles)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Forbidden: Insufficient RBAC role privileges' },
            { status: 403 }
          );
        }
        const redirectUrl = new URL('/telemetry?error=Forbidden', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Forward enriched identity context headers to downstream API handlers/pages
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', String(token.sub || token.email || ''));
    requestHeaders.set('x-user-role', role);
    requestHeaders.set('x-user-email', String(token.email || ''));
    requestHeaders.set('x-auth-type', 'SESSION');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}
