import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/supabase-auth';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';

// GET /api/patients/[id]/sessions - List sessions for a specific patient
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get the authenticated user using Supabase
    const user = await getAuthenticatedUser();

    // Check if the user is authenticated
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Directly query sessions for the patient using Prisma
    const sessions = await prisma.session.findMany({
      where: {
        patientId: id,
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        clinician: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

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
