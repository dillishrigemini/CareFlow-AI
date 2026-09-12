import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  CornerDownRight, 
  ArrowRight, 
  Footprints, 
  Clock, 
  Accessibility, 
  Eye, 
  Layers,
  Sparkles,
  Building2
} from 'lucide-react';
import { LanguageCode, NavigationRoute } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface HospitalMapProps {
  currentLang: LanguageCode;
  initialDestination?: string;
  onBack: () => void;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  currentLang,
  initialDestination = 'dept-gm',
  onBack,
}) => {
  const [selectedDest, setSelectedDest] = useState(initialDestination);
  const [activeFloor, setActiveFloor] = useState<'GROUND' | 'FIRST' | 'SECOND'>('GROUND');
  const [wheelchairAccess, setWheelchairAccess] = useState(false);

  const destinations = [
    { id: 'dept-gm', label: 'Room 102: General Medicine', floor: 'GROUND', room: '102', walkingMins: 1.5 },
    { id: 'dept-ortho', label: 'Room 204: Orthopaedics', floor: 'FIRST', room: '204', walkingMins: 2.5 },
    { id: 'dept-paed', label: 'Room 108: Paediatrics', floor: 'GROUND', room: '108', walkingMins: 1.8 },
    { id: 'dept-og', label: 'Room 115: Obstetrics & Gynae', floor: 'GROUND', room: '115', walkingMins: 2.0 },
    { id: 'dept-eye', label: 'Room 210: Ophthalmology (Eye)', floor: 'FIRST', room: '210', walkingMins: 2.8 },
    { id: 'dept-ent', label: 'Room 212: ENT Clinic', floor: 'FIRST', room: '212', walkingMins: 2.6 },
    { id: 'Counter 01 (Outpatient Pharmacy)', label: 'Counter 01: Free Pharmacy', floor: 'GROUND', room: '110', walkingMins: 1.0 },
    { id: 'Counter 03 (Central Lab)', label: 'Counter 03: Central Blood Lab', floor: 'FIRST', room: '201', walkingMins: 2.2 },
    { id: 'Casualty / Emergency (Room 001)', label: 'Room 001: Emergency / Casualty', floor: 'GROUND', room: '001', walkingMins: 0.8 },
  ];

  const currentDestObj = destinations.find(d => d.id === selectedDest || d.room === selectedDest) || destinations[0];

  // Simulated route steps based on destination
  const getRouteSteps = () => {
    if (currentDestObj.floor === 'FIRST') {
      return [
        {
          instruction: 'From Kiosk 01, proceed straight along the Main Entrance Corridor.',
          instructionTa: 'கியோஸ்க் 01-லிருந்து பிரதான நுழைவு நடைபாதையில் நேராக செல்லவும்.',
          instructionTe: 'కియోస్క్ 01 నుండి ప్రధాన ప్రవేశ కారిడార్‌లో నేరుగా ముందుకు వెళ్ళండి.',
          instructionHi: 'कियोस्क 01 से मुख्य प्रवेश गलियारे में सीधे चलें।',
          distance: '25 meters',
          landmark: 'Pass Help Desk & OPD Counters on your right',
        },
        {
          instruction: wheelchairAccess ? 'Take Lift A (Elevator) to 1st Floor.' : 'Take Staircase 1 or Lift A to the 1st Floor.',
          instructionTa: wheelchairAccess ? 'லிப்ட் A (மின்தூக்கி) வழியாக 1-வது தளத்திற்கு செல்லவும்.' : 'படிக்கட்டு 1 அல்லது லிப்ட் A வழியாக முதல் தளத்திற்கு செல்லவும்.',
          instructionTe: wheelchairAccess ? 'లిఫ్ట్ A ద్వారా 1వ అంతస్తుకు వెళ్ళండి.' : 'మెట్లు 1 లేదా లిఫ్ట్ A ద్వారా 1వ అంతస్తుకు వెళ్ళండి.',
          instructionHi: 'लिफ्ट A या सीढ़ी 1 से पहली मंजिल पर जाएं।',
          distance: '15 meters',
          landmark: 'Near Central Atrium',
        },
        {
          instruction: `Turn right on the 1st Floor corridor; ${currentDestObj.label} will be on your left.`,
          instructionTa: `1-வது தள நடைபாதையில் வலதுபுறம் திரும்பவும்; ${currentDestObj.label} இடதுபுறம் அமைந்துள்ளது.`,
          instructionTe: `1వ అంతస్తు కారిడార్‌లో కుడివైపు తిరగండి; ${currentDestObj.label} మీ ఎడమవైపు ఉంటుంది.`,
          instructionHi: `पहली मंजिल के गलियारे में दाएं मुड़ें; यह आपके बाईं ओर होगा।`,
          distance: '20 meters',
          landmark: `Watch for signage for Room ${currentDestObj.room}`,
        },
      ];
    }

    return [
      {
        instruction: 'Start from Kiosk 01 at the Main OPD Entrance.',
        instructionTa: 'பிரதான OPD நுழைவாயிலில் உள்ள கியோஸ்க் 01-லிருந்து தொடங்கவும்.',
        instructionTe: 'ప్రధాన OPD ప్రవేశ ద్వారం వద్ద ఉన్న కియోస్క్ 01 నుండి ప్రారంభించండి.',
        instructionHi: 'मुख्य OPD प्रवेश द्वार पर कियोस्क 01 से शुरू करें।',
        distance: '10 meters',
        landmark: 'Main Lobby',
      },
      {
        instruction: currentDestObj.room === '001' ? 'Turn immediately left towards the Red Emergency corridor.' : 'Walk straight down Central Corridor past the registration help desk.',
        instructionTa: currentDestObj.room === '001' ? 'இடதுபுறம் திரும்பி அவசர சிகிச்சை பிரிவுக்கு (Casualty) செல்லவும்.' : 'மத்திய நடைபாதையில் நேராக செல்லவும்.',
        instructionTe: currentDestObj.room === '001' ? 'ఎడమవైపు తిరిగి రెడ్ ఎమర్జెన్సీ కారిడార్ వైపు వెళ్ళండి.' : 'రిజిస్ట్రేషన్ హెల్ప్ డెస్క్ దాటి సెంట్రల్ కారిడార్‌లో నేరుగా వెళ్ళండి.',
        instructionHi: 'सीधे केंद्रीय गलियारे में चलें।',
        distance: '30 meters',
        landmark: 'Green directional floor strip',
      },
      {
        instruction: `Arrive at ${currentDestObj.label}.`,
        instructionTa: `${currentDestObj.label}-ஐ அடைவீர்கள். காத்திருப்பு நாற்காலியில் அமரவும்.`,
        instructionTe: `${currentDestObj.label} వద్దకు చేరుకుంటారు. వేచి ఉండే కుర్చీలలో కూర్చోండి.`,
        instructionHi: `अपने गंतव्य पर पहुंचें।`,
        distance: '15 meters',
        landmark: `Room ${currentDestObj.room} entrance`,
      },
    ];
  };

  const steps = getRouteSteps();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <Navigation className="w-6 h-6 text-teal-400" />
            <span>{t('nav_title', currentLang)}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Wayfinding instructions and interactive floorplan from Kiosk 01
          </p>
        </div>
        <button
          id="btn-back-map"
          onClick={() => {
            sounds.playClick();
            onBack();
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
        >
          {t('btn_back', currentLang)}
        </button>
      </div>

      {/* Destination Selector & Floor Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        <div className="flex-1 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Choose Destination Room or Counter:
          </label>
          <select
            id="select-map-destination"
            value={selectedDest}
            onChange={(e) => {
              sounds.playClick();
              setSelectedDest(e.target.value);
              const target = destinations.find(d => d.id === e.target.value);
              if (target) setActiveFloor(target.floor as any);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white text-sm font-medium focus:outline-none focus:border-teal-500"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.floor} Floor)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Floor selector */}
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-700">
            <button
              id="tab-floor-ground"
              onClick={() => {
                sounds.playClick();
                setActiveFloor('GROUND');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFloor === 'GROUND' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              Ground Floor
            </button>
            <button
              id="tab-floor-first"
              onClick={() => {
                sounds.playClick();
                setActiveFloor('FIRST');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFloor === 'FIRST' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              1st Floor
            </button>
            <button
              id="tab-floor-second"
              onClick={() => {
                sounds.playClick();
                setActiveFloor('SECOND');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeFloor === 'SECOND' ? 'bg-teal-500 text-slate-950' : 'text-slate-300 hover:text-white'
              }`}
            >
              2nd Floor
            </button>
          </div>

          {/* Wheelchair accessible toggle */}
          <button
            id="btn-toggle-wheelchair"
            onClick={() => {
              sounds.playClick();
              setWheelchairAccess(!wheelchairAccess);
            }}
            className={`p-2 rounded-xl border flex items-center space-x-1 text-xs transition-all ${
              wheelchairAccess
                ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Wheelchair & Ramp Route"
          >
            <Accessibility className="w-4 h-4" />
            <span className="hidden sm:inline">Ramp/Lift</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG Hospital Floorplan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Floorplan Graphic */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-teal-400 flex items-center space-x-1.5">
              <Building2 className="w-4 h-4" />
              <span>Thiruvalluvar GH • {activeFloor} Floor Architectural Plan</span>
            </span>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              Interactive Blueprint
            </span>
          </div>

          {/* Scaled SVG Schematic */}
          <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center">
            <svg viewBox="0 0 800 500" className="w-full h-full select-none">
              {/* Outer Hospital Walls */}
              <rect x="20" y="20" width="760" height="460" rx="16" fill="#0f172a" stroke="#334155" strokeWidth="3" />

              {/* Main Corridors */}
              {/* Central Spine */}
              <rect x="360" y="40" width="80" height="420" fill="#1e293b" />
              {/* Horizontal Cross Corridor */}
              <rect x="40" y="220" width="720" height="60" fill="#1e293b" />

              {/* Corridor Directional Arrows & Path */}
              <path
                d={
                  currentDestObj.floor === activeFloor
                    ? currentDestObj.room === '102'
                      ? 'M 380 430 L 400 250 L 520 250'
                      : currentDestObj.room === '204'
                      ? 'M 400 400 L 400 250 L 250 250'
                      : 'M 400 430 L 400 250 L 400 120'
                    : 'M 400 430 L 400 250 L 400 180'
                }
                fill="none"
                stroke="#14b8a6"
                strokeWidth="4"
                strokeDasharray="8 6"
                className="animate-pulse"
              />

              {activeFloor === 'GROUND' ? (
                <>
                  {/* KIOSK 01 Position */}
                  <g transform="translate(370, 420)">
                    <circle cx="30" cy="20" r="16" fill="#0d9488" />
                    <text x="30" y="24" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">KIOSK</text>
                  </g>

                  {/* Rooms Ground Floor */}
                  {/* Room 001 Casualty */}
                  <rect x="40" y="320" width="140" height="130" rx="8" fill="#450a0a" stroke="#dc2626" strokeWidth="2" />
                  <text x="110" y="375" textAnchor="middle" fill="#fca5a5" fontSize="12" fontWeight="bold">ROOM 001</text>
                  <text x="110" y="395" textAnchor="middle" fill="#ef4444" fontSize="10">CASUALTY / ER</text>

                  {/* Room 102 General Medicine */}
                  <rect 
                    x="500" y="290" width="160" height="120" rx="8" 
                    fill={currentDestObj.room === '102' ? '#134e4a' : '#1e293b'} 
                    stroke={currentDestObj.room === '102' ? '#2dd4bf' : '#475569'} 
                    strokeWidth="2" 
                  />
                  <text x="580" y="340" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 102</text>
                  <text x="580" y="360" textAnchor="middle" fill="#5eead4" fontSize="10">General Medicine</text>
                  <text x="580" y="380" textAnchor="middle" fill="#94a3b8" fontSize="9">Dr. S. Kumar</text>

                  {/* Room 105 General Surgery */}
                  <rect x="500" y="90" width="160" height="110" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="580" y="145" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 105</text>
                  <text x="580" y="165" textAnchor="middle" fill="#94a3b8" fontSize="10">General Surgery</text>

                  {/* Room 108 Paediatrics */}
                  <rect x="40" y="90" width="140" height="110" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="110" y="145" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 108</text>
                  <text x="110" y="165" textAnchor="middle" fill="#94a3b8" fontSize="10">Paediatrics</text>

                  {/* Pharmacy Counter 01 */}
                  <rect x="200" y="90" width="140" height="110" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="270" y="145" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 110</text>
                  <text x="270" y="165" textAnchor="middle" fill="#38bdf8" fontSize="10">Pharmacy Counter 01</text>

                  {/* Lift & Stairs */}
                  <rect x="370" y="160" width="60" height="50" rx="6" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
                  <text x="400" y="190" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">LIFT / STAIRS</text>
                </>
              ) : (
                <>
                  {/* First Floor Rooms */}
                  {/* Room 204 Orthopaedics */}
                  <rect 
                    x="180" y="290" width="160" height="120" rx="8" 
                    fill={currentDestObj.room === '204' ? '#134e4a' : '#1e293b'} 
                    stroke={currentDestObj.room === '204' ? '#2dd4bf' : '#475569'} 
                    strokeWidth="2" 
                  />
                  <text x="260" y="340" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 204</text>
                  <text x="260" y="360" textAnchor="middle" fill="#5eead4" fontSize="10">Orthopaedics</text>
                  <text x="260" y="380" textAnchor="middle" fill="#94a3b8" fontSize="9">Dr. K. Ravi</text>

                  {/* Central Lab Counter 03 */}
                  <rect x="500" y="290" width="160" height="120" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="580" y="340" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">COUNTER 03</text>
                  <text x="580" y="360" textAnchor="middle" fill="#38bdf8" fontSize="10">Central Lab (Blood/Urine)</text>

                  {/* Room 210 Eye */}
                  <rect x="500" y="90" width="160" height="110" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="580" y="145" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 210</text>
                  <text x="580" y="165" textAnchor="middle" fill="#94a3b8" fontSize="10">Ophthalmology (Eye)</text>

                  {/* Room 212 ENT */}
                  <rect x="180" y="90" width="140" height="110" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                  <text x="250" y="145" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">ROOM 212</text>
                  <text x="250" y="165" textAnchor="middle" fill="#94a3b8" fontSize="10">ENT Clinic</text>
                </>
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" />
              <span>Green Dashed Line = Your Walking Route</span>
            </span>
            <span>Floor Accessible via Ramp &amp; Lift A</span>
          </div>
        </div>

        {/* Turn-by-Turn Navigation Cards */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                Turn-by-Turn Directions:
              </span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Footprints className="w-3.5 h-3.5 text-teal-400" />
                <span>~{currentDestObj.walkingMins} mins walk</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              To: {currentDestObj.label}
            </h3>
            <p className="text-xs text-slate-400">
              Floor: <strong className="text-slate-200">{currentDestObj.floor}</strong> • Follow green floor line
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-start space-x-3 text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-slate-100 font-medium">
                    {currentLang === 'ta' ? step.instructionTa : currentLang === 'te' ? (step.instructionTe || step.instruction) : currentLang === 'hi' ? step.instructionHi : step.instruction}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Landmark: {step.landmark}</span>
                    <span className="font-mono text-teal-400/80">{step.distance}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hospital Help Hotline */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Need wheelchair assistance?</span>
            <span className="font-bold text-amber-400">Contact Attendant Desk</span>
          </div>
        </div>
      </div>
    </div>
  );
};
