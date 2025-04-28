import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit-log';
import { SessionStatus } from '@prisma/client';

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
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions', details: error }, { status: 500 });
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
    const newSession = await prisma.session.create({
      data: {
        patientId: body.patientId,
        clinicianId: body.clinicianId,
        type: body.type,
        objectives: body.objectives,
        notes: body.notes,
        activities: body.activities,
        status: body.status,
        attachments: body.attachments,
        aiSuggestions: body.aiSuggestions,
      },
    });
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
    return NextResponse.json({ error: 'Failed to create session', details: error }, { status: 500 });
  }
}
