import { sentryClient } from './sentry.client';
import { datadogServer } from './datadog.server';
import type { MonitoringLevel } from '@/types/dto';

/**
 * Unified Monitoring & Error Tracking Wrapper Module
 * - Frontend: Sentry client telemetry, exception capturing, breadcrumbs, user tagging.
 * - Backend / API: Datadog APM tracing, structured JSON logs, metrics counter, server exception capture.
 * - Terminal: ANSI colored formatting for development diagnostics.
 */

export interface UnifiedLogEntry {
  id: string;
  timestamp: string;
  level: MonitoringLevel;
  module: string;
  message: string;
  details?: any;
  stack?: string;
  target?: 'sentry' | 'datadog' | 'both';
  traceId?: string;
}

const MAX_LOGS = 200;
const globalLogs: UnifiedLogEntry[] = (globalThis as any).__DHL_UNIFIED_LOG_STORE__ || [];
(globalThis as any).__DHL_UNIFIED_LOG_STORE__ = globalLogs;

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function formatTerminalOutput(entry: UnifiedLogEntry): string {
  const timeStr = `${ANSI.dim}${entry.timestamp}${ANSI.reset}`;
  const modStr = `${ANSI.cyan}[${entry.module}]${ANSI.reset}`;

  let levelTag = '';
  switch (entry.level) {
    case 'ERROR':
    case 'FATAL':
      levelTag = `${ANSI.bgRed}${ANSI.white} ERROR ${ANSI.reset} ${ANSI.red}`;
      break;
    case 'WARN':
      levelTag = `${ANSI.bgYellow}${ANSI.white} WARN  ${ANSI.reset} ${ANSI.yellow}`;
      break;
    case 'INFO':
      levelTag = `${ANSI.bgBlue}${ANSI.white} INFO  ${ANSI.reset} ${ANSI.blue}`;
      break;
    case 'DEBUG':
      levelTag = `${ANSI.dim}[DEBUG]${ANSI.reset} ${ANSI.white}`;
      break;
  }

  let output = `${timeStr} ${levelTag}${modStr} ${entry.message}${ANSI.reset}`;

  if (entry.details) {
    try {
      const detailsStr = typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details, null, 2);
      output += `\n${ANSI.dim}Details: ${detailsStr}${ANSI.reset}`;
    } catch {
      output += `\n${ANSI.dim}Details: [Unserializable Object]${ANSI.reset}`;
    }
  }

  if (entry.stack) {
    output += `\n${ANSI.red}${entry.stack}${ANSI.reset}`;
  }

  return output;
}

class MonitoringService {
  public sentry = sentryClient;
  public datadog = datadogServer;

  /**
   * Log an event across appropriate monitoring channels
   */
  public log(level: MonitoringLevel, module: string, message: string, details?: any, reqContext?: any) {
    const isClient = typeof window !== 'undefined';
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let stack: string | undefined;

    if (details instanceof Error) {
      stack = details.stack;
    }

    const entry: UnifiedLogEntry = {
      id: `mon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      level,
      module,
      message,
      details,
      stack,
      target: isClient ? 'sentry' : 'datadog',
    };

    globalLogs.unshift(entry);
    if (globalLogs.length > MAX_LOGS) globalLogs.pop();

    if (isClient) {
      // 1. Client-Side (Sentry)
      this.sentry.addBreadcrumb({
        category: module,
        message,
        level,
        data: typeof details === 'object' ? details : { raw: details },
      });

      if (level === 'ERROR' || level === 'FATAL') {
        this.sentry.captureException(details instanceof Error ? details : new Error(message), {
          module,
          ...reqContext,
        });
      }
    } else {
      // 2. Server-Side (Datadog + Terminal)
      const ddPayload = this.datadog.log(level, module, message, details, reqContext);
      entry.traceId = ddPayload.trace_id;

      if (process.env.NODE_ENV !== 'production') {
        if (level === 'ERROR' || level === 'FATAL') {
          console.error(formatTerminalOutput(entry));
        } else if (level === 'WARN') {
          console.warn(formatTerminalOutput(entry));
        } else {
          console.log(formatTerminalOutput(entry));
        }
      }
    }

    return entry;
  }

  public info(module: string, message: string, details?: any, reqContext?: any) {
    return this.log('INFO', module, message, details, reqContext);
  }

  public warn(module: string, message: string, details?: any, reqContext?: any) {
    return this.log('WARN', module, message, details, reqContext);
  }

  public error(module: string, message: string, errorOrDetails?: any, reqContext?: any) {
    return this.log('ERROR', module, message, errorOrDetails, reqContext);
  }

  public debug(module: string, message: string, details?: any, reqContext?: any) {
    return this.log('DEBUG', module, message, details, reqContext);
  }

  /**
   * Unified exception capturing that automatically routes to Sentry on client or Datadog on server
   */
  public captureException(error: unknown, context?: Record<string, any>) {
    const isClient = typeof window !== 'undefined';
    const errObj = error instanceof Error ? error : new Error(String(error));
    const moduleName = context?.module || 'UnhandledException';

    this.log('ERROR', moduleName, errObj.message, errObj, context);

    if (isClient) {
      return this.sentry.captureException(errObj, context);
    } else {
      this.datadog.captureException(errObj, moduleName, context);
      return `dd-err-${Date.now()}`;
    }
  }

  public setUser(user: { id?: string; email?: string; role?: string; name?: string } | null) {
    if (typeof window !== 'undefined') {
      this.sentry.setUser(user ? { id: user.id, email: user.email, role: user.role, username: user.name } : null);
    }
  }

  public recordMetric(name: string, value: number = 1, tags: Record<string, string> = {}) {
    this.datadog.incrementMetric(name, value, tags);
  }

  public trace<T>(operationName: string, resource: string, fn: (span: any) => Promise<T>): Promise<T> {
    return this.datadog.trace(operationName, resource, fn);
  }

  public getRecentLogs(): UnifiedLogEntry[] {
    return [...globalLogs];
  }

  public clearLogs() {
    globalLogs.length = 0;
  }
}

export const monitoring = new MonitoringService();
export const logger = monitoring; // Direct drop-in alias

export { sentryClient, datadogServer };
export default monitoring;
