import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  X, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  Send,
  RefreshCw,
  Sliders,
  CheckCircle2,
  MapPin,
  Stethoscope,
  ScanLine,
  PhoneCall,
  Clock
} from 'lucide-react';
import { LanguageCode } from '../types';
import { t, speakText } from '../i18n';
import { sounds } from '../utils/audio';

interface VoiceAssistantModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentLang: LanguageCode;
  slowSpeech?: boolean;
  onIntentDispatched?: (intent: string, payload?: any) => void;
  onActionTrigger?: (action: string, data?: any) => void;
  onEmergencyTrigger?: () => void;
}

type MicState = 'IDLE' | 'LISTENING' | 'ERROR' | 'UNSUPPORTED' | 'PERMISSION_DENIED';

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen = true,
  onClose,
  currentLang,
  slowSpeech: initialSlowSpeech = false,
  onIntentDispatched,
  onActionTrigger,
  onEmergencyTrigger,
}) => {
  const [micState, setMicState] = useState<MicState>('IDLE');
  const [isHolding, setIsHolding] = useState(false);
  const [isDragCancelling, setIsDragCancelling] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [agentReply, setAgentReply] = useState('');
  const [agentIntent, setAgentIntent] = useState<string | null>(null);
  const [agentAction, setAgentAction] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slowSpeech, setSlowSpeech] = useState(initialSlowSpeech);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const autoRedirectTimerRef = useRef<any>(null);
  const isHoldingRef = useRef(false);
  const holdStartTimeRef = useRef(0);
  const transcriptAccumulatorRef = useRef('');
  const hasDispatchedRef = useRef(false);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDragCancellingRef = useRef(false);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (autoRedirectTimerRef.current) clearTimeout(autoRedirectTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick Voice Prompts in Tamil, Telugu, English, and Hindi
  const voiceCategories = [
    {
      label: currentLang === 'ta' ? 'அறிகுறிகள் / மருத்துவர்' : currentLang === 'te' ? 'లక్షణాలు / డాక్టర్' : currentLang === 'hi' ? 'लक्षण / डॉक्टर' : 'Symptoms & Triage',
      prompts: [
        {
          text: currentLang === 'ta'
            ? 'எனக்கு 3 நாட்களாக காய்ச்சல் மற்றும் கடுமையான சளி உள்ளது'
            : currentLang === 'te'
            ? 'నాకు 3 రోజులుగా జ్వరం మరియు తీవ్రమైన జలుబు ఉంది'
            : currentLang === 'hi'
            ? 'मुझे 3 दिनों से बुखार और तेज जुकाम है'
            : 'I have fever and severe cold for 3 days',
          category: 'FEVER',
        },
        {
          text: currentLang === 'ta'
            ? 'எனக்கு இரண்டு முழங்கால்களிலும் கடுமையான வலி உள்ளது'
            : currentLang === 'te'
            ? 'నా రెండు మోకాళ్లలో తీవ్రమైన నొప్పి మరియు బిగుతు ఉంది'
            : currentLang === 'hi'
            ? 'मेरे दोनों घुटनों में बहुत दर्द है'
            : 'Severe pain and stiffness in both knees',
          category: 'ORTHO',
        },
        {
          text: currentLang === 'ta'
            ? 'என் குழந்தைக்கு இருமல் மற்றும் காய்ச்சல் இருக்கிறது'
            : currentLang === 'te'
            ? 'నా బిడ్డకు దగ్గు మరియు నిరంతర జ్వరం ఉంది'
            : currentLang === 'hi'
            ? 'मेरे बच्चे को खांसी और तेज बुखार है'
            : 'My child has fever and continuous cough',
          category: 'PAED',
        },
      ],
    },
    {
      label: currentLang === 'ta' ? 'பழைய சீட்டு / பதிவு' : currentLang === 'te' ? 'పాత చీటీ / నమోదు' : currentLang === 'hi' ? 'पुरानी पर्ची / पंजीकरण' : 'OP Slip & Registration',
      prompts: [
        {
          text: currentLang === 'ta'
            ? 'பழைய OP சீட்டை ஸ்கேன் செய்து பதிவு செய்ய வேண்டும்'
            : currentLang === 'te'
            ? 'పాత OP చీటీని స్కాన్ చేసి డాక్టర్ సంప్రదింపు కోసం టోకెన్ పొందాలి'
            : currentLang === 'hi'
            ? 'पुरानी OP पर्ची को स्कैन करके अपॉइंटमेंट लें'
            : 'Scan my old outpatient OP slip for doctor visit',
          category: 'SCAN',
        },
        {
          text: currentLang === 'ta'
            ? 'நான் புதிய நோயாளி, புதிய பதிவு செய்ய வேண்டும்'
            : currentLang === 'te'
            ? 'నేను కొత్త రోగిని, ఆసుపత్రిలో కొత్తగా నమోదు చేసుకోవాలి'
            : currentLang === 'hi'
            ? 'मैं नया मरीज हूँ, नया पंजीकरण करना है'
            : 'I am a new patient, need new hospital registration',
          category: 'NEW_REG',
        },
      ],
    },
    {
      label: currentLang === 'ta' ? 'அவசர சிகிச்சை' : currentLang === 'te' ? 'అత్యవసర విభాగం (ఎమర్జెన్సీ)' : currentLang === 'hi' ? 'आपातकालीन' : 'Emergency & Help',
      prompts: [
        {
          text: currentLang === 'ta'
            ? 'நெஞ்சு வலி மற்றும் மூச்சுத் திணறல் அதிகமாக உள்ளது அவசரம்'
            : currentLang === 'te'
            ? 'తీవ్రమైన గుండె నొప్పి మరియు శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంది ఎమర్జెన్సీ'
            : currentLang === 'hi'
            ? 'सीने में तेज दर्द और सांस लेने में तकलीफ है आपातकालीन'
            : 'Severe chest pain and heavy breathlessness emergency',
          category: 'EMERGENCY',
        },
        {
          text: currentLang === 'ta'
            ? 'மருந்தகம் எங்குள்ளது? பொது மருத்துவத்தில் எத்தனை பேர் காத்திருக்கிறார்கள்?'
            : currentLang === 'te'
            ? 'మందుల షాప్ (ఫార్మసీ) ఎక్కడ ఉంది? జనరల్ మెడిసిన్‌లో ఎంత మంది ఉన్నారు?'
            : currentLang === 'hi'
            ? 'दवाखाना कहाँ है? सामान्य चिकित्सा में कितने मरीज हैं?'
            : 'Where is the pharmacy counter and how many patients waiting?',
          category: 'INFO',
        },
      ],
    },
  ];

  // Initialize Speech Recognition with continuous mode for uninterrupted multi-sentence capture
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicState('UNSUPPORTED');
      setMicErrorMessage('Browser speech recognition not supported in this environment. You can use the quick voice prompts below or type your request.');
      return;
    }

    try {
      const reco = new SpeechRecognition();
      reco.continuous = true; // DO NOT stop on brief pauses between words or sentences
      reco.interimResults = true;
      reco.maxAlternatives = 1;
      reco.lang = currentLang === 'ta' ? 'ta-IN' : currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';

      reco.onstart = () => {
        setMicState('LISTENING');
        setMicErrorMessage(null);
      };

      reco.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalStr += item[0].transcript + ' ';
          } else {
            interimStr += item[0].transcript;
          }
        }
        const fullTranscript = (finalStr + interimStr).trim();
        transcriptAccumulatorRef.current = fullTranscript;
        setTranscript(fullTranscript);
        // Note: Do NOT trigger handleSendQuery here! Allow user to complete 2-3 sentences until released.
      };

      reco.onerror = (err: any) => {
        console.warn('Speech recognition error:', err.error);
        if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
          setMicState('PERMISSION_DENIED');
          setMicErrorMessage('Microphone access was blocked. Please allow mic permissions in your browser or click any sample prompt below.');
        } else if (err.error === 'no-speech') {
          if (!isHoldingRef.current) {
            setMicState('IDLE');
          }
        } else {
          setMicState('ERROR');
          setMicErrorMessage(`Speech recognition error: ${err.error || 'Check microphone'}. Use quick prompts below.`);
        }
      };

      reco.onend = () => {
        // If user is still holding down the mouse or touch, restart speech recognition seamlessly
        if (isHoldingRef.current) {
          try {
            reco.start();
            setMicState('LISTENING');
          } catch (e) {
            setMicState('IDLE');
          }
        } else {
          setMicState(prev => (prev === 'LISTENING' ? 'IDLE' : prev));
        }
      };

      recognitionRef.current = reco;
    } catch (e: any) {
      console.warn('Error setting up speech recognition:', e);
      setMicState('UNSUPPORTED');
    }
  }, [currentLang]);

  // Global window release listener: ensures dragging mouse anywhere outside button boundary still cleanly finishes hold
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (isHoldingRef.current) {
        finishHold(false);
      }
    };
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('mouseup', handleGlobalRelease);
    return () => {
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('mouseup', handleGlobalRelease);
    };
  }, [transcript]);

  // Start holding to talk (Push-to-Talk)
  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}

    sounds.playClick();
    setMicErrorMessage(null);
    setIsHolding(true);
    isHoldingRef.current = true;
    holdStartTimeRef.current = Date.now();
    hasDispatchedRef.current = false;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragCancelling(false);
    isDragCancellingRef.current = false;

    // Reset transcription accumulator for new utterance
    transcriptAccumulatorRef.current = '';
    setTranscript('');
    setAgentReply('');
    setAgentIntent(null);
    setAgentAction(null);

    if (!recognitionRef.current) {
      setMicErrorMessage('Microphone not available in this browser view. Touch any quick voice prompt below or type your request!');
      return;
    }

    try {
      recognitionRef.current.lang = currentLang === 'ta' ? 'ta-IN' : currentLang === 'te' ? 'te-IN' : currentLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
      setMicState('LISTENING');
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        setMicState('LISTENING');
      } else {
        setMicState('PERMISSION_DENIED');
        setMicErrorMessage('Could not open microphone. Please allow microphone permission in your browser.');
      }
    }
  };

  // Track mouse dragging or touch movement while holding
  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isHoldingRef.current || !pointerDownPosRef.current) return;
    const dy = pointerDownPosRef.current.y - e.clientY;
    const dx = pointerDownPosRef.current.x - e.clientX;
    // If dragged substantially up or away (> 110px), enter cancel preview state
    const shouldCancel = dy > 110 || dx > 130;
    setIsDragCancelling(shouldCancel);
    isDragCancellingRef.current = shouldCancel;
  };

  // Finish holding to talk - dispatches complete sentence/sentences
  const finishHold = (eOrCancelled: React.PointerEvent<HTMLButtonElement> | boolean) => {
    const isExplicitCancel = typeof eOrCancelled === 'boolean' ? eOrCancelled : false;
    if (typeof eOrCancelled === 'object' && eOrCancelled.preventDefault) {
      eOrCancelled.preventDefault();
      try {
        if (eOrCancelled.currentTarget.hasPointerCapture(eOrCancelled.pointerId)) {
          eOrCancelled.currentTarget.releasePointerCapture(eOrCancelled.pointerId);
        }
      } catch (err) {}
    }

    if (!isHoldingRef.current && micState !== 'LISTENING') return;

    const wasHolding = isHoldingRef.current;
    const holdDuration = Date.now() - holdStartTimeRef.current;
    const wasCancelled = isExplicitCancel || isDragCancellingRef.current;

    isHoldingRef.current = false;
    setIsHolding(false);
    setIsDragCancelling(false);
    isDragCancellingRef.current = false;
    pointerDownPosRef.current = null;

    if (wasCancelled) {
      // Discard recording
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setMicState('IDLE');
      setTranscript('');
      return;
    }

    // If it was a quick click (< 280ms) and user did not speak yet, keep hands-free listening active
    if (holdDuration < 280 && wasHolding && !transcriptAccumulatorRef.current.trim()) {
      return;
    }

    // Stop recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setMicState('IDLE');

    // Give 250ms buffer for any pending speech engine results to finish, then send query
    setTimeout(() => {
      if (hasDispatchedRef.current) return;
      const fullText = (transcriptAccumulatorRef.current || transcript).trim();
      if (fullText.length > 0) {
        hasDispatchedRef.current = true;
        handleSendQuery(fullText);
      }
    }, 250);
  };

  // Support tap to toggle if in hands-free mode
  const handleToggleClick = () => {
    if (micState === 'LISTENING' && !isHoldingRef.current) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setMicState('IDLE');
      const text = (transcriptAccumulatorRef.current || transcript).trim();
      if (text.length > 0 && !hasDispatchedRef.current) {
        hasDispatchedRef.current = true;
        handleSendQuery(text);
      }
    }
  };

  // Dispatch query to Backend Multi-Agent System
  const handleSendQuery = async (queryText: string) => {
    if (!queryText || !queryText.trim()) return;
    setIsProcessing(true);
    sounds.playClick();

    // Stop recognition if running
    if (recognitionRef.current && micState === 'LISTENING') {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setMicState('IDLE');
    }

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText.trim(),
          lang: currentLang,
          kioskId: 'KIOSK-01',
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setAgentReply(data.response || 'Request processed.');
      setAgentIntent(data.intent || 'GENERAL_QUERY');
      setAgentAction(data);

      // Play audio response via TTS
      setIsSpeaking(true);
      speakText(data.response, currentLang, slowSpeech);
      setTimeout(() => setIsSpeaking(false), 4000);

      // Trigger high priority emergency if detected
      if (data.isEmergency || data.intent === 'EMERGENCY_ESCALATION') {
        sounds.playEmergency();
      }
    } catch (err: any) {
      console.error('Agent chat error:', err);
      const fallbackMsg = currentLang === 'ta'
        ? 'தகவல் செயலாக்க முடியவில்லை. தயவுசெய்து மீண்டும் பேசவும் அல்லது கீழே உள்ள பொத்தானை அழுத்தவும்.'
        : currentLang === 'te'
        ? 'సమాచారాన్ని ప్రాసెస్ చేయలేకపోయాము. దయచేసి మళ్లీ మాట్లాడండి లేదా క్రింది బటన్ నొక్కండి.'
        : currentLang === 'hi'
        ? 'अनुरोध संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।'
        : 'Could not connect to hospital assistant service. Please speak again or touch any option below.';
      setAgentReply(fallbackMsg);
      speakText(fallbackMsg, currentLang, slowSpeech);
    } finally {
      setIsProcessing(false);
    }
  };

  // User confirmed action button click
  const handleExecuteAction = () => {
    sounds.playClick();
    if (!agentAction) return;

    const { intent, suggestedAction, routeData, isEmergency } = agentAction;

    if (isEmergency || intent === 'EMERGENCY_ESCALATION' || suggestedAction === 'SHOW_EMERGENCY_MODAL') {
      if (onEmergencyTrigger) onEmergencyTrigger();
      if (onIntentDispatched) onIntentDispatched('EMERGENCY_ESCALATION');
      onClose();
    } else if (suggestedAction === 'OPEN_SCANNER' || intent === 'SCAN_OP_SLIP') {
      if (onActionTrigger) onActionTrigger('scan_op');
      if (onIntentDispatched) onIntentDispatched('SCAN_OP_SLIP');
      onClose();
    } else if (suggestedAction === 'SELECT_DEPARTMENT' || intent === 'OPD_ROUTING') {
      const deptId = routeData?.departmentId || 'dept-gm';
      if (onActionTrigger) onActionTrigger('department', deptId);
      if (onIntentDispatched) onIntentDispatched('DEPARTMENT_ROUTED', { departmentId: deptId });
      onClose();
    } else if (suggestedAction === 'SHOW_MAP' || intent === 'FIND_ROOM') {
      const roomNo = routeData?.roomNo || '102';
      if (onActionTrigger) onActionTrigger('hospital_map', roomNo);
      if (onIntentDispatched) onIntentDispatched('FIND_ROOM', { roomNo });
      onClose();
    } else if (intent === 'CHECK_QUEUE') {
      if (onActionTrigger) onActionTrigger('queue_board');
      if (onIntentDispatched) onIntentDispatched('CHECK_QUEUE');
      onClose();
    } else {
      onClose();
    }
  };

  // Replay speech button
  const handleReplayVoice = () => {
    if (!agentReply) return;
    sounds.playClick();
    setIsSpeaking(true);
    speakText(agentReply, currentLang, slowSpeech);
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  // Stop speech
  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-teal-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {t('action_voice_assist', currentLang)}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold">
                  GEMINI 3.8 FLASH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI Hospital Assistant • Speak in தமிழ், English, or हिन्दी
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Speed Toggle for elderly patients */}
            <button
              id="btn-toggle-slow-speech"
              onClick={() => {
                sounds.playClick();
                setSlowSpeech(!slowSpeech);
              }}
              className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center space-x-1 font-semibold transition-all ${
                slowSpeech
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Voice playback speed"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{slowSpeech ? 'Slow Voice' : 'Normal Voice'}</span>
            </button>

            <button
              id="btn-close-voice-modal"
              onClick={() => {
                sounds.playClick();
                handleStopSpeaking();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Centerpiece: Microphone Button with Active Soundwave Rings */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative">
            {(micState === 'LISTENING' || isHolding) && (
              <>
                <div className={`absolute inset-0 rounded-full animate-ping ${isDragCancelling ? 'bg-red-600/30' : 'bg-red-500/30'}`} />
                <div className={`absolute -inset-3 rounded-full animate-pulse ${isDragCancelling ? 'bg-red-600/20' : 'bg-red-500/20'}`} />
                <div className={`absolute -inset-6 rounded-full animate-pulse duration-1000 ${isDragCancelling ? 'bg-red-600/10' : 'bg-red-500/10'}`} />
              </>
            )}

            <button
              id="btn-toggle-mic-recording"
              type="button"
              draggable={false}
              onPointerDown={startHold}
              onPointerMove={handlePointerMove}
              onPointerUp={finishHold}
              onPointerCancel={finishHold}
              onClick={handleToggleClick}
              className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl select-none touch-none cursor-pointer active:scale-95 ${
                isDragCancelling
                  ? 'bg-gradient-to-br from-red-700 to-rose-900 text-white scale-95 shadow-red-700/50 ring-4 ring-red-400'
                  : micState === 'LISTENING' || isHolding
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white scale-105 shadow-red-500/40 ring-4 ring-red-400/50'
                  : 'bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 text-slate-950 hover:scale-105 shadow-teal-500/40 hover:brightness-110'
              }`}
            >
              {isDragCancelling ? (
                <>
                  <X className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse text-white" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-center px-1">Release to Cancel</span>
                </>
              ) : micState === 'LISTENING' || isHolding ? (
                <>
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-center px-1">
                    {isHolding ? 'Release to Send' : 'Listening...'}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1">Hold to Speak</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-1.5 max-w-md px-2">
            <p className="text-base font-extrabold text-white">
              {isDragCancelling
                ? currentLang === 'ta'
                  ? 'பதிவை அழிக்க இங்கே விடுவிக்கவும்'
                  : currentLang === 'te'
                  ? 'రికార్డింగ్ రద్దు చేయడానికి ఇక్కడ వదిలేయండి'
                  : currentLang === 'hi'
                  ? 'रद्द करने के लिए यहाँ छोड़ें'
                  : 'Release here to cancel recording'
                : isHolding || micState === 'LISTENING'
                ? currentLang === 'ta'
                  ? '🎙️ கேட்கிறது... முழுமையாக பேசி முடித்ததும் விடவும்!'
                  : currentLang === 'te'
                  ? '🎙️ వింటున్నది... పూర్తిగా మాట్లాడిన తర్వాత వదిలేయండి!'
                  : currentLang === 'hi'
                  ? '🎙️ सुन रहा है... पूरा बोलने के बाद छोड़ें!'
                  : '🎙️ Listening... Hold while speaking. Release when finished!'
                : currentLang === 'ta'
                ? 'முழு வாக்கியங்களை பேச மைக்-ஐ அழுத்திப் பிடிக்கவும்'
                : currentLang === 'te'
                ? 'పూర్తి వాక్యాలు మాట్లాడటానికి మైక్ నొక్కి పట్టుకోండి'
                : currentLang === 'hi'
                ? 'पूरा वाक्य बोलने के लिए माइक दबाकर रखें'
                : 'Hold microphone until you finish speaking'}
            </p>

            <p className="text-xs text-slate-400 font-medium">
              {isHolding
                ? currentLang === 'ta'
                  ? '2 அல்லது 3 வாக்கியங்களை தொடர்ச்சியாக பேசலாம் • ரத்து செய்ய மேலே இழுக்கவும்'
                  : currentLang === 'te'
                  ? '2 లేదా 3 వాక్యాలు మాట్లాడవచ్చు • రద్దు చేయడానికి పైకి లాగండి'
                  : currentLang === 'hi'
                  ? '2-3 वाक्य लगातार बोल सकते हैं • रद्द करने के लिए ऊपर खींचे'
                  : 'Speak 2-3 full sentences • Release to send • Drag away to cancel'
                : currentLang === 'ta'
                ? 'மவுஸ் அல்லது தொடுதிரையில் அழுத்திப் பேசவும் • பேசி முடித்ததும் அனுப்ப விடவும்'
                : currentLang === 'te'
                ? 'మౌస్ లేదా టచ్‌తో నొక్కి మాట్లాడండి • మాట్లాడటం అయ్యాక పంపడానికి వదిలేయండి'
                : currentLang === 'hi'
                ? 'माउस या टच से दबाकर बोलें • बोलने के बाद भेजने के लिए छोड़ें'
                : 'Hold mouse/touch to speak full sentences • Release to send'}
            </p>

            {/* Hands-free mode control (if mic is active without continuous hold) */}
            {micState === 'LISTENING' && !isHolding && (
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  id="btn-voice-finish-speaking"
                  onClick={() => finishHold(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-1.5 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {currentLang === 'ta'
                      ? 'பேசி முடித்தேன் / அனுப்பு'
                      : currentLang === 'te'
                      ? 'పూర్తయింది / పంపు'
                      : currentLang === 'hi'
                      ? 'बोलना पूरा हुआ / भेजें'
                      : 'Done Speaking / Send'}
                  </span>
                </button>
                <button
                  id="btn-voice-cancel-mic"
                  onClick={() => finishHold(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Soundwave Simulation Indicator during speech */}
            {(micState === 'LISTENING' || isHolding) && (
              <div className="flex items-center justify-center space-x-1 py-1">
                {[12, 24, 16, 32, 20, 28, 14, 22].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full animate-pulse ${isDragCancelling ? 'bg-red-500' : 'bg-red-400'}`}
                    style={{
                      height: `${height}px`,
                      animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Notification/Help banner if mic permission was denied */}
            {micErrorMessage && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs inline-flex items-center space-x-1.5 mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{micErrorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Transcript / Typed Input Box */}
        <div className="space-y-3">
          <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
            <input
              id="input-voice-manual-query"
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendQuery(transcript);
              }}
              placeholder={
                currentLang === 'ta'
                  ? 'உங்கள் குரல் இங்கே தோன்றும் அல்லது இங்கே தட்டச்சு செய்யவும்...'
                  : currentLang === 'te'
                  ? 'మీ మాట ఇక్కడ కనిపిస్తుంది లేదా ఇక్కడ టైప్ చేయండి...'
                  : currentLang === 'hi'
                  ? 'यहाँ अपनी समस्या बोलें या लिखें...'
                  : 'Spoken speech appears here, or type your query...'
              }
              className="bg-transparent border-none text-white text-sm sm:text-base font-medium focus:outline-none flex-1 placeholder-slate-500"
            />

            {transcript.trim().length > 0 && (
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  id="btn-clear-transcript"
                  type="button"
                  onClick={() => {
                    setTranscript('');
                    transcriptAccumulatorRef.current = '';
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>

                <button
                  id="btn-submit-voice-text"
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleSendQuery(transcript)}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all shrink-0"
                >
                  <span>{isProcessing ? 'Thinking...' : 'Send'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* AI Response Bubble */}
          {agentReply && (
            <div className="bg-gradient-to-r from-teal-950/60 via-slate-900 to-emerald-950/40 border-2 border-teal-500/40 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-teal-900/60 pb-2">
                <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span>AI Hospital Assistant Response:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReplayVoice}
                    className="p-1.5 rounded-lg bg-teal-900/40 hover:bg-teal-900/80 text-teal-300 text-xs flex items-center space-x-1"
                    title="Play Audio"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Speak</span>
                  </button>
                  {isSpeaking && (
                    <button
                      onClick={handleStopSpeaking}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                      title="Stop Audio"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-100 font-semibold leading-relaxed">
                {agentReply}
              </p>

              {/* Action Button to Immediately Jump into Workflow */}
              {agentAction && (
                <div className="pt-2">
                  {agentAction.isEmergency || agentAction.intent === 'EMERGENCY_ESCALATION' ? (
                    <button
                      id="btn-voice-execute-emergency"
                      onClick={handleExecuteAction}
                      className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-red-600/40 transition-all animate-pulse"
                    >
                      <AlertTriangle className="w-5 h-5" />
                      <span>Proceed Immediately to Room 001 Casualty →</span>
                    </button>
                  ) : agentAction.suggestedAction === 'SELECT_DEPARTMENT' ? (
                    <button
                      id="btn-voice-execute-dept"
                      onClick={handleExecuteAction}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/30 hover:brightness-110 transition-all"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Proceed to OPD Registration Desk →</span>
                    </button>
                  ) : agentAction.suggestedAction === 'OPEN_SCANNER' ? (
                    <button
                      id="btn-voice-execute-scanner"
                      onClick={handleExecuteAction}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>Open Document Scanner (OCR) →</span>
                    </button>
                  ) : agentAction.suggestedAction === 'SHOW_MAP' ? (
                    <button
                      id="btn-voice-execute-map"
                      onClick={handleExecuteAction}
                      className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition-all"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Open Hospital Map &amp; Navigation →</span>
                    </button>
                  ) : (
                    <button
                      id="btn-voice-dismiss"
                      onClick={handleExecuteAction}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>Got It / Continue</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Voice Prompt Buttons (One-Tap Voice Queries) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
            <span className="font-bold uppercase tracking-wider text-slate-300">
              One-Tap Voice Requests (Click to Speak):
            </span>
            <span className="text-[11px] text-teal-400">Works without microphone</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voiceCategories.flatMap(c => c.prompts).map((p, idx) => (
              <button
                key={idx}
                id={`btn-voice-quick-prompt-${idx}`}
                onClick={() => {
                  setTranscript(p.text);
                  handleSendQuery(p.text);
                }}
                className="text-left text-xs p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-400 text-slate-200 hover:text-white transition-all flex items-start space-x-2 group active:scale-98"
              >
                <div className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                  <Mic className="w-3 h-3" />
                </div>
                <span className="line-clamp-2 leading-tight">&ldquo;{p.text}&rdquo;</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
