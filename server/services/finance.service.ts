import { prisma } from '@/lib/prisma';
import { logger, monitoring } from '@/lib/logger';
import type { InvoiceDto, RateTariffDto } from '@/types/dto';

export class FinanceService {
  async getAllInvoices(): Promise<InvoiceDto[]> {
    try {
      logger.info('FinanceService', 'Querying billing invoices and payment ledgers');
      const records = await prisma.invoiceRecord.findMany({
        orderBy: { issueDate: 'desc' },
      });

      return records.map((inv: any) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        orderId: inv.orderId,
        customerName: inv.customerName,
        customerEmail: inv.customerEmail,
        amountUsd: inv.amountUsd,
        paymentType: inv.paymentType as any,
        status: inv.status as any,
        issueDate: typeof inv.issueDate === 'string' ? inv.issueDate : (inv.issueDate ? new Date(inv.issueDate).toISOString().split('T')[0] : ''),
        dueDate: typeof inv.dueDate === 'string' ? inv.dueDate : (inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : ''),
        paidAt: inv.paidAt ? (typeof inv.paidAt === 'string' ? inv.paidAt : new Date(inv.paidAt).toISOString().split('T')[0]) : null,
        itemsSummary: inv.itemsSummary,
      }));
    } catch (error: any) {
      logger.error('FinanceService', 'Failed to retrieve invoices from database', error);
      throw error;
    }
  }

  async getAllTariffs(): Promise<RateTariffDto[]> {
    try {
      logger.info('FinanceService', 'Querying shipping rate matrix and zone tariffs');
      const records = await prisma.rateTariff.findMany({
        orderBy: { name: 'asc' },
      });

      return records.map((t: any) => ({
        id: t.id,
        name: t.name,
        zoneFrom: t.zoneFrom,
        zoneTo: t.zoneTo,
        basePriceUsd: t.basePriceUsd,
        pricePerKgUsd: t.pricePerKgUsd,
        expressMultiplier: t.expressMultiplier,
        overnightMultiplier: t.overnightMultiplier,
        fuelSurchargePct: t.fuelSurchargePct,
        handlingFeeUsd: t.handlingFeeUsd,
      }));
    } catch (error: any) {
      logger.error('FinanceService', 'Failed to retrieve rate tariffs from database', error);
      throw error;
    }
  }
}

export const financeService = new FinanceService();
