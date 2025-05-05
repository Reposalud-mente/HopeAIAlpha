'use client'

import { useState, useEffect, useCallback } from 'react';
import { useWebRTC } from '@/contexts/webrtc/WebRTCContext';
import { AccessControl } from '@/lib/webrtc/access-control';
import { AuditLogger } from '@/lib/webrtc/audit-logger';
import { ClinicalIntegration } from '@/lib/webrtc/clinical-integration';
import { useAuth } from '@/contexts/auth-context';

interface UseVideoSessionProps {
  sessionId?: string;
  appointmentId?: string;
  role: 'THERAPIST' | 'PATIENT';
}

export function useVideoSession({ sessionId, appointmentId, role }: UseVideoSessionProps) {
  const { user } = useAuth();
  const webrtc = useWebRTC();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Initialize session
  const initializeSession = useCallback(async () => {
    if (!user) {
      setError(new Error('User not authenticated'));
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let activeSessionId = sessionId;
      
      // If appointmentId is provided but not sessionId, create a new session
      if (appointmentId && !sessionId) {
        const details = await ClinicalIntegration.prepareSession(appointmentId);
        setSessionDetails(details);
        activeSessionId = details.session.id;
      } else if (sessionId) {
        // Fetch session details if sessionId is provided
        const response = await fetch(`/api/video-sessions/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }
        const details = await response.json();
        setSessionDetails(details);
      } else {
        throw new Error('Either sessionId or appointmentId must be provided');
      }
      
      // Validate access to the session
      const hasAccess = await AccessControl.validateSessionAccess(
        user.id,
        activeSessionId!,
        role
      );
      
      if (!hasAccess) {
        throw new Error('You do not have access to this session');
      }
      
      // Check if session is active
      const isActive = await AccessControl.isSessionActive(activeSessionId!);
      if (!isActive) {
        throw new Error('This session is no longer active');
      }
      
      // Check if consent has been given
      const consentGiven = await AccessControl.hasConsent(activeSessionId!, user.id);
      setHasConsent(consentGiven);
      
      // Start session timeout
      const timeout = AccessControl.startSessionTimeout(activeSessionId!, 60);
      setTimeoutId(timeout);
      
      // Log session initialization
      await AuditLogger.logEvent({
        type: 'session.initialized',
        sessionId: activeSessionId!,
        userId: user.id,
        userRole: role,
        details: {
          appointmentId,
          browser: navigator.userAgent,
        },
      });
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Log error
      if (sessionId) {
        await AuditLogger.logEvent({
          type: 'session.initialization.failed',
          sessionId,
          userId: user.id,
          userRole: role,
          details: {
            error: err instanceof Error ? err.message : String(err),
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId, appointmentId, role]);
  
  // Join the WebRTC session
  const joinSession = useCallback(async () => {
    if (!sessionDetails || !hasConsent) {
      return;
    }
    
    try {
      await webrtc.joinSession(sessionDetails.session.id, role);
      
      // Log session joined
      await AuditLogger.logEvent({
        type: 'session.joined',
        sessionId: sessionDetails.session.id,
        userId: user!.id,
        userRole: role,
        details: {
          browser: navigator.userAgent,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Log error
      await AuditLogger.logEvent({
        type: 'session.join.failed',
        sessionId: sessionDetails.session.id,
        userId: user!.id,
        userRole: role,
        details: {
          error: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }, [webrtc, sessionDetails, hasConsent, role, user]);
  
  // Leave the WebRTC session
  const leaveSession = useCallback(async () => {
    if (!sessionDetails) {
      return;
    }
    
    try {
      await webrtc.leaveSession();
      
      // Log session left
      await AuditLogger.logEvent({
        type: 'session.left',
        sessionId: sessionDetails.session.id,
        userId: user!.id,
        userRole: role,
        details: {
          browser: navigator.userAgent,
        },
      });
      
      // Clear session timeout
      if (timeoutId) {
        AccessControl.clearSessionTimeout(timeoutId);
        setTimeoutId(null);
      }
    } catch (err) {
      console.error('Error leaving session:', err);
    }
  }, [webrtc, sessionDetails, user, role, timeoutId]);
  
  // Record user consent
  const recordConsent = useCallback(async (consentGiven: boolean) => {
    if (!sessionDetails || !user) {
      return false;
    }
    
    try {
      const success = await AccessControl.recordConsent(
        sessionDetails.session.id,
        user.id,
        consentGiven
      );
      
      if (success) {
        setHasConsent(consentGiven);
      }
      
      return success;
    } catch (err) {
      console.error('Error recording consent:', err);
      return false;
    }
  }, [sessionDetails, user]);
  
  // Complete the session
  const completeSession = useCallback(async (summary: string) => {
    if (!sessionDetails) {
      return;
    }
    
    try {
      await ClinicalIntegration.completeSession(sessionDetails.session.id, {
        notes: summary,
      });
      
      // Log session completed
      await AuditLogger.logEvent({
        type: 'session.completed',
        sessionId: sessionDetails.session.id,
        userId: user!.id,
        userRole: role,
        details: {
          browser: navigator.userAgent,
        },
      });
      
      // Clear session timeout
      if (timeoutId) {
        AccessControl.clearSessionTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error completing session:', err);
      return false;
    }
  }, [sessionDetails, user, role, timeoutId]);
  
  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    
    // Clean up on unmount
    return () => {
      if (timeoutId) {
        AccessControl.clearSessionTimeout(timeoutId);
      }
    };
  }, [initializeSession]);
  
  return {
    ...webrtc,
    isLoading,
    error: error || webrtc.error,
    sessionDetails,
    hasConsent,
    joinSession,
    leaveSession,
    recordConsent,
    completeSession,
  };
}