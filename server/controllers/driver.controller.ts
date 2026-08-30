import { NextRequest, NextResponse } from "next/server";
import { driverService } from "@/server/services/driver.service";
import {
  UpdateDriverLocationSchema,
  AssignShipmentToDriverSchema,
} from "@/types/dto";
import { monitoring } from "@/lib/monitoring";

export class DriverController {
  async list(req: NextRequest) {
    try {
      const drivers = await driverService.getAllDrivers();
      return NextResponse.json({
        success: true,
        count: drivers.length,
        data: drivers,
      });
    } catch (error: any) {
      monitoring.error("DriverController", "Error in GET /api/drivers", error);
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 },
      );
    }
  }

  async updateLocation(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = UpdateDriverLocationSchema.safeParse(body);
      if (!parsed.success) {
        monitoring.warn(
          "DriverController",
          "Validation failed on driver location update",
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

      const updated = await driverService.updateLocation(parsed.data);
      return NextResponse.json({
        success: true,
        message: "Driver telematics updated",
        data: updated,
      });
    } catch (error: any) {
      monitoring.error(
        "DriverController",
        "Error in POST /api/drivers/location",
        error,
      );
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to update driver location",
        },
        { status: 500 },
      );
    }
  }

  async assignShipment(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = AssignShipmentToDriverSchema.safeParse(body);
      if (!parsed.success) {
        monitoring.warn(
          "DriverController",
          "Validation failed on shipment assignment",
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

      const updated = await driverService.assignShipment(parsed.data);
      return NextResponse.json({
        success: true,
        message: `Shipment ${parsed.data.action}ed successfully`,
        data: updated,
      });
    } catch (error: any) {
      monitoring.error(
        "DriverController",
        "Error in POST /api/drivers/assign",
        error,
      );
      return NextResponse.json(
        { success: false, error: error.message || "Failed to assign shipment" },
        { status: 500 },
      );
    }
  }
}

export const driverController = new DriverController();
