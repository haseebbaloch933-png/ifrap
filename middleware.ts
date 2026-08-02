import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractTokenFromRequest, verifyAndDecodeSAMLOrOIDCToken } from '@/lib/auth/saml-edge';
import { isPublicPath, isProtectedRoute, getRequiredRolesForPath, hasRole } from '@/lib/auth/rbac';

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
    const token = extractTokenFromRequest(req);

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: SAML 2.0 / OIDC SSO token required' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const claims = await verifyAndDecodeSAMLOrOIDCToken(token);

    if (!claims || !claims.role) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid SAML 2.0 / OIDC SSO token' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control check
    const requiredRoles = getRequiredRolesForPath(pathname);
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasRole(claims.role, requiredRoles)) {
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
    requestHeaders.set('x-user-id', claims.sub || claims.email);
    requestHeaders.set('x-user-role', claims.role);
    requestHeaders.set('x-user-email', claims.email);
    requestHeaders.set('x-auth-type', claims.authType);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}
