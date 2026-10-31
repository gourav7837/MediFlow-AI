import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  Plus, 
  Mail, 
  Phone, 
  CheckCircle, 
  Building2, 
  X,
  BrainCircuit,
  Eye,
  Award
} from 'lucide-react';

export const DoctorManagement = ({ onOpenCopilot }) => {
  const [doctors, setDoctors] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Doctor Form
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('Internal Medicine & Cardiology');
  const [degree, setDegree] = useState('MBBS, MD');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consultationFee, setConsultationFee] = useState(800);
  const [roomNumber, setRoomNumber] = useState('Room 105');

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        setDoctors(await res.json());
      }
    } catch (e) {
      console.error('Fetch doctors failed', e);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!fullName || !specialization) return;

    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          specialization,
          degree,
          phone,
          email,
          consultationFee,
          roomNumber
        })
      });

      if (res.ok) {
        setFullName('');
        setPhone('');
        setEmail('');
        setIsAddModalOpen(false);
        fetchDoctors();
      }
    } catch (e) {
      console.error('Add doctor failed', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <span>Doctor Staff Directory & Schedules</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage physician credentials, specializations, consultation hours, and room assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Doctor Cards Grid */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">No Doctors Registered Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your clinic roster is currently clean. Click <span className="font-bold text-blue-600">"Add New Doctor"</span> above to add a physician, or have clinicians register directly via the Doctor Portal.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Doctor</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
          <div key={doc.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 bg-blue-50 rounded-2xl">{doc.avatar || '👨‍⚕️'}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{doc.fullName}</h3>
                    <p className="text-[11px] font-bold text-blue-600">{doc.degree}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  doc.status === 'Available'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {doc.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialization:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[160px]">{doc.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clinic Location:</span>
                  <span className="font-semibold text-slate-700">{doc.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consultation Fee:</span>
                  <span className="font-bold text-emerald-700">₹{doc.consultationFee || 800}</span>
                </div>
              </div>

              {/* Consultation Time Slots */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Consultation Slots
                </span>
                <div className="flex flex-wrap gap-1">
                  {(doc.timeSlots || []).map((slot, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-semibold text-[10px] border border-blue-100">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => onOpenCopilot && onOpenCopilot(doc.doctorId)}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Clinical Copilot</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* MODAL: Add Doctor */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-blue-200" />
                <h3 className="text-base font-bold">Add Doctor to Clinic</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavita Reddy"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specialization *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pediatrician, Dermatologist"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medical Degree</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Assignment</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 99..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

