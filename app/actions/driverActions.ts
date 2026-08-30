"use server";

import { driverService } from "@/server/services/driver.service";
import {
  UpdateDriverLocationDto,
  AssignShipmentToDriverDto,
} from "@/types/dto";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function updateDriverLocationAction(dto: UpdateDriverLocationDto) {
  try {
    const updated = await driverService.updateLocation(dto);
    return { success: true, data: updated };
  } catch (error: any) {
    logger.error(
      "ServerAction:updateDriverLocation",
      "Failed updating driver coordinates",
      error,
    );
    return { success: false, error: error.message };
  }
}

export async function assignDriverAction(dto: AssignShipmentToDriverDto) {
  try {
    logger.info(
      "ServerAction:assignDriver",
      `Driver assignment: ${dto.driverId} -> ${dto.shipmentId}`,
    );
    const updated = await driverService.assignShipment(dto);
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    logger.error(
      "ServerAction:assignDriver",
      "Failed driver assignment",
      error,
    );
    return { success: false, error: error.message };
  }
}
