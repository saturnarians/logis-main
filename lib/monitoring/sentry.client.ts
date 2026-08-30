import type { BreadcrumbDto, MonitoringLevel, SentryEventPayloadDto } from '@/types/dto';

/**
 * Frontend Sentry Telemetry & Error Tracking Integration Wrapper
 * Tracks browser exceptions, breadcrumbs, user contexts, and component boundary diagnostics.
 */

interface SentryClientConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

interface SentryUserContext {
  id?: string;
  email?: string;
  role?: string;
  username?: string;
}

class SentryClientTracker {
  private config: SentryClientConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || 'https://demo-sentry-key@o0.ingest.sentry.io/000000',
    environment: process.env.NODE_ENV || 'development',
    release: 'dhl-logistics-v1.0.0',
    tracesSampleRate: 1.0,
  };

  private breadcrumbs: BreadcrumbDto[] = [];
  private userContext: SentryUserContext | null = null;
  private tags: Record<string, string> = {
    app: 'dhl-logistics-portal',
    platform: 'nextjs-client',
  };
  private extras: Record<string, any> = {};
  private initialized = false;

  constructor() {
    this.init();
  }

  public init(config?: Partial<SentryClientConfig>) {
    if (typeof window === 'undefined') return; // Client only

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (!this.initialized) {
      this.initialized = true;
      this.setupGlobalHandlers();
      this.addBreadcrumb({
        category: 'sentry.lifecycle',
        message: 'Sentry Frontend SDK Initialized',
        level: 'INFO',
      });
    }
  }

  private setupGlobalHandlers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        type: 'unhandled_promise_rejection',
      });
    });
  }

  public setUser(user: SentryUserContext | null) {
    this.userContext = user;
    if (user) {
      this.addBreadcrumb({
        category: 'auth',
        message: `Sentry user identified: ${user.email} (${user.role})`,
        level: 'INFO',
      });
    }
  }

  public setTag(key: string, value: string) {
    this.tags[key] = value;
  }

  public setExtra(key: string, value: any) {
    this.extras[key] = value;
  }

  public addBreadcrumb(crumb: Omit<BreadcrumbDto, 'timestamp'>) {
    const fullCrumb: BreadcrumbDto = {
      ...crumb,
      timestamp: new Date().toISOString(),
    };
    this.breadcrumbs.push(fullCrumb);
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift();
    }
  }

  public captureException(error: unknown, context?: Record<string, any>): string {
    const eventId = `sentry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const errObj = error instanceof Error ? error : new Error(String(error));

    const payload: SentryEventPayloadDto = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      level: 'ERROR',
      logger: 'frontend.sentry',
      environment: this.config.environment || 'development',
      release: this.config.release || '1.0.0',
      message: errObj.message,
      exception: {
        values: [
          {
            type: errObj.name || 'Error',
            value: errObj.message,
            stacktrace: errObj.stack,
          },
        ],
      },
      breadcrumbs: [...this.breadcrumbs],
      user: this.userContext || undefined,
      tags: { ...this.tags, ...context?.tags },
      extra: { ...this.extras, ...context },
    };

    if (process.env.NODE_ENV !== 'production') {
      console.groupCollapsed(`%c[Sentry Client Error] %c${payload.message}`, 'color: #e53e3e; font-weight: bold;', 'color: inherit;');
      console.log('Event ID:', eventId);
      console.log('Exception Stack:', errObj.stack);
      console.log('User Context:', this.userContext);
      console.log('Breadcrumbs:', this.breadcrumbs);
      console.log('Payload:', payload);
      console.groupEnd();
    }

    this.addBreadcrumb({
      category: 'error',
      message: `Exception captured: ${errObj.message}`,
      level: 'ERROR',
      data: { eventId, errorName: errObj.name },
    });

    return eventId;
  }

  public captureMessage(message: string, level: MonitoringLevel = 'INFO', context?: Record<string, any>): string {
    const eventId = `sentry-msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.addBreadcrumb({
      category: 'custom_message',
      message,
      level,
      data: context,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Sentry Message: ${level}] ${message}`, context || '');
    }

    return eventId;
  }

  public getRecentBreadcrumbs(): BreadcrumbDto[] {
    return [...this.breadcrumbs];
  }
}

export const sentryClient = new SentryClientTracker();
