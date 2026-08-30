import { z } from 'zod';

export const InvoiceDtoSchema = z.object({
  id: z.string(),
  invoiceNo: z.string(),
  orderId: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  amountUsd: z.number(),
  paymentType: z.enum(['Prepaid', 'Postpaid 30 Days', 'Cash on Delivery', 'Corporate Billing']),
  status: z.enum(['Paid', 'Pending', 'Overdue', 'Cancelled']),
  issueDate: z.string(),
  dueDate: z.string(),
  paidAt: z.string().optional().nullable(),
  itemsSummary: z.string(),
});
export type InvoiceDto = z.infer<typeof InvoiceDtoSchema>;

export const RateTariffDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  zoneFrom: z.string(),
  zoneTo: z.string(),
  basePriceUsd: z.number(),
  pricePerKgUsd: z.number(),
  expressMultiplier: z.number().default(1.5),
  overnightMultiplier: z.number().default(2.0),
  fuelSurchargePct: z.number().default(12.5),
  handlingFeeUsd: z.number().default(15.0),
});
export type RateTariffDto = z.infer<typeof RateTariffDtoSchema>;

export const WarehouseHubDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  city: z.string(),
  country: z.string(),
  address: z.string(),
  totalCapacityTons: z.number(),
  currentUsageTons: z.number(),
  managerName: z.string(),
  contactPhone: z.string(),
  activeDocks: z.number().default(4),
  totalDocks: z.number().default(8),
  inboundToday: z.number().default(0),
  outboundToday: z.number().default(0),
  status: z.string().default('Normal Operations'),
});
export type WarehouseHubDto = z.infer<typeof WarehouseHubDtoSchema>;
