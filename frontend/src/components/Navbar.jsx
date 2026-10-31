import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Stethoscope, 
  User, 
  ClipboardList, 
  UserCheck, 
  Sparkles, 
  Database, 
  Cpu, 
  Settings, 
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';

export const Navbar = ({ onOpenAuth, onOpenSettings }) => {
  const { currentUser, switchDemoRole, logout, isRealFirebase } = useAuth();
  const { appointments, resetDemoData } = useClinic();
  const [aiStatus, setAiStatus] = useState({ checking: true, online: false, model: 'gemma' });

  // Poll backend health to verify Gemma & backend connectivity
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            setAiStatus({
              checking: false,
              online: true,
              ollamaOnline: data.ollama?.status === 'online',
              model: data.ollama?.availableModels?.[0] || data.ollama?.configuredModel || 'gemma4:e2b'
            });
            return;
          }
        }
        setAiStatus({ checking: false, online: false, model: 'offline' });
      } catch (e) {
        setAiStatus({ checking: false, online: false, model: 'offline' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const waitingCount = appointments.filter(a => a.status === 'Waiting').length;
  const inConsultCount = appointments.filter(a => a.status === 'In Consultation').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20 text-white font-bold">
              <Activity className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  MediFlow AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-teal-100 text-teal-800 rounded-full border border-teal-200">
                  Gemma 4 Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Intelligent Outpatient Clinic System</p>
            </div>
          </div>

          {/* Quick Role Switcher (FR-1.2) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => switchDemoRole('receptionist')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser.role === 'receptionist'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Receptionist Queue Token Dashboard"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Receptionist</span>
              {waitingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-700 font-bold rounded-full">
                  {waitingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => switchDemoRole('doctor')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser.role === 'doctor'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Doctor EMR & Gemma 4 AI Note Parser"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Doctor EMR</span>
              {inConsultCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-700 font-bold rounded-full">
                  {inConsultCount}
                </span>
              )}
            </button>

            <button
              onClick={() => switchDemoRole('patient')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentUser.role === 'patient'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Patient Medication Portal"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Patient Portal</span>
            </button>
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* AI Engine Status Pill */}
            <div 
              className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                aiStatus.online 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={aiStatus.ollamaOnline ? "Ollama Gemma is active" : "Node.js Clinical AI Parser Active"}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Gemma 4: {aiStatus.ollamaOnline ? 'Local Ollama' : 'Active'}</span>
            </div>

            {/* Firestore Status Pill */}
            <div 
              onClick={onOpenSettings}
              className={`cursor-pointer hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                isRealFirebase 
                  ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Click to configure Cloud Firestore"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isRealFirebase ? 'Firestore Live' : 'Demo State'}</span>
            </div>

            {/* Current User Badge & Profile Switcher */}
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-all text-left"
            >
              <span className="text-base sm:text-lg">{currentUser.avatar || '👤'}</span>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                  {currentUser.displayName}
                </p>
                <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
                  {currentUser.role}
                </p>
              </div>
            </button>

            {/* Quick Actions Menu */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Firebase & Engine Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={resetDemoData}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Reset Demo Data to Initial PRD State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
