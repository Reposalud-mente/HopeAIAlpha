import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ReportGeneratorService } from '@/lib/ai-report-generator/report-generator-service';
import { trackEvent, EventType } from '@/lib/monitoring';

/**
 * POST: Generate a new psychological report using the AI agent
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.assessmentId) {
      return NextResponse.json(
        { error: 'Missing required field: assessmentId' },
        { status: 400 }
      );
    }

    // Create the options for report generation
    const options = {
      language: body.language || 'es',
      includeRecommendations: body.includeRecommendations !== false, // Default to true
      includeTreatmentPlan: body.includeTreatmentPlan !== false, // Default to true
      reportStyle: body.reportStyle || 'clinical',
    };

    // Initialize the report generator service
    const reportGeneratorService = new ReportGeneratorService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

    // Generate the report
    const result = await reportGeneratorService.generateReport(body.assessmentId, options);

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'reportText' in result ? 'report_generated' : 'report_generation_failed',
      data: {
        userId: session.user.id,
        assessmentId: body.assessmentId,
        success: 'reportText' in result,
        error: 'error' in result ? result.error : undefined,
      },
    });

    // Return the result
    if ('reportText' in result) {
      return NextResponse.json({
        success: true,
        reportText: result.reportText,
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'report_generation_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
