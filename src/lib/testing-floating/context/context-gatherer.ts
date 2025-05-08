/**
 * Context gatherer for the Enhanced AI Floating Assistant
 * Gathers context about the user, application, and data
 */

import {
  UserContext,
  ApplicationContext,
  DataContext,
  PlatformContext
} from './context-types';
import { APP_FEATURES } from './context-types';

/**
 * Context gatherer class
 */
export class ContextGatherer {
  /**
   * Get platform context
   * @param currentSection Current section
   * @param currentPage Current page
   * @param patientId Patient ID
   * @param patientName Patient name
   * @param userName User name
   * @returns Platform context
   */
  static getPlatformContext(
    currentSection?: string,
    currentPage?: string,
    patientId?: string,
    patientName?: string,
    userName?: string
  ): PlatformContext {
    const userContext = this.getUserContext(userName);
    const applicationContext = this.getApplicationContext(currentSection, currentPage);
    const dataContext = this.getDataContext(patientId, patientName);

    return {
      user: userContext,
      application: applicationContext,
      data: dataContext,
    };
  }

  /**
   * Get user context
   * @param userName User name
   * @returns User context
   */
  static getUserContext(userName?: string): UserContext {
    // Get user preferences from localStorage if available
    let preferences = {};
    if (typeof window !== 'undefined') {
      try {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          preferences = JSON.parse(storedPreferences);
        }
      } catch (error) {
        console.error('Error parsing user preferences:', error);
      }
    }

    return {
      name: userName,
      lastActivity: new Date(),
      preferences,
    };
  }

  /**
   * Get application context
   * @param currentSection Current section
   * @param currentPage Current page
   * @returns Application context
   */
  static getApplicationContext(currentSection?: string, currentPage?: string): ApplicationContext {
    // Get recently used features from localStorage
    const recentlyUsedFeatures = this.getRecentlyUsedFeatures();

    // Get navigation history
    const navigationHistory = this.getNavigationHistory(currentSection, currentPage);

    return {
      currentSection,
      currentPage,
      availableFeatures: APP_FEATURES,
      recentlyUsedFeatures,
      navigationHistory,
    };
  }

  /**
   * Get data context
   * @param patientId Patient ID
   * @param patientName Patient name
   * @returns Data context
   */
  static getDataContext(patientId?: string, patientName?: string): DataContext | null {
    // Even if no patient is specified, return a context with recent patients
    // This helps the AI assistant be aware of recent patients
    const recentPatients = this.getRecentPatients();

    // Try to get patient info from localStorage if available
    let patientInfo: Record<string, any> = {};
    if (patientId || patientName) {
      try {
        // Try to get patient info from localStorage
        if (typeof window !== 'undefined') {
          // First try by ID
          if (patientId) {
            const storedPatientInfo = localStorage.getItem(`patient_${patientId}`);
            if (storedPatientInfo) {
              patientInfo = JSON.parse(storedPatientInfo);
            }
          }
          // If not found and we have a name, try by name
          else if (patientName && !Object.keys(patientInfo).length) {
            // This is a simplified approach - in a real app, you'd query a database
            const allPatients = localStorage.getItem('allPatients');
            if (allPatients) {
              const patients = JSON.parse(allPatients);
              const patient = patients.find((p: any) =>
                p.name && p.name.toLowerCase() === patientName.toLowerCase()
              );
              if (patient) {
                patientInfo = patient;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error getting patient info:', error);
      }
    }

    // Log the context for debugging
    console.log('Data context:', { patientId, patientName, recentPatients, patientInfo });

    return {
      patientId,
      patientName,
      patientInfo: Object.keys(patientInfo).length > 0 ? patientInfo : undefined,
      recentPatients,
    };
  }

  /**
   * Get recently used features from localStorage
   * @returns Recently used features
   */
  private static getRecentlyUsedFeatures(): string[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storedFeatures = localStorage.getItem('recentlyUsedFeatures');
      if (storedFeatures) {
        return JSON.parse(storedFeatures);
      }
    } catch (error) {
      console.error('Error parsing recently used features:', error);
    }

    return [];
  }

  /**
   * Get navigation history
   * @param currentSection Current section
   * @param currentPage Current page
   * @returns Navigation history
   */
  private static getNavigationHistory(currentSection?: string, currentPage?: string): string[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storedHistory = localStorage.getItem('navigationHistory');
      let history: string[] = storedHistory ? JSON.parse(storedHistory) : [];

      // Add current page to history if available
      if (currentSection && currentPage) {
        const currentPath = `${currentSection}/${currentPage}`;

        // Remove duplicates
        history = history.filter(path => path !== currentPath);

        // Add current path to the beginning
        history.unshift(currentPath);

        // Limit history to 10 items
        history = history.slice(0, 10);

        // Save updated history
        localStorage.setItem('navigationHistory', JSON.stringify(history));
      }

      return history;
    } catch (error) {
      console.error('Error managing navigation history:', error);
      return [];
    }
  }

  /**
   * Get recent patients from localStorage
   * @returns Recent patients
   */
  private static getRecentPatients(): string[] {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const storedPatients = localStorage.getItem('recentPatients');
      if (storedPatients) {
        return JSON.parse(storedPatients);
      }
    } catch (error) {
      console.error('Error parsing recent patients:', error);
    }

    return [];
  }
}

/**
 * Get client AI context
 * @param currentSection Current section
 * @param currentPage Current page
 * @param patientId Patient ID
 * @param patientName Patient name
 * @param userName User name
 * @returns Platform context
 */
export function getClientContext(
  currentSection?: string,
  currentPage?: string,
  patientId?: string,
  patientName?: string,
  userName?: string
): PlatformContext {
  return ContextGatherer.getPlatformContext(
    currentSection,
    currentPage,
    patientId,
    patientName,
    userName
  );
}
