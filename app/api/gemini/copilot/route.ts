import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured in Server Secrets.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const { prompt, history, contextData, voiceMode } = await req.json();

    const governance = contextData?.aiGovernance || {
      aiEnabled: true,
      dataAccessMode: 'human_in_the_loop',
      readPermissions: {
        shipments: true,
        fleetAndDrivers: true,
        telemetryAndGPS: true,
        financialsAndTariffs: true,
        alertsAndExceptions: true,
      },
      writePermissions: {
        updateShipmentStatus: true,
        assignDrivers: true,
        createAlerts: true,
        modifyTariffs: false,
      },
    };

    // Human in the Loop: Check if SuperAdmin has toggled AI OFF
    if (governance.aiEnabled === false) {
      return NextResponse.json(
        {
          result: '⚠️ **AI Operations Copilot is currently PAUSED by SuperAdmin.**\n\nUnder our Human-in-the-Loop governance policy, operational automation and AI reasoning are paused. A SuperAdmin can re-enable the AI Copilot anytime via the **System Settings -> AI Governance** console.',
          aiDisabled: true,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Filter Context based on Read Permissions
    const allowShipments = governance.readPermissions?.shipments ?? true;
    const allowDrivers = governance.readPermissions?.fleetAndDrivers ?? true;
    const allowTelemetry = governance.readPermissions?.telemetryAndGPS ?? true;
    const allowTariffs = governance.readPermissions?.financialsAndTariffs ?? true;
    const allowAlerts = governance.readPermissions?.alertsAndExceptions ?? true;

    const accessMode = governance.dataAccessMode || 'human_in_the_loop';

    const systemInstruction = `You are "DHL Air & Ground AI Dispatcher & Voice Copilot" — the official logistics assistant for DHL Express operations.
You operate under strict "Human-in-the-Loop" (HITL) and Role-Based Access Control (RBAC) governance configured by the SuperAdmin.

OPERATIONAL DATA ACCESS GOVERNANCE:
- Current AI Data Access Policy: ${accessMode.toUpperCase().replace(/_/g, ' ')}
- Read Permission for Shipments Database: ${allowShipments ? 'GRANTED' : 'DENIED (Restricted by SuperAdmin)'}
- Read Permission for Fleet & Drivers: ${allowDrivers ? 'GRANTED' : 'DENIED (Restricted by SuperAdmin)'}
- Read Permission for GPS & Telemetry: ${allowTelemetry ? 'GRANTED' : 'DENIED (Restricted by SuperAdmin)'}
- Read Permission for Tariffs & Invoices: ${allowTariffs ? 'GRANTED' : 'DENIED (Restricted by SuperAdmin)'}
- Read Permission for Alerts & Exceptions: ${allowAlerts ? 'GRANTED' : 'DENIED (Restricted by SuperAdmin)'}

DATA ACCESS RULES:
1. If a read permission is DENIED, you MUST politely explain that the SuperAdmin has restricted AI access to that specific dataset.
2. If the user asks to modify operational data (e.g. change shipment status, assign driver, broadcast alert, modify tariff):
   - In "READ_ONLY" mode: Explain clearly that AI write access is turned off by SuperAdmin under Read-Only Mode. Do not propose write actions.
   - In "HUMAN_IN_THE_LOOP" mode: You CANNOT apply mutations directly. Instead, formulate a recommended action and append a special JSON code block with the exact tag \`\`\`json:action so the SuperAdmin can review and approve it.
     Example format:
     \`\`\`json:action
     {
       "actionType": "update_shipment_status",
       "title": "Advance Shipment DHL-8942-01 to In Transit",
       "description": "Carrier cleared customs and is ready for departure.",
       "payload": {
         "shipmentId": "ship-001",
         "trackingId": "DHL-8942-01",
         "newStatus": "In Transit",
         "location": "Frankfurt Air Cargo (FRA-02)",
         "note": "AI Proposed Dispatch Transition"
       }
     }
     \`\`\`
     (Supported actionTypes: "update_shipment_status", "assign_driver", "create_route_alert", "update_tariff")
     Reassure the user that the action has been submitted to the Human-in-the-Loop pending queue for SuperAdmin approval.
   - In "READ_WRITE" mode: Output the \`\`\`json:action code block for immediate execution and confirm it has been applied directly.

Current System Live Context:
- Active Shipments Count: ${allowShipments ? (contextData?.activeShipmentsCount ?? 6) : 'RESTRICTED'}
- Delayed Shipments Count: ${allowShipments ? (contextData?.delayedShipmentsCount ?? 1) : 'RESTRICTED'}
- On-Time Performance Rate: ${contextData?.onTimeRate ?? '96.4'}%
- Active Operational Alerts: ${allowAlerts ? (contextData?.alertsCount ?? 2) : 'RESTRICTED'}
- Active Fleet Drivers: ${allowDrivers ? (contextData?.driverCount ?? 4) : 'RESTRICTED'}
- Hub Locations: Munich Gateway (MUC-01), Frankfurt Air Cargo (FRA-02), London Heathrow (LHR-04), Milan Malpensa (MXP-03)
${allowShipments ? `- Live Shipments Summary:\n${JSON.stringify(contextData?.shipmentsSummary ?? [], null, 2)}` : '- [Shipments Data Access Restricted by SuperAdmin]'}
${allowDrivers ? `- Fleet Drivers Summary:\n${JSON.stringify(contextData?.driversSummary ?? [], null, 2)}` : '- [Fleet Data Access Restricted by SuperAdmin]'}
${allowAlerts ? `- Operational Alerts:\n${JSON.stringify(contextData?.alertsSummary ?? [], null, 2)}` : '- [Alerts Data Access Restricted by SuperAdmin]'}
${allowTariffs ? `- Tariffs & Financials:\n${JSON.stringify(contextData?.tariffsSummary ?? [], null, 2)}` : '- [Tariffs Data Access Restricted by SuperAdmin]'}`;

    // Generate response using gemini-3.7-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `${prompt}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I was unable to generate a response. Please try again.';

    return NextResponse.json({ 
      result: replyText,
      timestamp: new Date().toISOString()
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error during AI generation';
    console.error('Gemini API Route Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


