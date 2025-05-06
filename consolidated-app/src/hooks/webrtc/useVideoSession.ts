/**
 * useVideoSession Hook
 * 
 * This hook provides a simplified interface for managing WebRTC video sessions.
 * It connects to the WebRTC context and provides session-specific functionality.
 * 
 * HIPAA Compliance:
 * - All connections are secured and encrypted
 * - Session data is properly managed
 * - Connection quality is monitored for telehealth reliability
 */

import { useState, useEffect, useCallback } from 'react';
import { useWebRTC } from '@/contexts/webrtc-context';
import { ConnectionQuality } from '@/lib/webrtc/webrtc-service';

/**
 * Video session options
 */
interface VideoSessionOptions {
  sessionId?: string;
  appointmentId?: string;
  role: 'PATIENT' | 'THERAPIST';
}

/**
 * Video session hook return type
 */
interface UseVideoSessionReturn {
  // State
  isLoading: boolean;
  error: Error | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | null;
  connectionQuality: ConnectionQuality | null;
  isConnected: boolean;
  isVideoMuted: boolean;
  isAudioMuted: boolean;
  isScreenSharing: boolean;
  sessionDetails: any | null;
  hasConsent: boolean;
  
  // Methods
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenSharing: () => Promise<void>;
  stopScreenSharing: () => Promise<void>;
  recordConsent: (consent: boolean) => Promise<void>;
  completeSession: (notes?: string) => Promise<boolean>;
}

/**
 * Hook for managing video sessions
 */
export function useVideoSession({
  sessionId,
  appointmentId,
  role
}: VideoSessionOptions): UseVideoSessionReturn {
  // Get WebRTC context
  const webrtc = useWebRTC();
  
  // Local state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any | null>(null);
  const [actualSessionId, setActualSessionId] = useState<string | null>(null);
  
  /**
   * Initialize the session
   */
  useEffect(() => {
    let isMounted = true;
    
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If we have an appointment ID but no session ID, we need to get the session ID
        if (appointmentId && !sessionId) {
          // Import dynamically to avoid server-side import issues
          const { ClinicalIntegration } = await import('@/lib/webrtc/clinical-integration');
          
          // Get session details by appointment
          const details = await ClinicalIntegration.getSessionDetailsByAppointment(appointmentId);
          
          if (isMounted) {
            setSessionDetails(details);
            setActualSessionId(details.session.id);
          }
        } else if (sessionId) {
          // Import dynamically to avoid server-side import issues
          const { ClinicalIntegration } = await import('@/lib/webrtc/clinical-integration');
          
          // Get session details
          const details = await ClinicalIntegration.getSessionDetails(sessionId);
          
          if (isMounted) {
            setSessionDetails(details);
            setActualSessionId(sessionId);
          }
        } else {
          throw new Error('Either sessionId or appointmentId must be provided');
        }
        
        // Check if patient has given consent
        if (role === 'PATIENT' && actualSessionId) {
          // Import dynamically to avoid server-side import issues
          const { ClinicalIntegration } = await import('@/lib/webrtc/clinical-integration');
          
          // Check consent
          const hasConsent = await ClinicalIntegration.checkConsent(
            actualSessionId,
            webrtc.sessionDetails?.patient.id
          );
          
          if (isMounted && hasConsent) {
            // Initialize WebRTC service
            await webrtc.initializeService(actualSessionId, role);
          }
        } else if (actualSessionId) {
          // Initialize WebRTC service for therapist
          await webrtc.initializeService(actualSessionId, role);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Failed to initialize session');
          setError(error);
          console.error('Error initializing video session:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    initialize();
    
    return () => {
      isMounted = false;
    };
  }, [sessionId, appointmentId, role, webrtc, actualSessionId]);
  
  /**
   * Join the session
   */
  const joinSession = useCallback(async (): Promise<void> => {
    try {
      await webrtc.joinSession();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join session');
      setError(error);
      throw error;
    }
  }, [webrtc]);
  
  /**
   * Leave the session
   */
  const leaveSession = useCallback(async (): Promise<void> => {
    try {
      await webrtc.leaveSession();
    } catch (err) {
      console.error('Error leaving session:', err);
      throw err;
    }
  }, [webrtc]);
  
  /**
   * Record patient consent
   */
  const recordConsent = useCallback(async (consent: boolean): Promise<void> => {
    try {
      await webrtc.recordConsent(consent);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to record consent');
      setError(error);
      throw error;
    }
  }, [webrtc]);
  
  /**
   * Complete the session with notes
   */
  const completeSession = useCallback(async (notes?: string): Promise<boolean> => {
    try {
      return await webrtc.completeSession(notes);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to complete session');
      setError(error);
      throw error;
    }
  }, [webrtc]);
  
  // Return the hook interface
  return {
    isLoading,
    error,
    localStream: webrtc.localStream,
    remoteStream: webrtc.remoteStream,
    connectionState: webrtc.connectionState,
    connectionQuality: webrtc.connectionQuality,
    isConnected: webrtc.isConnected,
    isVideoMuted: webrtc.isVideoMuted,
    isAudioMuted: webrtc.isAudioMuted,
    isScreenSharing: webrtc.isScreenSharing,
    sessionDetails,
    hasConsent: webrtc.hasConsent,
    joinSession,
    leaveSession,
    toggleVideo: webrtc.toggleVideo,
    toggleAudio: webrtc.toggleAudio,
    startScreenSharing: webrtc.startScreenSharing,
    stopScreenSharing: webrtc.stopScreenSharing,
    recordConsent,
    completeSession
  };
}