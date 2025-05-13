/**
 * Auth0 Configuration
 * 
 * This file contains configuration settings and utility functions for Auth0 integration.
 */

/**
 * Auth0 Role Mapping
 * Maps Auth0 roles to application roles
 */
export const AUTH0_ROLE_MAPPING = {
  'PSYCHOLOGIST': 'PSYCHOLOGIST',
  'SUPERVISOR': 'SUPERVISOR',
  'ADMIN': 'ADMIN',
};

/**
 * Default Auth0 Role
 * Used when a user doesn't have a role assigned
 */
export const DEFAULT_ROLE = 'PSYCHOLOGIST';

/**
 * Auth0 Namespace
 * Used for custom claims in the Auth0 token
 */
export const AUTH0_NAMESPACE = 'https://hopeai.com';

/**
 * Get Role from Auth0 User
 * Extracts the role from Auth0 user object
 * 
 * @param user Auth0 user object
 * @returns The user's role or the default role
 */
export function getRoleFromUser(user: any): string {
  if (!user) return DEFAULT_ROLE;
  
  // Check for role in Auth0 namespaced claims
  const namespacedRole = user[`${AUTH0_NAMESPACE}/role`];
  if (namespacedRole) {
    return namespacedRole;
  }
  
  // Check for role in app_metadata
  if (user.app_metadata?.role) {
    return user.app_metadata.role;
  }
  
  // Check for direct role property
  if (user.role) {
    return user.role;
  }
  
  // Default role if none found
  return DEFAULT_ROLE;
}

/**
 * Format Auth0 User for Application
 * Transforms Auth0 user object to match application user structure
 * 
 * @param auth0User Auth0 user object
 * @returns Formatted user object for the application
 */
export function formatAuth0User(auth0User: any) {
  if (!auth0User) return null;
  
  return {
    id: auth0User.sub || auth0User.id,
    email: auth0User.email,
    name: auth0User.name,
    firstName: auth0User.given_name || auth0User.name?.split(' ')[0] || '',
    lastName: auth0User.family_name || auth0User.name?.split(' ').slice(1).join(' ') || '',
    role: getRoleFromUser(auth0User),
    picture: auth0User.picture,
    // Add any other properties needed by the application
  };
}

/**
 * Auth0 Callback URL
 * Generates the callback URL for Auth0 authentication
 * 
 * @param baseUrl Base URL of the application
 * @returns Auth0 callback URL
 */
export function getAuth0CallbackUrl(baseUrl: string = ''): string {
  const url = baseUrl || process.env.AUTH0_BASE_URL || 'http://localhost:3000';
  return `${url}/api/auth/callback`;
}

/**
 * Auth0 Logout URL
 * Generates the logout URL for Auth0 authentication
 * 
 * @param baseUrl Base URL of the application
 * @returns Auth0 logout URL
 */
export function getAuth0LogoutUrl(baseUrl: string = ''): string {
  const url = baseUrl || process.env.AUTH0_BASE_URL || 'http://localhost:3000';
  return `${url}`;
}
