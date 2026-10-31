import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  User,
  HeartPulse,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Volume2,
  Copy,
  Check,
  Send,
  Zap,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_DIALOGUES = [
  {
    title: 'Acute Fever, Sore Throat & Penicillin Allergy',
    specialty: 'Internal Medicine / General Practice',
    transcript: `Doctor: Good morning! Please have a seat. What brings you in to the clinic today?
Patient: Good morning doctor. I have been having a high fever for the past 3 days, around 101.2 degrees Fahrenheit, along with a really painful dry cough and severe throat irritation.
Doctor: I see. Let me examine you and check your vital signs first. Your blood pressure is 120/80 mmHg, pulse rate is 84 beats per minute, and oxygen saturation is 98 percent. Let me look at your throat... yes, the pharyngeal mucosa is visibly erythematous and congested, though chest sounds clear on auscultation. Are you allergic to any medications?
Patient: Yes doctor, I have a known severe allergy to Penicillin. It causes allergic skin hives.
Doctor: Very good you reminded me, we will strictly avoid all penicillin and beta-lactam antibiotics. I will prescribe Tab Paracetamol 650mg three times daily after meals for 3 days to control fever and pain. For the throat infection, you will take Tab Azithromycin 500mg once daily before lunch for 3 days.
Patient: Okay doctor. Any specific dietary advice or test needed?
Doctor: Drink plenty of warm water, at least 2.5 to 3 liters daily, and do warm salt water gargling three times a day. If your fever does not subside in 3 days, please get a Complete Blood Count CBC with ESR done. Come back for review on Monday.`
  },
  {
    title: 'Bilateral Knee Pain & Osteoarthritis',
    specialty: 'Orthopedics & Rheumatology',
    transcript: `Doctor: Hello! Tell me what problem you are facing.
Patient: Doctor, for the last 2 weeks I am having terrible pain in both my knees, especially the right knee. There is a lot of stiffness when I wake up in the morning and cracking sounds when climbing stairs.
Doctor: Let me check your vitals and knees. Blood pressure is 130/85 mmHg, pulse 76 bpm, temperature 98.4 F, and SpO2 is 99%. On examination, there is mild joint effusion and palpable crepitus in the right patellofemoral joint. No ligament laxity. This is characteristic of early Primary Osteoarthritis. Any drug allergies?
Patient: No allergies doctor.
Doctor: I am prescribing Tab Naproxen 250mg twice daily immediately after food for 5 days for pain and joint inflammation. To protect your stomach, take Cap Pantoprazole 40mg once daily empty stomach every morning for 5 days.
Patient: Should I get an X-ray done?
Doctor: Yes, please get an X-Ray of Bilateral Knees standing AP and lateral view. Also avoid sitting cross-legged and deep squatting. Apply hot fermentation twice daily. Follow up with the X-ray report in 5 days.`
  },
  {
    title: 'Type 2 Diabetes & Routine Glycemic Review',
    specialty: 'Endocrinology / Diabetes Care',
    transcript: `Doctor: Good day! How have you been feeling with your current diabetes medications?
Patient: Doctor, I have been feeling slightly fatigued lately, and I feel thirsty quite often. My fasting sugar at home was 145 mg/dL yesterday.
Doctor: Let us check your vitals. BP is 124/82 mmHg, pulse 74 bpm, temperature 98.6 F, SpO2 98%. Systemic examination is normal, pedal pulses palpable. Your glycemia requires minor dosage titration. Any allergies?
Patient: None reported doctor.
Doctor: I will adjust your Metformin dosage. Prescribing Tab Metformin 500mg twice daily with lunch and dinner for 30 days, along with a daily Multivitamin tablet.
Patient: Which lab tests should I get done before next visit?
Doctor: Please get Fasting Blood Sugar, Postprandial Blood Sugar, and an HbA1c test done at Apex Diagnostic Labs. Ensure at least 30 minutes of light brisk walking every day and avoid refined carbs. Review in 4 weeks with reports.`
  }
];

export const AmbientConsultationScribe = ({
  patientName = 'Patient',
  patientId = '',
  doctorName = 'Attending Physician',
  onApplyToWorkspace,
  isOpenDefault = false
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpenDefault);
  const [isListening, setIsListening] = useState(false);
  const [speaker, setSpeaker] = useState('Doctor'); // 'Doctor' | 'Patient'
  const [transcript, setTranscript] = useState('');
  const [currentSpeechChunk, setCurrentSpeechChunk] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisEngine, setAnalysisEngine] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState('summary'); // 'summary' | 'details' | 'rx' | 'soap'

  const recognitionRef = useRef(null);
  const transcriptEndRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let finalized = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalized += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (finalized) {
          setTranscript(prev => {
            const prefix = prev.trim() ? prev.trim() + '\n' : '';
            return `${prefix}${speaker}: ${finalized.trim()}`;
          });
          setCurrentSpeechChunk('');
        } else {
          setCurrentSpeechChunk(interim);
        }
      };

      recognition.onerror = (e) => {
        console.warn('[WebSpeech API] Error:', e.error);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or use Dialogue Simulation.');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user still wants listening
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    }
  }, [speaker, isListening]);

  // Toggle Live Microphone
  const toggleListening = () => {
    setErrorMessage('');
    if (isListening) {
      setIsListening(false);
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErrorMessage('Web Speech Recognition is not supported by your browser. Please use the "Try Dialogue Simulation" button.');
        return;
      }
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Speech start error:', e);
      }
    }
  };

  // Load a realistic pre-recorded sample consultation
  const handleLoadSample = (sample) => {
    setTranscript(sample.transcript);
    setAnalysisResult(null);
    setErrorMessage('');
  };

  // Analyze Transcript with Google Gemma 4
  const handleAnalyzeConsultation = async () => {
    if (!transcript.trim()) {
      setErrorMessage('Please speak into the microphone or load a sample dialogue first.');
      return;
    }

    if (isListening) {
      toggleListening();
    }

    setAnalyzing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/ambient-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          patientId,
          patientName,
          doctorName
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'AI Scribe analysis failed.');
      }

      const json = await res.json();
      setAnalysisResult(json.data);
      setAnalysisEngine(json.engine || 'Google Gemma 4 AI');
      setActiveResultTab('summary');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Ambient Scribe error:', err);
      setErrorMessage(err.message || 'Could not connect to Gemma 4 AI.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Apply to Workspace Form & Prescriptions
  const handleApply = () => {
    if (!analysisResult) return;
    if (onApplyToWorkspace) {
      onApplyToWorkspace(analysisResult);
    }
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-indigo-500/30 relative overflow-hidden transition-all duration-300">
      
      {/* Decorative ambient glowing orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-black tracking-tight text-white flex items-center space-x-1.5">
                <span>Ambient AI Clinical Scribe</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold uppercase border border-cyan-400/30">
                  Gemma 4 Live
                </span>
              </h2>
              {isListening && (
                <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>LISTENING LIVE</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Listens to doctor-patient consultation dialogue, collects patient vitals, symptoms, diagnosis, and digital prescriptions.
            </p>
          </div>
        </div>

        {/* Quick actions in top bar */}
        <div className="flex items-center space-x-2">
          {/* Microphone toggle */}
          <button
            onClick={toggleListening}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-rose-600/30'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 font-extrabold'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Pause Mic</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Listening</span>
              </>
            )}
          </button>

          {/* Analyze with Gemma 4 */}
          <button
            onClick={handleAnalyzeConsultation}
            disabled={analyzing || !transcript.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-90 active:scale-98 text-white text-xs font-black shadow-lg shadow-indigo-500/30 transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Sparkles className={`w-4 h-4 ${analyzing ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{analyzing ? 'Gemma 4 Analyzing...' : 'Analyze & Auto-Fill'}</span>
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title={isExpanded ? 'Collapse Scribe' : 'Expand Scribe'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1 font-semibold">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="text-rose-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Expanded body */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          
          {/* Sample Dialogue Pills & Speaker Turn Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            
            {/* Speaker Turn Switcher */}
            <div className="flex items-center space-x-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Current Speaker:</span>
              <button
                type="button"
                onClick={() => setSpeaker('Doctor')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  speaker === 'Doctor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>👨‍⚕️ Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => setSpeaker('Patient')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  speaker === 'Patient'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>🧑 Patient</span>
              </button>
            </div>

            {/* Pre-built sample dialogues */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Try clinical case:</span>
              {SAMPLE_DIALOGUES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-cyan-500/20 hover:text-cyan-200 border border-white/10 text-[11px] font-semibold text-slate-300 transition-all flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>{sample.title.split(' & ')[0]}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Live Soundwave visualizer when listening */}
          {isListening && (
            <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between px-4 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-xs font-bold text-cyan-200">
                  Listening to {speaker}... Speak clearly into your mic.
                </span>
              </div>
              <div className="flex items-center space-x-1 h-5">
                {[4, 12, 18, 10, 16, 22, 14, 8, 20, 15, 6].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-cyan-400 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 120}ms` }}
                  ></span>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Dialogue Editor / Feed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center space-x-1 text-slate-300">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Doctor-Patient Live Transcript</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="hover:text-white flex items-center space-x-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTranscript(''); setAnalysisResult(null); }}
                  className="hover:text-rose-300 flex items-center space-x-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={transcript + (currentSpeechChunk ? `\n${speaker}: ${currentSpeechChunk}` : '')}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Doctor and patient speech will appear here automatically as you talk, or you can paste / type consultation notes here..."
                rows={5}
                className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 resize-y"
              />
              {currentSpeechChunk && (
                <span className="absolute bottom-3 right-3 text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded font-mono animate-pulse border border-cyan-500/30">
                  Transcribing...
                </span>
              )}
            </div>
          </div>

          {/* ANALYSIS RESULTS DASHBOARD (Extracted by Gemma 4) */}
          {analysisResult && (
            <div className="mt-4 p-5 rounded-3xl bg-slate-800/80 border border-indigo-400/30 space-y-4 animate-in fade-in">
              
              {/* Header with Engine & Apply button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-black text-sm text-white">Extracted Consultation Summary & Patient Details</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Synthesized by <span className="text-cyan-300 font-semibold">{analysisEngine}</span> • Ready to transfer to patient record
                  </p>
                </div>

                {/* Big Apply Button */}
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-98 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Apply to Consultation & Prescription Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex space-x-2 border-b border-white/10 pb-2">
                {[
                  { key: 'summary', label: 'Clinical Summary' },
                  { key: 'details', label: 'Vitals & Findings' },
                  { key: 'rx', label: `Digital Rx (${analysisResult.medicines?.length || 0})` },
                  { key: 'soap', label: 'Structured SOAP Note' }
                ].map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveResultTab(t.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeResultTab === t.key
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: Clinical Narrative Summary */}
              {activeResultTab === 'summary' && (
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">Consultation Narrative</span>
                    <p className="text-slate-200">{analysisResult.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-1">Chief Complaints & Onset</span>
                      <p className="text-white font-bold">{analysisResult.chiefComplaints}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Duration: {analysisResult.symptomsDuration}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block mb-1">Primary Clinical Diagnosis</span>
                      <p className="text-emerald-300 font-bold">{analysisResult.diagnosis}</p>
                      {analysisResult.differentialDiagnosis?.length > 0 && (
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Differentials: {analysisResult.differentialDiagnosis.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Allergy Alert if mentioned */}
                  {analysisResult.allergiesDisclosed && analysisResult.allergiesDisclosed[0] !== 'None reported' && (
                    <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <span className="font-bold">Patient Disclosed Allergy: </span>
                        <span>{analysisResult.allergiesDisclosed.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Vitals & Observations */}
              {activeResultTab === 'details' && (
                <div className="space-y-3 text-xs">
                  {/* 4 Vitals Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
                      <span className="text-[10px] font-black uppercase text-blue-300 block">Blood Pressure</span>
                      <span className="text-base font-black text-white">{analysisResult.vitals?.bloodPressure || '120/80 mmHg'}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                      <span className="text-[10px] font-black uppercase text-amber-300 block">Temperature</span>
                      <span className="text-base font-black text-white">{analysisResult.vitals?.temperature || '98.6 °F'}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                      <span className="text-[10px] font-black uppercase text-rose-300 block">Pulse Rate</span>
                      <span className="text-base font-black text-white">{analysisResult.vitals?.pulseRate || '78 bpm'}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[10px] font-black uppercase text-emerald-300 block">SpO2</span>
                      <span className="text-base font-black text-white">{analysisResult.vitals?.spo2 || '98%'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">Doctor's Physical Observations</span>
                    <p className="text-slate-200">{analysisResult.clinicalObservations}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">Recommended Diagnostics & Advice</span>
                    <p className="text-slate-200"><span className="font-bold text-white">Tests: </span>{analysisResult.recommendedTests}</p>
                    <p className="text-slate-300 mt-1"><span className="font-bold text-white">General Advice: </span>{analysisResult.generalAdvice}</p>
                  </div>
                </div>
              )}

              {/* TAB 3: Digital Prescriptions */}
              {activeResultTab === 'rx' && (
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/30 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="py-2.5 px-3">Medicine Name</th>
                          <th className="py-2.5 px-3">Strength</th>
                          <th className="py-2.5 px-3">Dosage</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono">
                        {(analysisResult.medicines || []).map((med, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-cyan-300 font-sans">{med.medicineName}</td>
                            <td className="py-2.5 px-3 text-slate-200">{med.strength}</td>
                            <td className="py-2.5 px-3 text-slate-300">{med.dosage}</td>
                            <td className="py-2.5 px-3 text-amber-300 font-bold">{med.frequency}</td>
                            <td className="py-2.5 px-3 text-slate-300">{med.duration}</td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 text-slate-400">
                    <span>Follow-up Scheduled: <strong className="text-white">{analysisResult.followUpDate}</strong></span>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      Apply all to Prescription Builder →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: SOAP Note */}
              {activeResultTab === 'soap' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">S - Subjective</span>
                    <p className="text-slate-200 leading-relaxed">{analysisResult.soapNote?.subjective}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">O - Objective</span>
                    <p className="text-slate-200 leading-relaxed">{analysisResult.soapNote?.objective}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">A - Assessment</span>
                    <p className="text-slate-200 leading-relaxed">{analysisResult.soapNote?.assessment}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">P - Plan</span>
                    <p className="text-slate-200 leading-relaxed">{analysisResult.soapNote?.plan}</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

