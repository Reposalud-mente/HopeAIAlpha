import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitDashboardUpdate } from '../socket/route';

// GET /api/dashboard/summary?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId param' }, { status: 400 });
  }
  
  try {
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
      // Total patients
      prisma.patient.count({ 
        where: { createdById: userId } 
      }),
      
      // Active patients (with appointments in the last 30 days)
      prisma.patient.count({
        where: {
          createdById: userId,
          appointments: {
            some: {
              date: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        }
      }),
      
      // Total appointments
      prisma.appointment.count({ 
        where: { userId } 
      }),
      
      // Sessions today
      prisma.appointment.count({
        where: {
          userId,
          date: {
            gte: today,
            lte: endOfToday
          }
        }
      }),
      
      // Total messages
      prisma.message.count({ 
        where: { userId } 
      }),
      
      // Unread messages
      prisma.message.count({
        where: {
          userId,
          read: false
        }
      }),
      
      // Next upcoming appointment
      prisma.appointment.findFirst({
        where: {
          userId,
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
