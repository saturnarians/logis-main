import { NextRequest, NextResponse } from "next/server";
import { shipmentService } from "@/server/services/shipment.service";
import {
  CreateShipmentSchema,
  UpdateShipmentSchema,
  ShipmentQuerySchema,
} from "@/types/dto";
import { monitoring } from "@/lib/monitoring";

export class ShipmentController {
  async list(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const query = {
        trackingId: searchParams.get("trackingId") || undefined,
        status: searchParams.get("status") || undefined,
        search: searchParams.get("search") || undefined,
      };

      const parsedQuery = ShipmentQuerySchema.safeParse(query);
      if (!parsedQuery.success) {
        monitoring.warn(
          "ShipmentController",
          "Invalid shipment query parameters",
          parsedQuery.error.format(),
        );
        return NextResponse.json(
          {
            success: false,
            error: "Invalid query parameters",
            details: parsedQuery.error.format(),
          },
          { status: 400 },
        );
      }

      if (parsedQuery.data.trackingId) {
        const shipment = await shipmentService.getShipmentByTrackingId(
          parsedQuery.data.trackingId,
        );
        if (!shipment) {
          return NextResponse.json(
            { success: false, error: "Shipment not found" },
            { status: 404 },
          );
        }
        return NextResponse.json({ success: true, data: shipment });
      }

      const shipments = await shipmentService.getAllShipments(
        parsedQuery.data.search,
        parsedQuery.data.status,
      );
      return NextResponse.json({
        success: true,
        count: shipments.length,
        data: shipments,
      });
    } catch (error: any) {
      monitoring.error(
        "ShipmentController",
        "Error in GET /api/shipments",
        error,
      );
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 },
      );
    }
  }

  async create(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = CreateShipmentSchema.safeParse(body);
      if (!parsed.success) {
        monitoring.warn(
          "ShipmentController",
          "Validation failed on create shipment",
          parsed.error.format(),
        );
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            errors: parsed.error.format(),
          },
          { status: 400 },
        );
      }

      const created = await shipmentService.createShipment(parsed.data);
      return NextResponse.json(
        {
          success: true,
          message: "Shipment created successfully",
          data: created,
        },
        { status: 201 },
      );
    } catch (error: any) {
      monitoring.error(
        "ShipmentController",
        "Error in POST /api/shipments",
        error,
      );
      return NextResponse.json(
        { success: false, error: error.message || "Failed to create shipment" },
        { status: 500 },
      );
    }
  }

  async update(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = UpdateShipmentSchema.safeParse(body);
      if (!parsed.success) {
        monitoring.warn(
          "ShipmentController",
          "Validation failed on update shipment",
          parsed.error.format(),
        );
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            errors: parsed.error.format(),
          },
          { status: 400 },
        );
      }

      const trackingId = parsed.data.trackingId || parsed.data.id;
      if (!trackingId) {
        return NextResponse.json(
          { success: false, error: "trackingId or id is required for update" },
          { status: 400 },
        );
      }

      const updated = await shipmentService.updateShipment(
        trackingId,
        parsed.data,
      );
      return NextResponse.json({
        success: true,
        message: "Shipment updated successfully",
        data: updated,
      });
    } catch (error: any) {
      monitoring.error(
        "ShipmentController",
        "Error in PUT /api/shipments",
        error,
      );
      return NextResponse.json(
        { success: false, error: error.message || "Failed to update shipment" },
        { status: 500 },
      );
    }
  }
}

export const shipmentController = new ShipmentController();
