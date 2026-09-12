import React, { useEffect, useState } from 'react';
import { 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Users, 
  QrCode, 
  ArrowRight, 
  Home, 
  Share2, 
  Download,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { LanguageCode, OPDVisit, Patient } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface TokenAndPrintModalProps {
  currentLang: LanguageCode;
  visit: OPDVisit;
  onDone: () => void;
  onNavigateToRoom: (roomNo: string) => void;
  onViewQueue: (deptId: string) => void;
}

export const TokenAndPrintModal: React.FC<TokenAndPrintModalProps> = ({
  currentLang,
  visit,
  onDone,
  onNavigateToRoom,
  onViewQueue,
}) => {
  const [isPrinting, setIsPrinting] = useState(true);

  useEffect(() => {
    // Play realistic thermal receipt printer buzz
    sounds.playThermalPrint();
    const timer = setTimeout(() => {
      setIsPrinting(false);
      sounds.playChime();
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const handleBrowserPrint = () => {
    sounds.playClick();
    window.print();
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Registration Successful • Token Issued</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t('token_title', currentLang)}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Please collect your printed OPD token slip below and proceed to your consultation room.
        </p>
      </div>

      {/* Simulated Physical Thermal Receipt Paper */}
      <div className="flex justify-center">
        <div className={`w-full max-w-sm bg-amber-50/95 text-slate-900 rounded-lg shadow-2xl p-6 border border-slate-300 font-mono text-xs relative overflow-hidden transition-all duration-700 ${
          isPrinting ? 'translate-y-4 opacity-70 filter blur-[0.3px]' : 'translate-y-0 opacity-100'
        }`}>
          {/* Top Paper Serration Indicator */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-slate-400/20 to-transparent" />

          {/* Hospital Seal & Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            <p className="font-bold text-slate-800 text-[11px] leading-tight">
              தமிழ்நாடு அரசு • GOVERNMENT OF TAMIL NADU
            </p>
            <p className="font-black text-sm uppercase tracking-tight text-slate-950">
              THIRUVALLUVAR GOVT HEADQUARTERS HOSPITAL
            </p>
            <p className="text-[10px] text-slate-600">
              Outpatient Department Registration Ticket
            </p>
            <p className="text-[10px] text-slate-500">
              Date: 12-SEP-2026 | Kiosk: KIOSK-01
            </p>
          </div>

          {/* BIG TOKEN DISPLAY */}
          <div className="py-4 text-center space-y-1 border-b border-dashed border-slate-400">
            <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider block">
              YOUR TOKEN NUMBER
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 font-mono">
              {visit.tokenDisplay}
            </div>
            <div className="flex items-center justify-center space-x-3 text-[11px] pt-1">
              <span>Room: <strong>{visit.roomNo}</strong></span>
              <span>•</span>
              <span>Wait: <strong>~{visit.estimatedWaitMinutes} mins</strong></span>
            </div>
          </div>

          {/* Patient Particulars */}
          <div className="py-3 space-y-1.5 border-b border-dashed border-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Patient:</span>
              <strong className="text-slate-900">{visit.patientName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">UHID:</span>
              <span className="font-bold text-slate-900">{visit.uhid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Age / Gender:</span>
              <span>{visit.patientAge} Y / {visit.patientGender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Mobile:</span>
              <span>{visit.patientMobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Department:</span>
              <strong className="text-slate-950">{visit.departmentName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Doctor:</span>
              <span>{visit.doctorName}</span>
            </div>
          </div>

          {/* Queue Context */}
          <div className="py-3 space-y-1 border-b border-dashed border-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Now Serving:</span>
              <span className="font-bold text-emerald-800">{visit.departmentName.substring(0, 2).toUpperCase()}-036</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Patients Ahead:</span>
              <strong className="text-slate-900">{visit.queuePosition} in queue</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Consultation Fee:</span>
              <strong className="text-emerald-800 uppercase">FREE (ரூ. 0)</strong>
            </div>
          </div>

          {/* Digital QR Code & Barcode */}
          <div className="py-4 flex flex-col items-center justify-center space-y-2">
            {/* SVG Representation of QR Code */}
            <div className="w-24 h-24 bg-white p-1.5 border border-slate-400 rounded-md shadow-inner flex items-center justify-center">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
            <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">
              *{visit.visitNo}*
            </span>
          </div>

          {/* Instructions in Tamil & English */}
          <div className="pt-2 text-center text-[10px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">
              தயவுசெய்து அறை {visit.roomNo} காத்திருப்பு பகுதியில் அமரவும்.
            </p>
            <p>
              Please wait outside Room {visit.roomNo}. Watch screen or listen for announcement.
            </p>
            <p className="text-[9px] text-slate-500 pt-1">
              All medicines and lab investigations are 100% free of charge.
            </p>
          </div>

          {/* Bottom Tear Pattern */}
          <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-t from-slate-400/20 to-transparent" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          id="btn-print-token-receipt"
          onClick={handleBrowserPrint}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-600 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-teal-400" />
          <span>{t('token_print_button', currentLang)}</span>
        </button>

        <button
          id="btn-view-room-directions"
          onClick={() => {
            sounds.playClick();
            onNavigateToRoom(visit.roomNo);
          }}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 active:scale-95"
        >
          <MapPin className="w-4 h-4" />
          <span>{t('token_directions_button', currentLang)}</span>
        </button>

        <button
          id="btn-view-dept-queue"
          onClick={() => {
            sounds.playClick();
            onViewQueue(visit.departmentId);
          }}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
        >
          <Users className="w-4 h-4 text-sky-400" />
          <span>Live Queue Display</span>
        </button>

        <button
          id="btn-finish-return-home"
          onClick={() => {
            sounds.playClick();
            onDone();
          }}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all"
        >
          <Home className="w-4 h-4 text-amber-400" />
          <span>Finish &amp; Home Screen</span>
        </button>
      </div>
    </div>
  );
};
