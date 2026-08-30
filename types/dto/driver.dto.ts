import { z } from 'zod';

export const DriverStatusSchema = z.enum(['Available', 'On Route', 'At Stop', 'Break', 'Off Duty']);
export type DriverStatus = z.infer<typeof DriverStatusSchema>;

export const DriverDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  avatar: z.string(),
  status: DriverStatusSchema,
  vehicleType: z.string(),
  vehicleNo: z.string(),
  currentLat: z.number(),
  currentLng: z.number(),
  assignedShipmentIds: z.array(z.string()).default([]),
  rating: z.number().default(4.9),
  completedToday: z.number().default(0),
  fuelLevelPct: z.number().default(100),
  activeRouteName: z.string().optional().nullable(),
});
export type DriverDto = z.infer<typeof DriverDtoSchema>;

export const UpdateDriverLocationSchema = z.object({
  driverId: z.string(),
  currentLat: z.number(),
  currentLng: z.number(),
  status: DriverStatusSchema.optional(),
  fuelLevelPct: z.number().optional(),
});
export type UpdateDriverLocationDto = z.infer<typeof UpdateDriverLocationSchema>;

export const AssignShipmentToDriverSchema = z.object({
  driverId: z.string(),
  shipmentId: z.string(),
  action: z.enum(['assign', 'unassign']),
});
export type AssignShipmentToDriverDto = z.infer<typeof AssignShipmentToDriverSchema>;
