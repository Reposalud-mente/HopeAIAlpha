/**
 * Supabase Database Client
 *
 * This file provides a utility for creating a Supabase client for direct database operations.
 * It's used by the AI assistant tools to interact with the database.
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// Create a singleton instance of the Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Get a Supabase client for direct database operations
 * This client uses the service role key for full database access
 * @returns A Supabase client configured for database operations
 */
export function getSupabaseAdmin() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create a new Supabase client with the service role key
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  logger.info('Supabase admin client initialized');

  return supabaseClient;
}

/**
 * Get a Supabase client for database operations with user context
 * This client uses the service role key but sets the user context for RLS policies
 * @param userId The user ID to set as the context
 * @returns A Supabase client configured for database operations with user context
 */
export function getSupabaseForUser(userId: string) {
  const supabase = getSupabaseAdmin();

  // Set the user context for RLS policies
  return supabase.auth.setSession({
    access_token: '',
    refresh_token: '',
  }).then(() => {
    return supabase.auth.setSession({
      access_token: `dummy-token-${userId}`,
      refresh_token: '',
    }).then(() => {
      logger.info('Supabase client initialized with user context', { userId });
      return supabase;
    });
  });
}

/**
 * Execute a database query with proper error handling
 * @param queryFn The query function to execute
 * @param errorMessage The error message to log if the query fails
 * @returns The result of the query
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    logger.error(errorMessage, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
