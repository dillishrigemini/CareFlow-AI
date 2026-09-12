import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  Barcode, 
  FileText, 
  Send, 
  RefreshCw, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { LanguageCode, LabOrder } from '../types';
import { sounds } from '../utils/audio';

interface LabPortalProps {
  currentLang: LanguageCode;
}

export const LabPortal: React.FC<LabPortalProps> = ({ currentLang }) => {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [resultInput, setResultInput] = useState<{ [param: string]: string }>({
    'Fasting Blood Glucose': '118 mg/dL (Normal: 70-99 mg/dL)',
    'HbA1c': '6.8% (Target < 7.0%)',
    'Hemoglobin': '13.2 g/dL',
  });
  const [remarks, setRemarks] = useState('Mild hyperglycemia noted. Advised glycemic diet.');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/lab/orders');
      const data: LabOrder[] = await res.json();
      setLabOrders(data);
      if (!selectedOrder && data.length > 0) {
        setSelectedOrder(data[0]);
      }
    } catch (e) {
      console.error('Failed to fetch lab orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleCollectSample = async (orderId: string) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/lab/orders/${orderId}/sample`, { method: 'POST' });
      if (res.ok) {
        sounds.playChime();
        fetchOrders();
      }
    } catch (e) {
      console.error('Collect sample error:', e);
    }
  };

  const handleReleaseResults = async (orderId: string) => {
    setIsUpdating(true);
    sounds.playClick();
    try {
      const formattedResults = Object.entries(resultInput).map(([param, value]) => {
        const valStr = String(value);
        return {
          parameter: param,
          value: valStr,
          unit: valStr.includes('mg/dL') ? 'mg/dL' : valStr.includes('%') ? '%' : 'g/dL',
          referenceRange: 'Standard Biochemistry',
          isAbnormal: valStr.includes('High') || valStr.includes('118'),
        };
      });

      const res = await fetch(`/api/lab/orders/${orderId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: formattedResults,
          doctorRemarks: remarks,
        }),
      });

      if (res.ok) {
        sounds.playChime();
        fetchOrders();
      }
    } catch (e) {
      console.error('Result submit error:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Central Diagnostic Laboratory</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-mono">
                Counter 03 • 1st Floor
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Government Hospital Pathology &amp; Biochemistry Workstation
            </p>
          </div>
        </div>

        <button
          id="btn-refresh-lab"
          onClick={() => {
            sounds.playClick();
            fetchOrders();
          }}
          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200"
          title="Refresh Lab Orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Order Queue & Test Processing Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Orders Queue */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              Diagnostic Queue ({labOrders.length}):
            </h3>
            <span className="text-xs text-slate-400">Touch order to process</span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {labOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  id={`card-lab-order-${order.id}`}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-sky-950/30 border-sky-500 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{order.patientName}</h4>
                      <p className="font-mono text-xs text-sky-400">{order.uhid}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      order.status === 'READY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : order.status === 'SAMPLE_COLLECTED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">
                    Tests: <strong className="text-slate-100">{order.testName}</strong>
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Ordered: {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{order.labCounter}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details & Result Entry Console */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-6">
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Patient Banner */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedOrder.patientName}</h3>
                  <p className="text-xs font-mono text-sky-400">UHID: {selectedOrder.uhid}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Advised: <strong>{selectedOrder.testName}</strong>
                  </p>
                </div>

                {selectedOrder.status === 'ORDERED' && (
                  <button
                    id="btn-collect-sample"
                    onClick={() => handleCollectSample(selectedOrder.id)}
                    className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>Collect &amp; Barcode Sample</span>
                  </button>
                )}

                {selectedOrder.status !== 'ORDERED' && (
                  <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sample Collected</span>
                  </div>
                )}
              </div>

              {/* Enter Results Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-sky-400" />
                    <span>Laboratory Findings &amp; Values:</span>
                  </h4>
                  <span className="text-xs text-slate-400">Biochemistry Analyzers</span>
                </div>

                <div className="space-y-3">
                  {Object.entries(resultInput).map(([param, val]) => (
                    <div key={param} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
                      <label className="sm:col-span-5 text-slate-300 font-semibold">{param}</label>
                      <div className="sm:col-span-7">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => setResultInput({ ...resultInput, [param]: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="text-slate-400 block text-xs mb-1">Pathologist / Lab Officer Remarks</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-xs"
                    />
                  </div>
                </div>

                <button
                  id="btn-release-lab-results"
                  disabled={isUpdating || selectedOrder.status === 'READY'}
                  onClick={() => handleReleaseResults(selectedOrder.id)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {selectedOrder.status === 'READY' 
                      ? 'Results Released to Patient Careflow' 
                      : 'Validate & Release Results to Doctor & Patient Portal'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">Select a Lab Order</p>
              <p className="text-xs text-slate-500">Pick any test order on the left to collect sample or record results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
