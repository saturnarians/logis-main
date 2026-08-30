"use server";

import { shipmentService } from "@/server/services/shipment.service";
import {
  CreateShipmentSchema,
  UpdateShipmentSchema,
  CreateShipmentDto,
  UpdateShipmentDto,
} from "@/types/dto";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Create a new shipment
 */
export async function createShipmentAction(formData: CreateShipmentDto) {
  try {
    logger.info(
      "ServerAction:createShipment",
      "Processing new shipment creation",
      formData,
    );
    const parsed = CreateShipmentSchema.safeParse(formData);
    if (!parsed.success) {
      logger.warn(
        "ServerAction:createShipment",
        "Validation failed",
        parsed.error.format(),
      );
      return {
        success: false,
        error: "Validation failed",
        details: parsed.error.format(),
      };
    }

    const created = await shipmentService.createShipment(parsed.data);
    revalidatePath("/");
    revalidatePath("/track");
    return { success: true, data: created };
  } catch (error: any) {
    logger.error("ServerAction:createShipment", "Server action failed", error);
    return {
      success: false,
      error: error.message || "Failed to create shipment",
    };
  }
}

/**
 * Server Action: Update shipment status or assign driver
 */
export async function updateShipmentAction(
  trackingId: string,
  updateData: UpdateShipmentDto,
) {
  try {
    logger.info(
      "ServerAction:updateShipment",
      `Updating shipment ${trackingId}`,
      updateData,
    );
    const parsed = UpdateShipmentSchema.safeParse(updateData);
    if (!parsed.success) {
      logger.warn(
        "ServerAction:updateShipment",
        "Validation error",
        parsed.error.format(),
      );
      return {
        success: false,
        error: "Validation failed",
        details: parsed.error.format(),
      };
    }

    const updated = await shipmentService.updateShipment(
      trackingId,
      parsed.data,
    );
    revalidatePath("/");
    revalidatePath(`/track`);
    return { success: true, data: updated };
  } catch (error: any) {
    logger.error(
      "ServerAction:updateShipment",
      `Failed updating ${trackingId}`,
      error,
    );
    return {
      success: false,
      error: error.message || "Failed to update shipment",
    };
  }
}

/**
 * Server Action: Submit Proof of Delivery (POD)
 */
export async function submitProofOfDeliveryAction(
  trackingId: string,
  podData: {
    recipientName: string;
    signatureDataUrl?: string;
    photoUrl?: string;
    notes?: string;
    deliveredAt: string;
  },
) {
  try {
    logger.info(
      "ServerAction:submitPOD",
      `Submitting POD for shipment ${trackingId}`,
    );
    const updated = await shipmentService.updateShipment(trackingId, {
      status: "Delivered",
      proofOfDelivery: podData,
      timelineEntry: {
        status: "Delivered",
        location: "Final Destination Address",
        note: `Delivered & signed by ${podData.recipientName}. POD proof recorded.`,
        updatedBy: "Driver Handheld Terminal",
      },
    });

    revalidatePath("/");
    revalidatePath("/track");
    return { success: true, data: updated };
  } catch (error: any) {
    logger.error(
      "ServerAction:submitPOD",
      `Failed to record POD for ${trackingId}`,
      error,
    );
    return {
      success: false,
      error: error.message || "Failed to submit proof of delivery",
    };
  }
}
