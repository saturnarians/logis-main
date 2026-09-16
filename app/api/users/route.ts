import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaUserRepository } from '@/server/services/repository/auth.prisma.repository';
import { ScryptPasswordHasher } from '@/server/services/repository/argon2.passwordhasher';

const userRepo = new PrismaUserRepository(prisma);
const passwordHasher = new ScryptPasswordHasher();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const identifier = searchParams.get('identifier');
    if (identifier) {
      const user = await userRepo.findByIdentifier(identifier);
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
      const { passwordHash, ...sanitized } = user;
      return NextResponse.json({ success: true, data: sanitized });
    }

    const records = await prisma.authUser.findMany({ orderBy: { createdAt: 'desc' } });
    const sanitized = records.map(({ passwordHash, ...u }) => u);
    return NextResponse.json({ success: true, count: sanitized.length, data: sanitized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, passwordHash: rawPassword, role, staffId, hub, vehicleId, department, phone } = body;

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Name and email are required' }, { status: 400 });
    }

    const plainPassword = password || rawPassword || 'password123';
    const passwordHash = await passwordHasher.hash(plainPassword);
    const generatedStaffId = staffId || `DHL-${role === 'driver' ? 'DRV' : role === 'admin' ? 'MGR' : 'DIR'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await userRepo.upsertUser({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'customer',
      staffId: generatedStaffId,
      hub: hub || null,
      vehicleId: vehicleId || null,
      department: department || null,
      phone: phone || null,
      isActive: true,
    });

    const { passwordHash: _, ...sanitized } = user;
    return NextResponse.json({ success: true, message: 'User created successfully', data: sanitized }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, role, staffId, hub, vehicleId, department, phone, isActive, password } = body;

    if (!id && !email && !staffId) {
      return NextResponse.json({ success: false, error: 'User id, email, or staffId required' }, { status: 400 });
    }

    const existing = await prisma.authUser.findFirst({
      where: { OR: [{ id }, { email: email?.toLowerCase() }, { staffId }] },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found for update' }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (hub !== undefined) updateData.hub = hub;
    if (vehicleId !== undefined) updateData.vehicleId = vehicleId;
    if (department !== undefined) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) updateData.passwordHash = await passwordHasher.hash(password);

    const updated = await prisma.authUser.update({
      where: { id: existing.id },
      data: updateData,
    });

    const { passwordHash: _, ...sanitized } = updated;
    return NextResponse.json({ success: true, message: 'User updated successfully', data: sanitized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ success: false, error: 'User id or email is required' }, { status: 400 });
    }

    const target = await prisma.authUser.findFirst({
      where: { OR: [{ id: id || undefined }, { email: email?.toLowerCase() || undefined }] },
    });

    if (!target) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    await prisma.authUser.delete({ where: { id: target.id } });
    return NextResponse.json({ success: true, message: `User ${target.email} deleted successfully` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
