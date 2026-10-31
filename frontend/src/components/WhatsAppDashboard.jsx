import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  QrCode, 
  CheckCheck, 
  Check, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Calendar, 
  ExternalLink,
  Smartphone,
  Sparkles,
  Lock
} from 'lucide-react';

export const WhatsAppDashboard = () => {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('APPOINTMENT_CONFIRMATION');
  const [targetPhone, setTargetPhone] = useState('+91 98765 43210');
  const [customText, setCustomText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sentNotice, setSentNotice] = useState('');
  const [sentMode, setSentMode] = useState(null);

  const fetchStatus = async () => {
    try {
      const [stRes, msgRes] = await Promise.all([
        fetch('/api/whatsapp/status'),
        fetch('/api/whatsapp/messages')
      ]);
      if (stRes.ok) setStatus(await stRes.json());
      if (msgRes.ok) setMessages(await msgRes.json());
    } catch (e) {
      console.error('Fetch whatsapp error', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Faster polling while waiting for a QR scan
  const waitingForScan = status?.state === 'qr' || status?.state === 'initializing';

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await fetch('/api/whatsapp/connect', { method: 'POST' });
    } catch (e) {
      console.error('Connect error', e);
    } finally {
      setIsConnecting(false);
      fetchStatus();
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
    } catch (e) {
      console.error('Disconnect error', e);
    } finally {
      setIsConnecting(false);
      fetchStatus();
    }
  };

  const templates = [
    {
      id: 'APPOINTMENT_CONFIRMATION',
      title: 'Appointment Confirmation',
      description: 'Triggered when an appointment is booked via voice or receptionist.',
      content: 'Hello Rahul!\n\nYour appointment has been confirmed.\n\nClinic: MediFlow Central Clinic\nDoctor: Dr. Sarah Mitchell\nDate: Tomorrow\nTime: 11:00 AM\nToken: #A34\n\nThank you for choosing MediFlow.'
    },
    {
      id: '24H_APPOINTMENT_REMINDER',
      title: '24-Hour Pre-Visit Reminder',
      description: 'Automated notification dispatched 24 hours prior to scheduled consultation.',
      content: 'Reminder for Rahul Sharma: You have an upcoming consultation with Dr. Rajesh Sharma tomorrow at 11:00 AM at MediFlow Clinic. Please arrive 10 minutes early.'
    },
    {
      id: '2H_APPOINTMENT_REMINDER',
      title: '2-Hour Final Callout',
      description: 'Dispatched 2 hours before appointment with live queue token number.',
      content: 'MediFlow Alert: Your consultation with Dr. Sarah Mitchell is in 2 hours. Your live queue token is #A34. Consultation Room: 102.'
    },
    {
      id: 'FOLLOW_UP_REMINDER',
      title: 'Doctor Follow-Up Care Schedule',
      description: 'Scheduled by physician post-consultation to track recovery adherence.',
      content: 'MediFlow Care: Dr. Sarah Mitchell has scheduled your 5-day follow-up review for Acute URTI & Fever. Please confirm your recovery status or request a slot.'
    },
    {
      id: 'SECURE_REPORT_LINK',
      title: 'Secure Diagnostic Report (Expiring Link)',
      description: 'Sends approved lab report with end-to-end encrypted, expiring access token.',
      content: 'Hello Rahul Sharma,\n\nDr. Sarah Mitchell has reviewed and approved your Complete Blood Count (CBC) report.\n\nSecure Expiring Link (Valid 48 hours):\nhttps://mediflow.ai/portal/reports/rep_1?token=sec_98412&exp=48h\n\nStrictly confidential.'
    }
  ];

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setCustomText(tpl.content);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSentNotice('');

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'PAT-1092',
          phoneNumber: targetPhone,
          templateType: selectedTemplate,
          content: customText || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.gatewayMode === 'real') {
          setSentNotice('✓ Message sent through the live WhatsApp gateway!');
        } else if (data.gatewayMode === 'simulated') {
          setSentNotice('⚠ Simulated send (WhatsApp not linked). Connect to deliver for real.');
        } else {
          setSentNotice('✓ Message dispatched and delivered successfully!');
        }
        setSentMode(data.gatewayMode || null);
        fetchStatus();
        setTimeout(() => { setSentNotice(''); setSentMode(null); }, 5000);
      }
    } catch (err) {
      console.error('Send message error', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>Module 6 • WhatsApp Communications Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            WhatsApp Automation & Patient Messaging
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
            Automated appointment confirmations, 24h/2h reminders, doctor follow-up schedules, and secure expiring medical report links.
          </p>
        </div>

        {/* Status Pill */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs space-y-1">
          <div className="flex items-center space-x-2 font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${status?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}></span>
            <span>{status?.connected ? 'WhatsApp Linked' : waitingForScan ? 'Waiting for QR Scan' : 'Not Connected'}</span>
          </div>
          <p className="text-[11px] text-white/80">
            {status?.activePhoneNumber || 'Connect via QR to go live'}
          </p>
        </div>
      </div>

      {/* ============ QR Connection Card ============ */}
      <div className={`bg-white rounded-3xl p-5 border shadow-sm flex flex-col md:flex-row md:items-center gap-5 ${
        status?.connected ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200/80'
      }`}>

        {/* State: QR / Spinner / Content */}
        {status?.state === 'qr' ? (
          <div className="flex items-center gap-5">
            <div className="bg-white p-1.5 rounded-2xl border-4 border-slate-900 shadow-md shrink-0">
              <img
                src={status.qr}
                alt="WhatsApp QR code — scan to link this clinic device"
                className="w-40 h-40"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-teal-700" /> Scan to link this device
              </h2>
              <ol className="mt-2 space-y-1 text-[11px] text-slate-600 list-decimal list-inside">
                <li>Open <b>WhatsApp</b> on the clinic phone</li>
                <li>Go to <b>Settings → Linked devices → Link a device</b></li>
                <li>Point the camera at this QR code</li>
              </ol>
              <p className="mt-2 text-[10px] text-slate-400">QR refreshes automatically — page polls every 4s.</p>
            </div>
          </div>
        ) : status?.state === 'initializing' ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin shrink-0"></div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Starting WhatsApp engine…</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Launching secure browser + session. A QR code appears here when ready.</p>
            </div>
          </div>
        ) : status?.state === 'unavailable' ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 grid place-items-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900">WhatsApp engine unavailable</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 break-words">
                {status?.lastError || 'Run "npm install whatsapp-web.js qrcode" in the backend folder.'} Messages are being simulated.
              </p>
            </div>
          </div>
        ) : status?.connected ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 grid place-items-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Live WhatsApp session active</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {status?.activePhoneNumber || 'Clinic gateway'} — auto-reply bot is answering patients in real time.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 grid place-items-center shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Connect WhatsApp via QR</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                Scan this QR with the clinic's WhatsApp Business number to activate real message delivery and the auto-reply bot.
              </p>
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="md:ml-auto flex items-center gap-3 shrink-0">
          {waitingForScan && (
            <span className="text-[10px] font-bold text-teal-800 bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg">
              Awaiting scan…
            </span>
          )}
          {status?.connected ? (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
            >
              Disconnect Session
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isConnecting || waitingForScan || status?.state === 'initializing' || status?.state === 'unavailable'}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? <span>Connecting…</span> : (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Connect WhatsApp</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Grid: Templates & Dispatcher vs. Phone Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT 2 COLUMNS: Template Selector & Message Composer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Template Gallery */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                1. Select WhatsApp Message Template
              </h2>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                PRD Verified Templates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTemplate === tpl.id
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-extrabold text-xs text-slate-900 block">{tpl.title}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Composer Form */}
          <form onSubmit={handleSendMessage} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                2. Compose & Dispatch Notification
              </h2>
              {sentNotice && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {sentNotice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Patient</label>
                <input
                  type="text"
                  disabled
                  value="Rahul Sharma (PAT-1092)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Phone Number</label>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
              <textarea
                rows={5}
                value={customText || templates.find(t => t.id === selectedTemplate)?.content}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Idempotency-safe: Prevents duplicate messages within 30 minutes</span>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isSending ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* RIGHT COLUMN: WhatsApp Live Smartphone Simulator */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Patient Live WhatsApp Device View
            </span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-sm mx-auto bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800">
            {/* Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2"></div>

            {/* Screen */}
            <div className="bg-[#0b141a] rounded-[28px] overflow-hidden flex flex-col h-[460px] text-white">
              
              {/* WhatsApp App Bar */}
              <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-[#222d34]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                    MF
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-100 leading-tight">MediFlow Clinic</h3>
                    <p className="text-[9px] text-emerald-400">Official Healthcare Account ✓</p>
                  </div>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Chat Message Bubble Canvas */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-[#0b141a] bg-opacity-95 text-xs">
                <div className="text-center my-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#182229] text-[9px] text-slate-400 uppercase font-semibold">
                    Today
                  </span>
                </div>

                {messages.filter(m => m.direction !== 'Inbound').slice(0, 3).map((msg, i) => (
                  <div key={msg.messageId || i} className="max-w-[85%] bg-[#005c4b] p-2.5 rounded-xl rounded-tl-none ml-auto text-slate-100 shadow-sm space-y-1">
                    <p className="whitespace-pre-line text-[11px] leading-relaxed">{msg.content}</p>
                    <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-200">
                      {(msg.gatewayMode === 'simulated' || msg.status === 'Simulated') && (
                        <span className="px-1 rounded bg-amber-500/80 text-white font-bold">DEMO</span>
                      )}
                      <span>{msg.sentAt?.split('T')[1]?.slice(0, 5) || '11:00'}</span>
                      <CheckCheck className="w-3 h-3 text-cyan-300" />
                    </div>
                  </div>
                ))}

                {messages.filter(m => m.direction === 'Inbound').slice(0, 2).map((msg, i) => (
                  <div key={msg.messageId || `in${i}`} className="max-w-[85%] bg-[#202c33] p-2.5 rounded-xl rounded-tr-none text-slate-100 shadow-sm space-y-1">
                    <p className="whitespace-pre-line text-[11px] leading-relaxed">{msg.content}</p>
                    <div className="text-[9px] text-slate-400">{msg.sentAt?.split('T')[1]?.slice(0, 5) || '11:02'}</div>
                  </div>
                ))}
              </div>

              {/* Bottom Input Mock */}
              <div className="p-2 bg-[#202c33] flex items-center space-x-2 text-xs">
                <div className="flex-1 bg-[#2a3942] px-3 py-1.5 rounded-full text-[10px] text-slate-400">
                  Type a reply...
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Send className="w-3 h-3 text-white" />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Outbox / Message History Table (PRD Module 6) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            WhatsApp Delivery History & Logs
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{messages.length} messages dispatched</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Message ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Content Preview</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages.map((m) => (
                <tr key={m.messageId} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{m.messageId}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800">{m.patientName}</span>
                    <p className="text-[10px] text-slate-400 font-mono">{m.phoneNumber}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {m.templateType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{m.content}</td>
                  <td className="py-3 px-4">
                    {m.status === 'Simulated' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center space-x-1 w-max">
                        <Clock className="w-3 h-3" />
                        <span>Simulated</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1 w-max">
                        <CheckCheck className="w-3 h-3 text-emerald-600" />
                        <span>{m.status}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                    {m.sentAt?.replace('T', ' ').slice(0, 16)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

