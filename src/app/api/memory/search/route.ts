import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { logger } from '@/lib/logger';

/**
 * GET handler for searching memories
 * @param req The request object
 * @returns Response with memories or error
 */
export async function GET(req: NextRequest) {
  try {
    // Get the user session from Supabase
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user ID from the session
    const userId = session.user.id || session.user.email;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }
    
    // Get the query from the request
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    // Get the mem0 service
    const mem0Service = getMem0Service();
    
    // Search for memories
    const memories = await mem0Service.searchMemories(query, userId);
    
    return NextResponse.json({ memories });
  } catch (error) {
    logger.error('Error searching memories', { error });
    return NextResponse.json(
      { error: 'Failed to search memories' },
      { status: 500 }
    );
  }
}
