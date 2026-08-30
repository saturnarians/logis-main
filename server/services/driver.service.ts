import { prisma } from '@/lib/prisma';
import { logger, monitoring } from '@/lib/logger';
import type { UpdateDriverLocationDto, AssignShipmentToDriverDto } from '@/types/dto';

export class DriverService {
  async getAllDrivers() {
    try {
      logger.info('DriverService', 'Querying fleet driver roster and live telematics');
      const records = await prisma.driver.findMany({
        orderBy: { name: 'asc' },
      });

      return records.map((d: any) => ({
        ...d,
        assignedShipmentIds: typeof d.assignedShipmentIds === 'string' ? JSON.parse(d.assignedShipmentIds) : d.assignedShipmentIds || [],
      }));
    } catch (error: any) {
      logger.error('DriverService', 'Failed to retrieve drivers from database', error);
      throw error;
    }
  }

  async getDriverById(driverId: string) {
    try {
      logger.info('DriverService', `Retrieving driver profile for [${driverId}]`);
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      });
      if (!driver) return null;
      return {
        ...driver,
        assignedShipmentIds: typeof driver.assignedShipmentIds === 'string' ? JSON.parse(driver.assignedShipmentIds) : driver.assignedShipmentIds || [],
      };
    } catch (error: any) {
      logger.error('DriverService', `Error fetching driver [${driverId}]`, error);
      throw error;
    }
  }

  async updateLocation(dto: UpdateDriverLocationDto) {
    try {
      logger.info('DriverService', `Updating telematics for driver ${dto.driverId}`, dto);
      const updatePayload: any = {
        currentLat: dto.currentLat,
        currentLng: dto.currentLng,
      };
      if (dto.status) updatePayload.status = dto.status;
      if (dto.fuelLevelPct !== undefined) updatePayload.fuelLevelPct = dto.fuelLevelPct;

      const updated = await prisma.driver.update({
        where: { id: dto.driverId },
        data: updatePayload,
      });
      return updated;
    } catch (error: any) {
      logger.error('DriverService', `Failed updating location for driver ${dto.driverId}`, error);
      throw error;
    }
  }

  async assignShipment(dto: AssignShipmentToDriverDto) {
    try {
      logger.info('DriverService', `${dto.action.toUpperCase()} shipment ${dto.shipmentId} for driver ${dto.driverId}`);
      const driver = await this.getDriverById(dto.driverId);
      if (!driver) throw new Error(`Driver ${dto.driverId} not found`);

      let currentIds: string[] = driver.assignedShipmentIds || [];
      if (dto.action === 'assign') {
        if (!currentIds.includes(dto.shipmentId)) currentIds.push(dto.shipmentId);
      } else {
        currentIds = currentIds.filter((id) => id !== dto.shipmentId);
      }

      const updated = await prisma.driver.update({
        where: { id: dto.driverId },
        data: {
          assignedShipmentIds: JSON.stringify(currentIds),
        },
      });

      return updated;
    } catch (error: any) {
      logger.error('DriverService', `Failed to ${dto.action} shipment for driver ${dto.driverId}`, error);
      throw error;
    }
  }
}

export const driverService = new DriverService();
