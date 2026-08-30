import type { DatadogLogPayloadDto, MonitoringLevel } from '@/types/dto';

/**
 * Backend Datadog APM & Structured JSON Logging Wrapper
 * Formats API diagnostics, spans, metrics, and backend exceptions into standard Datadog schemas.
 */

interface DatadogServerConfig {
  apiKey?: string;
  service: string;
  env: string;
  version: string;
  source: string;
}

class DatadogBackendTracker {
  private config: DatadogServerConfig = {
    apiKey: process.env.DATADOG_API_KEY || 'mock-datadog-api-key',
    service: 'dhl-logistics-backend',
    env: process.env.NODE_ENV || 'development',
    version: '0.1.0',
    source: 'nextjs',
  };

  private metricsBuffer: Record<string, number> = {};

  public log(
    level: MonitoringLevel,
    module: string,
    message: string,
    details?: any,
    reqContext?: {
      url?: string;
      method?: string;
      statusCode?: number;
      traceId?: string;
      spanId?: string;
      user?: { id?: string; email?: string; role?: string };
    }
  ): DatadogLogPayloadDto {
    const traceId = reqContext?.traceId || `dd-trace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const spanId = reqContext?.spanId || `dd-span-${Math.random().toString(36).substring(2, 8)}`;

    let errorObj: { kind?: string; message?: string; stack?: string } | undefined;
    if (details instanceof Error) {
      errorObj = {
        kind: details.name,
        message: details.message,
        stack: details.stack,
      };
    } else if (details?.error instanceof Error) {
      errorObj = {
        kind: details.error.name,
        message: details.error.message,
        stack: details.error.stack,
      };
    }

    const payload: DatadogLogPayloadDto = {
      ddsource: this.config.source,
      service: this.config.service,
      env: this.config.env,
      version: this.config.version,
      level,
      module,
      message,
      trace_id: traceId,
      span_id: spanId,
      timestamp: new Date().toISOString(),
      http: reqContext?.url ? {
        url: reqContext.url,
        method: reqContext.method || 'GET',
        status_code: reqContext.statusCode || 200,
      } : undefined,
      usr: reqContext?.user,
      error: errorObj,
      customAttributes: typeof details === 'object' && !(details instanceof Error) ? details : undefined,
    };

    // In production or development, log structured JSON for Datadog Log Forwarder / Cloud Run
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(payload));
    }

    return payload;
  }

  public captureException(error: unknown, module: string, reqContext?: any) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    return this.log('ERROR', module, errObj.message, errObj, reqContext);
  }

  public incrementMetric(name: string, value: number = 1, tags: Record<string, string> = {}) {
    const tagStr = Object.entries(tags).map(([k, v]) => `${k}:${v}`).join(',');
    const key = `${name}[${tagStr}]`;
    this.metricsBuffer[key] = (this.metricsBuffer[key] || 0) + value;
  }

  public async trace<T>(
    operationName: string,
    resource: string,
    handler: (span: { traceId: string; spanId: string }) => Promise<T>
  ): Promise<T> {
    const traceId = `dd-trace-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const spanId = `dd-span-${Math.random().toString(36).substring(2, 8)}`;
    const startTime = Date.now();

    try {
      const result = await handler({ traceId, spanId });
      const duration = Date.now() - startTime;
      this.incrementMetric('api.request.success', 1, { operation: operationName, resource });
      this.incrementMetric('api.request.duration_ms', duration, { operation: operationName });
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.incrementMetric('api.request.error', 1, { operation: operationName, resource });
      this.captureException(error, operationName, { traceId, spanId });
      throw error;
    }
  }

  public getMetrics(): Record<string, number> {
    return { ...this.metricsBuffer };
  }
}

export const datadogServer = new DatadogBackendTracker();
