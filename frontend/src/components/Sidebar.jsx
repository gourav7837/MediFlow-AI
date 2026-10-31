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
  UserCheck,
  LogOut,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const role = currentUser?.role || 'admin';

  // Strict role-separated navigation lists
  let navItems = [];

  if (role === 'doctor') {
    navItems = [
      { id: 'doctor-dashboard', label: 'Doctor Dashboard', icon: Stethoscope, badge: 'Queue', highlight: true },
      { id: 'clinical-copilot', label: 'Clinical Copilot', icon: BrainCircuit, badge: 'Gemma 4' },
      { id: 'medical-reports', label: 'Lab Reports Review', icon: FileText, badge: 'Diagnostics' },
      { id: 'appointments', label: 'My Appointments', icon: Calendar, badge: 'Live' },
      { id: 'patients', label: 'Patient Directory', icon: Users, badge: null }
    ];
  } else if (role === 'patient') {
    navItems = [
      { id: 'patient-portal', label: 'Patient Health Portal', icon: HeartPulse, badge: 'My Health', highlight: true },
      { id: 'patient-assistant', label: 'AI Health Assistant', icon: Bot, badge: 'Gemma 4' }
    ];
  } else if (role === 'receptionist') {
    navItems = [
      { id: 'queue-tokens', label: 'Live Queue & Tokens', icon: ClipboardList, badge: 'Live', highlight: true },
      { id: 'appointments', label: 'Appointment Scheduling', icon: Calendar, badge: 'OPD' },
      { id: 'patients', label: 'Patient Registration Desk', icon: Users, badge: null },
      { id: 'voice-agent', label: 'AI Voice Receptionist', icon: Mic, badge: 'Voice' },
      { id: 'whatsapp', label: 'WhatsApp Patient Alerts', icon: MessageSquare, badge: null }
    ];
  } else {
    // Admin Portal - Full Operations Desk
    navItems = [
      { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, badge: 'Overview', highlight: true },
      { id: 'doctor-dashboard', label: 'Doctor Clinical Workspace', icon: Stethoscope, badge: 'Doctor' },
      { id: 'patient-portal', label: 'Patient Health Portal', icon: HeartPulse, badge: 'Patient' },
      { id: 'queue-tokens', label: 'OPD Queue Tokens', icon: ClipboardList, badge: 'OPD' },
      { id: 'appointments', label: 'Appointment Management', icon: Calendar, badge: 'Live' },
      { id: 'patients', label: 'Patient Management', icon: Users, badge: null },
      { id: 'doctors', label: 'Doctor Roster Management', icon: UserCheck, badge: null },
      { id: 'voice-agent', label: 'AI Voice Receptionist', icon: Mic, badge: 'Gemma 4' },
      { id: 'clinical-copilot', label: 'Clinical Copilot', icon: BrainCircuit, badge: 'AI' },
      { id: 'medical-reports', label: 'MediScan Diagnostic Reports', icon: FileText, badge: null },
      { id: 'whatsapp', label: 'WhatsApp Automation', icon: MessageSquare, badge: null },
      { id: 'settings', label: 'Clinic Settings & Audit', icon: Settings, badge: null }
    ];
  }

  const roleLabelMap = {
    doctor: 'Doctor Clinical Suite',
    patient: 'Patient Health Portal',
    receptionist: 'Front Desk & Queue',
    admin: 'Clinic Administration'
  };

  const roleBadgeColor = {
    doctor: 'bg-blue-50 text-blue-700 border-blue-200',
    patient: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    receptionist: 'bg-amber-50 text-amber-700 border-amber-200',
    admin: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between select-none shrink-0 shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">MediFlow</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">AI</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">Healthcare SaaS</p>
          </div>
        </div>

        {/* Current Portal Tag */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Portal:</span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            roleBadgeColor[role] || roleBadgeColor.admin
          }`}>
            {roleLabelMap[role] || 'Operations'}
          </span>
        </div>

        {/* Role Navigation Items */}
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

      {/* User Profile & Sign Out Area */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <span className="text-2xl p-1.5 bg-blue-50 rounded-xl shrink-0">{currentUser?.avatar || '👨‍💼'}</span>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{currentUser?.displayName}</p>
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">{currentUser?.role} Account</p>
            {currentUser?.patientId && (
              <p className="text-[9px] text-slate-400 font-mono">ID: {currentUser.patientId}</p>
            )}
          </div>
        </div>

        {/* Dedicated Sign Out Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-bold transition-colors"
          title="Sign out of current workspace"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out / Switch Portal</span>
        </button>
      </div>
    </aside>
  );
};
