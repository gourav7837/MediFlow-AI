import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  Pill, 
  FileText, 
  Upload, 
  Bot, 
  User, 
  Stethoscope, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Mic, 
  Send, 
  Plus, 
  Eye, 
  Printer, 
  Trash2, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Phone,
  Heart,
  Activity,
  Check,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { PrescriptionPrintModal } from './PrescriptionPrintModal';

export const PatientPortal = () => {
  const { currentUser } = useAuth();
  const patientId = currentUser?.patientId || currentUser?.id || 'PAT-GUEST';
  const patientName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Patient';

  // Navigation tab in Patient Portal
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Appointments & Prescriptions & Reports State
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [clinicDoctors, setClinicDoctors] = useState([]);

  // Selected prescription for PDF modal
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // 8-Step Appointment Booking State (PRD Section 8)
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingSpecialty, setBookingSpecialty] = useState('General Practice');
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('11:00 AM');
  const [bookingReason, setBookingReason] = useState('Routine review and follow-up on recent symptoms');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Report Upload State (PRD Section 9)
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Blood Test');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadLab, setUploadLab] = useState('Apex Diagnostic Labs');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // AI Health Assistant Chat (PRD Section 12)
  const [aiChatMessages, setAiChatMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello ${patientName}! I am your MediFlow AI Health Assistant. How can I help you today? You can ask about appointment preparation, clinic timings, doctor specialties, or report guidelines in English, Hindi, or Hinglish.`
    }
  ]);
  const [userChatInput, setUserChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [chatLanguage, setChatLanguage] = useState('english'); // 'english' | 'hindi'

  // Load Patient Portal Data
  const loadPortalData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard summary
      const resDash = await fetch(`/api/patient/dashboard/${patientId}`);
      if (resDash.ok) {
        const data = await resDash.json();
        setDashboardData(data);
      }

      // 2. Full records
      const resPatient = await fetch(`/api/patients/${patientId}`);
      if (resPatient.ok) {
        const data = await resPatient.json();
        setAppointments(data.appointments || []);
        setConsultations(data.consultations || []);
        setReports(data.reports || []);
      }

      // 3. Prescriptions
      const resRx = await fetch(`/api/prescriptions?patientId=${patientId}`);
      if (resRx.ok) {
        const rxList = await resRx.json();
        setPrescriptions(rxList.filter(p => p.publishedToPortal !== false));
      }
    } catch (e) {
      console.error('Failed to load patient portal data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    fetch('/api/doctors')
      .then(r => r.ok ? r.json() : [])
      .then(docs => {
        setClinicDoctors(docs);
        if (docs.length > 0 && !bookingDoctor) {
          setBookingDoctor({
            id: docs[0].doctorId || docs[0].id,
            name: docs[0].fullName,
            specialty: docs[0].specialization || 'General Practice',
            fee: `₹${docs[0].consultationFee || 800}`,
            room: docs[0].roomNumber || 'Room 101'
          });
        }
      })
      .catch(() => {});
  }, [patientId]);

  // Handle 8-Step Appointment Booking
  const handleConfirmBooking = async () => {
    setBookingSubmitting(true);
    setBookingError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          patientName,
          doctorId: bookingDoctor.id,
          doctorName: bookingDoctor.name,
          appointmentDate: bookingDate,
          appointmentTime: bookingTime,
          reasonForVisit: bookingReason,
          bookedVia: 'Patient Portal'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || 'Failed to book appointment. Please choose another slot.');
      } else {
        setBookingSuccessData(data.appointment);
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        loadPortalData();
      }
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle Medical Report Upload (PRD Section 9)
  const handleUploadReportSubmit = async (e) => {
    e.preventDefault();
    if (!uploadName.trim()) return;
    setUploading(true);
    setUploadSuccessMessage('');

    try {
      const res = await fetch('/api/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          patientName,
          reportName: uploadName,
          reportCategory: uploadCategory,
          reportDate: uploadDate,
          laboratoryName: uploadLab,
          additionalNotes: uploadNotes,
          fileName: `${uploadCategory.toLowerCase().replace(/\s+/g, '_')}_${uploadName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          uploadedBy: 'Patient'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUploadSuccessMessage('Medical report uploaded successfully! Your doctor has been notified.');
        setUploadName('');
        setUploadNotes('');
        confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        loadPortalData();
      }
    } catch (err) {
      console.error('Report upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle AI Assistant Send
  const handleSendChatMessage = async (e) => {
    e?.preventDefault();
    if (!userChatInput.trim() || aiChatLoading) return;

    const userMsg = userChatInput.trim();
    setUserChatInput('');
    setAiChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiChatLoading(true);

    try {
      const res = await fetch('/api/ai/patient-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language: chatLanguage })
      });
      if (res.ok) {
        const data = await res.json();
        setAiChatMessages(prev => [...prev, { sender: 'assistant', text: data.reply }]);
      }
    } catch (err) {
      setAiChatMessages(prev => [
        ...prev, 
        { sender: 'assistant', text: 'I am temporarily unable to reach the care engine. For medical emergencies, please dial 108 immediately.' }
      ]);
    } finally {
      setAiChatLoading(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'book', label: 'Book Appointment', icon: Calendar, badge: 'New' },
    { id: 'appointments', label: 'My Appointments', icon: Clock, count: appointments.length },
    { id: 'consultations', label: 'My Consultations', icon: Stethoscope, count: consultations.length },
    { id: 'prescriptions', label: 'My Prescriptions', icon: Pill, count: prescriptions.length },
    { id: 'reports', label: 'My Medical Reports', icon: FileText, count: reports.length },
    { id: 'upload-report', label: 'Upload Test Reports', icon: Upload },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: Bot, badge: 'Gemma 4' },
    { id: 'profile', label: 'My Health Profile', icon: User }
  ];

  const upcomingApt = dashboardData?.upcomingAppointment || appointments.find(a => a.status === 'Confirmed' || a.status === 'Waiting');

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start font-sans">
      
      {/* PATIENT PORTAL SIDEBAR (PRD Section 7) */}
      <aside className="w-full lg:w-64 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 shrink-0 space-y-4">
        
        {/* Patient Mini Profile Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-600 text-white flex items-center space-x-3 shadow-md">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold">
            🧑
          </div>
          <div className="truncate flex-1">
            <h3 className="font-extrabold text-xs text-white truncate leading-tight">{patientName}</h3>
            <p className="text-[10px] text-teal-100 font-semibold">{patientId} • Patient</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id === 'book') {
                    setBookingStep(1);
                    setBookingSuccessData(null);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Emergency Assistance Badge */}
        <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200/80 text-rose-800 text-xs space-y-1">
          <div className="flex items-center space-x-1.5 font-black text-[11px] text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Support</span>
          </div>
          <p className="text-[11px] text-rose-900 font-semibold leading-tight">
            24/7 Ambulance: <span className="font-bold underline">108</span><br />
            Clinic ER: +91 99999 11111
          </p>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 w-full space-y-6">
        
        {/* ======================================================== */}
        {/* TAB 1: PATIENT DASHBOARD (PRD Section 6) */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-200 bg-white/10 px-2.5 py-1 rounded-full inline-block mb-2">
                  Patient Health Portal
                </span>
                <h1 className="text-2xl font-black tracking-tight">
                  Welcome back, {patientName}
                </h1>
                <p className="text-xs text-teal-100 mt-1 max-w-xl font-medium leading-relaxed">
                  Your health information, active clinical prescriptions, and upcoming appointments — all in one unified place.
                </p>
              </div>
            </div>

            {/* 4 Overview Cards (PRD Section 6) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Upcoming Visit</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">
                    {upcomingApt ? upcomingApt.appointmentTime : 'None'}
                  </span>
                  <span className="text-[11px] text-teal-600 font-bold truncate block">
                    {upcomingApt ? upcomingApt.appointmentDate : 'Book a visit'}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Consultations</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{consultations.length}</span>
                  <span className="text-[11px] text-slate-500 font-medium">Recorded Visits</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Prescriptions</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{prescriptions.length}</span>
                  <span className="text-[11px] text-emerald-600 font-bold">Doctor Approved</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Medical Reports</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{reports.length}</span>
                  <span className="text-[11px] text-indigo-600 font-bold">Uploaded & Tested</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Upcoming Appointment Card (PRD Section 6) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="font-black text-slate-900 text-sm">Upcoming Clinical Appointment</h3>
                </div>
                {upcomingApt && (
                  <span className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs">
                    Token #{upcomingApt.tokenNumber || 'A34'} • {upcomingApt.status || 'Confirmed'}
                  </span>
                )}
              </div>

              {upcomingApt ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Consulting Physician</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{upcomingApt.doctorName || 'Attending Physician'}</h4>
                    <p className="text-slate-500 font-medium">Internal Medicine & General Practice</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Schedule & Room</span>
                    <p className="font-extrabold text-teal-900 text-sm">{upcomingApt.appointmentDate} at {upcomingApt.appointmentTime}</p>
                    <p className="text-slate-500">MediFlow OPD Tower • Suite 102</p>
                  </div>

                  <div className="flex items-center md:justify-end space-x-2">
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      View Appointment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-medium">No active appointments scheduled.</p>
                  <button
                    onClick={() => {
                      setActiveTab('book');
                      setBookingStep(1);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm"
                  >
                    Book An Appointment Now
                  </button>
                </div>
              )}
            </div>

            {/* 4 Quick Actions (PRD Section 6) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setActiveTab('book');
                  setBookingStep(1);
                }}
                className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-teal-400 hover:shadow-md transition-all text-left space-y-2 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Book Appointment</h4>
                <p className="text-[11px] text-slate-500">Choose doctor & actual slot</p>
              </button>

              <button
                onClick={() => setActiveTab('upload-report')}
                className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-left space-y-2 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">Upload Reports</h4>
                <p className="text-[11px] text-slate-500">Send PDF or lab scan to doctor</p>
              </button>

              <button
                onClick={() => setActiveTab('prescriptions')}
                className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all text-left space-y-2 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Pill className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">My Prescriptions</h4>
                <p className="text-[11px] text-slate-500">Download doctor-signed PDFs</p>
              </button>

              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-left space-y-2 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-xs">AI Health Assistant</h4>
                <p className="text-[11px] text-slate-500">Ask questions in English/Hindi</p>
              </button>
            </div>

            {/* Recent Medical Activity */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-black text-slate-900 text-sm">Recent Medical Activity & History</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {prescriptions.slice(0, 2).map((rx, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        💊
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">New Prescription Published: {rx.diagnosis}</p>
                        <p className="text-[11px] text-slate-500">Issued by {rx.doctorName} • {rx.consultationDate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPrescription(rx)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      View Rx
                    </button>
                  </div>
                ))}

                {reports.slice(0, 2).map((rep, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        📄
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{rep.reportType}</p>
                        <p className="text-[11px] text-slate-500">Date: {rep.reportDate} • Status: {rep.doctorApproved ? 'Reviewed by Doctor' : 'Uploaded'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {rep.doctorApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STEP-BY-STEP APPOINTMENT BOOKING (PRD Section 8) */}
        {/* ======================================================== */}
        {activeTab === 'book' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600">Step {bookingStep} of 8</span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {bookingStep === 1 && 'Step 1: Select Medical Specialisation'}
                {bookingStep === 2 && 'Step 2: Choose Your Consulting Doctor'}
                {bookingStep === 3 && 'Step 3: Choose Appointment Date'}
                {bookingStep === 4 && 'Step 4: Real-time Slot Availability'}
                {bookingStep === 5 && 'Step 5: Confirm Preferred Time'}
                {bookingStep === 6 && 'Step 6: Describe Reason for Visit'}
                {bookingStep === 7 && 'Step 7: Review Appointment Details'}
                {bookingStep === 8 && 'Step 8: Booking Confirmation'}
              </h2>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-teal-600 h-full transition-all duration-300" 
                style={{ width: `${(bookingStep / 8) * 100}%` }}
              ></div>
            </div>

            {/* Error Banner */}
            {bookingError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* STEP 1: Specialisation */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Please choose which department or specialty you need to consult:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'General Practice', desc: 'Fever, cold, routine infections & wellness', icon: '🩺' },
                    { name: 'Internal Medicine & Cardiology', desc: 'Hypertension, diabetes, heart review', icon: '❤️' },
                    { name: 'Orthopedics & Joint Care', desc: 'Knee pain, fractures, joint stiffness', icon: '🦴' }
                  ].map(sp => (
                    <button
                      key={sp.name}
                      onClick={() => {
                        setBookingSpecialty(sp.name);
                        setBookingStep(2);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                        bookingSpecialty === sp.name ? 'border-teal-600 bg-teal-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl block">{sp.icon}</span>
                      <h4 className="font-extrabold text-slate-900 text-xs">{sp.name}</h4>
                      <p className="text-[11px] text-slate-500">{sp.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Doctor Selection */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Select an attending physician:</p>
                {clinicDoctors.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">No doctors currently registered in the clinic.</p>
                    <p className="text-[11px] text-slate-500">Please contact clinic administration or register a doctor via the Doctor Portal.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clinicDoctors.map(doc => {
                      const docId = doc.doctorId || doc.id;
                      const isSelected = bookingDoctor?.id === docId;
                      return (
                        <button
                          key={docId}
                          onClick={() => {
                            setBookingDoctor({
                              id: docId,
                              name: doc.fullName,
                              specialty: doc.specialization,
                              fee: `₹${doc.consultationFee || 800}`,
                              room: doc.roomNumber || 'Room 101'
                            });
                            setBookingStep(3);
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all space-y-1 ${
                            isSelected ? 'border-teal-600 bg-teal-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-slate-900 text-xs">{doc.fullName}</h4>
                            <span className="font-black text-teal-700 text-xs">₹{doc.consultationFee || 800}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{doc.roomNumber || 'Room 101'} • {doc.status || 'Available'}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Date Selection */}
            {bookingStep === 3 && (
              <div className="space-y-4 max-w-sm">
                <label className="block text-xs font-bold text-slate-700">Select Date for Consultation</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  onClick={() => setBookingStep(4)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700 transition-all"
                >
                  Proceed to Slot Check
                </button>
              </div>
            )}

            {/* STEP 4 & 5: Time Slot Selection */}
            {(bookingStep === 4 || bookingStep === 5) && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">Available time slots for {bookingDoctor.name} on {bookingDate}:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM', '02:00 PM', '03:15 PM', '04:00 PM', '04:45 PM'].map(slot => (
                    <button
                      key={slot}
                      onClick={() => {
                        setBookingTime(slot);
                        setBookingStep(6);
                      }}
                      className={`p-3 rounded-xl border text-center transition-all font-bold text-xs ${
                        bookingTime === slot ? 'border-teal-600 bg-teal-600 text-white shadow-md' : 'border-slate-200 hover:border-teal-300 text-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Reason for Visit */}
            {bookingStep === 6 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit / Main Complaints *</label>
                  <textarea
                    rows={3}
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    placeholder="Describe symptoms, duration, or reason for follow-up..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <button
                  onClick={() => setBookingStep(7)}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 shadow-sm"
                >
                  Review Details
                </button>
              </div>
            )}

            {/* STEP 7: Review Details */}
            {bookingStep === 7 && (
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2">Appointment Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Doctor</span>
                      <span className="font-extrabold text-slate-800">{bookingDoctor.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Specialty</span>
                      <span className="font-semibold text-slate-700">{bookingSpecialty}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Date & Time</span>
                      <span className="font-extrabold text-teal-800">{bookingDate} at {bookingTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px]">Patient</span>
                      <span className="font-semibold text-slate-800">{patientName} ({patientId})</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 font-bold block text-[10px]">Reported Concern</span>
                    <span className="font-medium text-slate-800">{bookingReason}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setBookingStep(6)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{bookingSubmitting ? 'Confirming with Cloud Firestore...' : 'Confirm Appointment Booking'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 8: Confirmation Screen */}
            {bookingStep === 8 || bookingSuccessData ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Appointment Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your appointment has been registered in MediFlow Cloud Firestore.
                  </p>
                </div>
                <div className="max-w-xs mx-auto p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p><strong>Appointment ID:</strong> {bookingSuccessData?.appointmentId || 'APT-811'}</p>
                  <p><strong>Token Number:</strong> <span className="font-bold text-teal-700">#{bookingSuccessData?.tokenNumber || 'A38'}</span></p>
                  <p><strong>Doctor:</strong> {bookingDoctor.name}</p>
                  <p><strong>Date & Time:</strong> {bookingDate} at {bookingTime}</p>
                </div>
                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700"
                  >
                    View in My Appointments
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY APPOINTMENTS */}
        {/* ======================================================== */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">My Appointments History</h3>
                <p className="text-xs text-slate-500">Upcoming consultations, completed visits, and live token states.</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('book');
                  setBookingStep(1);
                }}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                + Book New
              </button>
            </div>

            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">No appointments found.</p>
              ) : (
                appointments.map(apt => (
                  <div key={apt.id || apt.appointmentId} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-slate-900">{apt.appointmentDate} at {apt.appointmentTime}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Token #{apt.tokenNumber || 'A34'}</span>
                      </div>
                      <p className="text-slate-600 font-medium">{apt.doctorName} • Reason: {apt.reasonForVisit || apt.reason}</p>
                      <p className="text-[10px] text-slate-400">Booked via: {apt.bookedVia || 'Portal'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider self-start sm:self-center ${
                      apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      apt.status === 'In Consultation' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                      apt.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MY CONSULTATIONS */}
        {/* ======================================================== */}
        {activeTab === 'consultations' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Consultation Records & Doctor Assessments</h3>
              <p className="text-xs text-slate-500">Verified doctor clinical summaries, diagnoses, and lifestyle recommendations.</p>
            </div>

            <div className="space-y-4">
              {consultations.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">No past consultation records on file.</p>
              ) : (
                consultations.map(c => (
                  <div key={c.id || c.consultationId} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Consultation Date</span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{c.date} • {c.doctorName}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Doctor Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Reported Complaints</span>
                        <p className="font-medium text-slate-800">{Array.isArray(c.chiefComplaints) ? c.chiefComplaints.join(', ') : c.chiefComplaints}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Clinical Assessment</span>
                        <p className="font-black text-blue-900">{Array.isArray(c.diagnosis) ? c.diagnosis.join(', ') : c.diagnosis}</p>
                      </div>
                    </div>

                    {c.generalAdvice && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-amber-900">
                        <span className="font-bold">Doctor's Advice: </span>
                        {c.generalAdvice}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: MY PRESCRIPTIONS (PRD Section 11) */}
        {/* ======================================================== */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Doctor-Approved Prescriptions</h3>
              <p className="text-xs text-slate-500">View medications, dosages, timings, and download digital PDF copies.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prescriptions.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center col-span-2">No active prescriptions available.</p>
              ) : (
                prescriptions.map(rx => (
                  <div key={rx.id || rx.prescriptionId} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-3 text-xs shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                          {rx.prescriptionId || 'RX-901'}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm mt-1">{rx.diagnosis}</h4>
                        <p className="text-[11px] text-slate-500">{rx.doctorName} • {rx.consultationDate}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Approved
                      </span>
                    </div>

                    <div className="space-y-1 border-t border-slate-100 pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Medications:</span>
                      {(rx.medicines || []).map((m, i) => (
                        <p key={i} className="text-slate-700 font-semibold flex items-center space-x-1">
                          <span>💊</span>
                          <span>{m.medicineName || m.medicine} ({m.dosage || m.strength}) - {m.frequency}</span>
                        </p>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Follow-up: {rx.followUpDate || 'As needed'}</span>
                      <button
                        onClick={() => setSelectedPrescription(rx)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print PDF</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: MY MEDICAL REPORTS */}
        {/* ======================================================== */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">My Medical Test Reports</h3>
                <p className="text-xs text-slate-500">Diagnostic pathology tests, blood panels, and scans uploaded for doctor correlation.</p>
              </div>
              <button
                onClick={() => setActiveTab('upload-report')}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>

            <div className="space-y-3">
              {reports.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-8 text-center">No reports uploaded yet.</p>
              ) : (
                reports.map(rep => (
                  <div key={rep.id || rep.reportId} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-slate-900">{rep.reportType}</h4>
                      <p className="text-[11px] text-slate-500">{rep.reportDate} • Lab: {rep.laboratory || 'Apex Diagnostics'}</p>
                      {rep.aiExplanation && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl mt-1">
                          <span className="font-bold text-blue-700">Gemma 4 Summary: </span>{rep.aiExplanation}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        rep.doctorApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rep.doctorApproved ? 'Reviewed by Doctor' : 'Uploaded'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: UPLOAD TEST REPORTS (PRD Section 9) */}
        {/* ======================================================== */}
        {activeTab === 'upload-report' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Upload Diagnostic Lab Report</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your pathology reports (PDF, JPG, PNG) for your clinician to review and analyze with Gemma 4.
              </p>
            </div>

            {uploadSuccessMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Name *</label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, Chest X-Ray"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Report Category *</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option>Blood Test</option>
                    <option>CBC</option>
                    <option>X-Ray</option>
                    <option>MRI</option>
                    <option>CT Scan</option>
                    <option>Urine Test</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diagnostic Laboratory Name</label>
                <input
                  type="text"
                  value={uploadLab}
                  onChange={(e) => setUploadLab(e.target.value)}
                  placeholder="e.g. Apex Diagnostic Labs, Lal PathLabs"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes for Doctor</label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Blood drawn while fasting, feeling fatigued..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Upload className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="font-bold text-slate-800 text-xs">Click or drag file to attach report</p>
                <p className="text-[11px] text-slate-400">Supported formats: PDF, JPG, JPEG, PNG (Max 25MB)</p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                <span>{uploading ? 'Uploading to Firestore & Storage...' : 'Complete Report Upload'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: AI HEALTH ASSISTANT (PRD Section 12) */}
        {/* ======================================================== */}
        {activeTab === 'ai-assistant' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[600px]">
            
            {/* Assistant Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-700 to-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Bot className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-black text-sm">MediFlow AI Health Assistant</h3>
                  <p className="text-[11px] text-teal-100">Powered by Google Gemma 4 • English, Hindi & Hinglish</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 bg-black/20 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setChatLanguage('english')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    chatLanguage === 'english' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setChatLanguage('hindi')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    chatLanguage === 'hindi' ? 'bg-white text-teal-800 shadow-sm' : 'text-teal-100 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex space-x-2 overflow-x-auto text-[11px]">
              {[
                'What are clinic hours & fees?',
                'Do I need to fast before a blood test?',
                'Which doctor should I see for fever?',
                'How to book an appointment?'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserChatInput(chip);
                  }}
                  className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-teal-400 whitespace-nowrap font-medium"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {aiChatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md rounded-2xl p-4 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-bl-none p-4 text-xs font-bold flex items-center space-x-2">
                    <Activity className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Gemma 4 is composing medical guidance...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                value={userChatInput}
                onChange={(e) => setUserChatInput(e.target.value)}
                placeholder="Ask about clinic hours, doctor specialties, test prep in English or Hindi..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="submit"
                disabled={aiChatLoading}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 9: MY HEALTH PROFILE */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5 max-w-2xl text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Personal Health Profile</h2>
              <p className="text-xs text-slate-500">Demographic records and clinical safety alerts on file with MediFlow Clinic.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                <span className="font-black text-slate-900 text-sm">{patientName}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Record ID</span>
                <span className="font-mono font-bold text-teal-700">{patientId}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
                <span className="font-bold text-slate-800">+91 98765 43210</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                <span className="font-black text-rose-600">O+ Positive</span>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-[11px] text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Known Drug Allergies (CRITICAL)</span>
              </div>
              <p className="font-extrabold text-xs text-rose-900">
                ⚠️ Penicillin (Severe allergic rash / contraindication to beta-lactam antibiotics)
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chronic Conditions & Medical History</span>
              <p className="font-medium text-slate-800 leading-relaxed">
                Type 2 Diabetes Mellitus (managed with oral Metformin 500mg); mild seasonal allergic rhinitis.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Prescription Preview Modal */}
      {selectedPrescription && (
        <PrescriptionPrintModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

    </div>
  );
};
