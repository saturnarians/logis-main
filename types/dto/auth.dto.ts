import { z } from 'zod';

export const UserRoleSchema = z.enum(['superadmin', 'admin', 'driver', 'customer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: UserRoleSchema.optional(),
});
export type LoginCredentialsDto = z.infer<typeof LoginCredentialsSchema>;

export const RegisterUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: UserRoleSchema.default('customer'),
  staffId: z.string().optional(),
  phone: z.string().optional(),
  hub: z.string().optional(),
  vehicleId: z.string().optional(),
});
export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  staffId: z.string(),
  phone: z.string().optional(),
  hub: z.string().optional(),
  vehicleId: z.string().optional(),
  avatarUrl: z.string().optional(),
  department: z.string().optional(),
  lastLogin: z.string().optional(),
});
export type AuthUserDto = z.infer<typeof AuthUserSchema>;
