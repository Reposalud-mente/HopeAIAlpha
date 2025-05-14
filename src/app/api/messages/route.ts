import { NextRequest, NextResponse } from 'next/server';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client
import { safelyGetUUID } from '@/lib/auth/user-utils';
import { withAuth } from '@/lib/auth/supabase-auth';

// GET /api/messages?userId=...
export async function GET(req: NextRequest) {
  return withAuth(req, async (user) => {
    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get('userId');

    // If no userId is specified, use the authenticated user's ID
    const userId = requestedUserId ? await safelyGetUUID(requestedUserId) : user.id;

    // If we couldn't get a valid UUID, return an error
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    try {
      // In the Alpha schema, the relationship might be different
      // We need to adapt to the Alpha schema structure
      const messages = await prismaAlpha.message.findMany({
        where: {
          userId: userId
        },
        orderBy: { sentAt: 'desc' },
      });
      return NextResponse.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }
  });
}
