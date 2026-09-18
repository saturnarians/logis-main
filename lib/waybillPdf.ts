import { Shipment } from '@/types/logistics';

/**
 * Generates an authentic printable DHL Express Air Waybill (AWB) document
 * and opens the browser print/save-as-PDF dialog.
 */
export function downloadWaybillPdf(shipment: Partial<Shipment>): void {
  if (typeof window === 'undefined') return;

  const trackingId = shipment.trackingId || 'DHL-0000-00';
  const orderId = shipment.orderId || 'ORD-2026-000';
  const dateStr = shipment.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16);
  const senderName = shipment.senderName || 'DHL Central Hub';
  const senderAddr = shipment.senderAddress || 'London Central Gateway';
  const originCity = shipment.originCity || 'London';
  const consigneeName = shipment.customerName || 'Valued Consignee';
  const consigneePhone = shipment.customerPhone || '+44 20 7946 0000';
  const recipientAddr = shipment.recipientAddress || 'Destination Address';
  const destCity = shipment.destinationCity || 'Destination';
  const weight = shipment.weightKg !== undefined ? `${shipment.weightKg} KG` : '1.0 KG';
  const pieces = shipment.pieces || 1;
  const parcelType = shipment.parcelType || 'Parcel Box';
  const priority = shipment.priority || 'Express';
  const carrier = shipment.carrier || 'DHL Express Worldwide';
  const vehicle = shipment.vehicleNo || 'DHL-EV-402';
  const driver = shipment.driverName || 'Designated Dispatch Courier';
  const cost = shipment.costUsd !== undefined ? `$${shipment.costUsd.toFixed(2)}` : '$45.00';
  const otpCode = shipment.proofOfDelivery?.otpCode || '948210';

  // Generate SVG Code 128 pseudo-barcode for visual realism
  const barcodeBars = trackingId
    .split('')
    .map((char, i) => {
      const code = char.charCodeAt(0);
      const width = (code % 3) + 1.5;
      return `<rect x="${i * 7 + 10}" y="5" width="${width}" height="45" fill="#000" />`;
    })
    .join('');
  const barcodeSvg = `
    <svg viewBox="0 0 240 60" width="220" height="55" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="60" fill="#fff" />
      ${barcodeBars}
    </svg>
  `;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Waybill_${trackingId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background: #f1f5f9; padding: 20px; color: #111827; }
    
    .toolbar {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .toolbar h1 { font-size: 14px; font-weight: 800; letter-spacing: 0.5px; }
    .toolbar button {
      background: #D40511;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .toolbar button:hover { background: #b9040e; }
    .toolbar button.secondary {
      background: #334155;
      margin-left: 8px;
    }
    .toolbar button.secondary:hover { background: #475569; }

    .waybill-sheet {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border: 2px solid #000;
      padding: 24px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    }

    /* DHL Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #D40511;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand-box {
      background: #FFCC00;
      padding: 6px 14px;
      border-radius: 4px;
      display: inline-block;
    }
    .brand-box .logo-text {
      color: #D40511;
      font-size: 28px;
      font-weight: 900;
      font-style: italic;
      letter-spacing: -1px;
    }
    .brand-box .sub-logo {
      color: #D40511;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: -4px;
    }
    .doc-title {
      text-align: right;
    }
    .doc-title h2 {
      font-size: 18px;
      font-weight: 900;
      color: #D40511;
      text-transform: uppercase;
    }
    .doc-title p {
      font-size: 11px;
      color: #64748b;
      font-family: monospace;
      margin-top: 2px;
    }

    /* Barcode Banner */
    .barcode-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px dashed #94a3b8;
      background: #f8fafc;
      padding: 12px 18px;
      margin-bottom: 16px;
      border-radius: 6px;
    }
    .barcode-container { text-align: center; }
    .tracking-label { font-size: 18px; font-weight: 900; letter-spacing: 2px; font-family: monospace; color: #0f172a; margin-top: 4px; }
    .service-badge {
      background: #0f172a;
      color: #FFCC00;
      padding: 8px 14px;
      border-radius: 6px;
      text-align: right;
    }
    .service-badge .type { font-size: 13px; font-weight: 900; text-transform: uppercase; }
    .service-badge .priority { font-size: 10px; color: #94a3b8; text-transform: uppercase; }

    /* Sender and Receiver Grid */
    .address-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 16px;
    }
    .address-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      position: relative;
    }
    .address-card .card-badge {
      position: absolute;
      top: -9px;
      left: 10px;
      background: #D40511;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .address-card.receiver .card-badge { background: #0f172a; }
    .address-card h3 { font-size: 14px; font-weight: 800; margin-top: 4px; margin-bottom: 4px; color: #0f172a; }
    .address-card p { font-size: 11px; color: #334155; line-height: 1.4; }
    .address-card .city-tag {
      margin-top: 6px;
      font-size: 11px;
      font-weight: 800;
      color: #D40511;
      text-transform: uppercase;
    }

    /* Specs Table */
    .specs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      border: 1px solid #cbd5e1;
    }
    .specs-table th {
      background: #f1f5f9;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    .specs-table td {
      font-size: 11px;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      color: #0f172a;
      font-weight: 600;
    }

    /* Routing & Courier Footer */
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 14px;
      border-top: 2px solid #0f172a;
      padding-top: 14px;
    }
    .courier-info { font-size: 11px; color: #475569; }
    .courier-info strong { color: #0f172a; }
    .otp-box {
      border: 2px dashed #D40511;
      background: #fef2f2;
      border-radius: 6px;
      padding: 8px;
      text-align: center;
    }
    .otp-box .otp-label { font-size: 9px; font-weight: 800; color: #991b1b; text-transform: uppercase; }
    .otp-box .otp-value { font-size: 18px; font-weight: 900; letter-spacing: 3px; color: #D40511; font-family: monospace; }

    .terms {
      margin-top: 14px;
      font-size: 8px;
      color: #64748b;
      line-height: 1.3;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
    }

    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .waybill-sheet {
        border: 2px solid #000;
        box-shadow: none;
        padding: 16px;
        max-width: 100%;
        page-break-inside: avoid;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <h1>DHL EXPRESS AIR WAYBILL &bull; ${trackingId}</h1>
      <span style="font-size: 11px; color: #94a3b8;">Click Print or select 'Save as PDF' in browser print dialog</span>
    </div>
    <div>
      <button onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print / Save as PDF
      </button>
      <button class="secondary" onclick="window.close()">Close</button>
    </div>
  </div>

  <div class="waybill-sheet">
    <!-- Header -->
    <div class="header">
      <div class="brand-box">
        <div class="logo-text">DHL</div>
        <div class="sub-logo">EXPRESS WORLDWIDE</div>
      </div>
      <div class="doc-title">
        <h2>OFFICIAL AIR WAYBILL (AWB)</h2>
        <p>BOOKING REF: ${orderId}</p>
        <p>DATE: ${dateStr}</p>
      </div>
    </div>

    <!-- Barcode & Tracking Number -->
    <div class="barcode-section">
      <div class="barcode-container">
        ${barcodeSvg}
        <div class="tracking-label">${trackingId}</div>
      </div>
      <div class="service-badge">
        <div class="type">${carrier}</div>
        <div class="priority">PRIORITY: ${priority} &bull; CODE 128</div>
      </div>
    </div>

    <!-- Addresses -->
    <div class="address-grid">
      <div class="address-card">
        <span class="card-badge">1. FROM (SHIPPER)</span>
        <h3>${senderName}</h3>
        <p>${senderAddr}</p>
        <div class="city-tag">${originCity} Gateway Hub</div>
      </div>
      <div class="address-card receiver">
        <span class="card-badge">2. TO (CONSIGNEE)</span>
        <h3>${consigneeName}</h3>
        <p>${recipientAddr}</p>
        <p>Phone: ${consigneePhone}</p>
        <div class="city-tag">${destCity} Destination Depot</div>
      </div>
    </div>

    <!-- Cargo Specs -->
    <table class="specs-table">
      <thead>
        <tr>
          <th>Pieces</th>
          <th>Gross Weight</th>
          <th>Parcel Content</th>
          <th>Service Level</th>
          <th>Tariff Cost</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${pieces} PCS</td>
          <td>${weight}</td>
          <td>${parcelType}</td>
          <td>${priority} Express Air</td>
          <td>${cost} (Prepaid)</td>
          <td>Ready for Pickup</td>
        </tr>
      </tbody>
    </table>

    <!-- Routing / Courier & OTP -->
    <div class="footer-grid">
      <div class="courier-info">
        <p><strong>Assigned Courier:</strong> ${driver}</p>
        <p><strong>Fleet Vehicle:</strong> ${vehicle}</p>
        <p><strong>Routing Checkpoint:</strong> ${originCity} &rarr; ${destCity} Direct Flight Scan</p>
        <p><strong>Recorded By:</strong> DHL</p>
      </div>
      <div class="otp-box">
        <div class="otp-label">Handover OTP Code</div>
        <div class="otp-value">${otpCode}</div>
      </div>
    </div>

    <!-- Legal Terms -->
    <div class="terms">
      IMPORTANT NOTICE: By handing over this shipment or receiving this waybill, the shipper agrees to the standard DHL Express Conditions of Carriage. 
      Carrier liability is strictly limited in accordance with the Montreal Convention. All cargo is subject to airfreight security inspection.
    </div>
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      // Auto-trigger print dialog after brief render delay
      setTimeout(() => {
        window.print();
      }, 300);
    });
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=800,menubar=no,toolbar=no,location=no');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked: create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 60000);
      }, 500);
    }
  }
}
