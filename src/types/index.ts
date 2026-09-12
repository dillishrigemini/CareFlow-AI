// Shared TypeScript Types for AI CareFlow Kiosk & Hospital HMIS

export type LanguageCode = 'en' | 'ta' | 'te' | 'hi';
export type FontSize = 'normal' | 'large' | 'huge';
export type NavigationRoute = HospitalNavigationRoute;

export interface Patient {
  id: string;
  uhid: string; // e.g. TN-GH-2026-00412
  opNumber: string; // e.g. OP-88210
  abhaId?: string; // e.g. 91-4521-8842-1920
  name: string;
  nameTa?: string;
  nameTe?: string;
  nameHi?: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  mobile: string;
  address: string;
  bloodGroup?: string;
  languagePreference: LanguageCode;
  lastVisitDate?: string;
  lastDepartment?: string;
  emergencyContact?: string;
  isSeniorCitizen?: boolean;
}

export interface Department {
  id: string;
  code: string;
  nameEn: string;
  nameTa: string;
  nameTe?: string;
  nameHi: string;
  roomNo: string;
  floor: string;
  block: string;
  avgWaitMin: number;
  maxTokensPerDay: number;
  isAvailable: boolean;
  icon: string;
  description: string;
  symptoms: string[];
}

export interface Doctor {
  id: string;
  name: string;
  nameTa?: string;
  nameTe?: string;
  qualifications: string;
  departmentId: string;
  departmentName: string;
  roomNo: string;
  status: 'AVAILABLE' | 'CONSULTING' | 'ON_BREAK' | 'ON_LEAVE';
  currentToken: number;
  patientsWaiting: number;
  avgConsultationMinutes: number;
  scheduleToday: string;
  photoUrl?: string;
}

export type VisitStatus = 
  | 'REGISTERED' 
  | 'WAITING' 
  | 'CALLED' 
  | 'IN_CONSULTATION' 
  | 'LAB_ORDERED' 
  | 'PHARMACY_PENDING' 
  | 'COMPLETED' 
  | 'SKIPPED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type PriorityCategory = 
  | 'NORMAL' 
  | 'SENIOR_CITIZEN' 
  | 'PREGNANT_WOMAN' 
  | 'DIVYANG' 
  | 'EMERGENCY';

export interface OPDVisit {
  id: string;
  visitNo: string;
  uhid: string;
  patientName: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  patientMobile: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  roomNo: string;
  tokenNo: number;
  tokenDisplay: string; // e.g. "GM-047"
  visitDate: string;
  status: VisitStatus;
  priority: PriorityCategory;
  registrationSource: 'KIOSK_NEW' | 'KIOSK_OP_SCAN' | 'KIOSK_VOICE' | 'STAFF_DESK';
  queuePosition: number;
  estimatedWaitMinutes: number;
  qrPayload: string;
  createdAt: string;
}

export interface ConsultationRecord {
  id: string;
  visitId: string;
  uhid: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  chiefComplaints: string;
  clinicalNotes: string;
  diagnosis: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    spo2: string;
  };
  hasLabOrder: boolean;
  hasPrescription: boolean;
  followUpDate?: string;
  followUpInstructions?: string;
  referral?: {
    type: 'INTERNAL' | 'HIGHER_CENTRE';
    departmentOrHospital: string;
    reason: string;
    urgency: 'ROUTINE' | 'URGENT';
  };
  completedAt: string;
}

export interface LabOrder {
  id: string;
  visitId: string;
  uhid: string;
  patientName: string;
  testName: string;
  testCategory: 'BLOOD' | 'XRAY' | 'URINE' | 'ECG' | 'ULTRASOUND';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'READY' | 'REVIEWED';
  orderedAt: string;
  sampleCollectedAt?: string;
  readyAt?: string;
  results?: Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
  }>;
  doctorRemarks?: string;
  labCounter: string;
}

export interface PharmacyOrder {
  id: string;
  visitId: string;
  uhid: string;
  patientName: string;
  pharmacyToken: string; // e.g. "P-18"
  counterNo: string;
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
    timing: 'BEFORE_FOOD' | 'AFTER_FOOD';
    instructions: string;
    dispensed: boolean;
  }>;
  status: 'QUEUED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'DISPENSED';
  estimatedWaitMinutes: number;
  createdAt: string;
  dispensedAt?: string;
}

export interface OCRFieldResult {
  value: string;
  confidence: number;
  verified: boolean;
}

export interface DocumentOCRResponse {
  rawText: string;
  overallConfidence: number;
  documentType: 'OP_SLIP' | 'LAB_REPORT' | 'DISCHARGE_SUMMARY' | 'UNKNOWN';
  fields: {
    hospitalName?: OCRFieldResult;
    patientName?: OCRFieldResult;
    uhid?: OCRFieldResult;
    opNumber?: OCRFieldResult;
    age?: OCRFieldResult;
    gender?: OCRFieldResult;
    mobile?: OCRFieldResult;
    department?: OCRFieldResult;
    doctor?: OCRFieldResult;
    previousVisitDate?: OCRFieldResult;
    diagnosis?: OCRFieldResult;
    followUpDate?: OCRFieldResult;
  };
  matchedPatient?: Patient | null;
  matchType: 'EXACT_UHID' | 'EXACT_OP' | 'MOBILE_NAME' | 'NO_MATCH' | 'MULTIPLE_CANDIDATES';
  validationWarnings: string[];
}

export interface StaffAlert {
  id: string;
  kioskId: string;
  location: string;
  sessionId: string;
  currentWorkflow: string;
  reason: string;
  urgency: 'LOW' | 'MEDIUM' | 'EMERGENCY';
  patientUhid?: string;
  patientName?: string;
  status: 'PENDING' | 'ASSIGNED' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  kioskId: string;
  sessionId: string;
  action: string;
  actor: string;
  patientUhid?: string;
  toolInvoked?: string;
  status: 'SUCCESS' | 'FAILURE' | 'ESCALATED';
  details: string;
}

export interface AgentTrace {
  id: string;
  timestamp: string;
  userQuery: string;
  detectedLanguage: LanguageCode;
  intent: string;
  agentSelected: string;
  toolSelected?: string;
  toolParameters?: Record<string, unknown>;
  toolResultSummary?: string;
  decisionMetadata: string;
  response: string;
  latencyMs: number;
  isSafetyEscalation: boolean;
}

export interface KioskHardwareState {
  kioskId: string;
  location: string;
  isOnline: boolean;
  printer: 'READY' | 'PAPER_LOW' | 'JAMMED' | 'OFFLINE';
  scanner: 'READY' | 'ACTIVE' | 'ERROR';
  camera: 'READY' | 'ACTIVE' | 'ERROR';
  microphone: 'READY' | 'LISTENING' | 'MUTED';
  speaker: 'READY' | 'SPEAKING' | 'MUTED';
  activeSessionId?: string;
  lastPing: string;
}

export interface HospitalNavigationRoute {
  source: string;
  destination: string;
  estimatedWalkingMinutes: number;
  steps: Array<{
    stepNumber: number;
    instructionEn: string;
    instructionTa: string;
    instructionTe?: string;
    instructionHi: string;
    floor: string;
    block: string;
    landmark: string;
    icon: string;
  }>;
}

export interface AnalyticsSummary {
  totalPatientsToday: number;
  newRegistrations: number;
  existingFollowUps: number;
  activeKiosksCount: number;
  avgRegistrationDurationSeconds: number;
  avgWaitTimeMinutes: number;
  queueDepthTotal: number;
  completedConsultations: number;
  pendingLabOrders: number;
  pendingPharmacyOrders: number;
  staffAlertsCount: number;
  voiceUsagePercentage: number;
  languageDistribution: {
    tamil: number;
    english: number;
    hindi: number;
  };
  departmentLoads: Array<{
    departmentName: string;
    activeQueue: number;
    completed: number;
    avgWaitMin: number;
  }>;
}
