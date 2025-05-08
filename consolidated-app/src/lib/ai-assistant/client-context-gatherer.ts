/**
 * Enhanced Client-side Context Gatherer for AI Assistant
 *
 * This module gathers relevant context about the platform, user, and current state
 * to enhance the AI assistant's responses with contextual awareness.
 *
 * Implements advanced context management for better AI assistant performance.
 *
 * This is a client-side version that doesn't rely on server-only APIs.
 */

import { logger } from '@/lib/logger';
import {
  ClientUserContext,
  ClientApplicationContext,
  ClientDataContext,
  ClientPlatformContext,
  AVAILABLE_FEATURES
} from './context-types';

/**
 * Types for context objects
 */
export interface UserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  preferences?: Record<string, any>;
  lastActivity?: Date;
  sessionStartTime?: Date;
}

export interface ApplicationContext {
  currentSection?: string;
  currentPage?: string;
  availableFeatures: string[];
  recentlyUsedFeatures?: string[];
  currentView?: string;
  navigationHistory?: string[];
}

export interface DataContext {
  patientId?: string;
  patientName?: string;
  patientInfo?: string;
  recentPatients?: string[];
  currentDocumentType?: string;
}

export interface PlatformContext {
  user: UserContext | null;
  application: ApplicationContext;
  data: DataContext | null;
  sessionId?: string;
  timestamp: Date;
}

// Store context history for the current session
const contextHistory: ClientPlatformContext[] = [];
const MAX_CONTEXT_HISTORY = 10;

/**
 * Main context gatherer class for client-side use
 */
export class ClientContextGatherer {
  /**
   * Get user context from client-side with enhanced user recognition
   * @param userName Optional user name to include in the context
   * @returns User context object or null
   */
  static getUserContext(userName?: string): ClientUserContext | null {
    try {
      // Make sure we have a valid user name, not an empty string
      const validUserName = userName && userName.trim() !== '' ? userName.trim() : null;

      // Log the processed name for debugging with proper logging
      logger.info('Processing user context', { validUserName });

      // Use the provided userName if available, otherwise use a default
      // Enhanced with additional user context properties
      const result: ClientUserContext = {
        name: validUserName || 'Usuario',
        role: 'Profesional',
        lastActivity: new Date(),
        sessionStartTime: this.getSessionStartTime()
      };

      return result;
    } catch (error) {
      logger.error('Error getting user context:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Get the session start time from localStorage or create a new one
   * @returns The session start time
   */
  private static getSessionStartTime(): Date {
    try {
      const storedTime = localStorage.getItem('ai_assistant_session_start');
      if (storedTime) {
        return new Date(storedTime);
      } else {
        const now = new Date();
        localStorage.setItem('ai_assistant_session_start', now.toISOString());
        return now;
      }
    } catch (error) {
      logger.error('Error getting session start time:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return new Date(); // Fallback to current date
    }
  }

  /**
   * Get application context based on the current page with enhanced context
   * @param currentSection Optional current section name
   * @param currentPage Optional current page name
   * @returns Application context object
   */
  static getApplicationContext(currentSection?: string, currentPage?: string): ClientApplicationContext {
    // Use the shared constant for available features
    // const availableFeatures = [ <-- Remove this local definition
    //   'Gestión de pacientes',
    //   'Evaluación psicológica',
    //   'Documentación clínica',
    //   'Planificación de tratamientos',
    //   'Agenda y citas',
    //   'Consultas AI'
    // ];

    // Get recently used features from localStorage
    const recentlyUsedFeatures = this.getRecentlyUsedFeatures();

    // Get navigation history
    const navigationHistory = this.getNavigationHistory(currentSection, currentPage);

    // Return the enhanced application context
    return {
      currentSection,
      currentPage,
      availableFeatures: AVAILABLE_FEATURES, // Use imported constant
      recentlyUsedFeatures,
      navigationHistory
      // currentView is part of ClientApplicationContext, ensure it's handled or add if necessary
    };
  }

  /**
   * Get recently used features from localStorage
   * @returns Array of recently used features
   */
  private static getRecentlyUsedFeatures(): string[] {
    try {
      const storedFeatures = localStorage.getItem('ai_assistant_recent_features');
      if (storedFeatures) {
        return JSON.parse(storedFeatures);
      }
      return [];
    } catch (error) {
      logger.error('Error getting recently used features:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Get navigation history and update it with current location
   * @param currentSection Current section name
   * @param currentPage Current page name
   * @returns Array of navigation history items
   */
  private static getNavigationHistory(currentSection?: string, currentPage?: string): string[] {
    try {
      // Get existing navigation history
      const storedHistory = localStorage.getItem('ai_assistant_navigation_history');
      let history: string[] = storedHistory ? JSON.parse(storedHistory) : [];

      // Add current location if provided
      if (currentSection && currentPage) {
        const currentLocation = `${currentSection} > ${currentPage}`;

        // Only add if it's different from the last entry
        if (history.length === 0 || history[history.length - 1] !== currentLocation) {
          history.push(currentLocation);

          // Limit history length
          if (history.length > 5) {
            history = history.slice(-5);
          }

          // Save updated history
          localStorage.setItem('ai_assistant_navigation_history', JSON.stringify(history));
        }
      }

      return history;
    } catch (error) {
      logger.error('Error managing navigation history:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Get data context based on the current page with enhanced patient context
   * @param patientId Optional patient ID to include patient context
   * @param patientName Optional patient name
   * @returns Data context object or null
   */
  static getDataContext(patientId?: string, patientName?: string): ClientDataContext | null {
    if (!patientId && !patientName) {
      return null;
    }

    // Get recent patients from localStorage
    const recentPatients = this.getRecentPatients(patientId, patientName);

    return {
      patientId,
      patientName,
      patientInfo: patientName ? `Paciente: ${patientName}` : undefined,
      recentPatients
    };
  }

  /**
   * Get recent patients from localStorage and update with current patient
   * @param patientId Current patient ID
   * @param patientName Current patient name
   * @returns Array of recent patient names
   */
  private static getRecentPatients(patientId?: string, patientName?: string): string[] {
    try {
      // Get existing recent patients
      const storedPatients = localStorage.getItem('ai_assistant_recent_patients');
      let recentPatients: string[] = storedPatients ? JSON.parse(storedPatients) : [];

      // Add current patient if provided
      if (patientName) {
        // Remove if already exists (to move to top)
        recentPatients = recentPatients.filter(name => name !== patientName);

        // Add to beginning
        recentPatients.unshift(patientName);

        // Limit to 5 recent patients
        if (recentPatients.length > 5) {
          recentPatients = recentPatients.slice(0, 5);
        }

        // Save updated list
        localStorage.setItem('ai_assistant_recent_patients', JSON.stringify(recentPatients));
      }

      return recentPatients;
    } catch (error) {
      logger.error('Error managing recent patients:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Get complete platform context with enhanced context management
   * @param currentSection Optional current section name
   * @param currentPage Optional current page name
   * @param patientId Optional patient ID to include patient context
   * @param patientName Optional patient name
   * @param userName Optional user name to include in the context
   * @returns Platform context object
   */
  static getPlatformContext(
    currentSection?: string,
    currentPage?: string,
    patientId?: string,
    patientName?: string,
    userName?: string
  ): ClientPlatformContext {
    // Get user context
    const user = this.getUserContext(userName);

    // Get application context
    const application = this.getApplicationContext(currentSection, currentPage);

    // Get data context
    const data = this.getDataContext(patientId, patientName);

    // Get or create session ID
    const sessionId = this.getSessionId();

    // Create the platform context
    const platformContext: ClientPlatformContext = {
      user,
      application,
      data,
      sessionId,
      timestamp: new Date()
    };

    // Store in history
    this.storeContextInHistory(platformContext);

    return platformContext;
  }

  /**
   * Get or create a session ID for the current user session
   * @returns Session ID string
   */
  private static getSessionId(): string {
    try {
      let sessionId = localStorage.getItem('ai_assistant_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('ai_assistant_session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      logger.error('Error getting session ID:', { errorMessage: error instanceof Error ? error.message : String(error) });
      return `session_${Date.now()}`; // Fallback session ID
    }
  }

  /**
   * Store context in history for better context awareness
   * @param context Platform context to store
   */
  private static storeContextInHistory(context: ClientPlatformContext): void {
    contextHistory.push(context);
    if (contextHistory.length > MAX_CONTEXT_HISTORY) {
      contextHistory.shift();
    }
  }

  /**
   * Get context history for enhanced context awareness
   * @param limit Optional limit on number of history items to return
   * @returns Array of context history items
   */
  static getContextHistory(limit: number = MAX_CONTEXT_HISTORY): ClientPlatformContext[] {
    return contextHistory.slice(-limit);
  }

  /**
   * Format platform context for use in AI prompts with enhanced context
   * @param context Platform context object
   * @returns Formatted context object for AI prompts
   */
  static formatContextForPrompt(context: ClientPlatformContext): Record<string, any> {
    logger.info('Formatting context for prompt', {
      userName: context.user?.name,
      userRole: context.user?.role,
      currentSection: context.application?.currentSection
    });

    const formattedContext: Record<string, any> = {};

    // Format user context with emphasis on user name for better recognition
    if (context.user) {
      formattedContext.userName = context.user.name;
      formattedContext.userRole = context.user.role;

      // Add session duration for context awareness
      if (context.user.sessionStartTime) {
        const sessionDuration = Math.floor((new Date().getTime() - context.user.sessionStartTime.getTime()) / 60000);
        formattedContext.sessionDuration = `${sessionDuration} minutos`;
      }
    }

    // Format application context with enhanced navigation awareness
    if (context.application) {
      formattedContext.currentSection = context.application.currentSection;
      formattedContext.currentPage = context.application.currentPage;
      formattedContext.platformFeatures = context.application.availableFeatures;

      // Add navigation history for better context awareness
      if (context.application.navigationHistory && context.application.navigationHistory.length > 0) {
        formattedContext.navigationHistory = context.application.navigationHistory;
      }

      // Add recently used features
      if (context.application.recentlyUsedFeatures && context.application.recentlyUsedFeatures.length > 0) {
        formattedContext.recentlyUsedFeatures = context.application.recentlyUsedFeatures;
      }
    }

    // Format data context with enhanced patient awareness
    if (context.data) {
      if (context.data.patientInfo) {
        formattedContext.patientInfo = context.data.patientInfo;
      }

      // Add recent patients for better context awareness
      if (context.data.recentPatients && context.data.recentPatients.length > 0) {
        formattedContext.recentPatients = context.data.recentPatients;
      }
    }

    // Add session ID for conversation continuity
    if (context.sessionId) {
      formattedContext.sessionId = context.sessionId;
    }

    return formattedContext;
  }
}

/**
 * Get formatted context for AI prompts (client-side version)
 * Enhanced with better context management for improved AI assistant performance
 * @param currentSection Optional current section name
 * @param currentPage Optional current page name
 * @param patientId Optional patient ID to include patient context
 * @param patientName Optional patient name
 * @param userName Optional user name to include in the context
 * @returns Formatted context for AI prompts
 */
export function getClientAIContext(
  currentSection?: string,
  currentPage?: string,
  patientId?: string,
  patientName?: string,
  userName?: string
): Record<string, any> {
  const context = ClientContextGatherer.getPlatformContext(
    currentSection,
    currentPage,
    patientId,
    patientName,
    userName
  );
  return ClientContextGatherer.formatContextForPrompt(context);
}
