import { prisma } from '@/lib/prisma';
import { logger, monitoring } from '@/lib/logger';
import type { AIGovernanceConfigDto, PendingAIActionDto, AIAuditLogDto } from '@/types/dto';

export class GovernanceService {
  async getConfig(): Promise<AIGovernanceConfigDto> {
    try {
      logger.info('GovernanceService', 'Loading AI governance policy & kill switch state');
      const config = await prisma.aIGovernanceConfig.findFirst();

      const pendingActionsRecords = await prisma.pendingAIAction.findMany({
        orderBy: { timestamp: 'desc' },
      });

      const auditLogRecords = await prisma.aIAuditLog.findMany({
        take: 100,
        orderBy: { timestamp: 'desc' },
      });

      const pendingActions: PendingAIActionDto[] = pendingActionsRecords.map((a: any) => ({
        id: a.id,
        actionType: a.actionType as any,
        title: a.title,
        description: a.description,
        payload: typeof a.payloadJson === 'string' ? JSON.parse(a.payloadJson) : a.payloadJson || {},
        status: a.status as any,
        timestamp: a.timestamp,
        proposerPrompt: a.proposerPrompt || undefined,
      }));

      const auditLogs: AIAuditLogDto[] = auditLogRecords.map((l: any) => ({
        id: l.id,
        timestamp: l.timestamp,
        actor: l.actor,
        action: l.action,
        details: l.details,
        status: l.status,
      }));

      if (!config) {
        // Fallback default
        return {
          aiEnabled: true,
          lastModifiedBy: 'SuperAdmin Executive',
          lastModifiedAt: new Date().toISOString(),
          dataAccessMode: 'human_in_the_loop',
          readPermissions: {
            shipments: true,
            fleetAndDrivers: true,
            telemetryAndGPS: true,
            financialsAndTariffs: true,
            alertsAndExceptions: true,
          },
          writePermissions: {
            updateShipmentStatus: true,
            assignDrivers: true,
            createAlerts: true,
            modifyTariffs: false,
          },
          pendingActions,
          auditLogs,
        };
      }

      return {
        aiEnabled: config.aiEnabled,
        lastModifiedBy: config.lastModifiedBy,
        lastModifiedAt: typeof config.lastModifiedAt === 'string' ? config.lastModifiedAt : new Date().toISOString(),
        dataAccessMode: config.dataAccessMode as any,
        readPermissions: config.readPermissionsJson ? JSON.parse(config.readPermissionsJson) : {},
        writePermissions: config.writePermissionsJson ? JSON.parse(config.writePermissionsJson) : {},
        pendingActions,
        auditLogs,
      };
    } catch (error: any) {
      logger.error('GovernanceService', 'Error retrieving AI governance configuration', error);
      throw error;
    }
  }

  async updateConfig(dto: Partial<AIGovernanceConfigDto>, actor = 'SuperAdmin'): Promise<AIGovernanceConfigDto> {
    try {
      logger.info('GovernanceService', `Modifying AI governance config by actor: ${actor}`, dto);
      const current = await this.getConfig();

      const updated = {
        aiEnabled: dto.aiEnabled !== undefined ? dto.aiEnabled : current.aiEnabled,
        lastModifiedBy: actor,
        lastModifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        dataAccessMode: dto.dataAccessMode || current.dataAccessMode,
        readPermissions: dto.readPermissions || current.readPermissions,
        writePermissions: dto.writePermissions || current.writePermissions,
      };

      const firstRecord = await prisma.aIGovernanceConfig.findFirst();
      if (firstRecord) {
        await prisma.aIGovernanceConfig.update({
          where: { id: firstRecord.id },
          data: {
            aiEnabled: updated.aiEnabled,
            lastModifiedBy: updated.lastModifiedBy,
            lastModifiedAt: updated.lastModifiedAt,
            dataAccessMode: updated.dataAccessMode,
            readPermissionsJson: JSON.stringify(updated.readPermissions),
            writePermissionsJson: JSON.stringify(updated.writePermissions),
          },
        });
      } else {
        await prisma.aIGovernanceConfig.create({
          data: {
            aiEnabled: updated.aiEnabled,
            lastModifiedBy: updated.lastModifiedBy,
            lastModifiedAt: updated.lastModifiedAt,
            dataAccessMode: updated.dataAccessMode,
            readPermissionsJson: JSON.stringify(updated.readPermissions),
            writePermissionsJson: JSON.stringify(updated.writePermissions),
          },
        });
      }

      logger.info('GovernanceService', 'AI Governance config updated and saved to SQLite');
      return this.getConfig();
    } catch (error: any) {
      logger.error('GovernanceService', 'Failed to update AI Governance config', error);
      throw error;
    }
  }

  async logAudit(entry: Omit<AIAuditLogDto, 'id' | 'timestamp'>) {
    try {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const created = await prisma.aIAuditLog.create({
        data: {
          timestamp,
          actor: entry.actor,
          action: entry.action,
          details: entry.details,
          status: entry.status,
        },
      });
      return created;
    } catch (error: any) {
      logger.error('GovernanceService', 'Failed to append audit log', error);
    }
  }

  async queueAction(action: Omit<PendingAIActionDto, 'id' | 'timestamp' | 'status'>) {
    try {
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const created = await prisma.pendingAIAction.create({
        data: {
          actionType: action.actionType,
          title: action.title,
          description: action.description,
          payloadJson: JSON.stringify(action.payload || {}),
          status: 'pending',
          timestamp,
          proposerPrompt: action.proposerPrompt,
        },
      });

      return {
        id: created.id,
        actionType: created.actionType as any,
        title: created.title,
        description: created.description,
        payload: action.payload,
        status: 'pending',
        timestamp: created.timestamp,
        proposerPrompt: created.proposerPrompt || undefined,
      };
    } catch (error: any) {
      logger.error('GovernanceService', 'Failed to queue pending AI action', error);
      throw error;
    }
  }

  async resolveAction(actionId: string, status: 'approved' | 'rejected', actor = 'SuperAdmin') {
    try {
      const updated = await prisma.pendingAIAction.update({
        where: { id: actionId },
        data: { status },
      });

      await this.logAudit({
        actor,
        action: `${status.toUpperCase()}_AI_ACTION`,
        details: `${actor} ${status} AI action: ${updated.title}`,
        status: status === 'approved' ? 'Success' : 'Rejected',
      });

      return {
        id: updated.id,
        actionType: updated.actionType as any,
        title: updated.title,
        description: updated.description,
        payload: typeof updated.payloadJson === 'string' ? JSON.parse(updated.payloadJson) : updated.payloadJson || {},
        status: updated.status as any,
        timestamp: updated.timestamp,
      };
    } catch (error: any) {
      logger.error('GovernanceService', `Failed to resolve action [${actionId}] to [${status}]`, error);
      throw error;
    }
  }
}

export const governanceService = new GovernanceService();
