import { PrismaClient } from '@prisma/client';
import {
  INITIAL_SHIPMENTS,
  INITIAL_DRIVERS,
  INITIAL_VEHICLES,
  INITIAL_WAREHOUSES,
  INITIAL_ALERTS,
  INITIAL_INVOICES,
  INITIAL_TARIFFS,
  INITIAL_INVENTORY,
  INITIAL_PERMISSIONS,
  INITIAL_EXPENSES,
  INITIAL_AI_GOVERNANCE,
} from '../lib/mockData';
import { PrismaUserRepository } from '../server/services/repository/auth.prisma.repository';
import { ScryptPasswordHasher } from '../server/services/repository/argon2.passwordhasher';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SQLite database with DHL Logistics data...');

  // 1. Seed Warehouses
  for (const wh of INITIAL_WAREHOUSES) {
    await prisma.warehouseHub.upsert({
      where: { code: wh.code },
      update: wh,
      create: wh,
    });
  }

  // 2. Seed Drivers
  for (const d of INITIAL_DRIVERS) {
    await prisma.driver.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        phone: d.phone,
        avatar: d.avatar,
        status: d.status,
        vehicleType: d.vehicleType,
        vehicleNo: d.vehicleNo,
        currentLat: d.currentLat,
        currentLng: d.currentLng,
        assignedShipmentIds: JSON.stringify(d.assignedShipmentIds || []),
        rating: d.rating,
        completedToday: d.completedToday,
        fuelLevelPct: d.fuelLevelPct,
        activeRouteName: d.activeRouteName,
      },
      create: {
        id: d.id,
        name: d.name,
        phone: d.phone,
        avatar: d.avatar,
        status: d.status,
        vehicleType: d.vehicleType,
        vehicleNo: d.vehicleNo,
        currentLat: d.currentLat,
        currentLng: d.currentLng,
        assignedShipmentIds: JSON.stringify(d.assignedShipmentIds || []),
        rating: d.rating,
        completedToday: d.completedToday,
        fuelLevelPct: d.fuelLevelPct,
        activeRouteName: d.activeRouteName,
      },
    });
  }

  // 3. Seed Vehicles
  for (const v of INITIAL_VEHICLES) {
    await prisma.vehicle.upsert({
      where: { plateNo: v.plateNo },
      update: v,
      create: v,
    });
  }

  // 4. Seed Shipments & Timelines
  for (const s of INITIAL_SHIPMENTS) {
    const shipmentRecord = await prisma.shipment.upsert({
      where: { trackingId: s.trackingId },
      update: {
        orderId: s.orderId,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        senderName: s.senderName,
        senderEmail: s.senderEmail,
        senderPhone: s.senderPhone,
        senderAddress: s.senderAddress,
        recipientEmail: s.recipientEmail,
        recipientPhone: s.recipientPhone,
        recipientAddress: s.recipientAddress,
        originCity: s.originCity,
        destinationCity: s.destinationCity,
        destCity: s.destCity,
        status: s.status,
        priority: s.priority,
        weightKg: s.weightKg,
        parcelType: s.parcelType,
        pieces: s.pieces ?? 1,
        serviceType: s.serviceType ?? 'Express Air',
        carrier: s.carrier ?? 'DHL Express',
        temperatureCelsius: s.temperatureCelsius,
        estimatedDelivery: s.estimatedDelivery,
        actualDelivery: s.actualDelivery,
        createdAt: s.createdAt,
        driverId: s.driverId,
        driverName: s.driverName,
        vehicleNo: s.vehicleNo,
        assignedDriverId: s.assignedDriverId,
        costUsd: s.costUsd,
        revenueUsd: s.revenueUsd,
        fuelCostUsd: s.fuelCostUsd,
        routePointsJson: JSON.stringify(s.routePoints || []),
        currentLocationLat: s.currentLocation?.lat ?? 50.1109,
        currentLocationLng: s.currentLocation?.lng ?? 8.6821,
        currentLocationAddr: s.currentLocation?.address ?? s.originCity,
        proofOfDeliveryJson: s.proofOfDelivery ? JSON.stringify(s.proofOfDelivery) : null,
        flaggedForDelay: s.flaggedForDelay ?? false,
        delayReason: s.delayReason,
      },
      create: {
        id: s.id,
        trackingId: s.trackingId,
        orderId: s.orderId,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        senderName: s.senderName,
          senderEmail: s.senderEmail,
          senderPhone: s.senderPhone,
        senderAddress: s.senderAddress,
          recipientEmail: s.recipientEmail,
          recipientPhone: s.recipientPhone,
        recipientAddress: s.recipientAddress,
        originCity: s.originCity,
        destinationCity: s.destinationCity,
        destCity: s.destCity,
        status: s.status,
        priority: s.priority,
        weightKg: s.weightKg,
        parcelType: s.parcelType,
        pieces: s.pieces ?? 1,
        serviceType: s.serviceType ?? 'Express Air',
        carrier: s.carrier ?? 'DHL Express',
        temperatureCelsius: s.temperatureCelsius,
        estimatedDelivery: s.estimatedDelivery,
        actualDelivery: s.actualDelivery,
        createdAt: s.createdAt,
        driverId: s.driverId,
        driverName: s.driverName,
        vehicleNo: s.vehicleNo,
        assignedDriverId: s.assignedDriverId,
        costUsd: s.costUsd,
        revenueUsd: s.revenueUsd,
        fuelCostUsd: s.fuelCostUsd,
        routePointsJson: JSON.stringify(s.routePoints || []),
        currentLocationLat: s.currentLocation?.lat ?? 50.1109,
        currentLocationLng: s.currentLocation?.lng ?? 8.6821,
        currentLocationAddr: s.currentLocation?.address ?? s.originCity,
        proofOfDeliveryJson: s.proofOfDelivery ? JSON.stringify(s.proofOfDelivery) : null,
        flaggedForDelay: s.flaggedForDelay ?? false,
        delayReason: s.delayReason,
      },
    });

    // Seed timelines
    if (s.timeline && s.timeline.length > 0) {
      for (const t of s.timeline) {
        await prisma.timelineEntry.upsert({
          where: { id: t.id },
          update: {
            shipmentId: shipmentRecord.id,
            status: t.status,
            location: t.location,
            timestamp: t.timestamp,
            note: t.note,
            updatedBy: t.updatedBy,
          },
          create: {
            id: t.id,
            shipmentId: shipmentRecord.id,
            status: t.status,
            location: t.location,
            timestamp: t.timestamp,
            note: t.note,
            updatedBy: t.updatedBy,
          },
        });
      }
    }
  }

  // 5. Seed Alerts
  for (const a of INITIAL_ALERTS) {
    await prisma.logisticsAlert.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }

  // 6. Seed Invoices
  for (const inv of INITIAL_INVOICES) {
    await prisma.invoiceRecord.upsert({
      where: { invoiceNo: inv.invoiceNo },
      update: inv,
      create: inv,
    });
  }

  // 7. Seed Tariffs
  for (const tr of INITIAL_TARIFFS) {
    await prisma.rateTariff.upsert({
      where: { id: tr.id },
      update: tr,
      create: tr,
    });
  }

  // 8. Seed Inventory
  for (const it of INITIAL_INVENTORY) {
    await prisma.inventoryItem.upsert({
      where: { sku: it.sku },
      update: it,
      create: it,
    });
  }

  // 9. Seed System Permissions
  for (const p of INITIAL_PERMISSIONS) {
    await prisma.systemPermission.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // 10. Seed AI Governance
  await prisma.aIGovernanceConfig.upsert({
    where: { id: 'singleton_governance' },
    update: {
      aiEnabled: INITIAL_AI_GOVERNANCE.aiEnabled,
      lastModifiedBy: INITIAL_AI_GOVERNANCE.lastModifiedBy,
      lastModifiedAt: INITIAL_AI_GOVERNANCE.lastModifiedAt,
      dataAccessMode: INITIAL_AI_GOVERNANCE.dataAccessMode,
      readPermissionsJson: JSON.stringify(INITIAL_AI_GOVERNANCE.readPermissions),
      writePermissionsJson: JSON.stringify(INITIAL_AI_GOVERNANCE.writePermissions),
    },
    create: {
      id: 'singleton_governance',
      aiEnabled: INITIAL_AI_GOVERNANCE.aiEnabled,
      lastModifiedBy: INITIAL_AI_GOVERNANCE.lastModifiedBy,
      lastModifiedAt: INITIAL_AI_GOVERNANCE.lastModifiedAt,
      dataAccessMode: INITIAL_AI_GOVERNANCE.dataAccessMode,
      readPermissionsJson: JSON.stringify(INITIAL_AI_GOVERNANCE.readPermissions),
      writePermissionsJson: JSON.stringify(INITIAL_AI_GOVERNANCE.writePermissions),
    },
  });

  // Seed AI Audit Logs
  for (const log of INITIAL_AI_GOVERNANCE.auditLogs) {
    await prisma.aIAuditLog.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    });
  }

  // 11. Seed Auth Users via repository with secure scrypt password hashing
  const userRepository = new PrismaUserRepository(prisma);
  const passwordHasher = new ScryptPasswordHasher();

  const seedPassword = process.env.SEED_DEFAULT_PASSWORD || 'password123';

  const staffUsers = [
    {
      id: 'usr-superadmin',
      name: 'Alex Rodriguez',
      email: 'superadmin@dhl.com',
      passwordHash: await passwordHasher.hash(seedPassword),
      role: 'superadmin' as const,
      staffId: 'DHL-DIR-001',
      hub: 'Global Operations Headquarters',
      department: 'Executive Logistics Command',
      phone: '+44 20 7946 0991',
      avatarUrl: 'https://picsum.photos/seed/superadmin/120/120',
      isActive: true,
    },
    {
      id: 'usr-admin',
      name: 'Sarah Jenkins',
      email: 'admin@dhl.com',
      passwordHash: await passwordHasher.hash(seedPassword),
      role: 'admin' as const,
      staffId: 'DHL-MGR-442',
      hub: 'London Central Gateway',
      department: 'Dispatch & Fleet Logistics',
      phone: '+44 20 7946 0834',
      avatarUrl: 'https://picsum.photos/seed/admin/120/120',
      isActive: true,
    },
    {
      id: 'usr-customer',
      name: 'Customer User',
      email: 'customer@dhl.com',
      passwordHash: await passwordHasher.hash(seedPassword),
      role: 'customer' as const,
      staffId: 'DHL-CUST-001',
      hub: 'London Central Gateway',
      department: 'Retail Logistics',
      phone: '+44 20 7946 0000',
      avatarUrl: 'https://picsum.photos/seed/customer/120/120',
      isActive: true,
    },
    {
      id: 'usr-driver-default',
      name: 'Marcus Vance',
      email: 'driver@dhl.com',
      passwordHash: await passwordHasher.hash(seedPassword),
      role: 'driver' as const,
      staffId: 'DHL-DRV-101',
      hub: 'London Central Gateway',
      vehicleId: 'DHL-V-901',
      department: 'Express Last-Mile Courier',
      phone: '+1 (555) 234-5678',
      avatarUrl: 'https://picsum.photos/seed/driver1/120/120',
      isActive: true,
    },
  ];

  for (const user of staffUsers) {
    await userRepository.upsertUser(user);
  }

  // Seed all drivers from INITIAL_DRIVERS
  for (const driver of INITIAL_DRIVERS) {
    const emailName = driver.name.toLowerCase().replace(/\s+/g, '.');
    const staffId = `DHL-DRV-${driver.id.replace('drv-', '')}`;
    const passwordHash = await passwordHasher.hash(seedPassword);

    await userRepository.upsertUser({
      id: `usr-${driver.id}`,
      name: driver.name,
      email: `${emailName}@dhl.com`,
      passwordHash,
      role: 'driver',
      staffId,
      hub: driver.activeRouteName || 'London Central Gateway',
      vehicleId: driver.vehicleNo,
      department: 'Express Fleet Courier',
      phone: driver.phone,
      avatarUrl: driver.avatar,
      isActive: driver.status !== 'Off Duty',
    });
  }

  console.log('✅ SQLite Database seeded successfully with SuperAdmin, Admin, Driver, and Customer Auth Users!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
