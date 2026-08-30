import { NextRequest } from "next/server";
import { driverController } from "@/server/controllers/driver.controller";

export async function POST(req: NextRequest) {
  return driverController.updateLocation(req);
}
