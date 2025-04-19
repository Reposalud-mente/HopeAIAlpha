// Custom Next.js + Socket.IO server
const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Setup Socket.IO
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO connection handler
  io.on('connection', (socket) => {
    // Authenticate here if needed
    console.log('Socket connected:', socket.id);

    // Example: join session room
    socket.on('join_session', (sessionId) => {
      socket.join(`session_${sessionId}`);
    });

    // Example: leave session room
    socket.on('leave_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);
    });

    // For extensibility: listen for custom events here
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  // Attach io to global for access in API routes (not SSR-safe, but works for event emission)
  global._io = io;

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
