"use server";

import { governanceService } from "@/server/services/governance.service";
import { AIGovernanceConfigDto } from "@/types/dto";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

export async function toggleAIMasterSwitchAction(
  enabled: boolean,
  actor = "SuperAdmin",
) {
  try {
    logger.info(
      "ServerAction:toggleAIMasterSwitch",
      `Setting AI master switch to [${enabled}] by [${actor}]`,
    );
    const updated = await governanceService.updateConfig(
      { aiEnabled: enabled },
      actor,
    );
    await governanceService.logAudit({
      actor,
      action: enabled
        ? "AI_MASTER_SWITCH_ENABLED"
        : "AI_MASTER_SWITCH_DISABLED",
      details: `${actor} toggled AI master kill switch to ${enabled ? "ENABLED" : "DISABLED"}`,
      status: "Success",
    });
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    logger.error(
      "ServerAction:toggleAIMasterSwitch",
      "Failed toggling AI master switch",
      error,
    );
    return { success: false, error: error.message };
  }
}

export async function resolvePendingActionAction(
  actionId: string,
  status: "approved" | "rejected",
  actor = "SuperAdmin",
) {
  try {
    logger.info(
      "ServerAction:resolvePendingAction",
      `Resolving action [${actionId}] to [${status}] by [${actor}]`,
    );
    const resolved = await governanceService.resolveAction(
      actionId,
      status,
      actor,
    );
    revalidatePath("/");
    return { success: true, data: resolved };
  } catch (error: any) {
    logger.error(
      "ServerAction:resolvePendingAction",
      `Failed resolving action ${actionId}`,
      error,
    );
    return { success: false, error: error.message };
  }
}
