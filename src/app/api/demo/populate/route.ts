/**
 * API Route for Demo Data Population
 *
 * This route handles the creation of demo data for alpha testing.
 * It creates demo patients, assessments, and appointments for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';
import {
  createDemoPatients,
  createDemoAssessments,
  createDemoAppointments,
  userNeedsDemoData
} from '@/lib/demo/demo-service';

/**
 * POST: Create demo data for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if the user already has patients
    const needsDemoData = await userNeedsDemoData(userId);

    if (!needsDemoData) {
      return NextResponse.json(
        { message: 'User already has patients, demo data not created' },
        { status: 200 }
      );
    }

    // Get the user's clinic
    const userWithClinic = await prisma.user.findUnique({
      where: { id: userId },
      include: { clinic: true },
    });

    if (!userWithClinic) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If the user doesn't have a clinic, create a default one
    let clinicId = userWithClinic.clinic?.id;
    if (!clinicId) {
      const defaultClinic = await prisma.clinic.create({
        data: {
          name: 'Clínica Demo',
          address: 'Av. Principal 123, Ciudad',
          city: 'Santiago',
          state: 'RM',
          zipCode: '7500000',
          country: 'Chile',
          contactPhone: '+56912345678',
          contactEmail: 'contacto@clinicademo.com',
          website: 'https://clinicademo.com',
        },
      });
      clinicId = defaultClinic.id;

      // Update the user with the new clinic
      await prisma.user.update({
        where: { id: userId },
        data: { clinicId },
      });
    }

    // Create demo patients
    const demoPatients = await createDemoPatients(userId);

    // Create demo assessments and appointments for each patient
    const demoData = await Promise.all(
      demoPatients.map(async (patient: any) => {
        const assessments = await createDemoAssessments(patient.id, userId, clinicId!);
        const appointments = await createDemoAppointments(patient.id, userId);

        return {
          patient,
          assessments,
          appointments,
        };
      })
    );

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'demo_data_created',
      data: {
        userId,
        patientCount: demoPatients.length,
      },
    });

    // Return success response
    return NextResponse.json({
      message: 'Demo data created successfully',
      data: demoData,
    });
  } catch (error) {
    console.error('Error creating demo data:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_data_creation_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to create demo data' },
      { status: 500 }
    );
  }
}

/**
 * GET: Check if the authenticated user needs demo data
 */
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check if the user needs demo data
    const needsDemoData = await userNeedsDemoData(userId);

    // Return the result
    return NextResponse.json({
      needsDemoData,
    });
  } catch (error) {
    console.error('Error checking if user needs demo data:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'demo_data_check_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to check if user needs demo data' },
      { status: 500 }
    );
  }
}
