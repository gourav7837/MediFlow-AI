import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  User, 
  Stethoscope, 
  FileText, 
  Pill, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  Printer, 
  Upload, 
  Eye, 
  Download, 
  HeartPulse, 
  Activity, 
  Phone, 
  Mail, 
  ShieldAlert,
  Send,
  RotateCcw
} from 'lucide-react';
import { AIPatientSummaryModal } from './AIPatientSummaryModal';
import { PrescriptionPrintModal } from './PrescriptionPrintModal';
import { AmbientConsultationScribe } from './AmbientConsultationScribe';
import { useAuth } from '../context/AuthContext';

export const DoctorPatientWorkspace = ({ patientId, appointmentId, onBack, onConsultationSaved }) => {
  const { currentUser } = useAuth();
  const currentDoctorName = currentUser?.displayName || 'Physician';
  const currentDoctorId = currentUser?.doctorId || 'DOC-ATTENDING';
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeRecordsTab, setActiveRecordsTab] = useState('reports'); // 'reports' | 'prescriptions' | 'consultations' | 'ai-summaries'

  // Consultation Form State (Center Column)
  const [chiefComplaints, setChiefComplaints] = useState('High fever (101°F), dry non-productive cough, throat irritation');
  const [symptomsDuration, setSymptomsDuration] = useState('3 days');
  const [clinicalObservations, setClinicalObservations] = useState('Pharyngeal congestion noted. Chest clear on auscultation. No crepitations.');
  const [vitalsBP, setVitalsBP] = useState('120/80 mmHg');
  const [vitalsTemp, setVitalsTemp] = useState('101.2 °F');
  const [vitalsPulse, setVitalsPulse] = useState('84 bpm');
  const [vitalsSpO2, setVitalsSpO2] = useState('98%');
  const [doctorNotes, setDoctorNotes] = useState('Patient alert and oriented. Hydration advised. Complete 3-day course.');
  const [diagnosis, setDiagnosis] = useState('Acute Upper Respiratory Tract Infection (URTI) with Pyrexia');
  const [recommendedTests, setRecommendedTests] = useState('Complete Blood Count (CBC) with ESR if pyrexia persists');
  const [followUpDate, setFollowUpDate] = useState('2026-11-04');

  // Medicine Rows (Prescription Builder)
  const [medicines, setMedicines] = useState([
    {
      medicineName: 'Tab. Paracetamol',
      strength: '650 mg',
      dosage: '1 tablet',
      frequency: 'TDS (1-1-1)',
      duration: '3 days',
      instructions: 'After food for fever relief'
    },
    {
      medicineName: 'Tab. Azithromycin',
      strength: '500 mg',
      dosage: '1 tablet',
      frequency: 'OD (1-0-0)',
      duration: '3 days',
      instructions: '1 hour before lunch, once daily'
    }
  ]);

  // Upload Additional Report (Right Column)
  const [newReportName, setNewReportName] = useState('');
  const [newReportCategory, setNewReportCategory] = useState('Blood Test');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Modals
  const [isAiSummaryOpen, setIsAiSummaryOpen] = useState(false);
  const [aiSummaryData, setAiSummaryData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [previewPrescription, setPreviewPrescription] = useState(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');

  const loadPatientFullRecord = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId || 'PAT-1092'}`);
      if (res.ok) {
        const data = await res.json();
        setPatientData(data);
      }
    } catch (e) {
      console.error('Failed to load patient record', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientFullRecord();
  }, [patientId]);

  // Add / Remove Medicine Rows
  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      {
        medicineName: '',
        strength: '',
        dosage: '1 tablet',
        frequency: 'BD (1-0-1)',
        duration: '5 days',
        instructions: 'After food'
      }
    ]);
  };

  const handleRemoveMedicine = (idx) => {
    setMedicines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateMedicine = (idx, field, val) => {
    setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  // Apply Ambient AI Consultation Scribe Extracted Details
  const handleApplyAmbientDetails = (extracted) => {
    if (!extracted) return;
    if (extracted.chiefComplaints) setChiefComplaints(extracted.chiefComplaints);
    if (extracted.symptomsDuration) setSymptomsDuration(extracted.symptomsDuration);
    if (extracted.vitals) {
      if (extracted.vitals.bloodPressure) setVitalsBP(extracted.vitals.bloodPressure);
      if (extracted.vitals.temperature) setVitalsTemp(extracted.vitals.temperature);
      if (extracted.vitals.pulseRate) setVitalsPulse(extracted.vitals.pulseRate);
      if (extracted.vitals.spo2) setVitalsSpO2(extracted.vitals.spo2);
    }
    if (extracted.clinicalObservations) setClinicalObservations(extracted.clinicalObservations);
    if (extracted.diagnosis) setDiagnosis(extracted.diagnosis);
    if (extracted.summary) setDoctorNotes(extracted.summary);
    if (extracted.recommendedTests) setRecommendedTests(extracted.recommendedTests);
    if (extracted.followUpDate) setFollowUpDate(extracted.followUpDate);
    if (extracted.medicines && Array.isArray(extracted.medicines) && extracted.medicines.length > 0) {
      setMedicines(extracted.medicines.map(m => ({
        medicineName: m.medicineName || '',
        strength: m.strength || '',
        dosage: m.dosage || '1 tablet',
        frequency: m.frequency || 'TDS (1-1-1)',
        duration: m.duration || '3 days',
        instructions: m.instructions || 'After meals'
      })));
    }
    setSaveSuccessMessage('✨ AI Extracted details & prescriptions populated into consultation form!');
    setTimeout(() => setSaveSuccessMessage(''), 4500);
  };

  // Trigger Gemma 4 AI Summary
  const handleGenerateAISummary = async () => {
    setIsAiSummaryOpen(true);
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/patient-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patientId || 'PAT-1092' })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaryData(data);
      }
    } catch (e) {
      console.error('AI summary fetch failed', e);
    } finally {
      setAiLoading(false);
    }
  };

  // Save Consultation (Draft or Complete)
  const handleSaveConsultation = async (isDraft = false) => {
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointmentId || '',
          patientId: patientData?.patient?.patientId || patientId || '',
          patientName: patientData?.patient?.fullName || 'Patient',
          doctorId: currentDoctorId,
          doctorName: currentDoctorName,
          chiefComplaints: [chiefComplaints],
          vitals: {
            bloodPressure: vitalsBP,
            temperature: vitalsTemp,
            pulseRate: vitalsPulse,
            spo2: vitalsSpO2
          },
          clinicalObservations,
          doctorNotes,
          diagnosis: [diagnosis],
          treatmentPlan: medicines,
          recommendedTests: [recommendedTests],
          followUpDate,
          isDraft
        })
      });

      if (res.ok) {
        setSaveSuccessMessage(isDraft ? 'Consultation Draft Saved!' : 'Consultation Completed Successfully!');
        setTimeout(() => setSaveSuccessMessage(''), 4000);
        if (!isDraft && onConsultationSaved) {
          onConsultationSaved();
        }
        loadPatientFullRecord();
      }
    } catch (e) {
      console.error('Save consultation failed', e);
    }
  };

  // Generate & Publish Prescription
  const handleGeneratePrescription = async () => {
    const rxData = {
      patientId: patientData?.patient?.patientId || patientId || '',
      patientName: patientData?.patient?.fullName || 'Patient',
      doctorId: currentDoctorId,
      doctorName: currentDoctorName,
      consultationDate: new Date().toISOString().split('T')[0],
      diagnosis,
      medicines,
      recommendedTests: [recommendedTests],
      followUpDate,
      additionalNotes: doctorNotes,
      status: 'Approved'
    };

    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rxData)
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewPrescription(data.prescription);
        setSaveSuccessMessage('Prescription Generated & Published to Patient Portal!');
        setTimeout(() => setSaveSuccessMessage(''), 4000);
        loadPatientFullRecord();
      }
    } catch (e) {
      console.error('Prescription generation failed', e);
    }
  };

  // Upload Additional Medical Report
  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!newReportName) return;

    try {
      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientData?.patient?.patientId || patientId || '',
          patientName: patientData?.patient?.fullName || 'Patient',
          reportName: newReportName,
          reportCategory: newReportCategory,
          reportDate: new Date().toISOString().split('T')[0],
          laboratoryName: 'Apex Diagnostic Labs, New Delhi',
          additionalNotes: 'Uploaded by attending doctor during clinical consultation.',
          uploadedBy: `Doctor (${currentDoctorName})`
        })
      });

      if (res.ok) {
        setNewReportName('');
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        loadPatientFullRecord();
      }
    } catch (e) {
      console.error('Report upload failed', e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-600">Loading Clinical Patient Workspace...</p>
      </div>
    );
  }

  const patient = patientData?.patient || {
    fullName: 'No Patient Selected',
    patientId: '—',
    age: '',
    gender: '—',
    phoneNumber: '—',
    email: '—',
    bloodGroup: '—',
    allergies: [],
    relevantMedicalHistory: 'None recorded',
    emergencyContact: '—'
  };

  return (
    <div className="space-y-4">
      
      {/* Top Workspace Navigation Bar */}
      <div className="flex items-center justify-between bg-white px-6 py-3.5 rounded-3xl border border-slate-200/80 shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Return to Doctor Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Active Consultation</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-extrabold text-slate-900">{patient.fullName}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                {patient.patientId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {currentDoctorName} • OPD Consultation
            </p>
          </div>
        </div>

        {/* Global Save Success Banner */}
        {saveSuccessMessage && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-1.5 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSaveConsultation(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all flex items-center space-x-1"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => handleSaveConsultation(false)}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Complete Consultation</span>
          </button>
        </div>
      </div>

      {/* Ambient AI Consultation Scribe (Listens to Doctor & Patient, Summarizes, Extracts Details) */}
      <AmbientConsultationScribe
        patientName={patient.fullName}
        patientId={patient.patientId}
        doctorName={currentDoctorName}
        isOpenDefault={false}
        onApplyToWorkspace={handleApplyAmbientDetails}
      />

      {/* 3-COLUMN DESKTOP WORKSPACE LAYOUT (PRD Section 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: PATIENT PROFILE (3 Cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Patient Demographics Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-black flex items-center justify-center text-base shadow-md">
                {patient.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="truncate flex-1">
                <h3 className="font-black text-slate-900 text-sm truncate">{patient.fullName}</h3>
                <p className="text-[11px] text-slate-500">{patient.patientId} • {patient.age}y / {patient.gender}</p>
              </div>
            </div>

            {/* AI Summary Action Button (Prominent - PRD Section 4) */}
            <button
              onClick={handleGenerateAISummary}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>✨ Generate AI Summary</span>
            </button>

            {/* Critical Drug Allergy Warning */}
            {patient.allergies && patient.allergies[0] !== 'None reported' && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                <div className="flex items-center space-x-1.5 font-black text-[11px] text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>CRITICAL ALLERGY ALERT</span>
                </div>
                <p className="font-extrabold text-xs text-rose-900">
                  ⚠️ {patient.allergies.join(', ')}
                </p>
                <p className="text-[10px] text-rose-600">Avoid all related compound derivatives.</p>
              </div>
            )}

            {/* Profile Fields */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Phone</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{patient.phoneNumber}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-700 flex items-center space-x-1 mt-0.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{patient.email || 'None on file'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Group</span>
                <span className="font-black text-rose-600">{patient.bloodGroup || 'O+'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                <span className="font-semibold text-slate-700">{patient.emergencyContact}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Medical History</span>
                <span className="font-medium text-slate-700">{patient.relevantMedicalHistory || 'No chronic conditions reported.'}</span>
              </div>
            </div>
          </div>

          {/* Patient Visit Timeline */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Patient Visit Timeline</h4>
            <div className="relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200 text-xs">
              <div className="relative">
                <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></div>
                <span className="text-[10px] font-bold text-slate-400">Today</span>
                <p className="font-extrabold text-slate-800">Current Consultation</p>
                <p className="text-[11px] text-slate-500">Dr. Sarah Mitchell • OPD</p>
              </div>

              {(patientData?.consultations || []).map((c, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></div>
                  <span className="text-[10px] font-bold text-slate-400">{c.date}</span>
                  <p className="font-bold text-slate-800 truncate">{c.diagnosis?.join(', ') || 'Consultation'}</p>
                  <p className="text-[10px] text-slate-500">{c.doctorName}</p>
                </div>
              ))}

              {(patientData?.reports || []).map((r, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></div>
                  <span className="text-[10px] font-bold text-slate-400">{r.reportDate}</span>
                  <p className="font-bold text-slate-800 truncate">{r.reportType}</p>
                  <p className="text-[10px] text-slate-500">{r.status || 'Report'}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CENTER COLUMN: CONSULTATION WORKSPACE (6 Cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">Consultation & Clinical Notes</h3>
              </div>
              <span className="text-[11px] text-slate-400">All fields editable & auto-synced</span>
            </div>

            {/* 1. Complaints & Symptoms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Complaints & Symptoms *</label>
                <input
                  type="text"
                  value={chiefComplaints}
                  onChange={(e) => setChiefComplaints(e.target.value)}
                  placeholder="e.g. 101 Fever, dry cough, body aches..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={symptomsDuration}
                  onChange={(e) => setSymptomsDuration(e.target.value)}
                  placeholder="e.g. 3 days"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
                />
              </div>
            </div>

            {/* 2. Vitals Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>Recorded Clinical Vitals</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">BP (mmHg)</span>
                  <input
                    type="text"
                    value={vitalsBP}
                    onChange={(e) => setVitalsBP(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Temperature</span>
                  <input
                    type="text"
                    value={vitalsTemp}
                    onChange={(e) => setVitalsTemp(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Pulse (bpm)</span>
                  <input
                    type="text"
                    value={vitalsPulse}
                    onChange={(e) => setVitalsPulse(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SpO2 (%)</span>
                  <input
                    type="text"
                    value={vitalsSpO2}
                    onChange={(e) => setVitalsSpO2(e.target.value)}
                    className="w-full px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Clinical Observations & Doctor Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Observations</label>
                <textarea
                  rows={2}
                  value={clinicalObservations}
                  onChange={(e) => setClinicalObservations(e.target.value)}
                  placeholder="Physical exam findings, throat examination..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Advice & Notes</label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="General lifestyle advice, bed rest..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
            </div>

            {/* 4. Diagnosis (Doctor-entered) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirmed Clinical Diagnosis *</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI)"
                className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-extrabold text-blue-950"
              />
            </div>

            {/* 5. Prescription Builder (Multi-medicine rows - PRD Section 5) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Pill className="w-4 h-4 text-blue-600" />
                  <span className="font-black text-slate-800 text-xs uppercase tracking-wider">Prescription Builder</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={med.medicineName}
                          onChange={(e) => handleUpdateMedicine(idx, 'medicineName', e.target.value)}
                          placeholder="Medicine Name (e.g. Tab. Paracetamol)"
                          className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={med.strength}
                          onChange={(e) => handleUpdateMedicine(idx, 'strength', e.target.value)}
                          placeholder="Strength (650mg)"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => handleUpdateMedicine(idx, 'frequency', e.target.value)}
                          placeholder="Freq (1-0-1)"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-blue-700"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                          placeholder="Duration (3d)"
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                      placeholder="Instructions (e.g. After food for fever relief)"
                      className="w-full px-2.5 py-1 text-[11px] text-slate-600 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Recommended Diagnostics & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recommended Laboratory Tests</label>
                <input
                  type="text"
                  value={recommendedTests}
                  onChange={(e) => setRecommendedTests(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC) with ESR"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Consultation Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleGeneratePrescription}
                className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Prescription & PDF</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSaveConsultation(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveConsultation(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Consultation</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: MEDICAL RECORDS & DOCUMENTS (3 Cols) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">Medical Records</span>
              <span className="text-[10px] font-bold text-blue-600">Patient File</span>
            </div>

            {/* Records Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-[10px] font-bold">
              {[
                { id: 'reports', label: 'Reports' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'consultations', label: 'History' },
                { id: 'ai-summaries', label: 'AI Notes' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveRecordsTab(t.id)}
                  className={`py-1.5 rounded-lg transition-all text-center ${
                    activeRecordsTab === t.id ? 'bg-white text-blue-700 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB 1: REPORTS */}
            {activeRecordsTab === 'reports' && (
              <div className="space-y-2.5">
                {(patientData?.reports || []).length === 0 ? (
                  <p className="text-slate-400 italic py-4 text-center">No reports uploaded yet.</p>
                ) : (
                  (patientData?.reports || []).map(r => (
                    <div key={r.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-900 leading-tight">{r.reportType}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                          r.doctorApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.doctorApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{r.reportDate} • {r.laboratory || 'Apex Labs'}</p>
                      <div className="flex items-center space-x-1.5 pt-1">
                        <a
                          href={r.fileUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: PRESCRIPTIONS */}
            {activeRecordsTab === 'prescriptions' && (
              <div className="space-y-2.5">
                {(patientData?.prescriptions || []).length === 0 ? (
                  <p className="text-slate-400 italic py-4 text-center">No previous prescriptions.</p>
                ) : (
                  (patientData?.prescriptions || []).map(rx => (
                    <div key={rx.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-700">{rx.prescriptionId || 'RX-901'}</span>
                        <span className="text-[10px] text-slate-400">{rx.consultationDate}</span>
                      </div>
                      <p className="font-extrabold text-slate-800 text-[11px] truncate">{rx.diagnosis}</p>
                      <button
                        onClick={() => setPreviewPrescription(rx)}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] inline-flex items-center space-x-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print PDF</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: CONSULTATIONS */}
            {activeRecordsTab === 'consultations' && (
              <div className="space-y-2.5">
                {(patientData?.consultations || []).length === 0 ? (
                  <p className="text-slate-400 italic py-4 text-center">No past consultations.</p>
                ) : (
                  (patientData?.consultations || []).map(c => (
                    <div key={c.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{c.date}</span>
                        <span>{c.doctorName}</span>
                      </div>
                      <p className="font-extrabold text-slate-900">{c.diagnosis?.join(', ')}</p>
                      <p className="text-[10px] text-slate-600 truncate">{c.chiefComplaints?.join(', ')}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: AI SUMMARIES */}
            {activeRecordsTab === 'ai-summaries' && (
              <div className="space-y-2 text-[11px]">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                  <div className="flex items-center space-x-1 text-blue-800 font-bold text-[10px]">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Gemma 4 Clinical Copilot</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    AI synthesis is available on-demand. Click below to view the latest analysis.
                  </p>
                  <button
                    onClick={handleGenerateAISummary}
                    className="mt-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] inline-flex items-center space-x-1"
                  >
                    <span>View AI Summary</span>
                  </button>
                </div>
              </div>
            )}

            {/* Upload Additional Report Form (PRD Section 3) */}
            <form onSubmit={handleUploadReport} className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                Upload Medical Report
              </span>

              {uploadSuccess && (
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[10px] flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Report Added to Patient File!</span>
                </div>
              )}

              <input
                type="text"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                placeholder="Report Name (e.g. CBC Panel)"
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />

              <select
                value={newReportCategory}
                onChange={(e) => setNewReportCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
              >
                <option>Blood Test</option>
                <option>CBC</option>
                <option>X-Ray</option>
                <option>MRI</option>
                <option>CT Scan</option>
                <option>Urine Test</option>
                <option>Other</option>
              </select>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Report (PDF/JPG)</span>
              </button>
            </form>

          </div>

        </div>

      </div>

      {/* AI Patient Summary Modal */}
      {isAiSummaryOpen && (
        <AIPatientSummaryModal
          patient={patient}
          summaryData={aiSummaryData}
          loading={aiLoading}
          onRegenerate={handleGenerateAISummary}
          onClose={() => setIsAiSummaryOpen(false)}
          onApprove={() => setIsAiSummaryOpen(false)}
        />
      )}

      {/* Prescription Print / PDF Modal */}
      {previewPrescription && (
        <PrescriptionPrintModal
          prescription={previewPrescription}
          onClose={() => setPreviewPrescription(null)}
        />
      )}

    </div>
  );
};

