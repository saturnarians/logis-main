import { rbac, PERMISSION_DEFINITIONS } from './rbac';
import { cron } from './cron';
import { notifications } from './notifications';
import type { 
  PermissionAction, 
  UserRole, 
  SendNotificationDto, 
  CronJobDefinitionDto, 
  NotificationItemDto, 
  SystemPermissionDto 
} from '@/types/dto';

/**
 * Centralized Platform System Services Wrapper Module
 * Unifies:
 *  - RBAC: Granular role-based permissions matrix and action authorization
 *  - Cron Jobs: Background scheduler, telemetry sync, SLA breach monitors
 *  - Notifications: Multi-channel delivery (internal alerts, SMS, transactional email)
 */

export class SystemPlatformWrapper {
  public rbac = rbac;
  public cron = cron;
  public notifications = notifications;

  /**
   * Helper: Check RBAC permission for a role
   */
  public hasPermission(role: UserRole, action: PermissionAction): boolean {
    return this.rbac.hasPermission(role, action);
  }

  /**
   * Helper: Enforce RBAC permission (throws 403 if unauthorized)
   */
  public enforce(role: UserRole, action: PermissionAction): void {
    this.rbac.enforce(role, action);
  }

  /**
   * Helper: Dispatch a multi-channel notification
   */
  public async notify(payload: SendNotificationDto): Promise<NotificationItemDto> {
    return this.notifications.send(payload);
  }

  /**
   * Helper: Trigger a cron job immediately
   */
  public async runCron(jobName: string): Promise<CronJobDefinitionDto> {
    return this.cron.executeJob(jobName);
  }

  /**
   * Return full system status overview (RBAC permissions count, cron job statuses, notifications summary)
   */
  public getSystemOverview() {
    return {
      rbac: {
        totalPermissions: this.rbac.getAllPermissions().length,
        supportedRoles: ['superadmin', 'admin', 'driver', 'customer'],
      },
      cron: {
        jobs: this.cron.getStatusList(),
      },
      notifications: {
        recent: this.notifications.getList({ unreadOnly: false }).slice(0, 20),
        unreadTotal: this.notifications.getUnreadCount(),
      },
    };
  }
}

export const system = new SystemPlatformWrapper();

// Re-export individual engines and definitions
export { rbac, cron, notifications, PERMISSION_DEFINITIONS };
export type { 
  PermissionAction, 
  UserRole, 
  SendNotificationDto, 
  CronJobDefinitionDto, 
  NotificationItemDto, 
  SystemPermissionDto 
};

export default system;
