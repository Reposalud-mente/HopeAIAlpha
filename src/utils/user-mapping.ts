/**
 * User ID Mapping Utility
 *
 * This file provides utilities for mapping between Supabase Auth user IDs and application user IDs.
 * It's necessary because the IDs in auth.users and hopeai_alpha.users are different.
 */

import { createClient } from './supabase/client';
import { logger } from '@/lib/logger';

/**
 * Get the application user ID from an auth user ID
 * @param authUserId The Supabase Auth user ID
 * @returns The corresponding application user ID or null if not found
 */
export async function getAppUserIdFromAuthId(authUserId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Call the PostgreSQL function we created
    const { data, error } = await supabase
      .rpc('get_app_user_id', { auth_id: authUserId });
    
    if (error) {
      logger.error('Error getting app user ID', { error: error.message, authUserId });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception getting app user ID', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      authUserId 
    });
    return null;
  }
}

/**
 * Get the auth user ID from an application user ID
 * @param appUserId The application user ID
 * @returns The corresponding Supabase Auth user ID or null if not found
 */
export async function getAuthUserIdFromAppId(appUserId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Call the PostgreSQL function we created
    const { data, error } = await supabase
      .rpc('get_auth_user_id', { app_id: appUserId });
    
    if (error) {
      logger.error('Error getting auth user ID', { error: error.message, appUserId });
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Exception getting auth user ID', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      appUserId 
    });
    return null;
  }
}

/**
 * Get the current user's application ID
 * @returns The current user's application ID or null if not authenticated
 */
export async function getCurrentUserAppId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      logger.warn('No authenticated user found');
      return null;
    }
    
    return getAppUserIdFromAuthId(user.id);
  } catch (error) {
    logger.error('Exception getting current user app ID', { 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
}
