import React, { useState } from 'react';
import { Printer, X, Check, Clock, User, Stethoscope, Building, QrCode } from 'lucide-react';

export const TokenPrintModal = ({ isOpen, onClose, token }) => {
  const [layout, setLayout] = useState('thermal'); // 'thermal' (80mm) | 'standard' (A4 card)

  if (!isOpen || !token) return null;

  const handlePrint = () => {
    window.print();
  };

  const clinicName = "MediFlow AI Multi-Specialty Health Center";
  const clinicAddress = "Suite 100, Central Healthcare Plaza, Medical District";
  const clinicPhone = "+91 11 4050 9000 • reception@mediflow.ai";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-teal-700 to-slate-900 text-white no-print">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="text-base font-bold">Print Clinic Token Slip</h3>
              <p className="text-xs text-teal-200">Token #{token.tokenDisplay} • {token.patientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Layout Toggle */}
            <div className="flex bg-white/10 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setLayout('thermal')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  layout === 'thermal' ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-200 hover:text-white'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                type="button"
                onClick={() => setLayout('standard')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  layout === 'standard' ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-200 hover:text-white'
                }`}
              >
                Standard (A4)
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div className="p-6 overflow-y-auto max-h-[70vh] flex justify-center bg-slate-50">
          
          {/* THERMAL 80mm RECEIPT LAYOUT */}
          {layout === 'thermal' ? (
            <div 
              id="printable-token-slip" 
              className="w-[300px] bg-white p-5 rounded-2xl border border-slate-200 shadow-md text-slate-900 font-mono text-center print:shadow-none print:border-none print:w-full print:m-0"
            >
              {/* Clinic Header */}
              <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3">
                <h2 className="text-base font-black tracking-tight uppercase">{clinicName}</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">{clinicAddress}</p>
                <p className="text-[9px] text-slate-400">Tel: {clinicPhone}</p>
              </div>

              {/* Large Token Callout */}
              <div className="py-3 bg-slate-50 rounded-xl my-2 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">OUTPATIENT TOKEN</span>
                <div className="text-5xl font-black text-slate-900 tracking-tight my-1">
                  #{token.tokenDisplay}
                </div>
                <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {token.roomNumber || 'Room 102'}
                </span>
              </div>

              {/* Patient & Doctor Information */}
              <div className="text-left text-xs space-y-1.5 py-3 border-b-2 border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Patient:</span>
                  <span className="font-black text-slate-900 text-right">{token.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Patient ID:</span>
                  <span className="font-bold text-slate-700 font-mono">{token.patientId || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Consulting:</span>
                  <span className="font-black text-slate-900 text-right">{token.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Specialty:</span>
                  <span className="font-bold text-slate-700 text-right text-[11px]">{token.department || 'General Medicine'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Issued At:</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    {new Date(token.checkedInAt || token.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Queue Position & Approximate Wait Time */}
              <div className="py-3 text-xs space-y-1 border-b-2 border-dashed border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">Queue Position:</span>
                  <span className="font-black text-sm text-teal-700">
                    #{token.queuePosition || 1}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-medium">Approx. Wait Time:</span>
                  <span className="font-bold text-amber-700">
                    ~{token.approximateWaitMinutes || 12} mins
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 italic mt-1">
                  *Wait time is approximate based on ongoing consultations.
                </p>
              </div>

              {/* Barcode Simulation */}
              <div className="pt-3 flex flex-col items-center">
                <div className="tracking-[6px] font-mono text-[11px] font-bold text-slate-700">
                  ||||||||||||||||||||||||||||
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 font-mono">{token.tokenId || `TOK-${token.tokenDisplay}`}</span>
                <p className="text-[10px] text-slate-500 font-bold mt-2">
                  Please take a seat. Your token will be announced on the OPD display screen.
                </p>
              </div>
            </div>
          ) : (
            /* STANDARD A4 CARD LAYOUT */
            <div 
              id="printable-token-slip" 
              className="w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-slate-900"
            >
              {/* Header with Logo */}
              <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
                    MF
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{clinicName}</h2>
                    <p className="text-xs text-slate-500">{clinicAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Date & Time</span>
                  <p className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Token & Patient Big Box */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-teal-50/60 border border-teal-200 my-4 items-center">
                <div className="col-span-1 text-center border-r border-teal-200 pr-3">
                  <span className="text-xs uppercase font-extrabold text-teal-800">Your Token</span>
                  <div className="text-4xl font-black text-teal-900 mt-1">#{token.tokenDisplay}</div>
                  <span className="text-xs font-bold text-teal-700">{token.roomNumber || 'Room 102'}</span>
                </div>
                <div className="col-span-2 text-xs space-y-1 pl-2">
                  <p className="text-sm font-black text-slate-900">{token.patientName}</p>
                  <p className="text-slate-600">Patient ID: <span className="font-mono font-bold text-slate-800">{token.patientId || 'Walk-in'}</span></p>
                  <p className="text-slate-600">Consulting: <span className="font-bold text-slate-800">{token.doctorName}</span></p>
                  <p className="text-slate-600">Department: <span className="font-medium text-slate-800">{token.department}</span></p>
                </div>
              </div>

              {/* Position and Estimated Time */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Queue Position</span>
                  <p className="text-base font-black text-slate-900">#{token.queuePosition || 1}</p>
                  <p className="text-[10px] text-slate-500">Patients ahead: {Math.max(0, (token.queuePosition || 1) - 1)}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Approximate Wait Time</span>
                  <p className="text-base font-black text-amber-600">~{token.approximateWaitMinutes || 12} mins</p>
                  <p className="text-[10px] text-slate-400 italic">Historical avg ~12m/patient</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Please wait in the waiting hall. When your token is called, proceed to {token.roomNumber || 'the consultation room'}.
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500 font-medium">
            Compatible with standard 80mm thermal POS printers and desktop printers.
          </span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Token Slip</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

