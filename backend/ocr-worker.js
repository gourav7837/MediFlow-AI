// -------------------------------------------------------------
// OCR CHILD WORKER — isolates Tesseract so crashes/timeouts can
// never take the main API server down.
// Usage: node ocr-worker.js <imagePath>
// Prints a JSON result object to stdout.
// -------------------------------------------------------------
import { createWorker } from 'tesseract.js';

const [, , inputPath] = process.argv;

(async () => {
  let worker = null;
  try {
    worker = await createWorker('eng');
    const { data } = await worker.recognize(inputPath);
    const text = (data?.text || '').replace(/\r\n/g, '\n').trim();
    process.stdout.write(JSON.stringify({
      ok: true,
      method: 'Tesseract OCR (image)',
      text,
      confidence: data?.confidence ?? null
    }));
  } catch (e) {
    process.stdout.write(JSON.stringify({
      ok: false,
      method: 'Tesseract OCR (image)',
      text: '',
      error: e.message
    }));
  } finally {
    try { if (worker) await worker.terminate(); } catch { /* noop */ }
    process.exit(0);
  }
})();
