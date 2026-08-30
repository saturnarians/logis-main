import { NextRequest, NextResponse } from "next/server";
import { financeService } from "@/server/services/finance.service";
import { monitoring } from "@/lib/monitoring";

export class FinanceController {
  async getInvoices(req: NextRequest) {
    try {
      const invoices = await financeService.getAllInvoices();
      return NextResponse.json({
        success: true,
        count: invoices.length,
        data: invoices,
      });
    } catch (error: any) {
      monitoring.error(
        "FinanceController",
        "Error in GET /api/finance/invoices",
        error,
      );
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 },
      );
    }
  }

  async getTariffs(req: NextRequest) {
    try {
      const tariffs = await financeService.getAllTariffs();
      return NextResponse.json({
        success: true,
        count: tariffs.length,
        data: tariffs,
      });
    } catch (error: any) {
      monitoring.error(
        "FinanceController",
        "Error in GET /api/finance/tariffs",
        error,
      );
      return NextResponse.json(
        { success: false, error: error.message || "Internal server error" },
        { status: 500 },
      );
    }
  }
}

export const financeController = new FinanceController();
