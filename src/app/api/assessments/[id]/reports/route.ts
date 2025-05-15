import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/supabase-auth';
import { prisma } from '@/lib/prisma';
import { trackEvent, EventType } from '@/lib/monitoring';

/**
 * GET: List all reports for an assessment
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const nextRequest = new NextRequest(request);
  return withAuth(nextRequest, async (user) => {
    try {
      // Get the assessment ID from the URL
      const { id: assessmentId } = await params;

      // Get query parameters
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');
      const includeLatestOnly = searchParams.get('latest') === 'true';
      const includeFinalOnly = searchParams.get('final') === 'true';

      // Build the query
      const query: any = {
        assessmentId,
      };

      if (includeFinalOnly) {
        query.isFinal = true;
      }

      // Get the reports
      let reports;

      if (includeLatestOnly) {
        // Get only the latest report (highest version)
        reports = await prisma.report.findMany({
          where: query,
          orderBy: {
            version: 'desc',
          },
          take: 1,
          include: {
            clinician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      } else {
        // Get all reports with pagination
        reports = await prisma.report.findMany({
          where: query,
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
          include: {
            clinician: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
      }

      // Get the total count
      const total = await prisma.report.count({
        where: query,
      });

      // Track the event
      trackEvent({
        type: EventType.USER_ACTION,
        name: 'assessment_reports_viewed',
        data: {
          userId: user.id,
          assessmentId,
          count: reports.length,
        },
      });

      // Return the reports
      return NextResponse.json({
        items: reports,
        total,
        limit: includeLatestOnly ? 1 : limit,
        offset: includeLatestOnly ? 0 : offset,
      });
    } catch (error) {
      console.error('Error fetching assessment reports:', error);

      // Track the error
      trackEvent({
        type: EventType.ERROR,
        name: 'assessment_reports_error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Return error response
      return NextResponse.json(
        { error: 'Failed to fetch assessment reports' },
        { status: 500 }
      );
    }
  });
}

/**
 * POST: Create a new report for an assessment
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const nextRequest = new NextRequest(request);
  return withAuth(nextRequest, async (user) => {
    try {
      // Get the assessment ID from the URL
      const { id: assessmentId } = await params;

      // Parse the request body
      const body = await request.json();

      // Validate required fields
      if (!body.reportText) {
        return NextResponse.json(
          { error: 'Missing required field: reportText' },
          { status: 400 }
        );
      }

      // Check if the assessment exists
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        return NextResponse.json(
          { error: 'Assessment not found' },
          { status: 404 }
        );
      }

      // Create the report
      const report = await prisma.report.create({
        data: {
          assessmentId,
          reportText: body.reportText,
          clinicianId: user.id, // Use clinicianId instead of createdById
          version: 1,
          isFinal: body.isFinal || false,
          filename: body.filename,
          title: body.title || 'Psychological Assessment Report',
          patientId: assessment.patientId, // Include patientId from the assessment
        },
      });

      // Track the event
      trackEvent({
        type: EventType.USER_ACTION,
        name: 'report_created',
        data: {
          userId: user.id,
          assessmentId,
          reportId: report.id,
        },
      });

      // Return the created report
      return NextResponse.json(report, { status: 201 });
    } catch (error) {
      console.error('Error creating report:', error);

      // Track the error
      trackEvent({
        type: EventType.ERROR,
        name: 'report_create_error',
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Return error response
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }
  });
}
