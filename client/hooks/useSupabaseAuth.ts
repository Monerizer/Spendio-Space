import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useSupabaseAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Load initial session
  useEffect(() => {
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        setState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          loading: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load session';
        setState(prev => ({ ...prev, error: message, loading: false }));
      }
    };

    loadSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        loading: false,
      }));
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name || email.split('@')[0],
            },
          },
        });

        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return { success: false, error: error.message };
        }

        setState(prev => ({
          ...prev,
          session: data.session,
          user: data.user || null,
          loading: false,
        }));

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        setState(prev => ({ ...prev, error: message, loading: false }));
        return { success: false, error: message };
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return { success: false, error: error.message };
        }

        setState(prev => ({
          ...prev,
          session: data.session,
          user: data.user || null,
          loading: false,
        }));

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        setState(prev => ({ ...prev, error: message, loading: false }));
        return { success: false, error: message };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        loading: false,
      }));

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      return { success: false, error: message };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password update failed';
      return { success: false, error: message };
    }
  }, []);

  return {
    // State
    user: state.user,
    session: state.session,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,

    // Methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
}
