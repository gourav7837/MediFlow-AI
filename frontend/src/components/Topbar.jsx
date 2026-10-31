import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Cpu, 
  Plus, 
  Flame,
  LogOut,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  UsersRound,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Topbar = ({ onQuickBook, onQuickRegister, onSearch, onOpenAuth }) => {
  const { currentUser, logout } = useAuth();
  const [aiStatus, setAiStatus] = useState({ online: true, model: 'gemma4:e2b' });
  const [searchQuery, setSearchQuery] = useState('');

  const role = currentUser?.role || 'admin';

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setAiStatus({
            online: data.ollama?.status === 'online',
            model: data.ollama?.availableModels?.[0] || data.ollama?.configuredModel || 'gemma4:e2b'
          });
        }
      } catch (e) {
        setAiStatus({ online: false, model: 'offline' });
      }
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4">
      
      {/* Search Input (Tailored by role) */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder={
            role === 'patient' 
              ? "Search medical records, doctors, or FAQs..."
              : role === 'doctor'
              ? "Search assigned patients, symptoms, or reports..."
              : "Search patients, doctors, appointment ID..."
          }
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </form>

      {/* Middle & Right Controls */}
      <div className="flex items-center space-x-2.5">
        
        {/* Cloud Firestore Status Pill */}
        <div 
          className="hidden 2xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
          title="Cloud Firestore active database linked to clinic-managemant-d94ff"
        >
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>Firestore: clinic-managemant-d94ff</span>
        </div>

        {/* Gemma 4 Engine Status Pill */}
        <div 
          className={`hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            aiStatus.online
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title="Google Gemma 4 open-weight AI engine running via local Ollama"
        >
          <Cpu className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Gemma 4: {aiStatus.online ? aiStatus.model : 'Heuristic Engine'}</span>
        </div>

        {/* Active Portal Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold bg-slate-50 border-slate-200">
          {role === 'doctor' && (
            <>
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700 hidden sm:inline">Doctor Clinical Suite</span>
            </>
          )}
          {role === 'patient' && (
            <>
              <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 hidden sm:inline">Patient Health Portal</span>
            </>
          )}
          {role === 'receptionist' && (
            <>
              <UsersRound className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-700 hidden sm:inline">Reception Desk</span>
            </>
          )}
          {role === 'admin' && (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span className="text-purple-700 hidden sm:inline">Clinic Operations</span>
            </>
          )}
          <span className="text-slate-400">•</span>
          <span className="text-slate-800 font-extrabold truncate max-w-[120px]">{currentUser?.displayName}</span>
        </div>

        {/* Role-Specific Action Button */}
        {role === 'patient' && (
          <button
            onClick={onQuickBook}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Visit</span>
          </button>
        )}

        {role === 'doctor' && (
          <button
            onClick={onQuickBook}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Schedule Slot</span>
          </button>
        )}

        {(role === 'admin' || role === 'receptionist') && (
          <>
            <button
              onClick={onQuickRegister}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Patient</span>
            </button>

            <button
              onClick={onQuickBook}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </>
        )}

        {/* Dedicated Sign Out Button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all"
          title="Sign out and switch role"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden md:inline">Sign Out</span>
        </button>

      </div>
    </header>
  );
};
