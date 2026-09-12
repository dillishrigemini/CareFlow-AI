import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  Clock, 
  MapPin, 
  Check, 
  AlertCircle, 
  Info,
  ArrowRight,
  Search,
  User,
  ShieldCheck
} from 'lucide-react';
import { LanguageCode, Department, Doctor, Patient, OPDVisit } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface DepartmentRoutingProps {
  currentLang: LanguageCode;
  patient?: Patient;
  currentPatient?: Patient;
  preselectedSymptom?: string;
  preselectedDeptId?: string;
  onConfirmRegistration?: (departmentId: string, doctorId?: string) => void;
  onCompleteRegistration?: (visit: OPDVisit) => void;
  onNavigateToIdentification?: () => void;
  onBack: () => void;
}

export const DepartmentRouting: React.FC<DepartmentRoutingProps> = ({
  currentLang,
  patient,
  currentPatient,
  preselectedSymptom,
  preselectedDeptId,
  onConfirmRegistration,
  onCompleteRegistration,
  onNavigateToIdentification,
  onBack,
}) => {
  const effectivePatient = patient || currentPatient || null;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(preselectedDeptId || 'dept-gm');
  const [symptomInput, setSymptomInput] = useState(preselectedSymptom || '');
  const [routingRationale, setRoutingRationale] = useState<string>('');
  const [suggestedDeptId, setSuggestedDeptId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch departments and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          fetch('/api/opd/departments'),
          fetch('/api/doctors/availability'),
        ]);
        const deptData = await deptRes.json();
        const docData = await docRes.json();
        setDepartments(deptData);
        setDoctors(docData);
      } catch (e) {
        console.error('Failed to fetch OPD departments:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle symptom routing analysis
  useEffect(() => {
    if (symptomInput.trim() && departments.length > 0) {
      const lower = symptomInput.toLowerCase();
      let matched: Department | null = null;

      for (const d of departments) {
        for (const s of d.symptoms) {
          if (lower.includes(s.toLowerCase())) {
            matched = d;
            break;
          }
        }
        if (matched) break;
      }

      if (matched) {
        setSuggestedDeptId(matched.id);
        setSelectedDeptId(matched.id);
        setRoutingRationale(`Matched symptoms with hospital administrative protocol for ${matched.nameEn}.`);
      } else {
        setSuggestedDeptId('dept-gm');
        setRoutingRationale('General triage assessment directed to General Medicine consultation.');
      }
    }
  }, [symptomInput, departments]);

  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const deptDoctors = doctors.filter(d => d.departmentId === selectedDeptId);

  const handleRegister = async () => {
    sounds.playClick();

    if (!effectivePatient) {
      if (onNavigateToIdentification) {
        onNavigateToIdentification();
      }
      return;
    }

    if (onConfirmRegistration) {
      onConfirmRegistration(selectedDeptId, deptDoctors[0]?.id);
      return;
    }

    if (onCompleteRegistration) {
      try {
        setIsSubmitting(true);
        const res = await fetch('/api/opd/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: effectivePatient.id,
            departmentId: selectedDeptId,
            doctorId: deptDoctors[0]?.id,
            priority: 'NORMAL',
            source: 'KIOSK',
            kioskId: 'KIOSK-01',
          }),
        });

        if (res.ok) {
          const visit = await res.json();
          sounds.playChime();
          onCompleteRegistration(visit);
        }
      } catch (e) {
        console.error('Registration failed:', e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Patient Mini Banner */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            {effectivePatient ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Registering OPD Visit for:</span>
                  <strong className="text-white text-sm sm:text-base">{effectivePatient.name}</strong>
                  {effectivePatient.nameTa && <span className="text-teal-400 text-xs">({effectivePatient.nameTa})</span>}
                </div>
                <p className="text-xs font-mono text-teal-400">
                  UHID: {effectivePatient.uhid} • Age: {effectivePatient.age} / {effectivePatient.gender} • Mob: {effectivePatient.mobile}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <strong className="text-white text-sm sm:text-base">Hospital Department Directory &amp; Specialist Availability</strong>
                </div>
                <p className="text-xs text-slate-400">
                  Select a department to check queue and doctor availability, or register to print token
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!effectivePatient && onNavigateToIdentification && (
            <button
              id="btn-goto-patient-checkin"
              onClick={() => {
                sounds.playClick();
                onNavigateToIdentification();
              }}
              className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 text-xs font-bold hover:brightness-110"
            >
              Patient Check-In
            </button>
          )}
          <button
            id="btn-back-routing"
            onClick={() => {
              sounds.playClick();
              onBack();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
          >
            {t('btn_back', currentLang)}
          </button>
        </div>
      </div>

      {/* AI Administrative Symptom Routing Assistant */}
      <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-white text-base">
              {t('routing_title', currentLang)}
            </h3>
          </div>
          <span className="text-[11px] bg-slate-900/80 px-2.5 py-1 rounded-full text-slate-400 border border-slate-700">
            Administrative direction • Not clinical diagnosis
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-symptom-routing"
            type="text"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="Describe complaints (e.g. fever for 3 days, right knee swelling, eye watering)..."
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        {routingRationale && (
          <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/40 text-xs text-teal-200 flex items-center justify-between">
            <span>{routingRationale}</span>
            {suggestedDeptId && (
              <span className="font-bold text-teal-400 shrink-0 ml-2">
                Recommended: {departments.find(d => d.id === suggestedDeptId)?.nameEn}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Department Cards & Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Department Grid */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              {t('routing_select_dept', currentLang)} ({departments.length}):
            </h3>
            <span className="text-xs text-slate-400">Touch to select department</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {departments.map((dept) => {
              const isSelected = selectedDeptId === dept.id;
              const isRecommended = suggestedDeptId === dept.id;
              return (
                <div
                  key={dept.id}
                  id={`card-dept-${dept.id}`}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedDeptId(dept.id);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                    isSelected
                      ? 'bg-teal-950/30 border-teal-500 shadow-md shadow-teal-500/10'
                      : 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-teal-500 text-slate-950 font-bold uppercase tracking-wider">
                      Suggested
                    </span>
                  )}
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {dept.nameEn}
                      </h4>
                      {dept.nameTa && (
                        <p className="text-xs text-teal-400 font-medium">
                          {dept.nameTa}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                    <div className="flex items-center space-x-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{dept.roomNo} ({dept.floor})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{dept.currentWaitTimeMinutes}m wait</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Common: {dept.symptoms.slice(0, 3).join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Department Summary & Doctor Details */}
        <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-5 sticky top-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Selected Consultation:
            </span>
            <h3 className="text-xl font-extrabold text-white">
              {selectedDept?.nameEn}
            </h3>
            <p className="text-xs text-slate-400">
              Location: <strong>{selectedDept?.roomNo} ({selectedDept?.floor})</strong>
            </p>
          </div>

          {/* Doctor On Duty Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span>Doctor on Duty:</span>
            </div>

            {deptDoctors.length > 0 ? (
              deptDoctors.map((doc) => (
                <div key={doc.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.qualification}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      AVAILABLE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-950 p-2 rounded-lg text-center">
                      <span className="text-slate-400 block text-[10px]">Serving Token:</span>
                      <strong className="text-teal-400 font-mono text-base">{doc.currentToken || 0}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg text-center">
                      <span className="text-slate-400 block text-[10px]">In Waiting:</span>
                      <strong className="text-amber-400 font-mono text-base">{doc.patientsWaiting}</strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">
                General duty physician assigned automatically upon registration.
              </p>
            )}
          </div>

          {/* Zero Cost Notice */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center space-x-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Free Consultation, Investigation &amp; Medicine (Govt. of Tamil Nadu)</span>
          </div>

          {/* Register Action Button */}
          <button
            id="btn-confirm-opd-registration"
            disabled={isSubmitting}
            onClick={handleRegister}
            className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? 'Processing Token...'
                : effectivePatient
                ? 'Register & Print Token Slip'
                : 'Check-In Patient & Print Token Slip'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
