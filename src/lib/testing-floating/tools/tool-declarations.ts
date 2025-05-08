/**
 * Tool declarations for the Enhanced AI Floating Assistant
 * Defines the tools that the assistant can use
 */

import { Type } from '@google/genai';
import { ToolDeclaration } from '../types';

/**
 * Schedule session tool declaration
 */
export const scheduleSessionDeclaration: ToolDeclaration = {
  name: 'schedule_session',
  description: 'Schedule a therapy session with a patient',
  parameters: {
    type: 'OBJECT',
    properties: {
      patientId: {
        type: Type.STRING,
        description: 'The ID of the patient to schedule the session with.',
      },
      patientName: {
        type: Type.STRING,
        description: 'The name of the patient to schedule the session with. Used when patientId is not available.',
      },
      date: {
        type: Type.STRING,
        description: 'The date for the session in YYYY-MM-DD format.',
      },
      time: {
        type: Type.STRING,
        description: 'The time for the session in HH:MM format (24-hour).',
      },
      duration: {
        type: Type.NUMBER,
        description: 'The duration of the session in minutes. Default is 60.',
      },
      sessionType: {
        type: Type.STRING,
        description: 'The type of session (e.g., "initial", "follow_up", "assessment").',
      },
      notes: {
        type: Type.STRING,
        description: 'Additional notes for the session.',
      },
    },
    required: ['date', 'time'],
  },
};

/**
 * Create reminder tool declaration
 */
export const createReminderDeclaration: ToolDeclaration = {
  name: 'create_reminder',
  description: 'Create a reminder for the therapist',
  parameters: {
    type: 'OBJECT',
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title of the reminder.',
      },
      description: {
        type: Type.STRING,
        description: 'A detailed description of the reminder.',
      },
      date: {
        type: Type.STRING,
        description: 'The date for the reminder in YYYY-MM-DD format.',
      },
      time: {
        type: Type.STRING,
        description: 'The time for the reminder in HH:MM format (24-hour).',
      },
      priority: {
        type: Type.STRING,
        description: 'The priority of the reminder (low, medium, high).',
      },
    },
    required: ['title', 'date'],
  },
};

/**
 * Search patients tool declaration
 */
export const searchPatientsDeclaration: ToolDeclaration = {
  name: 'search_patients',
  description: 'Search for patients by name, ID, or other criteria',
  parameters: {
    type: 'OBJECT',
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query (name, ID, or other identifying information).',
      },
      name: {
        type: Type.STRING,
        description: 'The name of the patient to search for. Alternative to query parameter.',
      },
      filters: {
        type: Type.OBJECT,
        description: 'Additional filters for the search.',
        properties: {
          ageRange: {
            type: Type.STRING,
            description: 'Age range in the format "min-max" (e.g., "18-30").',
          },
          gender: {
            type: Type.STRING,
            description: 'Gender filter.',
          },
          diagnosisContains: {
            type: Type.STRING,
            description: 'Filter by diagnosis containing this text.',
          },
          lastSessionAfter: {
            type: Type.STRING,
            description: 'Filter for patients with sessions after this date (YYYY-MM-DD).',
          },
          lastSessionBefore: {
            type: Type.STRING,
            description: 'Filter for patients with sessions before this date (YYYY-MM-DD).',
          },
        },
      },
      limit: {
        type: Type.NUMBER,
        description: 'Maximum number of results to return. Default is 10.',
      },
    },
    required: [],
  },
};

/**
 * Generate report tool declaration
 */
export const generateReportDeclaration: ToolDeclaration = {
  name: 'generate_report',
  description: 'Generate a clinical report for a patient',
  parameters: {
    type: 'OBJECT',
    properties: {
      patientId: {
        type: Type.STRING,
        description: 'The ID of the patient to generate the report for.',
      },
      reportType: {
        type: Type.STRING,
        description: 'The type of report to generate (initial_evaluation, progress_note, discharge_summary).',
      },
      includeAssessment: {
        type: Type.BOOLEAN,
        description: 'Whether to include detailed assessment information and test results in the report.',
      },
      includeTreatmentPlan: {
        type: Type.BOOLEAN,
        description: 'Whether to include the treatment plan and intervention recommendations in the report.',
      },
    },
    required: ['patientId', 'reportType'],
  },
};

/**
 * All tool declarations
 */
export const toolDeclarations: ToolDeclaration[] = [
  scheduleSessionDeclaration,
  createReminderDeclaration,
  searchPatientsDeclaration,
  generateReportDeclaration,
];
