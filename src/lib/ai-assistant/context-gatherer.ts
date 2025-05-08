/**
 * Context Gatherer for AI Assistant
 * 
 * This module gathers relevant context about the platform, user, and current state
 * to enhance the AI assistant's responses with contextual awareness.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { 
  ServerUserContext, 
  ServerApplicationContext, 
  ServerDataContext, 
  ServerPlatformContext, 
  AVAILABLE_FEATURES 
} from './context-types';
import { logger } from '@/lib/logger'; // Assuming logger is used or will be added for consistency

/**
 * Main context gatherer class
 */
export class ContextGatherer {
  /**
   * Get user context based on the current session
   * @param providedSession Optional session object to use instead of fetching from request context
   * @returns Promise resolving to user context or null if not authenticated
   */
  static async getUserContext(providedSession?: any): Promise<ServerUserContext | null> {
    try {
      let session = providedSession;
      
      if (!session) {
        try {
          headers(); 
          session = await getServerSession(authOptions);
        } catch (e) {
          logger.info("Not in a request context, can't get session", { error: e instanceof Error ? e.message : String(e) });
          return null;
        }
      }
      
      if (!session?.user?.id) { // Ensure user.id exists for prisma query
        logger.warn('Session or session.user.id is missing');
        return null;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        }
      });
      
      if (!user) {
        logger.warn('User not found in database', { userId: session.user.id });
        return null;
      }
      
      return {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
        email: user.email || '',
        role: user.role || 'Profesional',
      };
    } catch (error) {
      logger.error('Error getting user context:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }
  
  /**
   * Get application context based on the current request
   * @param currentSection Optional current section name
   * @param currentPage Optional current page name
   * @returns Application context object
   */
  static getApplicationContext(currentSection?: string, currentPage?: string): ServerApplicationContext {
    // Use the shared constant for available features
    // const availableFeatures = [ <-- Remove this
    //   'Gestión de pacientes',
    //   ...
    // ];
    
    return {
      currentSection,
      currentPage,
      availableFeatures: AVAILABLE_FEATURES, // Use imported constant
      recentlyUsedFeatures: [] // Server-side might not track this in the same way or at all
    };
  }
  
  /**
   * Get data context based on the current user and request
   * @param userId User ID to get data for
   * @param patientId Optional patient ID to include patient context
   * @returns Promise resolving to data context or null if not available
   */
  static async getDataContext(userId: string, patientId?: string): Promise<ServerDataContext | null> {
    try {
      const dataContext: Partial<ServerDataContext> = {}; // Use Partial for building up the object
      
      const recentActivitiesDb = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          action: true,
          details: true,
          createdAt: true
        }
      });
      
      if (recentActivitiesDb.length > 0) {
        dataContext.recentActivities = recentActivitiesDb.map(activity => ({
          type: activity.action,
          description: typeof activity.details === 'string' 
            ? activity.details 
            : JSON.stringify(activity.details),
          timestamp: activity.createdAt
        }));
      }
      
      if (patientId) {
        const hasAccess = await prisma.patient.findFirst({
          where: { id: patientId, createdById: userId }
        });
        
        if (hasAccess) {
          const patientData = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
            }
          });
          
          if (patientData) {
            dataContext.patientId = patientData.id;
            const age = patientData.dateOfBirth ? new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear() : undefined;
            dataContext.patientSummary = {
                id: patientData.id,
                name: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
                age: age,
                gender: patientData.gender
            };
          }
        } else {
            logger.warn('User does not have access to patient or patient not found', { userId, patientId });
        }
      }
      
      const upcomingAppointmentsDb = await prisma.appointment.findMany({
        where: {
          userId,
          date: { gte: new Date() }
        },
        orderBy: { date: 'asc' },
        take: 3,
        select: {
          id: true,
          date: true,
          title: true,
          patient: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      if (upcomingAppointmentsDb.length > 0) {
        dataContext.upcomingAppointments = upcomingAppointmentsDb.map(appt => ({
            id: appt.id,
            date: appt.date,
            title: appt.title,
            patientName: `${appt.patient.firstName || ''} ${appt.patient.lastName || ''}`.trim()
        }));
      }
      
      return Object.keys(dataContext).length > 0 ? dataContext as ServerDataContext : null;
    } catch (error) {
      logger.error('Error getting data context:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }
  
  /**
   * Get complete platform context
   * @param currentSection Optional current section name
   * @param currentPage Optional current page name
   * @param patientId Optional patient ID to include patient context
   * @param session Optional session object to use instead of fetching from request context
   * @returns Promise resolving to platform context
   */
  static async getPlatformContext(
    currentSection?: string,
    currentPage?: string,
    patientId?: string,
    session?: any
  ): Promise<ServerPlatformContext> {
    const user = await this.getUserContext(session);
    const application = this.getApplicationContext(currentSection, currentPage);
    const data = user && user.id ? await this.getDataContext(user.id, patientId) : null;
    
    return {
      user,
      application,
      data,
      // sessionId and timestamp are more client-centric, omitted here unless specifically needed
    };
  }
  
  /**
   * Format platform context for use in AI prompts
   * @param context Platform context object
   * @returns Formatted context object for AI prompts
   */
  static formatContextForPrompt(context: ServerPlatformContext): Record<string, any> {
    const formattedContext: Record<string, any> = {};
    
    // Format user context
    if (context.user) {
      formattedContext.userName = context.user.name;
      formattedContext.userRole = context.user.role;
    }
    
    // Format application context
    if (context.application) {
      formattedContext.currentSection = context.application.currentSection;
      formattedContext.platformFeatures = context.application.availableFeatures;
    }
    
    // Format data context (with privacy considerations)
    if (context.data) {
      // Include recent activities
      if (context.data.recentActivities && context.data.recentActivities.length > 0) {
        formattedContext.recentActivity = context.data.recentActivities.map(
          activity => `${activity.type}: ${activity.description}`
        );
      }
      
      // Include patient context if available (minimal information)
      if (context.data.patientSummary) {
        formattedContext.patientContext = {
          available: true,
          // Don't include actual patient data in the prompt by default
          // The AI can request specific information if needed and authorized
        };
      }
    }
    
    return formattedContext;
  }
}

/**
 * Get formatted context for AI prompts
 * @param currentSection Optional current section name
 * @param currentPage Optional current page name
 * @param patientId Optional patient ID to include patient context
 * @param session Optional session object to use instead of fetching from request context
 * @returns Promise resolving to formatted context for AI prompts
 */
export async function getAIContext(
  currentSection?: string,
  currentPage?: string,
  patientId?: string,
  session?: any
): Promise<Record<string, any>> {
  const platformContext = await ContextGatherer.getPlatformContext(
    currentSection,
    currentPage,
    patientId,
    session
  );
  // Assuming formatContextForPrompt exists and works with ServerPlatformContext
  // This might need adjustment if formatContextForPrompt is significantly different
  return ContextGatherer.formatContextForPrompt(platformContext); 
}