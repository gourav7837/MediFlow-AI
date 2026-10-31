import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { DoctorPatientWorkspace } from './components/DoctorPatientWorkspace';
import { PatientPortal } from './components/PatientPortal';
import { VoiceReceptionist } from './components/VoiceReceptionist';
import { PatientAssistant } from './components/PatientAssistant';
import { PatientManagement } from './components/PatientManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { DoctorManagement } from './components/DoctorManagement';
import { ClinicalCopilot } from './components/ClinicalCopilot';
import { MedicalReportAnalysis } from './components/MedicalReportAnalysis';
import { WhatsAppDashboard } from './components/WhatsAppDashboard';
import { ReceptionistQueue } from './components/ReceptionistQueue';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { LoginPage } from './components/LoginPage';
import { 
  Stethoscope, 
  HeartPulse, 
  LayoutDashboard, 
  Mic, 
  BrainCircuit, 
  FileText, 
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Bot
} from 'lucide-react';

const MainLayout = () => {
  const { currentUser } = useAuth();

  // Route strictly depending on user role
  const getDefaultTab = () => {
    if (currentUser?.role === 'doctor') return 'doctor-dashboard';
    if (currentUser?.role === 'patient') return 'patient-portal';
    if (currentUser?.role === 'receptionist') return 'queue-tokens';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [selectedPatientWorkspace, setSelectedPatientWorkspace] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Enforce strict role-based access control
  useEffect(() => {
    const role = currentUser?.role;
    if (role === 'doctor') {
      const allowedDoctorTabs = ['doctor-dashboard', 'clinical-copilot', 'medical-reports', 'appointments', 'patients'];
      if (!allowedDoctorTabs.includes(activeTab)) {
        setActiveTab('doctor-dashboard');
      }
    } else if (role === 'patient') {
      const allowedPatientTabs = ['patient-portal', 'patient-assistant'];
      if (!allowedPatientTabs.includes(activeTab)) {
        setActiveTab('patient-portal');
      }
    } else if (role === 'receptionist') {
      const allowedReceptionTabs = ['queue-tokens', 'appointments', 'patients', 'voice-agent', 'whatsapp'];
      if (!allowedReceptionTabs.includes(activeTab)) {
        setActiveTab('queue-tokens');
      }
    }
  }, [currentUser?.role, activeTab]);

  // Modal triggers from topbar
  const [openBookModal, setOpenBookModal] = useState(false);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);

  // Dedicated full-screen Login Page until user is authenticated
  if (!currentUser) {
    return <LoginPage />;
  }

  const handleQuickBook = () => {
    if (currentUser.role === 'patient') {
      setActiveTab('patient-portal');
    } else {
      setActiveTab('appointments');
      setOpenBookModal(true);
    }
  };

  const handleQuickRegister = () => {
    if (currentUser.role === 'patient') return;
    setActiveTab('patients');
    setOpenRegisterModal(true);
  };

  const handleSearchGlobal = (query) => {
    if (!query) return;
    const q = query.toLowerCase();
    const role = currentUser.role;

    if (role === 'patient') {
      if (q.includes('assistant') || q.includes('chat') || q.includes('ai') || q.includes('help')) {
        setActiveTab('patient-assistant');
      } else {
        setActiveTab('patient-portal');
      }
      return;
    }

    if (role === 'doctor') {
      if (q.includes('copilot') || q.includes('ai') || q.includes('emr')) {
        setActiveTab('clinical-copilot');
      } else if (q.includes('report') || q.includes('lab') || q.includes('scan')) {
        setActiveTab('medical-reports');
      } else if (q.includes('appointment')) {
        setActiveTab('appointments');
      } else {
        setActiveTab('doctor-dashboard');
      }
      return;
    }

    // Admin / Receptionist global navigation
    if (q.includes('voice')) {
      setActiveTab('voice-agent');
    } else if (q.includes('doctor') || q.includes('clinical')) {
      setActiveTab('doctor-dashboard');
    } else if (q.includes('patient') || q.includes('portal')) {
      setActiveTab('patient-portal');
    } else if (q.includes('report') || q.includes('scan') || q.includes('lab')) {
      setActiveTab('medical-reports');
    } else if (q.includes('copilot')) {
      setActiveTab('clinical-copilot');
    } else if (q.includes('whatsapp') || q.includes('message')) {
      setActiveTab('whatsapp');
    } else if (q.includes('queue') || q.includes('token')) {
      setActiveTab('queue-tokens');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'doctor-dashboard') {
            setSelectedPatientWorkspace(null);
          }
        }} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Navigation */}
        <Topbar 
          onQuickBook={handleQuickBook}
          onQuickRegister={handleQuickRegister}
          onSearch={handleSearchGlobal}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto pb-32">
          
          {/* WORKSPACE 1: DOCTOR CLINICAL WORKSPACE */}
          {activeTab === 'doctor-dashboard' && currentUser?.role !== 'patient' && (
            selectedPatientWorkspace ? (
              <DoctorPatientWorkspace 
                patientId={selectedPatientWorkspace.patientId}
                appointmentId={selectedPatientWorkspace.appointmentId}
                onBack={() => setSelectedPatientWorkspace(null)}
                onConsultationSaved={() => setSelectedPatientWorkspace(null)}
              />
            ) : (
              <DoctorDashboard 
                onOpenPatientWorkspace={(pId, aId) => setSelectedPatientWorkspace({ patientId: pId, appointmentId: aId })}
                onOpenCopilot={() => setActiveTab('clinical-copilot')}
              />
            )
          )}

          {/* WORKSPACE 2: PATIENT HEALTH PORTAL */}
          {activeTab === 'patient-portal' && (
            <PatientPortal />
          )}

          {/* WORKSPACE 3: CLINIC ADMIN WORKSPACE */}
          {activeTab === 'dashboard' && currentUser?.role === 'admin' && (
            <AdminDashboard 
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenBook={handleQuickBook}
              onOpenRegister={handleQuickRegister}
            />
          )}

          {activeTab === 'voice-agent' && (currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && (
            <VoiceReceptionist />
          )}

          {activeTab === 'patient-assistant' && (
            <PatientAssistant onBookClick={() => setActiveTab('patient-portal')} />
          )}

          {activeTab === 'patients' && currentUser?.role !== 'patient' && (
            <PatientManagement 
              initialRegisterOpen={openRegisterModal} 
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'appointments' && currentUser?.role !== 'patient' && (
            <AppointmentManagement initialBookOpen={openBookModal} />
          )}

          {activeTab === 'doctors' && currentUser?.role === 'admin' && (
            <DoctorManagement onOpenCopilot={() => setActiveTab('clinical-copilot')} />
          )}

          {activeTab === 'clinical-copilot' && (currentUser?.role === 'doctor' || currentUser?.role === 'admin') && (
            <ClinicalCopilot />
          )}

          {activeTab === 'medical-reports' && currentUser?.role !== 'patient' && (
            <MedicalReportAnalysis />
          )}

          {activeTab === 'whatsapp' && (currentUser?.role === 'admin' || currentUser?.role === 'receptionist') && (
            <WhatsAppDashboard />
          )}

          {activeTab === 'queue-tokens' && currentUser?.role !== 'patient' && (
            <ReceptionistQueue />
          )}

          {activeTab === 'settings' && currentUser?.role === 'admin' && (
            <SettingsView />
          )}
        </main>

        {/* ROLE-SPECIFIC QUICK NAVIGATION DOCKS */}
        
        {/* 1. Doctor Workspace Quick Dock */}
        {currentUser?.role === 'doctor' && (
          <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-blue-500/30 flex items-center space-x-1.5 no-print max-w-[95vw] overflow-x-auto">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider px-2 hidden sm:inline">
              Doctor Suite:
            </span>

            <button
              onClick={() => {
                setActiveTab('doctor-dashboard');
                setSelectedPatientWorkspace(null);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'doctor-dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Today's Queue 🩺</span>
            </button>

            <button
              onClick={() => setActiveTab('clinical-copilot')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'clinical-copilot' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              <span>Clinical Copilot ✨</span>
            </button>

            <button
              onClick={() => setActiveTab('medical-reports')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'medical-reports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Lab Reports 📄</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Appointments</span>
            </button>
          </aside>
        )}

        {/* 2. Patient Health Portal Quick Dock */}
        {currentUser?.role === 'patient' && (
          <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center space-x-1.5 no-print max-w-[95vw] overflow-x-auto">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider px-2 hidden sm:inline">
              Patient Portal:
            </span>

            <button
              onClick={() => setActiveTab('patient-portal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'patient-portal' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Health Portal 🧑</span>
            </button>

            <button
              onClick={() => setActiveTab('patient-assistant')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'patient-assistant' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Health Assistant 🤖</span>
            </button>
          </aside>
        )}

        {/* 3. Receptionist Quick Dock */}
        {currentUser?.role === 'receptionist' && (
          <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center space-x-1.5 no-print max-w-[95vw] overflow-x-auto">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider px-2 hidden sm:inline">
              Front Desk:
            </span>

            <button
              onClick={() => setActiveTab('queue-tokens')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'queue-tokens' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
              <span>OPD Queue Tokens</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'appointments' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Appointments</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'patients' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Patients</span>
            </button>

            <button
              onClick={() => setActiveTab('voice-agent')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'voice-agent' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Voice</span>
            </button>
          </aside>
        )}

        {/* 4. Admin Quick Dock */}
        {currentUser?.role === 'admin' && (
          <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center space-x-1.5 no-print max-w-[95vw] overflow-x-auto">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider px-2 hidden lg:inline">
              Admin Ops:
            </span>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('doctor-dashboard');
                setSelectedPatientWorkspace(null);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'doctor-dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
              <span>Doctor Suite 🩺</span>
            </button>

            <button
              onClick={() => setActiveTab('patient-portal')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'patient-portal' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Patient Portal 🧑</span>
            </button>

            <button
              onClick={() => setActiveTab('queue-tokens')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'queue-tokens' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
              <span>Queue Tokens</span>
            </button>

            <button
              onClick={() => setActiveTab('voice-agent')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'voice-agent' ? 'bg-blue-600 text-white shadow-md' : 'text-cyan-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI Voice ⭐</span>
            </button>
          </aside>
        )}

      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <FirebaseConfigModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClinicProvider>
        <MainLayout />
      </ClinicProvider>
    </AuthProvider>
  );
}
