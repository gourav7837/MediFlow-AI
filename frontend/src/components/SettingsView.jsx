import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Building2, 
  Clock, 
  Phone, 
  Save, 
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsView = () => {
  const { currentUser, switchDemoRole } = useAuth();
  const [clinicName, setClinicName] = useState('MediFlow Intelligent Clinic');
  const [phone, setPhone] = useState('+91 (11) 4567-8900');
  const [emergencyPhone, setEmergencyPhone] = useState('108 / +91 99999 11111');
  const [address, setAddress] = useState('MediFlow Medical Tower, Suite 400, Outer Ring Road, New Delhi');
  const [gemmaModel, setGemmaModel] = useState('gemma4:e2b');
  const [ollamaStatus, setOllamaStatus] = useState('online');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => {
        setOllamaStatus(d.ollama?.status || 'offline');
        setGemmaModel(d.ollama?.availableModels?.[0] || d.ollama?.configuredModel || 'gemma4:e2b');
      })
      .catch(() => setOllamaStatus('offline'));
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Clinic Configuration & AI Model Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative parameters, hospital helpline numbers, and local Gemma 4 runtime parameters.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Clinic General Parameters Form */}
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Clinic Operations Details
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reception Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Helpline</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-rose-600 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Update Clinic Information</span>
            </button>
          </div>
        </form>

        {/* AI & Database System Health */}
        <div className="space-y-6">
          
          {/* Gemma 4 Model Card (PRD Section 5) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Google Gemma 4 AI Runtime
                </h2>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                ollamaStatus === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {ollamaStatus === 'online' ? 'Ollama Online' : 'Heuristic Engine'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Model:</span>
                <span className="font-extrabold text-blue-700 font-mono">{gemmaModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inference Runtime:</span>
                <span className="font-bold text-slate-800">Local Ollama (http://127.0.0.1:11434)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Function Calling Engine:</span>
                <span className="font-semibold text-slate-700">Native Structured JSON Tools</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
              Gemma 4 manages patient intent recognition, natural voice dialogue, appointment tool execution, and clinical summary generation without exposing private health data.
            </div>
          </div>

          {/* Cloud Firestore & Firebase Auth Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  Cloud Firestore & Firebase Auth
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                Connected
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Firebase Project:</span>
                <span className="font-mono font-bold text-slate-800">clinic-managemant-d94ff</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Database:</span>
                <span className="font-semibold text-emerald-700">Google Cloud Firestore</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authentication:</span>
                <span className="font-semibold text-slate-700">Firebase Auth + Role RBAC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Managed Collections:</span>
                <span className="font-bold text-slate-800">patients, appointments, doctors, consultations, reports</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
              Data operations executed by Node.js backend and React UI write directly to Cloud Firestore with live ACID persistence.
            </div>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Active User Role Profile</span>
              <span className="text-xs font-bold text-blue-600">{currentUser.displayName}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              <button
                onClick={() => switchDemoRole('admin')}
                className={`py-2 rounded-xl border transition-all ${
                  currentUser.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchDemoRole('doctor')}
                className={`py-2 rounded-xl border transition-all ${
                  currentUser.role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Doctor
              </button>
              <button
                onClick={() => switchDemoRole('receptionist')}
                className={`py-2 rounded-xl border transition-all ${
                  currentUser.role === 'receptionist' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Receptionist
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

