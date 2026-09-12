import React, { useState } from 'react';
import { 
  UserPlus, 
  UserCheck, 
  ScanLine, 
  QrCode, 
  Ticket, 
  Users, 
  Stethoscope, 
  Mic, 
  Map, 
  HelpCircle, 
  Flame,
  ArrowRight,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { LanguageCode, Department } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface KioskHomeProps {
  currentLang: LanguageCode;
  onSelectAction: (action: string) => void;
  onSelectSymptom: (symptom: string) => void;
  departments: Department[];
  servingTokenGeneralMedicine: string;
  servingTokenOrtho: string;
}

export const KioskHome: React.FC<KioskHomeProps> = ({
  currentLang,
  onSelectAction,
  onSelectSymptom,
  departments,
  servingTokenGeneralMedicine,
  servingTokenOrtho,
}) => {
  const [searchSymptom, setSearchSymptom] = useState('');

  const quickSymptoms = [
    { label: 'Fever & Cold', labelTa: 'காய்ச்சல் & சளி', labelTe: 'జ్వరం & జలుబు', labelHi: 'बुखार एवं सर्दी', icon: '🌡️', query: 'fever' },
    { label: 'Knee & Joint Pain', labelTa: 'முழங்கால் & மூட்டு வலி', labelTe: 'మోకాలి & కీళ్ల నొప్పులు', labelHi: 'घुटने का दर्द', icon: '🦵', query: 'knee pain' },
    { label: 'Child Health', labelTa: 'குழந்தை நலன்', labelTe: 'చిన్నారుల ఆరోగ్యం', labelHi: 'शिशु स्वास्थ्य', icon: '👶', query: 'child fever' },
    { label: 'Eye Redness / Vision', labelTa: 'கண் பார்வை / சிவத்தல்', labelTe: 'కంటి సమస్యలు / ఎరుపు', labelHi: 'आँख की समस्या', icon: '👁️', query: 'eye redness' },
    { label: 'Skin Rash & Itching', labelTa: 'தோல் அரிப்பு / தடிப்பு', labelTe: 'చర్మ దద్దుర్లు & దురద', labelHi: 'त्वचा रोग', icon: '✨', query: 'skin rash' },
    { label: 'Ear / Throat Pain', labelTa: 'காது / தொண்டை வலி', labelTe: 'చెవి / గొంతు నొప్పి', labelHi: 'कान / गला दर्द', icon: '👂', query: 'ear pain' },
  ];

  const handleAction = (id: string) => {
    sounds.playClick();
    onSelectAction(id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Live OPD Status Ticker */}
      <div className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center space-x-2 text-teal-400 font-semibold">
          <Clock className="w-4 h-4 animate-spin" />
          <span>LIVE OPD QUEUE STATUS:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
          <span className="bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
            General Medicine (Rm 102): <strong className="text-teal-400 font-mono text-base">{servingTokenGeneralMedicine}</strong>
          </span>
          <span className="bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-700">
            Orthopaedics (Rm 204): <strong className="text-emerald-400 font-mono text-base">{servingTokenOrtho}</strong>
          </span>
          <span className="text-slate-400 hidden lg:inline">
            • OPD Registrations & generic drugs are 100% free under Govt of Tamil Nadu.
          </span>
        </div>
      </div>

      {/* Hero Welcome & Voice Assistant Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900/60 via-slate-900 to-indigo-950/60 border border-teal-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Touch & Voice Front Door</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {t('welcome_greeting', currentLang)}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              {t('welcome_subtitle', currentLang)}
            </p>
          </div>

          {/* Big Voice Assistant Button */}
          <button
            id="btn-kiosk-voice-assistant"
            onClick={() => handleAction('voice')}
            className="group relative flex items-center space-x-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-base sm:text-lg shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-slate-950/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-slate-950" />
            </div>
            <div className="text-left leading-tight">
              <span className="block font-black tracking-wide">{t('action_voice_assist', currentLang)}</span>
              <span className="text-xs font-semibold text-slate-900/80">Speak in தமிழ் / తెలుగు / English</span>
            </div>
          </button>
        </div>
      </div>

      {/* Primary Workflow Tiles Grid (Touchscreen Kiosk Archetype) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. New Patient Registration */}
        <button
          id="btn-kiosk-new-patient"
          onClick={() => handleAction('new_patient')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-teal-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
            <UserPlus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
            {t('action_new_patient', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_new_patient_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
            <span>Register Now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 2. Existing Patient (UHID / Mobile / ABHA) */}
        <button
          id="btn-kiosk-existing-patient"
          onClick={() => handleAction('existing_patient')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-sky-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
            {t('action_existing_patient', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_existing_patient_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Lookup Patient</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 3. Scan Old OP Sheet (OCR Super Feature) */}
        <button
          id="btn-kiosk-scan-op"
          onClick={() => handleAction('scan_op')}
          className="group relative flex flex-col text-left p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-800/90 border-2 border-indigo-500/50 hover:border-indigo-400 hover:bg-slate-800 transition-all shadow-lg active:scale-98"
        >
          <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
            AI Scanner
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-slate-950 transition-all">
            <ScanLine className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
            {t('action_scan_op', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_scan_op_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Open Scanner</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 4. Check Token & Waiting Time */}
        <button
          id="btn-kiosk-check-token"
          onClick={() => handleAction('check_token')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-amber-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
            {t('action_check_token', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_check_token_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Track Queue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 5. Doctor Availability */}
        <button
          id="btn-kiosk-doctor-avail"
          onClick={() => handleAction('doctor_avail')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-emerald-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
            {t('action_doctor_avail', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_doctor_avail_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>View Doctors</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 6. Hospital Navigation & Map */}
        <button
          id="btn-kiosk-hospital-map"
          onClick={() => handleAction('hospital_map')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-purple-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-slate-950 transition-all">
            <Map className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
            {t('action_hospital_map', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_hospital_map_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Find Room Route</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 7. Public Queue Display Board */}
        <button
          id="btn-kiosk-public-queue"
          onClick={() => handleAction('queue_board')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-cyan-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
            {t('queue_title', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            Live waiting tokens across all 10 hospital departments.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
            <span>Full Queue Board</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>

        {/* 8. Staff Help & Identity Assistance */}
        <button
          id="btn-kiosk-staff-help"
          onClick={() => handleAction('staff_help')}
          className="group flex flex-col text-left p-6 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 hover:border-rose-500 hover:bg-slate-800 transition-all shadow-md active:scale-98"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-slate-950 transition-all">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
            {t('action_staff_help', currentLang)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex-1">
            {t('action_staff_help_desc', currentLang)}
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
            <span>Call Attendant</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </button>
      </div>

      {/* Smart Administrative Routing / Quick Symptoms Section */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>{t('routing_title', currentLang)}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {t('routing_subtitle', currentLang)}
            </p>
          </div>
          <span className="text-[11px] font-medium text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>{t('routing_safety_disclaimer', currentLang)}</span>
          </span>
        </div>

        {/* Quick Symptom Chips */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {quickSymptoms.map((s, idx) => (
            <button
              key={idx}
              id={`btn-symptom-${idx}`}
              onClick={() => {
                sounds.playClick();
                onSelectSymptom(s.query);
              }}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-teal-500 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-medium transition-all active:scale-95"
            >
              <span>{s.icon}</span>
              <span>{currentLang === 'ta' ? s.labelTa : currentLang === 'te' ? s.labelTe : currentLang === 'hi' ? s.labelHi : s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
