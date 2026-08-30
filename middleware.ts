import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET || 'dhl-super-secret-nextauth-encryption-key-2026',
  callbacks: {
    authorized: ({ token }) => Boolean(token && token.role && token.role !== 'customer'),
  },
});

export const config = { matcher: ['/dashboard/:path*', '/agent'] };
