/**
 * Auth0 Configuration
 * 
 * This file configures the Auth0 SDK for Next.js.
 * It's used by the Auth0 SDK to handle authentication.
 */
module.exports = {
  authorizationParams: {
    response_type: 'code',
    scope: process.env.AUTH0_SCOPE || 'openid profile email',
  },
  baseURL: process.env.APP_BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  secret: process.env.AUTH0_SECRET,
  routes: {
    callback: process.env.AUTH0_CALLBACK_URL || '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  session: {
    rollingDuration: 60 * 60 * 24 * 7, // 7 days
    absoluteDuration: 60 * 60 * 24 * 30, // 30 days
  },
  cookies: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
};