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
  RefreshCw
} from 'lucide-react';

export const AppointmentManagement = ({ initialBookOpen = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(initialBookOpen);
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
    try {
      const [aptRes, docRes, patRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/doctors'),
        fetch('/api/patients')
      ]);

      if (aptRes.ok) setAppointments(await aptRes.json());
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
        if (pats.length > 0 && !selectedPatientId) setSelectedPatientId(pats[0].patientId);
      }
    } catch (e) {
      console.error('Error loading appointments data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update available slots when doctor changes
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

  // Create Appointment with Double-Booking check (PRD Module 4)
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
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Status update failed', e);
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Cancellation failed', e);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
    const matchesSearch = apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.appointmentId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>Appointment Management & Scheduling</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time outpatient consultation slots with backend double-booking validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-slate-500">Filter Status:</span>
          {['All', 'Confirmed', 'In Consultation', 'Pending', 'Completed', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterStatus === st ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, doctor, APT ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Appointment ID</th>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Consulting Doctor</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No appointments found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{apt.appointmentId}</div>
                      <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        Token {apt.tokenNumber || 'A34'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{apt.patientName}</div>
                      <p className="text-[11px] text-slate-500">{apt.patientId} • {apt.reasonForVisit}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{apt.doctorName}</div>
                      <p className="text-[11px] text-slate-400">Booked via: {apt.bookedVia || 'Direct'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{apt.appointmentDate}</div>
                      <div className="text-[11px] text-blue-600 font-bold">{apt.appointmentTime}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
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

                    <td className="py-3.5 px-4 text-right space-x-1">
                      {apt.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Confirmed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all"
                        >
                          Confirm
                        </button>
                      )}

                      {apt.status === 'Confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'In Consultation')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition-all"
                        >
                          Start Consult
                        </button>
                      )}

                      {apt.status === 'In Consultation' && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-all"
                        >
                          Complete
                        </button>
                      )}

                      {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-bold text-[11px] transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Create Appointment with Double-Booking Prevention */}
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

