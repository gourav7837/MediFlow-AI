import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  firestoreDb, 
  firestoreStatus, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc 
} from './firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Clean production-ready schema seed (Empty initial collections - no hardcoded demo patients or doctors)
const SEED_DATA = {
  users: [],
  patients: [],
  doctors: [],
  appointments: [],
  consultations: [],
  medical_reports: [],
  voice_sessions: [],
  clinics: [
    {
      clinicId: 'clinic_main_01',
      name: 'MediFlow Central Clinic',
      location: 'Medical Tower, Suite 400, Outer Ring Road, New Delhi',
      phone: '+91 (11) 4567-8900',
      activeDoctorsCount: 0,
      plan: 'Enterprise Healthcare SaaS'
    }
  ],
  patient_intakes: [],
  whatsapp_messages: [],
  notifications: [],
  clinic_settings: {
    clinicName: 'MediFlow Intelligent Clinic',
    tagline: 'Smarter Clinics. Better Care. Powered by AI.',
    phone: '+91 (11) 4567-8900',
    emergencyHelpline: '108 / +91 99999 11111',
    address: 'MediFlow Medical Tower, Suite 400, Outer Ring Road, New Delhi 110029',
    openingHours: {
      weekdays: '08:30 AM - 08:00 PM',
      saturday: '09:00 AM - 05:00 PM',
      sunday: 'Closed / Emergency Only'
    },
    departments: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Diagnostics Lab']
  },
  prescriptions: [],
  audit_logs: [],
  invoices: [],
  payments: [],
  queue_tokens: []
};

// Database manager with dual-mode Firestore synchronization
class JsonDB {
  constructor() {
    this.data = this.load();
    this.cleanDemoRecords();
    this.initFirestoreSync().catch(err => {
      console.warn('[Firestore] Initial sync note:', err.message);
    });
  }

  isDemoItem(item) {
    if (!item) return false;
    const id = String(item.id || item.patientId || item.doctorId || item.notificationId || item.messageId || '');
    const name = String(item.fullName || item.displayName || item.patientName || item.doctorName || item.target || '');
    const email = String(item.email || '').toLowerCase();
    return id.startsWith('pat_') || id.startsWith('doc_') ||
           id.startsWith('apt_') || id.startsWith('tok_') ||
           id.startsWith('rep_') || id.startsWith('inv_') ||
           id.startsWith('con_') || id.startsWith('rx_') ||
           id.startsWith('notif_1') || id.startsWith('notif_2') ||
           id.startsWith('wa_msg_') ||
           id.startsWith('usr_doc') || id.startsWith('usr_pat') || id.startsWith('usr_rec') || id.startsWith('usr_admin') ||
           name.includes('Rahul Sharma') || name.includes('Sarah Mitchell') || name.includes('Arthur Sterling') ||
           name.includes('Rajesh Sharma') || name.includes('Alex Carter') || name.includes('Priya Patel') ||
           name.includes('Sunita Verma') || name.includes('Amit Kumar') ||
           email === 'doctor@mediflow.ai' || email === 'patient@mediflow.ai' ||
           email === 'admin@mediflow.ai' || email === 'reception@mediflow.ai' ||
           email === 'dr.mitchell@mediflow.ai' || email === 'dr.sharma@mediflow.ai' ||
           email === 'rahul.sharma@example.com' || email === 'priya.patel@example.com' ||
           email === 'amit.k@example.com' || email === 'sunita.v@example.com';
  }

  cleanDemoRecords() {
    let cleaned = false;
    const checkCollections = [
      'users', 'patients', 'doctors', 'appointments', 'consultations',
      'medical_reports', 'voice_sessions', 'patient_intakes', 'whatsapp_messages',
      'notifications', 'prescriptions', 'invoices', 'payments', 'queue_tokens'
    ];

    for (const c of checkCollections) {
      if (Array.isArray(this.data[c]) && this.data[c].length > 0) {
        const initialCount = this.data[c].length;
        this.data[c] = this.data[c].filter(item => !this.isDemoItem(item));
        if (this.data[c].length !== initialCount) {
          cleaned = true;
        }
      } else if (!Array.isArray(this.data[c])) {
        this.data[c] = [];
        cleaned = true;
      }
    }

    if (cleaned) {
      this.save();
      console.log('[Database Engine] Cleaned all demo patients, doctors, and credentials.');
    }
  }

  async initFirestoreSync() {
    if (!firestoreDb) return;
    const coreCollections = [
      'patients', 
      'doctors', 
      'appointments', 
      'consultations', 
      'prescriptions',
      'medical_reports', 
      'patient_intakes', 
      'whatsapp_messages', 
      'notifications', 
      'clinics', 
      'users', 
      'audit_logs',
      'invoices',
      'payments',
      'queue_tokens'
    ];

    let syncedCount = 0;
    for (const collName of coreCollections) {
      try {
        const snap = await getDocs(collection(firestoreDb, collName));
        if (snap && snap.docs.length > 0) {
          const remoteItems = snap.docs
            .map(d => ({ ...d.data(), firestoreId: d.id }))
            .filter(item => !this.isDemoItem(item));
          
          if (remoteItems.length > 0) {
            this.data[collName] = remoteItems;
            syncedCount += remoteItems.length;
          }
          if (!firestoreStatus.activeCollections.includes(collName)) {
            firestoreStatus.activeCollections.push(collName);
          }
        }
      } catch (err) {
        firestoreStatus.lastError = err.message;
      }
    }

    if (syncedCount > 0) {
      console.log(`[Firestore Engine] Synchronized ${syncedCount} documents from live Cloud Firestore.`);
      this.save();
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const loaded = JSON.parse(raw);
        for (const k of Object.keys(SEED_DATA)) {
          if (!loaded[k]) {
            loaded[k] = JSON.parse(JSON.stringify(SEED_DATA[k]));
          }
        }
        return loaded;
      }
    } catch (e) {
      console.warn('Could not read existing db.json, re-initializing with seed:', e.message);
    }
    this.save(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  save(dataToSave) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving db.json:', e);
    }
  }

  get(collectionName) {
    return this.data[collectionName] || [];
  }

  find(collectionName, predicate) {
    const coll = this.get(collectionName);
    return coll.filter(predicate);
  }

  findOne(collectionName, predicate) {
    const coll = this.get(collectionName);
    return coll.find(predicate);
  }

  insert(collectionName, item) {
    if (!this.data[collectionName]) {
      this.data[collectionName] = [];
    }
    this.data[collectionName].push(item);
    this.save();

    // Async write to Cloud Firestore
    if (firestoreDb) {
      const docId = item.id || item.patientId || item.doctorId || item.appointmentId || item.messageId || ('doc_' + Date.now());
      setDoc(doc(firestoreDb, collectionName, String(docId)), item).catch(err => {
        firestoreStatus.lastError = err.message;
      });
    }

    return item;
  }

  update(collectionName, predicate, updates) {
    const coll = this.get(collectionName);
    const item = coll.find(predicate);
    if (item) {
      Object.assign(item, updates);
      this.save();

      // Async update in Cloud Firestore
      if (firestoreDb) {
        const docId = item.id || item.patientId || item.doctorId || item.appointmentId || item.messageId;
        if (docId) {
          setDoc(doc(firestoreDb, collectionName, String(docId)), item, { merge: true }).catch(err => {
            firestoreStatus.lastError = err.message;
          });
        }
      }

      return item;
    }
    return null;
  }

  delete(collectionName, predicate) {
    if (!this.data[collectionName]) return false;
    const initialLen = this.data[collectionName].length;
    const itemToDelete = this.data[collectionName].find(predicate);
    this.data[collectionName] = this.data[collectionName].filter(item => !predicate(item));
    const deleted = this.data[collectionName].length < initialLen;
    if (deleted) {
      this.save();

      // Async delete in Cloud Firestore
      if (firestoreDb && itemToDelete) {
        const docId = itemToDelete.id || itemToDelete.patientId || itemToDelete.doctorId || itemToDelete.appointmentId || itemToDelete.messageId;
        if (docId) {
          deleteDoc(doc(firestoreDb, collectionName, String(docId))).catch(err => {
            firestoreStatus.lastError = err.message;
          });
        }
      }
    }
    return deleted;
  }

  logAudit(action, actor, details) {
    const entry = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      actor,
      details
    };
    this.insert('audit_logs', entry);
    return entry;
  }
}

export const db = new JsonDB();
