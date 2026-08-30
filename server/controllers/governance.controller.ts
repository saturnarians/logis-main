import { NextRequest, NextResponse } from "next/server";
import { governanceService } from "@/server/services/governance.service";
import { GovernanceMutationSchema } from "@/types/dto";
import { monitoring } from "@/lib/monitoring";

export class GovernanceController {
  async get(req: NextRequest) {
    try {
      const config = await governanceService.getConfig();
      return NextResponse.json({ success: true, data: config });
    } catch (error: any) {
      monitoring.error(
        "GovernanceController",
        "Error in GET /api/governance",
        error,
      );
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to retrieve governance config",
        },
        { status: 500 },
      );
    }
  }

  async post(req: NextRequest) {
    try {
      const body = await req.json();
      const parsed = GovernanceMutationSchema.safeParse(body);
      if (!parsed.success) {
        monitoring.warn(
          "GovernanceController",
          "Invalid governance mutation body",
          parsed.error.format(),
        );
        return NextResponse.json(
          {
            success: false,
            error: "Invalid mutation payload",
            errors: parsed.error.format(),
          },
          { status: 400 },
        );
      }

      const { action, payload } = parsed.data;

      if (action === "updateConfig") {
        const updated = await governanceService.updateConfig(
          payload.config,
          payload.actor || "SuperAdmin",
        );
        return NextResponse.json({
          success: true,
          message: "Governance config updated",
          data: updated,
        });
      }

      if (action === "createPendingAction") {
        const queued = await governanceService.queueAction(payload);
        return NextResponse.json({
          success: true,
          message: "Action queued for human approval",
          data: queued,
        });
      }

      if (action === "resolvePendingAction") {
        const resolved = await governanceService.resolveAction(
          payload.actionId,
          payload.status,
          payload.actor,
        );
        return NextResponse.json({
          success: true,
          message: `Action ${payload.status}`,
          data: resolved,
        });
      }

      if (action === "createAuditLog") {
        const log = await governanceService.logAudit(payload);
        return NextResponse.json({
          success: true,
          message: "Audit log recorded",
          data: log,
        });
      }

      return NextResponse.json(
        { success: false, error: "Unknown action type" },
        { status: 400 },
      );
    } catch (error: any) {
      monitoring.error(
        "GovernanceController",
        "Error in POST /api/governance",
        error,
      );
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed processing governance mutation",
        },
        { status: 500 },
      );
    }
  }
}

export const governanceController = new GovernanceController();
