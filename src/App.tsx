import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  KioskHome 
} from './components/KioskHome';
import { 
  PatientIdentification 
} from './components/PatientIdentification';
import { 
  DocumentScanner 
} from './components/DocumentScanner';
import { 
  DepartmentRouting 
} from './components/DepartmentRouting';
import { 
  TokenAndPrintModal 
} from './components/TokenAndPrintModal';
import { 
  HospitalMap 
} from './components/HospitalMap';
import { 
  LiveQueueBoard 
} from './components/LiveQueueBoard';
import { 
  DoctorPortal 
} from './components/DoctorPortal';
import { 
  LabPortal 
} from './components/LabPortal';
import { 
  PharmacyPortal 
} from './components/PharmacyPortal';
import { 
  CareFlowTracker 
} from './components/CareFlowTracker';
import { 
  StaffDashboard 
} from './components/StaffDashboard';
import { 
  AdminAnalytics 
} from './components/AdminAnalytics';
import { 
  VoiceAssistantModal 
} from './components/VoiceAssistantModal';

import { 
  LanguageCode, 
  FontSize, 
  Patient, 
  OPDVisit 
} from './types';
import { sounds } from './utils/audio';
import { t } from './i18n';
import { 
  AlertTriangle, 
  PhoneCall, 
  X, 
  CheckCircle2, 
  HeartHandshake,
  Monitor,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  Activity,
  ShieldCheck,
  BarChart3,
  MapPin
} from 'lucide-react';

export type ViewState = 
  | 'KIOSK_HOME' 
  | 'IDENTIFICATION' 
  | 'SCANNER' 
  | 'ROUTING' 
  | 'TOKEN_PASS' 
  | 'MAP' 
  | 'QUEUE' 
  | 'DOCTOR' 
  | 'LAB' 
  | 'PHARMACY' 
  | 'CAREFLOW' 
  | 'STAFF' 
  | 'ADMIN';

export default function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('ta');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<ViewState>('KIOSK_HOME');
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [currentVisit, setCurrentVisit] = useState<OPDVisit | null>(null);
  const [preselectedDeptId, setPreselectedDeptId] = useState<string | undefined>(undefined);
  const [mapDestination, setMapDestination] = useState<string>('dept-gm');

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isStaffHelpOpen, setIsStaffHelpOpen] = useState<boolean>(false);
  const [staffHelpSent, setStaffHelpSent] = useState<boolean>(false);

  // Audio effects mute toggle sync
  useEffect(() => {
    sounds.setMuted(audioMuted);
  }, [audioMuted]);

  // Handle Voice Assistant Intent Dispatch
  const handleVoiceIntent = (intent: string, payload?: any) => {
    sounds.playChime();
    setIsVoiceOpen(false);

    if (intent === 'EMERGENCY_ESCALATION') {
      setIsEmergencyOpen(true);
    } else if (intent === 'SCAN_OP_SLIP') {
      setCurrentView('SCANNER');
    } else if (intent === 'SEARCH_UHID') {
      setCurrentView('IDENTIFICATION');
    } else if (intent === 'DEPARTMENT_ROUTED' && payload?.departmentId) {
      setPreselectedDeptId(payload.departmentId);
      setCurrentView('ROUTING');
    } else if (intent === 'CHECK_QUEUE') {
      setCurrentView('QUEUE');
    } else if (intent === 'FIND_ROOM' && payload?.roomNo) {
      setMapDestination(payload.roomNo);
      setCurrentView('MAP');
    } else if (intent === 'STAFF_HELP') {
      handleRequestStaffHelp();
    }
  };

  // Staff help escalation
  const handleRequestStaffHelp = async () => {
    sounds.playClick();
    setIsStaffHelpOpen(true);
    setStaffHelpSent(false);

    try {
      await fetch('/api/staff/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kioskId: 'KIOSK-01',
          location: 'OPD Entrance Lobby',
          reason: 'Patient requested assistance at Kiosk 01',
          urgency: 'HIGH',
          patientUhid: currentPatient?.uhid,
        }),
      });
      setStaffHelpSent(true);
      sounds.playChime();
    } catch (e) {
      console.error('Failed to notify staff:', e);
      setStaffHelpSent(true);
    }
  };

  const handlePatientIdentified = (patient: Patient) => {
    setCurrentPatient(patient);
    setCurrentView('ROUTING');
  };

  const handleRegistrationComplete = (visit: OPDVisit) => {
    setCurrentVisit(visit);
    setCurrentView('TOKEN_PASS');
  };

  // Font size multiplier class
  const getFontSizeClass = () => {
    if (fontSize === 'huge') return 'text-lg';
    if (fontSize === 'large') return 'text-base';
    return 'text-sm';
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      highContrast 
        ? 'bg-black text-white selection:bg-yellow-400 selection:text-black' 
        : 'bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950'
    } ${getFontSizeClass()}`}>
      {/* Top Accessible Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={(lang) => {
          sounds.playClick();
          setCurrentLang(lang);
        }}
        fontSize={fontSize}
        onFontSizeChange={(size) => {
          sounds.playClick();
          setFontSize(size);
        }}
        highContrast={highContrast}
        onToggleHighContrast={() => {
          sounds.playClick();
          setHighContrast(!highContrast);
        }}
        audioMuted={audioMuted}
        onToggleAudioMute={() => {
          sounds.playClick();
          setAudioMuted(!audioMuted);
        }}
        onEmergencyClick={() => {
          sounds.playEmergency();
          setIsEmergencyOpen(true);
        }}
        onRequestStaffHelp={handleRequestStaffHelp}
      />

      {/* Hospital Careflow Perspective Switcher Bar (For testing & full system demonstration) */}
      <nav aria-label="System roles navigation" className="bg-slate-900 border-b border-slate-800 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 min-w-max">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>Role / Station:</span>
            </span>

            {/* Kiosk Touchpoint */}
            <button
              id="nav-kiosk-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('KIOSK_HOME');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                ['KIOSK_HOME', 'IDENTIFICATION', 'SCANNER', 'ROUTING', 'TOKEN_PASS'].includes(currentView)
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>OPD Kiosk</span>
            </button>

            {/* Public Queue Board */}
            <button
              id="nav-queue-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('QUEUE');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'QUEUE'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Live Queue Display</span>
            </button>

            {/* Hospital Map */}
            <button
              id="nav-map-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('MAP');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'MAP'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Hospital Map</span>
            </button>

            {/* Doctor Desk */}
            <button
              id="nav-doctor-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('DOCTOR');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'DOCTOR'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor OPD Desk</span>
            </button>

            {/* Central Lab Counter 03 */}
            <button
              id="nav-lab-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('LAB');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'LAB'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Lab Counter 03</span>
            </button>

            {/* Pharmacy Counter 01 */}
            <button
              id="nav-pharmacy-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('PHARMACY');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'PHARMACY'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Pharmacy Counter 01</span>
            </button>

            {/* Careflow Tracker */}
            <button
              id="nav-careflow-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('CAREFLOW');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'CAREFLOW'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Careflow Tracker</span>
            </button>

            {/* Staff Assistance Desk */}
            <button
              id="nav-staff-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('STAFF');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'STAFF'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Help Desk</span>
            </button>

            {/* Admin Analytics & Audit */}
            <button
              id="nav-admin-view"
              onClick={() => {
                sounds.playClick();
                setCurrentView('ADMIN');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                currentView === 'ADMIN'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>HMIS Analytics</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dynamic View Content */}
      <main className="flex-1 pb-12 pt-4">
        {currentView === 'KIOSK_HOME' && (
          <KioskHome
            currentLang={currentLang}
            onSelectAction={(action) => {
              sounds.playClick();
              const act = action.toUpperCase();
              if (act === 'SCAN_OP') setCurrentView('SCANNER');
              else if (act === 'LOOKUP_UHID' || act === 'NEW_REG' || act === 'NEW_PATIENT' || act === 'EXISTING_PATIENT') setCurrentView('IDENTIFICATION');
              else if (act === 'DEPARTMENT_GUIDE' || act === 'DOCTOR_AVAIL') setCurrentView('ROUTING');
              else if (act === 'VIEW_QUEUE' || act === 'CHECK_TOKEN' || act === 'QUEUE_BOARD') setCurrentView('QUEUE');
              else if (act === 'HOSPITAL_MAP') setCurrentView('MAP');
              else if (act === 'VOICE_ASSIST' || act === 'VOICE') setIsVoiceOpen(true);
            }}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onRequestHelp={handleRequestStaffHelp}
          />
        )}

        {currentView === 'IDENTIFICATION' && (
          <PatientIdentification
            currentLang={currentLang}
            onPatientIdentified={handlePatientIdentified}
            onBack={() => setCurrentView('KIOSK_HOME')}
          />
        )}

        {currentView === 'SCANNER' && (
          <DocumentScanner
            currentLang={currentLang}
            onScanComplete={handlePatientIdentified}
            onBack={() => setCurrentView('KIOSK_HOME')}
          />
        )}

        {currentView === 'ROUTING' && (
          <DepartmentRouting
            currentLang={currentLang}
            patient={currentPatient || undefined}
            currentPatient={currentPatient || undefined}
            preselectedDeptId={preselectedDeptId}
            onBack={() => setCurrentView(currentPatient ? 'IDENTIFICATION' : 'KIOSK_HOME')}
            onCompleteRegistration={handleRegistrationComplete}
            onNavigateToIdentification={() => setCurrentView('IDENTIFICATION')}
          />
        )}

        {currentView === 'TOKEN_PASS' && currentVisit && (
          <TokenAndPrintModal
            currentLang={currentLang}
            visit={currentVisit}
            onDone={() => setCurrentView('KIOSK_HOME')}
            onNavigateToRoom={(room) => {
              setMapDestination(room);
              setCurrentView('MAP');
            }}
            onViewQueue={(deptId) => {
              setPreselectedDeptId(deptId);
              setCurrentView('QUEUE');
            }}
          />
        )}

        {currentView === 'MAP' && (
          <HospitalMap
            currentLang={currentLang}
            initialDestination={mapDestination}
            onBack={() => setCurrentView('KIOSK_HOME')}
          />
        )}

        {currentView === 'QUEUE' && (
          <LiveQueueBoard
            currentLang={currentLang}
            selectedDeptId={preselectedDeptId}
            onBack={() => setCurrentView('KIOSK_HOME')}
          />
        )}

        {currentView === 'DOCTOR' && (
          <DoctorPortal currentLang={currentLang} />
        )}

        {currentView === 'LAB' && (
          <LabPortal currentLang={currentLang} />
        )}

        {currentView === 'PHARMACY' && (
          <PharmacyPortal currentLang={currentLang} />
        )}

        {currentView === 'CAREFLOW' && (
          <CareFlowTracker
            currentLang={currentLang}
            initialVisitId={currentVisit?.tokenDisplay || 'GM-036'}
            onBack={() => setCurrentView('KIOSK_HOME')}
          />
        )}

        {currentView === 'STAFF' && (
          <StaffDashboard currentLang={currentLang} />
        )}

        {currentView === 'ADMIN' && (
          <AdminAnalytics currentLang={currentLang} />
        )}
      </main>

      {/* Floating Multilingual Voice Assistant Trigger on Kiosk views */}
      {['KIOSK_HOME', 'IDENTIFICATION', 'ROUTING'].includes(currentView) && !isVoiceOpen && (
        <aside aria-label="Voice assistance trigger" className="fixed bottom-6 right-6 z-40">
          <button
            id="floating-btn-voice-assistant"
            onClick={() => {
              sounds.playClick();
              setIsVoiceOpen(true);
            }}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-sm shadow-2xl shadow-teal-500/40 hover:brightness-110 active:scale-95 transition-all border-2 border-white/20"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>
            <span>{t('hero_voice_prompt', currentLang)}</span>
          </button>
        </aside>
      )}

      {/* Multilingual Voice Assistant Modal */}
      {isVoiceOpen && (
        <VoiceAssistantModal
          isOpen={true}
          currentLang={currentLang}
          onClose={() => setIsVoiceOpen(false)}
          onIntentDispatched={handleVoiceIntent}
          onActionTrigger={(action, data) => {
            if (action === 'scan_op') setCurrentView('SCANNER');
            else if (action === 'department') {
              setPreselectedDeptId(data);
              setCurrentView('ROUTING');
            } else if (action === 'hospital_map') {
              setMapDestination(data?.roomNo || data || 'dept-gm');
              setCurrentView('MAP');
            } else if (action === 'queue_board') {
              setCurrentView('QUEUE');
            }
          }}
          onEmergencyTrigger={() => {
            sounds.playEmergency();
            setIsEmergencyOpen(true);
          }}
        />
      )}

      {/* Emergency Red Escalation Alert Modal */}
      {isEmergencyOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-red-600 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-widest">
                CRITICAL MEDICAL EMERGENCY / RED CODE
              </span>
              <h3 className="text-2xl font-black text-white">
                {t('emergency_modal_title', currentLang)}
              </h3>
              <p className="text-sm text-red-300">
                {t('emergency_modal_desc', currentLang)}
              </p>
            </div>

            <div className="bg-red-950/50 border border-red-900/80 rounded-2xl p-4 text-xs text-red-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-sm text-red-400">
                <PhoneCall className="w-4 h-4" />
                <span>Casualty Desk &amp; Stretcher Attendant Dispatched</span>
              </div>
              <p>
                Triage nurses and emergency staff have been alerted to Kiosk 01. Please proceed immediately to <strong>Room 001 (Ground Floor Casualty)</strong>.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="btn-confirm-casualty-route"
                onClick={() => {
                  sounds.playClick();
                  setIsEmergencyOpen(false);
                  setMapDestination('001');
                  setCurrentView('MAP');
                }}
                className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-red-600/30"
              >
                Show Route to Emergency Room 001
              </button>

              <button
                id="btn-close-emergency"
                onClick={() => {
                  sounds.playClick();
                  setIsEmergencyOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Close Emergency Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Help Modal */}
      {isStaffHelpOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-amber-600/60 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-white">Hospital Staff Assistance</h3>
              <p className="text-xs text-slate-300">
                {staffHelpSent 
                  ? 'Help request broadcast to Reception Desk & Patient Attendant.' 
                  : 'Dispatching assistance request...'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Station Attendant Notified (Kiosk 01)</span>
              </div>
              <p className="text-slate-400">
                A hospital volunteer or help desk staff will arrive at this kiosk in approximately 1-2 minutes.
              </p>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setIsStaffHelpOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:brightness-110"
            >
              OK, I Will Wait
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
