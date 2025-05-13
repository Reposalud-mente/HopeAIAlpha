import { NextRequest, NextResponse } from 'next/server';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client
import { safelyGetUUID } from '@/lib/auth/user-utils';

// GET /api/appointments?userId=...&start=...&end=...&view=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const auth0UserId = searchParams.get('userId');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  const view = searchParams.get('view') || 'month'; // day, week, month
  const patientId = searchParams.get('patientId');

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

    // Build the query for the Alpha schema
    // In the Alpha schema, the field is clinicianId instead of userId
    const query: any = { clinicianId: userId };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Add patient filter if provided
    if (patientId) {
      query.patientId = patientId;
    }

    // Fetch appointments with patient details using the Alpha schema
    const appointments = await prismaAlpha.appointment.findMany({
      where: query,
      orderBy: { date: 'asc' },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Calculate endTime if not provided
    if (!data.endTime && data.date && data.duration) {
      const startDate = new Date(data.date);
      const endTime = new Date(startDate.getTime() + data.duration * 60000);
      data.endTime = endTime;
    }

    // Handle recurring appointments
    if (data.isRecurring && data.recurrencePattern && data.recurrenceEndDate) {
      // Create the parent appointment first using the Alpha schema
      const parentAppointment = await prismaAlpha.appointment.create({
        data: {
          patientId: data.patientId,
          clinicianId: data.userId, // In Alpha schema, it's clinicianId instead of userId
          title: data.title || 'Consulta',
          date: new Date(data.date),
          endTime: new Date(data.endTime),
          duration: data.duration || 60,
          status: data.status || 'SCHEDULED',
          notes: data.notes,
          location: data.location,
          isRecurring: true,
          recurrencePattern: data.recurrencePattern,
          recurrenceEndDate: new Date(data.recurrenceEndDate),
          // These fields might not exist in the Alpha schema
          // notificationPreference: data.notificationPreference,
          // colorCode: data.colorCode,
        },
      });

      // Generate recurring appointments
      const recurringAppointments = generateRecurringAppointments(
        parentAppointment,
        data.recurrencePattern,
        new Date(data.recurrenceEndDate)
      );

      // Create all recurring appointments using the Alpha schema
      if (recurringAppointments.length > 0) {
        await prismaAlpha.appointment.createMany({
          data: recurringAppointments,
        });
      }

      return NextResponse.json(parentAppointment, { status: 201 });
    } else {
      // Create a single appointment using the Alpha schema
      const appointment = await prismaAlpha.appointment.create({
        data: {
          patientId: data.patientId,
          clinicianId: data.userId, // In Alpha schema, it's clinicianId instead of userId
          title: data.title || 'Consulta',
          date: new Date(data.date),
          endTime: new Date(data.endTime),
          duration: data.duration || 60,
          status: data.status || 'SCHEDULED',
          notes: data.notes,
          location: data.location,
          isRecurring: false,
          // These fields might not exist in the Alpha schema
          // notificationPreference: data.notificationPreference,
          // colorCode: data.colorCode,
        },
      });

      return NextResponse.json(appointment, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/appointments/:id
export async function PUT(req: NextRequest) {
  try {
    const id = req.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    const data = await req.json();
    const { updateSeries, ...appointmentData } = data;

    // Calculate endTime if not provided
    if (!appointmentData.endTime && appointmentData.date && appointmentData.duration) {
      const startDate = new Date(appointmentData.date);
      const endTime = new Date(startDate.getTime() + appointmentData.duration * 60000);
      appointmentData.endTime = endTime;
    }

    // Convert date strings to Date objects
    if (appointmentData.date) appointmentData.date = new Date(appointmentData.date);
    if (appointmentData.endTime) appointmentData.endTime = new Date(appointmentData.endTime);
    if (appointmentData.recurrenceEndDate) appointmentData.recurrenceEndDate = new Date(appointmentData.recurrenceEndDate);

    // Get the current appointment using the Alpha schema
    // In Alpha schema, the relationship might be called childAppointments instead of recurringAppointments
    const currentAppointment = await prismaAlpha.appointment.findUnique({
      where: { id },
      include: { childAppointments: true }
    });

    if (!currentAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update the appointment using the Alpha schema
    const appointment = await prismaAlpha.appointment.update({
      where: { id },
      data: appointmentData,
    });

    // If this is a recurring appointment and we need to update the series
    if (updateSeries && currentAppointment.isRecurring) {
      // If this is a parent appointment, update all children
      if (!currentAppointment.parentAppointmentId) {
        // Update all future recurring appointments using the Alpha schema
        await prismaAlpha.appointment.updateMany({
          where: {
            parentAppointmentId: id,
            date: { gte: new Date() }
          },
          data: {
            title: appointmentData.title,
            duration: appointmentData.duration,
            status: appointmentData.status,
            notes: appointmentData.notes,
            location: appointmentData.location,
            // These fields might not exist in the Alpha schema
            // notificationPreference: appointmentData.notificationPreference,
            // colorCode: appointmentData.colorCode,
          }
        });
      }
      // If this is a child appointment, update it and detach from parent
      else {
        await prismaAlpha.appointment.update({
          where: { id },
          data: {
            parentAppointmentId: null,
            isRecurring: false,
          }
        });
      }
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/appointments/:id
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const deleteSeries = url.searchParams.get('deleteSeries') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Missing appointment ID' }, { status: 400 });
    }

    // Get the appointment to check if it's part of a series using the Alpha schema
    const appointment = await prismaAlpha.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // If it's a recurring appointment and we want to delete the series
    if (deleteSeries && appointment.isRecurring && !appointment.parentAppointmentId) {
      // Delete all child appointments first using the Alpha schema
      await prismaAlpha.appointment.deleteMany({
        where: { parentAppointmentId: id },
      });
    } else if (deleteSeries && appointment.parentAppointmentId) {
      // If it's a child appointment and we want to delete future occurrences using the Alpha schema
      await prismaAlpha.appointment.deleteMany({
        where: {
          parentAppointmentId: appointment.parentAppointmentId,
          date: { gte: appointment.date },
        },
      });
    }

    // Delete the appointment itself using the Alpha schema
    await prismaAlpha.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to generate recurring appointments
function generateRecurringAppointments(
  parentAppointment: any,
  recurrencePattern: string,
  recurrenceEndDate: Date
) {
  const recurringAppointments = [];
  const startDate = new Date(parentAppointment.date);
  const endDate = new Date(recurrenceEndDate);
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + 7); // Start with next week for weekly

  while (currentDate <= endDate) {
    // Create a new appointment for this date
    recurringAppointments.push({
      patientId: parentAppointment.patientId,
      userId: parentAppointment.userId,
      title: parentAppointment.title,
      date: new Date(currentDate),
      endTime: new Date(currentDate.getTime() + parentAppointment.duration * 60000),
      duration: parentAppointment.duration,
      status: 'SCHEDULED',
      notes: parentAppointment.notes,
      location: parentAppointment.location,
      isRecurring: true,
      recurrencePattern: parentAppointment.recurrencePattern,
      parentAppointmentId: parentAppointment.id,
      notificationPreference: parentAppointment.notificationPreference,
      colorCode: parentAppointment.colorCode,
    });

    // Increment the date based on recurrence pattern
    if (recurrencePattern === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurrencePattern === 'biweekly') {
      currentDate.setDate(currentDate.getDate() + 14);
    } else if (recurrencePattern === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return recurringAppointments;
}
