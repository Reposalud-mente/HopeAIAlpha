import { NextRequest, NextResponse } from 'next/server';
import { signJwtAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { trackEvent, EventType } from '@/lib/monitoring';

// Demo account credentials - stored server-side
const DEMO_EMAIL = 'psicologo@hopeai.com';
const DEMO_PASSWORD = 'password123';

export async function POST(request: NextRequest) {
  try {
    // Find the demo user
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL }
    });

    if (!user) {
      trackEvent({
        type: EventType.ERROR,
        name: 'demo_login_error',
        data: {
          error: 'Demo user not found',
        },
      });
      
      return NextResponse.json(
        { error: 'Demo account not available' },
        { status: 404 }
      );
    }

    // Verify the demo password
    const isPasswordValid = await compare(DEMO_PASSWORD, user.passwordHash);

    if (!isPasswordValid) {
      trackEvent({
        type: EventType.ERROR,
        name: 'demo_login_error',
        data: {
          error: 'Demo password invalid',
        },
      });
      
      return NextResponse.json(
        { error: 'Demo account not available' },
        { status: 401 }
      );
    }

    // Create a token for the demo user
    const token = signJwtAccessToken({
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isDemoUser: true // Flag to indicate this is a demo user
    });

    // Track the demo login event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'demo_login',
      data: {
        userId: user.id,
      },
    });

    // Return the token and user info
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        isDemoUser: true
      }
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