import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Search, 
  ArrowRight, 
  Info,
  Check,
  RefreshCw,
  AlertTriangle,
  History
} from 'lucide-react';

export const RescheduleAppointmentModal = ({
  isOpen,
  onClose,
  appointments = [],
  doctors = [],
  initialAppointment = null,
  onRescheduled
}) => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date & Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Reason
  const [reason, setReason] = useState('Patient Request');
  const [customNotes, setCustomNotes] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Eligible appointments: Not Completed and Not Cancelled
  const eligibleAppointments = appointments.filter(
    apt => apt.status !== 'Completed' && apt.status !== 'Cancelled'
  );

  // Filtered by search
  const filteredEligible = eligibleAppointments.filter(apt => {
    const q = searchQuery.toLowerCase();
    return (
      apt.patientName?.toLowerCase().includes(q) ||
      apt.patientId?.toLowerCase().includes(q) ||
      apt.doctorName?.toLowerCase().includes(q) ||
      apt.appointmentId?.toLowerCase().includes(q)
    );
  });

  // When modal opens or initialAppointment changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      if (initialAppointment && initialAppointment.status !== 'Completed' && initialAppointment.status !== 'Cancelled') {
        setSelectedAppointmentId(initialAppointment.id || initialAppointment.appointmentId);
        // Default newDate to tomorrow or appointment's date
        const initialDate = initialAppointment.appointmentDate >= todayStr ? initialAppointment.appointmentDate : todayStr;
        setNewDate(initialDate);
      } else if (eligibleAppointments.length > 0) {
        setSelectedAppointmentId(eligibleAppointments[0].id || eligibleAppointments[0].appointmentId);
        setNewDate(todayStr);
      }
    }
  }, [isOpen, initialAppointment]);

  const selectedAppointment = appointments.find(
    a => (a.id && a.id === selectedAppointmentId) || (a.appointmentId && a.appointmentId === selectedAppointmentId)
  );

  // Fetch available slots whenever selected appointment doctor or newDate changes
  useEffect(() => {
    if (!selectedAppointment || !newDate) return;

    const docId = selectedAppointment.doctorId || selectedAppointment.doctorName;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/doctors/${encodeURIComponent(docId)}/available-slots?date=${newDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.availableSlots || []);
          setBookedSlots(data.bookedSlots || []);
          // If current newTime is not in available slots, pick first available
          if (data.availableSlots && data.availableSlots.length > 0) {
            if (!data.availableSlots.includes(newTime)) {
              setNewTime(data.availableSlots[0]);
            }
          } else {
            setNewTime('');
          }
        } else {
          // Fallback to doctor's configured slots minus local appointments
          const doc = doctors.find(d => d.doctorId === selectedAppointment.doctorId || d.fullName === selectedAppointment.doctorName);
          const defaultSlots = doc?.timeSlots || [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
          ];
          const localBooked = appointments
            .filter(a => a.doctorId === selectedAppointment.doctorId && a.appointmentDate === newDate && a.status !== 'Cancelled' && a.id !== selectedAppointment.id)
            .map(a => a.appointmentTime);
          setBookedSlots(localBooked);
          const av = defaultSlots.filter(s => !localBooked.includes(s));
          setAvailableSlots(av);
          if (av.length > 0 && !av.includes(newTime)) setNewTime(av[0]);
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedAppointmentId, newDate]);

  if (!isOpen) return null;

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) {
      setErrorMessage('Please select an appointment to reschedule.');
      return;
    }
    if (!newDate) {
      setErrorMessage('Please select a valid new appointment date.');
      return;
    }
    if (!newTime) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const aptTargetId = selectedAppointment.id || selectedAppointment.appointmentId;
      const res = await fetch(`/api/appointments/${aptTargetId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDate,
          newTime,
          reason,
          customNotes
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || 'Appointment rescheduled successfully!');
        if (onRescheduled) {
          onRescheduled(data.appointment);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Failed to reschedule appointment.');
      }
    } catch (err) {
      setErrorMessage('Could not connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reasonOptions = [
    'Patient Request',
    'Doctor Unavailable',
    'Schedule Conflict',
    'Emergency / Medical Reason',
    'Other'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Reschedule Appointment</h2>
              <p className="text-xs text-blue-100">Update the appointment date and time.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleConfirmReschedule} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* STEP 1: Select Appointment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">1</span>
                <span>Select Appointment to Reschedule</span>
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                {eligibleAppointments.length} eligible
              </span>
            </div>

            {eligibleAppointments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No active appointments eligible for rescheduling. Only confirmed, pending, or in-consultation visits can be moved.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by patient name, ID, or doctor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <select
                  value={selectedAppointmentId}
                  onChange={(e) => setSelectedAppointmentId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {filteredEligible.map(apt => (
                    <option key={apt.id || apt.appointmentId} value={apt.id || apt.appointmentId}>
                      {apt.patientName} ({apt.patientId}) — {apt.doctorName} • {apt.appointmentDate} at {apt.appointmentTime} [{apt.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* STEP 2: Current Appointment Details (Read-only Card) */}
          {selectedAppointment && (
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">2</span>
                <span>Current Appointment Details</span>
              </label>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start space-x-2.5">
                    <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Patient</span>
                      <p className="font-extrabold text-slate-900">{selectedAppointment.patientName}</p>
                      <p className="text-[11px] text-slate-500">{selectedAppointment.patientId} • Token #{selectedAppointment.tokenNumber || 'A34'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Stethoscope className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Consulting Doctor</span>
                      <p className="font-extrabold text-slate-900">{selectedAppointment.doctorName}</p>
                      <p className="text-[11px] text-slate-500">{selectedAppointment.department || 'Outpatient Clinic'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Calendar className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Current Scheduled Date</span>
                      <p className="font-bold text-slate-800">{selectedAppointment.appointmentDate}</p>
                      <span className="text-[11px] font-bold text-blue-600">{selectedAppointment.appointmentTime}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5">
                    <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Current Status & Reason</span>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700">
                          {selectedAppointment.status}
                        </span>
                        <span className="text-[11px] text-slate-600 truncate max-w-[140px]">
                          {selectedAppointment.reasonForVisit || 'General Consultation'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 & STEP 4: Select New Date and Available Time Slot */}
          {selectedAppointment && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">3 & 4</span>
                  <span>Select New Date & Available Time Slot</span>
                </label>
                {loadingSlots && (
                  <span className="text-[11px] font-bold text-blue-600 flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Checking availability...</span>
                  </span>
                )}
              </div>

              {/* Step 3: Date Picker */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">New Appointment Date *</label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end space-x-1.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => setNewDate(todayStr)}
                    className="px-2.5 py-2 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tm = new Date();
                      tm.setDate(tm.getDate() + 1);
                      setNewDate(tm.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-2 text-[11px] font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* Step 4: Time Slot Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Select Available Time Slot for {selectedAppointment.doctorName} *
                </label>

                {availableSlots.length === 0 ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>No available slots for this doctor on {newDate}. Please choose another date.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = newTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setNewTime(slot)}
                          className={`py-2 px-1 text-center rounded-xl font-extrabold text-[11px] transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600 ring-offset-1'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-1">
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                            <span>{slot}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {bookedSlots.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-400 font-medium">
                    Already booked slots on {newDate}: {bookedSlots.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Reschedule Reason */}
          {selectedAppointment && (
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">5</span>
                <span>Reason for Rescheduling</span>
              </label>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {reasonOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setReason(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        reason === opt
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Optional additional notes or remarks..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Confirmation Summary Card */}
          {selectedAppointment && newDate && newTime && (
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">6</span>
                <span>Reschedule Confirmation Summary</span>
              </label>

              <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl p-4 border border-blue-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Patient & Doctor</span>
                    <p className="font-extrabold text-slate-900">{selectedAppointment.patientName}</p>
                    <p className="text-[11px] text-slate-600 font-semibold">{selectedAppointment.doctorName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Reschedule Reason</span>
                    <p className="font-bold text-blue-700">{reason}</p>
                    {customNotes && <p className="text-[11px] text-slate-500 italic">"{customNotes}"</p>}
                  </div>

                  <div className="bg-white/80 rounded-xl p-2.5 border border-slate-200">
                    <span className="text-[10px] uppercase font-black text-rose-500">Previous Schedule</span>
                    <p className="font-bold text-slate-700 line-through text-xs mt-0.5">{selectedAppointment.appointmentDate}</p>
                    <p className="font-bold text-rose-600 line-through text-xs">{selectedAppointment.appointmentTime}</p>
                  </div>

                  <div className="bg-white rounded-xl p-2.5 border-2 border-emerald-500 shadow-sm">
                    <span className="text-[10px] uppercase font-black text-emerald-600 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>New Confirmed Schedule</span>
                    </span>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{newDate}</p>
                    <p className="font-black text-blue-600 text-xs">{newTime}</p>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-500 flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Backend collision validation guarantees no double booking. WhatsApp confirmation will be auto-dispatched to patient.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedAppointment || !newDate || !newTime || availableSlots.length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-white" />
                  <span>Confirm Reschedule</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

