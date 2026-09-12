import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  ScanLine, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  Check, 
  Edit3, 
  HelpCircle, 
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { LanguageCode, DocumentOCRResponse, Patient } from '../types';
import { t } from '../i18n';
import { sounds } from '../utils/audio';

interface DocumentScannerProps {
  currentLang: LanguageCode;
  onConfirmPatient: (patient: Patient, extractedData: DocumentOCRResponse) => void;
  onCancel: () => void;
  onRequestStaffHelp: (reason: string) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  currentLang,
  onConfirmPatient,
  onCancel,
  onRequestStaffHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'sample' | 'camera' | 'upload'>('sample');
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<DocumentOCRResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Editable Form fields state
  const [formData, setFormData] = useState({
    name: '',
    uhid: '',
    opNumber: '',
    age: '',
    gender: 'MALE',
    mobile: '',
    department: '',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start / Stop camera stream
  useEffect(() => {
    if (activeTab === 'camera') {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Camera access unavailable:', err);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab]);

  const processOCR = async (sampleId?: string, imageBase64?: string) => {
    setIsScanning(true);
    setOcrResult(null);
    sounds.playClick();

    try {
      const res = await fetch('/api/documents/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId, imageBase64 }),
      });
      const data: DocumentOCRResponse = await res.json();
      setOcrResult(data);

      if (data.fields) {
        setFormData({
          name: data.fields.patientName?.value || data.matchedPatient?.name || '',
          uhid: data.fields.uhid?.value || data.matchedPatient?.uhid || '',
          opNumber: data.fields.opNumber?.value || data.matchedPatient?.opNumber || '',
          age: String(data.fields.age?.value || data.matchedPatient?.age || ''),
          gender: data.fields.gender?.value || data.matchedPatient?.gender || 'MALE',
          mobile: data.fields.mobile?.value || data.matchedPatient?.mobile || '',
          department: data.fields.department?.value || data.matchedPatient?.lastDepartment || 'General Medicine',
        });
      }

      if (data.overallConfidence >= 0.75) {
        sounds.playChime();
      } else {
        sounds.playEmergency();
      }
    } catch (err) {
      console.error('OCR Error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewImage(dataUrl);
      processOCR(undefined, dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      processOCR(undefined, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    sounds.playClick();
    if (!ocrResult) return;

    // Use matched patient or synthesized verified patient object
    const finalPatient: Patient = ocrResult.matchedPatient || {
      id: `p-ocr-${Date.now()}`,
      uhid: formData.uhid || 'TN-GH-2026-UNKNOWN',
      opNumber: formData.opNumber || 'OP-NEW',
      name: formData.name,
      age: Number(formData.age) || 40,
      gender: formData.gender as any,
      mobile: formData.mobile,
      address: 'Hospital Region, Tiruvallur',
      languagePreference: currentLang,
      lastDepartment: formData.department,
    };

    onConfirmPatient(finalPatient, ocrResult);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <ScanLine className="w-6 h-6 text-teal-400" />
            <span>{t('ocr_scanner_title', currentLang)}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('ocr_scanner_guide', currentLang)}
          </p>
        </div>
        <button
          id="btn-cancel-scan"
          onClick={() => {
            sounds.playClick();
            onCancel();
          }}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
        >
          {t('btn_cancel', currentLang)}
        </button>
      </div>

      {/* Input Mode Selector */}
      <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700 max-w-md">
        <button
          id="tab-scan-sample"
          onClick={() => {
            sounds.playClick();
            setActiveTab('sample');
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'sample' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t('ocr_sample_slips', currentLang)}
        </button>
        <button
          id="tab-scan-camera"
          onClick={() => {
            sounds.playClick();
            setActiveTab('camera');
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'camera' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          Camera / Kiosk Feed
        </button>
        <button
          id="tab-scan-upload"
          onClick={() => {
            sounds.playClick();
            setActiveTab('upload');
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
            activeTab === 'upload' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          Upload Slip
        </button>
      </div>

      {/* Main Scanner Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Document View / Camera / Sample Selector */}
        <div className="lg:col-span-6 space-y-4">
          {activeTab === 'sample' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select a Realistic Government Hospital OP Slip:
              </p>
              
              {/* Sample 1: General Medicine Follow-up */}
              <div 
                id="btn-sample-slip-1"
                onClick={() => processOCR('SAMPLE_SLIP_1')}
                className="cursor-pointer p-4 rounded-2xl bg-slate-800/90 border-2 border-slate-700 hover:border-teal-500 transition-all hover:bg-slate-800 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <span className="font-bold text-white text-sm">Sample Slip 1: General Medicine Follow-Up</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    High Confidence (98%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  UHID: TN-GH-2026-00412 | Patient: Ramasamy K (58/M)
                </p>
                <p className="text-[11px] text-slate-400">
                  Includes OP Number, Mobile, and previous diagnosis (T2DM).
                </p>
              </div>

              {/* Sample 2: Orthopaedics Knee Slip */}
              <div 
                id="btn-sample-slip-2"
                onClick={() => processOCR('SAMPLE_SLIP_2')}
                className="cursor-pointer p-4 rounded-2xl bg-slate-800/90 border-2 border-slate-700 hover:border-teal-500 transition-all hover:bg-slate-800 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <span className="font-bold text-white text-sm">Sample Slip 2: Orthopaedics Visit Ticket</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    High Confidence (95%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  UHID: TN-GH-2026-00588 | Patient: Kavitha Murugan (34/F)
                </p>
                <p className="text-[11px] text-slate-400">
                  Includes Doctor Dr. K. Ravi (Room 204), Right knee complaint.
                </p>
              </div>

              {/* Sample 3: Degraded / Unreadable Slip */}
              <div 
                id="btn-sample-slip-3"
                onClick={() => processOCR('SAMPLE_SLIP_UNREADABLE')}
                className="cursor-pointer p-4 rounded-2xl bg-slate-800/90 border-2 border-rose-800/40 hover:border-rose-500 transition-all hover:bg-slate-800 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-rose-400" />
                    <span className="font-bold text-white text-sm">Sample Slip 3: Water Damaged / Torn Slip</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800">
                    Low Confidence (38%)
                  </span>
                </div>
                <p className="text-xs text-rose-300/80 font-mono">
                  Torn slip demonstrating OCR safety threshold & staff fallback.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-teal-500/50 aspect-video flex flex-col items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-8 border-2 border-teal-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-teal-300 w-fit">
                  Align OP Slip Here
                </span>
                <span className="text-[10px] bg-slate-900/80 px-2 py-0.5 rounded text-teal-300 w-fit self-end">
                  Ensure Barcode/UHID is visible
                </span>
              </div>
              <div className="absolute bottom-4 z-10">
                <button
                  id="btn-capture-camera"
                  onClick={handleCapturePhoto}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-teal-500 text-slate-950 font-bold shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t('ocr_camera_capture', currentLang)}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 bg-slate-900/60 hover:bg-slate-900 transition-all text-center"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*,.pdf" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{t('ocr_upload_slip', currentLang)}</p>
                <p className="text-xs text-slate-400">JPG, PNG, or photo of physical OP slip</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Extraction Results, Confidence Gauges, Validation */}
        <div className="lg:col-span-6 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-5">
          {isScanning && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                <Sparkles className="w-6 h-6 text-teal-400 absolute inset-0 m-auto" />
              </div>
              <p className="font-bold text-slate-200 text-sm animate-pulse">
                {t('ocr_extracting', currentLang)}
              </p>
            </div>
          )}

          {!isScanning && !ocrResult && (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ScanLine className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No document scanned yet</p>
              <p className="text-xs text-slate-500">
                Touch a sample slip on the left or use the camera to extract patient details.
              </p>
            </div>
          )}

          {!isScanning && ocrResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Overall Confidence Meter */}
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-700/80">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className={`w-5 h-5 ${ocrResult.overallConfidence >= 0.75 ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{t('ocr_confidence', currentLang)}</p>
                    <p className="text-sm font-black font-mono text-white">
                      {(ocrResult.overallConfidence * 100).toFixed(0)}% Match
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  ocrResult.overallConfidence >= 0.75 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {ocrResult.overallConfidence >= 0.75 ? 'High Confidence' : 'Low Confidence - Review Needed'}
                </span>
              </div>

              {/* Warnings / Safety Alerts */}
              {ocrResult.validationWarnings && ocrResult.validationWarnings.length > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>OCR Safety Warning:</span>
                  </div>
                  {ocrResult.validationWarnings.map((w, idx) => (
                    <p key={idx}>• {w}</p>
                  ))}
                  {ocrResult.overallConfidence < 0.5 && (
                    <button
                      id="btn-ocr-request-help"
                      onClick={() => onRequestStaffHelp('Unreadable OP Slip: Low OCR confidence')}
                      className="mt-2 w-full py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors"
                    >
                      Request Staff Assistance
                    </button>
                  )}
                </div>
              )}

              {/* Extracted Fields Form (Editable for verification) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Extracted Patient Details:
                  </p>
                  <button
                    id="btn-edit-extracted-fields"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center space-x-1 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Done Editing' : t('btn_edit', currentLang)}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">{t('field_name', currentLang)}</label>
                    <input
                      id="input-ocr-name"
                      type="text"
                      disabled={!isEditing}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold disabled:opacity-90"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('field_uhid', currentLang)}</label>
                    <input
                      id="input-ocr-uhid"
                      type="text"
                      disabled={!isEditing}
                      value={formData.uhid}
                      onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono font-semibold disabled:opacity-90"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('field_op_number', currentLang)}</label>
                    <input
                      id="input-ocr-op"
                      type="text"
                      disabled={!isEditing}
                      value={formData.opNumber}
                      onChange={(e) => setFormData({ ...formData, opNumber: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono disabled:opacity-90"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('field_mobile', currentLang)}</label>
                    <input
                      id="input-ocr-mobile"
                      type="text"
                      disabled={!isEditing}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white disabled:opacity-90"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('field_age', currentLang)} / {t('field_gender', currentLang)}</label>
                    <div className="flex space-x-2">
                      <input
                        id="input-ocr-age"
                        type="text"
                        disabled={!isEditing}
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white disabled:opacity-90 text-center"
                      />
                      <select
                        id="select-ocr-gender"
                        disabled={!isEditing}
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white disabled:opacity-90"
                      >
                        <option value="MALE">Male (ஆண்)</option>
                        <option value="FEMALE">Female (பெண்)</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">{t('field_department', currentLang)}</label>
                    <input
                      id="input-ocr-dept"
                      type="text"
                      disabled={!isEditing}
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white disabled:opacity-90"
                    />
                  </div>
                </div>
              </div>

              {/* Match Status & Confirmation Prompt */}
              {ocrResult.matchedPatient && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-300">
                      Existing Patient Found in Hospital Registry
                    </p>
                    <p className="text-slate-300">
                      Last visited {ocrResult.matchedPatient.lastDepartment} on {ocrResult.matchedPatient.lastVisitDate}.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  id="btn-confirm-ocr-patient"
                  onClick={handleConfirm}
                  disabled={ocrResult.overallConfidence < 0.5 && !formData.name}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('btn_confirm', currentLang)} &amp; Proceed to OPD</span>
                </button>

                <button
                  id="btn-rescan-ocr"
                  onClick={() => {
                    sounds.playClick();
                    setOcrResult(null);
                  }}
                  className="p-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Rescan"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
