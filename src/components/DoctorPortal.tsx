import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  User, 
  PhoneCall, 
  FlaskConical, 
  Pill, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Activity, 
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { LanguageCode, Doctor, OPDVisit, Patient, ConsultationRecord } from '../types';
import { sounds } from '../utils/audio';

interface DoctorPortalProps {
  currentLang: LanguageCode;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ currentLang }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-1');
  const [activeVisit, setActiveVisit] = useState<OPDVisit | null>(null);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [waitingVisits, setWaitingVisits] = useState<OPDVisit[]>([]);
  const [isCalling, setIsCalling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  // Clinical Consultation Form
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    pulseRate: 76,
    temperatureF: 98.4,
    spO2: 99,
  });

  // Lab Tests selected
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);

  // Prescriptions list
  const [medicines, setMedicines] = useState<Array<{
    name: string;
    dosage: string;
    duration: string;
    timing: 'BEFORE_FOOD' | 'AFTER_FOOD';
    instructions: string;
  }>>([
    {
      name: 'Tab. Metformin 500mg',
      dosage: '1 tablet twice daily',
      duration: '30 days',
      timing: 'AFTER_FOOD',
      instructions: 'Take after breakfast and dinner',
    },
  ]);

  const [followUpDate, setFollowUpDate] = useState('2026-10-12');
  const [followUpInstructions, setFollowUpInstructions] = useState('Review after 30 days with fasting blood sugar report.');

  // Pre-seeded Tamil Nadu GH Essential Drug Formulary
  const hospitalFormulary = [
    { name: 'Tab. Paracetamol 650mg', defaultDosage: '1 tab SOS for fever/pain', duration: '5 days' },
    { name: 'Tab. Metformin 500mg', defaultDosage: '1 tab BD after food', duration: '30 days' },
    { name: 'Tab. Glimepiride 1mg', defaultDosage: '1 tab OD before breakfast', duration: '30 days' },
    { name: 'Tab. Amlodipine 5mg', defaultDosage: '1 tab OD morning', duration: '30 days' },
    { name: 'Tab. Telmisartan 40mg', defaultDosage: '1 tab OD morning', duration: '30 days' },
    { name: 'Tab. Aceclofenac 100mg + Paracetamol', defaultDosage: '1 tab BD after food', duration: '5 days' },
    { name: 'Tab. Pantoprazole 40mg', defaultDosage: '1 tab OD before food', duration: '7 days' },
    { name: 'Tab. Amoxicillin 500mg', defaultDosage: '1 cap TID after food', duration: '5 days' },
    { name: 'Tab. Cetirizine 10mg', defaultDosage: '1 tab HS night', duration: '5 days' },
    { name: 'Tab. Calcium 500mg + Vit D3', defaultDosage: '1 tab OD after lunch', duration: '30 days' },
  ];

  const commonLabInvestigations = [
    'Complete Blood Count (CBC)',
    'Fasting Blood Sugar (FBS)',
    'Post Prandial Blood Sugar (PPBS)',
    'HbA1c Glycated Hemoglobin',
    'Serum Creatinine & Urea',
    'Lipid Profile',
    'Urine Routine & Microscopy',
    'X-Ray Right Knee AP/Lateral',
    'X-Ray Chest PA View',
    'ECG (12 Lead)',
  ];

  const fetchDoctorState = async () => {
    try {
      const docRes = await fetch('/api/doctors/availability');
      const docs: Doctor[] = await docRes.json();
      setDoctors(docs);

      const activeDoc = docs.find(d => d.id === selectedDoctorId) || docs[0];
      if (activeDoc) {
        const qRes = await fetch(`/api/queues/${activeDoc.departmentId}`);
        const qData = await qRes.json();
        setWaitingVisits(qData.activeVisits || []);

        // Check if there is an in-consultation visit
        const consulting = qData.activeVisits?.find((v: OPDVisit) => v.status === 'IN_CONSULTATION');
        if (consulting) {
          setActiveVisit(consulting);
          const pRes = await fetch(`/api/patients/${consulting.uhid}`);
          if (pRes.ok) setPatientData(await pRes.json());
        }
      }
    } catch (e) {
      console.error('Error fetching doctor state:', e);
    }
  };

  useEffect(() => {
    fetchDoctorState();
  }, [selectedDoctorId]);

  const activeDoc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const handleCallNext = async () => {
    setIsCalling(true);
    sounds.playChime();
    try {
      const res = await fetch('/api/queues/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: selectedDoctorId }),
      });
      const data = await res.json();
      if (data.calledVisit) {
        setActiveVisit(data.calledVisit);
        // Prepopulate clinical form
        setChiefComplaints('Follow-up review for chronic glycemic control & bilateral knee soreness.');
        setDiagnosis('Type 2 Diabetes Mellitus (Uncomplicated) with Mild Knee Osteoarthritis');
        setClinicalNotes('Patient alert, conscious. Ambulant without support. Heart sounds S1, S2 heard. Chest clear.');
        // Fetch patient
        const pRes = await fetch(`/api/patients/${data.calledVisit.uhid}`);
        if (pRes.ok) setPatientData(await pRes.json());
      }
      fetchDoctorState();
    } catch (err) {
      console.error('Call next error:', err);
    } finally {
      setIsCalling(false);
    }
  };

  const handleAddMedicine = (formularyItem: any) => {
    sounds.playClick();
    if (!formularyItem || !formularyItem.name) return;
    setMedicines([
      ...medicines,
      {
        name: formularyItem.name,
        dosage: formularyItem.defaultDosage || '1 tablet',
        duration: formularyItem.duration || '5 days',
        timing: 'AFTER_FOOD',
        instructions: 'Take with warm water',
      },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    sounds.playClick();
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleToggleLab = (test: string) => {
    sounds.playClick();
    if (selectedLabTests.includes(test)) {
      setSelectedLabTests(selectedLabTests.filter(t => t !== test));
    } else {
      setSelectedLabTests([...selectedLabTests, test]);
    }
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;
    setIsSubmitting(true);
    sounds.playClick();

    try {
      const payload = {
        visitId: activeVisit.id,
        consultationData: {
          chiefComplaints,
          clinicalNotes,
          diagnosis,
          vitals,
          labTests: selectedLabTests,
          medicines,
          followUpDate,
          followUpInstructions,
        },
      };

      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        sounds.playChime();
        setCompletedSuccess(true);
        setTimeout(() => {
          setCompletedSuccess(false);
          setActiveVisit(null);
          setPatientData(null);
          fetchDoctorState();
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to complete consultation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Doctor Selector Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">OPD Doctor Clinical Workstation</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Room {activeDoc?.roomNo}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Government Hospital Consultation &amp; E-Prescription Desk
            </p>
          </div>
        </div>

        {/* Doctor Switcher & Call Next Action */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            id="select-active-doctor"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.departmentName} - Room {d.roomNo})
              </option>
            ))}
          </select>

          <button
            id="btn-call-next-patient"
            disabled={isCalling || !!activeVisit}
            onClick={handleCallNext}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Next Patient</span>
          </button>
        </div>
      </div>

      {completedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center space-x-3 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong>Consultation Saved &amp; Orders Dispatched!</strong>
            <p className="text-xs text-emerald-400/90">
              Lab investigations routed to Counter 03. Prescriptions routed to Pharmacy Counter 01.
            </p>
          </div>
        </div>
      )}

      {/* Main Consultation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Patient Demographic & Clinical Profile */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Patient Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Current In-Consultation:
              </span>
              {activeVisit ? (
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500 text-slate-950 text-xs font-mono font-bold">
                  {activeVisit.tokenDisplay}
                </span>
              ) : (
                <span className="text-xs text-slate-500 italic">No patient called</span>
              )}
            </div>

            {activeVisit ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeVisit.patientName}
                  </h3>
                  <p className="font-mono text-xs text-teal-400 font-semibold">
                    UHID: {activeVisit.uhid}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div>Age/Sex: <strong>{activeVisit.patientAge} / {activeVisit.patientGender}</strong></div>
                  <div>Mobile: <strong>{activeVisit.patientMobile}</strong></div>
                  <div>Priority: <strong className="text-amber-400">{activeVisit.priority}</strong></div>
                  <div>Source: <strong>{activeVisit.registrationSource}</strong></div>
                </div>

                {patientData && (
                  <div className="space-y-1 text-xs text-slate-400">
                    <p>Address: {patientData.address}</p>
                    {patientData.bloodGroup && <p>Blood Group: <strong className="text-rose-400">{patientData.bloodGroup}</strong></p>}
                    {patientData.lastDepartment && (
                      <p>Prior Visit: {patientData.lastDepartment} ({patientData.lastVisitDate})</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <User className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-sm">Doctor Desk is Ready</p>
                <p className="text-xs text-slate-500">
                  Click &ldquo;Call Next Patient&rdquo; above to call the next token in queue.
                </p>
              </div>
            )}
          </div>

          {/* Waiting Queue List */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Corridor Waiting Queue ({waitingVisits.filter(v => v.status === 'WAITING').length}):
              </span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {waitingVisits
                .filter(v => v.status === 'WAITING')
                .map((v) => (
                  <div
                    key={v.id}
                    className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-white font-mono">{v.tokenDisplay}</strong>
                      <span className="text-slate-400 ml-2">{v.patientName}</span>
                    </div>
                    <span className="text-slate-500 text-[10px]">{v.patientAge}y/{v.patientGender[0]}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Examination, Diagnosis & Orders */}
        <div className="lg:col-span-8 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
          <form onSubmit={handleCompleteConsultation} className="space-y-6">
            {/* Vitals Ribbon */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Patient Vitals:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={vitals.bloodPressure}
                    onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={vitals.pulseRate}
                    onChange={(e) => setVitals({ ...vitals, pulseRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperatureF}
                    onChange={(e) => setVitals({ ...vitals, temperatureF: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={vitals.spO2}
                    onChange={(e) => setVitals({ ...vitals, spO2: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Complaints & Diagnosis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Chief Complaints *
                </label>
                <textarea
                  required
                  rows={3}
                  value={chiefComplaints}
                  onChange={(e) => setChiefComplaints(e.target.value)}
                  placeholder="e.g. Fever x 3 days, body ache, bilateral knee joint pain..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Clinical Diagnosis *
                </label>
                <textarea
                  required
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes Mellitus / Acute Viral Upper Respiratory Infection..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Clinical Examination &amp; Notes
                </label>
                <input
                  type="text"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Examination findings, systemic examination..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Lab Investigations Ordering Checklist */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <FlaskConical className="w-4 h-4 text-sky-400" />
                  <span>Order Diagnostic Lab Investigations (Counter 03):</span>
                </div>
                <span className="text-[11px] text-teal-400">
                  {selectedLabTests.length} tests selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {commonLabInvestigations.map((test) => {
                  const isChecked = selectedLabTests.includes(test);
                  return (
                    <button
                      type="button"
                      key={test}
                      onClick={() => handleToggleLab(test)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        isChecked
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {test}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* E-Prescriptions Builder (Free Government Formulary) */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <Pill className="w-4 h-4 text-emerald-400" />
                  <span>Tamil Nadu Free Generic Medicines (Pharmacy Counter 01):</span>
                </div>
              </div>

              {/* Quick Formulary Chips to Add */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {hospitalFormulary.map((f, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleAddMedicine(f)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>

              {/* Prescribed Items Table */}
              <div className="space-y-2">
                {medicines.map((med, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 items-center text-xs"
                  >
                    <div className="sm:col-span-4 font-bold text-white">
                      {med.name}
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[idx].dosage = e.target.value;
                          setMedicines(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[idx].duration = e.target.value;
                          setMedicines(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={med.timing}
                        onChange={(e) => {
                          const updated = [...medicines];
                          updated[idx].timing = e.target.value as any;
                          setMedicines(updated);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs"
                      >
                        <option value="AFTER_FOOD">After Food</option>
                        <option value="BEFORE_FOOD">Before Food</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Follow-up Review Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Follow-up Instructions</label>
                <input
                  type="text"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            {/* Submit Consultation */}
            <button
              id="btn-complete-consultation"
              type="submit"
              disabled={isSubmitting || !activeVisit}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Consultation &amp; Dispatch Orders to Lab &amp; Pharmacy</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
