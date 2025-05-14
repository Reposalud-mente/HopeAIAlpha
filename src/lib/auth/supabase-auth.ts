/**
 * Supabase Authentication Utilities
 *
 * This file provides utility functions for handling authentication with Supabase
 * in API routes, server components, and server actions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

/**
 * Check if a user is authenticated and return the user object
 * @returns The authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Middleware to check if a user is authenticated for API routes
 * @param request The Next.js request object
 * @param handler The handler function to execute if authenticated
 * @returns The response from the handler or an unauthorized response
 */
export async function withAuth<T>(
  request: NextRequest,
  handler: (user: User) => Promise<T>
): Promise<T | NextResponse> {
  try {
    // Create a Supabase client using the request cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set() {}, // No-op for read-only operations
          remove() {}, // No-op for read-only operations
        },
      }
    );

    // Get the user from the session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.warn('Authentication error:', error?.message || 'No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call the handler with the authenticated user
    return await handler(user);
  } catch (error) {
    console.error('Error in withAuth middleware:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}

/**
 * Convert a Supabase user ID to a UUID string
 * This is a direct passthrough since Supabase already uses UUIDs
 * @param userId The Supabase user ID
 * @returns The UUID string
 */
export function getUserUUID(userId: string): string {
  return userId;
}
