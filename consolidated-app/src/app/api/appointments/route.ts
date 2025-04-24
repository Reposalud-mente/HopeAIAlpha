import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/appointments?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId param' }, { status: 400 });
  }
  const appointments = await prisma.appointment.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(appointments);
}
