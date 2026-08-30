'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLogistics } from '@/context/LogisticsContext';
import { 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Copy, 
  Check, 
  Radio, 
  MessageSquare, 
  ExternalLink,
  ShieldAlert,
  Power,
  ShieldCheck,
  UserCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders
} from 'lucide-react';
import { PendingAIAction } from '@/types/logistics';

interface AICopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  trackingIds?: string[];
  proposedAction?: PendingAIAction;
  actionStatus?: 'pending' | 'approved' | 'rejected' | 'executed' | 'blocked';
}

let globalMsgCounter = 0;
const createMessageId = (prefix: string) => {
  globalMsgCounter += 1;
  return `${prefix}-${globalMsgCounter}`;
};

export const AICopilotModal: React.FC<AICopilotModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { 
    shipments, 
    drivers, 
    alerts, 
    role, 
    setTrackedShipmentId, 
    setActiveNavSection,
    initialCopilotPrompt,
    aiGovernance,
    toggleAIMasterSwitch,
    executeOrQueueAIAction,
    approveAIAction,
    rejectAIAction
  } = useLogistics();

  // Mode state: 'voice' for direct spoken conversation, 'chat' for message stream
  const [activeMode, setActiveMode] = useState<'voice' | 'chat'>('voice');
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  });
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceSubmitRef = useRef<(text: string) => void>(() => {});
  const startListeningRef = useRef<() => void>(() => {});
  const lastHandledPromptRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-init',
      role: 'assistant',
      text: "Hello! I'm your DHL Air & Ground AI Voice Copilot. You can talk to me directly using your microphone or type any question. Ask me about live package locations, delivery delays, courier assignments, tariffs, or route optimization.",
      timestamp: 'Just now',
    },
  ]);

  // Extract DHL Tracking IDs from text
  const extractTrackingIds = (text: string): string[] => {
    const regex = /DHL-\d{4}-\d{2}/gi;
    const matches = text.match(regex);
    return matches ? Array.from(new Set(matches.map((m) => m.toUpperCase()))) : [];
  };

  // Parse structured action JSON from AI response
  const parseActionBlock = (text: string): { cleanText: string; action: any | null } => {
    const actionRegex = /```(?:json:action|json)\s*([\s\S]*?)\s*```/;
    const match = text.match(actionRegex);
    if (!match) {
      return { cleanText: text, action: null };
    }

    try {
      const parsed = JSON.parse(match[1]);
      if (parsed && (parsed.actionType || parsed.action_type)) {
        const cleanText = text.replace(actionRegex, '').trim();
        return {
          cleanText,
          action: {
            actionType: parsed.actionType || parsed.action_type,
            title: parsed.title || 'AI Recommended Action',
            description: parsed.description || 'Proposed operational modification by AI Copilot',
            payload: parsed.payload || parsed.data || {},
          },
        };
      }
    } catch (e) {
      // not valid json, ignore
    }
    return { cleanText: text, action: null };
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    stopSpeaking();
    if (recognitionRef.current && !isListening) {
      try {
        setSpeechTranscript('');
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Error starting speech recognition:', err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    startListeningRef.current = startListening;
  });

  const speakText = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !autoSpeak) return;

    window.speechSynthesis.cancel();

    const cleanSpeech = text
      .replace(/[*#_`>]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    if (!cleanSpeech) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [autoSpeak]);

  // Navigate to live tracking for a specific waybill
  const handleTrackShipment = (trackingId: string) => {
    setTrackedShipmentId(trackingId);
    setActiveNavSection('orders_tracking');
    stopSpeaking();
    stopListening();
    onClose();
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleApproveProposedAction = (actionId: string, messageId: string) => {
    const res = approveAIAction(actionId);
    setActionFeedback(res.message);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, actionStatus: 'approved' } : msg
      )
    );
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRejectProposedAction = (actionId: string, messageId: string) => {
    const res = rejectAIAction(actionId, 'SuperAdmin dismissed via Copilot');
    setActionFeedback(res.message);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, actionStatus: 'rejected' } : msg
      )
    );
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Main submission handler
  const handleSend = useCallback(async (customText?: string, wasSpoken: boolean = false) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: createMessageId('user'),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setSpeechTranscript('');
    setLoading(true);

    const delayedShipments = shipments.filter((s) => s.status === 'Delayed' || s.flaggedForDelay);

    const contextData = {
      activeShipmentsCount: shipments.length,
      delayedShipmentsCount: delayedShipments.length,
      onTimeRate: '96.4',
      alertsCount: alerts.filter((a) => !a.resolved).length,
      driverCount: drivers.length,
      userRole: role,
      aiGovernance,
      delayedShipments: delayedShipments.map((s) => ({
        trackingId: s.trackingId,
        delayReason: s.delayReason || 'Customs Clearance Inspection',
        customer: s.customerName,
        destination: s.destinationCity || s.destCity,
      })),
      shipmentsSummary: shipments.slice(0, 6).map((s) => ({
        trackingId: s.trackingId,
        status: s.status,
        origin: s.originCity,
        destination: s.destinationCity || s.destCity,
        customer: s.customerName,
        carrier: s.carrier || 'DHL Express',
        eta: s.estimatedDelivery,
      })),
      driversSummary: drivers.slice(0, 5).map((d) => ({
        id: d.id,
        name: d.name,
        status: d.status,
        vehicleNo: d.vehicleNo,
        vehicleType: d.vehicleType,
        phone: d.phone,
      })),
      alertsSummary: alerts.slice(0, 3).map((a) => ({
        message: a.message,
        type: a.type,
        severity: a.severity,
        resolved: a.resolved,
      })),
    };

    try {
      const res = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: textToSend, 
          contextData,
          voiceMode: activeMode === 'voice' || wasSpoken
        }),
      });

      const data = await res.json();
      const rawReply = data.result || data.error || 'No response received from AI server.';
      
      // Parse any action block from the model
      const { cleanText, action } = parseActionBlock(rawReply);
      const detectedIds = extractTrackingIds(cleanText);

      let createdAction: PendingAIAction | undefined = undefined;
      let actionStatus: Message['actionStatus'] = undefined;

      if (action) {
        const executionResult = executeOrQueueAIAction(action);
        if (executionResult.action) {
          createdAction = executionResult.action;
          actionStatus = executionResult.status as any;
        }
      }

      const assistantMsg: Message = {
        id: createMessageId('assistant'),
        role: 'assistant',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        trackingIds: detectedIds,
        proposedAction: createdAction,
        actionStatus: actionStatus,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Trigger text-to-speech if auto-speak is enabled or user spoke
      if (autoSpeak || wasSpoken || activeMode === 'voice') {
        speakText(cleanText);
      }
    } catch (err: any) {
      const errorMsg = 'Failed to connect to AI server. Please check your network or server configuration.';
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('error'),
          role: 'assistant',
          text: errorMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [inputPrompt, loading, shipments, alerts, drivers, role, aiGovernance, activeMode, autoSpeak, speakText, executeOrQueueAIAction]);

  const handleVoiceSubmitted = useCallback((transcript: string) => {
    if (!transcript.trim()) return;
    handleSend(transcript, true);
  }, [handleSend]);

  useEffect(() => {
    voiceSubmitRef.current = handleVoiceSubmitted;
  }, [handleVoiceSubmitted]);

  useEffect(() => {
    if (activeMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeMode, loading]);

  useEffect(() => {
    if (isOpen && initialCopilotPrompt && lastHandledPromptRef.current !== initialCopilotPrompt) {
      lastHandledPromptRef.current = initialCopilotPrompt;
      const timer = setTimeout(() => {
        handleSend(initialCopilotPrompt);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialCopilotPrompt, handleSend]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechTranscript('');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setSpeechTranscript(currentTranscript);
          if (event.results[0].isFinal) {
            voiceSubmitRef.current(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition initialization failed', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  const samplePrompts = [
    { label: 'Where is package DHL-8942-01?', prompt: 'Where is package DHL-8942-01 right now and what is its ETA?' },
    { label: 'Show delayed shipments', prompt: 'Which shipments are currently delayed and what is the root cause?' },
    { label: 'Advance status of DHL-8942-01', prompt: 'Advance the status of shipment DHL-8942-01 to In Transit' },
    { label: 'Assign courier to shipment', prompt: 'Assign available driver Marcus Vance to pending shipment DHL-8942-04' },
    { label: 'Calculate 10kg shipping tariff', prompt: 'How much would it cost to ship a 10kg urgent package from Munich to London?' },
    { label: 'Broadcast weather alert', prompt: 'Broadcast a severe weather warning alert for Alpine snowfall on route MUC-FRA' },
  ];

  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-3xl h-[88vh] max-h-[780px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-gray-950 px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D40511] to-[#FFCC00] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  DHL AI Operations & Voice Copilot
                </h3>
                {/* Governance Status Pill */}
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center space-x-1 ${
                  aiGovernance.aiEnabled
                    ? aiGovernance.dataAccessMode === 'human_in_the_loop'
                      ? 'bg-amber-500/20 text-[#FFCC00] border border-amber-400/40'
                      : aiGovernance.dataAccessMode === 'read_only'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-red-600/30 text-red-300 border border-red-500/50'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${aiGovernance.aiEnabled ? 'bg-emerald-400' : 'bg-red-500'}`} />
                  <span>
                    {aiGovernance.aiEnabled
                      ? aiGovernance.dataAccessMode === 'human_in_the_loop'
                        ? 'HITL (Supervised Write)'
                        : aiGovernance.dataAccessMode === 'read_only'
                        ? 'Read-Only Mode'
                        : 'Autonomous Read-Write'
                      : 'AI Paused (SuperAdmin)'}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Spoken voice commands, real-time waybill tracking & human-in-the-loop dispatch governance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Readout Mute Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) stopSpeaking();
                setAutoSpeak(!autoSpeak);
              }}
              title={autoSpeak ? 'Voice output enabled (click to mute)' : 'Voice output muted (click to unmute)'}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 ${
                autoSpeak ? 'bg-gray-800 text-amber-300 hover:bg-gray-700' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-[#FFCC00]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button 
              onClick={() => {
                stopSpeaking();
                stopListening();
                onClose();
              }} 
              className="p-2 rounded-xl bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI OFF NOTIFICATION BANNER */}
        {!aiGovernance.aiEnabled && (
          <div className="bg-red-950/90 border-b border-red-800 px-5 py-2.5 flex items-center justify-between text-xs text-red-200">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>
                <strong>AI Copilot is Paused by SuperAdmin</strong> under Human-in-the-Loop policy. Queries will return offline notices.
              </span>
            </div>
            {role === 'superadmin' && (
              <button
                onClick={() => toggleAIMasterSwitch(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1 shrink-0"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Resume AI (Turn ON)</span>
              </button>
            )}
          </div>
        )}

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-emerald-900/90 border-b border-emerald-700 px-5 py-2 flex items-center justify-between text-xs text-emerald-100 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{actionFeedback}</span>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="bg-gray-900 px-5 py-2 flex items-center justify-between border-b border-gray-800 text-xs">
          <div className="flex items-center space-x-1 bg-gray-950 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => {
                setActiveMode('voice');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'voice'
                  ? 'bg-[#D40511] text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Talk to AI (Voice)</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('chat');
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'chat'
                  ? 'bg-[#FFCC00] text-gray-950 shadow font-extrabold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat & History ({messages.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-[11px] text-gray-400">
            {role === 'superadmin' && (
              <button
                onClick={() => {
                  setActiveNavSection('utility_settings');
                  onClose();
                }}
                className="text-amber-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <Sliders className="w-3 h-3" />
                <span>Governance Console</span>
              </button>
            )}

            {isSpeaking && (
              <span className="flex items-center text-amber-400 font-bold animate-pulse">
                <Volume2 className="w-3.5 h-3.5 mr-1" />
                AI Speaking...
              </span>
            )}
            {isListening && (
              <span className="flex items-center text-red-400 font-bold animate-pulse">
                <Radio className="w-3.5 h-3.5 mr-1" />
                Listening to you...
              </span>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {activeMode === 'voice' ? (
          /* =================== VOICE CONVERSATION MODE =================== */
          <div className="flex-1 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-6 flex flex-col justify-between overflow-y-auto">
            
            {/* Top Assistant Status & Last Output */}
            <div className="space-y-4">
              <div className="bg-gray-800/80 backdrop-blur border border-gray-700/70 rounded-2xl p-4.5 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-[#FFCC00] uppercase flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#FFCC00]" />
                    AI Spoken Response
                  </span>
                  <div className="flex items-center space-x-2">
                    {latestAssistantMessage && (
                      <button
                        onClick={() => speakText(latestAssistantMessage.text)}
                        title="Replay speech"
                        className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isSpeaking && (
                      <button
                        onClick={stopSpeaking}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded"
                      >
                        Stop Audio
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed max-h-36 overflow-y-auto custom-scrollbar font-medium">
                  {loading ? (
                    <div className="flex items-center space-x-2 text-amber-300 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFCC00]" />
                      <span className="font-semibold">Processing your question with DHL Telematics...</span>
                    </div>
                  ) : latestAssistantMessage ? (
                    latestAssistantMessage.text
                  ) : (
                    "Ready. Press the microphone below and speak your question..."
                  )}
                </div>

                {/* Tracking Action Badges */}
                {latestAssistantMessage?.trackingIds && latestAssistantMessage.trackingIds.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-700/60 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-gray-400">Detected Waybills:</span>
                    {latestAssistantMessage.trackingIds.map((id) => (
                      <button
                        key={id}
                        onClick={() => handleTrackShipment(id)}
                        className="bg-[#D40511] hover:bg-red-700 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow transition"
                      >
                        <span>{id}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* If there's a proposed action on the latest message */}
                {latestAssistantMessage?.proposedAction && (
                  <div className="mt-3 p-3 bg-gray-900/90 border border-amber-500/50 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold flex items-center space-x-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Human-in-the-Loop Action Proposed</span>
                      </span>
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                        {latestAssistantMessage.actionStatus?.toUpperCase()}
                      </span>
                    </div>
                    <div className="font-semibold text-white">{latestAssistantMessage.proposedAction.title}</div>
                    {role === 'superadmin' && latestAssistantMessage.actionStatus === 'pending' && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => handleApproveProposedAction(latestAssistantMessage.proposedAction!.id, latestAssistantMessage.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve & Apply Live</span>
                        </button>
                        <button
                          onClick={() => handleRejectProposedAction(latestAssistantMessage.proposedAction!.id, latestAssistantMessage.id)}
                          className="bg-gray-700 hover:bg-red-900 text-gray-200 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Live Speech Recognition Captions */}
              {isListening && (
                <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 text-center animate-pulse">
                  <span className="text-[11px] text-red-400 font-bold block mb-1">
                    LIVE SPEECH RECOGNITION
                  </span>
                  <p className="text-sm font-semibold text-white italic">
                    &quot;{speechTranscript || 'Listening... speak now'}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Central Animated Microphone & Audio Wave Orb */}
            <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center">
                {/* Visual pulsating ripples */}
                {(isListening || isSpeaking) && (
                  <>
                    <div className="absolute w-44 h-44 rounded-full bg-red-600/20 animate-ping"></div>
                    <div className="absolute w-36 h-36 rounded-full bg-amber-500/20 animate-pulse"></div>
                  </>
                )}

                <button
                  onClick={toggleListening}
                  disabled={loading}
                  className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
                    isListening
                      ? 'bg-gradient-to-tr from-red-600 to-red-500 text-white ring-4 ring-red-400/50 scale-105'
                      : isSpeaking
                      ? 'bg-gradient-to-tr from-amber-500 to-amber-400 text-gray-950 ring-4 ring-amber-300/50'
                      : 'bg-gradient-to-tr from-[#D40511] to-red-600 hover:from-red-600 hover:to-red-500 text-white ring-4 ring-red-900/30'
                  }`}
                  aria-label={isListening ? 'Stop Listening' : 'Start Talking to AI'}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-9 h-9 sm:w-10 sm:h-10 animate-bounce" />
                      <span className="text-[10px] font-black tracking-wider uppercase mt-1">Listening</span>
                    </>
                  ) : isSpeaking ? (
                    <>
                      <Volume2 className="w-9 h-9 sm:w-10 sm:h-10 animate-pulse" />
                      <span className="text-[10px] font-black tracking-wider uppercase mt-1">Speaking</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-9 h-9 sm:w-10 sm:h-10" />
                      <span className="text-[10px] font-black tracking-wider uppercase mt-1">Tap to Talk</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Audio Visualizer Bar simulator */}
              <div className="mt-5 flex items-center justify-center space-x-1.5 h-6">
                {[12, 24, 18, 30, 20, 28, 14, 22, 16, 26, 12].map((height, i) => (
                  <span
                    key={i}
                    style={{
                      height: isListening || isSpeaking ? `${Math.max(6, (height * (isListening ? 1.4 : 1)) % 32)}px` : '4px',
                      transition: 'height 0.15s ease-in-out',
                    }}
                    className={`w-1 rounded-full ${
                      isListening
                        ? 'bg-red-400'
                        : isSpeaking
                        ? 'bg-[#FFCC00]'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-2 font-medium">
                {isListening
                  ? 'Speak clearly into your microphone — auto sends on pause'
                  : speechSupported
                  ? 'Click the microphone to start talking to the DHL AI Assistant'
                  : 'Microphone speech recognition is not supported in this browser. Please use keyboard chat.'}
              </p>
            </div>

            {/* Bottom Quick Voice Suggestion Chips */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Quick Voice Questions (Click or Speak):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-left">
                {samplePrompts.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.prompt, true)}
                    className="p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 border border-gray-700/60 text-[11px] text-gray-200 hover:text-white flex items-center justify-between transition-all group"
                  >
                    <span className="truncate">{p.label}</span>
                    <Sparkles className="w-3 h-3 text-[#FFCC00] opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* =================== TEXT CHAT & HISTORY MODE =================== */
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-gray-400">
                    <span className="font-bold capitalize">{m.role === 'user' ? 'You' : 'DHL Copilot'}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[90%] p-4 rounded-2xl shadow-sm text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#D40511] text-white font-medium rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none font-sans'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Interactive Proposed Action Card (Human in the Loop) */}
                    {m.proposedAction && (
                      <div className="mt-3.5 p-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl space-y-2 text-gray-900">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5">
                            <UserCheck className="w-4 h-4 text-[#D40511]" />
                            <span className="font-black text-xs text-gray-900">
                              Human-in-the-Loop Operational Proposal
                            </span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            m.actionStatus === 'approved' || m.actionStatus === 'executed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : m.actionStatus === 'rejected'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          }`}>
                            {m.actionStatus === 'pending' ? 'Pending SuperAdmin Sign-Off' : m.actionStatus}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-gray-800">{m.proposedAction.title}</p>
                        <p className="text-[11px] text-gray-600">{m.proposedAction.description}</p>

                        {/* Action Details */}
                        <div className="bg-white p-2 rounded-lg border border-amber-100 font-mono text-[11px] text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
                          {m.proposedAction.payload.trackingId && (
                            <div>Waybill: <strong className="text-gray-900">{m.proposedAction.payload.trackingId}</strong></div>
                          )}
                          {m.proposedAction.payload.newStatus && (
                            <div>Status: <strong className="text-emerald-700">{m.proposedAction.payload.newStatus}</strong></div>
                          )}
                          {m.proposedAction.payload.driverName && (
                            <div>Driver: <strong className="text-blue-700">{m.proposedAction.payload.driverName}</strong></div>
                          )}
                          {m.proposedAction.payload.alertMessage && (
                            <div>Alert: <strong className="text-red-700">{m.proposedAction.payload.alertMessage}</strong></div>
                          )}
                        </div>

                        {/* SuperAdmin Approval Buttons */}
                        {m.actionStatus === 'pending' && (
                          <div className="pt-2 flex items-center space-x-2">
                            {role === 'superadmin' ? (
                              <>
                                <button
                                  onClick={() => handleApproveProposedAction(m.proposedAction!.id, m.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1 shadow transition-transform hover:scale-105"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve & Apply Live</span>
                                </button>
                                <button
                                  onClick={() => handleRejectProposedAction(m.proposedAction!.id, m.id)}
                                  className="bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <div className="text-[11px] text-gray-500 italic">
                                Action queued in SuperAdmin approval board.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* If tracking numbers found, offer 1-click lookup buttons */}
                    {m.trackingIds && m.trackingIds.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 font-bold">Actions:</span>
                        {m.trackingIds.map((id) => (
                          <button
                            key={id}
                            onClick={() => handleTrackShipment(id)}
                            className="bg-[#FFCC00] hover:bg-amber-400 text-gray-950 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center space-x-1 shadow-sm transition"
                          >
                            <span>Track {id}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mt-1 px-1">
                      <button
                        onClick={() => speakText(m.text)}
                        className="text-[10px] text-gray-500 hover:text-[#D40511] flex items-center space-x-1"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Read Aloud</span>
                      </button>
                      <span className="text-gray-300">•</span>
                      <button
                        onClick={() => copyToClipboard(m.text, m.id)}
                        className="text-[10px] text-gray-500 hover:text-gray-800 flex items-center space-x-1"
                        title="Copy to clipboard"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-700 border border-gray-200 p-3.5 rounded-2xl flex items-center space-x-2.5 shadow-sm">
                    <Loader2 className="w-4 h-4 text-[#D40511] animate-spin" />
                    <span className="text-xs font-semibold">Gemini 3.7 Flash is analyzing logistics context...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Sample Prompts Bar */}
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5 text-[10px]">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.prompt)}
                  className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 font-semibold transition-colors truncate max-w-[220px]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-gray-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Speak input"
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600 animate-pulse'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={
                    aiGovernance.aiEnabled
                      ? "Ask AI Copilot for route advice, tracking info, delay resolution..."
                      : "AI Copilot is Paused by SuperAdmin (Human-in-the-Loop policy)"
                  }
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs border border-gray-300 rounded-xl outline-none focus:border-[#D40511] text-gray-900 font-medium bg-white"
                />
                <button
                  type="submit"
                  disabled={loading || !inputPrompt.trim()}
                  className="bg-[#D40511] hover:bg-red-700 text-white p-2.5 rounded-xl shadow transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
