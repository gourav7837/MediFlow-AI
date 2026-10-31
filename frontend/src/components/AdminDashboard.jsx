import React, { useState, useEffect } from 'react';
import {
  Sun,
  Sunset,
  Moon,
  Users,
  CalendarCheck,
  UserRound,
  Clock,
  ChevronDown,
  Mic,
  Bot,
  UserPlus,
  CalendarPlus,
  FileUp,
  BrainCircuit,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';

// ---------- Small helpers -------------------------------------------------

const SPARKLINES = {
  blue: 'M2 18 C10 12, 16 20, 24 14 S 40 8, 50 12 S 66 18, 78 8',
  green: 'M2 14 C10 20, 18 8, 28 12 S 44 18, 54 10 S 68 6, 78 10',
  purple: 'M2 16 C12 10, 20 16, 30 12 S 46 6, 58 12 S 70 16, 78 8',
  orange: 'M2 12 C12 18, 22 8, 34 12 S 50 18, 60 10 S 70 8, 78 12'
};

const getGreetingKey = () => {
  const h = new Date().getHours();
  if (h < 5) return 'night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const GREETINGS = {
  morning: { text: 'Good Morning', Icon: Sun },
  afternoon: { text: 'Good Afternoon', Icon: Sun },
  evening: { text: 'Good Evening', Icon: Sunset },
  night: { text: 'Good Night', Icon: Moon }
};

const formatTime12 = (t = '') => {
  const [hRaw, mRaw] = String(t).split(':');
  let h = parseInt(hRaw, 10);
  if (Number.isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mRaw || '00'} ${ampm}`;
};

const initialsOf = (name = '') => {
  const parts = name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
};

const AVATAR_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-sky-500', 'bg-rose-500'];

const relativeTime = (iso) => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
};

const humanizeAction = (action = '') =>
  action
    .split('_')
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(' ');

const ACTIVITY_ICONS = {
  PATIENT_REGISTERED: { Icon: UserPlus, cls: 'bg-blue-50 text-blue-600' },
  APPOINTMENT_BOOKED: { Icon: CalendarCheck, cls: 'bg-emerald-50 text-emerald-600' },
  REPORT_UPLOADED: { Icon: FileUp, cls: 'bg-violet-50 text-violet-600' },
  CONSULTATION_COMPLETED: { Icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600' }
};

// ---------- Component ------------------------------------------------------

export const AdminDashboard = ({ onNavigate, onOpenRegister, onOpenBook }) => {
  const { currentUser } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const metrics = statsData?.metrics || {
    totalPatients: 248,
    todayAppointments: 18,
    totalDoctors: 6,
    pendingAppointments: 5,
    completedConsultations: 11
  };

  const userName = (() => {
    const name = currentUser?.displayName?.trim() || 'Admin';
    const honorific = name.match(/^Dr\.?\s*/i);
    const rest = name.replace(/^Dr\.?\s*/i, '');
    const first = rest.split(' ')[0] || name.split(' ')[0];
    return honorific ? `Dr. ${first}` : first;
  })();
  const greeting = GREETINGS[getGreetingKey()];
  const todayLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Appointment Overview: bookings across clinic hours today (Scheduled / Completed / Cancelled)
  const hourlyData = [
    { hour: '8 AM', scheduled: 5, completed: 0, cancelled: 0 },
    { hour: '9 AM', scheduled: 10, completed: 7, cancelled: 0 },
    { hour: '10 AM', scheduled: 9, completed: 3, cancelled: 5 },
    { hour: '11 AM', scheduled: 7, completed: 8, cancelled: 0 },
    { hour: '12 PM', scheduled: 4, completed: 2, cancelled: 0 },
    { hour: '1 PM', scheduled: 8, completed: 0, cancelled: 1 },
    { hour: '2 PM', scheduled: 5, completed: 2, cancelled: 0 },
    { hour: '3 PM', scheduled: 9, completed: 2, cancelled: 0 },
    { hour: '4 PM', scheduled: 7, completed: 1, cancelled: 0 },
    { hour: '5 PM', scheduled: 10, completed: 3, cancelled: 0 },
    { hour: '6 PM', scheduled: 8, completed: 4, cancelled: 0 },
    { hour: '7 PM', scheduled: 3, completed: 1, cancelled: 0 },
    { hour: '8 PM', scheduled: 4, completed: 1, cancelled: 0 }
  ];

  // Patient Growth: new vs returning registrations over the last 6 months
  const patientGrowth = [
    { month: 'May', newPatients: 30, returning: 4 },
    { month: 'Jun', newPatients: 44, returning: 18 },
    { month: 'Jul', newPatients: 55, returning: 27 },
    { month: 'Aug', newPatients: 70, returning: 48 },
    { month: 'Sep', newPatients: 49, returning: 42 },
    { month: 'Oct', newPatients: 65, returning: 67 }
  ];

  // Today's Schedule: live appointments (if any), else demo entries
  const liveSchedule = (statsData?.recentAppointments || []).slice(0, 5).map((a) => {
    const statusChip =
      a.status === 'Confirmed'
        ? { label: 'Check-in', cls: 'bg-blue-100 text-blue-700 border-blue-200' }
        : a.status === 'In Consultation'
        ? { label: 'In Room', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
        : a.status === 'Completed'
        ? { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' }
        : a.status === 'Waiting' || a.status === 'Pending'
        ? { label: 'Waiting', cls: 'bg-amber-100 text-amber-700 border-amber-200' }
        : { label: 'Upcoming', cls: 'bg-slate-100 text-slate-600 border-slate-200' };

    return {
      id: a.id,
      time: formatTime12(a.appointmentTime),
      name: a.patientName,
      detail: `${a.reasonForVisit} • ${a.doctorName}`,
      ...statusChip
    };
  });

  const fallbackSchedule = [
    { id: 'f1', time: '09:00 AM', name: 'Rahul Sharma', detail: 'General Consultation', label: 'Check-in', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'f2', time: '09:30 AM', name: 'Neha Gupta', detail: 'Follow-up Visit', label: 'In Room', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'f3', time: '10:15 AM', name: 'Amit Verma', detail: 'Cardiology', label: 'Upcoming', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'f4', time: '11:00 AM', name: 'Sneha Patel', detail: 'Orthopedics', label: 'Upcoming', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'f5', time: '11:30 AM', name: 'Vikram Singh', detail: 'Skin Consultation', label: 'Upcoming', cls: 'bg-slate-100 text-slate-600 border-slate-200' }
  ];

  const schedule = liveSchedule.length ? liveSchedule : fallbackSchedule;

  const doctors = statsData?.doctorAvailability || [
    { name: 'Dr. Rajesh Sharma', specialization: 'Internal Medicine', status: 'Available' },
    { name: 'Dr. Sarah Mitchell', specialization: 'General Practice', status: 'In Consultation' },
    { name: 'Dr. Ananya Roy', specialization: 'Orthopedics', status: 'Available' },
    { name: 'Dr. Karan Mehta', specialization: 'Pediatrics', status: 'Off Duty' }
  ];

  const pillCls = (status = '') =>
    status === 'Available'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'In Consultation'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-500';

  const activities = statsData?.recentAuditLogs || [];

  const quickActions = [
    { label: 'Book Appointment', sub: 'Schedule a new visit', Icon: CalendarPlus, cls: 'bg-blue-50 text-blue-600 ring-blue-100', onClick: onOpenBook },
    { label: 'Add New Patient', sub: 'Register a patient', Icon: UserPlus, cls: 'bg-emerald-50 text-emerald-600 ring-emerald-100', onClick: onOpenRegister },
    { label: 'Analyze Report', sub: 'Upload & get AI insights', Icon: FileUp, cls: 'bg-violet-50 text-violet-600 ring-violet-100', onClick: () => onNavigate('medical-reports') },
    { label: 'Open AI Copilot', sub: 'Get clinical assistance', Icon: BrainCircuit, cls: 'bg-orange-50 text-orange-600 ring-orange-100', onClick: () => onNavigate('clinical-copilot') }
  ];

  const { Icon: GreetIcon } = greeting;

  return (
    <div className="space-y-6">

      {/* ============ Content + Right rail ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_310px] gap-6 items-start">

        {/* ---------- LEFT MAIN COLUMN ---------- */}
        <div className="space-y-6 min-w-0">

          {/* Greeting header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full shrink-0 grid place-items-center">
                <GreetIcon className={`w-10 h-10 ${getGreetingKey() === 'morning' ? 'text-amber-400' : 'text-orange-400'} fill-amber-300/30`} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {greeting.text}, {userName}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">Here&apos;s what&apos;s happening at your clinic today.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-semibold text-slate-600">
                {todayLabel}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('appointments')}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 flex items-center space-x-1.5 hover:border-blue-300 hover:text-blue-700 transition-all"
              >
                <span>Today</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Total Patients */}
            <div
              onClick={() => onNavigate('patients')}
              className="cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 grid place-items-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Total Patients</p>
                  <p className="text-2xl font-black text-slate-900">{loading ? '…' : metrics.totalPatients}</p>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center mt-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +12% this month
                  </span>
                </div>
                <svg viewBox="0 0 80 24" className="w-14 h-6 self-end text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d={SPARKLINES.blue} />
                </svg>
              </div>
            </div>

            {/* Today's Appointments */}
            <div
              onClick={() => onNavigate('appointments')}
              className="cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 grid place-items-center">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Today&apos;s Appointments</p>
                  <p className="text-2xl font-black text-slate-900">{loading ? '…' : metrics.todayAppointments}</p>
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {metrics.todayAppointments - metrics.completedConsultations} in progress
                  </span>
                </div>
                <svg viewBox="0 0 80 24" className="w-14 h-6 self-end text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d={SPARKLINES.green} />
                </svg>
              </div>
            </div>

            {/* Active Doctors */}
            <div
              onClick={() => onNavigate('doctors')}
              className="cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-500 grid place-items-center">
                  <UserRound className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Active Doctors</p>
                  <p className="text-2xl font-black text-slate-900">{loading ? '…' : String(metrics.totalDoctors).padStart(2, '0')}</p>
                  <span className="text-[11px] text-violet-600 font-bold flex items-center mt-0.5">
                    <ArrowUpRight className="w-3 h-3" /> {Math.max(2, Math.ceil(metrics.totalDoctors / 2))} Specializations
                  </span>
                </div>
                <svg viewBox="0 0 80 24" className="w-14 h-6 self-end text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d={SPARKLINES.purple} />
                </svg>
              </div>
            </div>

            {/* Pending Review */}
            <div
              onClick={() => onNavigate('appointments')}
              className="cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 grid place-items-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Pending Review</p>
                  <p className="text-2xl font-black text-slate-900">{loading ? '…' : metrics.pendingAppointments}</p>
                  <span className="text-[11px] text-orange-600 font-bold mt-0.5">Consultations</span>
                </div>
                <svg viewBox="0 0 80 24" className="w-14 h-6 self-end text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d={SPARKLINES.orange} />
                </svg>
              </div>
            </div>
          </div>

          {/* Appointment overview + Today's schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6">

            {/* Appointment Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-extrabold text-slate-900">Appointment Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Today&apos;s appointments across all doctors</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <span>Today</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center space-x-4 mb-3 text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-300 inline-block"></span>Scheduled</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span>Completed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-300 inline-block"></span>Cancelled</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} margin={{ top: 6, right: 4, left: -28, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={1} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="scheduled" stackId="a" fill="#93C5FD" radius={[0, 0, 0, 0]} name="Scheduled" />
                    <Bar dataKey="completed" stackId="a" fill="#34D399" name="Completed" />
                    <Bar dataKey="cancelled" stackId="a" fill="#FDA4AF" radius={[4, 4, 0, 0]} name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-slate-900">Today&apos;s Schedule</h2>
                <button onClick={() => onNavigate('appointments')} className="text-xs text-blue-600 font-bold hover:underline">
                  View All
                </button>
              </div>

              <ul className="space-y-4">
                {schedule.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-slate-500 w-16 shrink-0">{item.time}</span>
                    <span className={`w-9 h-9 rounded-full ${AVATAR_COLORS[(initialsOf(item.name).charCodeAt(0)) % AVATAR_COLORS.length]} text-white text-[10px] font-extrabold grid place-items-center shrink-0`}>
                      {initialsOf(item.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.detail}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border shrink-0 ${item.cls}`}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Patient growth + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6">

            {/* Patient Growth */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="font-extrabold text-slate-900">Patient Growth</h2>
                  <p className="text-xs text-slate-500 mt-0.5">New vs returning patients (Last 6 months)</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <span>6 Months</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-2 text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>New Patients</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>Returning Patients</span>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientGrowth} margin={{ top: 6, right: 8, left: -26, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 80]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="newPatients" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: '#2563EB' }} name="New Patients" />
                    <Line type="monotone" dataKey="returning" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} name="Returning Patients" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-extrabold text-slate-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map(({ label, sub, Icon, cls, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="group text-left rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-slate-200 p-4 ring-offset-1 transition-all flex flex-col justify-between"
                  >
                    <div className={`w-10 h-10 rounded-xl grid place-items-center ring-1 ${cls}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-[13px] font-extrabold text-slate-900 leading-tight">{label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT RAIL ---------- */}
        <div className="space-y-6 min-w-0">

          {/* MediFlow AI Companion */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-sky-50 to-white border border-blue-100 shadow-sm p-5">
            <div className="flex items-start space-x-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-[#0B2545] grid place-items-center shadow-lg shadow-blue-900/20">
                  <Bot className="w-8 h-8 text-sky-300" />
                </div>
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sky-400 border-2 border-white"></span>
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900">MediFlow AI Companion</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Your AI assistant is ready to help with appointments, patients and clinic operations.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('voice-agent')}
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center space-x-2"
            >
              <Mic className="w-4 h-4" />
              <span>Start Voice Assistant</span>
            </button>
          </div>

          {/* Doctor Availability */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900">Doctor Availability</h3>
              <button onClick={() => onNavigate('doctors')} className="text-xs text-blue-600 font-bold hover:underline">
                View All
              </button>
            </div>

            <ul className="space-y-3.5">
              {doctors.slice(0, 5).map((doc, idx) => (
                <li key={doc.doctorId || doc.name || idx} className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-[10px] font-extrabold grid place-items-center shrink-0`}>
                    {initialsOf(doc.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {doc.specialization}{doc.room ? ` • Room ${doc.room}` : ''}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${pillCls(doc.status)}`}>
                    {doc.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Activities */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900">Recent Activities</h3>
              <span className="text-xs text-slate-400">Live</span>
            </div>

            <ul className="space-y-4">
              {activities.length
                ? activities.slice(0, 5).map((log) => {
                    const meta = ACTIVITY_ICONS[log.action] || { Icon: Activity, cls: 'bg-slate-100 text-slate-500' };
                    const Meta = meta.Icon;
                    const title =
                      log.action === 'APPOINTMENT_BOOKED' ? 'Appointment booked'
                      : log.action === 'PATIENT_REGISTERED' ? 'New patient registered'
                      : log.action === 'CONSULTATION_COMPLETED' ? 'Consultation completed'
                      : log.action === 'REPORT_UPLOADED' ? 'Medical report uploaded'
                      : humanizeAction(log.action);
                    return (
                      <li key={log.id} className="flex items-start gap-3">
                        <span className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${meta.cls}`}>
                          <Meta className="w-4 h-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-900">{title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{log.actor} · {relativeTime(log.timestamp)}</p>
                        </div>
                      </li>
                    );
                  })
                : (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-blue-50 text-blue-600"><UserPlus className="w-4 h-4" /></span>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">New patient registered</p>
                        <p className="text-[11px] text-slate-500">Rahul Sharma · 2 mins ago</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-emerald-50 text-emerald-600"><CalendarCheck className="w-4 h-4" /></span>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">Appointment booked via AI Voice</p>
                        <p className="text-[11px] text-slate-500">Neha Gupta · 15 mins ago</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-violet-50 text-violet-600"><FileUp className="w-4 h-4" /></span>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">Medical report uploaded</p>
                        <p className="text-[11px] text-slate-500">Amit Verma · 32 mins ago</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full grid place-items-center shrink-0 bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></span>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">Consultation completed</p>
                        <p className="text-[11px] text-slate-500">Priya Desai · 1 hr ago</p>
                      </div>
                    </li>
                  </>
                )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
