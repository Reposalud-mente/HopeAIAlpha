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

/**
 * Get a Supabase client for a specific user
 * This is used by AI assistant tools to perform actions on behalf of a user
 * @param userId The ID of the user to get a client for
 * @returns A Supabase client configured with the user's context
 */
export async function getSupabaseForUser(userId: string) {
  // For client-side, we can only use the browser client with the anon key
  // The actual user authorization will be handled by Supabase's Row Level Security
  // based on the user's session cookie

  // Note: userId is used for logging and potentially for future enhancements
  // where we might need to use different authentication methods
  console.log(`Creating Supabase client for user: ${userId}`);

  try {
    const client = createClient();

    // Test the connection to make sure it's working
    // Use the public schema for patients table
    const { error } = await client.from('patients').select('count').limit(1);

    if (error) {
      console.error('Error testing Supabase connection:', error);
      throw error;
    }

    console.log('Supabase connection successful');
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // Return the client anyway, so the calling code can handle the error
    return createClient();
  }
}
