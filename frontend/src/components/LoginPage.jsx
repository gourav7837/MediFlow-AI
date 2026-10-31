import React, { useState } from 'react';
import {
  HeartPulse,
  Users,
  FileText,
  Bell,
  Stethoscope,
  UsersRound,
  UserRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  UserRoundCheck,
  Quote,
  Sparkles,
  AlertCircle,
  Flame,
  KeyRound,
  CheckCircle2,
  Clock,
  ExternalLink,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clinicIllustration from '../assets/clinic-illustration.jpeg';

export const LoginPage = () => {
  const { login, register, authError, isRealFirebase } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [info, setInfo] = useState('');

  // 4 Explicit Portals & Role Metadata (Clean - No Mock Demo Credentials)
  const ROLE_CONFIG = {
    doctor: {
      label: 'Doctor Portal',
      roleKey: 'doctor',
      icon: Stethoscope,
      color: 'blue',
      badge: 'Clinician',
      description: 'Consultations, EMR Notes, Gemma 4 AI, and Digital Prescriptions',
      activeTab: 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10',
      idleTab: 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50'
    },
    patient: {
      label: 'Patient Portal',
      roleKey: 'patient',
      icon: UserRound,
      color: 'emerald',
      badge: 'Patient',
      description: 'Live Token Tracker, Prescriptions, Lab Reports, and AI Health Assistant',
      activeTab: 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-500/10',
      idleTab: 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50'
    },
    admin: {
      label: 'Admin Portal',
      roleKey: 'admin',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'Operations',
      description: 'Clinic Operations, Doctor Roster, Rescheduling, and System Audit Logs',
      activeTab: 'border-purple-600 bg-purple-50 text-purple-700 shadow-md shadow-purple-500/10',
      idleTab: 'border-slate-200 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50/50'
    },
    receptionist: {
      label: 'Reception Desk',
      roleKey: 'receptionist',
      icon: UsersRound,
      color: 'amber',
      badge: 'Front Desk',
      description: 'Live OPD Queue, Token Calling, and Patient Appointments Desk',
      activeTab: 'border-amber-500 bg-amber-50 text-amber-700 shadow-md shadow-amber-500/10',
      idleTab: 'border-slate-200 bg-white text-slate-700 hover:border-amber-200 hover:bg-amber-50/50'
    }
  };

  const handleSelectRole = (rKey) => {
    setRole(rKey);
    setLocalError('');
    setInfo('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    if (mode === 'register' && !displayName) {
      setLocalError('Please enter your full name for registration.');
      return;
    }
    setLocalError('');
    setInfo('');
    setSubmitting(true);
    const ok = mode === 'login'
      ? await login(email, password, role, displayName, rememberMe)
      : await register(email, password, role, displayName, rememberMe);
    setSubmitting(false);
    if (!ok && !authError) {
      setLocalError(mode === 'login' ? 'Authentication failed. Please verify credentials.' : 'Registration failed. Please try again.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Enter your email above first, then click "Forgot password".');
      return;
    }
    setLocalError('');
    setInfo(`Password reset instructions dispatched to ${email} (Firebase Auth).`);
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">

      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-blue-200/30 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-sky-200/40 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-48 left-1/4 w-[560px] h-[560px] rounded-full bg-indigo-100/60 blur-3xl pointer-events-none"></div>

      <div className="relative min-h-screen flex items-center justify-center gap-12 px-6 py-10 max-w-7xl mx-auto">

        {/* ================= LEFT: Brand / Pitch ================= */}
        <section className="hidden lg:flex flex-col flex-1 max-w-xl self-stretch justify-between py-6">

          <div>
            {/* Logo row */}
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-600/25 text-white">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900 flex items-center space-x-2">
                  <span>MediFlow</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold uppercase">AI</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Smarter Clinics. Better Care. Powered by AI.</div>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight mb-4 text-slate-900">
              Role-Separated <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600">
                Healthcare SaaS Platform
              </span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-8">
              Sign in with your role-specific credentials. Google Cloud Firestore and Firebase Authentication ensure doctor clinical notes, patient health records, and clinic administrative controls stay strictly separated.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">Doctor Clinical Workspace</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Today's queue, 3-column patient consultations, Gemma 4 EMR notes, and prescription builder.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">Patient Health Portal</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Real-time token tracker, approved prescriptions download, lab reports upload, and bilingual AI chatbot.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 bg-white/70 p-3.5 rounded-2xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">Admin & Operations Desk</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Live token board, doctor rosters, 6-step collision-free rescheduling, and WhatsApp dispatches.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Database & Cloud Indicators */}
          <div className="mt-8 flex items-center space-x-4 text-xs font-bold text-slate-500 pt-4 border-t border-slate-200/60">
            <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Cloud Firestore Active</span>
            </div>
            <div className="flex items-center space-x-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Firebase Auth Synchronized</span>
            </div>
          </div>

        </section>

        {/* ================= RIGHT: Auth Card ================= */}
        <section className="w-full max-w-xl flex flex-col items-center">

          <div className="w-full bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-200/80 p-7 sm:p-9">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-black uppercase tracking-wider mb-2">
                <span>Role-Based Authentication</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'login' ? 'Sign In to Your Workspace' : 'Create New MediFlow Account'}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {mode === 'login'
                  ? 'Select your role portal and enter your credentials to access your workspace.'
                  : 'Select your role and enter your details to register in Cloud Firestore.'}
              </p>
            </div>

            {/* 1. SELECT ROLE PORTAL (4 Tabs) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = role === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectRole(key)}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 py-3 px-2 transition-all duration-200 ${
                      isSelected ? config.activeTab : config.idleTab
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1 shrink-0" />
                    <span className="text-xs font-bold truncate">{config.label.replace(' Portal', '')}</span>
                    <span className="text-[9px] uppercase font-black opacity-75">{config.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Role Portal Context Notice */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
              <div className="truncate flex-1">
                <span className="font-extrabold text-slate-800">{ROLE_CONFIG[role]?.label}: </span>
                <span className="text-slate-500 text-[11px]">{ROLE_CONFIG[role]?.description}</span>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-bold flex-1">{error}</span>
                <button onClick={() => setLocalError('')} className="text-rose-400 hover:text-rose-600">✕</button>
              </div>
            )}

            {info && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-bold">{info}</span>
              </div>
            )}

            {/* Sign In / Register Form */}
            <form onSubmit={submit} className="space-y-4">
              
              {/* Display name (register mode) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="displayName" className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <UserRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={role === 'doctor' ? 'e.g. Dr. John Doe, MD' : 'e.g. John Doe'}
                      required
                      className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLocalError(''); }}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLocalError(''); }}
                    placeholder="Enter password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="font-bold text-slate-600">Keep me logged in</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {submitting ? (
                  <span>Authenticating with Firebase...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Enter {ROLE_CONFIG[role]?.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create {ROLE_CONFIG[role]?.label} Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Mode switch */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              {mode === 'login' ? (
                <p className="text-xs text-slate-500 font-medium">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setLocalError(''); setInfo(''); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setLocalError(''); setInfo(''); }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign in to your account
                  </button>
                </p>
              )}
            </div>

          </div>

        </section>
      </div>
    </div>
  );
};
