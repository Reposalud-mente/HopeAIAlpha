/**
 * Auth0 API Routes
 *
 * This file handles the Auth0 authentication routes using the official Auth0 Next.js SDK.
 * Routes handled:
 * - /api/auth/login: Redirects to Auth0 login page
 * - /api/auth/logout: Logs out the user from Auth0
 * - /api/auth/callback: Handles the Auth0 callback after login
 */
import { NextRequest } from 'next/server';
import { auth0 } from './auth0';
import { trackEvent, EventType } from '@/lib/monitoring';

// Handle login request
export async function GET(req: NextRequest, context: { params: { auth0: string[] } }) {
  const action = context.params.auth0[0];
  
  try {
    switch (action) {
      case 'login':
        trackEvent({
          type: EventType.USER_ACTION,
          name: 'auth0_login_attempt',
          data: { timestamp: Date.now() }
        });
        return await auth0.handleLogin(req);
        
      case 'callback':
        trackEvent({
          type: EventType.USER_ACTION,
          name: 'auth0_callback_received',
          data: { timestamp: Date.now() }
        });
        return await auth0.handleCallback(req);
        
      case 'logout':
        trackEvent({
          type: EventType.USER_ACTION,
          name: 'auth0_logout',
          data: { timestamp: Date.now() }
        });
        return await auth0.handleLogout(req);
        
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error(`Error handling Auth0 ${action} request:`, error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const POST = GET;
