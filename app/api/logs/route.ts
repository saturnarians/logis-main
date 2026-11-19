import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { API_RATE_LIMITS, rateLimitRequest } from '@/lib/rate-limit';
import { withApiLogging } from '@/lib/api-monitoring';

async function getLogs(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.read);
  if (rateLimitResponse) return rateLimitResponse;

  const logs = logger.getRecentLogs();
  return NextResponse.json({ success: true, count: logs.length, data: logs });
}

async function clearLogs(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.write);
  if (rateLimitResponse) return rateLimitResponse;

  logger.clearLogs();
  return NextResponse.json({ success: true, message: 'Logs cleared' });
}

export const GET = withApiLogging(getLogs);
export const DELETE = withApiLogging(clearLogs);
