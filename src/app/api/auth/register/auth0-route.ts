/**
 * Auth0 Registration API Route
 * 
 * This route handles user registration through Auth0.
 * It creates a new user in Auth0 and then syncs the user with our database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, EventType } from '@/lib/monitoring';
import { auth0 } from '@/lib/auth/auth0';
import { syncAuth0UserWithDatabase } from '@/lib/auth/auth0-server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get the Auth0 management API token
    const token = await getAuth0ManagementToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to get Auth0 management token' },
        { status: 500 }
      );
    }
    
    // Create the user in Auth0
    const auth0User = await createAuth0User(token, {
      email: body.email,
      password: body.password,
      given_name: body.firstName,
      family_name: body.lastName,
      name: `${body.firstName} ${body.lastName}`,
      connection: 'Username-Password-Authentication',
      user_metadata: {
        licenseNumber: body.licenseNumber,
        specialty: body.specialty,
      },
      app_metadata: {
        role: 'PSYCHOLOGIST', // Default role for new registrations
      },
    });
    
    if (!auth0User) {
      return NextResponse.json(
        { error: 'Failed to create user in Auth0' },
        { status: 500 }
      );
    }
    
    // Sync the Auth0 user with our database
    await syncAuth0UserWithDatabase({
      sub: auth0User.user_id,
      email: auth0User.email,
      given_name: body.firstName,
      family_name: body.lastName,
      name: `${body.firstName} ${body.lastName}`,
      role: 'PSYCHOLOGIST',
      licenseNumber: body.licenseNumber,
      specialty: body.specialty,
    });
    
    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'user_registered_via_auth0',
      data: {
        userId: auth0User.user_id,
      },
    });
    
    // Return success response
    return NextResponse.json({
      id: auth0User.user_id,
      email: auth0User.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: 'PSYCHOLOGIST',
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user with Auth0:', error);
    
    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'auth0_registration_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    
    // Return error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to register user';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Get an Auth0 management API token
 * 
 * @returns The Auth0 management API token
 */
async function getAuth0ManagementToken(): Promise<string | null> {
  try {
    const domain = process.env.AUTH0_DOMAIN?.replace('https://', '') || 'dev-mpzcm16p2rlf7j5l.us.auth0.com';
    const response = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${domain}/api/v2/`,
        grant_type: 'client_credentials',
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error getting Auth0 management token:', error);
      return null;
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Auth0 management token:', error);
    return null;
  }
}

/**
 * Create a new user in Auth0
 * 
 * @param token The Auth0 management API token
 * @param userData The user data to create
 * @returns The created Auth0 user
 */
async function createAuth0User(token: string, userData: any): Promise<any> {
  try {
    const domain = process.env.AUTH0_DOMAIN?.replace('https://', '') || 'dev-mpzcm16p2rlf7j5l.us.auth0.com';
    const response = await fetch(`https://${domain}/api/v2/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error creating Auth0 user:', error);
      throw new Error(error.message || 'Failed to create user in Auth0');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating Auth0 user:', error);
    throw error;
  }
}
