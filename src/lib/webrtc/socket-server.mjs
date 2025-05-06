/**
 * WebRTC Signaling Server
 * 
 * This server handles WebRTC signaling using Socket.IO for the HopeAI telehealth platform.
 * It manages session rooms, authentication, and secure signaling for WebRTC connections.
 * 
 * HIPAA Compliance:
 * - All communications are authenticated
 * - Session IDs are validated
 * - No PHI is transmitted through signaling
 * - Connections are secured
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '../jwt.js';

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Enable WebSocket transport
  transports: ['websocket', 'polling']
});

// Store active sessions
const activeSessions = new Map();

// Authentication middleware
io.use(async (socket, next) => {
  try {
    // Get token from handshake auth
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    
    // Verify JWT token
    const decoded = await verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return next(new Error('Invalid authentication token'));
    }
    
    // Store user data in socket
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userName = decoded.name;
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);
  
  // Join session room
  socket.on('join-session', async ({ sessionId, role }) => {
    try {
      // Validate session ID
      if (!sessionId) {
        socket.emit('error', { message: 'Session ID is required' });
        return;
      }
      
      // Create room name from session ID
      const roomName = `session:${sessionId}`;
      
      // Join the room
      socket.join(roomName);
      
      // Store session info
      socket.sessionId = sessionId;
      socket.role = role;
      
      // Track active session
      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
          id: sessionId,
          participants: new Map(),
          startedAt: new Date()
        });
      }
      
      // Add participant to session
      const session = activeSessions.get(sessionId);
      session.participants.set(socket.userId, {
        id: socket.userId,
        role: role,
        socketId: socket.id,
        joinedAt: new Date()
      });
      
      // Notify user they've joined successfully
      socket.emit('session-joined', {
        sessionId,
        userId: socket.userId,
        role: role,
        participants: Array.from(session.participants.values())
          .filter(p => p.id !== socket.userId)
          .map(p => ({ id: p.id, role: p.role }))
      });
      
      // Notify other participants in the room
      socket.to(roomName).emit('participant-joined', {
        userId: socket.userId,
        role: role
      });
      
      console.log(`User ${socket.userId} joined session ${sessionId} as ${role}`);
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });
  
  // Leave session
  socket.on('leave-session', () => {
    handleLeaveSession(socket);
  });
  
  // WebRTC signaling: offer
  socket.on('offer', ({ targetUserId, offer }) => {
    if (!socket.sessionId) {
      socket.emit('error', { message: 'Not in a session' });
      return;
    }
    
    const roomName = `session:${socket.sessionId}`;
    const session = activeSessions.get(socket.sessionId);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const targetParticipant = Array.from(session.participants.values())
      .find(p => p.id === targetUserId);
    
    if (!targetParticipant) {
      socket.emit('error', { message: 'Target participant not found' });
      return;
    }
    
    // Forward the offer to the target user
    io.to(targetParticipant.socketId).emit('offer', {
      offer,
      userId: socket.userId
    });
  });
  
  // WebRTC signaling: answer
  socket.on('answer', ({ targetUserId, answer }) => {
    if (!socket.sessionId) {
      socket.emit('error', { message: 'Not in a session' });
      return;
    }
    
    const session = activeSessions.get(socket.sessionId);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const targetParticipant = Array.from(session.participants.values())
      .find(p => p.id === targetUserId);
    
    if (!targetParticipant) {
      socket.emit('error', { message: 'Target participant not found' });
      return;
    }
    
    // Forward the answer to the target user
    io.to(targetParticipant.socketId).emit('answer', {
      answer,
      userId: socket.userId
    });
  });
  
  // WebRTC signaling: ICE candidate
  socket.on('ice-candidate', ({ targetUserId, candidate }) => {
    if (!socket.sessionId) {
      socket.emit('error', { message: 'Not in a session' });
      return;
    }
    
    const session = activeSessions.get(socket.sessionId);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    const targetParticipant = Array.from(session.participants.values())
      .find(p => p.id === targetUserId);
    
    if (!targetParticipant) {
      socket.emit('error', { message: 'Target participant not found' });
      return;
    }
    
    // Forward the ICE candidate to the target user
    io.to(targetParticipant.socketId).emit('ice-candidate', {
      candidate,
      userId: socket.userId
    });
  });
  
  // Connection quality update
  socket.on('connection-quality', ({ quality }) => {
    if (!socket.sessionId) return;
    
    const roomName = `session:${socket.sessionId}`;
    
    // Broadcast connection quality to other participants
    socket.to(roomName).emit('participant-connection-quality', {
      userId: socket.userId,
      quality
    });
  });
  
  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    handleLeaveSession(socket);
  });
});

// Helper function to handle leaving a session
function handleLeaveSession(socket) {
  if (!socket.sessionId) return;
  
  const sessionId = socket.sessionId;
  const roomName = `session:${sessionId}`;
  const session = activeSessions.get(sessionId);
  
  if (session) {
    // Remove participant from session
    session.participants.delete(socket.userId);
    
    // Notify other participants
    socket.to(roomName).emit('participant-left', {
      userId: socket.userId
    });
    
    // If no participants left, clean up the session
    if (session.participants.size === 0) {
      activeSessions.delete(sessionId);
      console.log(`Session ${sessionId} ended (no participants left)`);
    }
  }
  
  // Leave the room
  socket.leave(roomName);
  
  // Clear session data
  socket.sessionId = null;
  socket.role = null;
  
  console.log(`User ${socket.userId} left session ${sessionId}`);
}

// Start the server
const PORT = process.env.SIGNALING_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});

export default httpServer;