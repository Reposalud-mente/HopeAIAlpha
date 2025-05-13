import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, EventType } from '@/lib/monitoring';

// Demo account credentials - stored server-side
// These should be stored in environment variables in production
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL || 'demo@hopeai.com';
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'Demo123!';

export async function POST(request: NextRequest) {
  try {
    // Get the Auth0 domain and client ID from environment variables
    const domain = process.env.AUTH0_ISSUER_BASE_URL || 'https://hopeai.us.auth0.com';
    const clientId = process.env.AUTH0_CLIENT_ID || '6QHlKSDpNbbXK0dOkufSe5zWC3xnus6y';

    // Track the demo login attempt
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'demo_login_attempt',
      data: {
        email: DEMO_EMAIL,
      },
    });

    // Create the Auth0 login URL with demo credentials
    const redirectUri = `${process.env.AUTH0_BASE_URL || 'http://localhost:3000'}/api/auth/callback`;
    const state = JSON.stringify({ returnTo: '/dashboard', isDemoUser: true });
    const loginUrl = `${domain}/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=openid%20profile%20email&login_hint=${encodeURIComponent(DEMO_EMAIL)}&state=${encodeURIComponent(state)}`;

    // Return the login URL
    return NextResponse.json({
      loginUrl,
      redirectUri,
      isDemoUser: true
    });
  } catch (error) {
    console.error('Demo login error:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_login_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      { error: 'Failed to access demo account' },
      { status: 500 }
    );
  }
}