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
 * Fallback role resolution from a verified email address, used ONLY when the
 * IdP provides no usable role claim (see lib/auth.ts::resolveRoleFromProfile).
 *
 * SECURITY: this must never *infer* elevation from the text of an email. A
 * substring like "director" or "admin" in a local part is not proof of
 * privilege — e.g. `admin.assistant@…`, `administration@…`, or a display-name
 * address `firstname.director@…` would all have been silently elevated to
 * FPMU_DIRECTOR by the previous substring match. That was a privilege-
 * escalation bug (T-01).
 *
 * Elevation now happens only for addresses on an explicit, operator-controlled
 * allowlist; every other address defaults to the LEAST-privileged role.
 * Configure the allowlist with ROLE_EMAIL_ALLOWLIST — a comma-separated list
 * of `email:ROLE` pairs (exact, case-insensitive email match), e.g.
 *   ROLE_EMAIL_ALLOWLIST="dir@fpmu.gov.pk:FPMU_DIRECTOR,piu@balochistan.gov.pk:PROVINCIAL_PIU"
 * Unrecognized roles are ignored. The real production path is an IdP role
 * claim (OIDC_ROLE_CLAIM); this allowlist is the controlled break-glass for
 * deployments whose IdP does not yet emit one.
 */
export function mapUserEmailToRole(email: string): Role {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (normalizedEmail) {
    const allowlisted = parseRoleEmailAllowlist(process.env.ROLE_EMAIL_ALLOWLIST).get(normalizedEmail);
    if (allowlisted) return allowlisted;
  }
  return 'FIELD_ENUMERATOR'; // least privilege — never elevate on unrecognized input
}

/** Parse ROLE_EMAIL_ALLOWLIST ("email:ROLE,email:ROLE") into a lookup map. */
function parseRoleEmailAllowlist(raw: string | undefined): Map<string, Role> {
  const map = new Map<string, Role>();
  if (!raw) return map;
  const validRoles: Role[] = ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'];
  for (const entry of raw.split(',')) {
    const sep = entry.lastIndexOf(':');
    if (sep < 0) continue;
    const emailPart = entry.slice(0, sep).trim().toLowerCase();
    const rolePart = entry.slice(sep + 1).trim().toUpperCase().replace(/[\s-]+/g, '_');
    if (emailPart && (validRoles as string[]).includes(rolePart)) {
      map.set(emailPart, rolePart as Role);
    }
  }
  return map;
}
