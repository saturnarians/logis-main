import { NextRequest, NextResponse } from 'next/server';
import { system } from '@/lib/system';
import { monitoring } from '@/lib/monitoring';
import { 
  SendNotificationSchema, 
  TriggerCronRequestSchema, 
  MarkNotificationReadSchema,
  TestMonitoringEventSchema 
} from '@/types/dto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') as any;
    const userId = searchParams.get('userId') || undefined;

    const overview = system.getSystemOverview();
    const filteredNotifications = system.notifications.getList({ role, userId });

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        notifications: {
          list: filteredNotifications,
          unreadCount: system.notifications.getUnreadCount(role, userId),
        },
        monitoring: {
          recentLogs: monitoring.getRecentLogs().slice(0, 50),
          metrics: monitoring.datadog.getMetrics(),
        },
      },
    });
  } catch (error: any) {
    monitoring.error('SystemAPI', 'Failed to retrieve system status', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed retrieving system status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    // 1. Dispatch Notification (Internal, SMS, Email)
    if (action === 'sendNotification') {
      const parsed = SendNotificationSchema.safeParse(body.payload);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'Validation failed', errors: parsed.error.format() }, { status: 400 });
      }

      const item = await system.notify(parsed.data);
      return NextResponse.json({ success: true, message: 'Notification dispatched', data: item });
    }

    // 2. Trigger Cron Job
    if (action === 'runCron') {
      const parsed = TriggerCronRequestSchema.safeParse(body.payload);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'Validation failed', errors: parsed.error.format() }, { status: 400 });
      }

      const jobResult = await system.runCron(parsed.data.jobName);
      return NextResponse.json({ success: true, message: `Cron job [${parsed.data.jobName}] executed`, data: jobResult });
    }

    // 3. Mark Notification Read
    if (action === 'markRead') {
      const parsed = MarkNotificationReadSchema.safeParse(body.payload);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'Validation failed', errors: parsed.error.format() }, { status: 400 });
      }

      if (parsed.data.markAll) {
        system.notifications.markAllAsRead(parsed.data.role, parsed.data.userId);
      } else if (parsed.data.notificationId) {
        system.notifications.markAsRead(parsed.data.notificationId);
      }

      return NextResponse.json({ success: true, message: 'Notification read state updated' });
    }

    // 4. Test Monitoring Error Tracking (Sentry / Datadog)
    if (action === 'testMonitoring') {
      const parsed = TestMonitoringEventSchema.safeParse(body.payload);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: 'Validation failed', errors: parsed.error.format() }, { status: 400 });
      }

      const { type, message, module } = parsed.data;
      monitoring.log('ERROR', module, `[Simulated Test Error] ${message}`, {
        simulated: true,
        targetType: type,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: `Dispatched test monitoring event for [${type}]` });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    monitoring.error('SystemAPI', 'Failed processing system action', error);
    return NextResponse.json({ success: false, error: error.message || 'System request failed' }, { status: 500 });
  }
}
