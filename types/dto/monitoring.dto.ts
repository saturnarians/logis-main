import { z } from 'zod';

export const MonitoringLevelSchema = z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']);
export type MonitoringLevel = z.infer<typeof MonitoringLevelSchema>;

export const MonitoringTargetSchema = z.enum(['sentry', 'datadog', 'all']);
export type MonitoringTarget = z.infer<typeof MonitoringTargetSchema>;

export const BreadcrumbSchema = z.object({
  category: z.string(),
  message: z.string(),
  level: MonitoringLevelSchema.default('INFO'),
  data: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().optional(),
});
export type BreadcrumbDto = z.infer<typeof BreadcrumbSchema>;

export const DatadogLogPayloadSchema = z.object({
  ddsource: z.string().default('nextjs'),
  service: z.string().default('dhl-logistics-portal'),
  env: z.string().default('development'),
  version: z.string().default('0.1.0'),
  level: MonitoringLevelSchema,
  message: z.string(),
  module: z.string(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  http: z.object({
    url: z.string().optional(),
    method: z.string().optional(),
    status_code: z.number().optional(),
    useragent: z.string().optional(),
  }).optional(),
  usr: z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
  error: z.object({
    kind: z.string().optional(),
    message: z.string().optional(),
    stack: z.string().optional(),
  }).optional(),
  timestamp: z.string(),
  customAttributes: z.record(z.string(), z.any()).optional(),
});
export type DatadogLogPayloadDto = z.infer<typeof DatadogLogPayloadSchema>;

export const SentryEventPayloadSchema = z.object({
  event_id: z.string(),
  timestamp: z.string(),
  platform: z.string().default('javascript'),
  level: MonitoringLevelSchema,
  logger: z.string().optional(),
  environment: z.string().default('development'),
  release: z.string().default('0.1.0'),
  message: z.string().optional(),
  exception: z.object({
    values: z.array(z.object({
      type: z.string(),
      value: z.string(),
      stacktrace: z.any().optional(),
    })),
  }).optional(),
  breadcrumbs: z.array(BreadcrumbSchema).optional(),
  user: z.object({
    id: z.string().optional(),
    email: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
  extra: z.record(z.string(), z.any()).optional(),
});
export type SentryEventPayloadDto = z.infer<typeof SentryEventPayloadSchema>;

export const TestMonitoringEventSchema = z.object({
  type: z.enum(['sentry_exception', 'datadog_trace', 'structured_log']),
  message: z.string().default('Test Diagnostics Event'),
  module: z.string().default('SystemMonitoringView'),
  level: MonitoringLevelSchema.default('ERROR'),
});
export type TestMonitoringEventDto = z.infer<typeof TestMonitoringEventSchema>;
