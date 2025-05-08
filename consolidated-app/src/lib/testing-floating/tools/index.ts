/**
 * Tool exports for the Enhanced AI Floating Assistant
 */

import { Tool } from '../types';
import { 
  toolDeclarations,
  scheduleSessionDeclaration,
  createReminderDeclaration,
  searchPatientsDeclaration,
  generateReportDeclaration
} from './tool-declarations';
import {
  scheduleSessionImplementation,
  createReminderImplementation,
  searchPatientsImplementation,
  generateReportImplementation
} from './tool-implementations';

// Create tool objects that combine declarations and implementations
export const scheduleSessionTool: Tool = {
  declaration: scheduleSessionDeclaration,
  implementation: scheduleSessionImplementation,
};

export const createReminderTool: Tool = {
  declaration: createReminderDeclaration,
  implementation: createReminderImplementation,
};

export const searchPatientsTool: Tool = {
  declaration: searchPatientsDeclaration,
  implementation: searchPatientsImplementation,
};

export const generateReportTool: Tool = {
  declaration: generateReportDeclaration,
  implementation: generateReportImplementation,
};

// All tools
export const tools: Tool[] = [
  scheduleSessionTool,
  createReminderTool,
  searchPatientsTool,
  generateReportTool,
];

// Export declarations and implementations
export { 
  toolDeclarations,
  scheduleSessionImplementation,
  createReminderImplementation,
  searchPatientsImplementation,
  generateReportImplementation
};
