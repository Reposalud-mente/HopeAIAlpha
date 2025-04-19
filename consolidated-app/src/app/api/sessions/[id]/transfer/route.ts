import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

// POST /api/sessions/[id]/transfer - Transfer session to another clinician/service
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { targetClinicianId } = await request.json();
    // TODO: Add business logic for transfer validation and notifications
    const updated = await prisma.session.update({
      where: { id },
      data: { clinicianId: targetClinicianId, status: 'transferred' },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to transfer session', details: error }, { status: 500 });
  }
}
