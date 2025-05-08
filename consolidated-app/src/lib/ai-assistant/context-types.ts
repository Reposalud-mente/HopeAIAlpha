/**
 * Shared type definitions for AI Assistant context.
 */

// Base User Context
export interface BaseUserContext {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  preferences?: Record<string, any>;
}

// Client-specific User Context
export interface ClientUserContext extends BaseUserContext {
  lastActivity?: Date;
  sessionStartTime?: Date;
}

// Server-specific User Context
export interface ServerUserContext extends BaseUserContext {
  // name is constructed from firstName and lastName from DB
  // preferences is not a direct field in the User model per schema.prisma
}

// Base Application Context
export interface BaseApplicationContext {
  currentSection?: string;
  currentPage?: string;
  availableFeatures: string[];
  recentlyUsedFeatures?: string[];
}

// Client-specific Application Context
export interface ClientApplicationContext extends BaseApplicationContext {
  currentView?: string;
  navigationHistory?: string[];
}

// Server-specific Application Context (might be the same as BaseApplicationContext)
export interface ServerApplicationContext extends BaseApplicationContext {
  // Add any server-specific fields if necessary
}

// Base Data Context
export interface BaseDataContext {
  patientId?: string;
}

// Client-specific Data Context
export interface ClientDataContext extends BaseDataContext {
  patientName?: string;
  patientInfo?: string; // Derived from patientName on client
  recentPatients?: string[]; // Names from localStorage
}

// Server-specific Data Context
export interface ServerDataContext extends BaseDataContext {
  patientSummary?: {
    id: string;
    name: string; // Constructed from firstName and lastName
    age?: number; // Calculated from dateOfBirth
    gender?: string | null;
  };
  recentActivities?: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>; 
  upcomingAppointments?: Array<{
    id: string;
    date: Date;
    title: string; // Was 'type', schema has 'title'
    patientName?: string; // Constructed from related patient
  }>;
}

// Generic Platform Context
export interface PlatformContext<
  U extends BaseUserContext = BaseUserContext,
  A extends BaseApplicationContext = BaseApplicationContext,
  D extends BaseDataContext | null = BaseDataContext | null,
> {
  user: U | null;
  application: A;
  data: D;
  sessionId?: string; // More common on client-side
  timestamp?: Date;     // More common on client-side for history
}

// Specific Platform Context types for clarity
export type ClientPlatformContext = PlatformContext<ClientUserContext, ClientApplicationContext, ClientDataContext | null>;
export type ServerPlatformContext = PlatformContext<ServerUserContext, ServerApplicationContext, ServerDataContext | null>;

// Shared constants
export const AVAILABLE_FEATURES: string[] = [
  'Gestión de pacientes',
  'Evaluación psicológica',
  'Documentación clínica',
  'Planificación de tratamientos',
  'Agenda y citas',
  'Consultas AI',
]; 