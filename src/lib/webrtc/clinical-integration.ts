/**
 * Clinical Integration Service
 * 
 * This service integrates WebRTC video sessions with clinical data and workflows.
 * It provides methods for accessing patient history, session data, and clinical tools.
 * 
 * HIPAA Compliance:
 * - All data access is authenticated and authorized
 * - PHI is properly secured and encrypted
 * - Access is logged for audit purposes
 */

import { prisma } from '@/lib/prisma';
import { auditLog } from '@/lib/audit-log';

/**
 * Patient history interface
 */
export interface PatientHistory {
  id: string;
  name: string;
  dateOfBirth?: Date;
  diagnoses?: Array<{
    id: string;
    code: string;
    name: string;
    diagnosedAt: Date;
  }>;
  medications?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
  }>;
  previousSessions?: Array<{
    id: string;
    date: Date;
    therapistId: string;
    therapistName: string;
    notes: string;
    assessments?: any[];
  }>;
}

/**
 * Session notes interface
 */
export interface SessionNotes {
  sessionId: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Clinical Integration Service
 */
export class ClinicalIntegration {
  /**
   * Get patient history
   * @param patientId Patient ID
   * @returns Patient history
   */
  public static async getPatientHistory(patientId: string): Promise<PatientHistory> {
    try {
      // Log access for audit
      await auditLog({
        action: 'PATIENT_HISTORY_ACCESS',
        resourceType: 'PATIENT',
        resourceId: patientId,
        description: 'Accessed patient history for video session'
      });
      
      // Get patient data
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
          id: true,
          name: true,
          dateOfBirth: true,
          diagnoses: {
            select: {
              id: true,
              code: true,
              name: true,
              diagnosedAt: true
            }
          },
          medications: {
            select: {
              id: true,
              name: true,
              dosage: true,
              frequency: true,
              startDate: true,
              endDate: true
            }
          },
          sessions: {
            orderBy: { date: 'desc' },
            take: 10,
            select: {
              id: true,
              date: true,
              therapist: {
                select: {
                  id: true,
                  name: true
                }
              },
              notes: true,
              assessments: true
            }
          }
        }
      });
      
      if (!patient) {
        throw new Error(`Patient not found: ${patientId}`);
      }
      
      // Transform data to match interface
      const history: PatientHistory = {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth || undefined,
        diagnoses: patient.diagnoses || [],
        medications: patient.medications || [],
        previousSessions: patient.sessions.map(session => ({
          id: session.id,
          date: session.date,
          therapistId: session.therapist.id,
          therapistName: session.therapist.name,
          notes: session.notes || '',
          assessments: session.assessments || []
        }))
      };
      
      return history;
    } catch (error) {
      console.error('Error getting patient history:', error);
      throw new Error('Failed to retrieve patient history');
    }
  }
  
  /**
   * Save session notes
   * @param sessionId Session ID
   * @param notes Session notes
   * @returns Updated session notes
   */
  public static async saveSessionNotes(sessionId: string, notes: string): Promise<SessionNotes> {
    try {
      // Get session to verify it exists
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, patientId: true, therapistId: true }
      });
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      // Log access for audit
      await auditLog({
        action: 'SESSION_NOTES_UPDATE',
        resourceType: 'SESSION',
        resourceId: sessionId,
        description: 'Updated session notes from video session',
        metadata: {
          patientId: session.patientId,
          therapistId: session.therapistId
        }
      });
      
      // Update session notes
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { notes },
        select: {
          id: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      return {
        sessionId: updatedSession.id,
        notes: updatedSession.notes || '',
        createdAt: updatedSession.createdAt,
        updatedAt: updatedSession.updatedAt
      };
    } catch (error) {
      console.error('Error saving session notes:', error);
      throw new Error('Failed to save session notes');
    }
  }
  
  /**
   * Complete a session
   * @param sessionId Session ID
   * @param notes Final session notes
   * @returns Success status
   */
  public static async completeSession(sessionId: string, notes: string): Promise<boolean> {
    try {
      // Get session to verify it exists
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { id: true, patientId: true, therapistId: true }
      });
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      // Log access for audit
      await auditLog({
        action: 'SESSION_COMPLETED',
        resourceType: 'SESSION',
        resourceId: sessionId,
        description: 'Completed video session',
        metadata: {
          patientId: session.patientId,
          therapistId: session.therapistId
        }
      });
      
      // Update session status and notes
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          notes,
          status: 'COMPLETED',
          endTime: new Date()
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      throw new Error('Failed to complete session');
    }
  }
  
  /**
   * Record patient consent for video session
   * @param sessionId Session ID
   * @param patientId Patient ID
   * @param hasConsented Whether the patient has consented
   * @returns Success status
   */
  public static async recordConsent(
    sessionId: string,
    patientId: string,
    hasConsented: boolean
  ): Promise<boolean> {
    try {
      // Log consent for audit
      await auditLog({
        action: hasConsented ? 'CONSENT_GRANTED' : 'CONSENT_DENIED',
        resourceType: 'SESSION',
        resourceId: sessionId,
        description: `Patient ${hasConsented ? 'granted' : 'denied'} consent for video session`,
        metadata: {
          patientId
        }
      });
      
      // Record consent in database
      await prisma.sessionConsent.create({
        data: {
          sessionId,
          patientId,
          consented: hasConsented,
          consentedAt: new Date(),
          consentType: 'VIDEO_SESSION'
        }
      });
      
      // Update session status if consent was denied
      if (!hasConsented) {
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            status: 'CANCELLED',
            cancellationReason: 'CONSENT_DENIED'
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error recording consent:', error);
      throw new Error('Failed to record consent');
    }
  }
  
  /**
   * Check if patient has given consent for video session
   * @param sessionId Session ID
   * @param patientId Patient ID
   * @returns Whether consent has been given
   */
  public static async checkConsent(sessionId: string, patientId: string): Promise<boolean> {
    try {
      // Check for consent record
      const consent = await prisma.sessionConsent.findFirst({
        where: {
          sessionId,
          patientId,
          consentType: 'VIDEO_SESSION'
        }
      });
      
      return consent ? consent.consented : false;
    } catch (error) {
      console.error('Error checking consent:', error);
      throw new Error('Failed to check consent status');
    }
  }
  
  /**
   * Get session details
   * @param sessionId Session ID
   * @returns Session details
   */
  public static async getSessionDetails(sessionId: string): Promise<any> {
    try {
      // Get session details
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          patient: {
            select: {
              id: true,
              name: true
            }
          },
          therapist: {
            select: {
              id: true,
              name: true
            }
          },
          appointment: true
        }
      });
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      // Log access for audit
      await auditLog({
        action: 'SESSION_DETAILS_ACCESS',
        resourceType: 'SESSION',
        resourceId: sessionId,
        description: 'Accessed session details for video session',
        metadata: {
          patientId: session.patientId,
          therapistId: session.therapistId
        }
      });
      
      return {
        session,
        patient: session.patient,
        therapist: session.therapist,
        appointment: session.appointment
      };
    } catch (error) {
      console.error('Error getting session details:', error);
      throw new Error('Failed to retrieve session details');
    }
  }
  
  /**
   * Get session details by appointment ID
   * @param appointmentId Appointment ID
   * @returns Session details
   */
  public static async getSessionDetailsByAppointment(appointmentId: string): Promise<any> {
    try {
      // Get session by appointment ID
      const session = await prisma.session.findFirst({
        where: { appointmentId },
        include: {
          patient: {
            select: {
              id: true,
              name: true
            }
          },
          therapist: {
            select: {
              id: true,
              name: true
            }
          },
          appointment: true
        }
      });
      
      if (!session) {
        throw new Error(`Session not found for appointment: ${appointmentId}`);
      }
      
      // Log access for audit
      await auditLog({
        action: 'SESSION_DETAILS_ACCESS',
        resourceType: 'SESSION',
        resourceId: session.id,
        description: 'Accessed session details by appointment for video session',
        metadata: {
          patientId: session.patientId,
          therapistId: session.therapistId,
          appointmentId
        }
      });
      
      return {
        session,
        patient: session.patient,
        therapist: session.therapist,
        appointment: session.appointment
      };
    } catch (error) {
      console.error('Error getting session details by appointment:', error);
      throw new Error('Failed to retrieve session details');
    }
  }
}