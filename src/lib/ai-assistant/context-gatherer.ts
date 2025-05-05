/**
 * Context Gatherer for AI Assistant
 * 
 * This module gathers relevant context about the platform, user, and current state
 * to enhance the AI assistant's responses with contextual awareness.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

/**
 * Types for context objects
 */
export interface UserContext {
  id: string;
  name: string;
  email: string;
  role: string;
  preferences?: Record<string, any>;
}

export interface ApplicationContext {
  currentSection?: string;
  currentPage?: string;
  availableFeatures: string[];
  recentlyUsedFeatures?: string[];
}

export interface DataContext {
  patientId?: string;
  patientSummary?: any;
  recentActivities?: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
  upcomingAppointments?: any[];
}

export interface PlatformContext {
  user: UserContext | null;
  application: ApplicationContext;
  data: DataContext | null;
}

/**
 * Main context gatherer class
 */
export class ContextGatherer {
  /**
   * Get user context based on the current session
   * @returns Promise resolving to user context or null if not authenticated
   */
  static async getUserContext(): Promise<UserContext | null> {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return null;
      }
      
      // Get additional user information from the database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          preferences: true
        }
      });
      
      if (!user) {
        return null;
      }
      
      return {
        id: user.id,
        name: user.name || 'Usuario',
        email: user.email || '',
        role: user.role || 'Profesional',
        preferences: user.preferences as Record<string, any> || {}
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }
  
  /**
   * Get application context based on the current request
   * @param currentSection Optional current section name
   * @param currentPage Optional current page name
   * @returns Application context object
   */
  static getApplicationContext(currentSection?: string, currentPage?: string): ApplicationContext {
    // Define available features based on the platform capabilities
    const availableFeatures = [
      'Gestión de pacientes',
      'Evaluación psicológica',
      'Documentación clínica',
      'Planificación de tratamientos',
      'Agenda y citas',
      'Consultas AI'
    ];
    
    // Return the application context
    return {
      currentSection,
      currentPage,
      availableFeatures,
      // In a real implementation, this could be fetched from user analytics
      recentlyUsedFeatures: []
    };
  }
  
  /**
   * Get data context based on the current user and request
   * @param userId User ID to get data for
   * @param patientId Optional patient ID to include patient context
   * @returns Promise resolving to data context or null if not available
   */
  static async getDataContext(userId: string, patientId?: string): Promise<DataContext | null> {
    try {
      const dataContext: DataContext = {};
      
      // Get recent activities for the user
      const recentActivities = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          action: true,
          details: true,
          createdAt: true
        }
      });
      
      if (recentActivities.length > 0) {
        dataContext.recentActivities = recentActivities.map(activity => ({
          type: activity.action,
          description: typeof activity.details === 'string' 
            ? activity.details 
            : JSON.stringify(activity.details),
          timestamp: activity.createdAt
        }));
      }
      
      // If patient ID is provided, get patient summary
      if (patientId) {
        // Check if user has access to this patient
        const hasAccess = await prisma.patient.findFirst({
          where: {
            id: patientId,
            userId
          }
        });
        
        if (hasAccess) {
          const patient = await prisma.patient.findUnique({
            where: { id: patientId },
            select: {
              id: true,
              name: true,
              age: true,
              gender: true,
              // Include only non-sensitive information for context
              // Detailed clinical information should be accessed only when explicitly needed
            }
          });
          
          if (patient) {
            dataContext.patientId = patient.id;
            dataContext.patientSummary = patient;
          }
        }
      }
      
      // Get upcoming appointments
      const upcomingAppointments = await prisma.appointment.findMany({
        where: {
          userId,
          date: {
            gte: new Date()
          }
        },
        orderBy: { date: 'asc' },
        take: 3,
        select: {
          id: true,
          date: true,
          patientName: true,
          type: true
        }
      });
      
      if (upcomingAppointments.length > 0) {
        dataContext.upcomingAppointments = upcomingAppointments;
      }
      
      return Object.keys(dataContext).length > 0 ? dataContext : null;
    } catch (error) {
      console.error('Error getting data context:', error);
      return null;
    }
  }
  
  /**
   * Get complete platform context
   * @param currentSection Optional current section name
   * @param currentPage Optional current page name
   * @param patientId Optional patient ID to include patient context
   * @returns Promise resolving to platform context
   */
  static async getPlatformContext(
    currentSection?: string,
    currentPage?: string,
    patientId?: string
  ): Promise<PlatformContext> {
    // Get user context
    const userContext = await this.getUserContext();
    
    // Get application context
    const applicationContext = this.getApplicationContext(currentSection, currentPage);
    
    // Get data context if user is authenticated
    const dataContext = userContext 
      ? await this.getDataContext(userContext.id, patientId)
      : null;
    
    // Return the complete platform context
    return {
      user: userContext,
      application: applicationContext,
      data: dataContext
    };
  }
  
  /**
   * Format platform context for use in AI prompts
   * @param context Platform context object
   * @returns Formatted context object for AI prompts
   */
  static formatContextForPrompt(context: PlatformContext): Record<string, any> {
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
 * @returns Promise resolving to formatted context for AI prompts
 */
export async function getAIContext(
  currentSection?: string,
  currentPage?: string,
  patientId?: string
): Promise<Record<string, any>> {
  const platformContext = await ContextGatherer.getPlatformContext(
    currentSection,
    currentPage,
    patientId
  );
  
  return ContextGatherer.formatContextForPrompt(platformContext);
}