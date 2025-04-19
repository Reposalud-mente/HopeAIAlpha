import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

// POST /api/sessions/[id]/ai-suggestions - Submit or retrieve AI suggestions
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { aiSuggestions } = await request.json();
    // TODO: Add provenance, validation, and audit trail logic
    const updated = await prisma.session.update({
      where: { id },
      data: { aiSuggestions },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update AI suggestions', details: error }, { status: 500 });
  }
}
