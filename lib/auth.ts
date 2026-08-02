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
  secret: process.env.NEXTAUTH_SECRET || 'ifrap-anthropogis-super-secret-key-for-demo-purposes-only',
};
