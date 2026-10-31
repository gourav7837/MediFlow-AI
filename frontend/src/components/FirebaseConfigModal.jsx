import React, { useState } from 'react';
import { X, Database, CheckCircle, AlertTriangle, Key, Shield, RefreshCw } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfig, isRealFirebase } from '../firebase';

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const current = getSavedFirebaseConfig();
  const [apiKey, setApiKey] = useState(current.apiKey || '');
  const [projectId, setProjectId] = useState(current.projectId || '');
  const [authDomain, setAuthDomain] = useState(current.authDomain || '');
  const [appId, setAppId] = useState(current.appId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const newConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim(),
      appId: appId.trim()
    };
    saveFirebaseConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleUseMock = () => {
    localStorage.removeItem('mediflow_firebase_config');
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-bold">Cloud Firestore & Auth Setup</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className={`p-3.5 rounded-xl text-xs mb-4 flex items-start space-x-2.5 ${
            isRealFirebase ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {isRealFirebase ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {isRealFirebase 
                  ? `Connected to Firebase Project: ${current.projectId}` 
                  : "Running in Fast Hackathon Demo Mode"}
              </p>
              <p className="mt-0.5 text-slate-600">
                {isRealFirebase 
                  ? "Changes sync live with Cloud Firestore across all devices."
                  : "All Firestore collections (users, patients, appointments, reminders) are actively simulated in real-time. Optional: Enter your Firebase credentials below to connect your Firebase Console."}
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl font-semibold">
              ✓ Settings saved! Reloading application with new config...
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Firebase API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="mediflow-hackathon-2026"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="project.firebaseapp.com"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456789:web:abcdef"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>

            <div className="pt-3 flex space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Save & Connect Live Firebase
              </button>
              <button
                type="button"
                onClick={handleUseMock}
                className="py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-all"
              >
                Use Fast Demo Mode
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Config stored in local client state</span>
          <button onClick={onClose} className="font-semibold text-slate-700 hover:underline">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

