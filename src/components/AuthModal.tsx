import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/cloud';
import { getSupabaseConfig, updateSupabaseConfig } from '../lib/supabase';
import { soundEngine } from '../utils/audio';
import {
  X,
  User,
  GraduationCap,
  KeyRound,
  Mail,
  ShieldCheck,
  LogOut,
  Settings,
  Database,
  Check,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, signInWithEmail, signUpWithEmail, signOut, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('student');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cloud Config Drawer State
  const [showConfig, setShowConfig] = useState<boolean>(!isConfigured);
  const [customUrl, setCustomUrl] = useState<string>(getSupabaseConfig().url);
  const [customKey, setCustomKey] = useState<string>(getSupabaseConfig().anonKey);
  const [configSuccess, setConfigSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMessage(res.error);
          soundEngine.playErrorBuzz();
        } else {
          soundEngine.playVictoryFanfare();
          onClose();
        }
      } else {
        if (!displayName.trim()) {
          setErrorMessage('Please enter a pilot callsign / display name.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(email, password, displayName, role);
        if (res.error) {
          setErrorMessage(res.error);
          soundEngine.playErrorBuzz();
        } else {
          soundEngine.playVictoryFanfare();
          onClose();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveConfig = () => {
    const success = updateSupabaseConfig(customUrl, customKey);
    setConfigSuccess(success);
    soundEngine.playSliderTick();
    if (success) {
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-sm max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {user ? 'Pilot Profile & Cloud Sync' : 'Pilot Access & Authentication'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isConfigured ? 'Connected to Supabase PostgreSQL' : 'Local Offline Mode active'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-5 flex-1">
          {/* USER IS LOGGED IN */}
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg">
                    {profile?.displayName?.charAt(0).toUpperCase() || profile?.display_name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base">{profile?.displayName || profile?.display_name || 'Cadet'}</h4>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {profile?.role === 'teacher' ? 'Instructor / Teacher' : 'Student Pilot'}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Cloud Active</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await signOut();
                  soundEngine.playObstacleClang();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl transition-all font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* USER IS NOT LOGGED IN */
            <div className="space-y-4">
              {/* Tab Selector: Sign In vs Sign Up */}
              <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    mode === 'signin'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    mode === 'signup'
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Callsign / Display Name</label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Euler_42"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs px-3 py-2 rounded-lg outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Role in VectorForge</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('student')}
                          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs transition-all ${
                            role === 'student'
                              ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Student</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('teacher')}
                          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border text-xs transition-all ${
                            role === 'teacher'
                              ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Teacher</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="pilot@vectorforge.io"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs pl-8 pr-3 py-2 rounded-lg outline-none"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 text-slate-100 text-xs pl-8 pr-3 py-2 rounded-lg outline-none"
                    />
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Cloud' : 'Create Cloud Account'}
                </button>
              </form>
            </div>
          )}

          {/* Cloud Configuration Toggle Drawer */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowConfig((prev) => !prev)}
              className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              <span className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase Cloud Settings</span>
              </span>
              <Settings className="w-3.5 h-3.5" />
            </button>

            {showConfig && (
              <div className="mt-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 text-xs">
                <p className="text-[11px] text-slate-400">
                  Connect your own Supabase project by entering your Project URL and Anon API Key:
                </p>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Project URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-0.5">Anon Public Key</label>
                  <input
                    type="password"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500">
                    {configSuccess ? 'Saved! Reloading...' : 'Saved to browser storage'}
                  </span>
                  <button
                    onClick={handleSaveConfig}
                    className="flex items-center space-x-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition-colors"
                  >
                    {configSuccess ? <Check className="w-3 h-3" /> : null}
                    <span>Save & Connect</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
