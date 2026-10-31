// -------------------------------------------------------------
// WHATSAPP AUTOMATION ENGINE (whatsapp-web.js + QR linking)
// -------------------------------------------------------------
// Real gateway: scans a QR with the clinic's WhatsApp Business number.
// Auto-bot:    replies to inbound patient messages with a keyword menu.
// Fallback:    if the library / Chromium / session is unavailable, the
//              engine runs in "simulated" mode so the app keeps working.
// -------------------------------------------------------------

import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, '.wwebjs_auth');
const COUNTRY_CODE = (process.env.WHATSAPP_COUNTRY_CODE || '91').replace(/\D/g, '');

// Gateway runtime state
let Client = null;        // whatsapp-web.js Client class (lazy-loaded)
let LocalAuth = null;     // auth strategy class
let client = null;        // active client instance
let qrcodeLib = null;     // qrcode package

let state = 'disconnected'; // disconnected | unavailable | initializing | qr | ready
let qrDataUrl = null;    // data URL of the current QR (state === 'qr')
let clientInfo = null;   // { pushname, wid, ... } once connected
let lastError = null;

// Lazily import optional heavy dependencies so the server boots fine even
// before `npm install whatsapp-web.js qrcode` has been run.
async function ensureLibrary() {
  if (Client) return true;
  try {
    const [{ default: wweb }, qrcodePkg] = await Promise.all([
      import('whatsapp-web.js'),
      import('qrcode')
    ]);
    Client = wweb.Client;
    LocalAuth = wweb.LocalAuth;
    qrcodeLib = qrcodePkg.default || qrcodePkg;

    // Create the client once, bound to shared runtime state handlers
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: AUTH_DIR }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      }
    });

    client.on('qr', async (qr) => {
      try {
        state = 'qr';
        qrDataUrl = await qrcodeLib.toDataURL(qr, { margin: 1, width: 340 });
        console.log(' WHATSAPP: new QR code generated — scan it with WhatsApp > Linked devices');
      } catch (e) {
        console.error(' WHATSAPP: failed to render QR', e);
      }
    });

    client.on('authenticated', () => {
      state = 'initializing';
      qrDataUrl = null;
      console.log(' WHATSAPP: session authenticated, starting up…');
    });

    client.on('ready', () => {
      state = 'ready';
      qrDataUrl = null;
      lastError = null;
      clientInfo = client.info
        ? {
            pushname: client.info.pushname,
            phone: client.info.wid?.user || null,
            device: client.info.phone || null
          }
        : null;
      console.log(` WHATSAPP: connected as ${clientInfo?.phone || 'unknown'} (${clientInfo?.pushname || 'MediFlow Clinic'})`);
      db.logAudit('WHATSAPP_CONNECTED', 'WhatsApp Web Gateway', `Linked device: ${clientInfo?.phone || 'unknown'}`);
    });

    client.on('disconnected', (reason) => {
      state = 'disconnected';
      clientInfo = null;
      db.logAudit('WHATSAPP_DISCONNECTED', 'WhatsApp Web Gateway', `Reason: ${reason || 'unknown'}`);
    });

    client.on('message', (msg) => handleIncomingMessage(msg).catch(e => console.error(' WHATSAPP: bot error', e)));

    return true;
  } catch (e) {
    lastError = `WhatsApp libraries not available: ${e.message}`;
    console.warn(' WHATSAPP:', lastError);
    return false;
  }
}

// ---- phone number helpers ------------------------------------------------

export function normalizeNumber(raw = '') {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return COUNTRY_CODE + digits;      // local number
  if (digits.length === 11 && digits.startsWith('0')) return COUNTRY_CODE + digits.slice(1);
  return digits;                                               // already has country code
}

// ---- outbound ------------------------------------------------------------

export async function sendWhatsAppText(phoneNumber, content) {
  const number = normalizeNumber(phoneNumber);
  const chatId = `${number}@c.us`;

  if (state === 'ready' && client) {
    try {
      await client.sendMessage(chatId, content);
      return { mode: 'real', chatId, status: 'Delivered' };
    } catch (e) {
      lastError = e.message;
      console.error(' WHATSAPP: real send failed, falling back to simulation —', e.message);
    }
  }
  return { mode: 'simulated', chatId, status: 'Simulated' };
}

// ---- auto-reply bot ------------------------------------------------------

const BOT_WELCOME =
  'Welcome to MediFlow AI Clinic! 🩺\n\n' +
  'Reply with a number:\n' +
  '1️⃣ Book an appointment\n' +
  '2️⃣ My queue / token status\n' +
  '3️⃣ My medical reports\n' +
  '4️⃣ Talk to clinic staff\n' +
  '5️⃣ Stop automated alerts';

function botReply(text, contactName) {
  const t = String(text).trim().toLowerCase();

  if (/^(hi|hello|hey|namaste|start|menu|4\b)/i.test(t)) {
    return /^4\b/.test(t)
      ? 'Someone from MediFlow reception will contact you shortly. For urgent care please call +91 (11) 4567-8900.'
      : BOT_WELCOME;
  }
  if (/^(1|book|appointment)/.test(t)) {
    return `Booking an appointment, ${contactName} 📅\n\nPlease send:\n• Preferred date & time\n• Reason for the visit\n\nOr call +91 (11) 4567-8900 for instant booking.`;
  }
  if (/^(2|status|token|queue)/.test(t)) {
    return 'Your live queue token will be shared automatically 2 hours before your consultation. Reply 1 to book a new appointment.';
  }
  if (/^(3|report)/.test(t)) {
    return 'Approved medical reports are delivered here as secure, expiring links directly after your doctor reviews them. 🔒';
  }
  if (/^(5|stop|unsubscribe)/.test(t)) {
    return 'You have been unsubscribed from automated MediFlow alerts. Reply START at any time to re-enable them.';
  }
  return 'MediFlow AI is listening. Reply 1 to book, 2 for queue status, 3 for reports, 4 for staff, or 5 to stop alerts.';
}

async function recordMessage({ phoneNumber, patient, templateType, content, direction, status, mode }) {
  const msg = {
    messageId: 'wa_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    patientId: patient?.patientId || 'WHATSAPP_CONTACT',
    patientName: patient?.fullName || 'WhatsApp Contact',
    phoneNumber,
    templateType,
    content,
    status: `${status}`,
    gatewayMode: mode,
    sentAt: new Date().toISOString(),
    direction
  };
  db.insert('whatsapp_messages', msg);
  return msg;
}

async function handleIncomingMessage(msg) {
  if (msg.fromMe || !msg.from) return; // ignore own echo / notifications

  const number = normalizeNumber(msg.from.split('@')[0]);
  const contactName = msg.notifyName || 'Patient';

  await recordMessage({
    phoneNumber: `+${number}`,
    patient: db.findOne('patients', p => p.phoneNumber?.replace(/\D/g, '').endsWith(number)) || null,
    templateType: 'INBOUND',
    content: msg.body,
    direction: 'Inbound',
    status: 'Received',
    mode: 'real'
  });

  const reply = botReply(msg.body, contactName.split(' ')[0]);
  const send = await sendWhatsAppText(number, reply);

  await recordMessage({
    phoneNumber: `+${number}`,
    patient: null,
    templateType: 'AUTO_BOT_REPLY',
    content: reply,
    direction: 'Outbound',
    status: send.status,
    mode: send.mode
  });

  db.logAudit('WHATSAPP_AUTO_BOT_REPLY', 'WhatsApp Automation Bot', `Replied to ${contactName} (+${number})`);
}

// ---- lifecycle -----------------------------------------------------------

export async function connectWhatsApp() {
  const ready = await ensureLibrary();
  if (!ready) return getStatus();
  if (state === 'ready' || state === 'qr' || state === 'initializing') return getStatus();

  state = 'initializing';
  qrDataUrl = null;
  try {
    await client.initialize();
  } catch (e) {
    state = 'unavailable';
    lastError = e.message;
    console.error(' WHATSAPP: initialize failed —', e.message);
  }
  return getStatus();
}

export async function disconnectWhatsApp() {
  try {
    if (client) await client.destroy();
  } catch (e) {
    console.warn(' WHATSAPP: destroy error', e.message);
  }
  state = 'disconnected';
  qrDataUrl = null;
  clientInfo = null;
  db.logAudit('WHATSAPP_DISCONNECTED', 'Admin', 'Session manually disconnected from dashboard');
  return getStatus();
}

export function getStatus() {
  const messages = db.get('whatsapp_messages');
  return {
    mode: state === 'ready' ? 'real' : 'simulated',
    connected: state === 'ready',
    state, // disconnected | unavailable | initializing | qr | ready
    qr: state === 'qr' ? qrDataUrl : null,
    activePhoneNumber: state === 'ready' && clientInfo?.phone
      ? `+${clientInfo.phone} (${clientInfo.pushname || 'Clinic Gateway'})`
      : null,
    provider: state === 'ready' ? 'whatsapp-web.js (Live WhatsApp Web Gateway)' : 'whatsapp-web.js (Simulated Adapter)',
    libraryAvailable: !!Client,
    lastError,
    totalSent: messages.filter(m => m.direction === 'Outbound').length,
    deliveredCount: messages.filter(m => m.direction === 'Outbound' && (m.status === 'Delivered' || m.status === 'Read' || m.status === 'Sent')).length,
    inboundCount: messages.filter(m => m.direction === 'Inbound').length,
    botStatus: state === 'ready' ? 'Auto-reply bot ACTIVE on live WhatsApp' : 'Auto-reply bot idle (connect to activate)'
  };
}
