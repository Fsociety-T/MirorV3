// Auth Hook
import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/supabase';
import { useUIStore } from '../store/useStore';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: new Error('Not initialized') }),
    signUp: async () => ({ error: new Error('Not initialized') }),
    signInWithGoogle: async () => ({ error: new Error('Not initialized') }),
    signOut: async () => {},
    updateProfile: async () => ({ error: new Error('Not initialized') }),
  });

  const setTheme = useUIStore((s) => s.setTheme);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({ ...prev, session, loading: false }));
      if (session?.user) fetchProfile(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState((prev) => ({ ...prev, session, loading: false }));
      if (session?.user) {
        fetchProfile(session.user.id);
        if (event === 'SIGNED_IN') setTheme(session.user.user_metadata.theme as 'light' | 'dark' || 'dark');
      } else {
        setState((prev) => ({ ...prev, user: null, profile: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, [setTheme]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) {
      setState((prev) => ({ ...prev, user: { ...prev.user!, id: userId } as User, profile: data }));
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', state.user?.id);
    if (!error) {
      setState((prev) => ({ ...prev, profile: { ...prev.profile!, ...updates } }));
    }
    return { error };
  }, [state.user?.id]);

  const value = { ...state, signIn, signUp, signInWithGoogle, signOut, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Context for easy access
import { createContext, useContext } from 'react';
const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}