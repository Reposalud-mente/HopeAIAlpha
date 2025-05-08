/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with context information
 */

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Define logger interface
export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
}

// Default minimum log level
let minLogLevel: LogLevel = LogLevel.INFO;

// Set the minimum log level
export function setMinLogLevel(level: LogLevel): void {
  minLogLevel = level;
}

// Check if a log level should be logged
function shouldLog(level: LogLevel): boolean {
  const levels = Object.values(LogLevel);
  const minLevelIndex = levels.indexOf(minLogLevel);
  const currentLevelIndex = levels.indexOf(level);
  return currentLevelIndex >= minLevelIndex;
}

// Format a log message with context
function formatLogMessage(message: string, context?: Record<string, any>): string {
  if (!context || Object.keys(context).length === 0) {
    return message;
  }
  
  try {
    return `${message} ${JSON.stringify(context)}`;
  } catch (error) {
    return `${message} [Context serialization error: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

// Create a logger instance
export const logger: Logger = {
  debug(message: string, context?: Record<string, any>): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.debug(`[DEBUG] ${formatLogMessage(message, context)}`);
    }
  },
  
  info(message: string, context?: Record<string, any>): void {
    if (shouldLog(LogLevel.INFO)) {
      console.info(`[INFO] ${formatLogMessage(message, context)}`);
    }
  },
  
  warn(message: string, context?: Record<string, any>): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(`[WARN] ${formatLogMessage(message, context)}`);
    }
  },
  
  error(message: string, context?: Record<string, any>): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(`[ERROR] ${formatLogMessage(message, context)}`);
    }
  },
};

// Export a default logger instance
export default logger;