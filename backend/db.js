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

// Initial realistic database seed adhering strictly to PRD collections
const SEED_DATA = {
  users: [
    {
      id: 'usr_admin',
      email: 'admin@mediflow.ai',
      displayName: 'Dr. Arthur Sterling',
      role: 'admin',
      avatar: '👨‍💼'
    },
    {
      id: 'usr_doc_1',
      email: 'dr.sharma@mediflow.ai',
      displayName: 'Dr. Rajesh Sharma, MD',
      role: 'doctor',
      doctorId: 'DOC-101',
      avatar: '👨‍⚕️'
    },
    {
      id: 'usr_doc_2',
      email: 'dr.mitchell@mediflow.ai',
      displayName: 'Dr. Sarah Mitchell, MD',
      role: 'doctor',
      doctorId: 'DOC-102',
      avatar: '👩‍⚕️'
    },
    {
      id: 'usr_rec_1',
      email: 'reception@mediflow.ai',
      displayName: 'Alex Carter',
      role: 'receptionist',
      avatar: '🧑‍💼'
    }
  ],
  patients: [
    {
      id: 'pat_1',
      patientId: 'PAT-1092',
      fullName: 'Rahul Sharma',
      age: 34,
      dob: '1992-05-14',
      gender: 'Male',
      phoneNumber: '+91 98765 43210',
      email: 'rahul.sharma@example.com',
      address: '42 Lotus Enclave, New Delhi',
      emergencyContact: 'Pooja Sharma (Wife) - +91 98765 43211',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      relevantMedicalHistory: 'Type 2 Diabetes Mellitus (managed on Metformin), seasonal allergic rhinitis.',
      registeredAt: '2026-01-10T09:00:00.000Z'
    },
    {
      id: 'pat_2',
      patientId: 'PAT-1093',
      fullName: 'Priya Patel',
      age: 45,
      dob: '1981-08-22',
      gender: 'Female',
      phoneNumber: '+91 98123 45678',
      email: 'priya.patel@example.com',
      address: '15 Crescent Park, South Ext, New Delhi',
      emergencyContact: 'Kunal Patel (Husband) - +91 98123 45679',
      allergies: ['None reported'],
      relevantMedicalHistory: 'Bilateral knee osteoarthritis, mild hypertension.',
      registeredAt: '2026-02-15T11:30:00.000Z'
    },
    {
      id: 'pat_3',
      patientId: 'PAT-1094',
      fullName: 'Amit Kumar',
      age: 28,
      dob: '1998-11-03',
      gender: 'Male',
      phoneNumber: '+91 97654 32109',
      email: 'amit.k@example.com',
      address: '78 Ring Road, Gurugram',
      emergencyContact: 'Sunita Kumar (Mother) - +91 97654 32110',
      allergies: ['Aspirin'],
      relevantMedicalHistory: 'Routine fitness evaluation, no chronic illness.',
      registeredAt: '2026-03-01T14:15:00.000Z'
    },
    {
      id: 'pat_4',
      patientId: 'PAT-1095',
      fullName: 'Sunita Verma',
      age: 52,
      dob: '1974-03-19',
      gender: 'Female',
      phoneNumber: '+91 96543 21098',
      email: 'sunita.v@example.com',
      address: 'B-12 Vasant Kunj, New Delhi',
      emergencyContact: 'Rohan Verma (Son) - +91 96543 21099',
      allergies: ['Codeine'],
      relevantMedicalHistory: 'Hypothyroidism (Eltroxin 50mcg daily), hyperlipidemia.',
      registeredAt: '2026-03-20T10:00:00.000Z'
    }
  ],
  doctors: [
    {
      id: 'doc_1',
      doctorId: 'DOC-101',
      fullName: 'Dr. Rajesh Sharma',
      degree: 'MBBS, MD (Medicine)',
      specialization: 'Internal Medicine & Cardiology',
      experienceYears: 16,
      email: 'dr.sharma@mediflow.ai',
      phone: '+91 99887 76655',
      consultationFee: 800,
      roomNumber: 'Room 101',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
      status: 'Available',
      avatar: '👨‍⚕️'
    },
    {
      id: 'doc_2',
      doctorId: 'DOC-102',
      fullName: 'Dr. Sarah Mitchell',
      degree: 'MBBS, MD, FRCP',
      specialization: 'General Practice & Internal Medicine',
      experienceYears: 12,
      email: 'dr.mitchell@mediflow.ai',
      phone: '+91 99112 23344',
      consultationFee: 750,
      roomNumber: 'Room 102',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM', '05:30 PM'],
      status: 'In Consultation',
      avatar: '👩‍⚕️'
    },
    {
      id: 'doc_3',
      doctorId: 'DOC-103',
      fullName: 'Dr. Ananya Roy',
      degree: 'MBBS, MS (Ortho)',
      specialization: 'Orthopedics & Joint Specialist',
      experienceYears: 14,
      email: 'dr.ananya@mediflow.ai',
      phone: '+91 99554 43322',
      consultationFee: 900,
      roomNumber: 'Room 103',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['11:00 AM', '12:30 PM', '03:30 PM', '05:00 PM'],
      status: 'Available',
      avatar: '👩‍⚕️'
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      appointmentId: 'APT-801',
      patientId: 'PAT-1092',
      patientName: 'Rahul Sharma',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Sarah Mitchell',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '10:00 AM',
      reasonForVisit: 'High fever 101F, dry cough for 3 days',
      status: 'In Consultation', // Pending | Confirmed | In Consultation | Completed | Cancelled
      bookedVia: 'Voice Receptionist',
      tokenNumber: 'A34',
      createdAt: '2026-10-31T04:30:00.000Z'
    },
    {
      id: 'apt_2',
      appointmentId: 'APT-802',
      patientId: 'PAT-1093',
      patientName: 'Priya Patel',
      doctorId: 'DOC-103',
      doctorName: 'Dr. Ananya Roy',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '11:00 AM',
      reasonForVisit: 'Bilateral knee pain and morning stiffness',
      status: 'Confirmed',
      bookedVia: 'Reception Desk',
      tokenNumber: 'A35',
      createdAt: '2026-10-31T04:45:00.000Z'
    },
    {
      id: 'apt_3',
      appointmentId: 'APT-803',
      patientId: 'PAT-1094',
      patientName: 'Amit Kumar',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Rajesh Sharma',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '03:00 PM',
      reasonForVisit: 'Blood pressure evaluation and routine review',
      status: 'Pending',
      bookedVia: 'Voice Receptionist',
      tokenNumber: 'A36',
      createdAt: '2026-10-31T05:00:00.000Z'
    },
    {
      id: 'apt_4',
      appointmentId: 'APT-804',
      patientId: 'PAT-1095',
      patientName: 'Sunita Verma',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Rajesh Sharma',
      appointmentDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      appointmentTime: '11:00 AM',
      reasonForVisit: 'Thyroid report review and prescription refill',
      status: 'Confirmed',
      bookedVia: 'Patient Portal',
      tokenNumber: 'A37',
      createdAt: '2026-10-30T10:00:00.000Z'
    }
  ],
  consultations: [
    {
      id: 'con_1',
      appointmentId: 'APT-801',
      patientId: 'PAT-1092',
      patientName: 'Rahul Sharma',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Sarah Mitchell',
      date: new Date().toISOString().split('T')[0],
      chiefComplaints: ['101°F Fever for 3 days', 'Dry cough', 'Mild throat discomfort'],
      vitals: {
        bloodPressure: '120/80 mmHg',
        temperature: '101.2 °F',
        pulseRate: '84 bpm',
        spo2: '98%'
      },
      diagnosis: ['Acute Upper Respiratory Tract Infection (URTI) with Pyrexia'],
      treatmentPlan: [
        {
          medicine: 'Tab. Paracetamol',
          dosage: '650 mg',
          frequency: 'TDS (1-1-1)',
          duration: '3 days',
          instructions: 'After food for fever relief'
        },
        {
          medicine: 'Tab. Azithromycin',
          dosage: '500 mg',
          frequency: 'OD (1-0-0)',
          duration: '3 days',
          instructions: '1 hour before lunch, once daily'
        }
      ],
      generalAdvice: 'Drink 2.5 - 3 Liters water daily, warm salt water gargle twice daily, strict bed rest.',
      followUp: 'Review after 3-5 days if fever persists > 100°F.'
    }
  ],
  medical_reports: [
    {
      id: 'rep_1',
      patientId: 'PAT-1092',
      patientName: 'Rahul Sharma',
      reportType: 'Complete Blood Count (CBC) with ESR',
      reportDate: '2026-10-28',
      laboratory: 'Apex Diagnostic Labs, New Delhi',
      doctorReferred: 'Dr. Rajesh Sharma',
      testParameters: [
        { parameter: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Normal' },
        { parameter: 'Total Leukocyte Count (TLC)', value: '11,800', unit: '/mcL', referenceRange: '4,000 - 10,000', status: 'High' },
        { parameter: 'Platelet Count', value: '240,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'Normal' },
        { parameter: 'Neutrophils', value: '78', unit: '%', referenceRange: '40 - 70', status: 'High' },
        { parameter: 'Lymphocytes', value: '16', unit: '%', referenceRange: '20 - 40', status: 'Low' },
        { parameter: 'ESR (1st hour)', value: '28', unit: 'mm/hr', referenceRange: '0 - 15', status: 'High' }
      ],
      laboratoryRemarks: 'Mild polymorphonuclear leukocytosis with elevated ESR suggestive of acute bacterial or reactive inflammatory process.',
      aiExplanation: 'The elevated White Blood Cells (TLC 11,800) and elevated ESR indicate active immune response combating an acute infection.',
      fileUrl: '/sample-reports/cbc_rahul_sharma.pdf'
    },
    {
      id: 'rep_2',
      patientId: 'PAT-1095',
      patientName: 'Sunita Verma',
      reportType: 'Thyroid Profile (Free T3, Free T4, TSH)',
      reportDate: '2026-10-25',
      laboratory: 'Quest Diagnostics PathLab',
      doctorReferred: 'Dr. Rajesh Sharma',
      testParameters: [
        { parameter: 'Free Triiodothyronine (FT3)', value: '2.8', unit: 'pg/mL', referenceRange: '2.0 - 4.4', status: 'Normal' },
        { parameter: 'Free Thyroxine (FT4)', value: '1.1', unit: 'ng/dL', referenceRange: '0.8 - 1.8', status: 'Normal' },
        { parameter: 'Thyroid Stimulating Hormone (TSH)', value: '5.85', unit: 'uIU/mL', referenceRange: '0.40 - 4.20', status: 'High' }
      ],
      laboratoryRemarks: 'Mild elevated TSH with normal FT4 levels. Consistent with subclinical hypothyroidism; correlate with dosage of levothyroxine.',
      aiExplanation: 'TSH is slightly above optimal reference limit, suggesting the current thyroid dosage may require minor titration by clinician.',
      fileUrl: '/sample-reports/tsh_sunita_verma.pdf'
    }
  ],
  voice_sessions: [
    {
      id: 'v_sess_1',
      startTime: '2026-10-31T05:00:00.000Z',
      patientName: 'Rahul Sharma',
      detectedIntent: 'book_appointment',
      status: 'Completed',
      transcript: [
        { sender: 'patient', text: 'Hello, I want to book an appointment.' },
        { sender: 'ai', text: 'Welcome to MediFlow Clinic! I am your AI receptionist. May I know your name?' },
        { sender: 'patient', text: 'Rahul Sharma' },
        { sender: 'ai', text: 'Thank you Mr. Sharma. Which doctor would you like to consult?' },
        { sender: 'patient', text: 'Dr. Sharma tomorrow 11 AM.' },
        { sender: 'ai', text: 'Dr. Rajesh Sharma is available tomorrow at 11:00 AM. Shall I confirm your booking?' },
        { sender: 'patient', text: 'Yes, please confirm.' },
        { sender: 'ai', text: 'Your appointment APT-803 has been confirmed for tomorrow at 11:00 AM with Dr. Rajesh Sharma.' }
      ],
      appointmentCreated: 'APT-803'
    }
  ],
  clinics: [
    {
      clinicId: 'clinic_main_01',
      name: 'MediFlow Central Clinic',
      location: 'Medical Tower, Suite 400, Outer Ring Road, New Delhi',
      phone: '+91 (11) 4567-8900',
      activeDoctorsCount: 3,
      plan: 'Enterprise Healthcare SaaS'
    },
    {
      clinicId: 'clinic_south_02',
      name: 'MediFlow South Specialty Center',
      location: 'C-8 Green Park, New Delhi',
      phone: '+91 (11) 4567-8901',
      activeDoctorsCount: 2,
      plan: 'Clinic Standard'
    }
  ],
  patient_intakes: [
    {
      intakeId: 'intk_1',
      patientId: 'PAT-1092',
      patientName: 'Rahul Sharma',
      reportedConcerns: ['Headache', 'Fever of 101F for 3 days', 'Dry cough'],
      reportedDuration: '3 days',
      existingPatient: true,
      appointmentRequested: true,
      preferredSpecialisation: 'General Physician / Internal Medicine',
      language: 'English',
      summaryStatus: 'Pending Doctor Review',
      createdAt: '2026-10-31T05:05:00.000Z'
    }
  ],
  whatsapp_messages: [
    {
      messageId: 'wa_msg_101',
      patientId: 'PAT-1092',
      patientName: 'Rahul Sharma',
      phoneNumber: '+91 98765 43210',
      templateType: 'APPOINTMENT_CONFIRMATION',
      content: 'Hello Rahul!\n\nYour appointment has been confirmed.\n\nClinic: MediFlow Central Clinic\nDoctor: Dr. Sarah Mitchell\nDate: 31 October 2026\nTime: 10:00 AM\nToken: #A34\n\nThank you for choosing MediFlow.',
      status: 'Delivered',
      sentAt: '2026-10-31T04:31:00.000Z',
      direction: 'Outbound'
    },
    {
      messageId: 'wa_msg_102',
      patientId: 'PAT-1095',
      patientName: 'Sunita Verma',
      phoneNumber: '+91 96543 21098',
      templateType: '24H_APPOINTMENT_REMINDER',
      content: 'Reminder: You have an upcoming consultation tomorrow at 11:00 AM with Dr. Rajesh Sharma at MediFlow Clinic. Please arrive 10 minutes early.',
      status: 'Read',
      sentAt: '2026-10-30T11:00:00.000Z',
      direction: 'Outbound'
    }
  ],
  notifications: [
    {
      notificationId: 'notif_1',
      type: 'REMINDER_24H',
      target: 'Rahul Sharma',
      channel: 'WhatsApp',
      scheduledTime: '2026-10-30T10:00:00.000Z',
      status: 'Executed',
      appointmentId: 'APT-801'
    },
    {
      notificationId: 'notif_2',
      type: 'FOLLOW_UP_SCHEDULE',
      target: 'Rahul Sharma',
      channel: 'WhatsApp',
      scheduledTime: '2026-11-05T09:00:00.000Z',
      status: 'Pending',
      appointmentId: 'APT-801',
      details: 'Follow-up for URTI & Pyrexia review'
    }
  ],
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
  prescriptions: [
    {
      id: 'rx_1',
      prescriptionId: 'RX-901',
      patientId: 'PAT-1092',
      patientName: 'Rahul Sharma',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Sarah Mitchell, MD',
      consultationId: 'con_1',
      consultationDate: '2026-10-31',
      diagnosis: 'Acute Upper Respiratory Tract Infection (URTI) with Pyrexia',
      medicines: [
        {
          medicineName: 'Tab. Paracetamol',
          strength: '650 mg',
          dosage: '1 tablet',
          frequency: 'TDS (1-1-1)',
          duration: '3 days',
          instructions: 'After food for fever relief'
        },
        {
          medicineName: 'Tab. Azithromycin',
          strength: '500 mg',
          dosage: '1 tablet',
          frequency: 'OD (1-0-0)',
          duration: '3 days',
          instructions: '1 hour before lunch, once daily'
        }
      ],
      recommendedTests: ['Complete Blood Count (CBC) with ESR if fever > 100°F'],
      followUpDate: '2026-11-04',
      additionalNotes: 'Drink 2.5 - 3 Liters water daily, warm salt water gargle twice daily, strict bed rest.',
      status: 'Approved',
      approvedByDoctor: true,
      publishedToPortal: true,
      createdAt: '2026-10-31T05:00:00.000Z'
    },
    {
      id: 'rx_2',
      prescriptionId: 'RX-902',
      patientId: 'PAT-1095',
      patientName: 'Sunita Verma',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Rajesh Sharma, MD',
      consultationId: 'con_2',
      consultationDate: '2026-10-25',
      diagnosis: 'Subclinical Hypothyroidism & Borderline Glycemia',
      medicines: [
        {
          medicineName: 'Tab. Thyronorm (Levothyroxine)',
          strength: '50 mcg',
          dosage: '1 tablet',
          frequency: 'OD (1-0-0)',
          duration: '30 days',
          instructions: 'Empty stomach in the morning with water'
        },
        {
          medicineName: 'Tab. Metformin',
          strength: '500 mg',
          dosage: '1 tablet',
          frequency: 'BD (1-0-1)',
          duration: '30 days',
          instructions: 'Immediately after breakfast and dinner'
        }
      ],
      recommendedTests: ['Repeat Serum TSH after 6 weeks', 'HbA1c & Fasting Blood Sugar'],
      followUpDate: '2026-11-25',
      additionalNotes: 'Maintain low-carb diet, 30 minutes light brisk walk daily, avoid soya within 4 hours of thyroid pill.',
      status: 'Approved',
      approvedByDoctor: true,
      publishedToPortal: true,
      createdAt: '2026-10-25T11:00:00.000Z'
    }
  ],
  audit_logs: [
    {
      id: 'log_1',
      timestamp: '2026-10-31T04:30:00.000Z',
      action: 'APPOINTMENT_CREATED',
      actor: 'AI Voice Receptionist',
      details: 'Booked Token #A34 for patient Rahul Sharma with Dr. Sarah Mitchell'
    },
    {
      id: 'log_2',
      timestamp: '2026-10-31T04:45:00.000Z',
      action: 'PATIENT_REGISTERED',
      actor: 'Receptionist (Alex Carter)',
      details: 'Registered new patient Priya Patel (PAT-1093)'
    },
    {
      id: 'log_3',
      timestamp: '2026-10-31T05:00:00.000Z',
      action: 'VOICE_SESSION_COMPLETED',
      actor: 'Gemma 4 Voice Engine',
      details: 'Voice booking session #v_sess_1 successfully verified and recorded'
    }
  ]
};

// Database manager with dual-mode Firestore synchronization
class JsonDB {
  constructor() {
    this.data = this.load();
    this.initFirestoreSync().catch(err => {
      console.warn('[Firestore] Initial sync note:', err.message);
    });
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
      'audit_logs'
    ];

    let syncedCount = 0;
    for (const collName of coreCollections) {
      try {
        const snap = await getDocs(collection(firestoreDb, collName));
        if (snap && snap.docs.length > 0) {
          const remoteItems = snap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
          this.data[collName] = remoteItems;
          syncedCount += remoteItems.length;
          if (!firestoreStatus.activeCollections.includes(collName)) {
            firestoreStatus.activeCollections.push(collName);
          }
        } else if (this.data[collName] && this.data[collName].length > 0) {
          // If remote Firestore collection is empty, seed initial items
          for (const item of this.data[collName].slice(0, 10)) {
            const docId = item.id || item.patientId || item.doctorId || item.appointmentId || ('doc_' + Date.now());
            await setDoc(doc(firestoreDb, collName, String(docId)), item).catch(() => {});
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
          if (!loaded[k] && SEED_DATA[k]) {
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

