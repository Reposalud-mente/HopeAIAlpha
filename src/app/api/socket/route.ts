import { Server as NetServer } from 'http';
import { NextRequest } from 'next/server';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '@/lib/prisma';

// Store for active socket connections
let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
  // This is a WebSocket route, not a REST API route
  // We need to handle the WebSocket connection
  // Using status 200 instead of 101 (Switching Protocols) as Next.js Response only supports 200-599
  const res = new Response(null, {
    status: 200,
  });

  // Get the raw HTTP server from the response
  const httpServer = res.socket?.server as unknown as NetServer;

  // Initialize Socket.IO server if it doesn't exist
  if (!io) {
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      // Handle subscription to user-specific updates
      socket.on('subscribe', ({ userId }) => {
        if (userId) {
          // Join a room specific to this user
          socket.join(`user:${userId}`);
          console.log(`User ${userId} subscribed to updates`);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });

    // Set up database change listeners (this is a simplified example)
    // In a real implementation, you would use database triggers or a message queue
    // to notify the socket server of changes

    // For demonstration purposes, we'll set up a simple interval to simulate updates
    setInterval(() => {
      // Emit updates to all connected clients
      io?.emit('dashboard:update');
    }, 60000); // Every minute
  }

  return res;
}

// Helper function to emit updates to specific users or broadcast to all
export function emitDashboardUpdate(userId?: string) {
  if (!io) return;

  if (userId) {
    // Emit to a specific user
    io.to(`user:${userId}`).emit('dashboard:update');
  } else {
    // Broadcast to all users
    io.emit('dashboard:update');
  }
}

export function emitAppointmentsUpdate(userId?: string) {
  if (!io) return;

  if (userId) {
    io.to(`user:${userId}`).emit('appointments:update');
  } else {
    io.emit('appointments:update');
  }
}

export function emitPatientsUpdate(userId?: string) {
  if (!io) return;

  if (userId) {
    io.to(`user:${userId}`).emit('patients:update');
  } else {
    io.emit('patients:update');
  }
}

export function emitMessagesUpdate(userId?: string) {
  if (!io) return;

  if (userId) {
    io.to(`user:${userId}`).emit('messages:update');
  } else {
    io.emit('messages:update');
  }
}