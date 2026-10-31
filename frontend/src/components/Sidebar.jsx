import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  Mic, 
  BrainCircuit, 
  FileText, 
  Settings, 
  Activity, 
  Sparkles, 
  ClipboardList, 
  MessageSquare, 
  Bot,
  HeartPulse,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'admin';

  // Role-customized navigation lists with cross-workspace accessibility
  let navItems = [];

  if (role === 'doctor') {
    navItems = [
      { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: Stethoscope, badge: 'Active', highlight: true },
      { id: 'clinical-copilot', label: 'Clinical Copilot', icon: BrainCircuit, badge: 'AI' },
      { id: 'medical-reports', label: 'MediScan Reports', icon: FileText, badge: null },
      { id: 'appointments', label: 'Clinic Appointments', icon: Calendar, badge: 'Live' },
      { id: 'patients', label: 'Patient Directory', icon: Users, badge: null },
      { id: 'queue-tokens', label: 'OPD Queue Tokens', icon: ClipboardList, badge: null },
      { id: 'voice-agent', label: 'AI Voice Receptionist', icon: Mic, badge: 'Gemma 4' },
      { id: 'whatsapp', label: 'WhatsApp Dispatches', icon: MessageSquare, badge: null },
      { id: 'patient-portal', label: 'Patient View Preview', icon: HeartPulse, badge: 'Portal' }
    ];
  } else if (role === 'patient') {
    navItems = [
      { id: 'patient-portal', label: 'Patient Health Portal', icon: HeartPulse, badge: 'Care', highlight: true },
      { id: 'patient-assistant', label: 'AI Health Assistant', icon: Bot, badge: 'Gemma 4' },
      { id: 'appointments', label: 'Appointments Calendar', icon: Calendar, badge: null },
      { id: 'doctor-dashboard', label: 'Doctor Workspace View', icon: Stethoscope, badge: 'Preview' },
      { id: 'dashboard', label: 'Clinic Overview', icon: LayoutDashboard, badge: null }
    ];
  } else {
    // Admin & Receptionist navigation
    navItems = [
      { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, badge: null },
      { id: 'doctor-dashboard', label: 'Doctor Workspace', icon: Stethoscope, badge: 'Doctor', highlight: true },
      { id: 'patient-portal', label: 'Patient Health Portal', icon: HeartPulse, badge: 'Patient' },
      { id: 'voice-agent', label: 'AI Voice Agent', icon: Mic, badge: 'Gemma 4' },
      { id: 'patient-assistant', label: 'AI Patient Assistant', icon: Bot, badge: 'Care' },
      { id: 'patients', label: 'Patient Management', icon: Users, badge: null },
      { id: 'appointments', label: 'Appointments Calendar', icon: Calendar, badge: 'Live' },
      { id: 'doctors', label: 'Doctor Directory', icon: UserCheck, badge: null },
      { id: 'clinical-copilot', label: 'Clinical Copilot', icon: BrainCircuit, badge: 'AI' },
      { id: 'medical-reports', label: 'MediScan Reports', icon: FileText, badge: null },
      { id: 'whatsapp', label: 'WhatsApp Automation', icon: MessageSquare, badge: 'Active' },
      { id: 'queue-tokens', label: 'OPD Queue Tokens', icon: ClipboardList, badge: null },
      { id: 'settings', label: 'Clinic Settings', icon: Settings, badge: null }
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between select-none shrink-0 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">MediFlow</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">AI</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Healthcare Ecosystem</p>
          </div>
        </div>

        {/* Workspace Tag */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Workspace:</span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
            {role === 'doctor' ? 'Doctor Clinical' : role === 'patient' ? 'Patient Health' : 'Clinic Operations'}
          </span>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : item.highlight
                    ? 'bg-blue-50 text-blue-800 hover:bg-blue-100/70 border border-blue-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.highlight ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.highlight 
                      ? 'bg-blue-600 text-white animate-pulse' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <span className="text-2xl p-1.5 bg-blue-50 rounded-xl">{currentUser?.avatar || '👨‍💼'}</span>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{currentUser?.displayName}</p>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{currentUser?.role} Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
