import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';

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
    
    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const passwordHash = await hash(body.password, 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'PSYCHOLOGIST', // Default role for new registrations
        licenseNumber: body.licenseNumber,
        specialty: body.specialty,
        clinicId: null, // New users don't have a clinic by default
        isActive: true,
      },
    });
    
    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'user_registered',
      data: {
        userId: user.id,
      },
    });
    
    // Return success response (without sensitive data)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'user_registration_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    
    // Return error response
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
