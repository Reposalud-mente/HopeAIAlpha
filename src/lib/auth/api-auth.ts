/**
 * API Authentication Utilities
 *
 * This file provides utilities for handling authentication and authorization in API routes.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './auth0';
import { getAuth0Session } from './auth0-wrapper';
import { formatAuth0User, getRoleFromUser } from './auth0-config';
import { trackEvent, EventType } from '@/lib/monitoring';

/**
 * Type for the allowed roles
 */
export type UserRole = 'PSYCHOLOGIST' | 'SUPERVISOR' | 'ADMIN';

/**
 * Options for the withAuth middleware
 */
export interface WithAuthOptions {
  allowedRoles?: UserRole[];
  allowUnauthenticated?: boolean;
}

/**
 * Get the authenticated user from the request
 *
 * @param req Next.js request object
 * @returns The authenticated user or null if not authenticated
 */
export async function getAuthUser(req: NextRequest) {
  try {
    const session = await getAuth0Session(req);

    if (!session?.user) return null;

    return formatAuth0User(session.user);
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    trackEvent({
      type: EventType.ERROR,
      name: 'api_auth_error',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    return null;
  }
}

/**
 * Check if the user has the required role
 *
 * @param user The user object
 * @param allowedRoles Array of allowed roles
 * @returns Boolean indicating if the user has the required role
 */
export function hasRequiredRole(user: any, allowedRoles?: UserRole[]): boolean {
  if (!user) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;

  const userRole = getRoleFromUser(user) as UserRole;
  return allowedRoles.includes(userRole);
}

/**
 * Higher-order function to protect API routes with authentication and authorization
 *
 * @param handler The API route handler
 * @param options Authentication options
 * @returns The protected API route handler
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<Response> | Response,
  options: WithAuthOptions = {}
) {
  return async (req: NextRequest) => {
    try {
      // Get the authenticated user
      const user = await getAuthUser(req);

      // If not authenticated and authentication is required
      if (!user && !options.allowUnauthenticated) {
        trackEvent({
          type: EventType.SECURITY,
          name: 'api_unauthorized_access',
          data: { path: req.nextUrl.pathname }
        });

        return NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        );
      }

      // If authenticated but doesn't have the required role
      if (user && options.allowedRoles && !hasRequiredRole(user, options.allowedRoles)) {
        trackEvent({
          type: EventType.SECURITY,
          name: 'api_forbidden_access',
          data: {
            path: req.nextUrl.pathname,
            userId: user.id,
            userRole: user.role,
            requiredRoles: options.allowedRoles
          }
        });

        return NextResponse.json(
          { error: 'Forbidden - Insufficient permissions' },
          { status: 403 }
        );
      }

      // User is authenticated and has the required role, call the handler
      return handler(req, user);
    } catch (error) {
      console.error('Error in API authentication:', error);
      trackEvent({
        type: EventType.ERROR,
        name: 'api_auth_error',
        data: {
          path: req.nextUrl.pathname,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Protect an API route for ADMIN users only
 */
export function withAdminAuth(
  handler: (req: NextRequest, user: any) => Promise<Response> | Response
) {
  return withAuth(handler, { allowedRoles: ['ADMIN'] });
}

/**
 * Protect an API route for SUPERVISOR and ADMIN users
 */
export function withSupervisorAuth(
  handler: (req: NextRequest, user: any) => Promise<Response> | Response
) {
  return withAuth(handler, { allowedRoles: ['SUPERVISOR', 'ADMIN'] });
}

/**
 * Protect an API route for all authenticated users (PSYCHOLOGIST, SUPERVISOR, ADMIN)
 */
export function withPsychologistAuth(
  handler: (req: NextRequest, user: any) => Promise<Response> | Response
) {
  return withAuth(handler, { allowedRoles: ['PSYCHOLOGIST', 'SUPERVISOR', 'ADMIN'] });
}
