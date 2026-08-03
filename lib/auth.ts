import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'IFRAP Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'enumerator@ifrap.gov.pk' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Mock DB Check: Map specific emails to IFRAP roles
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
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
