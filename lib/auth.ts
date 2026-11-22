import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { PrismaUserRepository } from '@/server/services/repository/auth.prisma.repository';
import { ScryptPasswordHasher } from '@/server/services/repository/argon2.passwordhasher';
import { LoginCredentialsSchema } from '@/types/dto';

const users = new PrismaUserRepository(prisma);
const passwords = new ScryptPasswordHasher();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'FastLink Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'dispatcher@fastlink.com' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const parsed = LoginCredentialsSchema.safeParse(credentials);
          if (!parsed.success) {
            logger.warn('NextAuth', 'Failed login credentials validation', { reason: 'invalid_credentials_format' });
            console.log('[auth:be] sign-in rejected', JSON.stringify({ reason: 'invalid_credentials_format' }));
            return null;
          }

          const user = await users.findByIdentifier(parsed.data.email);
          if (!user || !user.isActive || !(await passwords.verify(user.passwordHash, parsed.data.password))) {
            logger.warn('NextAuth', 'Sign-in rejected', { reason: 'invalid_credentials' });
            console.log('[auth:be] sign-in rejected', JSON.stringify({ reason: 'invalid_credentials' }));
            return null;
          }

          logger.info('NextAuth', 'Authorized login', { role: user.role });
          console.log('[auth:be] sign-in accepted', JSON.stringify({ role: user.role }));
          await users.updateLastLogin(user.id, new Date());
          const { passwordHash, ...authorizedUser } = user;
          return authorizedUser;
        } catch (error: any) {
          logger.error('NextAuth', 'Authentication error in authorize()', {
            errorName: error instanceof Error ? error.name : 'UnknownError',
          });
          console.error(
            '[auth:be] sign-in failed',
            JSON.stringify({ errorName: error instanceof Error ? error.name : 'UnknownError' }),
          );
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes session duration handled natively by NextAuth
  },
  secret: process.env.NEXTAUTH_SECRET || 'fastlink-super-secret-nextauth-encryption-key-2026',
  callbacks: {
    async jwt({ token, user }) {
      // 1. Initial sign-in: populate token from user payload
      if (user) {
        console.log('[auth:be] session token created');
        token.id = user.id;
        token.role = (user as any).role;
        token.staffId = (user as any).staffId;
        token.avatarUrl = (user as any).avatarUrl;
        token.hub = (user as any).hub;
        token.vehicleId = (user as any).vehicleId;
        token.department = (user as any).department;
        token.phone = (user as any).phone;
        token.lastActive = Date.now();
        token.version = process.env.SESSION_VERSION || '1';
        return token;
      }

      // 2. Subsequent requests: update timestamp safely
      token.lastActive = Date.now();
      return token;
    },
    async session({ session, token }) {
      // Guard clause: stop if token or session user is missing
      if (!token?.id || !session.user) {
        return session;
      }

      session.user.id = token.id as string;
      session.user.role = token.role as any;
      session.user.staffId = token.staffId as string;
      session.user.avatarUrl = token.avatarUrl as string;
      session.user.hub = token.hub as string;
      session.user.vehicleId = token.vehicleId as string;
      session.user.department = token.department as string;
      session.user.phone = token.phone as string;
      (session as any).version = token.version;

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};