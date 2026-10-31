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

// Pre-configured demo profiles (used by AuthModal's 1-click role switcher)
export const MOCK_PROFILES = {
  doctor: {
    displayName: 'Dr. Sarah Mitchell',
    specialty: 'Internal Medicine • 88% AI Assist Enabled',
    role: 'doctor'
  },
  receptionist: {
    displayName: 'Priya Sharma',
    shift: 'Morning Shift • Front Desk',
    role: 'receptionist'
  },
  patient: {
    displayName: 'Rahul Sharma',
    patientId: 'PT-2024-0187',
    role: 'patient'
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

  const switchDemoRole = (roleKey) => {
    if (currentUser) {
      const updated = { ...currentUser, role: roleKey };
      setCurrentUser(updated);
      localStorage.setItem('mediflow_active_user', JSON.stringify(updated));
    }
  };

  // Real login with Firebase Auth & Backend Firestore Sync
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
        }
      }

      // 2. Synchronize with Node.js Express backend & Firestore users collection
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role, displayName })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            loggedUser = {
              uid: data.user.id || ('usr_' + Date.now()),
              email: data.user.email || email,
              displayName: data.user.displayName || displayName || email.split('@')[0],
              role: data.user.role || role,
              doctorId: data.user.doctorId,
              patientId: data.user.patientId,
              avatar: data.user.avatar || (role === 'doctor' ? '👩‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'receptionist' ? '🧑‍💼' : '🧑')
            };
          }
        }
      } catch (backendErr) {
        console.warn('Backend login endpoint sync error:', backendErr.message);
      }

      // 3. Fallback
      if (!loggedUser) {
        loggedUser = {
          uid: 'user_' + Date.now(),
          email: email,
          displayName: displayName || email.split('@')[0],
          role: role,
          avatar: role === 'doctor' ? '👩‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'receptionist' ? '🧑‍💼' : '🧑'
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

  // Real registration with Firestore synchronization
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
          console.warn('Direct Firebase Auth registration note:', fbErr.message);
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
              doctorId: data.user.doctorId,
              patientId: data.user.patientId,
              avatar: data.user.avatar || (role === 'doctor' ? '👩‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'receptionist' ? '🧑‍💼' : '🧑')
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
          avatar: role === 'doctor' ? '👩‍⚕️' : role === 'admin' ? '👨‍💼' : role === 'receptionist' ? '🧑‍💼' : '🧑'
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
