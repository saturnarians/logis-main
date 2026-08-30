import { monitoring, sentryClient, datadogServer, UnifiedLogEntry } from './monitoring';

/**
 * Centralized Monitoring & Logger Proxy
 * Re-exports the unified monitoring service combining Sentry (frontend) & Datadog (backend).
 */
export const logger = monitoring;
export { monitoring, sentryClient, datadogServer };
export type { UnifiedLogEntry as LogEntry };
export default monitoring;

