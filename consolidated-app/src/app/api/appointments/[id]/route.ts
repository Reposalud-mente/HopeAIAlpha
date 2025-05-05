import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/appointments/:id
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            contactPhone: true,
            contactEmail: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recurringAppointments: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
          take: 5,
        },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/appointments/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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

    // Get the current appointment
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { recurringAppointments: true }
    });

    if (!currentAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Update the appointment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: appointmentData,
    });

    // If this is a recurring appointment and we need to update the series
    if (updateSeries && currentAppointment.isRecurring) {
      // If this is a parent appointment, update all children
      if (!currentAppointment.parentAppointmentId) {
        // Update all future recurring appointments
        await prisma.appointment.updateMany({
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
            notificationPreference: appointmentData.notificationPreference,
            colorCode: appointmentData.colorCode,
          }
        });
      } 
      // If this is a child appointment, update it and detach from parent
      else {
        await prisma.appointment.update({
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(req.url);
    const deleteSeries = searchParams.get('deleteSeries') === 'true';

    // Get the appointment to check if it's part of a series
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // If it's a recurring appointment and we want to delete the series
    if (deleteSeries && appointment.isRecurring && !appointment.parentAppointmentId) {
      // Delete all child appointments first
      await prisma.appointment.deleteMany({
        where: { parentAppointmentId: id },
      });
    } else if (deleteSeries && appointment.parentAppointmentId) {
      // If it's a child appointment and we want to delete future occurrences
      await prisma.appointment.deleteMany({
        where: {
          parentAppointmentId: appointment.parentAppointmentId,
          date: { gte: appointment.date },
        },
      });
    }

    // Delete the appointment itself
    await prisma.appointment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}