import { NextRequest } from "next/server";
import { governanceController } from "@/server/controllers/governance.controller";
import { API_RATE_LIMITS, rateLimitRequest } from "@/lib/rate-limit";
import { withApiLogging } from "@/lib/api-monitoring";

async function getGovernance(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.read);
  if (rateLimitResponse) return rateLimitResponse;

  return governanceController.get(req);
}

async function postGovernance(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.write);
  if (rateLimitResponse) return rateLimitResponse;

  return governanceController.post(req);
}

export const GET = withApiLogging(getGovernance);
export const POST = withApiLogging(postGovernance);
