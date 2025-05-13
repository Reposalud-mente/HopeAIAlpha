import { NextRequest, NextResponse } from 'next/server';
import prismaAlpha from '@/lib/prisma-alpha'; // Use the Alpha Prisma client
import { safelyGetUUID } from '@/lib/auth/user-utils';

// GET /api/messages?userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const auth0UserId = searchParams.get('userId');
  if (!auth0UserId) {
    return NextResponse.json({ error: 'Missing userId param' }, { status: 400 });
  }

  try {
    // Convert Auth0 user ID to database UUID
    const userId = await safelyGetUUID(auth0UserId);

    // If we couldn't get a valid UUID, return an error
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

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
}
