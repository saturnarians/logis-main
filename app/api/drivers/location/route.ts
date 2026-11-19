import { NextRequest } from "next/server";
import { driverController } from "@/server/controllers/driver.controller";
import { API_RATE_LIMITS, rateLimitRequest } from "@/lib/rate-limit";
import { withApiLogging } from "@/lib/api-monitoring";

async function updateDriverLocation(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.write);
  if (rateLimitResponse) return rateLimitResponse;

  return driverController.updateLocation(req);
}

export const POST = withApiLogging(updateDriverLocation);
