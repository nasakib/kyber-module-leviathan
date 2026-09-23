import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/cloud';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName: string, role: UserRole) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string, email?: string): Promise<UserProfile | null> => {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('VectorForge: Could not fetch user profile:', error.message);
      }

      if (data) {
        return {
          id: data.id,
          email: data.email || email,
          displayName: data.display_name || 'Pilot',
          avatarUrl: data.avatar_url,
          role: data.role || 'student',
          createdAt: data.created_at,
        };
      }

      // If profile record doesn't exist yet, construct default
      return {
        id: userId,
        email: email || '',
        displayName: email ? email.split('@')[0] : 'Pilot',
        role: 'student',
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('VectorForge: Profile fetch exception:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id, user.email);
      setProfile(p);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email).then(setProfile);
      }
      setIsLoading(false);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        const p = await fetchProfile(newSession.user.id, newSession.user.email);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Supabase cloud is not configured. Running in offline mode.' };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return { error: 'Supabase cloud is not configured. Running in offline mode.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If user was created immediately and has an ID, upsert profile directly
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          display_name: displayName,
          role,
          updated_at: new Date().toISOString(),
        });
      }

      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (!supabase || !user) {
      return { error: 'Not authenticated' };
    }

    try {
      const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
      if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
      if (updates.role !== undefined) dbUpdates.role = updates.role;

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
        refreshProfile,
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
