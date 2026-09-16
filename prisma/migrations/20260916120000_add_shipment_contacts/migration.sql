ALTER TABLE "Shipment" ADD COLUMN "senderEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Shipment" ADD COLUMN "senderPhone" TEXT;
ALTER TABLE "Shipment" ADD COLUMN "recipientEmail" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Shipment" ADD COLUMN "recipientPhone" TEXT;