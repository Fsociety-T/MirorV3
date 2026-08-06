// Auth Hook
import { useEffect, useState, useCallback, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../lib/supabase';
import { useUIStore } from '../store/useStore';

const AuthContext = createContext<AuthState | null>(null);

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isGhost: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInAnonymously: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isGhost: false,
    loading: true,
    signIn: async () => ({ error: new Error('Not initialized') }),
    signUp: async () => ({ error: new Error('Not initialized') }),
    signInWithGoogle: async () => ({ error: new Error('Not initialized') }),
    signInAnonymously: async () => ({ error: new Error('Not initialized') }),
    signOut: async () => {},
    updateProfile: async () => ({ error: new Error('Not initialized') }),
  });

  const setTheme = useUIStore((s) => s.setTheme);

  const fetchProfile = useCallback(async (user: User) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (data) {
      setState((prev) => prev.user?.id === user.id ? { ...prev, profile: data } : prev);
      return;
    }

    if (error?.code !== 'PGRST116') return;

    const displayName = typeof user.user_metadata.display_name === 'string'
      ? user.user_metadata.display_name
      : null;
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert({ id: user.id, display_name: displayName })
      .select()
      .single();

    if (!createError && createdProfile) {
      setState((prev) => prev.user?.id === user.id ? { ...prev, profile: createdProfile } : prev);
    }
  }, []);

  const setSessionState = useCallback((session: Session | null) => {
    const user = session?.user ?? null;
    setState((prev) => ({
      ...prev,
      user,
      profile: user?.id === prev.user?.id ? prev.profile : null,
      session,
      isGhost: Boolean(user?.is_anonymous),
      loading: false,
    }));

    if (user) void fetchProfile(user);
  }, [fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSessionState(session);
      if (event === 'SIGNED_IN' && session?.user) {
        setTheme(session.user.user_metadata.theme as 'light' | 'dark' || 'dark');
      }
    });

    return () => subscription.unsubscribe();
  }, [setSessionState, setTheme]);

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

  const signInAnonymously = useCallback(async () => {
    const { error } = await supabase.auth.signInAnonymously();
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

  const value = { ...state, signIn, signUp, signInWithGoogle, signInAnonymously, signOut, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
