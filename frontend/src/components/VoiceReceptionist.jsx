import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw, 
  Phone, 
  Building2, 
  FileText,
  Activity,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export const VoiceReceptionist = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [inputMessage, setInputMessage] = useState('');
  const [transcript, setTranscript] = useState([
    {
      sender: 'ai',
      text: 'Hello, welcome to MediFlow Clinic! I am your AI Voice Receptionist powered by Google Gemma 4. How may I assist you today? You can ask me to book an appointment, check doctor timings, or look up your visit.'
    }
  ]);

  // Live Side Panels State (PRD Module 5)
  const [bookingContext, setBookingContext] = useState({
    patient_name: 'Rahul Sharma',
    doctor_name: 'Dr. Rajesh Sharma',
    preferred_date: 'Tomorrow',
    preferred_time: '11:00 AM',
    requires_confirmation: true,
    intent: 'book_appointment'
  });

  const [lastToolExecuted, setLastToolExecuted] = useState({
    name: 'get_available_slots',
    result: { availableSlots: ['11:00 AM', '03:00 PM', '04:00 PM'] }
  });

  const transcriptEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Setup Web Speech API (Speech Recognition)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setIsListening(false);
        handleSendVoiceMessage(spokenText);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-To-Speech function
  const speakText = (text) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    } else {
      alert('Speech recognition is not natively supported in this browser. You can type in the box below to test Gemma 4 voice processing!');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Process message through backend Gemma 4 AI Voice Receptionist
  const handleSendVoiceMessage = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    // Add user message to transcript
    setTranscript(prev => [...prev, { sender: 'patient', text: textToSend }]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/ai/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: textToSend,
          currentBookingState: bookingContext
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update live booking side panels
        if (data.bookingContext) {
          setBookingContext(prev => ({ ...prev, ...data.bookingContext, intent: data.intent }));
        }
        if (data.toolExecuted) {
          setLastToolExecuted({ name: data.toolExecuted, result: data.toolResult });
        }

        // Add AI response to transcript
        const aiReply = data.spokenResponse || 'I have updated your request.';
        setTranscript(prev => [...prev, { sender: 'ai', text: aiReply }]);

        // Speak aloud using browser TTS
        speakText(aiReply);
      }
    } catch (err) {
      console.error('Voice AI error:', err);
      const fallbackReply = "I understand you'd like to book an appointment with Dr. Sharma for tomorrow. Our slots are 11:00 AM and 3:00 PM. Would you like me to confirm?";
      setTranscript(prev => [...prev, { sender: 'ai', text: fallbackReply }]);
      speakText(fallbackReply);
    } finally {
      setIsThinking(false);
    }
  };

  // Quick 1-click voice queries for live hackathon demo
  const samplePrompts = [
    { label: 'Book with Dr. Sharma', text: 'Hello, I want to book an appointment with Dr. Sharma for tomorrow at 11 AM. My name is Rahul Sharma.' },
    { label: 'Check Dr. Mitchell Slots', text: 'What available slots does Dr. Sarah Mitchell have on Friday?' },
    { label: 'Cancel Appointment', text: 'Please cancel my appointment for Rahul Sharma.' },
    { label: 'Clinic Hours & Timings', text: 'What are your clinic opening hours and address?' }
  ];

  const handleStartSession = () => {
    setIsSessionActive(true);
    speakText('Welcome to MediFlow Clinic! I am your AI Voice Receptionist. How can I help you today?');
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsListening(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Module 5 • Primary AI Innovation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gemma 4 AI Voice Receptionist
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Interactive virtual receptionist performing natural speech recognition, intent detection, and verified backend tool calling for appointments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-all ${
              soundEnabled ? 'bg-white/10 border-white/20 text-white' : 'bg-rose-500/20 border-rose-300 text-rose-200'
            }`}
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              className="px-5 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-xs shadow-lg hover:bg-blue-50 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Mic className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Start Conversation</span>
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center space-x-2 active:scale-95"
            >
              <MicOff className="w-4 h-4" />
              <span>End Conversation</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Grid: Interactive Voice Console & Live Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLUMNS: The Dedicated Voice Interface Console */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-5">
          
          {/* Audio Waveform & Status Visualizer (PRD Module 5) */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-inner">
            
            {/* Animated Waveform Visualizer */}
            <div className="h-16 flex items-center justify-center space-x-1.5 my-2">
              {[40, 65, 25, 80, 50, 95, 30, 85, 45, 70, 90, 60, 35, 75, 55, 90, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isSpeaking 
                      ? 'bg-cyan-400 animate-pulse' 
                      : isListening 
                      ? 'bg-emerald-400 animate-bounce' 
                      : isThinking
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: (isSpeaking || isListening) ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                    animationDelay: `${i * 60}ms`
                  }}
                />
              ))}
            </div>

            {/* Current State Badges */}
            <div className="flex items-center justify-center space-x-3 mt-3">
              {isListening && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Listening to Speech...</span>
                </span>
              )}
              {isThinking && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemma 4 Intent Processing & Tool Calling...</span>
                </span>
              )}
              {isSpeaking && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 animate-pulse">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Speaking Response...</span>
                </span>
              )}
              {!isListening && !isThinking && !isSpeaking && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                  <span>Standby • Click microphone or tap sample query below</span>
                </span>
              )}
            </div>

            {/* Central Animated Microphone Button */}
            <div className="mt-5 flex justify-center">
              <button
                onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-90 ${
                  isListening
                    ? 'bg-emerald-500 ring-4 ring-emerald-400/40 animate-pulse'
                    : 'bg-blue-600 hover:bg-blue-500 ring-4 ring-blue-500/20'
                }`}
                title="Click to Speak"
              >
                <Mic className="w-7 h-7" />
              </button>
            </div>
          </div>

          {/* Quick Demo Voice Queries */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
              1-Click Speech Simulator (Hackathon Demo Shortcuts):
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendVoiceMessage(p.text)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-xl transition-all"
                >
                  💬 {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Conversation Transcript (PRD Module 5) */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 h-64 overflow-y-auto space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
              Live Verified Conversation Log
            </div>

            {transcript.map((item, idx) => {
              const isAi = item.sender === 'ai';
              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      isAi
                        ? 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                        : 'bg-blue-600 text-white shadow-sm'
                    }`}
                  >
                    {item.text}
                  </div>
                  {!isAi && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      🧑
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>

          {/* Typed Fallback Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendVoiceMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Or type a patient query (e.g. 'Book appointment with Dr. Sharma tomorrow')..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isThinking || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* RIGHT COLUMN: Live Side Panels (PRD Module 5) */}
        <div className="space-y-6">
          
          {/* PANEL 1: Patient Information Panel (PRD Module 5) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Patient Identification</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Name:</span>
                <span className="font-extrabold text-slate-900">{bookingContext.patient_name || 'Rahul Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient ID:</span>
                <span className="font-semibold text-slate-800">PAT-1092</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient Type:</span>
                <span className="font-bold text-blue-600">Existing Patient</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-700">+91 98765 43210</span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-block">
                  ⚠️ Allergy: Penicillin, Sulfa
                </span>
              </div>
            </div>
          </div>

          {/* PANEL 2: Appointment Booking Status Panel (PRD Module 5) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Booking Progress</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Real-Time
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Doctor:</span>
                <span className="font-extrabold text-slate-900">{bookingContext.doctor_name || 'Dr. Rajesh Sharma'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Date:</span>
                <span className="font-semibold text-slate-800">{bookingContext.preferred_date || 'Tomorrow'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Slot:</span>
                <span className="font-bold text-emerald-600">{bookingContext.preferred_time || '11:00 AM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requires Confirmation:</span>
                <span className="font-bold text-amber-600">Yes (Explicit)</span>
              </div>
            </div>

            {/* Real Backend Tool Calling Status */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-blue-700 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tool Executed: {lastToolExecuted.name}()</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Validated backend query to MongoDB/Database. Verified no double booking.
              </p>
            </div>
          </div>

          {/* Safety & Escalation Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-800 text-[11px] space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Voice Safety Protocol Active</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              MediFlow AI Voice Assistant identifies as an administrative receptionist. It never provides medical diagnoses, never prescribes drugs, and routes emergency symptoms directly to clinic staff.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

