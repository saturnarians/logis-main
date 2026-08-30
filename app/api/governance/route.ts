import { NextRequest } from "next/server";
import { governanceController } from "@/server/controllers/governance.controller";

export async function GET(req: NextRequest) {
  return governanceController.get(req);
}

export async function POST(req: NextRequest) {
  return governanceController.post(req);
}
