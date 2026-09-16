import type { PrismaClient } from "@prisma/client";

import type {
  UserRepository
} from "./auth.repository";

import type {
  User,
  UserRole
} from "./auth.user";

export class PrismaUserRepository
  implements UserRepository
{
  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.authUser.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    return record
      ? this.toDomain(record)
      : null;
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.authUser.findUnique({
      where: { id },
    });

    return record
      ? this.toDomain(record)
      : null;
  }

  async findByStaffId(staffId: string): Promise<User | null> {
    const record = await this.prisma.authUser.findUnique({
      where: { staffId },
    });

    return record
      ? this.toDomain(record)
      : null;
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const cleanId = identifier.trim();
    const record = await this.prisma.authUser.findFirst({
      where: {
        OR: [
          { email: cleanId.toLowerCase() },
          { staffId: cleanId },
          { staffId: cleanId.toUpperCase() },
        ],
      },
    });

    return record ? this.toDomain(record) : null;
  }

  async createUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const record = await this.prisma.authUser.create({
      data: {
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role,
        staffId: user.staffId,
        hub: user.hub,
        vehicleId: user.vehicleId,
        avatarUrl: user.avatarUrl,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive ?? true,
        lastLogin: user.lastLogin,
      },
    });

    return this.toDomain(record);
  }

  async upsertUser(
    user: Omit<User, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<User> {
    const existing = await this.prisma.authUser.findFirst({
      where: {
        OR: [
          { email: user.email.toLowerCase() },
          { staffId: user.staffId },
        ],
      },
    });

    if (existing) {
      const updated = await this.prisma.authUser.update({
        where: { id: existing.id },
        data: {
          name: user.name,
          email: user.email.toLowerCase(),
          passwordHash: user.passwordHash,
          role: user.role,
          staffId: user.staffId,
          hub: user.hub,
          vehicleId: user.vehicleId,
          avatarUrl: user.avatarUrl,
          department: user.department,
          phone: user.phone,
          isActive: user.isActive ?? true,
        },
      });
      return this.toDomain(updated);
    }

    const record = await this.prisma.authUser.create({
      data: {
        ...(user.id ? { id: user.id } : {}),
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role,
        staffId: user.staffId,
        hub: user.hub,
        vehicleId: user.vehicleId,
        avatarUrl: user.avatarUrl,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive ?? true,
        lastLogin: user.lastLogin,
      },
    });

    return this.toDomain(record);
  }

  async updateLastLogin(
    userId: string,
    loggedInAt: Date
  ): Promise<void> {
    await this.prisma.authUser.update({
      where: {
        id: userId,
      },
      data: {
        lastLogin: loggedInAt.toISOString(),
      },
    });
  }

  private toDomain(record: {
    id: string;
    name: string;
    email: string;
    passwordHash?: string;
    role: string;
    staffId: string;

    hub?: string | null;
    vehicleId?: string | null;
    avatarUrl?: string | null;
    department?: string | null;
    phone?: string | null;

    isActive?: boolean;

    lastLogin?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  }): User {
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash ?? '',
      role: record.role as UserRole,
      staffId: record.staffId,
      hub: record.hub ?? null,
      vehicleId: record.vehicleId ?? null,
      avatarUrl: record.avatarUrl ?? null,
      department: record.department ?? null,
      phone: record.phone ?? null,
      isActive: record.isActive ?? true,
      lastLogin: record.lastLogin ?? null,
      createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
      updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
    };
  }
}
