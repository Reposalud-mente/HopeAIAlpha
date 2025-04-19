/**
 * Monitoring System
 * 
 * This module provides monitoring and error tracking capabilities.
 * It's designed to be easily swappable with different monitoring services.
 */

// Types for monitoring events
export enum EventType {
  PAGE_VIEW = 'page_view',
  FEATURE_USAGE = 'feature_usage',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  USER_ACTION = 'user_action',
}

export interface MonitoringEvent {
  type: EventType;
  name: string;
  data?: Record<string, any>;
  timestamp?: number;
}

export interface ErrorEvent extends MonitoringEvent {
  type: EventType.ERROR;
  error: Error;
  componentStack?: string;
  context?: Record<string, any>;
}

// Configuration
interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of events to track
  consoleLogging: boolean;
  sentryDsn?: string;
  userId?: string;
  userRole?: string;
  environment: string;
}

// Default configuration
const defaultConfig: MonitoringConfig = {
  enabled: process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true',
  sampleRate: 1.0, // Track all events by default
  consoleLogging: process.env.NODE_ENV !== 'production',
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
};

let currentConfig: MonitoringConfig = { ...defaultConfig };

/**
 * Initialize the monitoring system
 */
export function initMonitoring(config: Partial<MonitoringConfig> = {}) {
  currentConfig = {
    ...defaultConfig,
    ...config,
  };

  if (currentConfig.enabled) {
    // Initialize Sentry if DSN is provided
    if (currentConfig.sentryDsn && typeof window !== 'undefined') {
      // This would be replaced with actual Sentry initialization
      console.log('Sentry would be initialized with:', currentConfig.sentryDsn);
    }

    // Log initialization
    if (currentConfig.consoleLogging) {
      console.log(`Monitoring initialized in ${currentConfig.environment} environment`);
    }
  }
}

/**
 * Track an event
 */
export function trackEvent(event: MonitoringEvent) {
  if (!currentConfig.enabled) return;

  // Apply sampling
  if (Math.random() > currentConfig.sampleRate) return;

  // Add timestamp if not provided
  const eventWithTimestamp = {
    ...event,
    timestamp: event.timestamp || Date.now(),
  };

  // Log to console in development
  if (currentConfig.consoleLogging) {
    console.log('Monitoring event:', eventWithTimestamp);
  }

  // Send to monitoring service (would be implemented with actual service)
  // This is a placeholder for actual implementation
  if (typeof window !== 'undefined') {
    // Example: send to a monitoring endpoint
    // fetch('/api/monitoring', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(eventWithTimestamp),
    // }).catch(err => console.error('Failed to send monitoring event:', err));
  }
}

/**
 * Track an error
 */
export function trackError(error: Error, componentStack?: string, context?: Record<string, any>) {
  if (!currentConfig.enabled) return;

  const errorEvent: ErrorEvent = {
    type: EventType.ERROR,
    name: error.name,
    error,
    componentStack,
    context,
    data: {
      message: error.message,
      stack: error.stack,
    },
  };

  // Log to console in development
  if (currentConfig.consoleLogging) {
    console.error('Error tracked:', errorEvent);
  }

  // Send to monitoring service (would be implemented with actual service)
  // This is a placeholder for actual implementation
}

/**
 * Track a page view
 */
export function trackPageView(path: string, referrer?: string) {
  trackEvent({
    type: EventType.PAGE_VIEW,
    name: 'page_view',
    data: {
      path,
      referrer,
    },
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, data?: Record<string, any>) {
  trackEvent({
    type: EventType.FEATURE_USAGE,
    name: featureName,
    data,
  });
}

/**
 * Track user action
 */
export function trackUserAction(actionName: string, data?: Record<string, any>) {
  trackEvent({
    type: EventType.USER_ACTION,
    name: actionName,
    data,
  });
}

/**
 * Track performance metric
 */
export function trackPerformance(metricName: string, durationMs: number, data?: Record<string, any>) {
  trackEvent({
    type: EventType.PERFORMANCE,
    name: metricName,
    data: {
      durationMs,
      ...data,
    },
  });
}

/**
 * Set user information for monitoring
 */
export function setUserInfo(userId: string, userRole?: string) {
  currentConfig.userId = userId;
  currentConfig.userRole = userRole;

  // Update user info in monitoring service
  // This is a placeholder for actual implementation
}

// Initialize monitoring on module load
if (typeof window !== 'undefined') {
  initMonitoring();
}
