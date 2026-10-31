import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp,
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Official Firebase config provided for clinic-managemant-d94ff
const defaultFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDhts6vIhmF5WB50F_Wot7MUK8NR9gKvHw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clinic-managemant-d94ff.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clinic-managemant-d94ff",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clinic-managemant-d94ff.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1038856558239",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1038856558239:web:abd2ee7fdce7810f4a74aa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NNYD2BVD60"
};

export const getSavedFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem('mediflow_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.apiKey.length > 10) return parsed;
    }
  } catch (e) {
    console.error('Error loading stored Firebase config', e);
  }
  return defaultFirebaseConfig;
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem('mediflow_firebase_config', JSON.stringify(config));
};

let app = null;
let auth = null;
let db = null;
let isRealFirebase = false;

const currentConfig = getSavedFirebaseConfig();

// Check if credentials are supplied
if (currentConfig.apiKey && currentConfig.projectId && currentConfig.apiKey !== "YOUR_API_KEY") {
  try {
    app = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    isRealFirebase = true;
    console.log('Connected to real Firebase project:', currentConfig.projectId);
  } catch (err) {
    console.warn('Failed to initialize Firebase with provided credentials, falling back to local simulated store:', err);
    isRealFirebase = false;
  }
}

export { 
  app, 
  auth, 
  db, 
  isRealFirebase,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  serverTimestamp,
  query, 
  where, 
  orderBy 
};

