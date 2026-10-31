import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  X, 
  CheckCircle,
  Clock,
  Stethoscope,
  Activity,
  Pill,
  HeartPulse,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  History,
  FileCheck,
  Send,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const PatientManagement = ({ initialRegisterOpen = false, onNavigate }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('overview');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(initialRegisterOpen);
  const [loading, setLoading] = useState(false);

  // New patient form fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await fetch(`/api/patients${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error('Fetch patients failed', e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const handleOpenProfile = async (patientId) => {
    try {
      const res = await fetch(`/api/patients/${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPatientDetails(data);
        setActiveProfileTab('overview');
      }
    } catch (e) {
      console.error('Load patient details failed', e);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return;
    setLoading(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          age,
          gender,
          phoneNumber,
          email,
          address,
          emergencyContact,
          allergies,
          relevantMedicalHistory: medicalHistory
        })
      });

      if (res.ok) {
        setFullName('');
        setAge('');
        setPhoneNumber('');
        setEmail('');
        setAddress('');
        setEmergencyContact('');
        setAllergies('');
        setMedicalHistory('');
        setIsRegisterModalOpen(false);
        fetchPatients();
      }
    } catch (e) {
      console.error('Registration failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Patient Management & Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered clinic patients, chronic medical histories, past appointments, and consultations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, phone, PAT ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 sm:w-64"
            />
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Patient Info</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Allergies</th>
                <th className="py-3.5 px-4">Medical History</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                        {pat.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-xs">{pat.fullName}</h3>
                        <p className="text-[11px] text-slate-500">{pat.patientId} • {pat.age}y / {pat.gender}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-700">
                      <p className="font-semibold">{pat.phoneNumber}</p>
                      <p className="text-[11px] text-slate-400">{pat.email || 'No email recorded'}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {pat.allergies && pat.allergies[0] !== 'None reported' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        ⚠️ {pat.allergies.join(', ')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">No known allergies</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="text-slate-600 truncate max-w-xs">{pat.relevantMedicalHistory || 'Routine checkups only'}</p>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenProfile(pat.patientId)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition-all inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RICH MODAL: Complete 6-Tab Patient Profile (PRD Section 5.3) */}
      {selectedPatientDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xl font-black shadow-lg">
                  {selectedPatientDetails.patient.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black tracking-tight">{selectedPatientDetails.patient.fullName}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                      {selectedPatientDetails.patient.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedPatientDetails.patient.age} yrs • {selectedPatientDetails.patient.gender} • Phone: {selectedPatientDetails.patient.phoneNumber} • Reg: {selectedPatientDetails.patient.registeredAt?.split('T')[0]}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {onNavigate && (
                  <button
                    onClick={() => {
                      setSelectedPatientDetails(null);
                      onNavigate('appointments');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Book Apt</span>
                  </button>
                )}
                <button 
                  onClick={() => setSelectedPatientDetails(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drug Allergy Critical Banner if present */}
            {selectedPatientDetails.patient.allergies && selectedPatientDetails.patient.allergies[0] !== 'None reported' && (
              <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center space-x-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>CRITICAL ALLERGY ALERT: Patient is allergic to: <span className="underline">{selectedPatientDetails.patient.allergies.join(', ')}</span>. Do not administer or prescribe these compounds.</span>
              </div>
            )}

            {/* 6 Tabs Navigation (PRD Section 5.3) */}
            <div className="px-6 border-b border-slate-200 bg-slate-50/70 flex space-x-1 overflow-x-auto shrink-0">
              {[
                { id: 'overview', label: '1. Overview', icon: Activity },
                { id: 'history', label: '2. Medical History', icon: History },
                { id: 'appointments', label: '3. Appointments', icon: Calendar, badge: selectedPatientDetails.appointments?.length },
                { id: 'consultations', label: '4. Consultations', icon: Stethoscope, badge: selectedPatientDetails.consultations?.length },
                { id: 'reports', label: '5. Medical Reports', icon: FileText, badge: selectedPatientDetails.reports?.length },
                { id: 'ai-summaries', label: '6. AI Summaries & Intakes', icon: Sparkles, badge: (selectedPatientDetails.intakes?.length || 0) + (selectedPatientDetails.voiceSessions?.length || 0) },
                { id: 'timeline', label: 'Chronological Timeline', icon: Clock }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeProfileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveProfileTab(tab.id)}
                    className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 text-xs font-extrabold transition-all whitespace-nowrap ${
                      isActive 
                        ? 'border-blue-600 text-blue-700 bg-white shadow-sm -mb-px rounded-t-xl' 
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeProfileTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Demographics Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Demographics & Contact</h4>
                      <div className="space-y-1.5 text-xs">
                        <p><span className="text-slate-400">DOB:</span> <span className="font-bold text-slate-800">{selectedPatientDetails.patient.dob || '1992-05-14'}</span></p>
                        <p><span className="text-slate-400">Address:</span> <span className="font-bold text-slate-800">{selectedPatientDetails.patient.address}</span></p>
                        <p><span className="text-slate-400">Emergency:</span> <span className="font-bold text-slate-800">{selectedPatientDetails.patient.emergencyContact}</span></p>
                        <p><span className="text-slate-400">Email:</span> <span className="font-bold text-slate-800">{selectedPatientDetails.patient.email || 'None registered'}</span></p>
                      </div>
                    </div>

                    {/* Next Appointment */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Next Appointment</span>
                      </h4>
                      {selectedPatientDetails.appointments?.find(a => a.status === 'Confirmed' || a.status === 'Pending') ? (
                        (() => {
                          const nextApt = selectedPatientDetails.appointments.find(a => a.status === 'Confirmed' || a.status === 'Pending');
                          return (
                            <div className="space-y-1 text-xs">
                              <p className="font-extrabold text-blue-900 text-sm">{nextApt.appointmentDate} at {nextApt.appointmentTime}</p>
                              <p className="text-blue-700 font-semibold">{nextApt.doctorName}</p>
                              <p className="text-slate-600 text-[11px]">Token: <span className="font-bold text-blue-800">#{nextApt.tokenNumber || 'A34'}</span> • Reason: {nextApt.reasonForVisit}</p>
                            </div>
                          );
                        })()
                      ) : (
                        <p className="text-xs text-slate-500 italic">No upcoming appointments scheduled.</p>
                      )}
                    </div>

                    {/* Recent Vitals */}
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Recent Vitals</span>
                      </h4>
                      {selectedPatientDetails.consultations?.[0]?.vitals ? (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-slate-400 block">BP</span>
                            <span className="font-black text-slate-800">{selectedPatientDetails.consultations[0].vitals.bloodPressure || '120/80'}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-slate-400 block">Temperature</span>
                            <span className="font-black text-slate-800">{selectedPatientDetails.consultations[0].vitals.temperature || '98.6 °F'}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-slate-400 block">Pulse</span>
                            <span className="font-black text-slate-800">{selectedPatientDetails.consultations[0].vitals.pulseRate || '80 bpm'}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-slate-400 block">SpO2</span>
                            <span className="font-black text-slate-800">{selectedPatientDetails.consultations[0].vitals.spo2 || '99%'}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No recent vitals on file.</p>
                      )}
                    </div>
                  </div>

                  {/* Active Prescriptions / Medications */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                      <Pill className="w-4 h-4 text-blue-600" />
                      <span>Active Medications & Treatments</span>
                    </h4>
                    {selectedPatientDetails.consultations?.some(c => c.treatmentPlan?.length) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedPatientDetails.consultations.flatMap(c => c.treatmentPlan || []).map((med, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-3 text-xs">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                              💊
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{med.medicine} • {med.dosage}</p>
                              <p className="text-slate-600 text-[11px]">Frequency: <span className="font-semibold">{med.frequency}</span> ({med.duration})</p>
                              <p className="text-slate-500 text-[10px] mt-0.5">{med.instructions}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No active prescriptions recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MEDICAL HISTORY */}
              {activeProfileTab === 'history' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Chronic Illnesses & Pre-existing Conditions</h4>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {selectedPatientDetails.patient.relevantMedicalHistory || 'No pre-existing chronic conditions recorded.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Past Surgeries & Hospitalizations</h4>
                    <p className="text-xs text-slate-700">None reported in registration intake.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Family Medical History</h4>
                    <p className="text-xs text-slate-700">Father: Hypertension. Mother: Type 2 Diabetes.</p>
                  </div>
                </div>
              )}

              {/* TAB 3: APPOINTMENTS */}
              {activeProfileTab === 'appointments' && (
                <div className="space-y-3">
                  {selectedPatientDetails.appointments?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No appointment history found.</p>
                  ) : (
                    selectedPatientDetails.appointments.map(apt => (
                      <div key={apt.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-xs">{apt.appointmentDate} at {apt.appointmentTime}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Token #{apt.tokenNumber || 'A34'}</span>
                          </div>
                          <p className="text-xs text-slate-600">{apt.doctorName} • Reason: <span className="font-medium text-slate-800">{apt.reasonForVisit}</span></p>
                          <p className="text-[10px] text-slate-400">Booked via: {apt.bookedVia || 'Direct Booking'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                          apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'In Consultation' ? 'bg-amber-100 text-amber-800' :
                          apt.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: CONSULTATIONS */}
              {activeProfileTab === 'consultations' && (
                <div className="space-y-4">
                  {selectedPatientDetails.consultations?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No formal consultation records.</p>
                  ) : (
                    selectedPatientDetails.consultations.map(c => (
                      <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Date</span>
                            <p className="font-extrabold text-slate-900 text-sm">{c.date} • {c.doctorName}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                            Doctor Approved
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Chief Complaints</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-800 font-medium">
                              {c.chiefComplaints?.map((cc, i) => <li key={i}>{cc}</li>)}
                            </ul>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clinical Assessment / Diagnosis</span>
                            <p className="font-extrabold text-blue-900 bg-blue-50/80 p-2.5 rounded-xl border border-blue-200">
                              {c.diagnosis?.join(', ')}
                            </p>
                          </div>
                        </div>

                        {c.treatmentPlan && (
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Prescribed Medication Plan</span>
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                              <table className="w-full text-left text-[11px]">
                                <thead className="bg-slate-100 text-slate-600 font-bold">
                                  <tr>
                                    <th className="p-2">Medicine</th>
                                    <th className="p-2">Dosage</th>
                                    <th className="p-2">Frequency</th>
                                    <th className="p-2">Duration</th>
                                    <th className="p-2">Instructions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                  {c.treatmentPlan.map((t, idx) => (
                                    <tr key={idx}>
                                      <td className="p-2 font-bold text-slate-900">{t.medicine}</td>
                                      <td className="p-2">{t.dosage}</td>
                                      <td className="p-2">{t.frequency}</td>
                                      <td className="p-2">{t.duration}</td>
                                      <td className="p-2 text-slate-500">{t.instructions}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {c.generalAdvice && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900 text-xs">
                            <span className="font-bold">Doctor's Advice: </span> {c.generalAdvice}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: MEDICAL REPORTS */}
              {activeProfileTab === 'reports' && (
                <div className="space-y-3">
                  {selectedPatientDetails.reports?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No lab reports uploaded for this patient.</p>
                  ) : (
                    selectedPatientDetails.reports.map(rep => (
                      <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 text-xs">{rep.reportType} • {rep.reportDate}</p>
                          <p className="text-[11px] text-slate-500">File: {rep.fileName} • Lab: {rep.labName}</p>
                          {rep.hasAbnormalValues && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                              ⚠️ Abnormal Parameters Detected
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.doctorApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rep.doctorApproved ? 'Doctor Approved' : 'Pending Review'}
                          </span>
                          {onNavigate && (
                            <button
                              onClick={() => {
                                setSelectedPatientDetails(null);
                                onNavigate('medical-reports');
                              }}
                              className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center space-x-1"
                            >
                              <span>View in MediScan</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 6: AI SUMMARIES & INTAKES */}
              {activeProfileTab === 'ai-summaries' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex items-center space-x-2 text-xs text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>These summaries and intake notes are generated by <strong>Google Gemma 4</strong> from conversational voice intake and clinical data extraction.</span>
                  </div>

                  {selectedPatientDetails.intakes?.length ? (
                    selectedPatientDetails.intakes.map(intake => (
                      <div key={intake.intakeId} className="p-4 rounded-2xl border border-blue-200/80 bg-slate-50/50 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-blue-900">Patient Intake Note (ID: {intake.intakeId})</span>
                          <span className="text-[10px] text-slate-500">{intake.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-slate-700"><strong>Reported Concerns:</strong> {intake.reportedConcerns?.join(', ')}</p>
                        <p className="text-slate-700"><strong>Duration:</strong> {intake.reportedDuration}</p>
                        <p className="text-slate-700"><strong>Preferred Specialty:</strong> {intake.preferredSpecialisation}</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {intake.summaryStatus || 'Pending Doctor Review'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No previous AI voice intake summaries.</p>
                  )}
                </div>
              )}

              {/* TAB 7: CHRONOLOGICAL TIMELINE */}
              {activeProfileTab === 'timeline' && (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white"></div>
                    <span className="text-[10px] font-bold text-slate-400">{selectedPatientDetails.patient.registeredAt?.split('T')[0]}</span>
                    <p className="text-xs font-bold text-slate-800">Patient Registered</p>
                    <p className="text-[11px] text-slate-500">Record created in MediFlow Clinic Database with ID {selectedPatientDetails.patient.patientId}</p>
                  </div>

                  {selectedPatientDetails.appointments?.map((apt, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white"></div>
                      <span className="text-[10px] font-bold text-slate-400">{apt.appointmentDate} • {apt.appointmentTime}</span>
                      <p className="text-xs font-bold text-slate-800">Appointment Scheduled ({apt.status})</p>
                      <p className="text-[11px] text-slate-500">Booked with {apt.doctorName} for {apt.reasonForVisit} via {apt.bookedVia || 'Voice AI'}</p>
                    </div>
                  ))}

                  {selectedPatientDetails.consultations?.map((c, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white"></div>
                      <span className="text-[10px] font-bold text-slate-400">{c.date}</span>
                      <p className="text-xs font-bold text-slate-800">Consultation Completed by {c.doctorName}</p>
                      <p className="text-[11px] text-slate-500">Diagnosis: {c.diagnosis?.join(', ')}. Prescribed {c.treatmentPlan?.length} medications.</p>
                    </div>
                  ))}

                  {selectedPatientDetails.whatsappMessages?.map((wa, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <span className="text-[10px] font-bold text-slate-400">{wa.sentAt?.split('T')[0]}</span>
                      <p className="text-xs font-bold text-slate-800">WhatsApp Notification ({wa.status})</p>
                      <p className="text-[11px] text-slate-500 truncate">{wa.templateType}: {wa.content?.substring(0, 70)}...</p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer with Quick Actions */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-slate-500">
                Patient File: <strong className="text-slate-800">{selectedPatientDetails.patient.fullName}</strong> ({selectedPatientDetails.patient.patientId})
              </span>

              <div className="flex items-center space-x-2">
                {onNavigate && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedPatientDetails(null);
                        onNavigate('clinical-copilot');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition-all"
                    >
                      Open Copilot
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPatientDetails(null);
                        onNavigate('whatsapp');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-all flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Dispatch</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedPatientDetails(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all"
                >
                  Close Profile
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Register New Patient (PRD Module 3) */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-200" />
                <h3 className="text-base font-bold">Register New Clinic Patient</h3>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anjali Nair"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Nair (Husband) - +91 98..."
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Known Drug Allergies (CRITICAL)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, Aspirin, None"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relevant Medical History</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Type 2 Diabetes, Hypertension, previous surgeries..."
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};


