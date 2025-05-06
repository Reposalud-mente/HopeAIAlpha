'use client'

/**
 * Video Call Page
 * 
 * This page provides the video call interface for both patients and therapists.
 * It determines the user's role and renders the appropriate interface.
 * 
 * HIPAA Compliance:
 * - All connections are secured and encrypted
 * - User roles are properly authenticated and authorized
 * - Connection quality is monitored for telehealth reliability
 */

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PatientVideoInterface } from '@/components/video/PatientVideoInterface';
import { TherapistVideoInterface } from '@/components/video/TherapistVideoInterface';
import { WebRTCProvider } from '@/contexts/webrtc-context';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Define page props
interface VideoCallPageProps {
  params: {
    sessionId: string;
  };
  searchParams?: {
    appointmentId?: string;
  };
}

/**
 * Video Call Page Component
 */
export default function VideoCallPage({ 
  params, 
  searchParams 
}: VideoCallPageProps) {
  // Get session ID and appointment ID
  const sessionId = params.sessionId;
  const appointmentId = searchParams?.appointmentId;
  
  // Get auth session
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<'PATIENT' | 'THERAPIST' | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  
  // Determine user role and fetch session details
  useEffect(() => {
    const determineRole = async () => {
      try {
        // Check if user is authenticated
        if (status === 'loading') return;
        
        if (status === 'unauthenticated') {
          router.push(`/login?callbackUrl=/video-call/${sessionId}`);
          return;
        }
        
        if (!session?.user?.id) {
          throw new Error('User ID not available');
        }
        
        // Import dynamically to avoid server-side import issues
        const { prisma } = await import('@/lib/prisma');
        
        // Get session details
        const sessionDetails = await prisma.session.findUnique({
          where: { id: sessionId },
          select: {
            id: true,
            patientId: true,
            therapistId: true,
            status: true
          }
        });
        
        if (!sessionDetails) {
          throw new Error('Session not found');
        }
        
        // Check if session is active
        if (sessionDetails.status !== 'SCHEDULED' && sessionDetails.status !== 'IN_PROGRESS') {
          throw new Error('Session is not active');
        }
        
        // Determine user role
        if (session.user.id === sessionDetails.patientId) {
          setUserRole('PATIENT');
          setPatientId(sessionDetails.patientId);
        } else if (session.user.id === sessionDetails.therapistId) {
          setUserRole('THERAPIST');
          setPatientId(sessionDetails.patientId);
        } else {
          throw new Error('User is not authorized to join this session');
        }
        
        // Update session status to in progress
        if (sessionDetails.status === 'SCHEDULED') {
          await prisma.session.update({
            where: { id: sessionId },
            data: { status: 'IN_PROGRESS', startTime: new Date() }
          });
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to determine user role');
        setError(error);
        console.error('Error determining user role:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    determineRole();
  }, [session, status, sessionId, router]);
  
  // Loading state
  if (isLoading || status === 'loading') {
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
  
  // Unauthorized state
  if (!userRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You are not authorized to join this session
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
  
  // Define ICE servers with TURN servers for production
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // In a production environment, you would add TURN servers here
    // Example:
    // {
    //   urls: 'turn:turn.example.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ];
  
  return (
    <WebRTCProvider iceServers={iceServers}>
      {userRole === 'PATIENT' ? (
        <PatientVideoInterface 
          sessionId={sessionId} 
          appointmentId={appointmentId} 
        />
      ) : (
        <TherapistVideoInterface 
          sessionId={sessionId} 
          appointmentId={appointmentId}
          patientId={patientId!}
        />
      )}
    </WebRTCProvider>
  );
}