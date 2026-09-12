import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Volume2, 
  RefreshCw, 
  Stethoscope, 
  CheckCircle2, 
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { LanguageCode, Department, Doctor, OPDVisit } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface LiveQueueBoardProps {
  currentLang: LanguageCode;
  onBack: () => void;
  selectedDeptId?: string;
}

export const LiveQueueBoard: React.FC<LiveQueueBoardProps> = ({
  currentLang,
  onBack,
  selectedDeptId,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeDeptId, setActiveDeptId] = useState<string>(selectedDeptId || 'dept-gm');
  const [deptQueue, setDeptQueue] = useState<{
    servingNow: number;
    waitingCount: number;
    activeVisits: OPDVisit[];
  }>({ servingNow: 36, waitingCount: 11, activeVisits: [] });

  const fetchQueue = async () => {
    try {
      const [deptRes, docRes, queueRes] = await Promise.all([
        fetch('/api/opd/departments'),
        fetch('/api/doctors/availability'),
        fetch(`/api/queues/${activeDeptId}`),
      ]);
      const depts = await deptRes.json();
      const docs = await docRes.json();
      const q = await queueRes.json();
      setDepartments(depts);
      setDoctors(docs);
      setDeptQueue({
        servingNow: q.servingNow || 36,
        waitingCount: q.waitingCount || q.activeVisits?.length || 8,
        activeVisits: q.activeVisits || [],
      });
    } catch (e) {
      console.error('Failed to fetch queue:', e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [activeDeptId]);

  const activeDept = departments.find(d => d.id === activeDeptId) || departments[0];
  const activeDoc = doctors.find(d => d.departmentId === activeDeptId) || doctors[0];

  const handlePlayAnnouncement = () => {
    sounds.playChime();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-teal-400" />
            <span>{t('queue_title', currentLang)}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Public OPD Token Calling &amp; Waiting List Board
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-announce-queue"
            onClick={handlePlayAnnouncement}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="Play Audio Chime"
          >
            <Volume2 className="w-4 h-4" />
            <span>Chime</span>
          </button>
          <button
            id="btn-refresh-queue"
            onClick={() => {
              sounds.playClick();
              fetchQueue();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-back-queue"
            onClick={() => {
              sounds.playClick();
              onBack();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
          >
            {t('btn_back', currentLang)}
          </button>
        </div>
      </div>

      {/* Department Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {departments.map((dept) => {
          const isActive = activeDeptId === dept.id;
          return (
            <button
              key={dept.id}
              id={`tab-queue-dept-${dept.id}`}
              onClick={() => {
                sounds.playClick();
                setActiveDeptId(dept.id);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80'
              }`}
            >
              <span>{dept.nameEn}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                isActive ? 'bg-teal-950 text-teal-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {dept.roomNo}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero Display Panel: Serving Token & Doctor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* BIG NOW SERVING BOARD */}
        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950/40 border-2 border-teal-500/50 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block">
                NOW SERVING IN ROOM {activeDept?.roomNo || '102'}:
              </span>
              <h3 className="text-2xl font-black text-white">
                {activeDept?.nameEn}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold animate-pulse">
              LIVE CALLING
            </span>
          </div>

          {/* GIANT TOKEN DISPLAY */}
          <div className="py-8 text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Current Token Called:
            </span>
            <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {activeDept?.code}-{String(deptQueue.servingNow).padStart(3, '0')}
            </div>
            <p className="text-sm font-semibold text-teal-300">
              Please enter Consultation Room {activeDept?.roomNo}
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-teal-400" />
              <span className="text-slate-300">Consulting Physician:</span>
              <strong className="text-white">{activeDoc?.name || 'Dr. S. Kumar'}</strong>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <span>Avg Time: <strong>{activeDoc?.avgConsultationMinutes || 4} mins</strong></span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{deptQueue.waitingCount} in waiting</span>
            </div>
          </div>
        </div>

        {/* UPCOMING TOKENS LIST */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h4 className="font-bold text-white text-base flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next in Line:</span>
              </h4>
              <span className="text-xs text-slate-400">Estimated sequence</span>
            </div>

            <div className="divide-y divide-slate-700/60 pt-2 space-y-1">
              {[1, 2, 3, 4, 5, 6].map((offset) => {
                const tokenNum = deptQueue.servingNow + offset;
                const estWait = offset * (activeDoc?.avgConsultationMinutes || 4);
                return (
                  <div key={offset} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 text-slate-500 font-mono">#{offset}</span>
                      <strong className="font-mono text-base text-white">
                        {activeDept?.code}-{String(tokenNum).padStart(3, '0')}
                      </strong>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-300/90 font-mono">~{estWait} mins</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        WAITING
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-400 text-center">
            Token numbers are called sequentially. Senior citizens and emergency patients are prioritized.
          </div>
        </div>
      </div>
    </div>
  );
};
