import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  MessageSquare, 
  Building2, 
  Receipt,
  QrCode
} from 'lucide-react';

export const InvoicePrintModal = ({ isOpen, onClose, invoice, onWhatsAppSent }) => {
  const [sendingWa, setSendingWa] = useState(false);
  const [waNotice, setWaNotice] = useState('');

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = async () => {
    setSendingWa(true);
    setWaNotice('');
    try {
      const res = await fetch(`/api/invoices/${invoice.id || invoice.invoiceId}/send-whatsapp`, {
        method: 'POST'
      });
      if (res.ok) {
        setWaNotice(`Invoice sent to ${invoice.patientPhone || 'patient mobile'} via WhatsApp!`);
        if (onWhatsAppSent) onWhatsAppSent();
        setTimeout(() => setWaNotice(''), 4000);
      }
    } catch (e) {
      console.error('Failed to dispatch WhatsApp', e);
    } finally {
      setSendingWa(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Modal Action Header (no-print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white no-print">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-200" />
            <div>
              <h3 className="text-base font-bold">Clinic Tax Invoice Preview</h3>
              <p className="text-xs text-blue-100">{invoice.invoiceId} • {invoice.patientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendWhatsApp}
              disabled={sendingWa}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm"
              title="Dispatch invoice breakdown via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{sendingWa ? 'Sending...' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {waNotice && (
          <div className="m-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 no-print">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{waNotice}</span>
          </div>
        )}

        {/* PRINTABLE A4 INVOICE SHEET */}
        <div className="p-8 overflow-y-auto max-h-[75vh] bg-white text-slate-900 font-sans print:p-0 print:m-0">
          
          {/* Clinic Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-5">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  MF
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">MediFlow AI Health Center</h1>
              </div>
              <p className="text-xs text-slate-500">Suite 100, Central Healthcare Plaza, Medical District</p>
              <p className="text-xs text-slate-500">GSTIN: <span className="font-mono font-bold text-slate-700">07AAAAA0000A1Z5</span> • Tel: +91 11 4050 9000</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Official Bill / Receipt
              </span>
              <div className="text-lg font-black text-slate-900 mt-1 font-mono">{invoice.invoiceId}</div>
              <p className="text-xs text-slate-500">Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient & Doctor Demographics */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Billed To (Patient)</span>
              <p className="font-extrabold text-sm text-slate-900 mt-0.5">{invoice.patientName}</p>
              <p className="text-slate-600">Patient ID: <span className="font-mono font-bold">{invoice.patientId}</span></p>
              <p className="text-slate-600">Mobile: {invoice.patientPhone || 'Not provided'}</p>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Consultant & Department</span>
              <p className="font-extrabold text-sm text-slate-900 mt-0.5">{invoice.doctorName}</p>
              <p className="text-slate-600">{invoice.department || 'Outpatient Clinic'}</p>
              {invoice.appointmentId && (
                <p className="text-slate-600">Linked Visit: <span className="font-mono font-bold">{invoice.appointmentId}</span></p>
              )}
            </div>
          </div>

          {/* Itemized Services & Charges Table */}
          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-extrabold uppercase text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Service Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Consultation Fee */}
              <tr>
                <td className="py-2.5 px-3 text-slate-400 font-mono">1</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  Doctor Consultation Fee ({invoice.doctorName})
                </td>
                <td className="py-2.5 px-3 text-right">1</td>
                <td className="py-2.5 px-3 text-right font-mono">₹{invoice.consultationFee || 750}</td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">₹{invoice.consultationFee || 750}</td>
              </tr>

              {/* Registration Fee if any */}
              {invoice.registrationFee > 0 && (
                <tr>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">2</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    New Patient OPD Registration & Record Opening
                  </td>
                  <td className="py-2.5 px-3 text-right">1</td>
                  <td className="py-2.5 px-3 text-right font-mono">₹{invoice.registrationFee}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">₹{invoice.registrationFee}</td>
                </tr>
              )}

              {/* Additional Services */}
              {(invoice.additionalCharges || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{(invoice.registrationFee > 0 ? 3 : 2) + idx}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{item.description}</td>
                  <td className="py-2.5 px-3 text-right">1</td>
                  <td className="py-2.5 px-3 text-right font-mono">₹{item.amount}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Calculations */}
          <div className="flex justify-end mb-6">
            <div className="w-72 space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Subtotal:</span>
                <span className="font-mono font-bold">₹{invoice.subtotal || invoice.totalAmount}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span className="font-semibold">Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Flat'}):</span>
                  <span className="font-mono font-bold">-₹{invoice.discountAmount}</span>
                </div>
              )}

              {invoice.taxRate > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">GST ({invoice.taxRate}%):</span>
                  <span className="font-mono font-bold">+₹{invoice.taxAmount}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="text-base text-blue-700 font-mono">₹{invoice.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Status & Receipt Details */}
          <div className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-500">Payment Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  invoice.paymentStatus === 'Paid' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {invoice.paymentStatus}
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Method: <span className="font-bold text-slate-800">{invoice.paymentMethod || 'Cash'}</span>
                {invoice.transactionReference && (
                  <span className="ml-2 font-mono text-[11px] text-slate-500">Ref: {invoice.transactionReference}</span>
                )}
              </p>
              {invoice.verifiedBy && (
                <p className="text-[10px] text-slate-400 mt-0.5">Verified by: {invoice.verifiedBy}</p>
              )}
            </div>

            <div className="text-right">
              <div className="w-24 border-b border-slate-400 mb-1"></div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Authorized Signature</span>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between no-print">
          <span className="text-xs text-slate-400">
            MediFlow AI Clinical SaaS • Official E-Receipt System
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

