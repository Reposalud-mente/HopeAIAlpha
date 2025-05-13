import { NextRequest, NextResponse } from 'next/server';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client
import { emitDashboardUpdate } from '../socket/route';
import { getUserIdFromAuth0, safelyGetUUID } from '@/lib/auth/user-utils';

// GET /api/dashboard/summary?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const auth0UserId = searchParams.get('userId');

  if (!auth0UserId) {
    return NextResponse.json({ error: 'Missing userId param' }, { status: 400 });
  }

  try {
    // Convert Auth0 user ID to database UUID
    const userId = await safelyGetUUID(auth0UserId);

    // If we couldn't get a valid UUID, return an error
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    // Get current date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current date at the end of the day
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Run all queries in parallel for better performance
    const [
      totalPatients,
      activePatients,
      totalAppointments,
      sessionsToday,
      totalMessages,
      unreadMessages,
      nextAppointment
    ] = await Promise.all([
      // Total patients - In Alpha schema, the relationship is primaryProviderId instead of createdById
      prismaAlpha.patient.count({
        where: { primaryProviderId: userId }
      }),

      // Active patients (with appointments in the last 30 days)
      prismaAlpha.patient.count({
        where: {
          primaryProviderId: userId,
          appointments: {
            some: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        }
      }),

      // Total appointments - In Alpha schema, the field is clinicianId instead of userId
      prismaAlpha.appointment.count({
        where: { clinicianId: userId }
      }),

      // Sessions today - In Alpha schema, the field is clinicianId instead of userId
      prismaAlpha.appointment.count({
        where: {
          clinicianId: userId,
          date: {
            gte: today,
            lte: endOfToday
          }
        }
      }),

      // Total messages - In Alpha schema, we'll use the same field
      prismaAlpha.message.count({
        where: { userId }
      }),

      // Unread messages - In Alpha schema, we'll use the same field
      prismaAlpha.message.count({
        where: {
          userId,
          read: false
        }
      }),

      // Next upcoming appointment - In Alpha schema, the field is clinicianId instead of userId
      prismaAlpha.appointment.findFirst({
        where: {
          clinicianId: userId,
          date: {
            gt: new Date() // Future appointments
          }
        },
        orderBy: {
          date: 'asc' // Earliest first
        },
        include: {
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    // Format the next appointment if it exists
    let formattedNextAppointment = null;
    if (nextAppointment) {
      formattedNextAppointment = {
        ...nextAppointment,
        patientName: `${nextAppointment.patient.firstName} ${nextAppointment.patient.lastName}`
      };
      // Remove the nested patient object to flatten the structure
      delete formattedNextAppointment.patient;
    }

    // Return comprehensive dashboard summary
    return NextResponse.json({
      totalPatients,
      activePatients,
      totalAppointments,
      sessionsToday,
      totalMessages,
      unreadMessages,
      nextAppointment: formattedNextAppointment
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
