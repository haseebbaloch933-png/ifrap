import { Role } from './saml-edge';

export type { Role };

export const ROLES: Record<Role, Role> = {
  FIELD_ENUMERATOR: 'FIELD_ENUMERATOR',
  PROVINCIAL_PIU: 'PROVINCIAL_PIU',
  FPMU_DIRECTOR: 'FPMU_DIRECTOR',
};

// Route protection matrix matching requirement R1
export const PROTECTED_ROUTES: Array<{ path: string; allowedRoles: Role[] }> = [
  { path: '/esf-telemetry', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/field-log', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/grm', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/gis-impact', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/me-results', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/telemetry', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/usufruct', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/webgis', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/api/export', allowedRoles: ['PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/api/agent', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/api/grm', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  { path: '/api/field-logs', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  // Certificate issuance is elevated-only; must match both the /api/fiduciary
  // server check and the UsufructGenerator RoleGate (PROVINCIAL_PIU/FPMU_DIRECTOR).
  { path: '/api/fiduciary', allowedRoles: ['PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  // Admin dashboard is Director-only — this MUST match app/admin/page.tsx, which
  // hard-redirects anyone whose role !== 'FPMU_DIRECTOR'. (Previously listed
  // PROVINCIAL_PIU here, so a PIU passed the edge gate then got bounced by the page.)
  { path: '/admin', allowedRoles: ['FPMU_DIRECTOR'] },
  { path: '/fiduciary', allowedRoles: ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'] },
  // The access/audit log names who touched sensitive data — Director-only.
  { path: '/api/audit-log', allowedRoles: ['FPMU_DIRECTOR'] },
];

export const PUBLIC_ROUTES: string[] = [
  '/',
  '/login',
  '/auth/sso',
  '/public',
  '/_next',
  '/favicon.ico',
  '/api/auth',
];

/**
 * Checks if a given path is public.
 */
export function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return false;
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Checks if a given path requires SAML 2.0 / OIDC SSO authentication.
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`)
  );
}

/**
 * Returns allowed roles for a given protected path.
 */
export function getRequiredRolesForPath(pathname: string): Role[] | null {
  const route = PROTECTED_ROUTES.find(
    (r) => pathname === r.path || pathname.startsWith(`${r.path}/`)
  );
  return route ? route.allowedRoles : null;
}

/**
 * Validates if the user's role satisfies any of the required route roles.
 */
export function hasRole(userRole: string | undefined | null, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  const normalizedRole = userRole.toUpperCase() as Role;
  return requiredRoles.includes(normalizedRole);
}

/**
 * Maps email to canonical platform role if role claim is missing.
 */
export function mapUserEmailToRole(email: string): Role {
  const lower = email.toLowerCase();
  if (lower.includes('director') || lower.includes('admin')) {
    return 'FPMU_DIRECTOR';
  }
  if (lower.includes('piu') || lower.includes('provincial')) {
    return 'PROVINCIAL_PIU';
  }
  return 'FIELD_ENUMERATOR';
}
