import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { AIReportAgent, ReportGenerationRequest } from '@/lib/ai-report-generator/ai-report-agent';
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
    
    // Create the report generation request
    const reportRequest: ReportGenerationRequest = {
      assessmentId: body.assessmentId,
      userId: session.user.id,
      language: body.language || 'es',
      includeRecommendations: body.includeRecommendations !== false, // Default to true
      includeTreatmentPlan: body.includeTreatmentPlan !== false, // Default to true
      reportStyle: body.reportStyle || 'clinical',
    };
    
    // Initialize the AI report agent
    const aiReportAgent = new AIReportAgent();
    
    // Generate the report
    const result = await aiReportAgent.generateReport(reportRequest);
    
    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: result.success ? 'report_generated' : 'report_generation_failed',
      data: {
        userId: session.user.id,
        assessmentId: body.assessmentId,
        success: result.success,
        error: result.error,
      },
    });
    
    // Return the result
    if (result.success) {
      return NextResponse.json({
        success: true,
        reportId: result.reportId,
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
