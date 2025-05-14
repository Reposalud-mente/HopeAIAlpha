/**
 * Supabase Server Utility
 *
 * This file provides a utility for creating a Supabase client for use in Server Components,
 * Route Handlers, and Server Actions.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for use in server environments
 * (Server Components, Route Handlers, Server Actions)
 * @returns A Supabase client configured for server use
 */
export async function createClient() {
  // In Next.js 15, cookies() is an async function and must be awaited
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          // No need to await cookieStore.get() again since cookieStore is already awaited
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
