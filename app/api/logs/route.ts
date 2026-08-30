import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const logs = logger.getRecentLogs();
  return NextResponse.json({ success: true, count: logs.length, data: logs });
}

export async function DELETE(req: NextRequest) {
  logger.clearLogs();
  return NextResponse.json({ success: true, message: 'Logs cleared' });
}
