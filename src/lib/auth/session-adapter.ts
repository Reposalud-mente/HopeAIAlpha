/**
 * Session Adapter for Supabase Authentication
 * 
 * This file provides compatibility functions for code that was previously using
 * NextAuth.js session management. It adapts Supabase authentication to provide
 * a similar interface.
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Auth options for compatibility with code that was using NextAuth.js
 * This is a minimal implementation to provide compatibility
 */
export const authOptions = {
  // These are placeholder values for compatibility
  // The actual authentication is handled by Supabase
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // Empty callbacks for compatibility
  },
};

/**
 * Get the server session using Supabase authentication
 * This provides compatibility with code that was using NextAuth.js getServerSession
 * 
 * @param options Optional auth options (ignored, for compatibility only)
 * @param req Optional request object
 * @returns A session object with user information
 */
export async function getServerSession(options?: any, req?: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    // Return a session object that matches the structure expected by code
    // that was previously using NextAuth.js
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        // Add any other user properties that might be needed
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}
