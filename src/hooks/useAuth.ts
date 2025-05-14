'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Custom hook for Supabase authentication
 * 
 * This hook provides access to the current user and authentication state.
 * It also listens for auth state changes and updates accordingly.
 * 
 * @returns Authentication state including user, loading status, and error
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
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
        setLoading(false);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return { user, loading, error };
}
