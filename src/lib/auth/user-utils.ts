/**
 * User Utilities for Supabase Authentication
 * 
 * This file provides utility functions for working with Supabase user IDs
 * and converting them to UUIDs for database operations.
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Safely get a UUID from a Supabase user ID
 * 
 * This function is a direct passthrough since Supabase already uses UUIDs,
 * but it includes validation to ensure the ID is valid.
 * 
 * @param userId The Supabase user ID
 * @returns The UUID string or null if invalid
 */
export async function safelyGetUUID(userId: string): Promise<string | null> {
  if (!userId) return null;
  
  try {
    // Validate that this is a valid Supabase user ID by checking if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn('Invalid UUID format for user ID:', userId);
      return null;
    }
    
    return userId;
  } catch (error) {
    console.error('Error converting user ID to UUID:', error);
    return null;
  }
}
