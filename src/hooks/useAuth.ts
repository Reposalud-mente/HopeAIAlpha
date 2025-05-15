'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { signOut as signOutAction } from '@/app/auth/actions';
/**
 * Custom hook for Supabase authentication
 *
 * This hook provides access to the current user and authentication state.
 * It also listens for auth state changes and updates accordingly.
 *
 * @returns Authentication state including user, session, loading status, error, and signOut function
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get the initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error getting auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Sign out the current user
   * This uses the server action for sign out to ensure proper session cleanup
   */
  const signOut = useCallback(async () => {
    try {
      await signOutAction();
      // The redirect is handled by the server action
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Error signing out:', err);
    }
  }, []);

  /**
   * Get user's full name from metadata or fall back to email
   */
  const getUserFullName = useCallback(() => {
    return user?.user_metadata?.full_name || user?.email || '';
  }, [user]);

  /**
   * Get user's role from metadata
   */
  const getUserRole = useCallback(() => {
    return user?.app_metadata?.role || user?.user_metadata?.role || 'user';
  }, [user]);

  return {
    user,
    session,
    loading,
    error,
    signOut,
    getUserFullName,
    getUserRole,
    isLoading: loading // Alias for consistency with naming in some components
  };
}
