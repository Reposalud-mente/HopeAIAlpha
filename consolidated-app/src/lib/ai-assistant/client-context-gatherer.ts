/**
 * Client-side Context Gatherer for AI Assistant
 *
 * This module gathers relevant context about the platform, user, and current state
 * to enhance the AI assistant's responses with contextual awareness.
 *
 * This is a client-side version that doesn't rely on server-only APIs.
 */

/**
 * Types for context objects
 */
export interface UserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
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
  patientName?: string;
  patientInfo?: string;
}

export interface PlatformContext {
  user: UserContext | null;
  application: ApplicationContext;
  data: DataContext | null;
}

/**
 * Main context gatherer class for client-side use
 */
export class ClientContextGatherer {
  /**
   * Get user context from client-side
   * @param userName Optional user name to include in the context
   * @returns User context object or null
   */
  static getUserContext(userName?: string): UserContext | null {
    try {
      // Log the input for debugging
      console.log('getUserContext input:', { userName });

      // Make sure we have a valid user name, not an empty string
      const validUserName = userName && userName.trim() !== '' ? userName : null;

      // Log the processed name for debugging
      console.log('getUserContext processed name:', { validUserName });

      // Use the provided userName if available, otherwise use a default
      const result = {
        name: validUserName || 'Usuario',
        role: 'Profesional'
      };

      // Log the final result for debugging
      console.log('getUserContext result:', result);

      return result;
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Get application context based on the current page
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
      recentlyUsedFeatures: []
    };
  }

  /**
   * Get data context based on the current page
   * @param patientId Optional patient ID to include patient context
   * @param patientName Optional patient name
   * @returns Data context object or null
   */
  static getDataContext(patientId?: string, patientName?: string): DataContext | null {
    if (!patientId && !patientName) {
      return null;
    }

    return {
      patientId,
      patientName,
      patientInfo: patientName ? `Paciente: ${patientName}` : undefined
    };
  }

  /**
   * Get complete platform context
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
  ): PlatformContext {
    // Get user context with the provided user name
    const userContext = this.getUserContext(userName);

    // Get application context
    const applicationContext = this.getApplicationContext(currentSection, currentPage);

    // Get data context
    const dataContext = this.getDataContext(patientId, patientName);

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
    // Log the input context for debugging
    console.log('formatContextForPrompt input:', {
      userName: context.user?.name,
      userRole: context.user?.role
    });

    const formattedContext: Record<string, any> = {};

    // Format user context
    if (context.user) {
      formattedContext.userName = context.user.name;
      formattedContext.userRole = context.user.role;
    }

    // Format application context
    if (context.application) {
      formattedContext.currentSection = context.application.currentSection;
      formattedContext.currentPage = context.application.currentPage;
      formattedContext.platformFeatures = context.application.availableFeatures;
    }

    // Format data context
    if (context.data) {
      if (context.data.patientInfo) {
        formattedContext.patientInfo = context.data.patientInfo;
      }
    }

    // Log the output context for debugging
    console.log('formatContextForPrompt output:', {
      userName: formattedContext.userName,
      userRole: formattedContext.userRole
    });

    return formattedContext;
  }
}

/**
 * Get formatted context for AI prompts (client-side version)
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
  // Log the input parameters for debugging
  console.log('getClientAIContext input:', {
    currentSection,
    currentPage,
    patientId,
    patientName,
    userName
  });

  const platformContext = ClientContextGatherer.getPlatformContext(
    currentSection,
    currentPage,
    patientId,
    patientName,
    userName
  );

  const formattedContext = ClientContextGatherer.formatContextForPrompt(platformContext);

  // Log the output context for debugging
  console.log('getClientAIContext output:', {
    userName: formattedContext.userName
  });

  return formattedContext;
}
