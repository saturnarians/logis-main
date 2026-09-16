export type UserRole =
  | "superadmin"
  | "admin"
  | "driver"
  | "customer";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;

  staffId: string;

  hub?: string | null;
  vehicleId?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
  phone?: string | null;

  isActive: boolean;

  lastLogin?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
