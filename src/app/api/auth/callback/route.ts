/**
 * Auth0 Callback Route
 *
 * This route handles the Auth0 callback after login.
 * It exchanges the authorization code for tokens and creates a session.
 */

import { NextRequest } from 'next/server';
import { trackEvent, EventType } from '@/lib/monitoring';
import { syncAuth0UserWithDatabase } from '@/lib/auth/auth0-server';
import db from '@/lib/db'; // Import the environment-aware Prisma client

export async function GET(req: NextRequest) {
  try {
    console.log('Auth0 callback received');

    // Get the code and state from the URL
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // If there's an error in the callback, handle it
    if (error) {
      console.error(`Auth0 callback error: ${error} - ${errorDescription}`);
      return Response.redirect(new URL(`/login?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`, req.url));
    }

    if (!code) {
      console.error('No code parameter in callback URL');
      return Response.redirect(new URL('/login?error=no_code', req.url));
    }

    // Get the base URL from environment or request
    const baseUrl = process.env.AUTH0_BASE_URL || `${req.nextUrl.protocol}//${req.headers.get('host')}`;
    const callbackUrl = `${baseUrl}/api/auth/callback`;

    // Exchange the code for a token
    const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID || '6QHlKSDpNbbXK0dOkufSe5zWC3xnus6y',
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: callbackUrl
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Error exchanging code for token:', errorData);
      return Response.redirect(new URL('/login?error=token_exchange', req.url));
    }

    const tokenData = await tokenResponse.json();

    // Get user info using the access token
    const userInfoResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      console.error('Error getting user info');
      return Response.redirect(new URL('/login?error=user_info', req.url));
    }

    const userInfo = await userInfoResponse.json();

    // Sync the user with the database
    await syncAuth0UserWithDatabase({
      sub: userInfo.sub,
      email: userInfo.email,
      given_name: userInfo.given_name,
      family_name: userInfo.family_name,
      name: userInfo.name,
      role: 'PSYCHOLOGIST', // Default role
    });

    // Track the login event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'user_login_via_auth0',
      data: {
        userId: userInfo.sub,
      },
    });

    // Get the return URL from the state parameter
    const returnToUrl = state ? JSON.parse(decodeURIComponent(state)).returnTo : '/dashboard';

    // Create a response that redirects to the return URL with cookies
    const cookies = [
      `auth0.is.authenticated=true; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`, // 7 days
      `auth0.id_token=${tokenData.id_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
      `auth0.access_token=${tokenData.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
    ];

    return new Response(null, {
      status: 302,
      headers: {
        'Location': new URL(returnToUrl, req.url).toString(),
        'Set-Cookie': cookies
      }
    });
  } catch (error) {
    console.error('Error in Auth0 callback:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'auth0_callback_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return Response.redirect(new URL('/login?error=callback', req.url));
  }
}
