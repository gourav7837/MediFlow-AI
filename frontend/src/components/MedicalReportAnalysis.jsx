import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  HelpCircle,
  TrendingUp,
  FileSearch,
  ExternalLink
} from 'lucide-react';

export const MedicalReportAnalysis = () => {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [customReportText, setCustomReportText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(data => {
        setReports(data);
        if (data.length > 0) {
          setSelectedReportId(data[0].id);
          loadSampleReport(data[0]);
        }
      })
      .catch(console.error);
  }, []);

  const loadSampleReport = (report) => {
    const text = `Report Type: ${report.reportType}
Patient: ${report.patientName} (${report.patientId})
Date: ${report.reportDate} | Laboratory: ${report.laboratory}

Parameters:
${(report.testParameters || []).map(p => `- ${p.parameter}: ${p.value} ${p.unit} (Reference: ${p.referenceRange}) [${p.status}]`).join('\n')}

Lab Remarks: ${report.laboratoryRemarks}`;

    setCustomReportText(text);
  };

  const handleSelectChange = (id) => {
    setSelectedReportId(id);
    const rep = reports.find(r => r.id === id);
    if (rep) loadSampleReport(rep);
  };

  const handleAnalyseReport = async () => {
    if (!customReportText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/analyse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: customReportText,
          reportType: 'Pathology Diagnostic Panel'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
      }
    } catch (e) {
      console.error('Report analysis error', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">
            <FileSearch className="w-4 h-4 text-cyan-300" />
            <span>Module 6 • Medical Report Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Diagnostic Lab Report Understanding
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-xl">
            Extract reported test values, reference intervals, flag abnormal biological markers, and produce clear explanations with Gemma 4.
          </p>
        </div>

        {/* Pre-Loaded Lab Report Dropdown */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <label className="block text-[10px] font-bold text-cyan-200 uppercase">Load Pre-Configured Lab Report</label>
          <select
            value={selectedReportId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="bg-transparent font-extrabold text-xs text-white focus:outline-none cursor-pointer mt-0.5"
          >
            {reports.map(r => (
              <option key={r.id} value={r.id} className="text-slate-900">
                {r.reportType} - {r.patientName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT COLUMN: Report Text & Upload */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Laboratory Diagnostic Report Data</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">Text or OCR dump</span>
          </div>

          <textarea
            rows={10}
            value={customReportText}
            onChange={(e) => setCustomReportText(e.target.value)}
            placeholder="Paste lab report parameters..."
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
          />

          <button
            onClick={handleAnalyseReport}
            disabled={loading || !customReportText.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Gemma 4 Extracting Lab Parameters...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>✨ Analyze Report with Gemma 4</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN: Extracted Parameters & Plain-Language Explanation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Structured Diagnostic Findings
            </h2>
            {analysisResult && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Extracted
              </span>
            )}
          </div>

          {!analysisResult && !loading && (
            <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileSearch className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-600">No Report Analysis Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Analyze Report with Gemma 4" on the left to extract test values & explanations.</p>
            </div>
          )}

          {loading && (
            <div className="space-y-3 py-8 animate-pulse">
              <div className="h-6 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-20 bg-slate-200 rounded-xl"></div>
              <div className="h-20 bg-slate-200 rounded-xl"></div>
            </div>
          )}

          {analysisResult && !loading && (
            <div className="space-y-4">
              
              {/* Abnormal / Flagged Parameters (PRD Module 6) */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block mb-1.5">
                  1. Flagged Out-of-Range Parameters
                </span>
                <div className="space-y-2">
                  {(analysisResult.outOfRangeParameters || []).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-900">{item.parameter}</span>
                        <p className="text-[11px] text-slate-500">Normal Range: {item.normalRange}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-700 text-sm">{item.value}</span>
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase">
                          {item.flag}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Significance for Clinician */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  2. Clinical Significance (Doctor Review)
                </span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-medium">
                  {analysisResult.clinicalSignificance}
                </div>
              </div>

              {/* Plain-Language AI Explanation (PRD Module 6) */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block mb-1">
                  3. Plain-Language Explanation (For Patient)
                </span>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-blue-950 leading-relaxed">
                  {analysisResult.plainLanguageExplanation}
                </div>
              </div>

              {/* Suggested Next Steps */}
              {analysisResult.suggestedNextSteps && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    4. Suggested Next Steps
                  </span>
                  <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {analysisResult.suggestedNextSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

