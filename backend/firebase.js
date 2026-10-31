import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDhts6vIhmF5WB50F_Wot7MUK8NR9gKvHw",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "clinic-managemant-d94ff.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "clinic-managemant-d94ff",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "clinic-managemant-d94ff.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1038856558239",
  appId: process.env.FIREBASE_APP_ID || "1:1038856558239:web:abd2ee7fdce7810f4a74aa",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-NNYD2BVD60"
};

let app = null;
let firestoreDb = null;
let firebaseAuth = null;
let firestoreStatus = {
  connected: false,
  projectId: firebaseConfig.projectId,
  lastError: null,
  activeCollections: []
};

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  firestoreDb = getFirestore(app);
  firebaseAuth = getAuth(app);
  firestoreStatus.connected = true;
  console.log(`[Firebase Engine] Initialized for project: ${firebaseConfig.projectId}`);
} catch (err) {
  console.error('[Firebase Engine] Initialization error:', err.message);
  firestoreStatus.lastError = err.message;
}

export { 
  app, 
  firestoreDb, 
  firebaseAuth, 
  firestoreStatus,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
};

