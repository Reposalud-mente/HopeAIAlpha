import { NextRequest, NextResponse } from 'next/server';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client

// Add cache revalidation to prevent frequent recompilations
export const revalidate = 3600; // Revalidate every hour

// Simple in-memory cache
let cachedAppointments: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

// GET /api/appointments/notifications
// Retrieves upcoming appointments that need notifications
export async function GET(req: NextRequest) {
  try {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (cachedAppointments.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
      console.log('Returning cached appointments data');
      return NextResponse.json(cachedAppointments);
    }

    console.log('Fetching fresh appointments data');
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find appointments that are scheduled for the next 24 hours and haven't had reminders sent
    // In Alpha schema, the relationship is clinician instead of user
    const upcomingAppointments = await prismaAlpha.appointment.findMany({
      where: {
        date: {
          gte: currentDate,
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
        clinician: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update cache
    cachedAppointments = upcomingAppointments;
    lastFetchTime = now;

    // Set cache control headers in the response
    const response = NextResponse.json(upcomingAppointments);
    response.headers.set('Cache-Control', 'max-age=300, s-maxage=300'); // 5 minutes cache

    return response;
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

    // Update all the specified appointments to mark reminders as sent using the Alpha schema
    const result = await prismaAlpha.appointment.updateMany({
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