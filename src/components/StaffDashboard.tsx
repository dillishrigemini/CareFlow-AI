import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  RefreshCw, 
  User, 
  Monitor, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { StaffAlert, KioskHardwareState, LanguageCode } from '../types';
import { sounds } from '../utils/audio';

interface StaffDashboardProps {
  currentLang: LanguageCode;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentLang }) => {
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [kiosks, setKiosks] = useState<KioskHardwareState[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const fetchData = async () => {
    try {
      const [alertRes, kioskRes] = await Promise.all([
        fetch('/api/staff/alerts'),
        fetch('/api/kiosks/status'),
      ]);
      setAlerts(await alertRes.json());
      setKiosks(await kioskRes.json());
    } catch (e) {
      console.error('Error fetching staff alerts:', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/staff/alerts/${alertId}/resolve`, { method: 'POST' });
      if (res.ok) {
        sounds.playChime();
        fetchData();
      }
    } catch (e) {
      console.error('Resolve alert error:', e);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'PENDING') return a.status === 'PENDING';
    if (filter === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Staff Assistance Desk &amp; Queue Control</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                {alerts.filter(a => a.status === 'PENDING').length} Pending Requests
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kiosk alerts, unreadable document interventions, and patient assistance
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            fetchData();
          }}
          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
          title="Refresh Alerts"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Kiosk Hardware Grid */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-teal-400" />
            <span>Kiosk Hardware Fleet Status ({kiosks.length} Units):</span>
          </h3>
          <span className="text-xs text-slate-400">Auto-pinging</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {kiosks.map((k) => (
            <div key={k.kioskId} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-white font-mono">{k.kioskId}</strong>
                <span className="inline-flex items-center text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-slate-400 text-[11px] line-clamp-1">{k.location}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Printer: <strong className={k.printer === 'READY' ? 'text-emerald-400' : 'text-amber-400'}>{k.printer}</strong></span>
                <span>Scanner: <strong className="text-emerald-400">{k.scanner}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-white text-base">Live Kiosk Assistance &amp; Escalation Queue</h3>
          </div>

          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md font-semibold ${filter === 'ALL' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-md font-semibold ${filter === 'PENDING' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              Pending ({alerts.filter(a => a.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1 rounded-md font-semibold ${filter === 'RESOLVED' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Resolved ({alerts.filter(a => a.status === 'RESOLVED').length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold">No pending assistance alerts</p>
              <p className="text-xs text-slate-500">All kiosk operations are running smoothly.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isEmergency = alert.urgency === 'EMERGENCY';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                    isEmergency
                      ? 'bg-rose-950/40 border-rose-800 text-rose-100'
                      : alert.status === 'PENDING'
                      ? 'bg-amber-950/20 border-amber-800/80 text-amber-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isEmergency 
                          ? 'bg-red-600 text-white animate-pulse' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {alert.urgency}
                      </span>
                      <strong className="font-mono text-sm text-white">{alert.kioskId}</strong>
                      <span className="text-xs text-slate-400">({alert.location})</span>
                    </div>

                    <p className="text-sm font-medium text-white">
                      {alert.reason}
                    </p>

                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>Time: {new Date(alert.createdAt).toLocaleTimeString()}</span>
                      {alert.patientUhid && <span>UHID: <strong className="text-teal-400">{alert.patientUhid}</strong></span>}
                    </div>
                  </div>

                  {alert.status === 'PENDING' ? (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shrink-0 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Attended &amp; Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
