/**
 * Memory Backup API Endpoint
 * Provides endpoints for backing up and restoring memories
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';
import { logger } from '@/lib/logger';

/**
 * GET handler for backing up memories
 * @param req The request object
 * @returns Response with memories backup or error
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

    try {
      // Get all memories for the user
      const memories = await mem0Service.getAllMemories(userId);

      // Set the response headers for a downloadable file
      const headers = new Headers();
      headers.set('Content-Disposition', 'attachment; filename=memories-backup.json');
      headers.set('Content-Type', 'application/json');

      // Return the memories as a downloadable JSON file
      return new NextResponse(JSON.stringify({ memories, timestamp: new Date().toISOString() }, null, 2), {
        headers,
        status: 200
      });
    } catch (error) {
      logger.error('Error backing up memories', { error, userId });
      return NextResponse.json(
        { error: 'Failed to backup memories' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error in memory backup endpoint', { error });
    return NextResponse.json(
      { error: 'Failed to process backup request' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for restoring memories from a backup
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
    if (!body.memories || !Array.isArray(body.memories)) {
      return NextResponse.json(
        { error: 'Invalid backup format. Expected an array of memories.' },
        { status: 400 }
      );
    }

    // Get the mem0 service
    const mem0Service = getMem0Service();

    try {
      // First, delete all existing memories
      await mem0Service.deleteAllMemories(userId);

      // Then, restore memories from the backup
      let successCount = 0;
      let errorCount = 0;

      for (const memory of body.memories) {
        try {
          await mem0Service.addMemory(memory.memory, userId, memory.metadata || {});
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error('Error restoring memory', { error, memory });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Restored ${successCount} memories successfully. ${errorCount} memories failed to restore.`,
        successCount,
        errorCount
      });
    } catch (error) {
      logger.error('Error restoring memories', { error, userId });
      return NextResponse.json(
        { error: 'Failed to restore memories' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error in memory restore endpoint', { error });
    return NextResponse.json(
      { error: 'Failed to process restore request' },
      { status: 500 }
    );
  }
}
