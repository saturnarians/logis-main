import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      shipments,
      drivers,
      vehicles,
      warehouses,
      alerts,
      invoices,
      tariffs,
      inventory,
      permissions,
      governance,
      auditLogs,
      pendingActions
    ] = await Promise.all([
      prisma.shipment.findMany({
        include: { timeline: true, alerts: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.driver.findMany(),
      prisma.vehicle.findMany(),
      prisma.warehouseHub.findMany(),
      prisma.logisticsAlert.findMany({ orderBy: { timestamp: 'desc' } }),
      prisma.invoiceRecord.findMany({ orderBy: { issueDate: 'desc' } }),
      prisma.rateTariff.findMany(),
      prisma.inventoryItem.findMany(),
      prisma.systemPermission.findMany(),
      prisma.aIGovernanceConfig.findFirst(),
      prisma.aIAuditLog.findMany({ orderBy: { timestamp: 'desc' } }),
      prisma.pendingAIAction.findMany({ orderBy: { timestamp: 'desc' } })
    ]);

    // Format shipments to match client types
    const formattedShipments = shipments.map((s) => ({
      ...s,
      routePoints: s.routePointsJson ? JSON.parse(s.routePointsJson) : [],
      proofOfDelivery: s.proofOfDeliveryJson ? JSON.parse(s.proofOfDeliveryJson) : undefined,
      currentLocation: {
        lat: s.currentLocationLat,
        lng: s.currentLocationLng,
        address: s.currentLocationAddr,
      }
    }));

    // Format drivers
    const formattedDrivers = drivers.map((d) => ({
      ...d,
      assignedShipmentIds: d.assignedShipmentIds ? JSON.parse(d.assignedShipmentIds) : [],
    }));

    // Format governance
    const formattedGovernance = governance ? {
      aiEnabled: governance.aiEnabled,
      lastModifiedBy: governance.lastModifiedBy,
      lastModifiedAt: governance.lastModifiedAt,
      dataAccessMode: governance.dataAccessMode,
      readPermissions: governance.readPermissionsJson ? JSON.parse(governance.readPermissionsJson) : {},
      writePermissions: governance.writePermissionsJson ? JSON.parse(governance.writePermissionsJson) : {},
      pendingActions: pendingActions.map(p => ({
        ...p,
        payload: p.payloadJson ? JSON.parse(p.payloadJson) : {}
      })),
      auditLogs
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        shipments: formattedShipments,
        drivers: formattedDrivers,
        vehicles,
        warehouses,
        alerts,
        invoices,
        tariffs,
        inventory,
        permissions,
        governance: formattedGovernance,
      }
    });
  } catch (error: any) {
    console.error('Failed to query SQLite via Prisma:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Database query error' },
      { status: 500 }
    );
  }
}
