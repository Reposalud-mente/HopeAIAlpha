'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoSession } from '@/hooks/webrtc/useVideoSession';
import { ClinicalIntegration } from '@/lib/webrtc/clinical-integration';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Mic, MicOff, Video, VideoOff, Share, X, AlertTriangle } from 'lucide-react';

interface TherapistVideoInterfaceProps {
  sessionId?: string;
  appointmentId?: string;
  patientId: string;
}

export function TherapistVideoInterface({ 
  sessionId, 
  appointmentId,
  patientId 
}: TherapistVideoInterfaceProps) {
  const router = useRouter();
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [patientHistory, setPatientHistory] = useState<any>(null);
  const [isEndingSession, setIsEndingSession] = useState<boolean>(false);
  
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
    isScreenSharing,
    sessionDetails,
    hasConsent,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    startScreenSharing,
    stopScreenSharing,
    completeSession
  } = useVideoSession({
    sessionId,
    appointmentId,
    role: 'THERAPIST'
  });
  
  // Load patient history
  useEffect(() => {
    async function loadPatientHistory() {
      try {
        const history = await ClinicalIntegration.getPatientHistory(patientId);
        setPatientHistory(history);
      } catch (error) {
        console.error('Failed to load patient history:', error);
      }
    }
    
    if (patientId) {
      loadPatientHistory();
    }
  }, [patientId]);
  
  // Join session when consent is given
  useEffect(() => {
    if (hasConsent && sessionDetails && !isLoading && !error) {
      joinSession();
    }
  }, [hasConsent, sessionDetails, isLoading, error, joinSession]);
  
  // Handle session end
  const handleEndSession = async () => {
    setIsEndingSession(true);
    
    try {
      await leaveSession();
      const success = await completeSession(sessionNotes);
      
      if (success) {
        router.push(`/patients/${patientId}/sessions/${sessionDetails?.session.id}/summary`);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsEndingSession(false);
    }
  };
  
  // Handle screen sharing
  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenSharing();
    } else {
      await startScreenSharing();
    }
  };
  
  // Update session notes
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSessionNotes(e.target.value);
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Preparing your session...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to initialize video session'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="therapist-video-interface flex flex-col h-screen">
      <div className="flex-1 flex">
        {/* Main content area - video and controls */}
        <div className="flex-1 flex flex-col">
          {/* Video container */}
          <div className="relative flex-1 bg-gray-900">
            {/* Remote video (patient) */}
            {remoteStream ? (
              <video
                ref={(videoElement) => {
                  if (videoElement && remoteStream) {
                    videoElement.srcObject = remoteStream;
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Waiting for patient to join...</p>
              </div>
            )}
            
            {/* Local video (therapist) - small overlay */}
            {localStream && (
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={(videoElement) => {
                    if (videoElement && localStream) {
                      videoElement.srcObject = localStream;
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Connection quality indicator */}
            <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-70 rounded-md px-3 py-1 text-white">
              {renderConnectionQuality()}
            </div>
          </div>
          
          {/* Video controls */}
          <div className="bg-gray-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={isAudioMuted ? "destructive" : "default"}
                size="icon"
                onClick={toggleAudio}
              >
                {isAudioMuted ? <MicOff /> : <Mic />}
              </Button>
              
              <Button
                variant={isVideoMuted ? "destructive" : "default"}
                size="icon"
                onClick={toggleVideo}
              >
                {isVideoMuted ? <VideoOff /> : <Video />}
              </Button>
              
              <Button
                variant={isScreenSharing ? "destructive" : "default"}
                size="icon"
                onClick={handleScreenShare}
              >
                {isScreenSharing ? <X /> : <Share />}
              </Button>
            </div>
            
            <Button
              variant="destructive"
              onClick={handleEndSession}
              disabled={isEndingSession}
            >
              {isEndingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ending Session
                </>
              ) : (
                'End Session'
              )}
            </Button>
          </div>
        </div>
        
        {/* Sidebar - clinical tools */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <Tabs defaultValue="notes">
            <TabsList className="w-full">
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              <TabsTrigger value="tools" className="flex-1">Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes" className="p-4">
              <h3 className="font-medium mb-2">Session Notes</h3>
              <Textarea
                value={sessionNotes}
                onChange={handleNotesChange}
                placeholder="Enter your session notes here..."
                className="min-h-[300px]"
              />
            </TabsContent>
            
            <TabsContent value="history" className="p-4">
              <h3 className="font-medium mb-2">Patient History</h3>
              {patientHistory ? (
                <div className="space-y-4">
                  {patientHistory.previousSessions?.map((session: any) => (
                    <Card key={session.id} className="p-3">
                      <p className="text-sm text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                      <p className="text-sm mt-1">{session.notes}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Loading patient history...</p>
              )}
            </TabsContent>
            
            <TabsContent value="tools" className="p-4">
              <h3 className="font-medium mb-2">Clinical Tools</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Mood Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Anxiety Questionnaire
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Depression Screening
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Cognitive Assessment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}