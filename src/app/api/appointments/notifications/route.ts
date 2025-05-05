import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/appointments/notifications
// Retrieves upcoming appointments that need notifications
export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find appointments that are scheduled for the next 24 hours and haven't had reminders sent
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: now,
          lte: tomorrow,
        },
        reminderSent: false,
        status: 'SCHEDULED',
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(upcomingAppointments);
  } catch (error: any) {
    console.error('Error fetching notification appointments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/appointments/notifications
// Marks appointments as having had reminders sent
export async function POST(req: NextRequest) {
  try {
    const { appointmentIds } = await req.json();
    
    if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return NextResponse.json({ error: 'Invalid appointmentIds' }, { status: 400 });
    }

    // Update all the specified appointments to mark reminders as sent
    const result = await prisma.appointment.updateMany({
      where: {
        id: {
          in: appointmentIds,
        },
      },
      data: {
        reminderSent: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Successfully marked ${result.count} appointment(s) as notified`
    });
  } catch (error: any) {
    console.error('Error updating notification status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}