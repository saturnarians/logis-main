/**
 * Server-side Waybill PDF Generator for Email Attachments
 * Generates a standard valid PDF 1.4 binary buffer for DHL Express Air Waybill (AWB).
 */
export function generateWaybillPdfBuffer(shipment: any): Buffer {
  const trackingId = shipment.trackingId || "DHL-EU-000000";
  const orderId = shipment.orderId || "ORD-2026-000";
  const customerName = shipment.customerName || "Valued Customer";
  const originCity = shipment.originCity || "European Hub";
  const destCity = shipment.destinationCity || shipment.destCity || "Destination";
  const weight = shipment.weightKg !== undefined ? `${shipment.weightKg} KG` : "1.0 KG";
  const carrier = shipment.carrier || "DHL Express";
  const serviceType = shipment.serviceType || "Express Air";
  const dateStr = shipment.createdAt || new Date().toISOString().substring(0, 10);
  const cost = shipment.costUsd !== undefined ? `$${Number(shipment.costUsd).toFixed(2)}` : "$45.00";
  const senderName = shipment.senderName || "DHL Central Hub";

  // Sanitize text for PDF Type1 standard encoding (remove parentheses)
  const clean = (str: string) => (str || "").replace(/[()]/g, "");

  const contentText = [
    "BT",
    "/F1 18 Tf 40 740 Td (DHL EXPRESS AIR WAYBILL) Tj",
    "/F1 11 Tf 0 -28 Td (Tracking Number: " + clean(trackingId) + ") Tj",
    "0 -18 Td (Order ID: " + clean(orderId) + ") Tj",
    "0 -18 Td (Issue Date: " + clean(dateStr) + ") Tj",
    "0 -28 Td (------------------------------------------------------------------------------------------------) Tj",
    "/F1 12 Tf 0 -22 Td (1. SHIPPER / ORIGIN DETAILS) Tj",
    "/F1 10 Tf 0 -16 Td (Sender Name: " + clean(senderName) + ") Tj",
    "0 -16 Td (Origin City: " + clean(originCity) + ") Tj",
    "0 -24 Td (2. CONSIGNEE / DESTINATION DETAILS) Tj",
    "/F1 10 Tf 0 -16 Td (Customer: " + clean(customerName) + ") Tj",
    "0 -16 Td (Destination: " + clean(destCity) + ") Tj",
    "0 -16 Td (Recipient Address: " + clean(shipment.recipientAddress || destCity) + ") Tj",
    "0 -24 Td (3. SHIPMENT & CARRIER SPECIFICATIONS) Tj",
    "/F1 10 Tf 0 -16 Td (Carrier: " + clean(carrier) + ") Tj",
    "0 -16 Td (Service Type: " + clean(serviceType) + ") Tj",
    "0 -16 Td (Weight: " + clean(weight) + ") Tj",
    "0 -16 Td (Declared Cost: " + clean(cost) + ") Tj",
    "0 -36 Td (------------------------------------------------------------------------------------------------) Tj",
    "/F1 9 Tf 0 -16 Td (Official Waybill Document - DHL Global Logistics Autonomous Platform) Tj",
    "ET"
  ].join("\n");

  const streamLength = Buffer.byteLength(contentText, "utf-8");

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${contentText}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000318 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${420 + streamLength}
%%EOF`;

  return Buffer.from(pdfString, "utf-8");
}
