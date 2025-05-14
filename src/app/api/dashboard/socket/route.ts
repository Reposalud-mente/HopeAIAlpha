import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/supabase-auth';
import { emitDashboardUpdate as emitUpdate } from '../../socket/route';

// Re-export the emitDashboardUpdate function from the main socket route
export const emitDashboardUpdate = emitUpdate;

// GET handler for dashboard socket
export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    try {
      const userId = user.id;
      
      // Emit a dashboard update event
      emitDashboardUpdate(userId);
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error in dashboard socket route:', error);
      return NextResponse.json(
        { error: 'Failed to emit dashboard update' },
        { status: 500 }
      );
    }
  });
}
