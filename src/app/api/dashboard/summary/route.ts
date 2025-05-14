import { NextRequest, NextResponse } from 'next/server';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client
import { emitDashboardUpdate } from '../socket/route';
import { withAuth } from '@/lib/auth/supabase-auth';
import { Prisma } from '@prisma/client';

// GET /api/dashboard/summary
export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      // Use the Supabase user ID directly - it's already a UUID
      const userId = user.id;

      console.log('Dashboard summary requested for user:', userId);
      // Get current date at the start of the day
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get current date at the end of the day
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // Initialize metrics with default values
      let totalPatients = 0;
      let activePatients = 0;
      let totalAppointments = 0;
      let sessionsToday = 0;
      let totalMessages = 0;
      let unreadMessages = 0;
      let nextAppointment = null;

      // Fetch patient metrics
      try {
        [totalPatients, activePatients] = await Promise.all([
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
          })
        ]);
      } catch (error) {
        console.error('Error fetching patient metrics:', error);
        // Continue with default values
      }

      // Fetch appointment metrics
      try {
        [totalAppointments, sessionsToday, nextAppointment] = await Promise.all([
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
      } catch (error) {
        console.error('Error fetching appointment metrics:', error);
        // Continue with default values
      }

      // Fetch message metrics - Using direct SQL query to handle case where message table might not exist
      try {
        // First check if the messages table exists
        const tableExists = await prismaAlpha.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'hopeai_alpha'
            AND table_name = 'messages'
          );
        `;

        const exists = (tableExists as any)[0]?.exists || false;

        if (exists) {
          // Use direct SQL queries to avoid Prisma model issues
          const messageCountResult = await prismaAlpha.$queryRaw`
            SELECT
              COUNT(*) as total_messages,
              COUNT(*) FILTER (WHERE read = false) as unread_messages
            FROM hopeai_alpha.messages
            WHERE user_id = ${userId}::uuid;
          `;

          if (messageCountResult && Array.isArray(messageCountResult) && messageCountResult.length > 0) {
            totalMessages = parseInt(messageCountResult[0].total_messages) || 0;
            unreadMessages = parseInt(messageCountResult[0].unread_messages) || 0;
          }
        } else {
          console.log('Messages table does not exist in the schema, using default values');
          // Use default values (0) for message metrics
        }
      } catch (error) {
        console.error('Error fetching message metrics:', error);
        // Continue with default values
      }

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
  });
}
