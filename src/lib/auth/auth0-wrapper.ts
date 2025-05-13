import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { auth0 } from '@/app/api/auth/[...auth0]/auth0';
import { getSession } from '@auth0/nextjs-auth0';

/**
 * Wrapper for auth0.getSession that properly awaits cookies()
 * 
 * This wrapper ensures that cookies are properly awaited before being used,
 * which is required in Next.js 15+
 * 
 * @param req Next.js request object
 * @returns Auth0 session
 */
export async function getAuth0Session(req: NextRequest) {
  try {
    // Ensure cookies are properly awaited
    await cookies();

    // Use getSession directly from the Auth0 library
    // This approach doesn't require a request parameter and properly handles cookies
    return await getSession();
  } catch (error) {
    console.error('Error in getAuth0Session:', error);
    return null;
  }
}
