import { NextRequest } from "next/server";
import { driverController } from "@/server/controllers/driver.controller";

export async function GET(req: NextRequest) {
  return driverController.list(req);
}
