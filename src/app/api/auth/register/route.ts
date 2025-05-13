import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, EventType } from '@/lib/monitoring';
import { auth0 } from '@/lib/auth/auth0';
import { syncAuth0UserWithDatabase } from '@/lib/auth/auth0-server';
import { prisma } from '@/lib/prisma';

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

    // Check if a user with the same email already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Use Auth0's signup endpoint directly
    let domain = process.env.AUTH0_DOMAIN || 'https://dev-mpzcm16p2rlf7j5l.us.auth0.com';
    const clientId = process.env.AUTH0_CLIENT_ID || 'eCqnJzF5AxmFNR69b2deKZRCDasfreIJ';
    
    // Ensure domain has https:// prefix
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = `https://${domain}`;
    }

    console.log('Registering user with Auth0:', {
      domain,
      clientId,
      email: body.email,
      name: `${body.firstName} ${body.lastName}`,
    });

    // Create the user in Auth0 using the signup endpoint
    const signupResponse = await fetch(`${domain}/dbconnections/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        email: body.email,
        password: body.password,
        connection: 'Username-Password-Authentication',
        name: `${body.firstName} ${body.lastName}`,
      }),
    });

    if (!signupResponse.ok) {
      let errorData;
      try {
        errorData = await signupResponse.json();
      } catch (e) {
        errorData = { error: 'Unknown error', error_description: 'Failed to parse error response' };
      }

      console.error('Error creating user in Auth0:', errorData);

      // Handle specific Auth0 errors
      if (errorData.code === 'user_exists') {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: errorData.error_description || errorData.description || 'Failed to create user in Auth0' },
        { status: signupResponse.status }
      );
    }

    const auth0User = await signupResponse.json();

    // Create the user in our database
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        passwordHash: '', // Not needed with Auth0
        role: 'PSYCHOLOGIST', // Default role for new registrations
        licenseNumber: body.licenseNumber,
        specialty: body.specialty,
        isActive: true,
      },
    });

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'user_registered_via_auth0',
      data: {
        userId: user.id,
        email: body.email,
      },
    });

    // Return success response
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
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
