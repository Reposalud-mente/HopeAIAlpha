/**
 * Auth0 Session API Route
 *
 * This file handles the Auth0 session route to return the session information.
 */
import { NextRequest } from 'next/server';
import { getAuth0Session } from '@/lib/auth/auth0-wrapper';

export async function GET(req: NextRequest) {
  try {
    // Get the session from Auth0 using the wrapper that properly awaits cookies
    const session = await getAuth0Session(req);

    // Return the session information
    return Response.json(session || { user: null });
  } catch (error) {
    console.error('Error getting session:', error);
    return Response.json({ error: 'Failed to get session' }, { status: 500 });
  }
}
