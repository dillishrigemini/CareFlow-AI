import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Printer, 
  RefreshCw, 
  Check, 
  ShieldCheck, 
  Info,
  Building2
} from 'lucide-react';
import { LanguageCode, PharmacyOrder } from '../types';
import { sounds } from '../utils/audio';

interface PharmacyPortalProps {
  currentLang: LanguageCode;
}

export const PharmacyPortal: React.FC<PharmacyPortalProps> = ({ currentLang }) => {
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [isDispensing, setIsDispensing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/pharmacy/orders');
      const data: PharmacyOrder[] = await res.json();
      setOrders(data);
      if (!selectedOrder && data.length > 0) {
        setSelectedOrder(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch pharmacy orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDispense = async (orderId: string) => {
    setIsDispensing(true);
    sounds.playClick();
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}/dispense`, { method: 'POST' });
      if (res.ok) {
        sounds.playChime();
        fetchOrders();
      }
    } catch (e) {
      console.error('Dispense error:', e);
    } finally {
      setIsDispensing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Outpatient Pharmacy Dispensing Counter</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Counter 01 • Ground Floor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Government of Tamil Nadu • 100% Free Essential Medicine Distribution
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-pharmacy"
          onClick={() => {
            sounds.playClick();
            fetchOrders();
          }}
          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
          title="Refresh Pharmacy"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Dispensing Queue & Active Prescription */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Prescription Tokens Queue */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Prescriptions in Queue ({orders.length}):
            </h3>
            <span className="text-xs text-slate-400">Select token</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const isDispensed = order.status === 'DISPENSED';
              return (
                <div
                  key={order.id}
                  id={`card-pharmacy-order-${order.id}`}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="font-mono text-base text-white">{order.pharmacyToken}</strong>
                        <span className="text-slate-300 text-sm font-semibold">{order.patientName}</span>
                      </div>
                      <p className="font-mono text-xs text-emerald-400">{order.uhid}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isDispensed
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800 animate-pulse'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    {order.medicines.length} medications prescribed • {order.estimatedWaitMinutes} mins wait
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prescription Verification & Dispensing Panel */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Token & Patient Particulars */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    TOKEN: {selectedOrder.pharmacyToken}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedOrder.patientName}</h3>
                  <p className="text-xs font-mono text-emerald-400">UHID: {selectedOrder.uhid}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Dispensing Station</span>
                  <strong className="text-white text-sm">{selectedOrder.counterNo}</strong>
                </div>
              </div>

              {/* Free Medicines Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center space-x-2">
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                    <span>Medications Checklist (Hospital Formulary):</span>
                  </h4>
                  <span className="text-xs text-emerald-400 font-bold">100% Free of Cost</span>
                </div>

                <div className="space-y-2.5">
                  {selectedOrder.medicines.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between text-xs gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <strong className="text-sm font-bold text-white">{m.name}</strong>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                            {m.timing}
                          </span>
                        </div>
                        <p className="text-slate-300">
                          Dosage: <strong>{m.dosage}</strong> • Duration: <strong>{m.duration}</strong>
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          Instruction: {m.instructions}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {selectedOrder.status === 'DISPENSED' ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-xs bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800">
                            <Check className="w-3.5 h-3.5" />
                            <span>Dispensed</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800">
                            Pack &amp; Verify
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  id="btn-dispense-medicines"
                  disabled={isDispensing || selectedOrder.status === 'DISPENSED'}
                  onClick={() => handleDispense(selectedOrder.id)}
                  className="flex-1 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>
                    {selectedOrder.status === 'DISPENSED'
                      ? 'Already Dispensed & Closed'
                      : 'Verify Stock & Dispense Medicines to Patient'}
                  </span>
                </button>

                <button
                  id="btn-print-pharmacy-label"
                  onClick={() => {
                    sounds.playClick();
                    window.print();
                  }}
                  className="px-4 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Label</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Pill className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">Select a Prescription Token</p>
              <p className="text-xs text-slate-500">Pick any patient on the left to verify and dispense free medications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
