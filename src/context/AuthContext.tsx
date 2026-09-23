import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PlayerTier } from '../utils/jargonDictionary';
import { syncProfile, UserProfileData } from '../services/cloudService';
import { soundEngine } from '../utils/audio';

const LOCAL_PROFILE_STORAGE = 'vectorforge_profile_store_v2';

interface AuthContextType {
  user: User | null;
  profile: UserProfileData;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  updateTier: (tier: PlayerTier) => Promise<void>;
  completeDiagnostic: (tier: PlayerTier) => Promise<void>;
  unlockTerm: (termKey: string) => Promise<void>;
  updateStarsTotal: (stars: number) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName: string, role?: 'student' | 'teacher') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfileData = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  display_name: 'Cadet Pilot',
  tier: 'cadet',
  diagnostic_completed: false,
  unlocked_terms: [],
  stars_total: 0,
};

function getLocalProfile(): UserProfileData {
  try {
    const saved = localStorage.getItem(LOCAL_PROFILE_STORAGE);
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_PROFILE;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileData>(getLocalProfile());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile locally whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PROFILE_STORAGE, JSON.stringify(profile));
    } catch {
      // Ignore storage error
    }
  }, [profile]);

  // Load and initialize Supabase Auth (with automatic anonymous sign-in)
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await client.auth.getSession();

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Sync profile from cloud
          const updated = await syncProfile({
            ...profile,
            id: currentSession.user.id,
            display_name: currentSession.user.user_metadata?.display_name || profile.display_name,
            displayName: currentSession.user.user_metadata?.display_name || profile.display_name,
            role: currentSession.user.user_metadata?.role || profile.role || 'student',
          });
          setProfile(updated);
        } else {
          // Automatic Anonymous Sign-in for seamless cloud participation
          const { data: anonData, error: anonErr } = await client.auth.signInAnonymously();
          if (!anonErr && anonData.user) {
            setUser(anonData.user);
            setSession(anonData.session);
            const updated = await syncProfile({
              ...profile,
              id: anonData.user.id,
              display_name: `Cadet_${anonData.user.id.substring(0, 6)}`,
              displayName: `Cadet_${anonData.user.id.substring(0, 6)}`,
              role: 'student',
            });
            setProfile(updated);
          }
        }
      } catch (err) {
        console.warn('VectorForge: Anonymous auth fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const updated = await syncProfile({
          ...profile,
          id: newSession.user.id,
          display_name: newSession.user.user_metadata?.display_name || profile.display_name,
          displayName: newSession.user.user_metadata?.display_name || profile.display_name,
          role: newSession.user.user_metadata?.role || profile.role || 'student',
        });
        setProfile(updated);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateTier = useCallback(async (tier: PlayerTier) => {
    setProfile((prev) => {
      const next = { ...prev, tier };
      syncProfile(next);
      return next;
    });
  }, []);

  const completeDiagnostic = useCallback(async (tier: PlayerTier) => {
    setProfile((prev) => {
      const next: UserProfileData = {
        ...prev,
        tier,
        diagnostic_completed: true,
      };
      syncProfile(next);
      return next;
    });
    soundEngine.playAcademicPromotion();
  }, []);

  const unlockTerm = useCallback(async (termKey: string) => {
    const norm = termKey.toLowerCase();
    setProfile((prev) => {
      if (prev.unlocked_terms.includes(norm)) return prev;
      soundEngine.playAcademicPromotion();
      const next: UserProfileData = {
        ...prev,
        unlocked_terms: [...prev.unlocked_terms, norm],
      };
      syncProfile(next);
      return next;
    });
  }, []);

  const updateStarsTotal = useCallback(async (stars: number) => {
    setProfile((prev) => {
      const next: UserProfileData = {
        ...prev,
        stars_total: stars,
      };
      syncProfile(next);
      return next;
    });
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!supabase) {
      return { error: 'Cloud offline' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    role: 'student' | 'teacher' = 'student'
  ): Promise<{ error?: string }> => {
    if (!supabase) {
      return { error: 'Cloud offline' };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, role } },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        updateTier,
        completeDiagnostic,
        unlockTerm,
        updateStarsTotal,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
