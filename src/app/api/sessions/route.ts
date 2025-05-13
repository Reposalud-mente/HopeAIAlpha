import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session-adapter';
import { authOptions } from '@/lib/auth/session-adapter';
import { logAuditEvent } from '@/lib/audit-log';
import { SessionService, SessionValidationError } from '@/lib/services/session-service';
import { ZodError } from 'zod';

// GET /api/sessions - List all sessions (with optional filtering/pagination)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    // Add filtering/pagination as needed
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Convert to TypeScript format with validation
    const { prismaSessionToTypescript } = await import('@/lib/validations/session');
    const validatedSessions = sessions.map(s => prismaSessionToTypescript(s));

    return NextResponse.json(validatedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation error in sessions data',
        details: error.format()
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch sessions', details: String(error) }, { status: 500 });
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Set clinicianId from the authenticated user if not provided
    if (!body.clinicianId) {
      body.clinicianId = session.user.id;
    }

    // Create session with validation
    const newSession = await SessionService.createSession(body);

    // Audit log: session creation
    await logAuditEvent({
      userId: session.user.id,
      action: 'CREATE',
      entityId: newSession.id,
      entityType: 'Session',
      details: { after: newSession },
      req: request,
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);

    if (error instanceof SessionValidationError) {
      return NextResponse.json({
        error: 'Session validation failed',
        details: error.errors
      }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Invalid session data',
        details: error.format()
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to create session',
      details: String(error)
    }, { status: 500 });
  }
}
