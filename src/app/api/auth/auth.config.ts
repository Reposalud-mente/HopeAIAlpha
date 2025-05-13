/**
 * Auth0 Configuration for API Routes
 *
 * This file contains the configuration for Auth0 API routes.
 */

import { NextRequest } from 'next/server';
import { formatAuth0User } from '@/lib/auth/auth0-config';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';

/**
 * Configuration for Auth0 API routes
 */
export const authConfig = {
  /**
   * Custom login handler
   */
  async login(req: NextRequest) {
    try {
      // Get the return URL from the query string
      const searchParams = new URL(req.url).searchParams;
      const returnTo = searchParams.get('returnTo') || '/dashboard';

      // Track login attempt
      trackEvent({
        type: EventType.USER_ACTION,
        name: 'auth0_login_attempt',
        data: { returnTo }
      });

      return { returnTo };
    } catch (error) {
      console.error('Error during Auth0 login:', error);
      trackEvent({
        type: EventType.ERROR,
        name: 'auth0_login_error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  },

  /**
   * Custom callback handler
   */
  async callback(req: NextRequest, session: any) {
    try {
      if (!session?.user) return;

      const auth0User = formatAuth0User(session.user);

      // Sync the Auth0 user with our database
      await syncAuth0UserWithDatabase(auth0User);

      // Track successful login
      trackEvent({
        type: EventType.USER_ACTION,
        name: 'auth0_login_success',
        data: { userId: auth0User.id }
      });
    } catch (error) {
      console.error('Error during Auth0 callback:', error);
      trackEvent({
        type: EventType.ERROR,
        name: 'auth0_callback_error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  },

  /**
   * Custom logout handler
   */
  async logout(req: NextRequest) {
    try {
      // Get the return URL from the query string
      const searchParams = new URL(req.url).searchParams;
      const returnTo = searchParams.get('returnTo') || '/';

      // Track logout
      trackEvent({
        type: EventType.USER_ACTION,
        name: 'auth0_logout',
        data: { returnTo }
      });

      return { returnTo };
    } catch (error) {
      console.error('Error during Auth0 logout:', error);
      trackEvent({
        type: EventType.ERROR,
        name: 'auth0_logout_error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
};

/**
 * Sync Auth0 user with our database
 */
async function syncAuth0UserWithDatabase(auth0User: any) {
  if (!auth0User?.id) return;

  try {
    // Check if user exists in database by email
    const existingUser = await prisma.user.findUnique({
      where: { email: auth0User.email }
    });

    // Format name parts
    const firstName = auth0User.given_name || auth0User.firstName || auth0User.name?.split(' ')[0] || 'New';
    const lastName = auth0User.family_name || auth0User.lastName || auth0User.name?.split(' ').slice(1).join(' ') || 'User';

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          firstName,
          lastName,
          role: auth0User.role || 'PSYCHOLOGIST',
          lastLoginAt: new Date(),
        }
      });
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email: auth0User.email,
          firstName,
          lastName,
          passwordHash: '', // Not needed with Auth0
          role: auth0User.role || 'PSYCHOLOGIST',
          isActive: true,
          lastLoginAt: new Date(),
        }
      });
    }
  } catch (error) {
    console.error('Error syncing Auth0 user with database:', error);
    trackEvent({
      type: EventType.ERROR,
      name: 'auth0_user_sync_error',
      data: {
        userId: auth0User.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}
