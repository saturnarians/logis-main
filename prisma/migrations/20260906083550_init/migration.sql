-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "destCity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "priority" TEXT NOT NULL DEFAULT 'Standard',
    "weightKg" REAL NOT NULL,
    "parcelType" TEXT NOT NULL,
    "pieces" INTEGER DEFAULT 1,
    "serviceType" TEXT DEFAULT 'Express Air',
    "carrier" TEXT DEFAULT 'DHL Express',
    "temperatureCelsius" REAL,
    "estimatedDelivery" TEXT NOT NULL,
    "actualDelivery" TEXT,
    "createdAt" TEXT NOT NULL,
    "driverId" TEXT,
    "driverName" TEXT,
    "vehicleNo" TEXT,
    "assignedDriverId" TEXT,
    "costUsd" REAL NOT NULL DEFAULT 0,
    "revenueUsd" REAL NOT NULL DEFAULT 0,
    "fuelCostUsd" REAL NOT NULL DEFAULT 0,
    "routePointsJson" TEXT NOT NULL DEFAULT '[]',
    "currentLocationLat" REAL NOT NULL,
    "currentLocationLng" REAL NOT NULL,
    "currentLocationAddr" TEXT NOT NULL,
    "proofOfDeliveryJson" TEXT,
    "flaggedForDelay" BOOLEAN NOT NULL DEFAULT false,
    "delayReason" TEXT
);

-- CreateTable
CREATE TABLE "TimelineEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    CONSTRAINT "TimelineEntry_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "vehicleType" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "currentLat" REAL NOT NULL,
    "currentLng" REAL NOT NULL,
    "assignedShipmentIds" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL NOT NULL DEFAULT 4.9,
    "completedToday" INTEGER NOT NULL DEFAULT 0,
    "fuelLevelPct" INTEGER NOT NULL DEFAULT 100,
    "activeRouteName" TEXT
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateNo" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "driverId" TEXT,
    "driverName" TEXT,
    "fuelLevelPct" INTEGER NOT NULL DEFAULT 100,
    "mileageKm" INTEGER NOT NULL DEFAULT 0,
    "nextServiceDate" TEXT NOT NULL,
    "maxPayloadKg" INTEGER NOT NULL DEFAULT 1000,
    "lastInspectionPassed" BOOLEAN NOT NULL DEFAULT true,
    "gpsDeviceId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WarehouseHub" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "totalCapacityTons" INTEGER NOT NULL,
    "currentUsageTons" INTEGER NOT NULL,
    "managerName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "activeDocks" INTEGER NOT NULL DEFAULT 4,
    "totalDocks" INTEGER NOT NULL DEFAULT 8,
    "inboundToday" INTEGER NOT NULL DEFAULT 0,
    "outboundToday" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Normal Operations'
);

-- CreateTable
CREATE TABLE "LogisticsAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "trackingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "LogisticsAlert_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvoiceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNo" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "amountUsd" REAL NOT NULL,
    "paymentType" TEXT NOT NULL DEFAULT 'Prepaid',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "issueDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "paidAt" TEXT,
    "itemsSummary" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RateTariff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "zoneFrom" TEXT NOT NULL,
    "zoneTo" TEXT NOT NULL,
    "basePriceUsd" REAL NOT NULL,
    "pricePerKgUsd" REAL NOT NULL,
    "expressMultiplier" REAL NOT NULL DEFAULT 1.5,
    "overnightMultiplier" REAL NOT NULL DEFAULT 2.0,
    "fuelSurchargePct" REAL NOT NULL DEFAULT 12.5,
    "handlingFeeUsd" REAL NOT NULL DEFAULT 15.0
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "warehouseHub" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minThreshold" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "unitCostUsd" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Stock',
    "lastRestocked" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ExpenseRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amountUsd" REAL NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "note" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SystemPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "superadmin" BOOLEAN NOT NULL DEFAULT true,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "driver" BOOLEAN NOT NULL DEFAULT false,
    "customer" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "AuthUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'customer',
    "staffId" TEXT NOT NULL,
    "hub" TEXT,
    "vehicleId" TEXT,
    "avatarUrl" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIGovernanceConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton_governance',
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastModifiedBy" TEXT NOT NULL DEFAULT 'SuperAdmin',
    "lastModifiedAt" TEXT NOT NULL DEFAULT '2026-08-14 09:30',
    "dataAccessMode" TEXT NOT NULL DEFAULT 'human_in_the_loop',
    "readPermissionsJson" TEXT NOT NULL DEFAULT '{"shipments":true,"fleetAndDrivers":true,"telemetryAndGPS":true,"financialsAndTariffs":true,"alertsAndExceptions":true}',
    "writePermissionsJson" TEXT NOT NULL DEFAULT '{"updateShipmentStatus":true,"assignDrivers":true,"createAlerts":true,"modifyTariffs":false}'
);

-- CreateTable
CREATE TABLE "PendingAIAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "timestamp" TEXT NOT NULL,
    "proposerPrompt" TEXT
);

-- CreateTable
CREATE TABLE "AIAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "status" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingId_key" ON "Shipment"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNo_key" ON "Vehicle"("plateNo");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseHub_code_key" ON "WarehouseHub"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRecord_invoiceNo_key" ON "InvoiceRecord"("invoiceNo");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_staffId_key" ON "AuthUser"("staffId");

-- CreateIndex
CREATE INDEX "AuthUser_role_idx" ON "AuthUser"("role");
