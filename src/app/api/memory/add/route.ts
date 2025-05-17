import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { logger } from '@/lib/logger';

/**
 * POST handler for adding memories
 * @param req The request object
 * @returns Response with success or error
 */
export async function POST(req: NextRequest) {
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

    // Get the request body
    const body = await req.json();

    // Validate the request body
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of messages.' },
        { status: 400 }
      );
    }

    // Get the mem0 service
    const mem0Service = getMem0Service();

    try {
      // Add the conversation to mem0
      const result = await mem0Service.addConversation(body.messages, userId);

      // Check if the operation was successful
      if (result.success === false) {
        logger.warn('Failed to add conversation to memory', { userId, result });
        return NextResponse.json({
          success: false,
          message: 'Failed to add conversation to memory',
          result
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Conversation added to memory successfully',
        result
      });
    } catch (error) {
      logger.error('Error adding conversation to memory from service', { error, userId });
      return NextResponse.json({
        success: false,
        message: 'Error adding conversation to memory',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error adding conversation to memory', { error });
    return NextResponse.json(
      { error: 'Failed to add conversation to memory' },
      { status: 500 }
    );
  }
}
