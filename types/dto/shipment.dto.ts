import { z } from 'zod';

export const ShipmentStatusSchema = z.enum([
  'Order Placed',
  'Pending',
  'Pickup Scheduled',
  'Picked Up',
  'Arrived at Sort Hub',
  'Customs Clearance',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Delivery Attempted',
  'Exception / Delayed',
  'Returned to Hub',
]);
export type ShipmentStatus = z.infer<typeof ShipmentStatusSchema>;

export const ShipmentPrioritySchema = z.enum(['Standard', 'Express', 'Urgent Medical', 'Overnight']);
export type ShipmentPriority = z.infer<typeof ShipmentPrioritySchema>;

export const RoutePointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string(),
  status: z.enum(['completed', 'current', 'pending']),
  timestamp: z.string().optional(),
});
export type RoutePointDto = z.infer<typeof RoutePointSchema>;

export const ProofOfDeliverySchema = z.object({
  signatureDataUrl: z.string().optional(),
  recipientName: z.string(),
  deliveredAt: z.string(),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
  gpsCoordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});
export type ProofOfDeliveryDto = z.infer<typeof ProofOfDeliverySchema>;

export const TimelineEntrySchema = z.object({
  id: z.string(),
  status: z.string(),
  location: z.string(),
  timestamp: z.string(),
  note: z.string(),
  updatedBy: z.string(),
});
export type TimelineEntryDto = z.infer<typeof TimelineEntrySchema>;

export const CreateShipmentSchema = z.object({
  trackingId: z.string().optional(),
  orderId: z.string().min(2, 'Order ID is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().optional(),
  senderName: z.string().min(2, 'Sender name is required'),
  senderEmail: z.string().email('Valid sender email is required'),
  senderPhone: z.string().optional(),
  senderAddress: z.string().min(5, 'Sender address is required'),
  recipientEmail: z.string().email('Valid recipient email is required'),
  recipientPhone: z.string().optional(),
  recipientAddress: z.string().min(5, 'Recipient address is required'),
  originCity: z.string().min(2, 'Origin city is required'),
  destinationCity: z.string().min(2, 'Destination city is required'),
  destCity: z.string().optional(),
  priority: ShipmentPrioritySchema.default('Standard'),
  weightKg: z.number().positive('Weight must be positive').default(1.0),
  parcelType: z.string().default('Parcel Box'),
  pieces: z.number().int().positive().default(1),
  serviceType: z.string().default('Express Air'),
  carrier: z.string().default('DHL Express'),
  temperatureCelsius: z.number().optional(),
  estimatedDelivery: z.string().min(4, 'Estimated delivery date required'),
  costUsd: z.number().nonnegative().default(0),
  revenueUsd: z.number().nonnegative().default(0),
  fuelCostUsd: z.number().nonnegative().default(0),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  vehicleNo: z.string().optional(),
  assignedDriverId: z.string().optional(),
  routePoints: z.array(RoutePointSchema).optional().default([]),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }).optional(),
});
export type CreateShipmentDto = z.infer<typeof CreateShipmentSchema>;

export const UpdateShipmentSchema = z.object({
  id: z.string().optional(),
  trackingId: z.string().optional(),
  status: ShipmentStatusSchema.optional(),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  vehicleNo: z.string().optional(),
  assignedDriverId: z.string().optional(),
  flaggedForDelay: z.boolean().optional(),
  delayReason: z.string().optional(),
  proofOfDelivery: ProofOfDeliverySchema.optional(),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }).optional(),
  timelineEntry: z.object({
    status: z.string(),
    location: z.string(),
    timestamp: z.string().optional(),
    note: z.string(),
    updatedBy: z.string(),
  }).optional(),
});
export type UpdateShipmentDto = z.infer<typeof UpdateShipmentSchema>;

export const ShipmentQuerySchema = z.object({
  trackingId: z.string().optional(),
  status: z.string().optional(),
  driverId: z.string().optional(),
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().nonnegative().optional().default(0),
  search: z.string().optional(),
});
export type ShipmentQueryDto = z.infer<typeof ShipmentQuerySchema>;

export const ShipmentDtoSchema = CreateShipmentSchema.extend({
  id: z.string(),
  trackingId: z.string(),
  status: ShipmentStatusSchema,
  createdAt: z.string(),
  actualDelivery: z.string().optional().nullable(),
  flaggedForDelay: z.boolean().default(false),
  delayReason: z.string().optional().nullable(),
  timeline: z.array(TimelineEntrySchema).default([]),
  proofOfDelivery: ProofOfDeliverySchema.optional().nullable(),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
});
export type ShipmentDto = z.infer<typeof ShipmentDtoSchema>;
