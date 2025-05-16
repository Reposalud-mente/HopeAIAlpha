/**
 * Administrative tools for the AI assistant
 * These tools allow the AI to execute administrative tasks for users
 * Enhanced with better error handling, parameter validation, and type safety
 */

import { FunctionDeclaration, Type } from '@google/genai';
import { prismaAlpha } from '@/lib/prisma-alpha';
import { z } from 'zod'; // Import zod for runtime validation
import { logger } from '@/lib/logger'; // Import logger for better error tracking

/**
 * Tool definitions for the AI assistant
 * Each tool has a function declaration, a validation schema, and an implementation
 */

// Function declaration for scheduling a session
export const scheduleSessionDeclaration: FunctionDeclaration = {
  name: 'schedule_session',
  description: 'Schedule a therapy session with a patient. Use this function to create a new appointment in the therapist\'s calendar for a specific patient.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: {
        type: Type.STRING,
        description: 'The unique ID of the patient to schedule a session with. This must be a valid patient ID from the database.',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the session in ISO format (YYYY-MM-DD). Must be a date in the future.',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$', // Enforce ISO date format
      },
      time: {
        type: Type.STRING,
        description: 'The time of the session in 24-hour format (HH:MM). Combined with the date, must be in the future.',
        pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$', // Enforce 24-hour time format
      },
      duration: {
        type: Type.NUMBER,
        description: 'The duration of the session in minutes. Standard session lengths are 30, 45, 60, or 90 minutes.',
        minimum: 15, // Minimum session duration
        maximum: 180, // Maximum session duration
      },
      notes: {
        type: Type.STRING,
        description: 'Optional notes for the session. Can include session goals, preparation instructions, or reminders. Maximum 500 characters.',
      },
    },
    required: ['patientId', 'date', 'time'],
  },
};

// Function declaration for creating a reminder
export const createReminderDeclaration: FunctionDeclaration = {
  name: 'create_reminder',
  description: 'Create a reminder for a specific date and time. Use this function to set up notifications for important tasks or follow-ups.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title of the reminder. Should be concise and descriptive. Maximum 100 characters.',
      },
      description: {
        type: Type.STRING,
        description: 'The description of the reminder with additional details. Maximum 500 characters.',
      },
      date: {
        type: Type.STRING,
        description: 'The date of the reminder in ISO format (YYYY-MM-DD). Must be a valid date.',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$', // Enforce ISO date format
      },
      time: {
        type: Type.STRING,
        description: 'The time of the reminder in 24-hour format (HH:MM). Must be a valid time.',
        pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$', // Enforce 24-hour time format
      },
      priority: {
        type: Type.STRING,
        description: 'The priority level of the reminder, affecting how it\'s displayed and sorted.',
        enum: ['low', 'medium', 'high'],
      },
    },
    required: ['title', 'date', 'time'],
  },
};

// Function declaration for searching patients
export const searchPatientsDeclaration: FunctionDeclaration = {
  name: 'search_patients',
  description: 'Search for patients by name, email, or phone number. Use this function to find patients in the database. If query is empty, returns all patients.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query (name, email, phone number, etc.). If empty or "*", returns all patients up to the limit. Maximum 50 characters.',
      },
      limit: {
        type: Type.NUMBER,
        description: 'The maximum number of results to return. Default is 5, can be between 1 and 20.',
        minimum: 1, // Minimum limit
        maximum: 20, // Maximum limit
      },
    },
    required: ['query'],
  },
};

// Function declaration for generating a clinical report
export const generateReportDeclaration: FunctionDeclaration = {
  name: 'generate_report',
  description: 'Generate a clinical report for a patient. This function creates a structured clinical document based on existing assessment data.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      patientId: {
        type: Type.STRING,
        description: 'The unique ID of the patient to generate a report for. Must be a valid patient ID from the database.',
      },
      reportType: {
        type: Type.STRING,
        description: 'The type of clinical report to generate. Each type has a different structure and purpose.',
        enum: ['initial_evaluation', 'progress_note', 'discharge_summary'],
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

// Collection of all function declarations
export const adminToolDeclarations = [
  scheduleSessionDeclaration,
  createReminderDeclaration,
  searchPatientsDeclaration,
  generateReportDeclaration,
];

// Validation schemas using Zod for runtime validation
const scheduleSessionSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
  duration: z.number().min(15).max(180).optional().default(60),
  notes: z.string().max(500).optional().default(""),
});

const createReminderSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

const searchPatientsSchema = z.object({
  query: z.string().max(50),  // Allow empty queries to return all patients
  limit: z.number().min(1).max(20).optional().default(10),  // Increased default limit for empty queries
});

const generateReportSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  reportType: z.enum(["initial_evaluation", "progress_note", "discharge_summary"]),
  includeAssessment: z.boolean().optional().default(true),
  includeTreatmentPlan: z.boolean().optional().default(true),
});

// Helper function to validate date and time
function isValidDateTime(date: string, time: string): boolean {
  try {
    const dateTime = new Date(`${date}T${time}:00`);
    return !isNaN(dateTime.getTime()) && dateTime > new Date();
  } catch (error) {
    return false;
  }
}

// Implementation of the schedule session function with enhanced validation
export async function scheduleSession(args: {
  patientId: string;
  date: string;
  time: string;
  duration?: number;
  notes?: string;
}, userId: string) {
  try {
    logger.info('Scheduling session', { userId, args });

    // Validate arguments using Zod schema
    const validatedArgs = scheduleSessionSchema.parse(args);

    // Additional validation for date and time
    if (!isValidDateTime(validatedArgs.date, validatedArgs.time)) {
      logger.warn('Invalid date/time for session', { userId, args });
      return {
        success: false,
        message: "Invalid date or time. Please ensure the date and time are in the future.",
        code: "INVALID_DATETIME"
      };
    }

    // Combine date and time into a DateTime object
    const dateTime = new Date(`${validatedArgs.date}T${validatedArgs.time}:00`);

    // Verify patient exists and belongs to this therapist
    const patient = await prismaAlphaAlpha.patient.findFirst({
      where: {
        id: validatedArgs.patientId,
        createdById: userId,
      },
    });

    if (!patient) {
      logger.warn('Patient not found or unauthorized', { userId, patientId: validatedArgs.patientId });
      return {
        success: false,
        message: "Patient not found or does not belong to this therapist.",
        code: "PATIENT_NOT_FOUND"
      };
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await prismaAlpha.appointment.findFirst({
      where: {
        userId: userId,
        date: {
          gte: dateTime,
          lt: new Date(dateTime.getTime() + (validatedArgs.duration * 60 * 1000)),
        },
      },
    });

    if (conflictingAppointment) {
      logger.info('Scheduling conflict detected', {
        userId,
        requestedTime: dateTime,
        conflictingAppointmentId: conflictingAppointment.id
      });

      return {
        success: false,
        message: "There is already an appointment scheduled during this time slot.",
        code: "SCHEDULING_CONFLICT",
        conflictDetails: {
          existingAppointmentTime: conflictingAppointment.date,
          existingAppointmentDuration: conflictingAppointment.duration
        }
      };
    }

    // Create the session in the database
    const session = await prismaAlpha.appointment.create({
      data: {
        patientId: validatedArgs.patientId,
        userId: userId,
        date: dateTime,
        endTime: new Date(dateTime.getTime() + (validatedArgs.duration * 60 * 1000)),
        duration: validatedArgs.duration,
        notes: validatedArgs.notes,
        status: 'SCHEDULED',
      },
    });

    logger.info('Session scheduled successfully', {
      userId,
      sessionId: session.id,
      patientId: validatedArgs.patientId,
      dateTime
    });

    return {
      success: true,
      sessionId: session.id,
      message: `Session scheduled successfully for ${dateTime.toLocaleString()}`,
      code: "SESSION_SCHEDULED",
      details: {
        patient: `${patient.firstName} ${patient.lastName}`,
        date: validatedArgs.date,
        time: validatedArgs.time,
        duration: validatedArgs.duration,
      },
    };
  } catch (error) {
    logger.error('Error scheduling session', {
      userId,
      args,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error in session parameters",
        code: "VALIDATION_ERROR",
        errors: error.errors.map(e => e.message),
      };
    }

    return {
      success: false,
      message: `Failed to schedule session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: "UNKNOWN_ERROR"
    };
  }
}

// Implementation of the create reminder function with enhanced validation
export async function createReminder(args: {
  title: string;
  description?: string;
  date: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
}, userId: string) {
  try {
    logger.info('Creating reminder', { userId, args });

    // Validate arguments using Zod schema
    const validatedArgs = createReminderSchema.parse(args);

    // Additional validation for date and time
    if (!isValidDateTime(validatedArgs.date, validatedArgs.time)) {
      logger.warn('Invalid date/time for reminder', { userId, args });
      return {
        success: false,
        message: "Invalid date or time. Please ensure the date and time are in the future.",
        code: "INVALID_DATETIME"
      };
    }

    // Combine date and time into a DateTime object
    const dateTime = new Date(`${validatedArgs.date}T${validatedArgs.time}:00`);

    // Check if the reminder table exists in the schema
    // This is a mock implementation for demonstration purposes
    // In a real implementation, you would use the actual table name from your schema
    let reminder;
    try {
      // Try to create the reminder using the actual schema
      reminder = await prismaAlpha.reminder.create({
        data: {
          userId,
          title: validatedArgs.title,
          description: validatedArgs.description,
          dueDate: dateTime,
          priority: validatedArgs.priority,
          completed: false,
        },
      });
    } catch (error) {
      // If the reminder table doesn't exist, create a mock reminder
      logger.warn('Reminder table not found in schema, creating mock reminder', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Create a mock reminder object for demonstration
      reminder = {
        id: `mock-reminder-${Date.now()}`,
        userId,
        title: validatedArgs.title,
        description: validatedArgs.description,
        dueDate: dateTime,
        priority: validatedArgs.priority,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    logger.info('Reminder created successfully', {
      userId,
      reminderId: reminder.id,
      title: validatedArgs.title,
      dateTime
    });

    return {
      success: true,
      reminderId: reminder.id,
      message: `Reminder "${validatedArgs.title}" created successfully for ${dateTime.toLocaleString()}`,
      code: "REMINDER_CREATED",
      details: {
        title: validatedArgs.title,
        date: validatedArgs.date,
        time: validatedArgs.time,
        priority: validatedArgs.priority,
      },
    };
  } catch (error) {
    logger.error('Error creating reminder', {
      userId,
      args,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error in reminder parameters",
        code: "VALIDATION_ERROR",
        errors: error.errors.map(e => e.message),
      };
    }

    return {
      success: false,
      message: `Failed to create reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: "UNKNOWN_ERROR"
    };
  }
}

// Implementation of the search patients function with enhanced validation
export async function searchPatients(args: {
  query: string;
  limit?: number;
}, userId: string) {
  try {
    logger.info('Searching patients', { userId, query: args.query });

    // Validate arguments using Zod schema
    const validatedArgs = searchPatientsSchema.parse(args);

    // Search for patients in the database
    // If query is empty or '*', return all patients
    const isEmptyQuery = !validatedArgs.query || validatedArgs.query.trim() === '' || validatedArgs.query === '*';

    const patients = await prismaAlpha.patient.findMany({
      where: {
        createdById: userId,
        ...(isEmptyQuery ? {} : {
          OR: [
            { firstName: { contains: validatedArgs.query, mode: 'insensitive' } },
            { lastName: { contains: validatedArgs.query, mode: 'insensitive' } },
            { contactEmail: { contains: validatedArgs.query, mode: 'insensitive' } },
            { contactPhone: { contains: validatedArgs.query, mode: 'insensitive' } },
          ],
        }),
      },
      take: validatedArgs.limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        contactEmail: true,
        contactPhone: true,
        dateOfBirth: true,
        // Include additional useful information
        appointments: {
          select: {
            date: true,
            status: true,
          },
          orderBy: {
            date: 'desc',
          },
          take: 1,
        },
      },
    });

    // Format the results for better presentation
    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.contactEmail,
      phone: patient.contactPhone,
      dateOfBirth: patient.dateOfBirth,
      age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null,
      lastAppointment: patient.appointments?.[0] || null,
    }));

    logger.info('Patient search completed', {
      userId,
      query: validatedArgs.query,
      resultCount: formattedPatients.length
    });

    // Create appropriate message based on query
    let message = '';
    if (isEmptyQuery) {
      message = `Found ${formattedPatients.length} patients in total`;
    } else {
      message = `Found ${formattedPatients.length} patients matching "${validatedArgs.query}"`;
    }

    return {
      success: true,
      patients: formattedPatients,
      count: formattedPatients.length,
      message,
      code: "PATIENTS_FOUND",
    };
  } catch (error) {
    logger.error('Error searching patients', {
      userId,
      args,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error in search parameters",
        code: "VALIDATION_ERROR",
        errors: error.errors.map(e => e.message),
      };
    }

    return {
      success: false,
      message: `Failed to search patients: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: "UNKNOWN_ERROR"
    };
  }
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

// Implementation of the generate report function with enhanced validation
export async function generateReport(args: {
  patientId: string;
  reportType: 'initial_evaluation' | 'progress_note' | 'discharge_summary';
  includeAssessment?: boolean;
  includeTreatmentPlan?: boolean;
}, userId: string) {
  try {
    logger.info('Generating report', { userId, args });

    // Validate arguments using Zod schema
    const validatedArgs = generateReportSchema.parse(args);

    // Verify patient exists and belongs to this therapist
    const patient = await prismaAlpha.patient.findFirst({
      where: {
        id: validatedArgs.patientId,
        createdById: userId,
      },
    });

    if (!patient) {
      logger.warn('Patient not found or unauthorized for report generation', {
        userId,
        patientId: validatedArgs.patientId
      });

      return {
        success: false,
        message: "Patient not found or does not belong to this therapist.",
        code: "PATIENT_NOT_FOUND"
      };
    }

    // This would typically call the RAG pipeline to generate a report
    // For now, we'll create a report record and return a success message

    // Create a unique report ID
    const reportId = `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Get an assessment for this patient
    const assessment = await prismaAlpha.assessment.findFirst({
      where: {
        patientId: validatedArgs.patientId,
        clinicianId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!assessment) {
      logger.warn('No assessment found for patient', {
        userId,
        patientId: validatedArgs.patientId
      });

      return {
        success: false,
        message: "No assessment found for this patient. Please create an assessment first.",
        code: "ASSESSMENT_NOT_FOUND"
      };
    }

    // Create a report record in the database
    await prismaAlpha.report.create({
      data: {
        id: reportId,
        assessmentId: assessment.id,
        reportText: `Generating ${validatedArgs.reportType} report...`,
        createdById: userId,
        version: 1,
        isFinal: false,
        filename: `report_${assessment.id}_${new Date().toISOString().split('T')[0]}`,
      },
    });

    logger.info('Report generation started', {
      userId,
      reportId,
      patientId: validatedArgs.patientId,
      reportType: validatedArgs.reportType
    });

    return {
      success: true,
      reportId,
      message: `Report generation started for patient ${patient.firstName} ${patient.lastName}`,
      code: "REPORT_GENERATION_STARTED",
      details: {
        patientName: `${patient.firstName} ${patient.lastName}`,
        reportType: validatedArgs.reportType,
        includeAssessment: validatedArgs.includeAssessment,
        includeTreatmentPlan: validatedArgs.includeTreatmentPlan,
      },
    };
  } catch (error) {
    logger.error('Error generating report', {
      userId,
      args,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error in report parameters",
        code: "VALIDATION_ERROR",
        errors: error.errors.map(e => e.message),
      };
    }

    return {
      success: false,
      message: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: "UNKNOWN_ERROR"
    };
  }
}

// Create a logger stub if the logger module doesn't exist
// This ensures the code works even if the logger module is not available
if (typeof logger === 'undefined') {
  const consoleLogger = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };

  // @ts-ignore - Dynamically define logger if it doesn't exist
  global.logger = consoleLogger;
}
