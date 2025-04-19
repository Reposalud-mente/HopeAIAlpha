/**
 * Feature Flags System
 * 
 * This module provides a centralized way to manage feature flags in the application.
 * Feature flags allow for controlled rollout of new features and A/B testing.
 */

// Define all available feature flags
export enum FeatureFlag {
  // Core features
  EXPERIMENTAL_UI = 'experimentalUI',
  ADVANCED_ANALYTICS = 'advancedAnalytics',
  ENHANCED_REPORTING = 'enhancedReporting',
  
  // Alpha testing specific features
  ALPHA_FEEDBACK = 'alphaFeedback',
  DEBUG_TOOLS = 'debugTools',
  
  // AI features
  AI_SUGGESTIONS = 'aiSuggestions',
  AI_REPORT_GENERATION = 'aiReportGeneration',
}

// Default state of feature flags
const defaultFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.EXPERIMENTAL_UI]: false,
  [FeatureFlag.ADVANCED_ANALYTICS]: false,
  [FeatureFlag.ENHANCED_REPORTING]: false,
  [FeatureFlag.ALPHA_FEEDBACK]: false,
  [FeatureFlag.DEBUG_TOOLS]: false,
  [FeatureFlag.AI_SUGGESTIONS]: false,
  [FeatureFlag.AI_REPORT_GENERATION]: false,
};

// Environment-specific overrides
const environmentFlags: Record<string, Partial<Record<FeatureFlag, boolean>>> = {
  development: {
    [FeatureFlag.DEBUG_TOOLS]: true,
  },
  alpha: {
    [FeatureFlag.ALPHA_FEEDBACK]: true,
    [FeatureFlag.DEBUG_TOOLS]: true,
    [FeatureFlag.EXPERIMENTAL_UI]: true,
  },
  production: {
    // No experimental features enabled in production by default
  },
};

// User-specific overrides (can be loaded from user profile or localStorage)
let userFlags: Partial<Record<FeatureFlag, boolean>> = {};

/**
 * Initialize feature flags with user-specific overrides
 */
export function initFeatureFlags(userSpecificFlags?: Partial<Record<FeatureFlag, boolean>>) {
  if (userSpecificFlags) {
    userFlags = { ...userSpecificFlags };
  }
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Get current environment
  const appEnv = typeof window !== 'undefined' 
    ? (window as any).__APP_ENV__ || process.env.NEXT_PUBLIC_APP_ENV || 'development'
    : process.env.NEXT_PUBLIC_APP_ENV || 'development';
  
  // Check for feature flags override from URL (for testing)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const flagParam = urlParams.get(`ff_${flag}`);
    if (flagParam === 'true') return true;
    if (flagParam === 'false') return false;
  }
  
  // Priority: user-specific > environment-specific > default
  if (flag in userFlags) {
    return userFlags[flag] as boolean;
  }
  
  if (appEnv in environmentFlags && flag in environmentFlags[appEnv]) {
    return environmentFlags[appEnv][flag] as boolean;
  }
  
  return defaultFlags[flag];
}

/**
 * Enable a feature flag for the current user
 */
export function enableFeature(flag: FeatureFlag): void {
  userFlags[flag] = true;
  
  // Optionally persist to localStorage for the current user
  if (typeof window !== 'undefined') {
    try {
      const storedFlags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
      localStorage.setItem('featureFlags', JSON.stringify({
        ...storedFlags,
        [flag]: true,
      }));
    } catch (error) {
      console.error('Failed to save feature flag to localStorage:', error);
    }
  }
}

/**
 * Disable a feature flag for the current user
 */
export function disableFeature(flag: FeatureFlag): void {
  userFlags[flag] = false;
  
  // Optionally persist to localStorage for the current user
  if (typeof window !== 'undefined') {
    try {
      const storedFlags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
      localStorage.setItem('featureFlags', JSON.stringify({
        ...storedFlags,
        [flag]: false,
      }));
    } catch (error) {
      console.error('Failed to save feature flag to localStorage:', error);
    }
  }
}

/**
 * Load feature flags from localStorage (client-side only)
 */
export function loadFeatureFlags(): void {
  if (typeof window !== 'undefined') {
    try {
      const storedFlags = JSON.parse(localStorage.getItem('featureFlags') || '{}');
      userFlags = { ...userFlags, ...storedFlags };
    } catch (error) {
      console.error('Failed to load feature flags from localStorage:', error);
    }
  }
}

// Initialize feature flags on module load (client-side only)
if (typeof window !== 'undefined') {
  loadFeatureFlags();
  
  // Make the current environment available globally
  (window as any).__APP_ENV__ = process.env.NEXT_PUBLIC_APP_ENV || 'development';
}
