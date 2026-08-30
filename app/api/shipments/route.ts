import { NextRequest } from "next/server";
import { shipmentController } from "@/server/controllers/shipment.controller";

export async function GET(req: NextRequest) {
  return shipmentController.list(req);
}

export async function POST(req: NextRequest) {
  return shipmentController.create(req);
}

export async function PUT(req: NextRequest) {
  return shipmentController.update(req);
}
