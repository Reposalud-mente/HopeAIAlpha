import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/summary?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId param' }, { status: 400 });
  }
  // Example summary: counts
  const [patients, appointments, messages] = await Promise.all([
    prisma.patient.count({ where: { createdById: userId } }),
    prisma.appointment.count({ where: { userId } }),
    prisma.message.count({ where: { userId } }),
  ]);
  return NextResponse.json({
    patients,
    appointments,
    messages,
  });
}
