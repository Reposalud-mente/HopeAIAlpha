'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoSession } from '@/hooks/webrtc/useVideoSession';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Mic, MicOff, Video, VideoOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PatientVideoInterfaceProps {
  sessionId?: string;
  appointmentId?: string;
}

export function PatientVideoInterface({ 
  sessionId, 
  appointmentId 
}: PatientVideoInterfaceProps) {
  const router = useRouter();
  const [isInWaitingRoom, setIsInWaitingRoom] = useState<boolean>(true);
  const [devicesTested, setDevicesTested] = useState<boolean>(false);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{ audio: boolean, video: boolean } | null>(null);
  
  const { 
    isLoading,
    error,
    localStream,
    remoteStream,
    connectionState,
    connectionQuality,
    isConnected,
    isVideoMuted,
    isAudioMuted,
    sessionDetails,
    hasConsent,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    recordConsent
  } = useVideoSession({
    sessionId,
    appointmentId,
    role: 'PATIENT'
  });
  
  // Show consent dialog when session details are loaded
  useEffect(() => {
    if (sessionDetails && !hasConsent && !isLoading && !error) {
      setShowConsentDialog(true);
    }
  }, [sessionDetails, hasConsent, isLoading, error]);
  
  // Join session when consent is given
  useEffect(() => {
    if (hasConsent && sessionDetails && !isLoading && !error) {
      joinSession();
    }
  }, [hasConsent, sessionDetails, isLoading, error, joinSession]);
  
  // Exit waiting room when therapist joins
  useEffect(() => {
    if (remoteStream) {
      setIsInWaitingRoom(false);
    }
  }, [remoteStream]);
  
  // Handle device testing
  const handleTestDevices = async () => {
    if (!localStream) return;
    
    const audioTracks = localStream.getAudioTracks();
    const videoTracks = localStream.getVideoTracks();
    
    setTestResults({
      audio: audioTracks.length > 0 && audioTracks[0].readyState === 'live',
      video: videoTracks.length > 0 && videoTracks[0].readyState === 'live',
    });
    
    setDevicesTested(true);
  };
  
  // Handle consent decision
  const handleConsent = async (consent: boolean) => {
    await recordConsent(consent);
    setShowConsentDialog(false);
    
    if (!consent) {
      // Redirect if consent is declined
      router.push('/dashboard');
    }
  };
  
  // Render connection quality indicator
  const renderConnectionQuality = () => {
    if (!connectionQuality) return null;
    
    let color = 'bg-green-500';
    let label = 'Excellent';
    
    switch (connectionQuality.level) {
      case 'good':
        color = 'bg-green-400';
        label = 'Good';
        break;
      case 'fair':
        color = 'bg-yellow-400';
        label = 'Fair';
        break;
      case 'poor':
        color = 'bg-orange-400';
        label = 'Poor';
        break;
      case 'critical':
        color = 'bg-red-500';
        label = 'Critical';
        break;
    }
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span>{label}</span>
      </div>
    );
  };