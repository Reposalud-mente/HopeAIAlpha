import { NextRequest, NextResponse } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { withAuth } from '@/lib/auth/supabase-auth';

// Store the Socket.IO server instance globally
let io: SocketIOServer | null = null;

// Initialize Socket.IO server if it doesn't exist
function getSocketIO() {
  if (!io && typeof global.process === 'object') {
    // Create a new Socket.IO server
    io = new SocketIOServer({
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    // Store the Socket.IO server in the global object
    (global as any)._io = io;

    // Set up event handlers
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Handle subscription to user-specific events
      socket.on('subscribe', ({ userId }) => {
        if (userId) {
          socket.join(`user_${userId}`);
          console.log(`Socket ${socket.id} subscribed to user_${userId}`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    console.log('Socket.IO server initialized');
  }

  return io;
}

// GET handler for Socket.IO polling
export async function GET(req: NextRequest) {
  try {
    // Initialize Socket.IO server
    getSocketIO();

    // Return a success response
    return new NextResponse('Socket.IO server is running', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error in Socket.IO route:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Socket.IO server' },
      { status: 500 }
    );
  }
}

// POST handler for Socket.IO polling
export async function POST(req: NextRequest) {
  try {
    // Initialize Socket.IO server
    getSocketIO();

    // Return a success response
    return new NextResponse('Socket.IO server is running', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error in Socket.IO route:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Socket.IO server' },
      { status: 500 }
    );
  }
}

// Helper function to emit dashboard updates
export function emitDashboardUpdate(userId: string) {
  const socketServer = getSocketIO();
  if (socketServer) {
    socketServer.to(`user_${userId}`).emit('dashboard:update');
    console.log(`Emitted dashboard:update to user_${userId}`);
  }
}

// Helper function to emit appointment updates
export function emitAppointmentsUpdate(userId: string) {
  const socketServer = getSocketIO();
  if (socketServer) {
    socketServer.to(`user_${userId}`).emit('appointments:update');
    console.log(`Emitted appointments:update to user_${userId}`);
  }
}

// Helper function to emit patient updates
export function emitPatientsUpdate(userId: string) {
  const socketServer = getSocketIO();
  if (socketServer) {
    socketServer.to(`user_${userId}`).emit('patients:update');
    console.log(`Emitted patients:update to user_${userId}`);
  }
}

// Helper function to emit message updates
export function emitMessagesUpdate(userId: string) {
  const socketServer = getSocketIO();
  if (socketServer) {
    socketServer.to(`user_${userId}`).emit('messages:update');
    console.log(`Emitted messages:update to user_${userId}`);
  }
}
