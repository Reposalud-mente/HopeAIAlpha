import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// POST /api/sessions/[id]/ai-suggestions - Submit or retrieve AI suggestions
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Get the current user session using Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // Check if the user is authenticated
  if (authError || !user) {
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
