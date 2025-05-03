/**
 * API route for the RAG-based Clinical Report Generator
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { ClinicalReportAgent } from '@/lib/RagAI';
// Import monitoring if available
let trackEvent: any;
let EventType: any;
try {
  const monitoring = require('@/lib/monitoring');
  trackEvent = monitoring.trackEvent;
  EventType = monitoring.EventType;
} catch (error) {
  // Fallback if monitoring is not available
  trackEvent = () => {};
  EventType = { USER_ACTION: 'USER_ACTION', ERROR: 'ERROR' };
}

/**
 * POST: Generate a clinical report using the RAG workflow
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
    if (!body.wizardData) {
      return NextResponse.json(
        { error: 'Missing required field: wizardData' },
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

    // Initialize the clinical report agent
    const reportAgent = new ClinicalReportAgent({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      driveFolderId: process.env.NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID || '',
      driveApiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || '',
    });

    // Generate the report
    console.log('Generating RAG report with the following options:', options);
    const result = await reportAgent.generateReport(body.wizardData, options);

    // Log DSM-5 usage
    if (result.metadata?.usingDSM5) {
      console.log('Report generated using DSM-5 content');
      if (result.metadata?.dsm5FileDetails) {
        console.log('DSM-5 file details:', result.metadata.dsm5FileDetails);
      }
    } else {
      console.log('Report generated without DSM-5 content');
    }

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'rag_report_generated',
      data: {
        userId: session.user.id,
        reportType: body.wizardData.reportType,
        success: true,
        metadata: result.metadata,
      },
    });

    // Return the result
    return NextResponse.json({
      success: true,
      reportText: result.reportText,
      metadata: result.metadata,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating RAG report:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'rag_report_generation_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
