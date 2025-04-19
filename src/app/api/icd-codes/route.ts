import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const codes = await prisma.iCDCriteria.findMany({ where: { isActive: true } });
  return NextResponse.json(codes);
}
