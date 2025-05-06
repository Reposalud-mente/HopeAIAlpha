import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { 
  scheduleSession, 
  createReminder, 
  searchPatients, 
  generateReport 
} from '@/lib/ai-assistant/admin-tools';

/**
 * API route for executing AI assistant tools
 * This route handles the execution of administrative tasks requested by the AI assistant
 */
export async function POST(req: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
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
}
