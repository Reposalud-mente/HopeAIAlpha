/**
 * Clinical Integration Service for WebRTC
 */
import { SessionDetails, SessionSummary } from './types';

export class ClinicalIntegration {
  /**
   * Prepare a video session from an appointment
   */
  static async prepareSession(appointmentId: string): Promise<SessionDetails> {
    try {
      // Fetch appointment details
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment details');
      }
      
      const appointment = await response.json();
      
      // Create video session
      const sessionResponse = await fetch('/api/video-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          therapistId: appointment.userId,
        }),
      });
      
      if (!sessionResponse.ok) {
        throw new Error('Failed to create video session');
      }
      
      const session = await sessionResponse.json();
      
      // Generate session token
      const tokenResponse = await fetch(`/api/video-sessions/${session.id}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to generate session token');
      }
      
      const { token } = await tokenResponse.json();
      
      return {
        session,
        sessionToken: token,
        patientDetails: appointment.patient,
        therapistDetails: appointment.user,
        sessionTemplate: appointment.sessionTemplate,
      };
    } catch (error) {
      console.error('Error preparing session:', error);
      throw error;
    }
  }
  
  /**
   * Complete a video session and update records
   */
  static async completeSession(sessionId: string, summary: SessionSummary): Promise<void> {
    try {
      // Update video session
      const response = await fetch(`/api/video-sessions/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: summary.notes,
          assessmentResults: summary.assessmentResults,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete video session');
      }
      
      // Create follow-up tasks if needed
      if (summary.followUpTasks?.length > 0) {
        const tasksResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tasks: summary.followUpTasks,
            videoSessionId: sessionId,
          }),
        });
        
        if (!tasksResponse.ok) {
          console.error('Failed to create follow-up tasks');
        }
      }
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }
  
  /**
   * Create clinical notes from a video session
   */
  static async createSessionNotes(sessionId: string, notes: string): Promise<void> {
    try {
      const response = await fetch(`/api/video-sessions/${sessionId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session notes');
      }
    } catch (error) {
      console.error('Error creating session notes:', error);
      throw error;
    }
  }
  
  /**
   * Get patient history for context during a session
   */
  static async getPatientHistory(patientId: string): Promise<any> {
    try {
      const response = await fetch(`/api/patients/${patientId}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching patient history:', error);
      throw error;
    }
  }
  
  /**
   * Get previous session notes for context
   */
  static async getPreviousSessionNotes(patientId: string, limit = 3): Promise<any[]> {
    try {
      const response = await fetch(`/api/patients/${patientId}/session-notes?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch previous session notes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching previous session notes:', error);
      return [];
    }
  }
  
  /**
   * Check if patient has completed pre-session questionnaires
   */
  static async checkPreSessionQuestionnaires(appointmentId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/questionnaires`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const { completed } = await response.json();
      return completed;
    } catch (error) {
      console.error('Error checking pre-session questionnaires:', error);
      return false;
    }
  }
  
  /**
   * Send post-session summary to patient
   */
  static async sendSessionSummary(sessionId: string, summary: string): Promise<void> {
    try {
      const response = await fetch(`/api/video-sessions/${sessionId}/send-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send session summary');
      }
    } catch (error) {
      console.error('Error sending session summary:', error);
      throw error;
    }
  }
}