import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET || 'dhlfastlink-super-secret-nextauth-encryption-key-2026',
  callbacks: {
    authorized: ({ token, req }) => {
      const authorized = Boolean(token && token.role && token.role !== 'customer');
      console.log(
        '[authz:be] protected route checked',
        JSON.stringify({
          path: req.nextUrl.pathname,
          authorized,
          role: token?.role ?? null,
        }),
      );
      return authorized;
    },
  },
});

export const config = { matcher: ['/dashboard/:path*', '/agent'] };
