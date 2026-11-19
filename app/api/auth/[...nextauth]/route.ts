import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { API_RATE_LIMITS, rateLimitRequest } from '@/lib/rate-limit';
import { withApiLogging } from '@/lib/api-monitoring';

const handler = NextAuth(authOptions);

const rateLimitedHandler = async (
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) => {
  const pathname = new URL(request.url).pathname;
  const policy = pathname.endsWith('/callback/credentials')
    ? API_RATE_LIMITS.authCredentials
    : API_RATE_LIMITS.auth;
  const rateLimitResponse = rateLimitRequest(request, policy);

  if (rateLimitResponse) return rateLimitResponse;
  return handler(request, context);
};

const monitoredHandler = withApiLogging(rateLimitedHandler);

export { monitoredHandler as GET, monitoredHandler as POST };
