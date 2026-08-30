import { z } from 'zod';
import { UserRoleSchema } from './auth.dto';

// ==========================================
// 1. RBAC SCHEMAS & TYPES
// ==========================================

export const PermissionActionSchema = z.enum([
  // Shipments & Orders
  'shipment:read',
  'shipment:create',
  'shipment:update',
  'shipment:delete',
  'shipment:assign',
  'shipment:pod',
  
  // Drivers & Fleet
  'driver:read',
  'driver:telemetry',
  'driver:status_update',
  'driver:manage',
  'fleet:read',
  'fleet:manage',
  
  // AI Governance & Kill Switch
  'governance:read',
  'governance:policy_write',
  'governance:killswitch',
  'governance:approve_action',
  'governance:audit_read',
  
  // Finance & Tariffs
  'finance:read',
  'finance:invoice_issue',
  'finance:tariff_edit',
  
  // Warehouses & Hubs
  'hub:read',
  'hub:manage',
  
  // System & Monitoring & Cron
  'cron:read',
  'cron:manage',
  'cron:run_manual',
  'system:db_reseed',
  'system:logs_view',
  'monitoring:view',
  'notification:send',
  'notification:broadcast',
]);
export type PermissionAction = z.infer<typeof PermissionActionSchema>;

export const SystemPermissionDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  action: PermissionActionSchema,
  superadmin: z.boolean().default(true),
  admin: z.boolean().default(false),
  driver: z.boolean().default(false),
  customer: z.boolean().default(false),
});
export type SystemPermissionDto = z.infer<typeof SystemPermissionDtoSchema>;

export const CheckPermissionRequestSchema = z.object({
  role: UserRoleSchema,
  action: PermissionActionSchema,
  userId: z.string().optional(),
});
export type CheckPermissionRequestDto = z.infer<typeof CheckPermissionRequestSchema>;

// ==========================================
// 2. CRON SCHEMAS & TYPES
// ==========================================

export const CronJobStatusSchema = z.enum(['idle', 'running', 'scheduled', 'failed', 'disabled']);
export type CronJobStatus = z.infer<typeof CronJobStatusSchema>;

export const CronJobDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  intervalMs: z.number().int().positive(),
  cronSchedule: z.string().optional(),
  enabled: z.boolean().default(true),
  lastRun: z.string().optional().nullable(),
  nextRun: z.string().optional().nullable(),
  runCount: z.number().int().nonnegative().default(0),
  lastStatus: CronJobStatusSchema.default('idle'),
  lastDurationMs: z.number().optional().nullable(),
  lastError: z.string().optional().nullable(),
});
export type CronJobDefinitionDto = z.infer<typeof CronJobDefinitionSchema>;

export const TriggerCronRequestSchema = z.object({
  jobName: z.string(),
  force: z.boolean().optional().default(false),
});
export type TriggerCronRequestDto = z.infer<typeof TriggerCronRequestSchema>;

// ==========================================
// 3. NOTIFICATION SCHEMAS & TYPES
// ==========================================

export const NotificationChannelSchema = z.enum(['internal', 'sms', 'email', 'all']);
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;

export const NotificationCategorySchema = z.enum([
  'shipment_update',
  'driver_alert',
  'sla_breach',
  'ai_governance',
  'billing_invoice',
  'system_security',
  'general'
]);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;

export const NotificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  channel: NotificationChannelSchema.default('internal'),
  category: NotificationCategorySchema.default('general'),
  priority: NotificationPrioritySchema.default('medium'),
  recipientRole: UserRoleSchema.optional().nullable(),
  recipientId: z.string().optional().nullable(),
  recipientPhone: z.string().optional().nullable(),
  recipientEmail: z.string().optional().nullable(),
  read: z.boolean().default(false),
  timestamp: z.string(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  deliveredChannels: z.array(NotificationChannelSchema).default([]),
});
export type NotificationItemDto = z.infer<typeof NotificationItemSchema>;

export const SendNotificationSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  message: z.string().min(2, 'Message is required'),
  channel: NotificationChannelSchema.default('internal'),
  category: NotificationCategorySchema.default('general'),
  priority: NotificationPrioritySchema.default('medium'),
  recipientRole: UserRoleSchema.optional(),
  recipientId: z.string().optional(),
  recipientPhone: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type SendNotificationDto = z.infer<typeof SendNotificationSchema>;

export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional().default(false),
  role: UserRoleSchema.optional(),
  userId: z.string().optional(),
});
export type MarkNotificationReadDto = z.infer<typeof MarkNotificationReadSchema>;
