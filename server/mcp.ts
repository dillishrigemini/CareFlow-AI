import { db } from './database';
import { randomUUID } from 'crypto';

export interface MCPToolDefinition {
  name: string;
  description: string;
  category: 'PATIENT' | 'OPD' | 'DOCTOR' | 'QUEUE' | 'DOCUMENT' | 'NAVIGATION' | 'LAB' | 'PHARMACY' | 'NOTIFICATION' | 'STAFF' | 'KIOSK';
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface MCPToolResult {
  tool: string;
  success: boolean;
  data?: unknown;
  error?: string;
  auditId?: string;
}

export const MCP_TOOLS: MCPToolDefinition[] = [
  // PATIENT
  {
    name: 'patient.search',
    description: 'Search for existing patient by UHID, OP Number, Mobile, or ABHA ID',
    category: 'PATIENT',
    parameters: {
      query: { type: 'string', description: 'Search term (UHID, mobile number, name, or OP number)', required: true },
    },
  },
  {
    name: 'patient.create',
    description: 'Create a new digital patient record in hospital HMIS',
    category: 'PATIENT',
    parameters: {
      name: { type: 'string', description: 'Patient full name', required: true },
      age: { type: 'number', description: 'Age in years', required: true },
      gender: { type: 'string', description: 'MALE, FEMALE, or OTHER', required: true },
      mobile: { type: 'string', description: '10-digit mobile number', required: true },
      address: { type: 'string', description: 'Residential address', required: true },
      languagePreference: { type: 'string', description: 'ta, en, or hi' },
      isSeniorCitizen: { type: 'boolean', description: 'Senior citizen priority flag' },
    },
  },
  {
    name: 'patient.verify',
    description: 'Verify identity of matched patient with secondary identifier',
    category: 'PATIENT',
    parameters: {
      uhid: { type: 'string', description: 'UHID to verify', required: true },
      mobileOrDob: { type: 'string', description: 'Secondary verification field', required: true },
    },
  },

  // OPD
  {
    name: 'opd.departments',
    description: 'List all operational hospital departments with room and floor information',
    category: 'OPD',
    parameters: {},
  },
  {
    name: 'opd.schedule',
    description: 'Get doctor schedules and consulting hours for a department',
    category: 'OPD',
    parameters: {
      departmentId: { type: 'string', description: 'Department ID', required: true },
    },
  },
  {
    name: 'opd.register',
    description: 'Issue OPD visit registration and queue token',
    category: 'OPD',
    parameters: {
      patientId: { type: 'string', description: 'Internal patient ID', required: true },
      departmentId: { type: 'string', description: 'Department ID', required: true },
      priority: { type: 'string', description: 'NORMAL, SENIOR_CITIZEN, PREGNANT_WOMAN, DIVYANG, EMERGENCY' },
      source: { type: 'string', description: 'Registration origin' },
    },
  },

  // DOCTOR
  {
    name: 'doctor.availability',
    description: 'Get live real-time status of doctors on duty, room, and waiting load',
    category: 'DOCTOR',
    parameters: {
      departmentId: { type: 'string', description: 'Optional department filter' },
    },
  },
  {
    name: 'doctor.current_token',
    description: 'Get current token being consulted by doctor',
    category: 'DOCTOR',
    parameters: {
      doctorId: { type: 'string', description: 'Doctor ID', required: true },
    },
  },

  // QUEUE
  {
    name: 'queue.status',
    description: 'Check queue status and estimate wait time for a given department or token',
    category: 'QUEUE',
    parameters: {
      departmentId: { type: 'string', description: 'Department ID' },
      tokenNo: { type: 'number', description: 'Optional specific token number' },
    },
  },
  {
    name: 'queue.call_patient',
    description: 'Doctor calls the next patient in queue',
    category: 'QUEUE',
    parameters: {
      doctorId: { type: 'string', description: 'Doctor ID', required: true },
    },
  },

  // DOCUMENT
  {
    name: 'document.ocr',
    description: 'Perform optical character recognition and field structuring on scanned OP sheet',
    category: 'DOCUMENT',
    parameters: {
      imageBase64: { type: 'string', description: 'Base64 image or sample document identifier', required: true },
    },
  },

  // NAVIGATION
  {
    name: 'hospital.route',
    description: 'Calculate walking directions and milestones from kiosk to hospital room or wing',
    category: 'NAVIGATION',
    parameters: {
      destination: { type: 'string', description: 'Department ID or Room number', required: true },
    },
  },

  // LAB
  {
    name: 'lab.create_order',
    description: 'Place an investigation / diagnostic test order',
    category: 'LAB',
    parameters: {
      visitId: { type: 'string', description: 'OPD visit ID', required: true },
      testNames: { type: 'array', description: 'List of test names', required: true },
    },
  },

  // PHARMACY
  {
    name: 'pharmacy.queue',
    description: 'Get active prescription dispensing queue',
    category: 'PHARMACY',
    parameters: {},
  },

  // NOTIFICATION
  {
    name: 'notification.send',
    description: 'Send simulated patient SMS / WhatsApp notification for token alert',
    category: 'NOTIFICATION',
    parameters: {
      mobile: { type: 'string', description: 'Recipient mobile number', required: true },
      message: { type: 'string', description: 'Notification message body', required: true },
      channel: { type: 'string', description: 'SMS, WHATSAPP, or DISPLAY' },
    },
  },

  // STAFF
  {
    name: 'staff.request_assistance',
    description: 'Trigger assistance alert to hospital support staff dashboard',
    category: 'STAFF',
    parameters: {
      kioskId: { type: 'string', description: 'Kiosk terminal identifier', required: true },
      reason: { type: 'string', description: 'Reason for help request', required: true },
      urgency: { type: 'string', description: 'LOW, MEDIUM, or EMERGENCY' },
    },
  },

  // KIOSK
  {
    name: 'kiosk.status',
    description: 'Check peripheral status (printer, scanner, camera, mic) for kiosk',
    category: 'KIOSK',
    parameters: {
      kioskId: { type: 'string', description: 'Kiosk ID', required: true },
    },
  },
];

export async function executeMCPTool(toolName: string, params: Record<string, any>, context: { kioskId?: string; sessionId?: string; actor?: string } = {}): Promise<MCPToolResult> {
  const kioskId = context.kioskId || 'KIOSK-01';
  const sessionId = context.sessionId || 'SESSION-ANON';
  const actor = context.actor || 'AGENT_ORCHESTRATOR';

  try {
    let resultData: any = null;

    switch (toolName) {
      case 'patient.search': {
        const matches = db.searchPatients(params.query || '');
        resultData = {
          count: matches.length,
          patients: matches,
        };
        break;
      }

      case 'patient.create': {
        const newPatient = db.createPatient({
          name: params.name,
          age: Number(params.age),
          gender: params.gender,
          mobile: params.mobile,
          address: params.address,
          languagePreference: params.languagePreference || 'ta',
          isSeniorCitizen: params.isSeniorCitizen || Number(params.age) >= 60,
        });
        resultData = newPatient;
        break;
      }

      case 'patient.verify': {
        const patient = db.findPatientByUhid(params.uhid);
        if (!patient) {
          throw new Error('UHID not found in registry');
        }
        const secondary = (params.mobileOrDob || '').replace(/\D/g, '');
        const matched = patient.mobile.includes(secondary);
        resultData = {
          verified: matched,
          patient: matched ? patient : null,
          requiresStaffReview: !matched,
        };
        break;
      }

      case 'opd.departments': {
        resultData = Array.from(db.departments.values());
        break;
      }

      case 'opd.schedule': {
        const docs = Array.from(db.doctors.values()).filter(d => d.departmentId === params.departmentId);
        resultData = docs;
        break;
      }

      case 'opd.register': {
        const visit = db.registerOPD(
          params.patientId,
          params.departmentId,
          params.doctorId,
          params.priority,
          params.source,
          kioskId
        );
        resultData = visit;
        break;
      }

      case 'doctor.availability': {
        let docs = Array.from(db.doctors.values());
        if (params.departmentId) {
          docs = docs.filter(d => d.departmentId === params.departmentId);
        }
        resultData = docs;
        break;
      }

      case 'queue.call_patient': {
        const visit = db.callNextPatient(params.doctorId);
        resultData = { calledVisit: visit };
        break;
      }

      case 'hospital.route': {
        const route = db.getNavigationRoute(params.destination);
        resultData = route;
        break;
      }

      case 'notification.send': {
        // Simulated notification log
        db.addAuditLog(kioskId, sessionId, 'NOTIFICATION_SENT', 'SYSTEM', 'SUCCESS', `Dispatched ${params.channel || 'SMS'} to ${params.mobile}`);
        resultData = { delivered: true, timestamp: new Date().toISOString() };
        break;
      }

      case 'staff.request_assistance': {
        const alertId = randomUUID();
        const alert: any = {
          id: alertId,
          kioskId,
          sessionId,
          location: 'OPD Atrium',
          currentWorkflow: 'ASSISTANCE_REQUEST',
          reason: params.reason || 'Patient requested human help at kiosk',
          urgency: params.urgency || 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        db.staffAlerts.set(alertId, alert);
        db.addAuditLog(kioskId, sessionId, 'STAFF_ALERT', 'KIOSK_USER', 'ESCALATED', params.reason || 'Staff help requested');
        resultData = alert;
        break;
      }

      case 'kiosk.status': {
        const k = db.kiosks.get(params.kioskId || kioskId);
        resultData = k || { isOnline: true, printer: 'READY', scanner: 'READY' };
        break;
      }

      default:
        throw new Error(`MCP Tool '${toolName}' not implemented`);
    }

    db.addAuditLog(kioskId, sessionId, 'TOOL_INVOCATION', actor, 'SUCCESS', `Tool: ${toolName}`, undefined, toolName);

    return {
      tool: toolName,
      success: true,
      data: resultData,
    };
  } catch (err: any) {
    db.addAuditLog(kioskId, sessionId, 'TOOL_INVOCATION', actor, 'FAILURE', `Tool: ${toolName} Error: ${err.message}`, undefined, toolName);
    return {
      tool: toolName,
      success: false,
      error: err.message,
    };
  }
}
