import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit-log';
import { SessionStatus } from '@prisma/client';

// GET /api/sessions/[id] - Get session details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const found = await prisma.session.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!found) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    return NextResponse.json(found);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch session', details: error }, { status: 500 });
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
    const updated = await prisma.session.update({
      where: { id },
      data: body,
    });
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
    // TypeScript: global._io is not typed; use (globalThis as any)._io for now
    if ((globalThis as any)._io) {
      (globalThis as any)._io.to(`session_${id}`).emit('session_updated', updated);
      (globalThis as any)._io.emit('session_updated', updated);
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session', details: error }, { status: 500 });
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
    await prisma.session.delete({ where: { id } });
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
    // TypeScript: global._io is not typed; use (globalThis as any)._io for now
    if ((globalThis as any)._io) {
      (globalThis as any)._io.to(`session_${id}`).emit('session_deleted', { id });
      (globalThis as any)._io.emit('session_deleted', { id });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session', details: error }, { status: 500 });
  }
}
