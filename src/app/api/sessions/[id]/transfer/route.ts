import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SessionService } from '@/lib/services/session-service';
import { ZodError } from 'zod';

// POST /api/sessions/[id]/transfer - Transfer session to another clinician/service
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
    const { targetClinicianId } = await request.json();

    if (!targetClinicianId) {
      return NextResponse.json({
        error: 'Missing required field',
        details: 'targetClinicianId is required'
      }, { status: 400 });
    }

    // Transfer session with validation
    const updated = await SessionService.transferSession(id, targetClinicianId);

    // TODO: Add notification logic here

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error transferring session:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.format()
      }, { status: 400 });
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to transfer session',
      details: String(error)
    }, { status: 500 });
  }
}
