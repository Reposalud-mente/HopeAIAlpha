import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/supabase-auth';
import {
  scheduleSession,
  createReminder,
  generateReport
} from '@/lib/ai-assistant/admin-tools';
import { searchPatients } from '@/lib/ai-assistant/supabase-admin-tools';

/**
 * API route for executing AI assistant tools
 * This route handles the execution of administrative tasks requested by the AI assistant
 */
export async function POST(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      // Get the user ID from Supabase auth
      const userId = user.id;

      // Parse the request body
      const body = await req.json();
      const { functionName, args } = body;

      if (!functionName || !args) {
        return NextResponse.json(
          { error: 'Missing required parameters' },
          { status: 400 }
        );
      }

      // Execute the requested function
      let result;

      switch (functionName) {
        case 'schedule_session':
          result = await scheduleSession(args, userId);
          break;

        case 'create_reminder':
          result = await createReminder(args, userId);
          break;

        case 'search_patients':
        case 'list_patients':
          // Handle both search_patients and list_patients with the same function
          // For list_patients with no query, set an empty query to list all patients
          if (functionName === 'list_patients' && (!args.query || args.query.trim() === '')) {
            args.query = '*';
          }
          result = await searchPatients(args, userId);
          break;

        case 'generate_report':
          result = await generateReport(args, userId);
          break;

        default:
          return NextResponse.json(
            { error: `Unknown function: ${functionName}` },
            { status: 400 }
          );
      }

      // Format the result for better display in the tool calling visualizer
      if ((functionName === 'search_patients' || functionName === 'list_patients') && result.success && result.patients) {
        // Enhance the result with additional metadata for better visualization
        const enhancedResult = {
          ...result,
          _meta: {
            functionName,
            timestamp: new Date().toISOString(),
            resultType: 'patient_search',
            query: args.query || ''
          }
        };
        return NextResponse.json(enhancedResult);
      }

      // Return the result
      return NextResponse.json(result);

    } catch (error) {
      console.error('Error executing AI tool:', error);

      return NextResponse.json(
        {
          error: 'Failed to execute tool',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  });
}
