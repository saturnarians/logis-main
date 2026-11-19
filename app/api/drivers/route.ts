import { NextRequest } from "next/server";
import { driverController } from "@/server/controllers/driver.controller";
import { API_RATE_LIMITS, rateLimitRequest } from "@/lib/rate-limit";
import { withApiLogging } from "@/lib/api-monitoring";

async function getDrivers(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.read);
  if (rateLimitResponse) return rateLimitResponse;

  return driverController.list(req);
}

export const GET = withApiLogging(getDrivers);
