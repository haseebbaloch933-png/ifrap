import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { mapUserEmailToRole, type Role } from '@/lib/auth/rbac';

/**
 * Authentication is SSO-ready. Which providers are active is decided by env:
 *
 *   - OIDC_ISSUER + OIDC_CLIENT_ID + OIDC_CLIENT_SECRET all set → a real
 *     OpenID Connect provider ("FPMU Single Sign-On") is enabled. This is the
 *     production path: federate to the FPMU / Government of Pakistan identity
 *     provider, where accounts, passwords, and MFA live — none of that is this
 *     app's concern anymore.
 *   - The mock email/password provider (the three demo accounts) is kept for
 *     local development, and as the ONLY provider when no SSO is configured so
 *     the app still runs. It is deliberately REMOVED in production once SSO is
 *     configured, so a real deployment can't be reached with a demo password.
 *
 * Roles come from the IdP (a configurable claim, default `role`, falling back
 * to email-pattern mapping) and default to the LEAST-privileged role if the
 * IdP sends nothing recognizable — never to an elevated role.
 */

const oidcConfigured = Boolean(
  process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET
);
const isProduction = process.env.NODE_ENV === 'production';

/** Resolve a canonical platform Role from an OIDC profile's claims. */
function resolveRoleFromProfile(profile: Record<string, any>): Role {
  const claimName = process.env.OIDC_ROLE_CLAIM || 'role';
  const raw = profile?.[claimName];
  const candidates: string[] = Array.isArray(raw) ? raw.map(String) : raw != null ? [String(raw)] : [];

  const CANONICAL: Role[] = ['FIELD_ENUMERATOR', 'PROVINCIAL_PIU', 'FPMU_DIRECTOR'];
  for (const candidate of candidates) {
    const normalized = candidate.toUpperCase().replace(/[\s-]+/g, '_');
    if (CANONICAL.includes(normalized as Role)) return normalized as Role;
    if (/DIRECTOR|ADMIN/.test(normalized)) return 'FPMU_DIRECTOR';
    if (/PIU|PROVINCIAL/.test(normalized)) return 'PROVINCIAL_PIU';
    if (/ENUMERATOR|FIELD/.test(normalized)) return 'FIELD_ENUMERATOR';
  }

  if (profile?.email) return mapUserEmailToRole(String(profile.email));
  return 'FIELD_ENUMERATOR'; // least privilege: never elevate on unknown input
}

const credentialsProvider = CredentialsProvider({
  name: 'IFRAP Credentials',
  credentials: {
    email: { label: 'Email', type: 'email', placeholder: 'enumerator@ifrap.gov.pk' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    // Mock DB Check: Map specific emails to IFRAP roles. Demo accounts only —
    // this provider is not registered in production once SSO is configured.
    if (credentials.email === 'enumerator@ifrap.gov.pk' && credentials.password === 'demo123') {
      return { id: '1', name: 'Field Staff', email: credentials.email, role: 'FIELD_ENUMERATOR' };
    }
    if (credentials.email === 'piu@ifrap.gov.pk' && credentials.password === 'demo123') {
      return { id: '2', name: 'Provincial PIU', email: credentials.email, role: 'PROVINCIAL_PIU' };
    }
    if (credentials.email === 'director@ifrap.gov.pk' && credentials.password === 'demo123') {
      return { id: '3', name: 'FPMU Director', email: credentials.email, role: 'FPMU_DIRECTOR' };
    }

    return null;
  },
});

// Generic OIDC provider via issuer discovery (.well-known/openid-configuration).
// Typed loosely because NextAuth v4's OAuthConfig generics are awkward for a
// hand-rolled generic provider; the shape below is the documented contract.
const oidcProvider: any = {
  id: 'oidc',
  name: process.env.OIDC_DISPLAY_NAME || 'FPMU Single Sign-On',
  type: 'oauth',
  wellKnown: `${process.env.OIDC_ISSUER}/.well-known/openid-configuration`,
  clientId: process.env.OIDC_CLIENT_ID,
  clientSecret: process.env.OIDC_CLIENT_SECRET,
  authorization: { params: { scope: 'openid email profile' } },
  idToken: true,
  checks: ['pkce', 'state'],
  profile(profile: Record<string, any>) {
    return {
      id: String(profile.sub),
      name: profile.name ?? profile.preferred_username ?? profile.email,
      email: profile.email,
      role: resolveRoleFromProfile(profile),
    };
  },
};

function buildProviders(): NextAuthOptions['providers'] {
  const providers: NextAuthOptions['providers'] = [];
  if (oidcConfigured) providers.push(oidcProvider);
  // Keep the demo credentials in dev always, and in prod ONLY when there's no
  // SSO to fall back on — so a prod deployment with SSO can't be reached with
  // a demo password, but the app still runs anywhere SSO isn't set up yet.
  if (!isProduction || !oidcConfigured) providers.push(credentialsProvider);
  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),
  callbacks: {
    async jwt({ token, user }) {
      // `user` is present only on initial sign-in; both the credentials
      // authorize() and the OIDC profile() attach `role`, so this covers both.
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  // No hardcoded fallback: a secret committed to source lets anyone forge a
  // session JWT (e.g. role=FPMU_DIRECTOR). Require it from the environment and
  // fail loudly if it is missing.
  secret: getAuthSecret(),
};

/** True when a real OIDC identity provider is configured via env. */
export const isSsoConfigured = oidcConfigured;

function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'NEXTAUTH_SECRET is not set (or too short). Set a strong random value in ' +
        '.env.local, e.g. `node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"`.'
    );
  }
  return secret;
}
