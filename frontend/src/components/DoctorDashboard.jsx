import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Search, 
  RefreshCw, 
  Eye, 
  Play, 
  FileText, 
  Bell, 
  Activity, 
  Filter, 
  UserCheck, 
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIPatientSummaryModal } from './AIPatientSummaryModal';

export const DoctorDashboard = ({ onOpenPatientWorkspace, onOpenCopilot }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today'); // 'today' | 'all'
  const [statusFilter, setStatusFilter] = useState('all');
  const [availability, setAvailability] = useState('Available');

  // AI Summary Modal state
  const [selectedSummaryPatient, setSelectedSummaryPatient] = useState(null);
  const [aiSummaryData, setAiSummaryData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const doctorName = currentUser?.displayName || 'Dr. Sarah Mitchell, MD';
  const doctorSpecialty = currentUser?.specialty || 'General Practice & Internal Medicine';

  const fetchDoctorOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/doctor/overview?doctorId=${encodeURIComponent(doctorName)}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error('Fetch doctor overview failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorOverview();
    const interval = setInterval(fetchDoctorOverview, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAISummary = async (patient) => {
    setSelectedSummaryPatient(patient);
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/patient-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.patientId })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummaryData(data);
      }
    } catch (e) {
      console.error('AI summary fetch failed', e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartConsultation = async (apt) => {
    // Update appointment status to 'In Consultation'
    try {
      await fetch(`/api/appointments/${apt.id || apt.appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Consultation' })
      });
    } catch (e) {
      console.error('Update appointment status failed', e);
    }

    if (onOpenPatientWorkspace) {
      onOpenPatientWorkspace(apt.patientId, apt.id || apt.appointmentId);
    }
  };

  const currentDateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const appointmentsList = dateFilter === 'today'
    ? (overview?.todayAppointments || [])
    : (overview?.allDoctorAppointments || []);

  const filteredAppointments = appointmentsList.filter(apt => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      apt.patientName?.toLowerCase().includes(q) ||
      apt.patientId?.toLowerCase().includes(q) ||
      apt.reasonForVisit?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || apt.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const metrics = overview?.metrics || {
    todayAppointmentsCount: 3,
    waitingPatientsCount: 1,
    inConsultationCount: 1,
    completedConsultationsCount: 1,
    pendingReportsCount: 2
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header (PRD Section 2) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-black flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">
            {currentUser?.avatar || '👩‍⚕️'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">Doctor Workspace</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-500">{currentDateDisplay}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Good Morning, {doctorName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {doctorSpecialty} • MediFlow Central OPD Suite 102
            </p>
          </div>
        </div>

        {/* Header Right: Availability & Notifications */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold px-2 text-[11px]">Status:</span>
            {['Available', 'In Consultation', 'Break'].map(st => (
              <button
                key={st}
                onClick={() => setAvailability(st)}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  availability === st
                    ? st === 'Available' ? 'bg-emerald-600 text-white shadow-sm' :
                      st === 'In Consultation' ? 'bg-blue-600 text-white shadow-sm' : 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDoctorOverview}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            title="Refresh Patient Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Dashboard Statistics Cards (PRD Section 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Today's Appointments */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Today's Total</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.todayAppointmentsCount}</span>
            <span className="text-[11px] text-slate-500 font-medium">Scheduled Patients</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Waiting Patients */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Waiting in OPD</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.waitingPatientsCount}</span>
            <span className="text-[11px] text-amber-700 font-semibold">Ready for Vitals</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: In Consultation */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">In Consultation</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.inConsultationCount}</span>
            <span className="text-[11px] text-blue-700 font-semibold">Active in Suite</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Card 4: Completed Consultations */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Completed</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.completedConsultationsCount}</span>
            <span className="text-[11px] text-emerald-700 font-semibold">Prescriptions Sent</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Pending Reports */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Pending Reports</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics.pendingReportsCount}</span>
            <span className="text-[11px] text-indigo-700 font-semibold">Require Review</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Today's Patient List (Most Important Section - PRD Section 2) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        
        {/* Table Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Assigned Patient Queue & Appointments</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consultation roster assigned to Dr. Sarah Mitchell with 1-click clinical actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, ID, complaints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-52 sm:w-64"
              />
            </div>

            {/* Date Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  dateFilter === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today Only
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  dateFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Upcoming
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="waiting">Waiting</option>
              <option value="in consultation">In Consultation</option>
              <option value="confirmed">Confirmed / Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient Information</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Time & Token</th>
                <th className="py-3 px-4">Reason for Visit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No patients match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id || apt.appointmentId} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs">
                          {apt.patientName?.split(' ').map(n => n[0]).join('') || 'PT'}
                        </div>
                        <div>
                          <span className="font-black text-slate-900 block text-xs">{apt.patientName}</span>
                          <span className="text-[11px] text-slate-500">{apt.age ? `${apt.age}y` : '34y'} • {apt.gender || 'Male'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Patient ID */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {apt.patientId || 'PAT-1092'}
                      </span>
                    </td>

                    {/* Time & Token */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">
                        <span className="font-extrabold block">{apt.appointmentTime}</span>
                        <span className="text-[10px] font-bold text-blue-600">Token #{apt.tokenNumber || 'A34'}</span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 font-medium max-w-xs block truncate">
                        {apt.reasonForVisit || apt.reason || 'General Health Consultation'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center space-x-1 ${
                        apt.status === 'In Consultation' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                        apt.status === 'Waiting' ? 'bg-amber-100 text-amber-800' :
                        apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'Confirmed' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span>{apt.status || 'Upcoming'}</span>
                      </span>
                    </td>

                    {/* Actions (4 Key Doctor Actions - PRD Section 2) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1.5">
                        
                        {/* 1. View Patient */}
                        <button
                          onClick={() => onOpenPatientWorkspace && onOpenPatientWorkspace(apt.patientId, apt.id || apt.appointmentId)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Open 3-Column Patient Workspace"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* 2. AI Summary */}
                        <button
                          onClick={() => handleOpenAISummary(apt)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center space-x-1 transition-all"
                          title="Generate Gemma 4 Patient Summary"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>AI Summary</span>
                        </button>

                        {/* 3. Start Consultation */}
                        <button
                          onClick={() => handleStartConsultation(apt)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] shadow-sm flex items-center space-x-1 transition-all"
                          title="Start Active Consultation"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Consult</span>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* AI Patient Summary Modal */}
      {selectedSummaryPatient && (
        <AIPatientSummaryModal
          patient={selectedSummaryPatient}
          summaryData={aiSummaryData}
          loading={aiLoading}
          onRegenerate={() => handleOpenAISummary(selectedSummaryPatient)}
          onClose={() => setSelectedSummaryPatient(null)}
          onApprove={() => setSelectedSummaryPatient(null)}
        />
      )}

    </div>
  );
};
