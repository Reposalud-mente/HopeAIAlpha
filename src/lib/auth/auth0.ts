/**
 * Auth0 Client Configuration
 *
 * This file sets up the Auth0 client for server-side authentication.
 * Following the official Auth0 Next.js SDK documentation.
 */
import { trackEvent, EventType } from '@/lib/monitoring';

// Log initialization for debugging
console.log('Initializing Auth0 client with domain:', process.env.AUTH0_DOMAIN);
console.log('Client ID:', process.env.AUTH0_CLIENT_ID);
console.log('App Base URL:', process.env.APP_BASE_URL || 'http://localhost:3000');

// Export Auth0 configuration
export const auth0Config = {
  domain: process.env.AUTH0_DOMAIN || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
  baseURL: process.env.APP_BASE_URL || 'http://localhost:3000',
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.AUTH0_SECRET || 'a-long-random-string-for-auth0-secret',
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout'
  }
};
