import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  RotateCcw, 
  FileText, 
  HelpCircle, 
  ShieldAlert,
  Send,
  Save,
  Check
} from 'lucide-react';

export const AIPatientSummaryModal = ({ patient, summaryData, loading, onRegenerate, onClose, onApprove }) => {
  const [doctorNotes, setDoctorNotes] = useState('');
  const [approved, setApproved] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!patient) return null;

  const data = summaryData?.summary || {
    patientOverview: `${patient.fullName}, ${patient.age || 34}y ${patient.gender || 'Male'} with prior visits on file.`,
    relevantMedicalHistory: patient.relevantMedicalHistory || 'Documented history of Type 2 Diabetes.',
    previousConsultationsSummary: 'Previous consultations indicate mild recurrent respiratory symptoms. Resolved with initial antipyretics.',
    currentConcerns: 'Fever 101°F, dry cough for 3 days, mild throat congestion.',
    existingAllergies: `CRITICAL DRUG ALLERGY: ${(patient.allergies || []).join(', ') || 'Penicillin'}. Strictly avoid beta-lactam antibiotics.`,
    availableReportsSummary: 'CBC Report: Mild leukocytosis (TLC 11,800) with elevated ESR (28 mm/hr) consistent with acute reactive infection.',
    missingInformation: 'Fasting blood glucose log; whether cough has progressed to productive sputum; prior tolerance to macrolides.',
    questionsForDoctorReview: [
      'Has there been any wheezing, chest tightness, or nocturnal coughing?',
      'Are current diabetes medications being taken on schedule during this acute illness?',
      'Any known gastrointestinal intolerance to azithromycin or clarithromycin?'
    ]
  };

  const handleApprove = () => {
    setApproved(true);
    setSavedSuccess(true);
    if (onApprove) onApprove(doctorNotes);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black tracking-tight">AI Clinical Patient Summary</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                  Google Gemma 4
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Patient: <span className="font-bold text-white">{patient.fullName}</span> ({patient.patientId || 'PAT-1092'}) • {patient.age || 34}y / {patient.gender || 'Male'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-50"
              title="Regenerate with Gemma 4"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs font-sans">
          
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Cpu className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
              <p className="font-extrabold text-slate-800 text-sm">Gemma 4 is synthesizing patient clinical records...</p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Reviewing past visits, laboratory reports, active prescriptions, and drug contraindications.
              </p>
            </div>
          ) : (
            <>
              {/* Critical Drug Allergy Warning */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-black uppercase tracking-wider text-[11px] text-rose-700">Existing Drug Allergies</span>
                </div>
                <p className="font-extrabold text-rose-900 text-xs pl-6">
                  {data.existingAllergies}
                </p>
              </div>

              {/* 1. Patient Overview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">1. Patient Overview</span>
                <p className="text-slate-800 font-semibold leading-relaxed">{data.patientOverview}</p>
              </div>

              {/* 2. Medical History & Past Consultations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">2. Relevant Medical History</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{data.relevantMedicalHistory}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">3. Previous Consultations Summary</span>
                  <p className="text-slate-700 font-medium leading-relaxed">{data.previousConsultationsSummary}</p>
                </div>
              </div>

              {/* 3. Current Concerns & Available Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">4. Current Patient-Reported Concerns</span>
                  <p className="text-blue-950 font-semibold leading-relaxed">{data.currentConcerns}</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">5. Available Medical Reports</span>
                  <p className="text-emerald-950 font-semibold leading-relaxed">{data.availableReportsSummary}</p>
                </div>
              </div>

              {/* 4. Missing Information */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">6. Important Missing Information</span>
                <p className="text-amber-900 font-medium leading-relaxed">{data.missingInformation}</p>
              </div>

              {/* 5. Questions for Doctor Review */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 block">7. Suggested Questions for Doctor Review</span>
                <ul className="space-y-1.5 pl-1">
                  {(data.questionsForDoctorReview || []).map((q, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-indigo-950 font-semibold">
                      <span className="w-4 h-4 rounded-full bg-indigo-200 text-indigo-800 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Doctor Notes Box */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700">Attending Doctor Notes & Clinical Correlation</label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter physician observations or verified clinical adjustments..."
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* AI Disclaimer Alert */}
              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200/80">
                ⚠️ <strong>Clinical Notice:</strong> This summary is generated by Google Gemma 4 to assist clinician review. It does not replace professional medical judgement. Only authorized physicians may approve and sign clinical documentation.
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>Summary Approved & Recorded!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all"
            >
              Close
            </button>
            <button
              onClick={handleApprove}
              disabled={loading || approved}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{approved ? 'Approved by Doctor' : 'Approve Summary'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

