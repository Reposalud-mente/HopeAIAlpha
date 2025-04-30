import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SessionService } from '@/lib/services/session-service';
import { ZodError } from 'zod';

// GET /api/patients/[id]/sessions - List sessions for a specific patient
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;

    // Get sessions for patient with validation
    const sessions = await SessionService.getPatientSessions(id);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching patient sessions:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation error in sessions data',
        details: error.format()
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to fetch sessions for patient',
      details: String(error)
    }, { status: 500 });
  }
}
