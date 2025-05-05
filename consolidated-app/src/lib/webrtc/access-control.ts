/**
 * Access Control Service for WebRTC
 */
import { AuditLogger } from './audit-logger';

export class AccessControl {
  /**
   * Validate session access
   */
  static async validateSessionAccess(
    userId: string, 
    sessionId: string, 
    role: 'THERAPIST' | 'PATIENT'
  ): Promise<boolean> {
    try {
      // Verify the user has access to this session
      const response = await fetch(`/api/video-sessions/${sessionId}/validate-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
        }),
      });
      
      if (!response.ok) {
        await AuditLogger.logEvent({
          type: 'unauthorized.access.attempt',
          sessionId,
          userId,
          userRole: role,
          details: { reason: 'API validation failed' },
        });
        return false;
      }
      
      const { authorized } = await response.json();
      
      if (!authorized) {
        await AuditLogger.logEvent({
          type: 'unauthorized.access.attempt',
          sessionId,
          userId,
          userRole: role,
          details: { reason: 'Not authorized for session' },
        });
      }
      
      return authorized;
    } catch (error) {
      console.error('Error validating session access:', error);
      
      await AuditLogger.logEvent({
        type: 'error',
        sessionId,
        userId,
        userRole: role,
        details: { error: 'Error validating session access' },
      });
      
      return false;
    }
  }
  
  /**
   * Check IP restrictions
   */
  static async checkIPRestrictions(userId: string, ipAddress: string): Promise<boolean> {
    try {
      const response = await fetch('/api/security/ip-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ipAddress,
        }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const { allowed } = await response.json();
      
      if (!allowed) {
        await AuditLogger.logEvent({
          type: 'ip.restriction',
          sessionId: '',
          userId,
          ipAddress,
          details: { reason: 'IP address not allowed' },
        });
      }
      
      return allowed;
    } catch (error) {
      console.error('Error checking IP restrictions:', error);
      return true; // Default to allowing if check fails
    }
  }
  
  /**
   * Verify session token
   */
  static async verifySessionToken(token: string, sessionId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/video-sessions/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const { valid, userId } = await response.json();
      
      if (!valid) {
        await AuditLogger.logEvent({
          type: 'invalid.token',
          sessionId,
          userId: userId || 'unknown',
          details: { reason: 'Invalid session token' },
        });
      }
      
      return valid;
    } catch (error) {
      console.error('Error verifying session token:', error);
      return false;
    }
  }
  
  /**
   * Check if session is active
   */
  static async isSessionActive(sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/video-sessions/${sessionId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const { active } = await response.json();
      return active;
    } catch (error) {
      console.error('Error checking session status:', error);
      return false;
    }
  }
  
  /**
   * Record consent for session
   */
  static async recordConsent(sessionId: string, userId: string, consentGiven: boolean): Promise<boolean> {
    try {
      const response = await fetch(`/api/video-sessions/${sessionId}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          consentGiven,
        }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      await AuditLogger.logEvent({
        type: consentGiven ? 'consent.given' : 'consent.declined',
        sessionId,
        userId,
        details: { timestamp: new Date().toISOString() },
      });
      
      return true;
    } catch (error) {
      console.error('Error recording consent:', error);
      return false;
    }
  }
  
  /**
   * Check if consent has been given
   */
  static async hasConsent(sessionId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/video-sessions/${sessionId}/consent/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const { consentGiven } = await response.json();
      return consentGiven;
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }
  
  /**
   * Enforce session timeout
   */
  static startSessionTimeout(sessionId: string, timeoutMinutes: number = 60): NodeJS.Timeout {
    return setTimeout(async () => {
      try {
        await fetch(`/api/video-sessions/${sessionId}/timeout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        await AuditLogger.logEvent({
          type: 'session.timeout',
          sessionId,
          userId: '',
          details: { timeoutMinutes },
        });
      } catch (error) {
        console.error('Error enforcing session timeout:', error);
      }
    }, timeoutMinutes * 60 * 1000);
  }
  
  /**
   * Clear session timeout
   */
  static clearSessionTimeout(timeoutId: NodeJS.Timeout): void {
    clearTimeout(timeoutId);
  }
}