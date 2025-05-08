/**
 * Type definitions for the Enhanced AI Floating Assistant
 */

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCalls?: FunctionCall[];
  functionResults?: FunctionResult[];
}

// Function call types
export interface FunctionCall {
  name: string;
  args: Record<string, any>;
  id: string;
}

export interface FunctionResult {
  callId: string;
  result: any;
  error?: string;
}

// Context types
export interface UserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  preferences?: Record<string, any>;
  lastActivity?: Date;
}

export interface ApplicationContext {
  currentSection?: string;
  currentPage?: string;
  availableFeatures: string[];
  recentlyUsedFeatures?: string[];
  navigationHistory?: string[];
}

export interface DataContext {
  patientId?: string;
  patientName?: string;
  patientInfo?: Record<string, any>;
  recentPatients?: string[];
}

export interface PlatformContext {
  user: UserContext;
  application: ApplicationContext;
  data: DataContext | null;
}

// Configuration types
export interface AssistantConfig {
  apiKey?: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  maxResponseLength: number;
  cacheExpiryTime: number;
  enableFunctionCalling: boolean;
  enableStreaming: boolean;
}

// Service response types
export interface AssistantResponse {
  text: string;
  functionCalls?: FunctionCall[];
  status?: 'success' | 'fallback_success' | 'error';
  error?: { message: string; code: string };
}

// Tool types
export interface ToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface ToolImplementation {
  execute: (args: any, userId: string) => Promise<any>;
  validate: (args: any) => any;
}

export interface Tool {
  declaration: ToolDeclaration;
  implementation: ToolImplementation;
}
