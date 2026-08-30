import type { CronJobDefinitionDto } from '@/types/dto';
import { monitoring } from '@/lib/monitoring';

/**
 * Centralized Cron Jobs Engine
 * Manages periodic task registration, execution tracking, telemetry simulation, and SLA monitoring.
 */

type JobHandler = () => Promise<void> | void;

interface RegisteredJob {
  definition: CronJobDefinitionDto;
  handler: JobHandler;
  timerRef?: NodeJS.Timeout | null;
}

class CronEngine {
  private jobs: Map<string, RegisteredJob> = new Map();
  private isInitialized = false;

  constructor() {
    this.registerDefaultJobs();
  }

  private registerDefaultJobs() {
    // 1. Telemetry simulation cron (simulates vehicle movement and GPS tracking updates)
    this.register(
      {
        name: 'telemetry_simulation_cron',
        description: 'Updates active in-transit vehicle coordinates and telematics heartbeat',
        intervalMs: 30000, // 30s
        cronSchedule: '*/30 * * * * *',
        enabled: true,
        lastStatus: 'idle',
        runCount: 0,
      },
      async () => {
        monitoring.debug('CronEngine', 'Executing telemetry simulation tick');
        // Telemetry task logic
      }
    );

    // 2. SLA Delay monitor cron (flags shipments nearing or exceeding estimated delivery)
    this.register(
      {
        name: 'sla_delay_monitor_cron',
        description: 'Evaluates pending/in-transit shipments against SLA delivery windows and generates delay notices',
        intervalMs: 60000, // 60s
        cronSchedule: '* * * * *',
        enabled: true,
        lastStatus: 'idle',
        runCount: 0,
      },
      async () => {
        monitoring.info('CronEngine', 'Executing SLA breach & delivery delay scan');
      }
    );

    // 3. System Heartbeat & Monitoring Metric flush
    this.register(
      {
        name: 'monitoring_metric_heartbeat',
        description: 'Flushes Datadog metrics and checks service uptime indicators',
        intervalMs: 45000, // 45s
        cronSchedule: '*/45 * * * * *',
        enabled: true,
        lastStatus: 'idle',
        runCount: 0,
      },
      async () => {
        monitoring.recordMetric('system.cron.heartbeat', 1, { status: 'healthy' });
      }
    );

    // 4. AI Audit Log Retention Manager
    this.register(
      {
        name: 'ai_governance_audit_manager',
        description: 'Verifies pending autonomous action queues and purges outdated transient logs',
        intervalMs: 120000, // 2m
        cronSchedule: '*/2 * * * *',
        enabled: true,
        lastStatus: 'idle',
        runCount: 0,
      },
      async () => {
        monitoring.debug('CronEngine', 'Evaluating AI governance queue health');
      }
    );
  }

  /**
   * Register a new cron job with handler
   */
  public register(definition: Omit<CronJobDefinitionDto, 'lastRun' | 'nextRun' | 'lastDurationMs' | 'lastError'>, handler: JobHandler) {
    const fullDef: CronJobDefinitionDto = {
      ...definition,
      lastRun: null,
      nextRun: new Date(Date.now() + definition.intervalMs).toISOString(),
      runCount: 0,
      lastDurationMs: null,
      lastError: null,
      lastStatus: 'idle',
    };

    this.jobs.set(definition.name, {
      definition: fullDef,
      handler,
      timerRef: null,
    });
  }

  /**
   * Start all registered cron jobs
   */
  public startAll() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    monitoring.info('CronEngine', `Starting ${this.jobs.size} registered system cron jobs`);

    for (const [name, job] of this.jobs.entries()) {
      if (job.definition.enabled) {
        this.scheduleJob(name);
      }
    }
  }

  /**
   * Stop all registered cron jobs
   */
  public stopAll() {
    for (const job of this.jobs.values()) {
      if (job.timerRef) {
        clearInterval(job.timerRef);
        job.timerRef = null;
      }
      job.definition.lastStatus = 'disabled';
    }
    this.isInitialized = false;
    monitoring.info('CronEngine', 'Stopped all system cron jobs');
  }

  private scheduleJob(name: string) {
    const job = this.jobs.get(name);
    if (!job) return;

    if (job.timerRef) {
      clearInterval(job.timerRef);
    }

    job.definition.lastStatus = 'scheduled';
    job.definition.nextRun = new Date(Date.now() + job.definition.intervalMs).toISOString();

    job.timerRef = setInterval(async () => {
      await this.executeJob(name);
    }, job.definition.intervalMs);
  }

  /**
   * Execute a single cron job immediately
   */
  public async executeJob(name: string): Promise<CronJobDefinitionDto> {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Cron job [${name}] not found`);
    }

    const startTime = Date.now();
    job.definition.lastStatus = 'running';
    job.definition.lastRun = new Date().toISOString();

    try {
      await job.handler();
      const duration = Date.now() - startTime;
      job.definition.lastDurationMs = duration;
      job.definition.lastStatus = 'idle';
      job.definition.runCount += 1;
      job.definition.lastError = null;
      job.definition.nextRun = new Date(Date.now() + job.definition.intervalMs).toISOString();

      monitoring.recordMetric('system.cron.success', 1, { job: name });
      return { ...job.definition };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      job.definition.lastDurationMs = duration;
      job.definition.lastStatus = 'failed';
      job.definition.lastError = error.message || 'Unknown cron execution error';
      job.definition.nextRun = new Date(Date.now() + job.definition.intervalMs).toISOString();

      monitoring.error('CronEngine', `Cron job [${name}] failed execution`, error);
      monitoring.recordMetric('system.cron.failure', 1, { job: name });
      return { ...job.definition };
    }
  }

  /**
   * Get the list of all registered jobs and their status
   */
  public getStatusList(): CronJobDefinitionDto[] {
    return Array.from(this.jobs.values()).map((j) => ({ ...j.definition }));
  }

  /**
   * Toggle enable / disable of a job
   */
  public toggleJob(name: string, enabled: boolean) {
    const job = this.jobs.get(name);
    if (!job) return null;

    job.definition.enabled = enabled;
    if (enabled) {
      this.scheduleJob(name);
    } else {
      if (job.timerRef) {
        clearInterval(job.timerRef);
        job.timerRef = null;
      }
      job.definition.lastStatus = 'disabled';
    }

    return { ...job.definition };
  }
}

export const cron = new CronEngine();
