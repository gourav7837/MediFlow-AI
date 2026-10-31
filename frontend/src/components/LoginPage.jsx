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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import clinicIllustration from '../assets/clinic-illustration.jpeg';

export const LoginPage = () => {
  const { login, register, switchDemoRole, authError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [info, setInfo] = useState('');

  const ROLE_META = {
    doctor: {
      label: 'Doctor',
      icon: Stethoscope,
      active: 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10',
      idle: 'border-slate-200 bg-white text-blue-600 hover:border-blue-200 hover:bg-blue-50/40'
    },
    receptionist: {
      label: 'Receptionist',
      icon: UsersRound,
      active: 'border-orange-400 bg-orange-50 text-orange-500 shadow-sm shadow-orange-400/10',
      idle: 'border-slate-200 bg-white text-orange-500 hover:border-orange-200 hover:bg-orange-50/40'
    },
    patient: {
      label: 'Patient',
      icon: UserRound,
      active: 'border-emerald-400 bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-400/10',
      idle: 'border-slate-200 bg-white text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/40'
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    setLocalError('');
    setInfo('');
    setSubmitting(true);
    const ok = mode === 'login'
      ? await login(email, password, role, '', rememberMe)
      : await register(email, password, role, displayName, rememberMe);
    setSubmitting(false);
    if (!ok && !authError) {
      setLocalError('Authentication failed. Please try again.');
    }
  };

  const handleDemoQuickStart = () => {
    switchDemoRole(role);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Enter your email above first, then click "Forgot password".');
      return;
    }
    setLocalError('');
    setInfo(`Password reset link sent to ${email} (demo mode).`);
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">

      {/* Decorative background shapes */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-blue-200/30 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 -right-40 w-[520px] h-[520px] rounded-full bg-sky-200/40 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-48 left-1/4 w-[560px] h-[560px] rounded-full bg-blue-100/60 blur-3xl pointer-events-none"></div>

      <div className="relative min-h-screen flex items-center justify-center gap-16 px-6 py-10 max-w-7xl mx-auto">

        {/* ================= LEFT: Brand / Pitch ================= */}
        <section className="hidden lg:flex flex-col flex-1 max-w-xl self-stretch">

          {/* Logo row */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-600/25 text-white">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                MediFlow <span className="text-blue-600">AI</span>
              </div>
              <div className="text-[13px] text-slate-500">Smarter Clinics. Healthier Communities.</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
            <span className="text-blue-600">AI-Powered</span>{' '}
            <span className="text-slate-900">Clinic Management</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Streamline your clinic operations with AI. Manage queues, create
            structured medical records, and keep patients on track with
            medication reminders.
          </p>

          {/* Feature list */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-0.5">Live Queue Management</h3>
                <p className="text-sm text-slate-500">Reduce waiting time and improve patient flow</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-0.5">AI-Powered Clinical Notes</h3>
                <p className="text-sm text-slate-500">Convert messy notes into structured EMR using Gemma 4</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-0.5">Medication Reminders</h3>
                <p className="text-sm text-slate-500">Help patients stay on track with their treatment</p>
              </div>
            </div>
          </div>

          {/* Clinic illustration with floating quote */}
          <div className="relative flex-1 min-h-[360px] mt-8 -mx-6 pointer-events-none">
            <img
              src={clinicIllustration}
              alt="MediFlow AI clinic waiting area — patients seated while the live token board shows A34 In Consultation, A35 and A36 Waiting, and A37 Next"
              className="absolute inset-0 w-full h-full object-contain object-bottom mix-blend-multiply"
              loading="eager"
              draggable="false"
            />

            {/* Quote card overlay */}
            <div className="absolute bottom-10 left-0 z-10 pointer-events-auto">
              <div className="inline-flex items-start space-x-3 bg-slate-900/80 backdrop-blur-md text-white rounded-2xl px-5 py-4 shadow-xl">
                <Quote className="w-6 h-6 text-blue-400 shrink-0 -scale-x-100" />
                <p className="font-semibold leading-snug">Better Clinics.<br />Brighter Lives.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT: Auth Card ================= */}
        <section className="w-full max-w-xl flex flex-col items-center">

          <div className="w-full bg-white/90 backdrop-blur rounded-3xl shadow-2xl shadow-blue-900/10 border border-white p-8 sm:p-10">

            {/* Card logo */}
            <div className="flex items-center justify-center space-x-2.5 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                MediFlow <span className="text-blue-600">AI</span>
              </div>
            </div>

            <div className="text-center mb-7">
              <h2 className="text-2xl font-extrabold text-slate-900">Welcome Back</h2>
              <p className="text-slate-500 text-sm mt-1">
                Sign in to your account to continue
              </p>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {Object.entries(ROLE_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const selected = role === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 py-4 px-2 transition-all duration-200 group ${
                      selected ? meta.active : meta.idle
                    }`}
                  >
                    <Icon className="w-7 h-7 mb-1.5" />
                    <span className={`text-sm font-semibold ${selected ? '' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {meta.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
                <button onClick={() => setLocalError('')} className="ml-auto text-rose-400 hover:text-rose-600">✕</button>
              </div>
            )}

            {info && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>{info}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Display name (register mode) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-bold text-slate-800 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Dr. Sarah Mitchell"
                      required
                      className="w-full pl-11 pr-3 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLocalError(''); }}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-3 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-800 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLocalError(''); }}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                    className="w-full pl-11 pr-11 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                  />
                  <span className="font-semibold text-slate-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span>Authenticating…</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* or divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="px-4 text-sm text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Register switch / demo quick start */}
            {mode === 'login' ? (
              <p className="text-center text-sm text-slate-600">
                New to MediFlow AI?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setLocalError(''); setInfo(''); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLocalError(''); setInfo(''); }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign in instead
                </button>
              </p>
            )}

            {/* 1-Click demo entry (keeps FR-1.2 hackathon flow) */}
            <button
              type="button"
              onClick={handleDemoQuickStart}
              className="mt-4 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-blue-700 text-sm font-semibold transition-all flex items-center justify-center space-x-2"
            >
              <UserRoundCheck className="w-4 h-4" />
              <span>1-Click Demo: Continue as {ROLE_META[role].label}</span>
            </button>
          </div>

          {/* Footer badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Secure &amp; Reliable</span>
            </span>
            <span className="hidden sm:block w-px h-5 bg-slate-200"></span>
            <span className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>AI Powered</span>
            </span>
            <span className="hidden sm:block w-px h-5 bg-slate-200"></span>
            <span className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Built for Clinics</span>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};
