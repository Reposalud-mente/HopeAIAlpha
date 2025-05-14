/**
 * Supabase Client Utility for Browser
 * 
 * This file provides a utility for creating a Supabase client for use in Client Components.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in browser environments (Client Components)
 * @returns A Supabase client configured for browser use
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
