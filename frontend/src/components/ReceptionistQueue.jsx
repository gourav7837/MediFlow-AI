import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlusCircle, 
  ArrowRight, 
  Volume2, 
  Stethoscope, 
  Search, 
  Filter, 
  UserCheck, 
  Calendar, 
  ClipboardList, 
  X 
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { useAuth } from '../context/AuthContext';

export const ReceptionistQueue = () => {
  const { appointments, updateTokenStatus, addNewToken } = useClinic();
  const { switchDemoRole } = useAuth();
  
  const [filter, setFilter] = useState('active'); // 'active' | 'all' | 'Waiting' | 'In Consultation' | 'Completed'
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcedToken, setAnnouncedToken] = useState(null);

  // Form state for new walk-in token
  const [newPatientName, setNewPatientName] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newAllergies, setNewAllergies] = useState('');
  const [newContact, setNewContact] = useState('');

  // Active Consultation Token (FR-2.2: Token #A34 - Waiting or In Consultation)
  const currentConsultation = appointments.find(a => a.status === 'In Consultation');
  const waitingTokens = appointments.filter(a => a.status === 'Waiting');
  const completedTokens = appointments.filter(a => a.status === 'Completed');

  // Filtered appointments list
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.tokenDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'active') return apt.status === 'In Consultation' || apt.status === 'Waiting';
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const handleCallNext = () => {
    if (waitingTokens.length > 0) {
      const nextToken = waitingTokens[0];
      // If someone was currently in consultation, we can mark them completed or let user confirm
      updateTokenStatus(nextToken.id, 'In Consultation');
      triggerChime(nextToken.tokenDisplay);
    }
  };

  const triggerChime = (tokenDisplay) => {
    setAnnouncedToken(tokenDisplay);
    // Simple synthesized voice or beep if supported
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Token ${tokenDisplay}, please proceed to consultation room 1.`);
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
    setTimeout(() => setAnnouncedToken(null), 4000);
  };

  const handleCreateToken = (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    addNewToken({
      patientName: newPatientName.trim(),
      reason: newReason.trim() || 'General Consultation',
      age: newAge,
      gender: newGender,
      contact: newContact.trim(),
      allergies: newAllergies ? newAllergies.split(',').map(s => s.trim()) : ['None reported']
    });

    setNewPatientName('');
    setNewReason('');
    setNewAge('');
    setNewAllergies('');
    setNewContact('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-200 mb-3 border border-white/10">
            <Calendar className="w-3.5 h-3.5" />
            <span>Today's Outpatient Clinic • Room 1 (Dr. Sarah Mitchell)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Live Queue & Token Board
          </h1>
          <p className="text-sm text-teal-100/90 mt-1 max-w-xl">
            Real-time Firestore synchronization for outpatient queue management. Advance tokens, call walk-ins, and direct patients to doctor consult.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Walk-in Token</span>
          </button>

          {waitingTokens.length > 0 && (
            <button
              onClick={handleCallNext}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-extrabold text-sm shadow-md transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Call Next (#{waitingTokens[0].tokenDisplay})</span>
            </button>
          )}
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Audio Announcement Toast */}
      {announcedToken && (
        <div className="p-4 bg-amber-500 text-slate-950 font-extrabold rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="text-base sm:text-lg">Now Calling Token #{announcedToken} to Consultation Room 1</span>
          </div>
          <span className="text-xs uppercase bg-black/10 px-2 py-1 rounded-md">Live Chime</span>
        </div>
      )}

      {/* FR-2.2: Current Token State Banner (Token #A34 - Waiting or In Consultation) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* NOW IN CONSULTATION CARD (FR-2.2) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-emerald-500/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Current Active Token (In Consultation)
              </span>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              Room 1 • Active
            </span>
          </div>

          {currentConsultation ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/60">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center font-extrabold shadow-md">
                  <span className="text-xs font-medium uppercase opacity-90">Token</span>
                  <span className="text-2xl leading-none">{currentConsultation.tokenDisplay}</span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-extrabold text-slate-800">{currentConsultation.patientName}</h3>
                    <span className="text-xs text-slate-500 font-medium">({currentConsultation.age}y / {currentConsultation.gender})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 flex items-center space-x-2">
                    <span>Chief Note: {currentConsultation.reason}</span>
                  </p>
                  {currentConsultation.allergies && currentConsultation.allergies.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1.5">
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md">
                        ⚠️ Allergy: {currentConsultation.allergies.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* State Transition Actions (FR-2.3) */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  onClick={() => triggerChime(currentConsultation.tokenDisplay)}
                  className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Chime Room</span>
                </button>
                <button
                  onClick={() => updateTokenStatus(currentConsultation.id, 'Completed')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
                <button
                  onClick={() => switchDemoRole('doctor')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                  title="Open Doctor EMR with this patient's notes"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                  <span>Open Doctor EMR</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No patient is currently in consultation</p>
              <p className="text-xs text-slate-400 mt-1">Select the next token from the queue below to start consult</p>
              {waitingTokens.length > 0 && (
                <button
                  onClick={handleCallNext}
                  className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5"
                >
                  <span>Call Token #{waitingTokens[0].tokenDisplay}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* QUEUE STATS CARD */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Queue Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">In Queue</span>
                <p className="text-2xl font-black text-amber-600 mt-0.5">{waitingTokens.length}</p>
                <span className="text-[10px] text-slate-400">Waiting for call</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">In Consult</span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">{currentConsultation ? 1 : 0}</p>
                <span className="text-[10px] text-slate-400">Dr. Sarah Mitchell</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">Completed</span>
                <p className="text-2xl font-black text-teal-700 mt-0.5">{completedTokens.length}</p>
                <span className="text-[10px] text-slate-400">Patients treated</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">Avg Wait Time</span>
                <p className="text-2xl font-black text-slate-800 mt-0.5">8 min</p>
                <span className="text-[10px] text-emerald-600 font-bold">Fast clinic flow</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-teal-500/30 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all text-center"
            >
              + Quick Walk-In Registration
            </button>
          </div>
        </div>

      </div>

      {/* FR-2.1: Live Queue List fetched from Firestore */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* List Header & Filters */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-teal-600" />
              <span>Today's Live Queue List</span>
              <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                {filteredAppointments.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Synced with Cloud Firestore `appointments` collection in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-44 sm:w-56"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setFilter('active')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'active' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('Waiting')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'Waiting' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Waiting
              </button>
              <button
                onClick={() => setFilter('Completed')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'Completed' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filter === 'all' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Table / Cards */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No appointments found matching filter</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt, index) => {
              const isConsulting = apt.status === 'In Consultation';
              const isWaiting = apt.status === 'Waiting';
              const isCompleted = apt.status === 'Completed';

              return (
                <div 
                  key={apt.id} 
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isConsulting ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Left: Token badge & Patient Details */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-extrabold shrink-0 border ${
                      isConsulting 
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                        : isWaiting
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Token</span>
                      <span className="text-lg leading-tight font-black">{apt.tokenDisplay}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{apt.patientName}</h4>
                        <span className="text-xs text-slate-500 font-medium">({apt.age}y • {apt.gender})</span>
                        
                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                          isConsulting 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : isWaiting
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-700">Complaint:</span> {apt.reason}
                      </p>

                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                        <span>Doctor: {apt.doctorName}</span>
                        <span>•</span>
                        <span>Time: {apt.estimatedTime}</span>
                        {apt.allergies && apt.allergies[0] !== 'None reported' && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              Allergy: {apt.allergies.join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: State Transition Buttons (FR-2.3) */}
                  <div className="flex items-center space-x-2 self-end md:self-center">
                    {isWaiting && (
                      <button
                        onClick={() => updateTokenStatus(apt.id, 'In Consultation')}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Start Consult</span>
                      </button>
                    )}

                    {isConsulting && (
                      <button
                        onClick={() => updateTokenStatus(apt.id, 'Completed')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Finish Consult</span>
                      </button>
                    )}

                    {isCompleted ? (
                      <button
                        onClick={() => updateTokenStatus(apt.id, 'Waiting')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-all"
                      >
                        Reopen to Queue
                      </button>
                    ) : (
                      <button
                        onClick={() => updateTokenStatus(apt.id, 'Completed')}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 text-xs font-semibold transition-all"
                        title="Skip or mark complete"
                      >
                        Skip
                      </button>
                    )}

                    <button
                      onClick={() => triggerChime(apt.tokenDisplay)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="Chime / Call Patient Speaker"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Add Walk-In Patient & Token Generation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-teal-700 text-white">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-teal-200" />
                <h3 className="text-base font-bold">Issue New Walk-In Token</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateToken} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="35"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chief Reason for Visit</label>
                <input
                  type="text"
                  placeholder="e.g. Severe headache, sore throat"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, None"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98..."
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Generate Token & Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

