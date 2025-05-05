'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebRTCService } from '@/lib/webrtc/webrtc-service';
import { ConnectionMonitor } from '@/lib/webrtc/connection-monitor';
import { WebRTCConfig, ConnectionQuality } from '@/lib/webrtc/types';
import { useAuth } from '@/contexts/auth-context';

interface WebRTCContextType {
  webrtcService: WebRTCService | null;
  connectionMonitor: ConnectionMonitor | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | null;
  connectionQuality: ConnectionQuality | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  isVideoMuted: boolean;
  isAudioMuted: boolean;
  isScreenSharing: boolean;
  joinSession: (sessionId: string, role: 'THERAPIST' | 'PATIENT') => Promise<void>;
  leaveSession: () => Promise<void>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenSharing: () => Promise<boolean>;
  stopScreenSharing: () => Promise<boolean>;
  sendMessage: (message: string) => void;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

interface WebRTCProviderProps {
  children: ReactNode;
  config: WebRTCConfig;
}

export function WebRTCProvider({ children, config }: WebRTCProviderProps) {
  const { user } = useAuth();
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null);
  const [connectionMonitor, setConnectionMonitor] = useState<ConnectionMonitor | null>(null);
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Join a WebRTC session
  const joinSession = async (sessionId: string, role: 'THERAPIST' | 'PATIENT') => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Create WebRTC service
      const service = new WebRTCService(config, sessionId, user.id, role);
      setWebrtcService(service);
      
      // Initialize local media
      const stream = await service.initializeLocalMedia();
      setLocalStream(stream);
      
      // Set up event listeners
      service.on('localStream', (stream: MediaStream) => {
        setLocalStream(stream);
      });
      
      service.on('remoteStream', (stream: MediaStream) => {
        setRemoteStream(stream);
      });
      
      service.on('connectionStateChange', (state: RTCPeerConnectionState) => {
        setConnectionState(state);
        setIsConnected(state === 'connected');
      });
      
      service.on('error', (err: Error) => {
        setError(err);
      });
      
      service.on('videoToggled', (muted: boolean) => {
        setIsVideoMuted(muted);
      });
      
      service.on('audioToggled', (muted: boolean) => {
        setIsAudioMuted(muted);
      });
      
      service.on('screenSharingStarted', () => {
        setIsScreenSharing(true);
      });
      
      service.on('screenSharingStopped', () => {
        setIsScreenSharing(false);
      });
      
      // Create peer connection
      await service.createPeerConnection();
      
      // Set up connection monitor
      if (service['peerConnection']) {
        const monitor = new ConnectionMonitor(service['peerConnection'], service);
        setConnectionMonitor(monitor);
        
        monitor.startMonitoring();
        
        // Listen for connection quality updates
        service.on('connectionQualityUpdate', (quality: ConnectionQuality) => {
          setConnectionQuality(quality);
        });
      }
      
      // Join the session
      await service.joinSession();
      setCurrentSessionId(sessionId);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Leave a WebRTC session
  const leaveSession = async () => {
    if (webrtcService) {
      await webrtcService.leaveSession();
    }
    
    if (connectionMonitor) {
      connectionMonitor.stopMonitoring();
    }
    
    setWebrtcService(null);
    setConnectionMonitor(null);
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState(null);
    setConnectionQuality(null);
    setIsConnected(false);
    setCurrentSessionId(null);
  };
  
  // Toggle video mute state
  const toggleVideo = () => {
    if (webrtcService) {
      webrtcService.toggleVideo();
    }
  };
  
  // Toggle audio mute state
  const toggleAudio = () => {
    if (webrtcService) {
      webrtcService.toggleAudio();
    }
  };
  
  // Start screen sharing
  const startScreenSharing = async () => {
    if (webrtcService) {
      return await webrtcService.startScreenSharing();
    }
    return false;
  };
  
  // Stop screen sharing
  const stopScreenSharing = async () => {
    if (webrtcService) {
      return await webrtcService.stopScreenSharing();
    }
    return false;
  };
  
  // Send a message through the data channel
  const sendMessage = (message: string) => {
    if (webrtcService && webrtcService['dataChannel']) {
      webrtcService['dataChannel'].send(message);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (webrtcService) {
        webrtcService.leaveSession();
      }
      
      if (connectionMonitor) {
        connectionMonitor.stopMonitoring();
      }
    };
  }, []);
  
  return (
    <WebRTCContext.Provider
      value={{
        webrtcService,
        connectionMonitor,
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
        joinSession,
        leaveSession,
        toggleVideo,
        toggleAudio,
        startScreenSharing,
        stopScreenSharing,
        sendMessage,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
}

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};