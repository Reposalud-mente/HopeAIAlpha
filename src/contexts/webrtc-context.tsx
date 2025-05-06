'use client'

/**
 * WebRTC Context
 * 
 * This context provides global state and methods for WebRTC functionality.
 * It manages connection state, media streams, and provides an API for components to use.
 * 
 * HIPAA Compliance:
 * - All connections are secured and encrypted
 * - No PHI is stored in the context
 * - Connection state is monitored for telehealth reliability
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCService, ConnectionQuality } from '@/lib/webrtc/webrtc-service';
import { useSession } from 'next-auth/react';

// Default ICE servers configuration
const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

// WebRTC context state interface
export interface WebRTCContextState {
  // Service instance
  webrtcService: WebRTCService | null;
  
  // Media streams
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  
  // Connection state
  connectionState: RTCPeerConnectionState | null;
  connectionQuality: ConnectionQuality | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  
  // Media state
  isVideoMuted: boolean;
  isAudioMuted: boolean;
  isScreenSharing: boolean;
  
  // Session state
  sessionId: string | null;
  sessionDetails: any | null;
  hasConsent: boolean;
  
  // Methods
  initializeService: (sessionId: string, role: 'PATIENT' | 'THERAPIST') => Promise<WebRTCService>;
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenSharing: () => Promise<void>;
  stopScreenSharing: () => Promise<void>;
  recordConsent: (consent: boolean) => Promise<void>;
  completeSession: (notes?: string) => Promise<boolean>;
}

// Create context with default values
const WebRTCContext = createContext<WebRTCContextState>({
  webrtcService: null,
  localStream: null,
  remoteStream: null,
  connectionState: null,
  connectionQuality: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  isVideoMuted: false,
  isAudioMuted: false,
  isScreenSharing: false,
  sessionId: null,
  sessionDetails: null,
  hasConsent: false,
  initializeService: async () => { throw new Error('Not implemented'); },
  joinSession: async () => { throw new Error('Not implemented'); },
  leaveSession: async () => { throw new Error('Not implemented'); },
  toggleVideo: () => {},
  toggleAudio: () => {},
  startScreenSharing: async () => { throw new Error('Not implemented'); },
  stopScreenSharing: async () => { throw new Error('Not implemented'); },
  recordConsent: async () => { throw new Error('Not implemented'); },
  completeSession: async () => false
});

/**
 * WebRTC Context Provider Props
 */
interface WebRTCProviderProps {
  children: React.ReactNode;
  iceServers?: RTCIceServer[];
}

/**
 * WebRTC Context Provider
 */
export function WebRTCProvider({ 
  children,
  iceServers = DEFAULT_ICE_SERVERS
}: WebRTCProviderProps) {
  // Auth session
  const { data: session } = useSession();
  
  // Service reference
  const serviceRef = useRef<WebRTCService | null>(null);
  
  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | null>(null);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  
  /**
   * Initialize WebRTC service
   */
  const initializeService = useCallback(async (
    sessionId: string, 
    role: 'PATIENT' | 'THERAPIST'
  ): Promise<WebRTCService> => {
    try {
      // Clear any previous state
      if (serviceRef.current) {
        await leaveSession();
      }
      
      setError(null);
      setSessionId(sessionId);
      
      // Check if user is authenticated
      if (!session || !session.user) {
        throw new Error('User not authenticated');
      }
      
      // Create WebRTC service
      const service = new WebRTCService(
        { iceServers },
        sessionId,
        session.user.id as string,
        role
      );
      
      // Store service reference
      serviceRef.current = service;
      
      // Set up event listeners
      service.on('localStream', (stream) => {
        setLocalStream(stream);
      });
      
      service.on('remoteStream', (stream) => {
        setRemoteStream(stream);
      });
      
      service.on('connectionStateChange', (state) => {
        setConnectionState(state);
        
        if (state === 'connected') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setIsConnected(false);
        }
      });
      
      service.on('connectionQualityChange', (quality) => {
        setConnectionQuality(quality);
      });
      
      service.on('error', (err) => {
        setError(err);
        setIsConnecting(false);
      });
      
      service.on('audioToggled', (muted) => {
        setIsAudioMuted(muted);
      });
      
      service.on('videoToggled', (muted) => {
        setIsVideoMuted(muted);
      });
      
      service.on('screenSharingStarted', () => {
        setIsScreenSharing(true);
      });
      
      service.on('screenSharingStopped', () => {
        setIsScreenSharing(false);
      });
      
      // Connect to signaling server
      await service.connectSignaling(session.accessToken as string);
      
      return service;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize WebRTC service');
      setError(error);
      throw error;
    }
  }, [session, iceServers]);
  
  /**
   * Join a WebRTC session
   */
  const joinSession = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) {
      throw new Error('WebRTC service not initialized');
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Join the session
      await serviceRef.current.joinSession();
      
      setIsConnected(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join session');
      setError(error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);
  
  /**
   * Leave a WebRTC session
   */
  const leaveSession = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return;
    
    try {
      // Leave the session
      await serviceRef.current.leaveSession();
      
      // Reset state
      setIsConnected(false);
      setLocalStream(null);
      setRemoteStream(null);
      setConnectionState(null);
      setConnectionQuality(null);
      
      // Disconnect service
      serviceRef.current.disconnect();
      serviceRef.current = null;
    } catch (err) {
      console.error('Error leaving session:', err);
    }
  }, []);
  
  /**
   * Toggle video mute state
   */
  const toggleVideo = useCallback((): void => {
    if (!serviceRef.current) return;
    
    try {
      const newState = serviceRef.current.toggleVideo();
      setIsVideoMuted(newState);
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  }, []);
  
  /**
   * Toggle audio mute state
   */
  const toggleAudio = useCallback((): void => {
    if (!serviceRef.current) return;
    
    try {
      const newState = serviceRef.current.toggleAudio();
      setIsAudioMuted(newState);
    } catch (err) {
      console.error('Error toggling audio:', err);
    }
  }, []);
  
  /**
   * Start screen sharing
   */
  const startScreenSharing = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return;
    
    try {
      await serviceRef.current.startScreenSharing();
      setIsScreenSharing(true);
    } catch (err) {
      console.error('Error starting screen sharing:', err);
      throw err;
    }
  }, []);
  
  /**
   * Stop screen sharing
   */
  const stopScreenSharing = useCallback(async (): Promise<void> => {
    if (!serviceRef.current) return;
    
    try {
      await serviceRef.current.stopScreenSharing();
      setIsScreenSharing(false);
    } catch (err) {
      console.error('Error stopping screen sharing:', err);
      throw err;
    }
  }, []);
  
  /**
   * Record patient consent
   */
  const recordConsent = useCallback(async (consent: boolean): Promise<void> => {
    if (!sessionId || !session?.user?.id) {
      throw new Error('Session or user ID not available');
    }
    
    try {
      // Import dynamically to avoid server-side import issues
      const { ClinicalIntegration } = await import('@/lib/webrtc/clinical-integration');
      
      // Record consent
      await ClinicalIntegration.recordConsent(
        sessionId,
        session.user.id,
        consent
      );
      
      // Update state
      setHasConsent(consent);
    } catch (err) {
      console.error('Error recording consent:', err);
      throw err;
    }
  }, [sessionId, session?.user?.id]);
  
  /**
   * Complete a session with notes
   */
  const completeSession = useCallback(async (notes?: string): Promise<boolean> => {
    if (!sessionId) {
      throw new Error('Session ID not available');
    }
    
    try {
      // Import dynamically to avoid server-side import issues
      const { ClinicalIntegration } = await import('@/lib/webrtc/clinical-integration');
      
      // Complete the session
      return await ClinicalIntegration.completeSession(
        sessionId,
        notes || ''
      );
    } catch (err) {
      console.error('Error completing session:', err);
      throw err;
    }
  }, [sessionId]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
    };
  }, []);
  
  // Context value
  const value: WebRTCContextState = {
    webrtcService: serviceRef.current,
    localStream,
    remoteStream,
    connectionState,
    connectionQuality,
    isConnecting,
    isConnected,
    error,
    isVideoMuted,
    isAudioMuted,
    isScreenSharing,
    sessionId,
    sessionDetails,
    hasConsent,
    initializeService,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    startScreenSharing,
    stopScreenSharing,
    recordConsent,
    completeSession
  };
  
  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
}

/**
 * Hook to use the WebRTC context
 */
export function useWebRTC(): WebRTCContextState {
  const context = useContext(WebRTCContext);
  
  if (context === undefined) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  
  return context;
}