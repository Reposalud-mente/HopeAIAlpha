/**
 * Configuration for the RAG-based Clinical Report Generator
 */

/**
 * Default configuration for the clinical report agent
 */
export const DEFAULT_CONFIG = {
  // Gemini model configuration
  modelName: 'gemini-2.5-flash-preview-04-17',
  temperature: 0.7,
  maxTokens: 4096,
  topK: 3,
  streamResponse: true,
  
  // DSM-5 retrieval configuration
  maxResults: 5,
  minRelevanceScore: 0.7,
};

/**
 * Environment variables for the clinical report agent
 */
export const ENV = {
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  DSM5_DRIVE_FOLDER_ID: process.env.NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID || '',
  GOOGLE_DRIVE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || '',
};

/**
 * Validates the required environment variables
 * @returns An object with validation results
 */
export function validateEnvironment() {
  const missingVars = [];
  
  if (!ENV.GEMINI_API_KEY) {
    missingVars.push('NEXT_PUBLIC_GEMINI_API_KEY');
  }
  
  if (!ENV.DSM5_DRIVE_FOLDER_ID) {
    missingVars.push('NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID');
  }
  
  if (!ENV.GOOGLE_DRIVE_API_KEY) {
    missingVars.push('NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY');
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
