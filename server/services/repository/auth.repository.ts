import type { User } from "./auth.user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  findByStaffId(staffId: string): Promise<User | null>;

  findByIdentifier(identifier: string): Promise<User | null>;

  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;

  upsertUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<User>;

  updateLastLogin(
    userId: string,
    loggedInAt: Date
  ): Promise<void>;
}

