import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileSearch,
  X,
  Image as ImageIcon,
  ScanText,
  Stethoscope
} from 'lucide-react';

export const MedicalReportAnalysis = () => {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [customReportText, setCustomReportText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMeta, setAnalysisMeta] = useState(null);   // engine + extraction info
  const [extractionStage, setExtractionStage] = useState(''); // e.g. "Reducing image OCR..."
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);                  // { name, type, size, base64, isImage }
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const ACCEPTED = 'image/png,image/jpeg,image/jpg,image/webp,application/pdf,.pdf,.txt';

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

  // ---------- File upload handling (images / PDF) ----------

  const processFile = async (f) => {
    if (!f) return;
    const isImage = f.type.startsWith('image/');
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf && f.type !== 'text/plain') {
      setError('Unsupported file. Upload an image (PNG/JPG), PDF, or TXT.');
      return;
    }

    // ~12 MB guard (backend accepts 25MB JSON body)
    if (f.size > 12 * 1024 * 1024) {
      setError('File too large. Maximum upload size is 12 MB.');
      return;
    }

    setError('');
    setAnalysisResult(null);
    setAnalysisMeta(null);

    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]); // strip data URI prefix
      reader.readAsDataURL(f);
    });

    setFile({ name: f.name, type: f.type, size: f.size, base64, isImage });

    // Preview: replace empty editor text with draft note (user can still edit)
    if (!customReportText.trim()) {
      setCustomReportText('');
    }
  };

  const handleFileInput = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) =>
    bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  // ---------- Analysis ----------

  const handleAnalyseReport = async () => {
    if (!file && !customReportText.trim()) return;
    setLoading(true);
    setError('');
    setAnalysisResult(null);
    setAnalysisMeta(null);
    setExtractionStage(file?.type?.includes('pdf') ? 'Reading PDF text layer…' : file?.isImage ? 'Reducing image OCR…' : 'Preparing report…');

    try {
      const res = await fetch('/api/ai/analyse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText: customReportText || undefined,
          reportType: 'Pathology Diagnostic Panel',
          fileBase64: file?.base64,
          mimeType: file?.isImage ? file.type : file?.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : file?.type,
          fileName: file?.name
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Try uploading a clearer file or paste the text.');
        if (data.hint) setError((data.error || '') + ' — ' + data.hint);
        return;
      }

      setAnalysisResult(data.analysis);
      setAnalysisMeta({ engine: data.engine, extraction: data.extraction });
    } catch (e) {
      console.error('Report analysis error', e);
      setError('Could not reach the analysis engine.');
    } finally {
      setLoading(false);
      setExtractionStage('');
    }
  };

  const flagged = analysisResult?.outOfRangeParameters || [];
  const detected = analysisResult?.detectedParameters || [];
  const problems = analysisResult?.detectedProblems || [];

  const paramChip = (flag) => {
    if (flag === 'High') return 'bg-rose-100 text-rose-700';
    if (flag === 'Low') return 'bg-amber-100 text-amber-700';
    return 'bg-emerald-100 text-emerald-700';
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
            Upload a patient report as an image or PDF — OCR + text extraction reads it, Gemma 4 extracts every test value, flags abnormalities, and explains the problems found.
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

        {/* LEFT COLUMN: Upload + Report Text */}
        <div className="space-y-5">

          {/* Upload Zone */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>1. Upload Report (Image, PDF or paste below)</span>
              </h2>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                dragActive ? 'border-blue-500 bg-blue-50/60' : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileInput}
                className="hidden"
              />

              {!file ? (
                <>
                  <Upload className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Click to upload, or drag &amp; drop</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP, PDF or TXT — max 12 MB</p>
                </>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  {file.isImage ? (
                    <img
                      src={`data:${file.type};base64,${file.base64}`}
                      alt="Report preview"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-rose-50 border border-rose-200 grid place-items-center">
                      <FileText className="w-8 h-8 text-rose-500" />
                    </div>
                  )}
                  <div className="text-left min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate max-w-[220px]">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{formatSize(file.size)} • {file.isImage ? 'Image → OCR' : 'PDF → Text layer'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Text Editor */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>2. Report Text {file && <span className="text-blue-600 normal-case">(optional — file takes priority)</span>}</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Pasted text or manual edit</span>
            </div>

            <textarea
              rows={8}
              value={customReportText}
              onChange={(e) => setCustomReportText(e.target.value)}
              placeholder="Paste lab report parameters here — e.g. Hemoglobin: 14.2 g/dL (13-17), TLC: 11,800 /mcL (4,000-10,000)…"
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyseReport}
              disabled={loading || (!file && !customReportText.trim())}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{extractionStage || 'Gemma 4 analyzing…'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>{file ? '✨ Analyze Uploaded Report with Gemma 4' : '✨ Analyze Report with Gemma 4'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Structured results */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
              Structured Diagnostic Findings
            </h2>
            {analysisMeta && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 truncate max-w-[220px]" title={analysisMeta.engine + ' • ' + analysisMeta.extraction?.method}>
                {analysisMeta.extraction?.method}
              </span>
            )}
          </div>

          {!analysisResult && !loading && (
            <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ScanText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-slate-600">No Report Analysis Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Upload a report image/PDF (or paste text) and click Analyze.</p>
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

              {/* Summary line */}
              {analysisResult.summary && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 text-xs font-bold text-blue-950 flex items-start space-x-2">
                  <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    {analysisResult.summary}
                    {analysisResult.reportType && (
                      <span className="block text-[10px] font-semibold text-blue-600 mt-0.5">{analysisResult.reportType}</span>
                    )}
                  </div>
                </div>
              )}

              {/* All detected parameters */}
              {detected.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                    1. All Detected Test Values ({detected.length})
                  </span>
                  <div className="rounded-xl border border-slate-100 overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider sticky top-0">
                        <tr>
                          <th className="py-2 px-3 font-extrabold">Parameter</th>
                          <th className="py-2 px-3 font-extrabold">Value</th>
                          <th className="py-2 px-3 font-extrabold">Range</th>
                          <th className="py-2 px-3 font-extrabold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {detected.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-1.5 px-3 font-bold text-slate-800">{p.parameter}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-900">{p.value} {p.unit || ''}</td>
                            <td className="py-1.5 px-3 text-slate-400 font-mono">{p.normalRange || '—'}</td>
                            <td className="py-1.5 px-3 text-right">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${paramChip(p.flag)}`}>
                                {p.flag || 'Normal'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Flagged / problems */}
              {flagged.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block mb-1.5">
                    2. Flagged Out-of-Range Parameters ({flagged.length})
                  </span>
                  <div className="space-y-2">
                    {flagged.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-900">{item.parameter}</span>
                          <p className="text-[11px] text-slate-500">Normal Range: {item.normalRange || '—'}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-rose-700 text-sm">{item.value}</span>
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-600 text-white uppercase">
                            {item.flag || 'Abnormal'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected problems */}
              {problems.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1.5">
                    {flagged.length ? '3. Possible Problems Identified' : '2. Possible Problems Identified'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {problems.map((prob, idx) => (
                      <span key={idx} className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 flex items-center space-x-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{prob}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical significance */}
              {analysisResult.clinicalSignificance && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    {flagged.length || problems.length ? '4' : '2'}. Clinical Significance (Doctor Review)
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-medium">
                    {analysisResult.clinicalSignificance}
                  </div>
                </div>
              )}

              {/* Plain-language explanation */}
              {analysisResult.plainLanguageExplanation && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block mb-1 flex items-center space-x-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Plain-Language Explanation (For Patient)</span>
                  </span>
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 text-xs text-blue-950 leading-relaxed">
                    {analysisResult.plainLanguageExplanation}
                  </div>
                </div>
              )}

              {/* Next steps */}
              {analysisResult.suggestedNextSteps?.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Suggested Next Steps
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
