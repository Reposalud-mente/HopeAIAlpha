/**
 * Auth Session Adapter
 *
 * This file provides compatibility between NextAuth and Auth0 sessions.
 * It allows existing code that uses getServerSession from NextAuth to work with Auth0.
 */

import { NextRequest } from 'next/server';
import { auth0 } from '@/app/api/auth/[...auth0]/auth0';
import { getAuth0Session } from './auth0-wrapper';
import { formatAuth0User } from './auth0-config';

/**
 * Type definition for a session compatible with both NextAuth and Auth0
 */
export interface CompatibleSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  }
}

/**
 * Mock authOptions for compatibility with existing code
 * This is used to maintain compatibility with code that imports authOptions
 */
export const authOptions = {
  // This is just a placeholder to prevent import errors
  // The actual implementation uses Auth0
};

/**
 * Get a session compatible with both NextAuth and Auth0
 * This function replaces getServerSession from NextAuth
 *
 * @param _authOptions Optional auth options (ignored, for compatibility only)
 * @param req NextRequest object
 * @returns A session object compatible with both NextAuth and Auth0
 */
export async function getServerSession(_authOptions?: any, req?: NextRequest): Promise<CompatibleSession | null> {
  try {
    if (!req) {
      // If no request is provided, we can't get the session
      return null;
    }

    // Get the Auth0 session using the wrapper that properly awaits cookies
    const auth0Session = await getAuth0Session(req);

    if (!auth0Session?.user) {
      return null;
    }

    // Format the Auth0 user to match the NextAuth session format
    const formattedUser = formatAuth0User(auth0Session.user);

    // Return a session object compatible with NextAuth
    return {
      user: {
        id: formattedUser?.id || auth0Session.user.sub || 'unknown-id',
        name: formattedUser?.name || auth0Session.user.name,
        email: formattedUser?.email || auth0Session.user.email,
        image: formattedUser?.picture || auth0Session.user.picture,
        role: formattedUser?.role || 'PSYCHOLOGIST', // Default role
      }
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}
