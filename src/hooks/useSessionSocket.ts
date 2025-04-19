import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Type for session event payloads
type SessionPayload = Record<string, any>;

type UseSessionSocketProps = {
  sessionId: string;
  onUpdate?: (data: SessionPayload) => void;
  onDelete?: (data: { id: string }) => void;
};

/**
 * React hook for subscribing to real-time session updates via Socket.IO
 */
export function useSessionSocket({ sessionId, onUpdate, onDelete }: UseSessionSocketProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;

    // Join the session room
    socket.emit('join_session', sessionId);

    // Listen for session updates
    if (onUpdate) {
      socket.on('session_updated', (data) => {
        if (data.id === sessionId) onUpdate(data);
      });
    }
    if (onDelete) {
      socket.on('session_deleted', (data) => {
        if (data.id === sessionId) onDelete(data);
      });
    }

    // Cleanup on unmount
    return () => {
      socket.emit('leave_session', sessionId);
      socket.disconnect();
    };
    // Only re-run if sessionId changes
  }, [sessionId, onUpdate, onDelete]);

  return socketRef;
}
