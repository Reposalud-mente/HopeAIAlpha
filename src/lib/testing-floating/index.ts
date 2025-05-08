/**
 * Enhanced AI Floating Assistant
 *
 * A new implementation of the AI Floating Assistant with improved functionality:
 * - Tool integration for administrative actions
 * - Enhanced UI/UX
 * - Context awareness based on User ID
 */

// Export types
export * from './types';

// Export core components
export * from './core';

// Export context components - using named exports to avoid conflicts
export {
  getClientContext,
  ContextGatherer,
  APP_FEATURES as CONTEXT_FEATURES
} from './context';

// Export tool components
export * from './tools';

// Export state components
export * from './state';

// Export UI components
export * from './ui';

// Export config - using named exports to avoid conflicts
export {
  DEFAULT_CONFIG,
  AVAILABLE_FEATURES,
  ENV,
  getApiKey,
  createConfig
} from './config';

// Export ConditionalEnhancedAssistant for use in the app
export { ConditionalEnhancedAssistant } from './ui/conditional-assistant';
