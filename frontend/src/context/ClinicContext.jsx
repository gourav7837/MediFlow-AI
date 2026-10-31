import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  db, 
  isRealFirebase, 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy
} from '../firebase';

const ClinicContext = createContext();

// Initial sample data strictly adhering to PRD Firestore schema (Section 5)
const INITIAL_PATIENTS = [
  {
    patientId: 'PAT-1092',
    fullName: 'Rahul Sharma',
    age: 34,
    gender: 'Male',
    contact: '+91 98765 43210',
    allergies: ['Penicillin']
  },
  {
    patientId: 'PAT-1093',
    fullName: 'Priya Patel',
    age: 45,
    gender: 'Female',
    contact: '+91 98123 45678',
    allergies: ['Sulfa Drugs']
  },
  {
    patientId: 'PAT-1094',
    fullName: 'Amit Kumar',
    age: 28,
    gender: 'Male',
    contact: '+91 97654 32109',
    allergies: ['None reported']
  },
  {
    patientId: 'PAT-1095',
    fullName: 'Sunita Verma',
    age: 52,
    gender: 'Female',
    contact: '+91 96543 21098',
    allergies: ['Aspirin']
  }
];

const INITIAL_APPOINTMENTS = [
  {
    id: 'apt_34',
    tokenNumber: 34,
    tokenDisplay: 'A34',
    patientId: 'PAT-1092',
    patientName: 'Rahul Sharma',
    age: 34,
    gender: 'Male',
    allergies: ['Penicillin'],
    status: 'In Consultation', // PRD FR-2.2
    reason: 'High fever 101F, dry cough for 3 days',
    doctorName: 'Dr. Sarah Mitchell',
    createdAt: new Date().toISOString(),
    estimatedTime: 'Now Serving'
  },
  {
    id: 'apt_35',
    tokenNumber: 35,
    tokenDisplay: 'A35',
    patientId: 'PAT-1093',
    patientName: 'Priya Patel',
    age: 45,
    gender: 'Female',
    allergies: ['Sulfa Drugs'],
    status: 'Waiting', // PRD FR-2.2
    reason: 'Bilateral knee pain, morning stiffness',
    doctorName: 'Dr. Sarah Mitchell',
    createdAt: new Date(Date.now() + 15 * 60000).toISOString(),
    estimatedTime: '10:45 AM'
  },
  {
    id: 'apt_36',
    tokenNumber: 36,
    tokenDisplay: 'A36',
    patientId: 'PAT-1094',
    patientName: 'Amit Kumar',
    age: 28,
    gender: 'Male',
    allergies: ['None reported'],
    status: 'Waiting',
    reason: 'Routine health checkup & blood pressure evaluation',
    doctorName: 'Dr. Sarah Mitchell',
    createdAt: new Date(Date.now() + 30 * 60000).toISOString(),
    estimatedTime: '11:00 AM'
  },
  {
    id: 'apt_37',
    tokenNumber: 37,
    tokenDisplay: 'A37',
    patientId: 'PAT-1095',
    patientName: 'Sunita Verma',
    age: 52,
    gender: 'Female',
    allergies: ['Aspirin'],
    status: 'Waiting',
    reason: 'Diabetes follow-up & HbA1c review',
    doctorName: 'Dr. Sarah Mitchell',
    createdAt: new Date(Date.now() + 45 * 60000).toISOString(),
    estimatedTime: '11:15 AM'
  }
];

const INITIAL_REMINDERS = [
  {
    id: 'rem_1',
    patientId: 'PAT-1092',
    title: 'Metformin - 1-0-1',
    dosage: '500 mg',
    time: '8:00 PM',
    timingCategory: 'Evening / Post Dinner',
    isActive: true, // PRD FR-4.2
    instruction: 'Take with or immediately after meals'
  },
  {
    id: 'rem_2',
    patientId: 'PAT-1092',
    title: 'Paracetamol - 1-1-1',
    dosage: '650 mg',
    time: '2:00 PM',
    timingCategory: 'Afternoon',
    isActive: true,
    instruction: 'Only if fever > 100°F or body pain'
  },
  {
    id: 'rem_3',
    patientId: 'PAT-1092',
    title: 'Azithromycin - 1-0-0',
    dosage: '500 mg',
    time: '9:00 AM',
    timingCategory: 'Morning',
    isActive: true,
    instruction: '1 hour before breakfast with water'
  },
  {
    id: 'rem_4',
    patientId: 'PAT-1092',
    title: 'Vitamin D3 Chewable (Weekly)',
    dosage: '60,000 IU',
    time: '10:00 AM',
    timingCategory: 'Weekly Sunday',
    isActive: false,
    instruction: 'After milk or fatty meal'
  }
];

export const ClinicProvider = ({ children }) => {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('mediflow_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('mediflow_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('mediflow_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [prescriptions, setPrescriptions] = useState(() => {
    const saved = localStorage.getItem('mediflow_prescriptions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage when state changes (if offline mock mode)
  useEffect(() => {
    if (!isRealFirebase) {
      localStorage.setItem('mediflow_patients', JSON.stringify(patients));
      localStorage.setItem('mediflow_appointments', JSON.stringify(appointments));
      localStorage.setItem('mediflow_reminders', JSON.stringify(reminders));
      localStorage.setItem('mediflow_prescriptions', JSON.stringify(prescriptions));
    }
  }, [patients, appointments, reminders, prescriptions]);

  // Real-time Firestore sync when real Firebase is enabled
  useEffect(() => {
    if (isRealFirebase && db) {
      const unsubAppts = onSnapshot(collection(db, 'appointments'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          list.sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
          setAppointments(list);
        } else {
          // Auto-seed initial appointments into Firestore if collection is empty
          INITIAL_APPOINTMENTS.forEach(a => addDoc(collection(db, 'appointments'), a).catch(() => {}));
        }
      }, (err) => {
        console.warn('Firestore appointments listener error:', err.message);
      });

      const unsubReminders = onSnapshot(collection(db, 'reminders'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReminders(list);
        } else {
          // Auto-seed initial reminders into Firestore if collection is empty
          INITIAL_REMINDERS.forEach(r => addDoc(collection(db, 'reminders'), r).catch(() => {}));
        }
      }, (err) => {
        console.warn('Firestore reminders listener error:', err.message);
      });

      const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPatients(list);
        } else {
          // Auto-seed initial patients into Firestore if collection is empty
          INITIAL_PATIENTS.forEach(p => addDoc(collection(db, 'patients'), p).catch(() => {}));
        }
      }, (err) => {
        console.warn('Firestore patients listener error:', err.message);
      });

      return () => {
        unsubAppts();
        unsubReminders();
        unsubPatients();
      };
    }
  }, []);

  // Update token status (FR-2.3)
  const updateTokenStatus = async (appointmentId, newStatus) => {
    if (isRealFirebase && db) {
      try {
        const docRef = doc(db, 'appointments', appointmentId);
        await updateDoc(docRef, { status: newStatus });
      } catch (err) {
        console.error('Firestore token status update failed:', err);
      }
    }

    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        return { ...apt, status: newStatus };
      }
      // If setting this one to "In Consultation", move any other "In Consultation" to "Completed" or keep separate
      return apt;
    }));
  };

  // Add new walk-in queue token
  const addNewToken = async ({ patientName, reason, allergies, age, gender, contact }) => {
    const nextTokenNum = appointments.length > 0 
      ? Math.max(...appointments.map(a => Number(a.tokenNumber) || 0)) + 1 
      : 34;

    const newApt = {
      id: 'apt_' + Date.now(),
      tokenNumber: nextTokenNum,
      tokenDisplay: `A${nextTokenNum}`,
      patientId: 'PAT-' + Math.floor(1000 + Math.random() * 9000),
      patientName: patientName || `Patient #${nextTokenNum}`,
      age: age ? Number(age) : 30,
      gender: gender || 'Other',
      contact: contact || '',
      allergies: allergies ? (Array.isArray(allergies) ? allergies : allergies.split(',').map(s => s.trim())) : ['None reported'],
      status: 'Waiting',
      reason: reason || 'Walk-in Consultation',
      doctorName: 'Dr. Sarah Mitchell',
      createdAt: new Date().toISOString(),
      estimatedTime: 'In Queue'
    };

    if (isRealFirebase && db) {
      try {
        await addDoc(collection(db, 'appointments'), newApt);
      } catch (err) {
        console.error('Firestore add token failed:', err);
      }
    }

    setAppointments(prev => [...prev, newApt]);
    return newApt;
  };

  // Toggle active status for medication reminder (FR-4.2)
  const toggleReminder = async (reminderId) => {
    let updatedActiveState = false;

    setReminders(prev => prev.map(rem => {
      if (rem.id === reminderId) {
        updatedActiveState = !rem.isActive;
        return { ...rem, isActive: updatedActiveState };
      }
      return rem;
    }));

    if (isRealFirebase && db) {
      try {
        const docRef = doc(db, 'reminders', reminderId);
        await updateDoc(docRef, { isActive: updatedActiveState });
      } catch (err) {
        console.error('Firestore reminder update failed:', err);
      }
    }
  };

  // Add new medication reminder
  const addReminder = async (newRem) => {
    const reminderItem = {
      id: 'rem_' + Date.now(),
      patientId: newRem.patientId || 'PAT-1092',
      title: newRem.title || 'Medication Reminder',
      dosage: newRem.dosage || '',
      time: newRem.time || '8:00 PM',
      timingCategory: newRem.timingCategory || 'Daily',
      isActive: true,
      instruction: newRem.instruction || 'As advised by doctor'
    };

    if (isRealFirebase && db) {
      try {
        await addDoc(collection(db, 'reminders'), reminderItem);
      } catch (err) {
        console.error('Firestore add reminder failed:', err);
      }
    }

    setReminders(prev => [reminderItem, ...prev]);
    return reminderItem;
  };

  // Delete medication reminder
  const deleteReminder = async (reminderId) => {
    if (isRealFirebase && db) {
      try {
        await deleteDoc(doc(db, 'reminders', reminderId));
      } catch (err) {
        console.error('Firestore delete reminder failed:', err);
      }
    }
    setReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  // Save generated prescription from Doctor EMR
  const savePrescriptionRecord = async (prescriptionData) => {
    const newRecord = {
      id: 'rx_' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: new Date().toISOString(),
      ...prescriptionData
    };

    if (isRealFirebase && db) {
      try {
        await addDoc(collection(db, 'prescriptions'), newRecord);
      } catch (err) {
        console.error('Firestore save prescription failed:', err);
      }
    }

    setPrescriptions(prev => [newRecord, ...prev]);

    // Automatically sync treatmentPlan medications as active reminders for this patient!
    if (prescriptionData.treatmentPlan && Array.isArray(prescriptionData.treatmentPlan)) {
      prescriptionData.treatmentPlan.forEach((med) => {
        addReminder({
          patientId: prescriptionData.patientId || 'PAT-1092',
          title: `${med.medicine} (${med.frequency || '1-0-1'})`,
          dosage: med.dosage || '',
          time: med.frequency?.includes('OD') ? '9:00 AM' : '8:00 PM',
          timingCategory: 'From EMR Prescription',
          instruction: med.instructions || 'Take as prescribed'
        });
      });
    }

    return newRecord;
  };

  // Reset demo state back to defaults
  const resetDemoData = () => {
    localStorage.removeItem('mediflow_patients');
    localStorage.removeItem('mediflow_appointments');
    localStorage.removeItem('mediflow_reminders');
    localStorage.removeItem('mediflow_prescriptions');
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setReminders(INITIAL_REMINDERS);
    setPrescriptions([]);
  };

  return (
    <ClinicContext.Provider value={{
      patients,
      appointments,
      reminders,
      prescriptions,
      updateTokenStatus,
      addNewToken,
      toggleReminder,
      addReminder,
      deleteReminder,
      savePrescriptionRecord,
      resetDemoData
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => useContext(ClinicContext);

