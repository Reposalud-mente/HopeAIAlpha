import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
