import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { formatAuth0User, getRoleFromUser } from './auth0-config';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client directly
import { trackEvent, EventType } from '@/lib/monitoring';

/**
 * Get authenticated user from Auth0 session
 *
 * @param req Next.js request object
 * @returns Formatted user object or null if not authenticated
 */
export async function getAuth0User(req: NextRequest) {
  try {
    // Ensure cookies are properly awaited
    await cookies();

    const session = await getSession();
    if (!session?.user) return null;

    return formatAuth0User(session.user);
  } catch (error) {
    console.error('Error getting Auth0 user:', error);
    return null;
  }
}

/**
 * Check if user has required role
 *
 * @param user User object
 * @param allowedRoles Array of allowed roles
 * @returns Boolean indicating if user has required role
 */
export function hasRequiredRole(user: any, allowedRoles: string[]): boolean {
  if (!user) return false;

  const userRole = getRoleFromUser(user);
  return allowedRoles.includes(userRole);
}

/**
 * Require authentication middleware
 *
 * @param req Next.js request object
 * @returns User object if authenticated, otherwise redirects to login
 */
export async function requireAuth(req: NextRequest) {
  const user = await getAuth0User(req);

  if (!user) {
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }

  return user;
}

/**
 * Require role middleware
 *
 * @param req Next.js request object
 * @param allowedRoles Array of allowed roles
 * @returns User object if authenticated and has required role, otherwise returns 403
 */
export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const user = await requireAuth(req);

  // If user is a Response (redirect), return it
  if (user instanceof Response) {
    return user;
  }

  if (!hasRequiredRole(user, allowedRoles)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}

/**
 * Sync Auth0 user with database
 * Creates or updates user record in the database based on Auth0 user
 *
 * @param auth0User Auth0 user object
 * @returns Database user record
 */
export async function syncAuth0UserWithDatabase(auth0User: any) {
  if (!auth0User?.email) {
    throw new Error('Auth0 user email is required');
  }

  try {
    // Import the user service dynamically to avoid circular dependencies
    const { createOrUpdateUserFromAuth0 } = await import('@/services/user-service');

    // Create or update the user in the database
    const dbUser = await createOrUpdateUserFromAuth0(auth0User);

    // Track the appropriate event
    const eventName = dbUser.id === auth0User.sub 
      ? 'user_login_via_auth0' 
      : 'user_created_via_auth0';

    trackEvent({
      type: EventType.USER_ACTION,
      name: eventName,
      data: { userId: dbUser.id }
    });

    return dbUser;
  } catch (error) {
    console.error('Error syncing Auth0 user with database:', error);
    throw error;
  }
}
