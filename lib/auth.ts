import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { logger } from '@/lib/logger';
import { LoginCredentialsSchema } from '@/types/dto';

const DEMO_USERS: Record<string, any> = {
  'superadmin@dhl.com': {
    id: 'usr-superadmin-01', name: 'Dr. Evelyn Vogel', email: 'superadmin@dhl.com', role: 'superadmin', staffId: 'DHL-HQ-001',
    department: 'Executive Governance & AI Security', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', phone: '+49 228 182-0', hub: 'Bonn HQ Global Control Center',
  },
  'admin@dhl.com': {
    id: 'usr-admin-01', name: 'Marcus Reinhardt', email: 'admin@dhl.com', role: 'admin', staffId: 'DHL-OPS-492',
    department: 'European Road & Air Network Operations', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', phone: '+49 69 690-7000', hub: 'Frankfurt Hub (FRA-HUB-01)',
  },
  'driver@dhl.com': {
    id: 'usr-driver-01', name: 'Klaus Lindner', email: 'driver@dhl.com', role: 'driver', staffId: 'DHL-DRV-088',
    department: 'Express City Fleet Operations', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', phone: '+49 171 555-0199', vehicleId: 'BN-DL-4922 (Mercedes Sprinter EV)', hub: 'Frankfurt Gateway Hub',
  },
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'DHL Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'dispatcher@dhl.com' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const parsed = LoginCredentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            logger.warn('NextAuth', 'Failed login credentials validation', parsed.error.format());
            return null;
          }

          const user = DEMO_USERS[parsed.data.email];
          if (!user || parsed.data.password !== 'password123') return null;

          logger.info('NextAuth', `Authorized login for ${user.email}`);
          return user;
        } catch (error: any) {
          logger.error('NextAuth', 'Authentication error in authorize()', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'dhl-super-secret-nextauth-encryption-key-2026',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.staffId = (user as any).staffId;
        token.avatarUrl = (user as any).avatarUrl;
        token.hub = (user as any).hub;
        token.vehicleId = (user as any).vehicleId;
        token.department = (user as any).department;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.staffId = token.staffId as string;
        session.user.avatarUrl = token.avatarUrl as string;
        session.user.hub = token.hub as string;
        session.user.vehicleId = token.vehicleId as string;
        session.user.department = token.department as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
