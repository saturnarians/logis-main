import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
  INITIAL_AI_GOVERNANCE,
} from '@/lib/mockData';

export async function POST() {
  try {
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

    const [shipmentCount, driverCount, hubCount, invoiceCount] = await Promise.all([
      prisma.shipment.count(),
      prisma.driver.count(),
      prisma.warehouseHub.count(),
      prisma.invoiceRecord.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'SQLite database refreshed and seeded with Prisma!',
      counts: {
        shipments: shipmentCount,
        drivers: driverCount,
        warehouses: hubCount,
        invoices: invoiceCount,
      }
    });
  } catch (error: any) {
    console.error('Error reseeding SQLite database:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
