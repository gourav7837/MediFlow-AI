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
  Sparkles
} from 'lucide-react';

const MainLayout = () => {
  const { currentUser } = useAuth();

  // Route depending on user role
  const getDefaultTab = () => {
    if (currentUser?.role === 'doctor') return 'doctor-dashboard';
    if (currentUser?.role === 'patient') return 'patient-portal';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [selectedPatientWorkspace, setSelectedPatientWorkspace] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync tab if user role changes
  useEffect(() => {
    if (currentUser?.role === 'doctor' && activeTab === 'dashboard') {
      setActiveTab('doctor-dashboard');
    } else if (currentUser?.role === 'patient' && activeTab === 'dashboard') {
      setActiveTab('patient-portal');
    }
  }, [currentUser?.role]);

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
    setActiveTab('patients');
    setOpenRegisterModal(true);
  };

  const handleSearchGlobal = (query) => {
    if (!query) return;
    const q = query.toLowerCase();
    if (q.includes('voice')) {
      setActiveTab('voice-agent');
    } else if (q.includes('doctor') || q.includes('clinical') || q.includes('emr')) {
      setActiveTab('doctor-dashboard');
    } else if (q.includes('patient') || q.includes('portal')) {
      setActiveTab('patient-portal');
    } else if (q.includes('report') || q.includes('scan') || q.includes('lab')) {
      setActiveTab('medical-reports');
    } else if (q.includes('copilot')) {
      setActiveTab('clinical-copilot');
    } else if (q.includes('whatsapp') || q.includes('message')) {
      setActiveTab('whatsapp');
    } else if (q.includes('assistant') || q.includes('faq')) {
      setActiveTab('patient-assistant');
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
          
          {/* WORKSPACE 1: DOCTOR DASHBOARD & 3-COLUMN PATIENT WORKSPACE */}
          {activeTab === 'doctor-dashboard' && (
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
          {activeTab === 'dashboard' && (
            <AdminDashboard 
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenBook={handleQuickBook}
              onOpenRegister={handleQuickRegister}
            />
          )}

          {activeTab === 'voice-agent' && (
            <VoiceReceptionist />
          )}

          {activeTab === 'patient-assistant' && (
            <PatientAssistant onBookClick={() => setActiveTab('appointments')} />
          )}

          {activeTab === 'patients' && (
            <PatientManagement 
              initialRegisterOpen={openRegisterModal} 
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentManagement initialBookOpen={openBookModal} />
          )}

          {activeTab === 'doctors' && (
            <DoctorManagement onOpenCopilot={() => setActiveTab('clinical-copilot')} />
          )}

          {activeTab === 'clinical-copilot' && (
            <ClinicalCopilot />
          )}

          {activeTab === 'medical-reports' && (
            <MedicalReportAnalysis />
          )}

          {activeTab === 'whatsapp' && (
            <WhatsAppDashboard />
          )}

          {activeTab === 'queue-tokens' && (
            <ReceptionistQueue />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>

        {/* Persistent Floating Demo Dock for Instant Judge Navigation */}
        <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-3 py-2 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center space-x-1.5 no-print max-w-[95vw] overflow-x-auto">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-2 hidden lg:inline">
            Workspace:
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
            <span>Doctor Workspace 🩺</span>
          </button>

          <button
            onClick={() => setActiveTab('patient-portal')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'patient-portal' ? 'bg-teal-600 text-white shadow-md' : 'text-teal-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
            <span>Patient Portal 🧑</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin</span>
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

          <button
            onClick={() => setActiveTab('medical-reports')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'medical-reports' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>MediScan</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </button>
        </aside>

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
