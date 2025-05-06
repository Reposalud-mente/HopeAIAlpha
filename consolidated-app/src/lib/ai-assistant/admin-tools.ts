/**
 * Administrative tools for the AI assistant
 * These tools allow the AI to execute administrative tasks for users
 */

import { FunctionDeclaration, Type } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

/**
 * Tool definitions for the AI assistant
 * Each tool has a function declaration and an implementation
 */

// Function declaration for scheduling a session
export const scheduleSessionDeclaration: FunctionDeclaration = {
  name: 'schedule_session',
  description: 'Schedule a therapy session with a patient',
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: {
        type: Type.STRING,
        description: 'The ID of the patient to schedule a session with',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the session in ISO format (YYYY-MM-DD)',
      },
      time: {
        type: Type.STRING,
        description: 'The time of the session in 24-hour format (HH:MM)',
      },
      duration: {
        type: Type.NUMBER,
        description: 'The duration of the session in minutes (default: 60)',
      },
      notes: {
        type: Type.STRING,
        description: 'Optional notes for the session',
      },
    },
    required: ['patientId', 'date', 'time'],
  },
};

// Function declaration for creating a reminder
export const createReminderDeclaration: FunctionDeclaration = {
  name: 'create_reminder',
  description: 'Create a reminder for a specific date and time',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title of the reminder',
      },
      description: {
        type: Type.STRING,
        description: 'The description of the reminder',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the reminder in ISO format (YYYY-MM-DD)',
      },
      time: {
        type: Type.STRING,
        description: 'The time of the reminder in 24-hour format (HH:MM)',
      },
      priority: {
        type: Type.STRING,
        description: 'The priority of the reminder (low, medium, high)',
        enum: ['low', 'medium', 'high'],
      },
    },
    required: ['title', 'date', 'time'],
  },
};

// Function declaration for searching patients
export const searchPatientsDeclaration: FunctionDeclaration = {
  name: 'search_patients',
  description: 'Search for patients by name or other criteria',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query (name, email, etc.)',
      },
      limit: {
        type: Type.NUMBER,
        description: 'The maximum number of results to return (default: 5)',
      },
    },
    required: ['query'],
  },
};

// Function declaration for generating a clinical report
export const generateReportDeclaration: FunctionDeclaration = {
  name: 'generate_report',
  description: 'Generate a clinical report for a patient',
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: {
        type: Type.STRING,
        description: 'The ID of the patient to generate a report for',
      },
      reportType: {
        type: Type.STRING,
        description: 'The type of report to generate',
        enum: ['initial_evaluation', 'progress_note', 'discharge_summary'],
      },
      includeAssessment: {
        type: Type.BOOLEAN,
        description: 'Whether to include assessment information (default: true)',
      },
      includeTreatmentPlan: {
        type: Type.BOOLEAN,
        description: 'Whether to include treatment plan information (default: true)',
      },
    },
    required: ['patientId', 'reportType'],
  },
};

// Collection of all function declarations
export const adminToolDeclarations = [
  scheduleSessionDeclaration,
  createReminderDeclaration,
  searchPatientsDeclaration,
  generateReportDeclaration,
];

// Implementation of the schedule session function
export async function scheduleSession(args: {
  patientId: string;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
}, userId: string) {
  try {
    // Combine date and time into a DateTime object
    const dateTime = new Date(`${args.date}T${args.time}:00`);
    
    // Create the session in the database
    const session = await prisma.appointment.create({
      data: {
        patientId: args.patientId,
        therapistId: userId,
        startTime: dateTime,
        duration: args.duration || 60,
        notes: args.notes || '',
        status: 'scheduled',
      },
    });
    
    return {
      success: true,
      sessionId: session.id,
      message: `Session scheduled successfully for ${dateTime.toLocaleString()}`,
    };
  } catch (error) {
    console.error('Error scheduling session:', error);
    return {
      success: false,
      message: `Failed to schedule session: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Implementation of the create reminder function
export async function createReminder(args: {
  title: string;
  description?: string;
  date: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
}, userId: string) {
  try {
    // Combine date and time into a DateTime object
    const dateTime = new Date(`${args.date}T${args.time}:00`);
    
    // Create the reminder in the database
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title: args.title,
        description: args.description || '',
        dueDate: dateTime,
        priority: args.priority || 'medium',
        completed: false,
      },
    });
    
    return {
      success: true,
      reminderId: reminder.id,
      message: `Reminder "${args.title}" created successfully for ${dateTime.toLocaleString()}`,
    };
  } catch (error) {
    console.error('Error creating reminder:', error);
    return {
      success: false,
      message: `Failed to create reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Implementation of the search patients function
export async function searchPatients(args: {
  query: string;
  limit?: number;
}, userId: string) {
  try {
    // Search for patients in the database
    const patients = await prisma.patient.findMany({
      where: {
        therapistId: userId,
        OR: [
          { name: { contains: args.query, mode: 'insensitive' } },
          { email: { contains: args.query, mode: 'insensitive' } },
        ],
      },
      take: args.limit || 5,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
      },
    });
    
    return {
      success: true,
      patients,
      count: patients.length,
      message: `Found ${patients.length} patients matching "${args.query}"`,
    };
  } catch (error) {
    console.error('Error searching patients:', error);
    return {
      success: false,
      message: `Failed to search patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Implementation of the generate report function
export async function generateReport(args: {
  patientId: string;
  reportType: 'initial_evaluation' | 'progress_note' | 'discharge_summary';
  includeAssessment?: boolean;
  includeTreatmentPlan?: boolean;
}, userId: string) {
  try {
    // This would typically call the RAG pipeline to generate a report
    // For now, we'll just return a success message
    return {
      success: true,
      reportId: `report-${Date.now()}`,
      message: `Report generation started for patient ${args.patientId}`,
      reportType: args.reportType,
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      message: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
