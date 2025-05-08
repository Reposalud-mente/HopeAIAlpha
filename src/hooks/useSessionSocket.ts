import { useEffect, useRef } from 'react';

// Type for session event payloads
type SessionPayload = Record<string, any>;

type UseSessionSocketProps = {
  sessionId: string;
  onUpdate?: (data: SessionPayload) => void;
  onDelete?: (data: { id: string }) => void;
};

/**
 * React hook for subscribing to real-time session updates
 * Note: WebSocket implementation has been removed
 */
export function useSessionSocket({ sessionId, onUpdate, onDelete }: UseSessionSocketProps) {
  const socketRef = useRef<any | null>(null);

  useEffect(() => {
    // WebSocket implementation has been removed
    console.warn('WebSocket functionality has been removed');
    
    // Return empty cleanup function
    return () => {};
  }, [sessionId, onUpdate, onDelete]);

  return socketRef;
}