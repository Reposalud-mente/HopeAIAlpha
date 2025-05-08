/**
 * Configuration for the Enhanced AI Floating Assistant
 */

import { AssistantConfig } from './types';

// Default configuration
export const DEFAULT_CONFIG: AssistantConfig = {
  modelName: 'gemini-2.0-flash', // Using the latest Gemini model
  temperature: 0.7,
  maxTokens: 1024,
  maxResponseLength: 1000, // Maximum length of responses in characters
  cacheExpiryTime: 30 * 60 * 1000, // 30 minutes in milliseconds
  enableFunctionCalling: true,
  enableStreaming: true,
};

// Available features in the application
export const AVAILABLE_FEATURES: string[] = [
  'Gestión de pacientes',
  'Evaluación psicológica',
  'Documentación clínica',
  'Planificación de tratamientos',
  'Agenda y citas',
  'Consultas AI',
];

// Environment variables
export const ENV = {
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Function to get the API key
export function getApiKey(): string {
  if (!ENV.GEMINI_API_KEY) {
    console.warn('NEXT_PUBLIC_GEMINI_API_KEY is not set. AI Assistant will not function properly.');
    console.warn('Please set the NEXT_PUBLIC_GEMINI_API_KEY environment variable in your .env.local file.');

    // For development purposes only, you can set a fallback API key here
    // This should be removed in production
    if (ENV.NODE_ENV === 'development') {
      console.warn('Using fallback API key for development. DO NOT USE IN PRODUCTION.');
      // Check if there's a key in localStorage (for development testing only)
      if (typeof window !== 'undefined') {
        const localKey = localStorage.getItem('GEMINI_API_KEY');
        if (localKey) {
          console.log('Using API key from localStorage for development');
          return localKey;
        }
      }
    }
  } else {
    console.log('API key found with length:', ENV.GEMINI_API_KEY.length);
  }

  return ENV.GEMINI_API_KEY;
}

// Function to create a configuration with custom options
export function createConfig(options: Partial<AssistantConfig>): AssistantConfig {
  return {
    ...DEFAULT_CONFIG,
    ...options,
    apiKey: getApiKey(),
  };
}
