import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/messages?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId param' }, { status: 400 });
  }
  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { sentAt: 'desc' },
  });
  return NextResponse.json(messages);
}
