import React from 'react';
import { X, Printer, Download, CheckCircle, Stethoscope, Pill, Calendar, AlertTriangle } from 'lucide-react';

export const PrescriptionPrintModal = ({ prescription, onClose }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Action Header (Hidden during print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              Prescription Document — {prescription.prescriptionId || 'RX-901'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prescription Paper (Styled for Screen and Clean Print) */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 font-sans text-slate-800 bg-white printable-prescription">
          
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-blue-700 tracking-tight">MediFlow</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">CLINIC</span>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-0.5">MediFlow Medical Tower, Suite 400, Outer Ring Road, New Delhi</p>
              <p className="text-[11px] text-slate-500">OPD Helpline: +91 (11) 4567-8900 • Emergency: 108</p>
            </div>

            <div className="text-left sm:text-right">
              <h2 className="font-extrabold text-slate-900 text-sm">{prescription.doctorName || 'Dr. Sarah Mitchell, MD'}</h2>
              <p className="text-xs text-blue-700 font-bold">General Practice & Internal Medicine</p>
              <p className="text-[10px] text-slate-500">Reg No: MCI-2016-89412</p>
            </div>
          </div>

          {/* Patient Details Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
              <span className="font-extrabold text-slate-900">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient ID / Age</span>
              <span className="font-semibold text-slate-800">{prescription.patientId || 'PAT-1092'} • {prescription.patientAge ? `${prescription.patientAge}y` : '34y'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Issue</span>
              <span className="font-semibold text-slate-800">{prescription.consultationDate || new Date().toISOString().split('T')[0]}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescription ID</span>
              <span className="font-mono font-bold text-blue-700">{prescription.prescriptionId || 'RX-901'}</span>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="my-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Clinical Diagnosis</span>
            <p className="font-black text-slate-900 text-sm">{prescription.diagnosis || 'Clinical evaluation and symptom relief'}</p>
          </div>

          {/* Rx Symbol & Medication Table */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black text-blue-600 font-serif italic">℞</span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Prescribed Medications</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Medicine & Strength</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(prescription.medicines || []).map((med, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-black text-slate-900 block">{med.medicineName || med.medicine}</span>
                        {med.strength && <span className="text-[10px] text-slate-500">{med.strength}</span>}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{med.dosage || '1 tab'}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-100">
                          {med.frequency || '1-0-1'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{med.duration || '3 days'}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{med.instructions || 'After food'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Tests & Follow Up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
            {prescription.recommendedTests && prescription.recommendedTests.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Recommended Diagnostics</span>
                <ul className="list-disc list-inside text-slate-800 font-semibold space-y-0.5">
                  {prescription.recommendedTests.map((t, idx) => <li key={idx}>{t}</li>)}
                </ul>
              </div>
            )}

            {prescription.followUpDate && (
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">Recommended Follow-up</span>
                <p className="font-extrabold text-blue-900">{prescription.followUpDate}</p>
                <p className="text-[11px] text-blue-600">Please book appointment prior to date if symptoms persist.</p>
              </div>
            )}
          </div>

          {/* Advice / Doctor Notes */}
          {prescription.additionalNotes && (
            <div className="mb-8 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">General Clinical Advice: </span>
              {prescription.additionalNotes}
            </div>
          )}

          {/* Doctor Signature Block */}
          <div className="border-t-2 border-slate-200 pt-6 mt-8 flex justify-between items-end">
            <div className="text-[10px] text-slate-400 space-y-0.5">
              <p>Verified through MediFlow AI Doctor Workspace.</p>
              <p>Status: <span className="text-emerald-600 font-bold">Doctor Approved & Digitally Signed</span></p>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-slate-400 mb-1">
                <span className="font-serif italic text-blue-800 font-bold block text-sm">Dr. S. Mitchell</span>
              </div>
              <p className="text-xs font-bold text-slate-900">{prescription.doctorName || 'Dr. Sarah Mitchell, MD'}</p>
              <p className="text-[10px] text-slate-500">Authorized Physician Signature</p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs no-print shrink-0">
          <span className="text-slate-500">
            Linked to Consultation & Published in Patient Portal
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
