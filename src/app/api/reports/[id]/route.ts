import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/supabase-auth';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';

/**
 * GET: Retrieve a single report by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      // Get the report ID from the URL
      const { id } = await params;

    // Get the report with related data
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        assessment: {
          include: {
            patient: true,
            clinician: true,
            clinic: true,
            consultationReasons: true,
            evaluationAreas: {
              include: {
                area: true,
              },
            },
            icdCriteria: {
              include: {
                criteria: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Check if the report exists
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'report_viewed',
      data: {
        userId: user.id,
        reportId: report.id,
      },
    });

    // Return the report
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'report_view_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
  });
}

/**
 * PUT: Update a report
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (user) => {
    try {
      // Get the report ID from the URL
      const { id } = await params;

    // Parse the request body
    const body = await request.json();

    // Check if the report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: {
        assessment: true,
      },
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to update this report
    // (either they are the clinician who created it or they are a supervisor/admin)
    if (
      existingReport.clinicianId !== user.id &&
      !['SUPERVISOR', 'ADMIN'].includes(user.app_metadata?.role || '')
    ) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to update this report' },
        { status: 403 }
      );
    }

    // Prepare the update data
    const updateData: any = {};

    // Only update fields that are provided
    if (body.reportText !== undefined) {
      updateData.reportText = body.reportText;
    }

    if (body.isFinal !== undefined) {
      updateData.isFinal = body.isFinal;
    }

    if (body.filename !== undefined) {
      updateData.filename = body.filename;
    }

    // If there are updates, increment the version
    if (Object.keys(updateData).length > 0) {
      updateData.version = existingReport.version + 1;
      updateData.updatedAt = new Date();
    } else {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Update the report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
    });

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'report_updated',
      data: {
        userId: user.id,
        reportId: updatedReport.id,
        isFinal: updatedReport.isFinal,
      },
    });

    // Return the updated report
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error updating report:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'report_update_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
  });
}
