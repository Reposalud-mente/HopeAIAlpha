import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

// GET /api/patients/[id]/sessions - List sessions for a specific patient
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const sessions = await prisma.session.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        clinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions for patient', details: error }, { status: 500 });
  }
}
