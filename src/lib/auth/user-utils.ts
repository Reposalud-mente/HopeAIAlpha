/**
 * Utility functions for handling user data and authentication
 */

/**
 * Converts an Auth0 user ID to a database user ID
 * Auth0 IDs are in the format "auth0|681fa36967e92ac88b85e217"
 * Database expects UUIDs
 * 
 * This function handles the mapping between Auth0 IDs and database UUIDs
 * 
 * @param auth0Id The Auth0 user ID
 * @returns The database user ID
 */
export async function getUserIdFromAuth0(auth0Id: string): Promise<string> {
  // For now, we'll use a mock mapping for testing
  // In a real implementation, this would query the database to find the user
  
  // Mock mapping for testing
  const mockMapping: Record<string, string> = {
    'auth0|681fa36967e92ac88b85e217': '4ef97d7e-9d22-4449-9e83-0933550a13e6',
  };
  
  // Return the mapped ID or a default one for testing
  return mockMapping[auth0Id] || '4ef97d7e-9d22-4449-9e83-0933550a13e6';
}

/**
 * Checks if a string is a valid UUID
 * 
 * @param str The string to check
 * @returns True if the string is a valid UUID, false otherwise
 */
export function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Safely converts a string to a UUID
 * If the string is already a UUID, it's returned as is
 * If it's an Auth0 ID, it's converted to a UUID
 * 
 * @param id The ID to convert
 * @returns A Promise resolving to a UUID
 */
export async function safelyGetUUID(id: string): Promise<string> {
  if (!id) return '';
  
  if (isValidUUID(id)) {
    return id;
  }
  
  if (id.startsWith('auth0|')) {
    return await getUserIdFromAuth0(id);
  }
  
  // Default fallback for testing
  return '4ef97d7e-9d22-4449-9e83-0933550a13e6';
}
