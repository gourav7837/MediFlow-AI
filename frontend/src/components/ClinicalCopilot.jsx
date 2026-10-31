import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  User, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  HeartPulse, 
  Thermometer, 
  Send,
  ShieldCheck,
  RotateCcw,
  Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AmbientConsultationScribe } from './AmbientConsultationScribe';

export const ClinicalCopilot = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [copilotMode, setCopilotMode] = useState('ambient');
  const [doctorNotes, setDoctorNotes] = useState(
    'Patient has 101 fever, dry cough for 3 days, bp normal 120/80, pulse 84. Known penicillin allergy. Prescribe paracetamol 650mg and azithromycin.'
  );

  const [loading, setLoading] = useState(false);
  const [copilotOutput, setCopilotOutput] = useState(null);

  useEffect(() => {
    fetch('/api/patients')
      .then(r => r.json())
      .then(data => {
        setPatients(data);
        if (data.length > 0) setSelectedPatientId(data[0].patientId);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetch(`/api/patients/${selectedPatientId}`)
        .then(r => r.json())
        .then(data => setPatientDetails(data))
        .catch(console.error);
    }
  }, [selectedPatientId]);

  const handleGenerateCopilotAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          rawNotes: doctorNotes
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCopilotOutput(data.data);
      }
    } catch (e) {
      console.error('Copilot analysis failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <BrainCircuit className="w-4 h-4 text-cyan-300" />
            <span>Module 6 • Clinician Copilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gemma 4 AI Clinical Copilot
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Synthesize historical health records, flag critical drug contraindications, structure consultation EMR notes, and suggest differential investigative questions.
          </p>
        </div>

        {/* Patient Selector */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <label className="block text-[10px] font-bold text-blue-200 uppercase">Selected Patient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-transparent font-extrabold text-xs text-white focus:outline-none cursor-pointer mt-0.5"
          >
            {patients.map(p => (
              <option key={p.id} value={p.patientId} className="text-slate-900">
                {p.fullName} ({p.patientId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Background Card */}
      {patientDetails?.patient && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center">
              {patientDetails.patient.fullName[0]}
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">
                {patientDetails.patient.fullName} 
                <span className="text-slate-500 font-medium ml-1.5">({patientDetails.patient.age}y / {patientDetails.patient.gender})</span>
              </h2>
              <p className="text-slate-500 text-[11px]">
                History: {patientDetails.patient.relevantMedicalHistory}
              </p>
            </div>
          </div>

          <div>
            {patientDetails.patient.allergies && patientDetails.patient.allergies[0] !== 'None reported' ? (
              <span className="px-3 py-1.5 rounded-xl font-extrabold text-rose-700 bg-rose-50 border border-rose-200 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>CRITICAL ALLERGY: {patientDetails.patient.allergies.join(', ')}</span>
              </span>
            ) : (
              <span className="text-slate-400 font-medium">No recorded allergies</span>
            )}
          </div>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setCopilotMode('ambient')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            copilotMode === 'ambient'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
          }`}
        >
          <Mic className="w-4 h-4 text-cyan-300" />
          <span>🎙️ Ambient Conversation Scribe (Live Voice & Dialogue)</span>
          <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold">NEW</span>
        </button>

        <button
          onClick={() => setCopilotMode('notes')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all ${
            copilotMode === 'notes'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>📝 Clinical Shorthand Notes & Chart Synthesizer</span>
        </button>
      </div>

      {copilotMode === 'ambient' ? (
        <AmbientConsultationScribe
          patientName={patientDetails?.patient?.fullName || 'Active Patient'}
          patientId={selectedPatientId}
          doctorName={currentUser?.name || 'Attending Physician'}
          isOpenDefault={true}
        />
      ) : (
        /* Main Dual Grid: Doctor Raw Input vs Copilot Intelligence */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Consultation Scratchpad */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Doctor Consultation Notes (Raw Input)</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Shorthand scratchpad</span>
          </div>

          <textarea
            rows={7}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Type clinical shorthand notes..."
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />

          <button
            onClick={handleGenerateCopilotAnalysis}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Gemma 4 Clinical Synthesis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Synthesize with Clinical Copilot</span>
              </>
            )}
          </button>

          {/* Clinical Disclaimer */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              AI Clinical Copilot does not autonomously diagnose or prescribe. All outputs are decision-support aids requiring clinician review and approval.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Copilot Synthesis Output (PRD Module 6) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                AI Clinical Synthesis & Insights
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Gemma 4
              </span>
            </div>
            {copilotOutput && (
              <span className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Generated</span>
              </span>
            )}
          </div>

          {!copilotOutput && !loading && (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <BrainCircuit className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-600">No Copilot Synthesis Generated</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Synthesize with Clinical Copilot" on the left to review patient history & notes.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-16 bg-slate-200 rounded-xl"></div>
              <div className="h-24 bg-slate-200 rounded-xl"></div>
            </div>
          )}

          {copilotOutput && !loading && (
            <div className="space-y-4">
              
              {/* Patient History Summary */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  1. Patient History Narrative Summary
                </span>
                <p className="text-xs font-medium text-slate-800 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  {copilotOutput.summary}
                </p>
              </div>

              {/* Critical Risk & Allergy Alert */}
              {copilotOutput.keyRisks && copilotOutput.keyRisks.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block mb-1">
                    2. Clinical Contraindications & Safety Alerts
                  </span>
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 space-y-1">
                    {copilotOutput.keyRisks.map((risk, i) => (
                      <p key={i}>⚠️ {risk}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Investigative Questions for Doctor (PRD Module 6) */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-500 block mb-1">
                  3. Suggested Investigative Questions (For Doctor)
                </span>
                <div className="space-y-1.5">
                  {(copilotOutput.suggestedQuestions || []).map((q, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start space-x-2">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Treatment Plan & Follow Up */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  4. Suggested Management Plan
                </span>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {(copilotOutput.suggestedPlan || []).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>
    )}

    </div>
  );
};

