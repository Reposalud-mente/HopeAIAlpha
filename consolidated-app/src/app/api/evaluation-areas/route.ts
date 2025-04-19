import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const areas = await prisma.evaluationArea.findMany({ where: { isActive: true } });
  return NextResponse.json(areas);
}
