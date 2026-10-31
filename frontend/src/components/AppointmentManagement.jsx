import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  User, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  X,
  Filter,
  Check,
  RefreshCw,
  ArrowRight,
  Flame,
  Info,
  CalendarCheck,
  CalendarDays
} from 'lucide-react';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';

export const AppointmentManagement = ({ initialBookOpen = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('All');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(initialBookOpen);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [targetAppointmentForReschedule, setTargetAppointmentForReschedule] = useState(null);

  // Messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Booking Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptRes, docRes, patRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/doctors'),
        fetch('/api/patients')
      ]);

      if (aptRes.ok) {
        const apts = await aptRes.json();
        setAppointments(apts);
      }
      if (docRes.ok) {
        const docs = await docRes.json();
        setDoctors(docs);
        if (docs.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docs[0].doctorId);
          setAvailableSlots(docs[0].timeSlots || []);
        }
      }
      if (patRes.ok) {
        const pats = await patRes.json();
        setPatients(pats);
        if (pats.length > 0 && !selectedPatientId) {
          setSelectedPatientId(pats[0].patientId);
        }
      }
    } catch (e) {
      console.error('Error loading appointments data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update available slots when doctor changes in booking modal
  useEffect(() => {
    if (selectedDoctorId) {
      const doc = doctors.find(d => d.doctorId === selectedDoctorId);
      if (doc && doc.timeSlots) {
        setAvailableSlots(doc.timeSlots);
        if (!doc.timeSlots.includes(appointmentTime)) {
          setAppointmentTime(doc.timeSlots[0] || '10:00 AM');
        }
      }
    }
  }, [selectedDoctorId, doctors]);

  // Create Appointment with Double-Booking check
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorId: selectedDoctorId,
          appointmentDate,
          appointmentTime,
          reasonForVisit,
          bookedVia: 'Staff Appointment Desk'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(`Appointment ${data.appointment?.appointmentId} booked successfully!`);
        setIsBookModalOpen(false);
        setReasonForVisit('');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to book appointment.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to backend server.');
    }
  };

  // Status transitions
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Status update failed', e);
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessMessage('Appointment cancelled.');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (e) {
      console.error('Cancellation failed', e);
    }
  };

  // Open reschedule modal for a specific appointment
  const handleOpenRescheduleModal = (apt = null) => {
    setTargetAppointmentForReschedule(apt);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduledSuccess = (updatedAppointment) => {
    setSuccessMessage(`Appointment ${updatedAppointment.appointmentId} has been successfully rescheduled to ${updatedAppointment.appointmentDate} at ${updatedAppointment.appointmentTime}!`);
    fetchData();
    setTimeout(() => setSuccessMessage(''), 6000);
  };

  // Filter Statuses required by PRD
  const statusOptions = ['All', 'Confirmed', 'In Consultation', 'Pending', 'Completed', 'Cancelled'];

  // Counts for each status
  const getStatusCount = (status) => {
    if (status === 'All') return appointments.length;
    return appointments.filter(a => a.status === status).length;
  };

  // Master filtered list
  const filteredAppointments = appointments.filter(apt => {
    // 1. Status Filter
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
    
    // 2. Search Query (patient, doctor, APT ID, token)
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      apt.patientName?.toLowerCase().includes(q) ||
      apt.doctorName?.toLowerCase().includes(q) ||
      apt.appointmentId?.toLowerCase().includes(q) ||
      apt.tokenNumber?.toLowerCase().includes(q) ||
      apt.patientId?.toLowerCase().includes(q);

    // 3. Doctor Filter
    const matchesDoctor = filterDoctor === 'All' || 
      apt.doctorId === filterDoctor || 
      apt.doctorName === filterDoctor;

    // 4. Date Filter
    const matchesDate = !filterDate || apt.appointmentDate === filterDate;

    return matchesStatus && matchesSearch && matchesDoctor && matchesDate;
  });

  const selectedCount = filteredAppointments.length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Clinic Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Cloud Firestore Active</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2 mt-1">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Appointment Management & Scheduling</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time outpatient consultation slots with backend collision validation and automated rescheduling.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenRescheduleModal(null)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-all shadow-sm"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Reschedule Appointment</span>
          </button>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ New Appointment</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            title="Refresh Appointments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. ACTION TOOLBAR (Search, Date Filter, Doctor Filter, Reschedule, + New) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Toolbar Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Search & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            
            {/* Search Appointments */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search patient, doctor, APT ID, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50/80 border border-slate-200 rounded-2xl px-3 py-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                title="Filter by specific date"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                  title="Clear date filter"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Doctor Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-50/80 border border-slate-200 rounded-2xl px-3 py-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.doctorId || d.id} value={d.doctorId}>
                    {d.fullName} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenRescheduleModal(null)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-blue-600 text-blue-600 hover:bg-blue-50 font-extrabold text-xs transition-all shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Reschedule</span>
            </button>

            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>+ New Appointment</span>
            </button>
          </div>

        </div>

        {/* 3. HORIZONTAL FILTER BAR (Heading: Filter Status:) */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Filter Status:</span>
            </span>

            {statusOptions.map(st => {
              const isActive = filterStatus === st;
              const count = getStatusCount(st);

              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                      : 'bg-[#F1F5F9] text-[#0F172A] hover:bg-slate-200'
                  }`}
                >
                  <span>{st}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Result Count Indicator */}
          <div className="text-xs font-bold text-slate-500">
            Showing <span className="text-blue-600 font-black">{selectedCount}</span> of {appointments.length} appointments
            {filterStatus !== 'All' && (
              <span className="ml-1 text-[11px] text-slate-400">({filterStatus})</span>
            )}
          </div>

        </div>

      </div>

      {/* 4. APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-4">Appointment ID</th>
                <th className="py-4 px-4">Patient</th>
                <th className="py-4 px-4">Consulting Doctor</th>
                <th className="py-4 px-4">Scheduled Date & Time</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-extrabold text-slate-600 text-sm">No appointments found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No records match the current status filter "{filterStatus}" or search parameters.
                    </p>
                    <button
                      onClick={() => { setFilterStatus('All'); setSearchQuery(''); setFilterDoctor('All'); setFilterDate(''); }}
                      className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const isEligibleForReschedule = apt.status !== 'Completed' && apt.status !== 'Cancelled';

                  return (
                    <tr key={apt.id || apt.appointmentId} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Appointment ID & Token */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-slate-900 text-xs">{apt.appointmentId}</div>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            Token {apt.tokenNumber || 'A34'}
                          </span>
                          {apt.isRescheduled && (
                            <span 
                              className="text-[9px] text-amber-700 font-black bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 cursor-help"
                              title={`Rescheduled from ${apt.previousAppointmentDate || ''} ${apt.previousAppointmentTime || ''} (${apt.rescheduleReason || 'Reason'})`}
                            >
                              Rescheduled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{apt.patientName}</div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {apt.patientId} • <span className="text-slate-400">{apt.reasonForVisit}</span>
                        </p>
                      </td>

                      {/* Doctor */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{apt.doctorName}</div>
                        <p className="text-[11px] text-slate-400">
                          Booked via: <span className="font-medium text-slate-500">{apt.bookedVia || 'Direct'}</span>
                        </p>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{apt.appointmentDate}</div>
                        <div className="text-[11px] text-blue-600 font-black flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{apt.appointmentTime}</span>
                        </div>
                        {apt.isRescheduled && apt.previousAppointmentDate && (
                          <div className="text-[10px] text-slate-400 line-through">
                            was: {apt.previousAppointmentDate} {apt.previousAppointmentTime}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          apt.status === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : apt.status === 'In Consultation'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                            : apt.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : apt.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {apt.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Reschedule Action Button (Visible for eligible visits) */}
                          {isEligibleForReschedule && (
                            <button
                              onClick={() => handleOpenRescheduleModal(apt)}
                              className="px-2.5 py-1 rounded-lg border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors flex items-center space-x-1"
                              title="Reschedule appointment date/time"
                            >
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span>Reschedule</span>
                            </button>
                          )}

                          {apt.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id || apt.appointmentId, 'Confirmed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all shadow-sm"
                            >
                              Confirm
                            </button>
                          )}

                          {apt.status === 'Confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id || apt.appointmentId, 'In Consultation')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-all shadow-sm"
                            >
                              Start Consult
                            </button>
                          )}

                          {apt.status === 'In Consultation' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id || apt.appointmentId, 'Completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all shadow-sm"
                            >
                              Complete
                            </button>
                          )}

                          {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                            <button
                              onClick={() => handleCancel(apt.id || apt.appointmentId)}
                              className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-[11px] transition-all"
                            >
                              Cancel
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: Reschedule Appointment Modal */}
      <RescheduleAppointmentModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        appointments={appointments}
        doctors={doctors}
        initialAppointment={targetAppointmentForReschedule}
        onRescheduled={handleRescheduledSuccess}
      />

      {/* 6. MODAL: Create New Appointment with Double-Booking Prevention */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-200" />
                <h3 className="text-base font-bold">Book Clinic Appointment</h3>
              </div>
              <button 
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.patientId}>
                      {p.fullName} ({p.patientId}) - {p.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor *</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.doctorId}>
                      {d.fullName} ({d.specialization}) - {d.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Time Slot *</label>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {availableSlots.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Follow up on fever, knee joint pain, routine review"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-800">
                Backend validation enforces strict double-booking protection for the selected doctor.
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
