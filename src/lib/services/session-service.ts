import { prisma } from '@/lib/prisma';
import { 
  sessionSchema, 
  sessionInputSchema, 
  prismaSessionToTypescript, 
  typescriptSessionToPrisma,
  Session,
  SessionInput
} from '@/lib/validations/session';
import { SessionStatus } from '@prisma/client';
import { ZodError } from 'zod';

export class SessionValidationError extends Error {
  errors: any;
  
  constructor(message: string, errors: any) {
    super(message);
    this.name = 'SessionValidationError';
    this.errors = errors;
  }
}

export class SessionService {
  /**
   * Create a new session with validation
   */
  static async createSession(data: SessionInput): Promise<Session> {
    try {
      // Validate input data
      const validatedData = sessionInputSchema.parse(data);
      
      // Convert to Prisma format
      const prismaData = typescriptSessionToPrisma(validatedData);
      
      // Create session in database
      const createdSession = await prisma.session.create({
        data: prismaData,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      
      // Convert back to TypeScript format
      return prismaSessionToTypescript(createdSession);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new SessionValidationError('Session validation failed', error.format());
      }
      throw error;
    }
  }
  
  /**
   * Get a session by ID with validation
   */
  static async getSession(id: string): Promise<Session> {
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    
    if (!session) {
      throw new Error(`Session with ID ${id} not found`);
    }
    
    return prismaSessionToTypescript(session);
  }
  
  /**
   * Update a session with validation
   */
  static async updateSession(id: string, data: Partial<SessionInput>): Promise<Session> {
    try {
      // Get current session to merge with updates
      const currentSession = await prisma.session.findUnique({ where: { id } });
      if (!currentSession) {
        throw new Error(`Session with ID ${id} not found`);
      }
      
      // Merge current data with updates
      const mergedData = {
        ...currentSession,
        ...data,
      };
      
      // Validate the merged data
      const validatedData = sessionInputSchema.parse(mergedData);
      
      // Convert to Prisma format
      const prismaData = typescriptSessionToPrisma(validatedData);
      
      // Update session in database
      const updatedSession = await prisma.session.update({
        where: { id },
        data: prismaData,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          clinician: { select: { id: true, firstName: true, lastName: true } },
        },
      });
      
      // Convert back to TypeScript format
      return prismaSessionToTypescript(updatedSession);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new SessionValidationError('Session validation failed', error.format());
      }
      throw error;
    }
  }
  
  /**
   * Delete a session
   */
  static async deleteSession(id: string): Promise<void> {
    await prisma.session.delete({ where: { id } });
  }
  
  /**
   * Get sessions for a patient
   */
  static async getPatientSessions(patientId: string): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: {
        clinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    
    return sessions.map(prismaSessionToTypescript);
  }
  
  /**
   * Transfer a session to another clinician
   */
  static async transferSession(id: string, targetClinicianId: string): Promise<Session> {
    const updatedSession = await prisma.session.update({
      where: { id },
      data: { 
        clinicianId: targetClinicianId, 
        status: SessionStatus.TRANSFERRED 
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        clinician: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    
    return prismaSessionToTypescript(updatedSession);
  }
}
