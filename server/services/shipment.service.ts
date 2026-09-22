import { prisma } from "@/lib/prisma";
import { logger, monitoring } from "@/lib/logger";
import { notifications } from "@/lib/system/notifications";
import type {
  CreateShipmentDto,
  UpdateShipmentDto,
  ShipmentDto,
} from "@/types/dto";

export class ShipmentService {
  /**
   * Fetch all shipments with relations, falling back gracefully
   */
  async getAllShipments(search?: string, status?: string): Promise<any[]> {
    try {
      logger.info(
        "ShipmentService",
        `Querying shipments with filter status: ${status || "ALL"}, search: ${search || "NONE"}`,
      );

      const records = await prisma.shipment.findMany({
        include: {
          timeline: true,
        },
        orderBy: { createdAt: "desc" },
      });

      let results = records.map((s: any) => ({
        ...s,
        timeline: (s.timeline || []).map((t: any) => ({
          ...t,
          timestamp:
            typeof t.timestamp === "string"
              ? t.timestamp
              : t.timestamp
                ? new Date(t.timestamp).toISOString()
                : "",
        })),
        routePoints:
          typeof s.routePointsJson === "string" && s.routePointsJson
            ? JSON.parse(s.routePointsJson)
            : [],
        currentLocation: {
          lat: s.currentLocationLat || 50.1109,
          lng: s.currentLocationLng || 8.6821,
          address: s.currentLocationAddr || "In Transit",
        },
        proofOfDelivery:
          typeof s.proofOfDeliveryJson === "string" && s.proofOfDeliveryJson
            ? JSON.parse(s.proofOfDeliveryJson)
            : null,
        createdAt:
          typeof s.createdAt === "string"
            ? s.createdAt
            : s.createdAt
              ? new Date(s.createdAt).toISOString()
              : new Date().toISOString(),
        estimatedDelivery:
          typeof s.estimatedDelivery === "string"
            ? s.estimatedDelivery
            : s.estimatedDelivery
              ? new Date(s.estimatedDelivery).toISOString()
              : "",
        actualDelivery: s.actualDelivery
          ? typeof s.actualDelivery === "string"
            ? s.actualDelivery
            : new Date(s.actualDelivery).toISOString()
          : null,
      }));

      if (status && status !== "all") {
        results = results.filter(
          (s) => s.status.toLowerCase() === status.toLowerCase(),
        );
      }

      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (s) =>
            s.trackingId.toLowerCase().includes(q) ||
            s.customerName.toLowerCase().includes(q) ||
            s.originCity.toLowerCase().includes(q) ||
            s.destinationCity.toLowerCase().includes(q),
        );
      }

      return results;
    } catch (error: any) {
      logger.error(
        "ShipmentService",
        "Failed to retrieve shipments from database",
        error,
      );
      throw error;
    }
  }

  /**
   * Find a single shipment by tracking ID
   */
  async getShipmentByTrackingId(trackingId: string): Promise<any | null> {
    try {
      logger.info(
        "ShipmentService",
        `Locating shipment by Tracking ID: ${trackingId}`,
      );

      const s = await prisma.shipment.findUnique({
        where: { trackingId },
        include: {
          timeline: true,
        },
      });

      if (!s) {
        logger.warn(
          "ShipmentService",
          `Shipment not found for trackingId: ${trackingId}`,
        );
        return null;
      }

      return {
        ...s,
        timeline: (s.timeline || []).map((t: any) => ({
          ...t,
          timestamp:
            typeof t.timestamp === "string"
              ? t.timestamp
              : t.timestamp
                ? new Date(t.timestamp).toISOString()
                : "",
        })),
        routePoints:
          typeof s.routePointsJson === "string" && s.routePointsJson
            ? JSON.parse(s.routePointsJson)
            : [],
        currentLocation: {
          lat: s.currentLocationLat || 50.1109,
          lng: s.currentLocationLng || 8.6821,
          address: s.currentLocationAddr || "In Transit",
        },
        proofOfDelivery:
          typeof s.proofOfDeliveryJson === "string" && s.proofOfDeliveryJson
            ? JSON.parse(s.proofOfDeliveryJson)
            : null,
        createdAt:
          typeof s.createdAt === "string"
            ? s.createdAt
            : s.createdAt
              ? new Date(s.createdAt).toISOString()
              : new Date().toISOString(),
        estimatedDelivery:
          typeof s.estimatedDelivery === "string"
            ? s.estimatedDelivery
            : s.estimatedDelivery
              ? new Date(s.estimatedDelivery).toISOString()
              : "",
        actualDelivery: s.actualDelivery
          ? typeof s.actualDelivery === "string"
            ? s.actualDelivery
            : new Date(s.actualDelivery).toISOString()
          : null,
      };
    } catch (error: any) {
      logger.error(
        "ShipmentService",
        `Database error fetching shipment [${trackingId}]`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create a new shipment and its initial timeline record
   */
  async createShipment(dto: CreateShipmentDto): Promise<any> {
    try {
      logger.info(
        "ShipmentService",
        `Creating new shipment for customer: ${dto.customerName}`,
      );

      const generatedTracking =
        dto.trackingId ||
        `DHL-EU-${Math.floor(100000 + Math.random() * 900000)}`;

      const created = await prisma.shipment.create({
        data: {
          trackingId: generatedTracking,
          orderId: dto.orderId,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone || dto.recipientPhone || "",
          senderName: dto.senderName,
          senderEmail: dto.senderEmail,
          senderPhone: dto.senderPhone,
          senderAddress: dto.senderAddress,
          recipientEmail: dto.recipientEmail,
          recipientPhone: dto.recipientPhone,
          recipientAddress: dto.recipientAddress,
          originCity: dto.originCity,
          destinationCity:
            dto.destinationCity || dto.destCity || "European Hub",
          destCity: dto.destCity || dto.destinationCity || "European Hub",
          status: "Pending",
          priority: dto.priority || "Standard",
          weightKg: dto.weightKg || 1.0,
          parcelType: dto.parcelType || "Parcel Box",
          pieces: dto.pieces || 1,
          serviceType: dto.serviceType || "Express Air",
          carrier: dto.carrier || "DHL Express",
          temperatureCelsius: dto.temperatureCelsius,
          estimatedDelivery:
            dto.estimatedDelivery ||
            new Date(Date.now() + 86400000 * 2)
              .toISOString()
              .replace("T", " ")
              .substring(0, 16),
          createdAt: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
          costUsd: dto.costUsd || 45.0,
          revenueUsd: dto.revenueUsd || 85.0,
          fuelCostUsd: dto.fuelCostUsd || 12.5,
          driverId: dto.driverId || dto.assignedDriverId,
          driverName: dto.driverName,
          vehicleNo: dto.vehicleNo,
          routePointsJson: JSON.stringify(dto.routePoints || []),
          currentLocationLat: dto.currentLocation?.lat || 50.1109,
          currentLocationLng: dto.currentLocation?.lng || 8.6821,
          currentLocationAddr: dto.currentLocation?.address || dto.originCity,
          timeline: {
            create: [
              {
                status: "Order Placed",
                location: dto.originCity,
                timestamp: new Date()
                  .toISOString()
                  .replace("T", " ")
                  .substring(0, 16),
                note: `Electronic shipping instructions received. Package ready for pickup in ${dto.originCity}.`,
                updatedBy: "DHL",
              },
            ],
          },
        },
        include: {
          timeline: true,
        },
      });

      logger.info(
        "ShipmentService",
        `Successfully generated shipment: ${created.trackingId}`,
      );

      const recipientEmail = created.recipientEmail || created.senderEmail;
      console.log(`[ShipmentService:Debug] Attempting to send email for created shipment ${created.trackingId}... Target: ${recipientEmail || "none"}`);
      if (recipientEmail) {
        try {
          const res = await notifications.send({
            title: `Shipment Created: ${created.trackingId}`,
            message: `Shipment ${created.trackingId} to ${created.destinationCity} has been successfully created.`,
            channel: "email",
            category: "shipment_update",
            priority: "medium",
            recipientEmail,
          });
          if (res.deliveredChannels.includes("email")) {
            console.log(`[ShipmentService:Debug] Email notification sent successfully to ${recipientEmail}`);
          } else {
            console.log(`[ShipmentService:Debug] Email notification delivery failed for ${recipientEmail} (Check Resend API key / domain restrictions).`);
          }
        } catch (emailError) {
          console.log(`[ShipmentService:Debug] Failed to call notification service for ${recipientEmail}:`, emailError);
        }
      } else {
        console.log(`[ShipmentService:Debug] Skipped email sending for ${created.trackingId}: No recipientEmail or senderEmail provided.`);
      }

      return created;
    } catch (error: any) {
      logger.error(
        "ShipmentService",
        "Failed to create shipment in database",
        error,
      );
      throw error;
    }
  }

  /**
   * Update shipment status, milestone, or proof-of-delivery
   */
  async updateShipment(
    trackingId: string,
    dto: UpdateShipmentDto,
  ): Promise<any> {
    try {
      logger.info("ShipmentService", `Updating shipment ${trackingId}`, dto);

      const updateData: any = {};
      if (dto.status) updateData.status = dto.status;
      if (dto.driverId) updateData.driverId = dto.driverId;
      if (dto.driverName) updateData.driverName = dto.driverName;
      if (dto.vehicleNo) updateData.vehicleNo = dto.vehicleNo;
      if (dto.flaggedForDelay !== undefined)
        updateData.flaggedForDelay = dto.flaggedForDelay;
      if (dto.delayReason) updateData.delayReason = dto.delayReason;
      if (dto.currentLocation) {
        updateData.currentLocationLat = dto.currentLocation.lat;
        updateData.currentLocationLng = dto.currentLocation.lng;
        updateData.currentLocationAddr = dto.currentLocation.address;
      }
      if (dto.proofOfDelivery) {
        updateData.proofOfDeliveryJson = JSON.stringify(dto.proofOfDelivery);
        updateData.actualDelivery = new Date()
          .toISOString()
          .replace("T", " ")
          .substring(0, 16);
        updateData.status = "Delivered";
      }

      if (dto.timelineEntry) {
        updateData.timeline = {
          deleteMany: { status: dto.timelineEntry.status },
          create: {
            status: dto.timelineEntry.status,
            location: dto.timelineEntry.location,
            timestamp:
              dto.timelineEntry.timestamp ||
              new Date().toISOString().replace("T", " ").substring(0, 16),
            note: dto.timelineEntry.note,
            updatedBy: "DHL",
          },
        };
      }

      const updated = await prisma.shipment.update({
        where: { trackingId },
        data: updateData,
        include: { timeline: true },
      });

      logger.info(
        "ShipmentService",
        `Updated shipment ${trackingId} successfully`,
      );

      const targetEmail = updated.recipientEmail || updated.senderEmail;
      console.log(`[ShipmentService:Debug] Attempting to send email for updated shipment ${trackingId}... Target: ${targetEmail || "none"}`);
      if (targetEmail) {
        try {
          const res = await notifications.send({
            title: `Shipment Updated: ${updated.trackingId}`,
            message: `Shipment ${updated.trackingId} status updated to ${updated.status}.`,
            channel: "email",
            category: "shipment_update",
            priority: "medium",
            recipientEmail: targetEmail,
          });
          if (res.deliveredChannels.includes("email")) {
            console.log(`[ShipmentService:Debug] Email notification sent successfully to ${targetEmail}`);
          } else {
            console.log(`[ShipmentService:Debug] Email notification delivery failed for ${targetEmail} (Check Resend API key / domain restrictions).`);
          }
        } catch (emailError) {
          console.log(`[ShipmentService:Debug] Failed to call notification service for ${targetEmail}:`, emailError);
        }
      } else {
        console.log(`[ShipmentService:Debug] Skipped email sending for updated shipment ${trackingId}: No recipientEmail or senderEmail provided.`);
      }

      return updated;
    } catch (error: any) {
      logger.error(
        "ShipmentService",
        `Failed to update shipment ${trackingId}`,
        error,
      );
      throw error;
    }
  }
}

export const shipmentService = new ShipmentService();
