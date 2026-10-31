// -------------------------------------------------------------
// LAB VISION — extract text from patient report files (PDF / images)
// -------------------------------------------------------------
// PDF   -> pdf-parse  (raw text layer)
// Image -> tesseract.js OCR (Eng)
// Text  -> heuristic lab-parameter parser used as an AI fallback and a
//          "detected parameters" cross-check.
// -------------------------------------------------------------

import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- 1. PDF ---------------------------------------------------------------

export async function extractPdfText(base64) {
  let parser = null;
  try {
    const buffer = Buffer.from(base64, 'base64');
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const info = await parser.getText();
    const text = (info.text || '').replace(/\r\n/g, '\n').trim();
    return { method: 'PDF text layer', text, pages: info.total ?? null };
  } catch (e) {
    return { method: 'PDF text layer', text: '', error: e.message };
  } finally {
    try { if (parser) await parser.destroy(); } catch { /* noop */ }
  }
}

// ---- 2. OCR for images ----------------------------------------------------
// Runs Tesseract in a spawned child process: if the native OCR worker
// crashes (or hangs), the API server stays up and we return an error.

import { spawn } from 'child_process';
import os from 'os';

const OCR_TIMEOUT_MS = 120000;

export async function extractImageText(base64) {
  const tmpFile = path.join(os.tmpdir(), `mediflow_ocr_${Date.now()}.png`);
  let proc = null;

  try {
    fs.writeFileSync(tmpFile, Buffer.from(base64, 'base64'));
  } catch (e) {
    return { method: 'Tesseract OCR (image)', text: '', error: `Temp write failed: ${e.message}` };
  }

  const result = await new Promise((resolve) => {
    let settled = false;
    const finish = (val) => { if (!settled) { settled = true; resolve(val); } };

    const timer = setTimeout(() => {
      try { proc?.kill(); } catch { /* noop */ }
      finish({ method: 'Tesseract OCR (image)', text: '', error: 'OCR timed out.' });
    }, OCR_TIMEOUT_MS);

    try {
      proc = spawn(process.execPath, [path.join(__dirname, 'ocr-worker.js'), tmpFile], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let out = '';
      proc.stdout.on('data', (d) => { out += d.toString(); });
      proc.stderr.on('data', () => { /* surfaced only on failure */ });

      proc.on('close', () => {
        clearTimeout(timer);
        try { fs.unlinkSync(tmpFile); } catch { /* noop */ }
        try {
          const parsed = JSON.parse(out.slice(out.indexOf('{'), out.lastIndexOf('}') + 1));
          finish({
            method: parsed.method || 'Tesseract OCR (image)',
            text: parsed.text || '',
            confidence: parsed.confidence ?? null,
            error: parsed.ok === false ? parsed.error : undefined
          });
        } catch (e) {
          finish({ method: 'Tesseract OCR (image)', text: '', error: `OCR worker crashed (isolated): ${e.message}` });
        }
      });

      proc.on('error', (e) => {
        clearTimeout(timer);
        finish({ method: 'Tesseract OCR (image)', text: '', error: e.message });
      });
    } catch (e) {
      clearTimeout(timer);
      try { fs.unlinkSync(tmpFile); } catch { /* noop */ }
      finish({ method: 'Tesseract OCR (image)', text: '', error: e.message });
    }
  });

  return result;
}

// ---- 3. Heuristic lab parameter parser ------------------------------------

// Common lab names -> (low, high) reference ranges, used when the report text
// carries no explicit ranges and the AI engine is offline.
const KNOWN_RANGES = {
  'hemoglobin|h[bea]moglobin|hb': [13, 17],
  'tlc|total leucocyte[s]? count|wbc|white blood cell': [4000, 10000],
  'platelet|plt': [150000, 410000],
  'esr|erythrocyte sedimentation': [0, 15],
  'rbc|red blood cell': [4.5, 5.5],
  'pcv|haematocrit|hematocrit|hct': [40, 50],
  'mcv': [83, 101],
  'mch': [27, 32],
  'neutrophil': [40, 80],
  'lymphocyte': [20, 40],
  'eosinophil': [1, 6],
  'glucose fasting|fasting glucose|fbs|fasting plasma glucose': [70, 100],
  'glucose (post)? ?primandial|pp glucose|blood sugar': [70, 140],
  'hba1c|glycated haemoglobin': [4, 5.6],
  'urea|blood urea': [17, 43],
  'creatinine|serum creatinine': [0.7, 1.3],
  'uric acid': [3.5, 7.2],
  'sodium|na\\+?\\b': [135, 145],
  'potassium|k\\+?\\b': [3.5, 5.1],
  'calcium': [8.6, 10.3],
  'bilirubin total|total bilirubin': [0.3, 1.2],
  'sgot|ast': [0, 50],
  'sgpt|alt': [0, 50],
  'alkaline phosphatase|alp': [40, 129],
  'total cholesterol': [0, 200],
  'ldl': [0, 100],
  'hdl': [40, 60],
  'triglyceride|tg': [0, 150],
  'tsh': [0.4, 4.0],
  't3|total t3': [80, 200],
  't4|total t4': [5.0, 12.0],
  'vitamin d|25-oh|vit d': [30, 100],
  'vitamin b12': [200, 900],
  'ferritin': [30, 400],
  'iron|serum iron': [60, 170],
  'crp|c-reactive|c reactive': [0, 5]
};

// Parse a report text into structured lab parameters, flagging H/L values.
export function parseLabParameters(text = '') {
  const results = [];
  const lines = String(text).split(/\n+/).map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    // e.g. "Hemoglobin: 14.2 g/dL (13 - 17)" | "TLC 11,800 /uL H" | "ESR: 28 mm/hr" | "Hemoglobin: 9.8 g/dL (Reference: 13 - 17)"
    const m = line.match(
      /([A-Za-z][A-Za-z0-9 \-\/\(\)\+\%\.]{2,45}?)\s*(?:[:\-=]|by)?\s*\+?\s*(-?\d[\d,]*(?:\.\d+)?)\s*([A-Za-z\/%°µgdlmgdlummolLUPNi]{1,12})?\s*(?:[,;\| ]+|\()\s*(?:ref(?:erence)?s?\s*[:=]?|normal|range)?\s*\)?:?\s*\(?\s*(\d[\d,]*(?:\.\d+)?)?\s*[-–to]{0,3}\s*(\d[\d,]*(?:\.\d+)?)?\s*\)?:?\s*\(?(H|L|High|Low)?\)?\s*$/i
    );
    if (!m) continue;

    const name = m[1].replace(/[\.\s]+$/g, '').trim();
    if (name.length < 2 || /^\d+$/.test(name)) continue;
    if (/date|doctor|patient|laboratory|report|specimen|clinic|address|phone|registered/i.test(name)) continue;

    const thousands = (s) => parseFloat(String(s).replace(/,/g, ''));
    const value = thousands(m[2]);
    if (Number.isNaN(value)) continue;

    const lowKnown = m[4] ? thousands(m[4]) : null;
    const highKnown = m[5] ? thousands(m[5]) : null;
    if (lowKnown == null && highKnown == null && m[6]) continue; // stray parens, not a real range

    // Known-range fallback if the line didn't carry a range
    let known = null;
    for (const [pat, range] of Object.entries(KNOWN_RANGES)) {
      if (new RegExp(`(?:^|\\b)(${pat})(?:\\b|$)`, 'i').test(name)) { known = range; break; }
    }

    const low = lowKnown ?? (known ? known[0] : null);
    const high = highKnown ?? (known ? known[1] : null);

    let flag = (m[6] || '').toUpperCase().startsWith('H') ? 'High'
      : (m[6] || '').toUpperCase().startsWith('L') ? 'Low'
      : null;
    if (!flag && low != null && high != null) {
      if (value > high * 1.02) flag = 'High';
      else if (value < low * 0.98) flag = 'Low';
    }

    results.push({
      parameter: name,
      value: m[2],
      unit: m[3] || '',
      normalRange: low != null && high != null ? `${low} - ${high}` : null,
      flag
    });
  }

  // de-dup by parameter name
  const seen = new Set();
  return results.filter(r => {
    const key = r.parameter.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Compare a parsed parameter name/value against KNOWN_RANGES.
// Returns 'High' | 'Low' | null (null = no deterministic verdict).
export function flagAgainstKnownRange(name, valueStr) {
  const num = parseFloat(String(valueStr).replace(/,/g, ''));
  if (Number.isNaN(num)) return null;
  for (const [pat, [low, high]] of Object.entries(KNOWN_RANGES)) {
    if (new RegExp(`(?:^|\\b)(${pat})(?:\\b|$)`, 'i').test(String(name))) {
      if (num > high * 1.02) return 'High';
      if (num < low * 0.98) return 'Low';
      return 'Normal';
    }
  }
  return null;
}

// ---- 4. File router -------------------------------------------------------

export async function extractFromFile({ fileBase64, mimeType }) {
  if (String(mimeType).includes('pdf')) {
    return extractPdfText(fileBase64);
  }
  if (String(mimeType).startsWith('image/')) {
    return extractImageText(fileBase64);
  }
  return { method: 'Plain text', text: Buffer.from(fileBase64, 'base64').toString('utf8').trim() };
}
