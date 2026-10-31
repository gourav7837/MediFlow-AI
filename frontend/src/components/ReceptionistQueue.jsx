import React, { useState, useEffect } from 'react';
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
  X,
  Printer,
  Receipt,
  Sparkles,
  Bot,
  Activity,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Phone,
  UserPlus,
  Send,
  Building,
  ArrowRightLeft,
  Flame,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TokenPrintModal } from './TokenPrintModal';
import { InvoicePrintModal } from './InvoicePrintModal';

export const ReceptionistQueue = () => {
  const { currentUser, switchDemoRole } = useAuth();
  
  // Active Tab in Command Center
  // 'queue' | 'checkin' | 'billing' | 'copilot' | 'insights'
  const [activeTab, setActiveTab] = useState('queue');

  // Live Queue & Metrics State
  const [queueData, setQueueData] = useState({
    tokens: [],
    activeToken: null,
    waitingTokens: [],
    completedTokens: [],
    skippedTokens: [],
    metrics: {
      waitingCount: 0,
      inConsultationCount: 0,
      completedCount: 0,
      skippedCount: 0,
      avgWaitMinutes: 12,
      delayedCount: 0,
      checkedInCount: 0
    },
    doctorAvailability: []
  });

  const [loadingQueue, setLoadingQueue] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [queueFilter, setQueueFilter] = useState('active'); // 'active' | 'all' | 'Waiting' | 'Completed' | 'Skipped'
  const [announcedToken, setAnnouncedToken] = useState(null);

  // Modals & Printers
  const [selectedTokenForPrint, setSelectedTokenForPrint] = useState(null);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [tokenToTransfer, setTokenToTransfer] = useState(null);
  const [targetDoctorId, setTargetDoctorId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // 1. Smart Patient Check-in State
  const [checkInSearch, setCheckInSearch] = useState('');
  const [lookupResults, setLookupResults] = useState([]);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [selectedPatientForCheckIn, setSelectedPatientForCheckIn] = useState(null);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState('');
  const [checkInErrorMsg, setCheckInErrorMsg] = useState('');
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // New Walk-in Patient Form
  const [walkinName, setWalkinName] = useState('');
  const [walkinAge, setWalkinAge] = useState('');
  const [walkinGender, setWalkinGender] = useState('Male');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinDoctorId, setWalkinDoctorId] = useState('DOC-102');
  const [walkinReason, setWalkinReason] = useState('Outpatient Consultation');
  const [walkinAllergies, setWalkinAllergies] = useState('');

  // 2. Billing & Invoices State
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [doctorsList, setDoctorsList] = useState([]);

  // New Invoice Form
  const [invPatientName, setInvPatientName] = useState('');
  const [invPatientId, setInvPatientId] = useState('');
  const [invPatientPhone, setInvPatientPhone] = useState('');
  const [invDoctorId, setInvDoctorId] = useState('DOC-102');
  const [invConsultFee, setInvConsultFee] = useState(750);
  const [invRegFee, setInvRegFee] = useState(0);
  const [invAdditionalCharges, setInvAdditionalCharges] = useState([]);
  const [invNewAddDesc, setInvNewAddDesc] = useState('');
  const [invNewAddAmount, setInvNewAddAmount] = useState('');
  const [invDiscountType, setInvDiscountType] = useState('flat');
  const [invDiscountValue, setInvDiscountValue] = useState(0);
  const [invTaxRate, setInvTaxRate] = useState(5);
  const [invPaymentMethod, setInvPaymentMethod] = useState('UPI');
  const [invPaymentStatus, setInvPaymentStatus] = useState('Pending');
  const [invTransactionRef, setInvTransactionRef] = useState('');

  // Payment Verification Modal
  const [isVerifyPayModalOpen, setIsVerifyPayModalOpen] = useState(false);
  const [targetInvoiceForPay, setTargetInvoiceForPay] = useState(null);
  const [verifyPayMethod, setVerifyPayMethod] = useState('UPI');
  const [verifyTxnRef, setVerifyTxnRef] = useState('');

  // 3. AI Receptionist Copilot State
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Alex! I am your Gemma 4 Receptionist Copilot. I can help find unarrived patients, calculate queue waiting times, locate pending invoices, and summarize today’s clinic operations.',
      toolUsed: 'system_greeting',
      time: 'Just now'
    }
  ]);
  const [sensitiveActionPrompt, setSensitiveActionPrompt] = useState(null);

  // Fetch Queue & Invoices
  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const res = await fetch('/api/reception/queue');
      if (res.ok) {
        const data = await res.json();
        setQueueData(data);
      }
    } catch (e) {
      console.error('Queue fetch error', e);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error('Invoices fetch error', e);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors');
      if (res.ok) {
        const data = await res.json();
        setDoctorsList(data);
        if (data.length > 0 && !targetDoctorId) {
          setTargetDoctorId(data[0].doctorId);
        }
      }
    } catch (e) {
      console.error('Doctors fetch error', e);
    }
  };

  useEffect(() => {
    fetchQueue();
    fetchInvoices();
    fetchDoctors();
    const interval = setInterval(fetchQueue, 12000);
    return () => clearInterval(interval);
  }, []);

  // Audio Voice Chime Announcement
  const triggerChime = (tokenDisplay, room = 'Consultation Room 102') => {
    setAnnouncedToken(tokenDisplay);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Token ${tokenDisplay}, please proceed to ${room}.`);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
    setTimeout(() => setAnnouncedToken(null), 5000);
  };

  // Queue Actions
  const handleCallToken = async (tokenId, tokenDisplay) => {
    try {
      const res = await fetch(`/api/reception/tokens/${tokenId}/call`, { method: 'POST' });
      if (res.ok) {
        triggerChime(tokenDisplay);
        fetchQueue();
      }
    } catch (e) {
      console.error('Call token error', e);
    }
  };

  const handleRecallToken = async (tokenId, tokenDisplay) => {
    try {
      const res = await fetch(`/api/reception/tokens/${tokenId}/recall`, { method: 'POST' });
      if (res.ok) {
        triggerChime(tokenDisplay);
      }
    } catch (e) {
      console.error('Recall token error', e);
    }
  };

  const handleSkipToken = async (tokenId) => {
    try {
      const res = await fetch(`/api/reception/tokens/${tokenId}/skip`, { method: 'POST' });
      if (res.ok) fetchQueue();
    } catch (e) {
      console.error('Skip token error', e);
    }
  };

  const handleCompleteToken = async (tokenId) => {
    try {
      const res = await fetch(`/api/reception/tokens/${tokenId}/complete`, { method: 'POST' });
      if (res.ok) fetchQueue();
    } catch (e) {
      console.error('Complete token error', e);
    }
  };

  const handleOpenTransfer = (token) => {
    setTokenToTransfer(token);
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!tokenToTransfer || !targetDoctorId) return;
    try {
      const res = await fetch(`/api/reception/tokens/${tokenToTransfer.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDoctorId, reason: transferReason })
      });
      if (res.ok) {
        setIsTransferModalOpen(false);
        setTokenToTransfer(null);
        setTransferReason('');
        fetchQueue();
      }
    } catch (e) {
      console.error('Transfer token error', e);
    }
  };

  // Patient Lookup Handler
  const handleSearchPatientLookup = async (e) => {
    e?.preventDefault();
    if (!checkInSearch.trim()) return;

    setSearchingPatient(true);
    setCheckInErrorMsg('');
    try {
      const res = await fetch(`/api/reception/patient-lookup?query=${encodeURIComponent(checkInSearch.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setLookupResults(data.results || []);
        if (data.results && data.results.length === 1) {
          setSelectedPatientForCheckIn(data.results[0]);
        }
      }
    } catch (e) {
      setCheckInErrorMsg('Could not query patient database.');
    } finally {
      setSearchingPatient(false);
    }
  };

  // Perform Patient Check-in
  const handlePerformCheckIn = async (lookupItem) => {
    setCheckInSuccessMsg('');
    setCheckInErrorMsg('');
    try {
      const payload = {
        patientId: lookupItem.patient?.patientId,
        appointmentId: lookupItem.todayAppointment?.id || lookupItem.todayAppointment?.appointmentId,
        doctorId: lookupItem.todayAppointment?.doctorId || 'DOC-102',
        doctorName: lookupItem.todayAppointment?.doctorName || 'Attending Doctor',
        isWalkIn: !lookupItem.todayAppointment,
        checkInNotes: 'Patient checked in at front desk'
      };

      const res = await fetch('/api/reception/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInSuccessMsg(`Checked in successfully! Token #${data.token?.tokenDisplay} generated. Queue position: #${data.queuePosition}`);
        setSelectedTokenForPrint(data.token);
        fetchQueue();
        handleSearchPatientLookup();
        setTimeout(() => setCheckInSuccessMsg(''), 6000);
      } else {
        setCheckInErrorMsg(data.error || 'Check-in failed.');
      }
    } catch (e) {
      setCheckInErrorMsg('Network error during check-in.');
    }
  };

  // Quick Walk-In Registration & Check-In
  const handleRegisterWalkIn = async (e) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    setCheckInSuccessMsg('');
    setCheckInErrorMsg('');

    try {
      const payload = {
        fullName: walkinName.trim(),
        age: walkinAge,
        gender: walkinGender,
        phoneNumber: walkinPhone.trim(),
        doctorId: walkinDoctorId,
        reasonForVisit: walkinReason,
        allergies: walkinAllergies,
        isWalkIn: true
      };

      const res = await fetch('/api/reception/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInSuccessMsg(`Walk-in registered! Token #${data.token?.tokenDisplay} issued.`);
        setSelectedTokenForPrint(data.token);
        setIsNewPatientModalOpen(false);
        setWalkinName('');
        setWalkinPhone('');
        fetchQueue();
        setTimeout(() => setCheckInSuccessMsg(''), 6000);
      } else {
        setCheckInErrorMsg(data.error || 'Failed to register walk-in.');
      }
    } catch (e) {
      setCheckInErrorMsg('Failed to connect to backend.');
    }
  };

  // Add Item to Invoice Builder
  const handleAddInvoiceCharge = () => {
    if (!invNewAddDesc.trim() || !invNewAddAmount) return;
    setInvAdditionalCharges([
      ...invAdditionalCharges,
      { description: invNewAddDesc.trim(), amount: Number(invNewAddAmount) }
    ]);
    setInvNewAddDesc('');
    setInvNewAddAmount('');
  };

  // Computed Invoice Amounts
  const calcSubtotal = (Number(invConsultFee) || 0) + (Number(invRegFee) || 0) + 
    invAdditionalCharges.reduce((a, c) => a + (Number(c.amount) || 0), 0);
  
  const calcDiscount = invDiscountType === 'percentage'
    ? Math.round((calcSubtotal * (Number(invDiscountValue) || 0)) / 100)
    : Math.min(Number(invDiscountValue) || 0, calcSubtotal);

  const calcTaxable = Math.max(0, calcSubtotal - calcDiscount);
  const calcTax = Math.round(((calcTaxable * (Number(invTaxRate) || 0)) / 100) * 10) / 10;
  const calcTotal = calcTaxable + calcTax;

  // Create Invoice
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const doc = doctorsList.find(d => d.doctorId === invDoctorId) || { fullName: 'Attending Doctor' };
      const payload = {
        patientName: invPatientName,
        patientId: invPatientId || ('PAT-' + Math.floor(1000 + Math.random() * 9000)),
        patientPhone: invPatientPhone,
        doctorId: invDoctorId,
        doctorName: doc.fullName,
        consultationFee: invConsultFee,
        registrationFee: invRegFee,
        additionalCharges: invAdditionalCharges,
        discountType: invDiscountType,
        discountValue: invDiscountValue,
        taxRate: invTaxRate,
        paymentMethod: invPaymentMethod,
        paymentStatus: invPaymentStatus,
        transactionReference: invTransactionRef,
        verifiedBy: invPaymentStatus === 'Paid' ? (currentUser?.displayName || 'Alex Carter') : null
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setIsNewInvoiceModalOpen(false);
        fetchInvoices();
        setSelectedInvoiceForPrint(data.invoice);
        // Reset form
        setInvPatientName('');
        setInvPatientPhone('');
        setInvAdditionalCharges([]);
        setInvTransactionRef('');
        setInvPaymentStatus('Pending');
      }
    } catch (e) {
      console.error('Invoice create failed', e);
    }
  };

  // Verify / Mark Invoice as Paid
  const handleConfirmVerifyPayment = async () => {
    if (!targetInvoiceForPay) return;
    try {
      const res = await fetch(`/api/invoices/${targetInvoiceForPay.id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: verifyPayMethod,
          transactionReference: verifyTxnRef || `REF-${Date.now()}`,
          verifiedBy: currentUser?.displayName || 'Alex Carter (Receptionist)'
        })
      });

      if (res.ok) {
        setIsVerifyPayModalOpen(false);
        setTargetInvoiceForPay(null);
        setVerifyTxnRef('');
        fetchInvoices();
      }
    } catch (e) {
      console.error('Payment verify failed', e);
    }
  };

  // AI Receptionist Copilot Handler
  const handleAskCopilot = async (questionText = null) => {
    const q = questionText || copilotQuery;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotQuery('');
    setCopilotLoading(true);
    setSensitiveActionPrompt(null);

    try {
      const res = await fetch('/api/ai/receptionist-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          sender: 'ai',
          text: data.answer,
          toolUsed: data.toolUsed,
          toolData: data.toolData,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setCopilotMessages(prev => [...prev, aiMsg]);

        if (data.requiresConfirmation) {
          setSensitiveActionPrompt(data.sensitiveAction);
        }
      }
    } catch (e) {
      setCopilotMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Could not connect to Gemma 4 AI service. Using cached clinic operational metrics.',
        time: 'Just now'
      }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Active Consultation Token
  const activeConsultation = queueData.activeToken;
  const waitingTokens = queueData.waitingTokens || [];
  const completedTokens = queueData.completedTokens || [];
  const metrics = queueData.metrics || {};

  // Filtered queue tokens
  const filteredQueue = (queueData.tokens || []).filter(t => {
    const matchesSearch = !searchTerm || 
      t.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tokenDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (queueFilter === 'active') return t.status === 'Waiting' || t.status === 'In Consultation' || t.status === 'Calling';
    if (queueFilter === 'all') return true;
    return t.status?.toLowerCase() === queueFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER & COMMAND CENTER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-600/30 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-blue-300 border border-blue-400/30">
              <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Smart Clinic Command Center</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/20 rounded-full text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Firestore Active</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
            <span>Reception & Queue Operations Desk</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Live patient check-in, dynamic token queue management, billing invoice generation, and Gemma 4 AI operational copilot.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => { setActiveTab('checkin'); setIsNewPatientModalOpen(true); }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Quick Walk-In Check-In</span>
          </button>

          <button
            onClick={() => { setActiveTab('billing'); setIsNewInvoiceModalOpen(true); }}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Generate Invoice</span>
          </button>

          {waitingTokens.length > 0 && (
            <button
              onClick={() => handleCallToken(waitingTokens[0].id, waitingTokens[0].tokenDisplay)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-md transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
              <span>Call Next (#{waitingTokens[0].tokenDisplay})</span>
            </button>
          )}

          <button
            onClick={() => { fetchQueue(); fetchInvoices(); }}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs border border-white/10 transition-colors"
            title="Refresh All Operations"
          >
            <RefreshCw className={`w-4 h-4 ${loadingQueue ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        {/* Subtle Ambient Glow */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Audio Announcement Toast */}
      {announcedToken && (
        <div className="p-4 bg-amber-500 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-6 h-6 animate-pulse" />
            <span className="text-base sm:text-lg">Now Calling Token #{announcedToken} to Consultation Room 102</span>
          </div>
          <span className="text-xs uppercase bg-black/10 px-2.5 py-1 rounded-md font-bold">Live Chime Synthesized</span>
        </div>
      )}

      {/* 2. COMMAND CENTER SUB-NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'queue' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Live Queue & Tokens</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'queue' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {metrics.waitingCount || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'checkin' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Smart Patient Check-In</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'billing' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Billing & Invoices</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'billing' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'copilot' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-500" />
          <span>AI Receptionist Copilot</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-100 text-cyan-800">Gemma 4</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
            activeTab === 'insights' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Queue Insights & Doctors</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE QUEUE & TOKEN MANAGEMENT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          
          {/* Active Token In Consultation & Queue Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Consultation Hero Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border-2 border-emerald-500/50 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Currently In Consultation
                  </span>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  {activeConsultation?.roomNumber || 'Room 102'} • Live
                </span>
              </div>

              {activeConsultation ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                      <span className="text-[10px] uppercase font-bold opacity-80">Token</span>
                      <span className="text-2xl leading-none">#{activeConsultation.tokenDisplay}</span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-black text-slate-900">{activeConsultation.patientName}</h3>
                        <span className="text-xs text-slate-500 font-bold">({activeConsultation.patientAge}y / {activeConsultation.patientGender})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-bold text-slate-700">Doctor:</span> {activeConsultation.doctorName} • {activeConsultation.department}
                      </p>
                      <p className="text-xs text-slate-500 italic mt-0.5">"{activeConsultation.reason}"</p>
                    </div>
                  </div>

                  {/* Actions for current token */}
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => triggerChime(activeConsultation.tokenDisplay, activeConsultation.roomNumber)}
                      className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Chime</span>
                    </button>

                    <button
                      onClick={() => handleCompleteToken(activeConsultation.id)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>

                    <button
                      onClick={() => setSelectedTokenForPrint(activeConsultation)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-400" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No patient is currently in consultation</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click "Call Next" from the queue below to advance the waiting patient.</p>
                  {waitingTokens.length > 0 && (
                    <button
                      onClick={() => handleCallToken(waitingTokens[0].id, waitingTokens[0].tokenDisplay)}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold inline-flex items-center space-x-1.5 shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Call Token #{waitingTokens[0].tokenDisplay}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Live Queue Overview KPI Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>OPD Queue Insights</span>
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/60">
                    <span className="text-[11px] text-amber-800 font-bold">In Queue</span>
                    <p className="text-2xl font-black text-amber-900 mt-0.5">{metrics.waitingCount || 0}</p>
                    <span className="text-[10px] text-amber-700">Waiting for call</span>
                  </div>

                  <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/60">
                    <span className="text-[11px] text-emerald-800 font-bold">In Consult</span>
                    <p className="text-2xl font-black text-emerald-900 mt-0.5">{activeConsultation ? 1 : 0}</p>
                    <span className="text-[10px] text-emerald-700">Dr. Sarah Mitchell</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] text-slate-500 font-bold">Completed</span>
                    <p className="text-2xl font-black text-slate-800 mt-0.5">{metrics.completedCount || 0}</p>
                    <span className="text-[10px] text-slate-400">Treated today</span>
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200/60">
                    <span className="text-[11px] text-blue-800 font-bold">Approx. Wait</span>
                    <p className="text-2xl font-black text-blue-900 mt-0.5">~{metrics.waitingCount * 12}m</p>
                    <span className="text-[10px] text-blue-600 font-semibold">*12m/patient avg</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Total Checked-In: <span className="font-bold text-slate-700">{metrics.checkedInCount || 0}</span></span>
                <button
                  onClick={() => setActiveTab('checkin')}
                  className="text-blue-600 font-bold text-xs hover:underline flex items-center space-x-1"
                >
                  <span>Check-in Patient →</span>
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Live Queue Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            
            {/* Table Header & Controls */}
            <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Today's Live Queue List</h2>
                  <p className="text-xs text-slate-500">Real-time sync with Cloud Firestore • Call, Transfer, or Print Slips</p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search token, patient, doctor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56"
                  />
                </div>

                <div className="flex bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
                  {['active', 'Waiting', 'Completed', 'Skipped', 'all'].map(st => (
                    <button
                      key={st}
                      onClick={() => setQueueFilter(st)}
                      className={`px-3 py-1 rounded-lg capitalize transition-all ${
                        queueFilter === st ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Token #</th>
                    <th className="py-3.5 px-4">Patient Demographics</th>
                    <th className="py-3.5 px-4">Doctor & Room</th>
                    <th className="py-3.5 px-4">Arrival / Wait</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Queue Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                        No tokens found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.map((tok) => (
                      <tr key={tok.id || tok.tokenId} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Token Number */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-sm text-slate-900 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                              #{tok.tokenDisplay}
                            </span>
                            {tok.isWalkIn && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200">
                                Walk-In
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{tok.patientName}</div>
                          <p className="text-[11px] text-slate-500">
                            {tok.patientId} • {tok.patientAge}y/{tok.patientGender} • <span className="text-slate-400">{tok.reason}</span>
                          </p>
                        </td>

                        {/* Doctor */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tok.doctorName}</div>
                          <p className="text-[11px] text-slate-500">{tok.roomNumber || 'Room 102'} • {tok.department}</p>
                          {tok.transferredFrom && (
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1 rounded">
                              Transferred from {tok.transferredFrom}
                            </span>
                          )}
                        </td>

                        {/* Arrival & Estimated Wait */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">
                            {new Date(tok.checkedInAt || tok.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Approx. ~{tok.approximateWaitMinutes || 12}m wait
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            tok.status === 'In Consultation'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse'
                              : tok.status === 'Waiting'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : tok.status === 'Completed'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {tok.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            
                            {/* Call / Advance */}
                            {tok.status === 'Waiting' && (
                              <button
                                onClick={() => handleCallToken(tok.id, tok.tokenDisplay)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors flex items-center space-x-1 shadow-sm"
                                title="Call patient to consultation room"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Call</span>
                              </button>
                            )}

                            {tok.status === 'In Consultation' && (
                              <button
                                onClick={() => handleRecallToken(tok.id, tok.tokenDisplay)}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition-colors flex items-center space-x-1"
                                title="Re-chime token"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>Re-Chime</span>
                              </button>
                            )}

                            {/* Print Token Slip */}
                            <button
                              onClick={() => setSelectedTokenForPrint(tok)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors flex items-center space-x-1"
                              title="Print Token Slip (Thermal / Standard)"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>Print</span>
                            </button>

                            {/* Transfer Token */}
                            {tok.status === 'Waiting' && (
                              <button
                                onClick={() => handleOpenTransfer(tok)}
                                className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-[11px] transition-colors flex items-center space-x-1"
                                title="Transfer to another doctor"
                              >
                                <ArrowRightLeft className="w-3 h-3 text-purple-600" />
                                <span>Transfer</span>
                              </button>
                            )}

                            {/* Skip Token */}
                            {tok.status === 'Waiting' && (
                              <button
                                onClick={() => handleSkipToken(tok.id)}
                                className="px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100 font-bold text-[11px] transition-colors"
                                title="Skip patient"
                              >
                                Skip
                              </button>
                            )}

                            {/* Complete Consultation */}
                            {tok.status === 'In Consultation' && (
                              <button
                                onClick={() => handleCompleteToken(tok.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center space-x-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Done</span>
                              </button>
                            )}

                            {/* Create Bill / Invoice Shortcut */}
                            <button
                              onClick={() => {
                                setInvPatientName(tok.patientName);
                                setInvPatientId(tok.patientId);
                                setInvPatientPhone(tok.patientPhone || '');
                                setInvDoctorId(tok.doctorId || 'DOC-102');
                                setActiveTab('billing');
                                setIsNewInvoiceModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition-colors"
                              title="Create Invoice for this patient"
                            >
                              ₹ Bill
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SMART PATIENT CHECK-IN                                             */}
      {/* ========================================================================= */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          
          {/* Lookup & Search Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                  <span>Smart Patient Check-In & Arrival Verification</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Search by Patient ID or Mobile number to verify appointment and timestamp arrival.
                </p>
              </div>

              <button
                onClick={() => setIsNewPatientModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all self-start md:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Register New Walk-In Patient</span>
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchPatientLookup} className="flex gap-2.5 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Enter Patient ID (e.g. PAT-1001) or Mobile Number..."
                  value={checkInSearch}
                  onChange={(e) => setCheckInSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={searchingPatient}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{searchingPatient ? 'Searching...' : 'Lookup Patient'}</span>
              </button>
            </form>

            {checkInSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{checkInSuccessMsg}</span>
              </div>
            )}

            {checkInErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{checkInErrorMsg}</span>
              </div>
            )}
          </div>

          {/* Lookup Results Cards */}
          <div className="space-y-4">
            {lookupResults.length > 0 ? (
              lookupResults.map((item, idx) => {
                const { patient, todayAppointment, isCheckedIn, activeToken } = item;

                return (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    {/* Patient Profile & Demographics */}
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shrink-0">
                        {patient.gender === 'Female' ? '👩' : '👨'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-black text-slate-900">{patient.fullName}</h3>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                            {patient.patientId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {patient.age} yrs • {patient.gender} • Tel: <span className="font-mono font-bold text-slate-700">{patient.phoneNumber || patient.contact}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          History: <span className="text-slate-700 font-medium">{patient.relevantMedicalHistory || 'No chronic history recorded.'}</span>
                        </p>
                        {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== 'None reported' && (
                          <div className="mt-1.5 flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-flex border border-rose-200">
                            <span>⚠️ Allergy: {patient.allergies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Today's Appointment Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400">Today's Appointment</span>
                        {todayAppointment ? (
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 mt-0.5">
                              {todayAppointment.doctorName} • {todayAppointment.appointmentTime}
                            </p>
                            <p className="text-[11px] text-slate-500">Reason: {todayAppointment.reasonForVisit}</p>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-mono">
                                Slot {todayAppointment.tokenNumber}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                Status: {todayAppointment.status}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-xs text-amber-700 mt-0.5">No pre-booked appointment today</p>
                            <span className="text-[10px] text-slate-400">Walk-in visit can be checked in instantly.</span>
                          </div>
                        )}
                      </div>

                      {/* Check-In Action Button */}
                      <div>
                        {isCheckedIn ? (
                          <div className="text-center p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                            <span className="flex items-center space-x-1 text-emerald-700 font-black">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Checked In (#{activeToken?.tokenDisplay || todayAppointment?.tokenNumber})</span>
                            </span>
                            <button
                              onClick={() => setSelectedTokenForPrint(activeToken)}
                              className="mt-1.5 text-[11px] text-blue-600 hover:underline font-bold block"
                            >
                              Reprint Token Slip
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePerformCheckIn(item)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5"
                          >
                            <Check className="w-4 h-4 text-white" />
                            <span>Mark Arrived &amp; Check In</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            ) : checkInSearch ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="font-black text-sm text-slate-800">No Patient Found for "{checkInSearch}"</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  This patient is not registered in MediFlow AI yet. Would you like to register them as a new walk-in patient?
                </p>
                <button
                  onClick={() => { setWalkinPhone(checkInSearch); setIsNewPatientModalOpen(true); }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm"
                >
                  + Register Patient with this phone number
                </button>
              </div>
            ) : null}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BILLING & INVOICE MANAGEMENT                                       */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          
          {/* Billing Overview Stats & Actions */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                <Receipt className="w-6 h-6 text-emerald-600" />
                <span>Outpatient Billing &amp; Invoices Command</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate official GST invoices, track Cash / UPI payments with QR codes, and dispatch WhatsApp receipts.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsNewInvoiceModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create New Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            
            <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                <span>Filter Payment Status:</span>
                {['All', 'Paid', 'Pending'].map(st => (
                  <button
                    key={st}
                    onClick={() => setInvoiceStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl transition-all ${
                      invoiceStatusFilter === st ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Showing {invoices.filter(i => invoiceStatusFilter === 'All' || i.paymentStatus === invoiceStatusFilter).length} invoices
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Patient Name &amp; ID</th>
                    <th className="py-3.5 px-4">Consulting Doctor</th>
                    <th className="py-3.5 px-4">Total Amount (₹)</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.filter(i => invoiceStatusFilter === 'All' || i.paymentStatus === invoiceStatusFilter).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                        No invoices found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    invoices
                      .filter(i => invoiceStatusFilter === 'All' || i.paymentStatus === invoiceStatusFilter)
                      .map((inv) => (
                        <tr key={inv.id || inv.invoiceId} className="hover:bg-slate-50/80 transition-colors">
                          
                          <td className="py-3.5 px-4">
                            <div className="font-black text-slate-900 font-mono">{inv.invoiceId}</div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(inv.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{inv.patientName}</div>
                            <p className="text-[11px] text-slate-500 font-mono">{inv.patientId}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{inv.doctorName}</div>
                            <p className="text-[11px] text-slate-400">{inv.department}</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-black text-sm text-slate-900 font-mono">₹{inv.totalAmount}</div>
                            {inv.discountAmount > 0 && (
                              <span className="text-[10px] text-emerald-600 font-bold">Disc: -₹{inv.discountAmount}</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-700 flex items-center space-x-1">
                              {inv.paymentMethod === 'UPI' ? <QrCode className="w-3.5 h-3.5 text-blue-600" /> : <CreditCard className="w-3.5 h-3.5 text-slate-500" />}
                              <span>{inv.paymentMethod || 'Cash'}</span>
                            </div>
                            {inv.transactionReference && (
                              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                                {inv.transactionReference}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              inv.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {inv.paymentStatus}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              
                              {/* If Pending: Verify Payment Button */}
                              {inv.paymentStatus === 'Pending' && (
                                <button
                                  onClick={() => { setTargetInvoiceForPay(inv); setIsVerifyPayModalOpen(true); }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                                >
                                  Confirm Pay
                                </button>
                              )}

                              {/* Preview / Print */}
                              <button
                                onClick={() => setSelectedInvoiceForPrint(inv)}
                                className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] transition-colors flex items-center space-x-1"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Preview / Print</span>
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AI RECEPTIONIST COPILOT (Gemma 4)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-cyan-500/20">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                  <span>Gemma 4 AI Receptionist Copilot</span>
                  <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Controlled Tools Active
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Ask administrative questions regarding queue metrics, unarrived appointments, pending bills, and doctor availability.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400 font-mono">
              Host: http://127.0.0.1:11434 (gemma4:e2b)
            </span>
          </div>

          {/* Quick Clickable Administrative Prompt Chips */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Instant Administrative Inquiries:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                "Find today's unarrived patients",
                "How many patients are waiting in the queue?",
                "Show pending unpaid invoices",
                "Summarise daily clinic operations",
                "Check doctor availability today",
                "Explain current queue wait time"
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleAskCopilot(chip)}
                  disabled={copilotLoading}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold text-xs transition-all text-left"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Sensitive Operation Warning Banner */}
          {sensitiveActionPrompt && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-bold space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Sensitive Administrative Action Requested</span>
              </div>
              <p className="text-slate-600 font-medium">
                AI cannot autonomously cancel appointments or waive invoices without explicit receptionist confirmation.
              </p>
              <div className="flex space-x-2 pt-1">
                <button
                  onClick={() => {
                    setSensitiveActionPrompt(null);
                    setCopilotMessages(prev => [...prev, { sender: 'ai', text: 'Action cancelled by receptionist.', time: 'Just now' }]);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-xs"
                >
                  Cancel Action
                </button>
                <button
                  onClick={() => {
                    setSensitiveActionPrompt(null);
                    setCopilotMessages(prev => [...prev, { sender: 'ai', text: 'Staff authorized action logged in audit trail.', time: 'Just now' }]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  Confirm Authorization
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {copilotMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl p-3.5 rounded-2xl text-xs space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                }`}>
                  <div className="flex items-center justify-between text-[10px] opacity-75 font-semibold">
                    <span>{msg.sender === 'user' ? 'Alex Carter (You)' : 'Gemma 4 Copilot'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  {msg.toolUsed && (
                    <span className="inline-block mt-1 text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Tool: {msg.toolUsed}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {copilotLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-blue-600 font-bold flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Firestore query &amp; synthesizing with Gemma 4...</span>
                </div>
              </div>
            )}
          </div>

          {/* Ask Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAskCopilot(); }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask Gemma 4 Copilot about OPD queue, unarrived patients, doctor availability..."
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={copilotLoading || !copilotQuery.trim()}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          </form>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: QUEUE INSIGHTS & DOCTOR STATUS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2 mb-1">
              <Activity className="w-6 h-6 text-blue-600" />
              <span>Smart Queue Analytics &amp; Physician Availability</span>
            </h2>
            <p className="text-xs text-slate-500">
              Live consultation tracking, approximate wait time estimates (~12m/patient), and delayed visit detection.
            </p>
          </div>

          {/* Doctor Availability Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>Doctor OPD Room Matrix</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(queueData.doctorAvailability || []).map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{doc.fullName}</h4>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                    <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">
                      {doc.roomNumber || 'Room 102'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      doc.activePatientToken ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {doc.activePatientToken ? `With #${doc.activePatientToken}` : 'Available'}
                    </span>
                    {doc.activePatientToken && (
                      <p className="text-[10px] text-slate-400 mt-1">In Consult</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Note required by PRD */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Disclaimer: All displayed queue wait times are approximate estimates calculated from historical ~12-minute outpatient consultation averages. MediFlow AI does not override clinical prioritization determined by medical staff.
            </span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRANSFER QUEUE TOKEN                                               */}
      {/* ========================================================================= */}
      {isTransferModalOpen && tokenToTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center space-x-1.5">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>Transfer Token #{tokenToTransfer.tokenDisplay}</span>
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Transfer <span className="font-bold text-slate-900">{tokenToTransfer.patientName}</span> from {tokenToTransfer.doctorName} to another specialist OPD room.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Physician *</label>
              <select
                value={targetDoctorId}
                onChange={(e) => setTargetDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              >
                {doctorsList.map(d => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.fullName} ({d.specialization}) - {d.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Transfer</label>
              <input
                type="text"
                placeholder="e.g. Needs specialized cardiology evaluation"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER NEW WALK-IN PATIENT                                       */}
      {/* ========================================================================= */}
      {isNewPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Register New Walk-In Patient &amp; Check In</span>
              </h3>
              <button onClick={() => setIsNewPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterWalkIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 42"
                    value={walkinAge}
                    onChange={(e) => setWalkinAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={walkinGender}
                    onChange={(e) => setWalkinGender(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Consulting Doctor *</label>
                <select
                  value={walkinDoctorId}
                  onChange={(e) => setWalkinDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                >
                  {doctorsList.map(d => (
                    <option key={d.doctorId} value={d.doctorId}>
                      {d.fullName} ({d.specialization}) - {d.roomNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chief Symptom / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Fever for 2 days, headache"
                  value={walkinReason}
                  onChange={(e) => setWalkinReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Allergies (if any)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  value={walkinAllergies}
                  onChange={(e) => setWalkinAllergies(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPatientModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20"
                >
                  Register &amp; Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW TAX INVOICE                                             */}
      {/* ========================================================================= */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>Create New Outpatient Invoice</span>
              </h3>
              <button onClick={() => setIsNewInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              
              {/* Patient info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter patient full name"
                    value={invPatientName}
                    onChange={(e) => setInvPatientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Mobile *</label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={invPatientPhone}
                    onChange={(e) => setInvPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Doctor info & standard fees */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Doctor *</label>
                  <select
                    value={invDoctorId}
                    onChange={(e) => setInvDoctorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  >
                    {doctorsList.map(d => (
                      <option key={d.doctorId} value={d.doctorId}>{d.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consult Fee (₹)</label>
                  <input
                    type="number"
                    value={invConsultFee}
                    onChange={(e) => setInvConsultFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reg. Fee (₹)</label>
                  <input
                    type="number"
                    value={invRegFee}
                    onChange={(e) => setInvRegFee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Additional charges list */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-extrabold uppercase text-[10px] text-slate-500 block">
                  Additional Procedures &amp; Services
                </span>

                {invAdditionalCharges.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60">
                    <span className="font-semibold text-slate-800">{item.description}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">₹{item.amount}</span>
                      <button
                        type="button"
                        onClick={() => setInvAdditionalCharges(invAdditionalCharges.filter((_, idx) => idx !== i))}
                        className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Service (e.g. ECG Test, Blood Sugar)"
                    value={invNewAddDesc}
                    onChange={(e) => setInvNewAddDesc(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                  <input
                    type="number"
                    placeholder="Rate ₹"
                    value={invNewAddAmount}
                    onChange={(e) => setInvNewAddAmount(e.target.value)}
                    className="w-24 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddInvoiceCharge}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Discounts & Taxes */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={invDiscountType}
                    onChange={(e) => setInvDiscountType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={invDiscountValue}
                    onChange={(e) => setInvDiscountValue(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GST Tax Rate</label>
                  <select
                    value={invTaxRate}
                    onChange={(e) => setInvTaxRate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                  </select>
                </div>
              </div>

              {/* Total Summary Card */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700">Calculated Invoice Total</span>
                  <div className="text-xl font-black text-blue-900 font-mono">₹{calcTotal}</div>
                  <span className="text-[10px] text-blue-600">Subtotal ₹{calcSubtotal} • Tax ₹{calcTax}</span>
                </div>

                {/* Payment method */}
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Method</span>
                  <div className="flex space-x-1">
                    {['UPI', 'Cash', 'Card'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setInvPaymentMethod(m)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          invPaymentMethod === m ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verification & Transaction Reference */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Payment Status *</label>
                  <div className="flex space-x-2">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={invPaymentStatus === 'Paid'}
                        onChange={() => setInvPaymentStatus('Paid')}
                      />
                      <span className="font-bold text-emerald-700">Verified Paid</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={invPaymentStatus === 'Pending'}
                        onChange={() => setInvPaymentStatus('Pending')}
                      />
                      <span className="font-bold text-amber-700">Pay Later (Pending)</span>
                    </label>
                  </div>
                </div>

                {invPaymentStatus === 'Paid' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Transaction Ref / Cash Receipt *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UPI-REF-9921448 or CASH-REC-01"
                      value={invTransactionRef}
                      onChange={(e) => setInvTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md"
                >
                  Issue &amp; Preview Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VERIFY PAYMENT FOR PENDING INVOICE                                 */}
      {/* ========================================================================= */}
      {isVerifyPayModalOpen && targetInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Verify Payment Confirmation</span>
              </h3>
              <button onClick={() => setIsVerifyPayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-bold font-mono text-slate-900">{targetInvoiceForPay.invoiceId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{targetInvoiceForPay.patientName}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-slate-200 font-black">
                <span>Amount to Settle:</span>
                <span className="text-emerald-700 font-mono">₹{targetInvoiceForPay.totalAmount}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Settlement Method *</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['UPI', 'Cash', 'Card'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setVerifyPayMethod(m)}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      verifyPayMethod === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Ref / Verified By *</label>
              <input
                type="text"
                placeholder="e.g. UPI-TXN-8829410 or Cash Received at Desk"
                value={verifyTxnRef}
                onChange={(e) => setVerifyTxnRef(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setIsVerifyPayModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerifyPayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TOKEN PRINT SLIP (THERMAL / STANDARD)                              */}
      {/* ========================================================================= */}
      <TokenPrintModal
        isOpen={!!selectedTokenForPrint}
        onClose={() => setSelectedTokenForPrint(null)}
        token={selectedTokenForPrint}
      />

      {/* ========================================================================= */}
      {/* MODAL: INVOICE PRINT PREVIEW & WHATSAPP                                    */}
      {/* ========================================================================= */}
      <InvoicePrintModal
        isOpen={!!selectedInvoiceForPrint}
        onClose={() => setSelectedInvoiceForPrint(null)}
        invoice={selectedInvoiceForPrint}
        onWhatsAppSent={fetchInvoices}
      />

    </div>
  );
};
