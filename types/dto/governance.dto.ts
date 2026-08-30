import { z } from 'zod';

export const AIReadPermissionsSchema = z.object({
  shipments: z.boolean().default(true),
  fleetAndDrivers: z.boolean().default(true),
  telemetryAndGPS: z.boolean().default(true),
  financialsAndTariffs: z.boolean().default(true),
  alertsAndExceptions: z.boolean().default(true),
});
export type AIReadPermissionsDto = z.infer<typeof AIReadPermissionsSchema>;

export const AIWritePermissionsSchema = z.object({
  updateShipmentStatus: z.boolean().default(true),
  assignDrivers: z.boolean().default(true),
  createAlerts: z.boolean().default(true),
  modifyTariffs: z.boolean().default(false),
});
export type AIWritePermissionsDto = z.infer<typeof AIWritePermissionsSchema>;

export const PendingAIActionSchema = z.object({
  id: z.string(),
  actionType: z.string(),
  title: z.string(),
  description: z.string(),
  payload: z.record(z.string(), z.any()),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  timestamp: z.string(),
  proposerPrompt: z.string().optional().nullable(),
});
export type PendingAIActionDto = z.infer<typeof PendingAIActionSchema>;

export const AIAuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  action: z.string(),
  details: z.string(),
  status: z.string(),
});
export type AIAuditLogDto = z.infer<typeof AIAuditLogSchema>;

export const AIGovernanceConfigSchema = z.object({
  aiEnabled: z.boolean().default(true),
  lastModifiedBy: z.string().default('SuperAdmin'),
  lastModifiedAt: z.string(),
  dataAccessMode: z.enum(['full_auto', 'human_in_the_loop', 'read_only_restricted', 'disabled']).default('human_in_the_loop'),
  readPermissions: AIReadPermissionsSchema,
  writePermissions: AIWritePermissionsSchema,
  pendingActions: z.array(PendingAIActionSchema).default([]),
  auditLogs: z.array(AIAuditLogSchema).default([]),
});
export type AIGovernanceConfigDto = z.infer<typeof AIGovernanceConfigSchema>;

export const GovernanceMutationSchema = z.object({
  action: z.enum(['updateConfig', 'createAuditLog', 'createPendingAction', 'resolvePendingAction']),
  payload: z.any(),
});
export type GovernanceMutationDto = z.infer<typeof GovernanceMutationSchema>;
