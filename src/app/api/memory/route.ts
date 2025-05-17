import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { logger } from '@/lib/logger';

/**
 * GET handler for retrieving memories
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
    
    // Get the mem0 service
    const mem0Service = getMem0Service();
    
    // Get all memories for the user
    const memories = await mem0Service.getAllMemories(userId);
    
    return NextResponse.json({ memories });
  } catch (error) {
    logger.error('Error retrieving memories', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve memories' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting memories
 * @param req The request object
 * @returns Response with success or error
 */
export async function DELETE(req: NextRequest) {
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
    
    // Get the memory ID from the request
    const { searchParams } = new URL(req.url);
    const memoryId = searchParams.get('id');
    
    // Get the mem0 service
    const mem0Service = getMem0Service();
    
    if (memoryId) {
      // Delete a specific memory
      await mem0Service.deleteMemory(memoryId, userId);
      return NextResponse.json({ success: true, message: 'Memory deleted successfully' });
    } else {
      // Delete all memories for the user
      await mem0Service.deleteAllMemories(userId);
      return NextResponse.json({ success: true, message: 'All memories deleted successfully' });
    }
  } catch (error) {
    logger.error('Error deleting memories', { error });
    return NextResponse.json(
      { error: 'Failed to delete memories' },
      { status: 500 }
    );
  }
}
