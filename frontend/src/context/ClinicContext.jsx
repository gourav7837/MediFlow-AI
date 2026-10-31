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

// Clean initial state (Zero dummy demo patients or appointments)
const INITIAL_PATIENTS = [];
const INITIAL_APPOINTMENTS = [];
const INITIAL_REMINDERS = [];

export const ClinicProvider = ({ children }) => {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('mediflow_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(p => !p.patientId?.startsWith('PAT-109') && p.fullName !== 'Rahul Sharma') : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('mediflow_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(a => !a.patientId?.startsWith('PAT-109') && a.patientName !== 'Rahul Sharma') : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('mediflow_reminders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter(r => !r.patientId?.startsWith('PAT-109')) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
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
          const list = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(a => !a.patientId?.startsWith('PAT-109') && a.patientName !== 'Rahul Sharma');
          list.sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
          setAppointments(list);
        } else {
          setAppointments([]);
        }
      }, (err) => {
        console.warn('Firestore appointments listener error:', err.message);
      });

      const unsubReminders = onSnapshot(collection(db, 'reminders'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(r => !r.patientId?.startsWith('PAT-109'));
          setReminders(list);
        } else {
          setReminders([]);
        }
      }, (err) => {
        console.warn('Firestore reminders listener error:', err.message);
      });

      const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(p => !p.patientId?.startsWith('PAT-109') && p.fullName !== 'Rahul Sharma');
          setPatients(list);
        } else {
          setPatients([]);
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

