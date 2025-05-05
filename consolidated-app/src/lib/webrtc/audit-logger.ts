/**
 * Audit Logger Service for WebRTC
 */
import { WebRTCEvent, SecurityAlert } from './types';

export class AuditLogger {
  private static readonly LOG_LEVELS = {
    INFO: 'INFO',
    WARNING: 'WARNING',
    ERROR: 'ERROR',
    SECURITY: 'SECURITY',
  };
  
  /**
   * Log a WebRTC event
   */
  static async logEvent(event: WebRTCEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: this.determineLogLevel(event),
      eventType: event.type,
      sessionId: event.sessionId,
      userId: event.userId,
      userRole: event.userRole,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      details: this.sanitizeDetails(event.details),
    };
    
    try {
      // Store log entry
      await fetch('/api/webrtc/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      });
      
      // Check for security anomalies
      if (logEntry.level === this.LOG_LEVELS.SECURITY) {
        await this.checkForAnomalies(logEntry);
      }
    } catch (error) {
      console.error('Failed to log WebRTC event:', error);
    }
  }
  
  /**
   * Determine log level based on event type
   */
  private static determineLogLevel(event: WebRTCEvent): string {
    switch (event.type) {
      case 'session.started':
      case 'session.ended':
      case 'user.joined':
      case 'user.left':
        return this.LOG_LEVELS.INFO;
      
      case 'connection.failed':
      case 'connection.reconnecting':
        return this.LOG_LEVELS.WARNING;
      
      case 'error':
        return this.LOG_LEVELS.ERROR;
      
      case 'authentication.failed':
      case 'unauthorized.access.attempt':
      case 'encryption.error':
        return this.LOG_LEVELS.SECURITY;
      
      default:
        return this.LOG_LEVELS.INFO;
    }
  }
  
  /**
   * Sanitize event details to remove sensitive information
   */
  private static sanitizeDetails(details: any): any {
    // Remove any sensitive information
    if (!details) return {};
    
    const sanitized = { ...details };
    
    // Remove any potential PII or sensitive data
    const sensitiveFields = ['password', 'token', 'ssn', 'dob', 'address'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  /**
   * Check for security anomalies
   */
  private static async checkForAnomalies(logEntry: any): Promise<void> {
    try {
      // Check for multiple authentication failures
      if (logEntry.eventType === 'authentication.failed') {
        const response = await fetch(`/api/webrtc/audit-log/count`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: logEntry.userId,
            eventType: 'authentication.failed',
            timeWindow: 15, // Last 15 minutes
          }),
        });
        
        if (!response.ok) {
          return;
        }
        
        const { count } = await response.json();
        
        if (count >= 5) {
          // Trigger security alert
          await this.triggerSecurityAlert({
            type: 'excessive.auth.failures',
            userId: logEntry.userId,
            count,
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      // Check for multiple connection failures
      if (logEntry.eventType === 'connection.failed') {
        const response = await fetch(`/api/webrtc/audit-log/count`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: logEntry.sessionId,
            eventType: 'connection.failed',
            timeWindow: 5, // Last 5 minutes
          }),
        });
        
        if (!response.ok) {
          return;
        }
        
        const { count } = await response.json();
        
        if (count >= 3) {
          // Trigger security alert
          await this.triggerSecurityAlert({
            type: 'excessive.connection.failures',
            sessionId: logEntry.sessionId,
            userId: logEntry.userId,
            count,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error checking for anomalies:', error);
    }
  }
  
  /**
   * Trigger a security alert
   */
  static async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Log the security alert
      await fetch('/api/webrtc/security-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });
      
      // Notify security team (in a real system, this would send an email or other notification)
      console.warn('Security Alert:', alert);
    } catch (error) {
      console.error('Failed to trigger security alert:', error);
    }
  }
  
  /**
   * Get audit logs for a session
   */
  static async getSessionLogs(sessionId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/webrtc/audit-log/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session logs');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching session logs:', error);
      return [];
    }
  }
  
  /**
   * Generate compliance report
   */
  static async generateComplianceReport(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await fetch('/api/webrtc/compliance-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate compliance report');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }
}