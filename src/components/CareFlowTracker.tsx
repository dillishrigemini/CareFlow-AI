import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Search, 
  User, 
  Calendar, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  QrCode, 
  Printer, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { LanguageCode, OPDVisit, Patient, ConsultationRecord, LabOrder, PharmacyOrder } from '../types';
import { sounds } from '../utils/audio';

interface CareFlowTrackerProps {
  currentLang: LanguageCode;
  initialVisitId?: string;
  onBack?: () => void;
}

export const CareFlowTracker: React.FC<CareFlowTrackerProps> = ({
  currentLang,
  initialVisitId,
  onBack,
}) => {
  const [searchToken, setSearchToken] = useState(initialVisitId || 'GM-036');
  const [careflowData, setCareflowData] = useState<{
    visit?: OPDVisit;
    patient?: Patient;
    consultation?: ConsultationRecord;
    labOrder?: LabOrder;
    pharmacyOrder?: PharmacyOrder;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCareflow = async (query = searchToken) => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      // Find visit by token or ID
      const tRes = await fetch(`/api/tokens/${encodeURIComponent(query.trim())}`);
      if (tRes.ok) {
        const visit: OPDVisit = await tRes.json();
        const flowRes = await fetch(`/api/careflow/${visit.id}`);
        if (flowRes.ok) {
          const flow = await flowRes.json();
          setCareflowData(flow);
        }
      }
    } catch (err) {
      console.error('Careflow fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareflow();
  }, [initialVisitId]);

  const steps = [
    {
      id: 'kiosk',
      label: 'Kiosk Arrival',
      desc: 'Self-service touchpoint check-in',
      done: true,
      icon: User,
    },
    {
      id: 'identity',
      label: 'Identity & OCR',
      desc: 'UHID / OP Slip Verified',
      done: true,
      icon: ShieldCheck,
    },
    {
      id: 'token',
      label: 'OPD Token Generated',
      desc: careflowData?.visit ? `${careflowData.visit.tokenDisplay} (Room ${careflowData.visit.roomNo})` : 'Queue assigned',
      done: true,
      icon: Clock,
    },
    {
      id: 'consult',
      label: 'Doctor Consultation',
      desc: careflowData?.consultation ? `${careflowData.consultation.doctorName} (Completed)` : 'Waiting for call',
      done: !!careflowData?.consultation,
      icon: Stethoscope,
    },
    {
      id: 'lab',
      label: 'Investigation / Lab',
      desc: careflowData?.labOrder ? `${careflowData.labOrder.testName} (${careflowData.labOrder.status})` : 'Not required or done',
      done: careflowData?.labOrder?.status === 'READY',
      icon: FlaskConical,
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy Dispensing',
      desc: careflowData?.pharmacyOrder ? `${careflowData.pharmacyOrder.pharmacyToken} (${careflowData.pharmacyOrder.status})` : 'No medicines',
      done: careflowData?.pharmacyOrder?.status === 'DISPENSED',
      icon: Pill,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Token Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-teal-400" />
            <span>End-to-End Hospital Careflow Journey</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time patient progression from kiosk arrival to medicine dispensing
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCareflow()}
              placeholder="Search Token (GM-036) or UHID..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono"
            />
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              fetchCareflow();
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:brightness-110"
          >
            Track
          </button>
        </div>
      </div>

      {careflowData?.visit ? (
        <div className="space-y-6">
          {/* Patient Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 font-mono font-black text-xl flex items-center justify-center border border-teal-500/30">
                {careflowData.visit.tokenDisplay}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {careflowData.visit.patientName}
                </h3>
                <p className="text-xs font-mono text-teal-400">
                  UHID: {careflowData.visit.uhid} • Visit: {careflowData.visit.visitNo}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dept: <strong>{careflowData.visit.departmentName}</strong> • Doctor: <strong>{careflowData.visit.doctorName}</strong> (Room {careflowData.visit.roomNo})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                careflowData.visit.status === 'COMPLETED'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-teal-950 text-teal-300 border border-teal-800 animate-pulse'
              }`}>
                Current Stage: {careflowData.visit.status}
              </span>
              <button
                onClick={() => {
                  sounds.playClick();
                  window.print();
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Print Health Card"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-6">
              Careflow Milestones &amp; Journey Status:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      step.done
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                        : 'bg-slate-900 text-slate-500 border border-slate-700'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className={`text-xs font-bold ${step.done ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Tabs / Card: Clinical Notes, Lab Results & Prescriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consultation Summary */}
            {careflowData.consultation && (
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                    <span>Clinical Consultation Record</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    {new Date(careflowData.consultation.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 block">Diagnosis:</span>
                    <strong className="text-teal-300 text-sm">{careflowData.consultation.diagnosis}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Chief Complaints:</span>
                    <p>{careflowData.consultation.chiefComplaints}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Clinical Examination:</span>
                    <p>{careflowData.consultation.clinicalNotes}</p>
                  </div>
                  {careflowData.consultation.followUpDate && (
                    <div className="pt-2 text-amber-300 font-semibold">
                      Follow-up scheduled: {careflowData.consultation.followUpDate} ({careflowData.consultation.followUpInstructions})
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prescriptions & Lab Summary */}
            <div className="space-y-4">
              {careflowData.pharmacyOrder && (
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                      <Pill className="w-4 h-4 text-emerald-400" />
                      <span>Dispensed Generic Medicines</span>
                    </h4>
                    <span className="text-xs text-emerald-400 font-bold">100% Free</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {careflowData.pharmacyOrder.medicines.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-200 bg-slate-900/60 p-2 rounded-lg">
                        <span><strong>{m.name}</strong> ({m.dosage})</span>
                        <span className="text-slate-400">{m.timing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {careflowData.labOrder && (
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                      <FlaskConical className="w-4 h-4 text-sky-400" />
                      <span>Diagnostic Lab Results</span>
                    </h4>
                    <span className="text-xs text-sky-400 font-mono font-bold">
                      {careflowData.labOrder.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Tests: <strong>{careflowData.labOrder.testName}</strong>
                  </p>

                  {careflowData.labOrder.results && (
                    <div className="space-y-1 text-xs">
                      {careflowData.labOrder.results.map((r, i) => (
                        <div key={i} className="flex justify-between bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-300">{r.parameter}:</span>
                          <strong className="text-white font-mono">{r.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Activity className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">Enter a Token Number or UHID above</p>
          <p className="text-xs text-slate-500">
            For example: GM-036 or TN-GH-2026-00412
          </p>
        </div>
      )}
    </div>
  );
};
