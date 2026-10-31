import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Stethoscope, 
  ClipboardList, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useAuth, MOCK_PROFILES } from '../context/AuthContext';

export const AuthModal = ({ isOpen, onClose }) => {
  const { currentUser, switchDemoRole, login, register, logout, authError, isRealFirebase } = useAuth();
  const [tab, setTab] = useState('demo'); // 'demo' | 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('doctor');
  const [submitting, setSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

  if (!isOpen) return null;

  const activeRole = currentUser?.role;

  const handleDemoSelect = (roleKey) => {
    switchDemoRole(roleKey);
    onClose();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const ok = await login(email, password, role);
    setSubmitting(false);
    if (ok) {
      setLocalMessage('Logged in successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    const ok = await register(email, password, role, displayName);
    setSubmitting(false);
    if (ok) {
      setLocalMessage('Registered and signed in successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-teal-200" />
            <h3 className="text-lg font-bold">MediFlow Auth & Role Access</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-sm font-semibold">
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-3 text-center transition-all ${
              tab === 'demo'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-white font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ 1-Click Demo Profiles (FR-1.2)
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-center transition-all ${
              tab === 'login'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-white font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-center transition-all ${
              tab === 'register'
                ? 'text-teal-700 border-b-2 border-teal-600 bg-white font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {localMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{localMessage}</span>
            </div>
          )}

          {/* TAB 1: 1-Click Rapid Hackathon Demo Profiles */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Designed for hackathon presentations: effortlessly jump between clinical roles with pre-configured mock permissions.
              </p>

              {/* Doctor Profile Card */}
              <button
                type="button"
                onClick={() => handleDemoSelect('doctor')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  currentUser && activeRole === 'doctor'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-400/20 shadow-sm'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl p-2 bg-teal-100 rounded-xl">👩‍⚕️</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{MOCK_PROFILES.doctor.displayName}</span>
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded">
                        Doctor
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{MOCK_PROFILES.doctor.specialty}</p>
                    <p className="text-[11px] text-teal-600 font-medium">Access: Gemma 4 EMR Parser & Prescriptions</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Receptionist Profile Card */}
              <button
                type="button"
                onClick={() => handleDemoSelect('receptionist')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  currentUser && activeRole === 'receptionist'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-400/20 shadow-sm'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl p-2 bg-blue-100 rounded-xl">👨‍💼</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{MOCK_PROFILES.receptionist.displayName}</span>
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Receptionist
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{MOCK_PROFILES.receptionist.shift}</p>
                    <p className="text-[11px] text-blue-600 font-medium">Access: Live Queue & Token Transitions (#A34)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Patient Profile Card */}
              <button
                type="button"
                onClick={() => handleDemoSelect('patient')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  currentUser && activeRole === 'patient'
                    ? 'border-teal-500 bg-teal-50/60 ring-2 ring-teal-400/20 shadow-sm'
                    : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl p-2 bg-emerald-100 rounded-xl">🧑</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{MOCK_PROFILES.patient.displayName}</span>
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Patient
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Patient ID: {MOCK_PROFILES.patient.patientId} (Allergies: Penicillin)</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Access: Medicine Reminders (Metformin) & Appointments</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}

          {/* TAB 2: Email Login */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@hospital.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {['doctor', 'receptionist', 'patient'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 text-xs font-bold rounded-lg capitalize border transition-all ${
                        role === r
                          ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-400'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? <span>Authenticating...</span> : <span>Sign In ({role})</span>}
              </button>
            </form>
          )}

          {/* TAB 3: Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Dr. Rajesh Gupta"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@clinic.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {['doctor', 'receptionist', 'patient'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 text-xs font-bold rounded-lg capitalize border transition-all ${
                        role === r
                          ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-400'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center space-x-2"
              >
                {submitting ? <span>Creating Account...</span> : <span>Create Account</span>}
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Active mode: {isRealFirebase ? 'Cloud Firestore SDK' : 'In-Memory / LocalStorage State'}</span>
          <button 
            onClick={() => { logout(); onClose(); }}
            className="text-rose-600 hover:underline font-semibold"
          >
            Reset Active Session
          </button>
        </div>

      </div>
    </div>
  );
};

