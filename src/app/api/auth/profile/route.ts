/**
 * Auth0 Profile API Route
 *
 * This file handles the Auth0 profile route to return the user profile.
 */
import { NextRequest } from 'next/server';
import { getAuth0Session } from '@/lib/auth/auth0-wrapper';

export async function GET(req: NextRequest) {
  try {
    // Get the session from Auth0 using the wrapper that properly awaits cookies
    const session = await getAuth0Session(req);

    // Return the user profile
    return Response.json(session?.user || null);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return Response.json({ error: 'Failed to get user profile' }, { status: 500 });
  }
}
