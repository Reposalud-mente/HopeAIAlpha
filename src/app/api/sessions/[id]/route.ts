import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session-adapter';
import { authOptions } from '@/lib/auth/session-adapter';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit-log';
import { SessionService, SessionValidationError } from '@/lib/services/session-service';
import { ZodError } from 'zod';

// GET /api/sessions/[id] - Get session details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;

    // Get session with validation
    const sessionData = await SessionService.getSession(id);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error fetching session:', error);

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Validation error in session data',
        details: error.format()
      }, { status: 400 });
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to fetch session',
      details: String(error)
    }, { status: 500 });
  }
}

// PUT /api/sessions/[id] - Update session data
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    // Fetch current state for audit
    const before = await prisma.session.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session with validation
    const updated = await SessionService.updateSession(id, body);

    // Audit log: session update
    await logAuditEvent({
      userId: session.user.id,
      action: 'UPDATE',
      entityId: id,
      entityType: 'Session',
      details: { before, after: updated },
      req: request,
    });

    // Emit real-time update event via Socket.IO
    if ((globalThis as any)._io) {
      (globalThis as any)._io.to(`session_${id}`).emit('session_updated', updated);
      (globalThis as any)._io.emit('session_updated', updated);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating session:', error);

    if (error instanceof SessionValidationError) {
      return NextResponse.json({
        error: 'Session validation failed',
        details: error.errors
      }, { status: 400 });
    }

    if (error instanceof ZodError) {
      return NextResponse.json({
        error: 'Invalid session data',
        details: error.format()
      }, { status: 400 });
    }

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to update session',
      details: String(error)
    }, { status: 500 });
  }
}

// DELETE /api/sessions/[id] - Delete session
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;

    // Fetch current state for audit
    const before = await prisma.session.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Delete session
    await SessionService.deleteSession(id);

    // Audit log: session delete
    await logAuditEvent({
      userId: session.user.id,
      action: 'DELETE',
      entityId: id,
      entityType: 'Session',
      details: { before },
      req: request,
    });

    // Emit real-time delete event via Socket.IO
    if ((globalThis as any)._io) {
      (globalThis as any)._io.to(`session_${id}`).emit('session_deleted', { id });
      (globalThis as any)._io.emit('session_deleted', { id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);

    if (error.message?.includes('not found')) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to delete session',
      details: String(error)
    }, { status: 500 });
  }
}
