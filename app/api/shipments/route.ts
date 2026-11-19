import { NextRequest } from "next/server";
import { shipmentController } from "@/server/controllers/shipment.controller";
import { API_RATE_LIMITS, rateLimitRequest } from "@/lib/rate-limit";
import { withApiLogging } from "@/lib/api-monitoring";

async function getShipments(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.read);
  if (rateLimitResponse) return rateLimitResponse;

  return shipmentController.list(req);
}

async function createShipment(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.write);
  if (rateLimitResponse) return rateLimitResponse;

  return shipmentController.create(req);
}

async function updateShipment(req: NextRequest) {
  const rateLimitResponse = rateLimitRequest(req, API_RATE_LIMITS.write);
  if (rateLimitResponse) return rateLimitResponse;

  return shipmentController.update(req);
}

export const GET = withApiLogging(getShipments);
export const POST = withApiLogging(createShipment);
export const PUT = withApiLogging(updateShipment);
