import { randomUUID } from 'crypto';
import {
  Patient,
  Department,
  Doctor,
  OPDVisit,
  ConsultationRecord,
  LabOrder,
  PharmacyOrder,
  StaffAlert,
  AuditLog,
  AgentTrace,
  KioskHardwareState,
  HospitalNavigationRoute,
  AnalyticsSummary,
} from '../src/types';

class HospitalDatabase {
  public patients: Map<string, Patient> = new Map();
  public departments: Map<string, Department> = new Map();
  public doctors: Map<string, Doctor> = new Map();
  public visits: Map<string, OPDVisit> = new Map();
  public consultations: Map<string, ConsultationRecord> = new Map();
  public labOrders: Map<string, LabOrder> = new Map();
  public pharmacyOrders: Map<string, PharmacyOrder> = new Map();
  public staffAlerts: Map<string, StaffAlert> = new Map();
  public auditLogs: AuditLog[] = [];
  public agentTraces: AgentTrace[] = [];
  public kiosks: Map<string, KioskHardwareState> = new Map();

  constructor() {
    this.seedAll();
  }

  private seedAll() {
    // 1. Departments
    const deptData: Department[] = [
      {
        id: 'dept-gm',
        code: 'GM',
        nameEn: 'General Medicine',
        nameTa: 'பொது மருத்துவம்',
        nameTe: 'జనరల్ మెడిసిన్ (సాధారణ వైద్యం)',
        nameHi: 'सामान्य चिकित्सा',
        roomNo: '102',
        floor: 'Ground Floor',
        block: 'Block A (Main Wing)',
        avgWaitMin: 4,
        maxTokensPerDay: 250,
        isAvailable: true,
        icon: 'Stethoscope',
        description: 'Adult fever, diabetes, hypertension, cough, digestive complaints',
        symptoms: ['fever', 'cough', 'cold', 'headache', 'weakness', 'vomiting', 'stomach pain', 'tiredness', 'diabetes', 'bp', 'காய்ச்சல்', 'இருமல்', 'தலைவலி', 'జ్వరం', 'దగ్గు', 'జలుబు', 'తలనొప్పి', 'నీరసం', 'వాంతులు', 'కడుపు నొప్పి'],
      },
      {
        id: 'dept-ortho',
        code: 'ORTHO',
        nameEn: 'Orthopaedics',
        nameTa: 'எலும்பு மற்றும் மூட்டு மருத்துவம்',
        nameTe: 'ఆర్థోపెడిక్స్ (ఎముకలు మరియు కీళ్ల వైద్యం)',
        nameHi: 'अस्थि एवं जोड़ रोग',
        roomNo: '204',
        floor: 'First Floor',
        block: 'Block B (Trauma Wing)',
        avgWaitMin: 6,
        maxTokensPerDay: 180,
        isAvailable: true,
        icon: 'Bone',
        description: 'Bone fractures, joint pains, backache, arthritis, knee problems',
        symptoms: ['knee pain', 'back pain', 'joint pain', 'fracture', 'bone pain', 'shoulder pain', 'walking difficulty', 'முழங்கால் வலி', 'இடுப்பு வலி', 'எலும்பு முறிவு', 'మోకాలి నొప్పి', 'కీళ్ల నొప్పులు', 'వెన్నునొప్పి', 'ఎముక నొప్పి', 'నొప్పి'],
      },
      {
        id: 'dept-peds',
        code: 'PEDS',
        nameEn: 'Paediatrics',
        nameTa: 'குழந்தைகள் நல மருத்துவம்',
        nameTe: 'పీడియాట్రిక్స్ (చిన్నారుల వైద్యం)',
        nameHi: 'शिशु एवं बाल रोग',
        roomNo: '108',
        floor: 'Ground Floor',
        block: 'Block C (MCH Wing)',
        avgWaitMin: 5,
        maxTokensPerDay: 200,
        isAvailable: true,
        icon: 'Baby',
        description: 'Children care (0 to 14 years), immunization, childhood illnesses',
        symptoms: ['child fever', 'baby crying', 'child vomiting', 'vaccination', 'child cough', 'குழந்தை காய்ச்சல்', 'குழந்தை நலன்', 'పిల్లల జ్వరం', 'బిడ్డ దగ్గు', 'టీకాలు', 'చిన్నారుల ఆరోగ్యం'],
      },
      {
        id: 'dept-og',
        code: 'OG',
        nameEn: 'Obstetrics & Gynaecology',
        nameTa: 'மகப்பேறு மற்றும் மகளிர் மருத்துவம்',
        nameTe: 'గైనకాలజీ & ప్రసూతి విభాగం',
        nameHi: 'प्रसूति एवं स्त्री रोग',
        roomNo: '115',
        floor: 'Ground Floor',
        block: 'Block C (MCH Wing)',
        avgWaitMin: 7,
        maxTokensPerDay: 190,
        isAvailable: true,
        icon: 'HeartHandshake',
        description: 'Antenatal care (ANC), pregnancy checkup, women health',
        symptoms: ['pregnancy', 'antenatal', 'period pain', 'women health', 'anc checkup', 'கர்ப்பகால பரிசோதனை', 'மகளிர் நலன்', 'గర్భధారణ', 'మహిళల ఆరోగ్యం', 'నెలసరి నొప్పి'],
      },
      {
        id: 'dept-eye',
        code: 'EYE',
        nameEn: 'Ophthalmology (Eye)',
        nameTa: 'கண் மருத்துவம்',
        nameTe: 'నేత్ర వైద్య విభాగం (కంటి విభాగం)',
        nameHi: 'नेत्र रोग',
        roomNo: '210',
        floor: 'First Floor',
        block: 'Block A (Specialty)',
        avgWaitMin: 5,
        maxTokensPerDay: 150,
        isAvailable: true,
        icon: 'Eye',
        description: 'Vision testing, cataract, eye irritation, redness, watering',
        symptoms: ['blurry vision', 'eye pain', 'eye redness', 'cataract', 'eye watering', 'கண் பார்வை', 'கண் வலி', 'கண் சிவத்தல்', 'కంటి చూపు', 'కంటి నొప్పి', 'కంటి ఎరుపు', 'నీరు కారడం'],
      },
      {
        id: 'dept-ent',
        code: 'ENT',
        nameEn: 'ENT (Ear, Nose, Throat)',
        nameTa: 'காது, மூக்கு, தொண்டை மருத்துவம்',
        nameTe: 'ఈఎన్‌టీ (చెవి, ముక్కు, గొంతు వైద్యం)',
        nameHi: 'कान, नाक एवं गला',
        roomNo: '212',
        floor: 'First Floor',
        block: 'Block A (Specialty)',
        avgWaitMin: 4,
        maxTokensPerDay: 140,
        isAvailable: true,
        icon: 'Ear',
        description: 'Hearing issues, ear pain/discharge, nasal blockage, throat pain',
        symptoms: ['ear pain', 'ear discharge', 'hearing problem', 'throat pain', 'swallowing pain', 'sinus', 'காது வலி', 'தொண்டை வலி', 'చెవి నొప్పి', 'గొంతు నొప్పి', 'సైనస్', 'వినపడకపోవడం'],
      },
      {
        id: 'dept-derma',
        code: 'DERMA',
        nameEn: 'Dermatology (Skin)',
        nameTa: 'தோல் நோய் மருத்துவம்',
        nameTe: 'డెర్మటాలజీ (చర్మ వ్యాధుల విభాగం)',
        nameHi: 'त्वचा रोग',
        roomNo: '218',
        floor: 'First Floor',
        block: 'Block B',
        avgWaitMin: 4,
        maxTokensPerDay: 130,
        isAvailable: true,
        icon: 'Sparkles',
        description: 'Skin rashes, itching, fungal infections, allergies',
        symptoms: ['skin rash', 'itching', 'skin patches', 'fungal infection', 'acne', 'தோல் அரிப்பு', 'தோல் தடிப்பு', 'చర్మ దద్దుర్లు', 'దురద', 'మచ్చలు'],
      },
      {
        id: 'dept-surg',
        code: 'SURG',
        nameEn: 'General Surgery',
        nameTa: 'பொது அறுவை சிகிச்சை பிரிவு',
        nameTe: 'జనరల్ సర్జరీ (సాధారణ శస్త్రచికిత్స)',
        nameHi: 'सामान्य शल्य चिकित्सा',
        roomNo: '105',
        floor: 'Ground Floor',
        block: 'Block B',
        avgWaitMin: 6,
        maxTokensPerDay: 120,
        isAvailable: true,
        icon: 'Scissors',
        description: 'Hernia, gallstones, wound dressing, appendicitis evaluation, swellings',
        symptoms: ['wound', 'hernia', 'severe abdominal pain', 'swelling', 'lump', 'அறுவை சிகிச்சை', 'காயம்', 'வீக்கம்', 'గాయం', 'వాపు', 'శస్త్రచికిత్స'],
      },
      {
        id: 'dept-cardio',
        code: 'CARDIO',
        nameEn: 'Cardiology (Heart Clinic)',
        nameTa: 'இதய நோய் சிறப்பு பிரிவு',
        nameTe: 'కార్డియాలజీ (గుండె జబ్బుల విభాగం)',
        nameHi: 'हृदय रोग विभाग',
        roomNo: '302',
        floor: 'Second Floor',
        block: 'Block A (Super Specialty)',
        avgWaitMin: 8,
        maxTokensPerDay: 90,
        isAvailable: true,
        icon: 'Activity',
        description: 'Cardiac evaluation, ECG review, palpitations, post-angioplasty follow-up',
        symptoms: ['palpitation', 'mild chest tightness', 'post heart checkup', 'ecg review', 'இதய பரிசோதனை', 'గుండె దడ', 'గుండె పరీక్ష'],
      },
      {
        id: 'dept-casualty',
        code: 'EMERG',
        nameEn: 'Emergency & Casualty (24/7)',
        nameTa: 'அவசர சிகிச்சை பிரிவு (24/7)',
        nameTe: 'ఎమర్జెన్సీ & క్యాజువాలిటీ (24/7)',
        nameHi: 'आपातकालीन एवं दुर्घटना (24/7)',
        roomNo: '001',
        floor: 'Ground Floor',
        block: 'Left Wing (Direct Ambulance Access)',
        avgWaitMin: 0,
        maxTokensPerDay: 999,
        isAvailable: true,
        icon: 'Flame',
        description: 'Acute trauma, stroke, acute chest pain, shock, severe poisoning',
        symptoms: ['chest pain', 'severe bleeding', 'unconscious', 'poisoning', 'snake bite', 'accident', 'breathlessness', 'நெஞ்சு வலி', 'மயக்கம்', 'விபத்து', 'గుండె నొప్పి', 'రక్తం', 'స్పృహ తప్పడం', 'విషం', 'పాము కాటు', 'ప్రమాదం', 'శ్వాస ఆడకపోవడం'],
      },
    ];
    deptData.forEach(d => this.departments.set(d.id, d));

    // 2. Doctors
    const doctorData: Doctor[] = [
      {
        id: 'doc-1',
        name: 'Dr. S. Kumar',
        qualifications: 'MBBS, MD (General Medicine)',
        departmentId: 'dept-gm',
        departmentName: 'General Medicine',
        roomNo: '102',
        status: 'CONSULTING',
        currentToken: 36,
        patientsWaiting: 10,
        avgConsultationMinutes: 4,
        scheduleToday: '08:00 AM - 01:00 PM',
      },
      {
        id: 'doc-2',
        name: 'Dr. M. Lakshmi',
        qualifications: 'MBBS, DNB (Internal Medicine)',
        departmentId: 'dept-gm',
        departmentName: 'General Medicine',
        roomNo: '103',
        status: 'AVAILABLE',
        currentToken: 29,
        patientsWaiting: 4,
        avgConsultationMinutes: 3.5,
        scheduleToday: '08:00 AM - 01:00 PM',
      },
      {
        id: 'doc-3',
        name: 'Dr. K. Ravi',
        qualifications: 'MBBS, MS (Orthopaedics)',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopaedics',
        roomNo: '204',
        status: 'CONSULTING',
        currentToken: 18,
        patientsWaiting: 5,
        avgConsultationMinutes: 5,
        scheduleToday: '08:30 AM - 01:30 PM',
      },
      {
        id: 'doc-4',
        name: 'Dr. T. Soundar',
        qualifications: 'MBBS, D.Ortho',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopaedics',
        roomNo: '205',
        status: 'AVAILABLE',
        currentToken: 14,
        patientsWaiting: 2,
        avgConsultationMinutes: 4.5,
        scheduleToday: '08:30 AM - 01:30 PM',
      },
      {
        id: 'doc-5',
        name: 'Dr. V. Priya',
        qualifications: 'MBBS, MD (Paediatrics)',
        departmentId: 'dept-peds',
        departmentName: 'Paediatrics',
        roomNo: '108',
        status: 'CONSULTING',
        currentToken: 22,
        patientsWaiting: 6,
        avgConsultationMinutes: 5,
        scheduleToday: '08:00 AM - 01:00 PM',
      },
      {
        id: 'doc-6',
        name: 'Dr. N. Anand',
        qualifications: 'MBBS, DCH',
        departmentId: 'dept-peds',
        departmentName: 'Paediatrics',
        roomNo: '109',
        status: 'AVAILABLE',
        currentToken: 19,
        patientsWaiting: 3,
        avgConsultationMinutes: 4,
        scheduleToday: '08:00 AM - 01:00 PM',
      },
      {
        id: 'doc-7',
        name: 'Dr. R. Meenakshi',
        qualifications: 'MBBS, MS (OBG), DGO',
        departmentId: 'dept-og',
        departmentName: 'Obstetrics & Gynaecology',
        roomNo: '115',
        status: 'CONSULTING',
        currentToken: 31,
        patientsWaiting: 8,
        avgConsultationMinutes: 6,
        scheduleToday: '08:00 AM - 02:00 PM',
      },
      {
        id: 'doc-8',
        name: 'Dr. P. Swaminathan',
        qualifications: 'MBBS, MS (Ophthalmology)',
        departmentId: 'dept-eye',
        departmentName: 'Ophthalmology (Eye)',
        roomNo: '210',
        status: 'AVAILABLE',
        currentToken: 12,
        patientsWaiting: 3,
        avgConsultationMinutes: 4,
        scheduleToday: '09:00 AM - 01:00 PM',
      },
      {
        id: 'doc-9',
        name: 'Dr. J. Anthony',
        qualifications: 'MBBS, MS (ENT)',
        departmentId: 'dept-ent',
        departmentName: 'ENT (Ear, Nose, Throat)',
        roomNo: '212',
        status: 'AVAILABLE',
        currentToken: 16,
        patientsWaiting: 4,
        avgConsultationMinutes: 4,
        scheduleToday: '08:30 AM - 01:30 PM',
      },
      {
        id: 'doc-10',
        name: 'Dr. B. Geetha',
        qualifications: 'MBBS, DDVL (Dermatology)',
        departmentId: 'dept-derma',
        departmentName: 'Dermatology (Skin)',
        roomNo: '218',
        status: 'CONSULTING',
        currentToken: 25,
        patientsWaiting: 5,
        avgConsultationMinutes: 3.5,
        scheduleToday: '09:00 AM - 01:00 PM',
      },
      {
        id: 'doc-11',
        name: 'Dr. A. Murugesan',
        qualifications: 'MBBS, MS (General Surgery)',
        departmentId: 'dept-surg',
        departmentName: 'General Surgery',
        roomNo: '105',
        status: 'AVAILABLE',
        currentToken: 9,
        patientsWaiting: 2,
        avgConsultationMinutes: 6,
        scheduleToday: '08:30 AM - 01:00 PM',
      },
      {
        id: 'doc-12',
        name: 'Dr. K. Chandrasekar',
        qualifications: 'MBBS, MD, DM (Cardiology)',
        departmentId: 'dept-cardio',
        departmentName: 'Cardiology (Heart Clinic)',
        roomNo: '302',
        status: 'CONSULTING',
        currentToken: 11,
        patientsWaiting: 4,
        avgConsultationMinutes: 7,
        scheduleToday: '09:00 AM - 01:00 PM',
      },
      {
        id: 'doc-13',
        name: 'Dr. E. Rajesh (CMO)',
        qualifications: 'MBBS, MEM (Emergency Medicine)',
        departmentId: 'dept-casualty',
        departmentName: 'Emergency & Casualty (24/7)',
        roomNo: '001',
        status: 'AVAILABLE',
        currentToken: 5,
        patientsWaiting: 0,
        avgConsultationMinutes: 5,
        scheduleToday: '24 Hours On-Duty Rotation',
      },
    ];
    doctorData.forEach(doc => this.doctors.set(doc.id, doc));

    // 3. Pre-seeded Patients
    const patientData: Patient[] = [
      {
        id: 'p-1',
        uhid: 'TN-GH-2026-00412',
        opNumber: 'OP-88210',
        abhaId: '91-4521-8842-1920',
        name: 'Ramasamy K',
        nameTa: 'இராமசாமி கே',
        age: 58,
        gender: 'MALE',
        mobile: '9840123456',
        address: 'No 14, Gandhi Road, Tiruvallur',
        bloodGroup: 'B+',
        languagePreference: 'ta',
        lastVisitDate: '2026-08-20',
        lastDepartment: 'General Medicine',
        isSeniorCitizen: false,
      },
      {
        id: 'p-2',
        uhid: 'TN-GH-2026-00588',
        opNumber: 'OP-88344',
        abhaId: '91-8833-2211-5041',
        name: 'Kavitha Murugan',
        nameTa: 'கவிதா முருகன்',
        age: 34,
        gender: 'FEMALE',
        mobile: '9790456123',
        address: '22 Bazaar Street, Poonamallee',
        bloodGroup: 'O+',
        languagePreference: 'ta',
        lastVisitDate: '2026-08-28',
        lastDepartment: 'Orthopaedics',
        isSeniorCitizen: false,
      },
      {
        id: 'p-3',
        uhid: 'TN-GH-2025-09120',
        opNumber: 'OP-74102',
        abhaId: '91-1100-9944-7722',
        name: 'Arun Pandian',
        nameTa: 'அருண் பாண்டியன்',
        age: 29,
        gender: 'MALE',
        mobile: '9444129988',
        address: 'Flat 3B, Rail Nagar, Avadi',
        bloodGroup: 'A+',
        languagePreference: 'en',
        lastVisitDate: '2026-07-14',
        lastDepartment: 'ENT (Ear, Nose, Throat)',
      },
      {
        id: 'p-4',
        uhid: 'TN-GH-2024-00109',
        opNumber: 'OP-51204',
        abhaId: '91-6622-4411-8890',
        name: 'Subramanian V',
        nameTa: 'சுப்பிரமணியன் வி',
        age: 72,
        gender: 'MALE',
        mobile: '9884567890',
        address: '8 Temple Street, Sriperumbudur',
        bloodGroup: 'AB+',
        languagePreference: 'ta',
        lastVisitDate: '2026-08-05',
        lastDepartment: 'Cardiology (Heart Clinic)',
        isSeniorCitizen: true,
      },
      {
        id: 'p-5',
        uhid: 'TN-GH-2026-01124',
        opNumber: 'OP-90112',
        abhaId: '91-7722-1199-3344',
        name: 'Deepa Rajendran',
        nameTa: 'தீபா ராஜேந்திரன்',
        age: 26,
        gender: 'FEMALE',
        mobile: '9176332211',
        address: '45 Lake View Road, Red Hills',
        bloodGroup: 'O+',
        languagePreference: 'ta',
        lastVisitDate: '2026-09-02',
        lastDepartment: 'Obstetrics & Gynaecology',
      },
      {
        id: 'p-6',
        uhid: 'TN-GH-2026-01890',
        opNumber: 'OP-92451',
        name: 'Rajesh Kumar Verma',
        nameHi: 'राजेश कुमार वर्मा',
        age: 41,
        gender: 'MALE',
        mobile: '9810234567',
        address: 'Plot 12, Industrial Estate, Gummidipoondi',
        bloodGroup: 'B+',
        languagePreference: 'hi',
        lastVisitDate: '2026-08-11',
        lastDepartment: 'Dermatology (Skin)',
      },
    ];
    patientData.forEach(p => this.patients.set(p.id, p));

    // 4. Initial Pre-seeded Active Visits / Tokens for General Medicine & Ortho
    const initialVisits: OPDVisit[] = [
      {
        id: 'v-101',
        visitNo: 'VIS-2026-0912-0036',
        uhid: 'TN-GH-2025-08100',
        patientName: 'Karthik N',
        patientAge: 45,
        patientGender: 'MALE',
        patientMobile: '9840998877',
        departmentId: 'dept-gm',
        departmentName: 'General Medicine',
        doctorId: 'doc-1',
        doctorName: 'Dr. S. Kumar',
        roomNo: '102',
        tokenNo: 36,
        tokenDisplay: 'GM-036',
        visitDate: '2026-09-12',
        status: 'IN_CONSULTATION',
        priority: 'NORMAL',
        registrationSource: 'KIOSK_NEW',
        queuePosition: 0,
        estimatedWaitMinutes: 0,
        qrPayload: 'CAREFLOW:VIS-2026-0912-0036:TN-GH-2025-08100',
        createdAt: '2026-09-12T08:15:00Z',
      },
      {
        id: 'v-102',
        visitNo: 'VIS-2026-0912-0047',
        uhid: 'TN-GH-2026-00412',
        patientName: 'Ramasamy K',
        patientAge: 58,
        patientGender: 'MALE',
        patientMobile: '9840123456',
        departmentId: 'dept-gm',
        departmentName: 'General Medicine',
        doctorId: 'doc-1',
        doctorName: 'Dr. S. Kumar',
        roomNo: '102',
        tokenNo: 47,
        tokenDisplay: 'GM-047',
        visitDate: '2026-09-12',
        status: 'WAITING',
        priority: 'NORMAL',
        registrationSource: 'KIOSK_OP_SCAN',
        queuePosition: 10,
        estimatedWaitMinutes: 38,
        qrPayload: 'CAREFLOW:VIS-2026-0912-0047:TN-GH-2026-00412',
        createdAt: '2026-09-12T08:42:00Z',
      },
      {
        id: 'v-103',
        visitNo: 'VIS-2026-0912-0018',
        uhid: 'TN-GH-2026-00588',
        patientName: 'Kavitha Murugan',
        patientAge: 34,
        patientGender: 'FEMALE',
        patientMobile: '9790456123',
        departmentId: 'dept-ortho',
        departmentName: 'Orthopaedics',
        doctorId: 'doc-3',
        doctorName: 'Dr. K. Ravi',
        roomNo: '204',
        tokenNo: 18,
        tokenDisplay: 'ORTHO-018',
        visitDate: '2026-09-12',
        status: 'IN_CONSULTATION',
        priority: 'NORMAL',
        registrationSource: 'KIOSK_OP_SCAN',
        queuePosition: 0,
        estimatedWaitMinutes: 0,
        qrPayload: 'CAREFLOW:VIS-2026-0912-0018:TN-GH-2026-00588',
        createdAt: '2026-09-12T08:30:00Z',
      },
    ];
    initialVisits.forEach(v => this.visits.set(v.id, v));

    // 5. Pre-seeded Lab Order for v-101
    const initialLab: LabOrder = {
      id: 'lab-1',
      visitId: 'v-101',
      uhid: 'TN-GH-2025-08100',
      patientName: 'Karthik N',
      testName: 'Complete Blood Count (CBC) + HbA1c',
      testCategory: 'BLOOD',
      status: 'PROCESSING',
      orderedAt: '2026-09-12T08:50:00Z',
      sampleCollectedAt: '2026-09-12T09:05:00Z',
      labCounter: 'Counter 03 (Central Lab, 1st Floor)',
      results: [
        { parameter: 'Haemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '13.0 - 17.0', isAbnormal: false },
        { parameter: 'Total WBC', value: '7,400', unit: '/cu.mm', referenceRange: '4,000 - 11,000', isAbnormal: false },
        { parameter: 'HbA1c (Glycated Hb)', value: '7.8', unit: '%', referenceRange: '< 5.7', isAbnormal: true },
      ],
    };
    this.labOrders.set(initialLab.id, initialLab);

    // 6. Pre-seeded Pharmacy Order
    const initialPharm: PharmacyOrder = {
      id: 'pharm-1',
      visitId: 'v-101',
      uhid: 'TN-GH-2025-08100',
      patientName: 'Karthik N',
      pharmacyToken: 'P-18',
      counterNo: 'Counter 02 (Ground Floor OP Pharmacy)',
      medicines: [
        {
          name: 'Tab. Metformin 500mg',
          dosage: '1 tablet twice daily',
          duration: '30 days',
          timing: 'AFTER_FOOD',
          instructions: 'Take after morning and night meals',
          dispensed: true,
        },
        {
          name: 'Tab. Paracetamol 650mg',
          dosage: '1 tablet SOS for fever',
          duration: '5 days',
          timing: 'AFTER_FOOD',
          instructions: 'Take if temperature exceeds 99.5 F',
          dispensed: true,
        },
      ],
      status: 'READY_FOR_PICKUP',
      estimatedWaitMinutes: 5,
      createdAt: '2026-09-12T09:10:00Z',
    };
    this.pharmacyOrders.set(initialPharm.id, initialPharm);

    // 7. Kiosks state
    const kioskList: KioskHardwareState[] = [
      {
        kioskId: 'KIOSK-01',
        location: 'Main OPD Entrance Lobby (Ground Floor)',
        isOnline: true,
        printer: 'READY',
        scanner: 'READY',
        camera: 'READY',
        microphone: 'READY',
        speaker: 'READY',
        lastPing: new Date().toISOString(),
      },
      {
        kioskId: 'KIOSK-02',
        location: 'Maternal & Child Health Wing (Block C)',
        isOnline: true,
        printer: 'READY',
        scanner: 'READY',
        camera: 'READY',
        microphone: 'READY',
        speaker: 'READY',
        lastPing: new Date().toISOString(),
      },
      {
        kioskId: 'KIOSK-03',
        location: 'Specialty OP Waiting Area (1st Floor)',
        isOnline: true,
        printer: 'PAPER_LOW',
        scanner: 'READY',
        camera: 'READY',
        microphone: 'READY',
        speaker: 'READY',
        lastPing: new Date().toISOString(),
      },
      {
        kioskId: 'KIOSK-04',
        location: 'Casualty / Emergency Triage Desk',
        isOnline: true,
        printer: 'READY',
        scanner: 'READY',
        camera: 'READY',
        microphone: 'READY',
        speaker: 'READY',
        lastPing: new Date().toISOString(),
      },
    ];
    kioskList.forEach(k => this.kiosks.set(k.kioskId, k));

    // 8. Initial Audit Log
    this.addAuditLog('KIOSK-01', 'BOOT_SESSION', 'SYSTEM', 'BOOT', 'SUCCESS', 'Hospital HMIS & Kiosk service started');
  }

  public addAuditLog(
    kioskId: string,
    sessionId: string,
    action: string,
    actor: string,
    status: 'SUCCESS' | 'FAILURE' | 'ESCALATED',
    details: string,
    patientUhid?: string,
    toolInvoked?: string
  ) {
    const log: AuditLog = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      kioskId,
      sessionId,
      action,
      actor,
      patientUhid,
      toolInvoked,
      status,
      details,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 300) {
      this.auditLogs.pop();
    }
  }

  public addAgentTrace(trace: Omit<AgentTrace, 'id' | 'timestamp'>): AgentTrace {
    const item: AgentTrace = {
      ...trace,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };
    this.agentTraces.unshift(item);
    if (this.agentTraces.length > 200) {
      this.agentTraces.pop();
    }
    return item;
  }

  // Patient Lookup methods
  public searchPatients(query: string): Patient[] {
    const clean = query.trim().toLowerCase();
    if (!clean) return [];
    return Array.from(this.patients.values()).filter(p => {
      return (
        p.uhid.toLowerCase().includes(clean) ||
        p.opNumber.toLowerCase().includes(clean) ||
        p.mobile.includes(clean) ||
        (p.abhaId && p.abhaId.toLowerCase().includes(clean)) ||
        p.name.toLowerCase().includes(clean) ||
        (p.nameTa && p.nameTa.toLowerCase().includes(clean))
      );
    });
  }

  public findPatientByUhid(uhid: string): Patient | undefined {
    return Array.from(this.patients.values()).find(
      p => p.uhid.toLowerCase() === uhid.toLowerCase()
    );
  }

  public findPatientByMobile(mobile: string): Patient[] {
    const clean = mobile.replace(/\D/g, '');
    return Array.from(this.patients.values()).filter(p => p.mobile.replace(/\D/g, '').includes(clean));
  }

  public createPatient(data: Omit<Patient, 'id' | 'uhid' | 'opNumber'>): Patient {
    const count = this.patients.size + 1;
    const uhid = `TN-GH-2026-${String(count + 420).padStart(5, '0')}`;
    const opNumber = `OP-${String(88500 + count)}`;
    const patient: Patient = {
      ...data,
      id: `p-${randomUUID()}`,
      uhid,
      opNumber,
    };
    this.patients.set(patient.id, patient);
    return patient;
  }

  // OPD Registration & Token Generation
  public registerOPD(
    patientId: string,
    departmentId: string,
    doctorId?: string,
    priority: OPDVisit['priority'] = 'NORMAL',
    source: OPDVisit['registrationSource'] = 'KIOSK_NEW',
    kioskId = 'KIOSK-01'
  ): OPDVisit {
    const patient = this.patients.get(patientId);
    if (!patient) throw new Error('Patient not found');
    const dept = this.departments.get(departmentId);
    if (!dept) throw new Error('Department not found');

    // Select doctor or find best available in dept
    let assignedDoc: Doctor | undefined;
    if (doctorId) {
      assignedDoc = this.doctors.get(doctorId);
    }
    if (!assignedDoc) {
      const deptDocs = Array.from(this.doctors.values()).filter(d => d.departmentId === departmentId);
      // Pick doctor with lowest waiting queue
      assignedDoc = deptDocs.sort((a, b) => a.patientsWaiting - b.patientsWaiting)[0];
    }
    if (!assignedDoc) {
      throw new Error('No doctor currently on duty for this department');
    }

    // Token sequencing
    const deptVisitsToday = Array.from(this.visits.values()).filter(
      v => v.departmentId === departmentId && v.visitDate.startsWith('2026-09-12')
    );
    const tokenNo = deptVisitsToday.length + 1;
    const tokenDisplay = `${dept.code}-${String(tokenNo).padStart(3, '0')}`;
    const visitNo = `VIS-2026-0912-${String(this.visits.size + 1).padStart(4, '0')}`;

    // Queue metrics
    const patientsAhead = Math.max(0, tokenNo - assignedDoc.currentToken - 1);
    const estWait = Math.max(2, Math.round(patientsAhead * assignedDoc.avgConsultationMinutes));

    assignedDoc.patientsWaiting += 1;

    const visit: OPDVisit = {
      id: randomUUID(),
      visitNo,
      uhid: patient.uhid,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientMobile: patient.mobile,
      departmentId: dept.id,
      departmentName: dept.nameEn,
      doctorId: assignedDoc.id,
      doctorName: assignedDoc.name,
      roomNo: assignedDoc.roomNo,
      tokenNo,
      tokenDisplay,
      visitDate: '2026-09-12',
      status: 'WAITING',
      priority,
      registrationSource: source,
      queuePosition: patientsAhead + 1,
      estimatedWaitMinutes: estWait,
      qrPayload: `CAREFLOW:${visitNo}:${patient.uhid}:${tokenDisplay}`,
      createdAt: new Date().toISOString(),
    };

    this.visits.set(visit.id, visit);

    // Update patient last visit
    patient.lastVisitDate = '2026-09-12';
    patient.lastDepartment = dept.nameEn;

    this.addAuditLog(
      kioskId,
      'SESSION-' + tokenNo,
      'OP_REGISTRATION',
      'KIOSK_USER',
      'SUCCESS',
      `Token ${tokenDisplay} generated for ${patient.name} (${patient.uhid}) in ${dept.nameEn} (Room ${assignedDoc.roomNo})`,
      patient.uhid,
      'opd.register'
    );

    return visit;
  }

  // Queue State Operations
  public callNextPatient(doctorId: string): OPDVisit | null {
    const doc = this.doctors.get(doctorId);
    if (!doc) return null;

    // Find next waiting visit for this doctor or dept
    const waitingList = Array.from(this.visits.values())
      .filter(v => v.doctorId === doctorId && (v.status === 'WAITING' || v.status === 'CALLED'))
      .sort((a, b) => {
        // Priority first (EMERGENCY -> SENIOR_CITIZEN -> NORMAL)
        const prioOrder: Record<string, number> = {
          EMERGENCY: 0,
          DIVYANG: 1,
          PREGNANT_WOMAN: 2,
          SENIOR_CITIZEN: 3,
          NORMAL: 4,
        };
        const pDiff = (prioOrder[a.priority] ?? 4) - (prioOrder[b.priority] ?? 4);
        if (pDiff !== 0) return pDiff;
        return a.tokenNo - b.tokenNo;
      });

    if (waitingList.length === 0) return null;

    const nextVisit = waitingList[0];
    nextVisit.status = 'IN_CONSULTATION';
    doc.currentToken = nextVisit.tokenNo;
    doc.patientsWaiting = Math.max(0, doc.patientsWaiting - 1);
    doc.status = 'CONSULTING';

    this.addAuditLog(
      'SYSTEM',
      'DOCTOR_PORTAL',
      'CALL_TOKEN',
      doc.name,
      'SUCCESS',
      `Doctor called token ${nextVisit.tokenDisplay}`,
      nextVisit.uhid,
      'queue.call_patient'
    );

    return nextVisit;
  }

  public completeConsultation(
    visitId: string,
    data: {
      chiefComplaints: string;
      clinicalNotes: string;
      diagnosis: string;
      vitals: ConsultationRecord['vitals'];
      labTests?: string[];
      medicines?: Array<{
        name: string;
        dosage: string;
        duration: string;
        timing: 'BEFORE_FOOD' | 'AFTER_FOOD';
        instructions: string;
      }>;
      followUpDate?: string;
      followUpInstructions?: string;
      referral?: ConsultationRecord['referral'];
    }
  ): { visit: OPDVisit; consultation: ConsultationRecord; labOrder?: LabOrder; pharmacyOrder?: PharmacyOrder } {
    const visit = this.visits.get(visitId);
    if (!visit) throw new Error('Visit not found');

    const consultation: ConsultationRecord = {
      id: randomUUID(),
      visitId: visit.id,
      uhid: visit.uhid,
      doctorId: visit.doctorId,
      doctorName: visit.doctorName,
      departmentName: visit.departmentName,
      chiefComplaints: data.chiefComplaints,
      clinicalNotes: data.clinicalNotes,
      diagnosis: data.diagnosis,
      vitals: data.vitals,
      hasLabOrder: !!(data.labTests && data.labTests.length > 0),
      hasPrescription: !!(data.medicines && data.medicines.length > 0),
      followUpDate: data.followUpDate,
      followUpInstructions: data.followUpInstructions,
      referral: data.referral,
      completedAt: new Date().toISOString(),
    };
    this.consultations.set(consultation.id, consultation);

    let labOrder: LabOrder | undefined;
    if (data.labTests && data.labTests.length > 0) {
      labOrder = {
        id: randomUUID(),
        visitId: visit.id,
        uhid: visit.uhid,
        patientName: visit.patientName,
        testName: data.labTests.join(', '),
        testCategory: 'BLOOD',
        status: 'ORDERED',
        orderedAt: new Date().toISOString(),
        labCounter: 'Counter 02 (Biochemistry / Pathology Lab)',
      };
      this.labOrders.set(labOrder.id, labOrder);
      visit.status = 'LAB_ORDERED';
    }

    let pharmacyOrder: PharmacyOrder | undefined;
    if (data.medicines && data.medicines.length > 0) {
      const pCount = this.pharmacyOrders.size + 1;
      pharmacyOrder = {
        id: randomUUID(),
        visitId: visit.id,
        uhid: visit.uhid,
        patientName: visit.patientName,
        pharmacyToken: `P-${String(pCount).padStart(2, '0')}`,
        counterNo: 'Counter 01 (Outpatient Pharmacy)',
        medicines: data.medicines.map(m => ({ ...m, dispensed: false })),
        status: 'QUEUED',
        estimatedWaitMinutes: 8,
        createdAt: new Date().toISOString(),
      };
      this.pharmacyOrders.set(pharmacyOrder.id, pharmacyOrder);
      if (!labOrder) {
        visit.status = 'PHARMACY_PENDING';
      }
    }

    if (!labOrder && !pharmacyOrder) {
      visit.status = 'COMPLETED';
    }

    return { visit, consultation, labOrder, pharmacyOrder };
  }

  // Navigation Route Generator
  public getNavigationRoute(destinationDeptIdOrRoom: string): HospitalNavigationRoute {
    const dept = Array.from(this.departments.values()).find(
      d => d.id === destinationDeptIdOrRoom || d.roomNo === destinationDeptIdOrRoom
    );
    const room = dept ? dept.roomNo : destinationDeptIdOrRoom;
    const nameEn = dept ? dept.nameEn : `Room ${room}`;
    const nameTa = dept ? dept.nameTa : `அறை ${room}`;
    const nameHi = dept ? dept.nameHi : `कमरा ${room}`;

    if (dept?.code === 'EMERG') {
      return {
        source: 'Kiosk 01 (Main Lobby)',
        destination: `${nameEn} - Room ${room}`,
        estimatedWalkingMinutes: 1,
        steps: [
          {
            stepNumber: 1,
            instructionEn: 'Turn sharp LEFT from Kiosk 01 towards the Red Line corridor',
            instructionTa: 'கியோஸ்க் 01-லிருந்து உடனடியாக இடதுபுறம் சிவப்பு கோட்டு நடைபாதைக்கு செல்லவும்',
            instructionTe: 'కియోస్క్ 01 నుండి వెంటనే ఎడమవైపు తిరిగి రెడ్ లైన్ కారిడార్ వైపు వెళ్ళండి',
            instructionHi: 'कियोस्क 01 से तुरंत बाएं लाल रेखा वाले गलियारे की ओर मुड़ें',
            floor: 'Ground Floor',
            block: 'Left Wing (Emergency)',
            landmark: 'Red Emergency Overhead Signboard',
            icon: 'Flame',
          },
          {
            stepNumber: 2,
            instructionEn: 'Walk 20 meters straight into the Casualty Triage Bay Room 001',
            instructionTa: '20 மீட்டர் நேராக சென்று அவசர சிகிச்சை அறை 001-ஐ அடையவும்',
            instructionTe: '20 మీటర్లు నేరుగా నడిచి క్యాజువాలిటీ ట్రయాజ్ బే గది 001 లోనికి వెళ్ళండి',
            instructionHi: '20 मीटर सीधे चलकर कैजुअल्टी ट्रायज कक्ष 001 में प्रवेश करें',
            floor: 'Ground Floor',
            block: 'Casualty Trauma Centre',
            landmark: 'Ambulance Bay Entrance',
            icon: 'MapPin',
          },
        ],
      };
    }

    const isFirstFloor = dept?.floor.includes('First');
    const isSecondFloor = dept?.floor.includes('Second');

    return {
      source: 'Kiosk 01 (OPD Lobby, Ground Floor)',
      destination: `${nameEn} (Room ${room}, ${dept?.block || 'Block A'})`,
      estimatedWalkingMinutes: isSecondFloor ? 4 : isFirstFloor ? 3 : 2,
      steps: [
        {
          stepNumber: 1,
          instructionEn: 'Proceed straight along the central OPD corridor past Registration Counter 02',
          instructionTa: 'மத்திய OPD நடைபாதையில் பதிவு கவுண்டர் 02-ஐ தாண்டி நேராக செல்லவும்',
          instructionTe: 'రిజిస్ట్రేషన్ కౌంటర్ 02 దాటి సెంట్రల్ OPD కారిడార్‌లో నేరుగా ముందుకు వెళ్ళండి',
          instructionHi: 'पंजीकरण काउंटर 02 के पास से मुख्य OPD गलियारे में सीधे जाएं',
          floor: 'Ground Floor',
          block: 'Main Atrium',
          landmark: 'Help Desk & Water Dispenser',
          icon: 'Footprints',
        },
        ...(isFirstFloor || isSecondFloor
          ? [
              {
                stepNumber: 2,
                instructionEn: `Take Ramp B or Elevator 01 to the ${dept?.floor}`,
                instructionTa: `ரேம்ப் பி (Ramp B) அல்லது மின்தூக்கி 01 வழியாக ${dept?.floor}-க்கு செல்லவும்`,
                instructionTe: `ర్యాంప్ B లేదా ఎలివేటర్ 01 ద్వారా ${dept?.floor} కు చేరుకోండి`,
                instructionHi: `रैंप B या लिफ्ट 01 से ${dept?.floor} पर जाएं`,
                floor: dept?.floor || 'First Floor',
                block: 'Central Elevator Hub',
                landmark: 'Elevator 01 & Wide Patient Ramp',
                icon: 'ArrowUpCircle',
              },
            ]
          : []),
        {
          stepNumber: isFirstFloor || isSecondFloor ? 3 : 2,
          instructionEn: `Locate Room ${room} with the blue digital display outside`,
          instructionTa: `நீல நிற டிஜிட்டல் திரை உள்ள அறை எண் ${room}-க்கு செல்லவும்`,
          instructionTe: `బయట నీలిరంగు డిజిటల్ డిస్‌ప్లే ఉన్న గది సంఖ్య ${room} ను గుర్తించండి`,
          instructionHi: `नीले डिजिटल डिस्प्ले वाले कमरा नंबर ${room} पर पहुंचे`,
          floor: dept?.floor || 'Ground Floor',
          block: dept?.block || 'Block A',
          landmark: `Room ${room} Waiting Chairs & Digital Token Screen`,
          icon: 'DoorOpen',
        },
      ],
    };
  }

  // Analytics Computation
  public getAnalytics(): AnalyticsSummary {
    const visitsArr = Array.from(this.visits.values());
    const totalVisits = visitsArr.length;
    const completed = visitsArr.filter(v => v.status === 'COMPLETED').length;
    const waiting = visitsArr.filter(v => v.status === 'WAITING' || v.status === 'CALLED').length;

    const deptLoads = Array.from(this.departments.values()).map(dept => {
      const inDept = visitsArr.filter(v => v.departmentId === dept.id);
      return {
        departmentName: dept.nameEn,
        activeQueue: inDept.filter(v => v.status === 'WAITING' || v.status === 'CALLED' || v.status === 'IN_CONSULTATION').length,
        completed: inDept.filter(v => v.status === 'COMPLETED').length,
        avgWaitMin: dept.avgWaitMin * 5,
      };
    });

    return {
      totalPatientsToday: 148 + totalVisits,
      newRegistrations: 92 + visitsArr.filter(v => v.registrationSource === 'KIOSK_NEW').length,
      existingFollowUps: 56 + visitsArr.filter(v => v.registrationSource === 'KIOSK_OP_SCAN').length,
      activeKiosksCount: Array.from(this.kiosks.values()).filter(k => k.isOnline).length,
      avgRegistrationDurationSeconds: 42,
      avgWaitTimeMinutes: 24,
      queueDepthTotal: waiting,
      completedConsultations: completed + 84,
      pendingLabOrders: Array.from(this.labOrders.values()).filter(l => l.status !== 'REVIEWED').length,
      pendingPharmacyOrders: Array.from(this.pharmacyOrders.values()).filter(p => p.status !== 'DISPENSED').length,
      staffAlertsCount: Array.from(this.staffAlerts.values()).filter(a => a.status !== 'RESOLVED').length,
      voiceUsagePercentage: 38,
      languageDistribution: {
        tamil: 65,
        english: 25,
        hindi: 10,
      },
      departmentLoads: deptLoads,
    };
  }
}

export const db = new HospitalDatabase();
