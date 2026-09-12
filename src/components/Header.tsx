import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Globe, 
  Volume2, 
  AlertTriangle, 
  HelpCircle, 
  LayoutDashboard, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  ShieldAlert, 
  BarChart3, 
  Cpu, 
  Monitor,
  VolumeX,
  Type
} from 'lucide-react';
import { LanguageCode } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  textSize: 'normal' | 'large' | 'xl';
  onTextSizeChange: (size: 'normal' | 'large' | 'xl') => void;
  highContrast: boolean;
  onHighContrastToggle: () => void;
  voiceMode: boolean;
  onVoiceModeToggle: () => void;
  slowSpeech: boolean;
  onSlowSpeechToggle: () => void;
  onEmergencyClick: () => void;
  onStaffHelpClick: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  activeView,
  onViewChange,
  textSize,
  onTextSizeChange,
  highContrast,
  onHighContrastToggle,
  voiceMode,
  onVoiceModeToggle,
  slowSpeech,
  onSlowSpeechToggle,
  onEmergencyClick,
  onStaffHelpClick,
  activeAlertsCount,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const portals = [
    { id: 'kiosk', label: 'Self-Service Kiosk', icon: Monitor, tag: 'Patient Front-Door' },
    { id: 'doctor', label: 'Doctor OPD Portal', icon: Stethoscope, tag: 'Room 102 / 204' },
    { id: 'lab', label: 'Central Lab', icon: FlaskConical, tag: 'Counter 03' },
    { id: 'pharmacy', label: 'OP Pharmacy', icon: Pill, tag: 'Counter 01' },
    { id: 'staff', label: 'Staff & Queue Desk', icon: ShieldAlert, tag: activeAlertsCount > 0 ? `${activeAlertsCount} Alerts` : 'Queue' },
    { id: 'analytics', label: 'Admin & Analytics', icon: BarChart3, tag: 'HMIS' },
    { id: 'agent-trace', label: 'Agent Observability', icon: Cpu, tag: 'MCP Trace' },
  ];

  return (
    <header className={`w-full transition-colors duration-200 border-b ${
      highContrast 
        ? 'bg-black border-yellow-400 text-yellow-300' 
        : 'bg-slate-900 border-slate-800 text-slate-100'
    }`}>
      {/* Role / Portals Switcher Topbar */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="text-slate-400 font-medium mr-1 uppercase tracking-wider hidden sm:inline">Role View:</span>
          {portals.map((p) => {
            const Icon = p.icon;
            const isActive = activeView === p.id;
            return (
              <button
                key={p.id}
                id={`btn-portal-${p.id}`}
                onClick={() => {
                  sounds.playClick();
                  onViewChange(p.id);
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-sm shadow-teal-500/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
                {p.tag && (
                  <span className={`text-[10px] px-1 py-0.2 rounded ${
                    isActive ? 'bg-teal-900/40 text-teal-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {p.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-3 text-slate-400 pl-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            KIOSK 01 ONLINE
          </span>
          <span className="font-mono text-[11px] hidden md:inline">{time}</span>
        </div>
      </div>

      {/* Main Kiosk Header Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Emblem & Hospital Name */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-teal-400">
                <Heart className="w-7 h-7 fill-teal-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white font-sans leading-tight">
                  {t('hospital_title', currentLang)}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-teal-400/90 font-medium">
                {t('hospital_subtitle', currentLang)}
              </p>
            </div>
          </div>

          {/* Quick Mobile Help */}
          <div className="flex md:hidden items-center space-x-1">
            <button
              id="btn-mobile-emergency"
              onClick={() => {
                sounds.playEmergency();
                onEmergencyClick();
              }}
              className="p-2 bg-red-600 text-white rounded-lg"
              title="Emergency"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls & Accessibility */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
          {/* Language Switcher */}
          <div className="inline-flex rounded-lg p-1 bg-slate-800/90 border border-slate-700/80">
            <button
              id="lang-ta"
              onClick={() => {
                sounds.playClick();
                onLanguageChange('ta');
              }}
              className={`px-3 py-1 text-xs sm:text-sm rounded-md font-semibold transition-all ${
                currentLang === 'ta'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              id="lang-te"
              onClick={() => {
                sounds.playClick();
                onLanguageChange('te');
              }}
              className={`px-3 py-1 text-xs sm:text-sm rounded-md font-semibold transition-all ${
                currentLang === 'te'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
            <button
              id="lang-en"
              onClick={() => {
                sounds.playClick();
                onLanguageChange('en');
              }}
              className={`px-3 py-1 text-xs sm:text-sm rounded-md font-semibold transition-all ${
                currentLang === 'en'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              id="lang-hi"
              onClick={() => {
                sounds.playClick();
                onLanguageChange('hi');
              }}
              className={`px-3 py-1 text-xs sm:text-sm rounded-md font-semibold transition-all ${
                currentLang === 'hi'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Accessibility Toggles */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/60 p-1 rounded-lg text-xs">
            {/* Text Size */}
            <button
              id="btn-acc-text-size"
              onClick={() => {
                sounds.playClick();
                const next = textSize === 'normal' ? 'large' : textSize === 'large' ? 'xl' : 'normal';
                onTextSizeChange(next);
              }}
              className="px-2 py-1 rounded text-slate-300 hover:text-white flex items-center space-x-1"
              title="Text Size"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold uppercase">{textSize}</span>
            </button>

            {/* High Contrast */}
            <button
              id="btn-acc-contrast"
              onClick={() => {
                sounds.playClick();
                onHighContrastToggle();
              }}
              className={`px-2 py-1 rounded transition-colors ${
                highContrast ? 'bg-yellow-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="High Contrast"
            >
              Contrast
            </button>

            {/* Voice Mode */}
            <button
              id="btn-acc-voice"
              onClick={() => {
                sounds.playClick();
                onVoiceModeToggle();
              }}
              className={`p-1.5 rounded transition-colors ${
                voiceMode ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Voice Prompt Mode"
            >
              {voiceMode ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Emergency SOS & Staff Help */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-staff-help"
              onClick={() => {
                sounds.playClick();
                onStaffHelpClick();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 font-semibold text-xs sm:text-sm transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('action_staff_help', currentLang).split(' ')[0]}</span>
            </button>

            <button
              id="btn-emergency-sos"
              onClick={() => {
                sounds.playEmergency();
                onEmergencyClick();
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t('action_emergency', currentLang).split(' ')[0]}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
