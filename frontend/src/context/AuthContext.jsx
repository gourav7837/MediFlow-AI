import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isRealFirebase, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  onAuthStateChanged 
} from '../firebase';

const AuthContext = createContext();

// Pre-configured mock demo profiles for rapid 4-hour hackathon demoing (FR-1.2)
export const MOCK_PROFILES = {
  doctor: {
    uid: 'doc_sarah_01',
    email: 'dr.sarah@mediflow.ai',
    displayName: 'Dr. Sarah Mitchell, MD',
    role: 'doctor',
    specialty: 'Internal Medicine & General Practice',
    avatar: '👩‍⚕️'
  },
  receptionist: {
    uid: 'rec_alex_02',
    email: 'reception@mediflow.ai',
    displayName: 'Alex Carter',
    role: 'receptionist',
    shift: 'Morning Outpatient Desk',
    avatar: '👨‍💼'
  },
  patient: {
    uid: 'pat_rahul_03',
    email: 'rahul.sharma@example.com',
    displayName: 'Rahul Sharma',
    role: 'patient',
    patientId: 'PAT-1092',
    age: 34,
    gender: 'Male',
    allergies: ['Penicillin'],
    avatar: '🧑'
  }
};

export const AuthProvider = ({ children }) => {
  // Start logged-out so the dedicated Login Page is displayed first
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('mediflow_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Sync real Firebase Auth if enabled
  useEffect(() => {
    if (isRealFirebase && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // If logged into Firebase
          const role = localStorage.getItem(`mediflow_role_${firebaseUser.uid}`) || 'doctor';
          const userObj = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            role: role
          };
          setCurrentUser(userObj);
          localStorage.setItem('mediflow_active_user', JSON.stringify(userObj));
        }
      });
      return unsubscribe;
    }
  }, []);

  // Quick switch profile for rapid hackathon demo (FR-1.2)
  const switchDemoRole = (roleKey) => {
    if (MOCK_PROFILES[roleKey]) {
      setCurrentUser(MOCK_PROFILES[roleKey]);
      localStorage.setItem('mediflow_active_user', JSON.stringify(MOCK_PROFILES[roleKey]));
      setAuthError(null);
    }
  };

  // Real or mock login
  const login = async (email, password, role = 'doctor', displayName = '', persist = true) => {
    setLoading(true);
    setAuthError(null);
    const persistUser = (userObj) => {
      setCurrentUser(userObj);
      if (persist) {
        localStorage.setItem('mediflow_active_user', JSON.stringify(userObj));
      } else {
        localStorage.removeItem('mediflow_active_user');
      }
    };

    try {
      let loggedUser = null;

      // 1. Attempt real Firebase Web Auth
      if (isRealFirebase && auth) {
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          const userRole = localStorage.getItem(`mediflow_role_${userCred.user.uid}`) || role;
          loggedUser = {
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: userCred.user.displayName || email.split('@')[0],
            role: userRole
          };
        } catch (fbErr) {
          console.warn('Direct Firebase Auth sign-in error:', fbErr.message);
          // If operation not allowed, continue to backend verification
        }
      }

      // 2. Synchronize with Node.js Express backend & Firestore users collection
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            loggedUser = {
              uid: data.user.id || ('usr_' + Date.now()),
              email: data.user.email || email,
              displayName: data.user.displayName || email.split('@')[0],
              role: data.user.role || role,
              avatar: data.user.avatar || (role === 'doctor' ? '👨‍⚕️' : role === 'admin' ? '👨‍💼' : '🧑')
            };
          }
        }
      } catch (backendErr) {
        console.warn('Backend login endpoint sync error:', backendErr.message);
      }

      // 3. Fallback to local session if both are offline
      if (!loggedUser) {
        loggedUser = {
          uid: 'user_' + Date.now(),
          email: email,
          displayName: email.split('@')[0],
          role: role,
          avatar: role === 'doctor' ? '👨‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'receptionist' ? '🧑‍💼' : '🧑'
        };
      }

      persistUser(loggedUser);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Real or mock registration with Firestore synchronization
  const register = async (email, password, role = 'patient', displayName = '', persist = true) => {
    setLoading(true);
    setAuthError(null);
    const persistUser = (userObj) => {
      setCurrentUser(userObj);
      if (persist) {
        localStorage.setItem('mediflow_active_user', JSON.stringify(userObj));
      } else {
        localStorage.removeItem('mediflow_active_user');
      }
    };

    try {
      let registeredUser = null;

      // 1. Attempt real Firebase Auth registration
      if (isRealFirebase && auth) {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          localStorage.setItem(`mediflow_role_${userCred.user.uid}`, role);
          registeredUser = {
            uid: userCred.user.uid,
            email: userCred.user.email,
            displayName: displayName || email.split('@')[0],
            role: role
          };
        } catch (fbErr) {
          console.warn('Direct Firebase Auth registration error:', fbErr.message);
        }
      }

      // 2. Synchronize with Node.js Express backend & Firestore users collection
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, displayName })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            registeredUser = {
              uid: data.user.id || ('usr_' + Date.now()),
              email: data.user.email || email,
              displayName: data.user.displayName || displayName || email.split('@')[0],
              role: data.user.role || role,
              avatar: data.user.avatar || (role === 'doctor' ? '👨‍⚕️' : role === 'admin' ? '👨‍💼' : '🧑')
            };
          }
        }
      } catch (backendErr) {
        console.warn('Backend register sync error:', backendErr.message);
      }

      // 3. Fallback
      if (!registeredUser) {
        registeredUser = {
          uid: 'user_' + Date.now(),
          email: email,
          displayName: displayName || email.split('@')[0],
          role: role,
          avatar: role === 'doctor' ? '👨‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'receptionist' ? '🧑‍💼' : '🧑'
        };
      }

      persistUser(registeredUser);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isRealFirebase && auth) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    // Sign out to the dedicated Login Page
    setCurrentUser(null);
    localStorage.removeItem('mediflow_active_user');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchDemoRole,
      login,
      register,
      logout,
      loading,
      authError,
      isRealFirebase
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
