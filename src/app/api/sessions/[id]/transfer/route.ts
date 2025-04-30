import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SessionService } from '@/lib/services/session-service';
import { ZodError } from 'zod';

// POST /api/sessions/[id]/transfer - Transfer session to another clinician/service
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { targetClinicianId } = await request.json();

    if (!targetClinicianId) {
      return NextResponse.json({
        error: 'Missing required field',
        details: 'targetClinicianId is required'
      }, { status: 400 });
    }

    // Transfer session with validation
    const updated = await SessionService.transferSession(id, targetClinicianId);

    // TODO: Add notification logic here

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error transferring session:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.format()
      }, { status: 400 });
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to transfer session',
      details: String(error)
    }, { status: 500 });
  }
}
