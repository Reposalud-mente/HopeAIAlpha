/**
 * Context type definitions for the Enhanced AI Floating Assistant
 */

import {
  UserContext,
  ApplicationContext,
  DataContext,
  PlatformContext
} from '../types';

// Re-export types from the main types file
export type {
  UserContext,
  ApplicationContext,
  DataContext,
  PlatformContext
};

// Available features in the application (renamed to avoid conflict with config.ts)
export const APP_FEATURES: string[] = [
  'Gestión de pacientes',
  'Evaluación psicológica',
  'Documentación clínica',
  'Planificación de tratamientos',
  'Agenda y citas',
  'Consultas AI',
];
