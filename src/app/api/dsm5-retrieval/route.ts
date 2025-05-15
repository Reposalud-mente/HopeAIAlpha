/**
 * API route for DSM-5 retrieval
 * This is a server-side only route to ensure PDF parsing works correctly
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DSM5Retriever } from '@/lib/RagAI/retrieval';
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
 * POST: Retrieve DSM-5 content based on a query
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

    // Parse the request body
    const body = await request.json();

    // Validate required fields
    if (!body.query) {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 }
      );
    }

    // Initialize the DSM-5 retriever
    const retriever = new DSM5Retriever(
      process.env.NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID || '',
      process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || '',
      process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' // Pass the Gemini API key for embeddings
    );

    // Retrieve DSM-5 content
    const results = await retriever.retrieve(body.query, {
      maxResults: body.maxResults || 5,
      minRelevanceScore: body.minRelevanceScore || 0.7,
    });

    // Track the event
    trackEvent({
      type: EventType.USER_ACTION,
      name: 'dsm5_retrieval',
      data: {
        userId: user.id,
        query: body.query,
        success: true,
        resultCount: results.length,
      },
    });

    // Return the results
    return NextResponse.json({
      success: true,
      results,
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving DSM-5 content:', error);

    // Track the error
    trackEvent({
      type: EventType.ERROR,
      name: 'dsm5_retrieval_error',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    // Return error response
    return NextResponse.json(
      { error: 'Failed to retrieve DSM-5 content', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
