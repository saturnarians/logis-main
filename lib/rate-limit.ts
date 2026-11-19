import { NextResponse } from "next/server";

export interface RateLimitPolicy {
  name: string;
  limit: number;
  windowMs: number;
}

export const API_RATE_LIMITS = {
  read: { name: "api-read", limit: 120, windowMs: 60_000 },
  write: { name: "api-write", limit: 30, windowMs: 60_000 },
  auth: { name: "api-auth", limit: 120, windowMs: 60_000 },
  authCredentials: {
    name: "api-auth-credentials",
    limit: 10,
    windowMs: 15 * 60_000,
  },
  ai: { name: "api-ai", limit: 10, windowMs: 60_000 },
  dbSync: { name: "api-db-sync", limit: 20, windowMs: 60_000 },
  dbReseed: { name: "api-db-reseed", limit: 2, windowMs: 60_000 },
} satisfies Record<string, RateLimitPolicy>;

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitState {
  buckets: Map<string, RateLimitBucket>;
  lastCleanupAt: number;
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __logisApiRateLimit?: RateLimitState;
};
const state = (globalForRateLimit.__logisApiRateLimit ??= {
  buckets: new Map<string, RateLimitBucket>(),
  lastCleanupAt: 0,
});
const MAX_BUCKETS = 10_000;

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";

  return clientIp.slice(0, 128);
}

function removeExpiredBuckets(now: number): void {
  if (now - state.lastCleanupAt < 60_000 && state.buckets.size < MAX_BUCKETS) {
    return;
  }

  for (const [key, bucket] of state.buckets) {
    if (bucket.resetAt <= now) {
      state.buckets.delete(key);
    }
  }

  state.lastCleanupAt = now;
}

export function rateLimitRequest(
  request: Request,
  policy: RateLimitPolicy,
): NextResponse | null {
  const now = Date.now();
  removeExpiredBuckets(now);

  const key = `${policy.name}:${getClientKey(request)}`;
  let bucket = state.buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (state.buckets.size >= MAX_BUCKETS) {
      const oldestKey = state.buckets.keys().next().value;
      if (oldestKey) state.buckets.delete(oldestKey);
    }

    bucket = { count: 0, resetAt: now + policy.windowMs };
    state.buckets.set(key, bucket);
  }

  if (bucket.count >= policy.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.resetAt - now) / 1000),
    );

    return NextResponse.json(
      {
        success: false,
        error: "Too many requests",
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Limit": String(policy.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
        },
      },
    );
  }

  bucket.count += 1;
  return null;
}
