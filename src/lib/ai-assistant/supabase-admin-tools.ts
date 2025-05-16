/**
 * Administrative tools for the AI assistant using Supabase
 * These tools allow the AI to execute administrative tasks for users
 * Enhanced with better error handling, parameter validation, and type safety
 */

import { FunctionDeclaration, Type } from '@google/genai';
import { z } from 'zod'; // Import zod for runtime validation
import { logger } from '@/lib/logger'; // Import logger for better error tracking
import { getSupabaseForUser } from '@/utils/supabase/database'; // Import Supabase client

/**
 * Tool definitions for the AI assistant
 * Each tool has a function declaration, a validation schema, and an implementation
 */

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
        description: 'The maximum number of results to return. Default is 10, can be between 1 and 20.',
        minimum: 1, // Minimum limit
        maximum: 20, // Maximum limit
      },
    },
    required: ['query'],
  },
};

// Validation schema for search_patients
const searchPatientsSchema = z.object({
  query: z.string().max(50),  // Allow empty queries to return all patients
  limit: z.number().min(1).max(20).optional().default(10),  // Default limit for queries
});

/**
 * Calculate age from date of birth
 * @param dateOfBirth The date of birth
 * @returns The age in years
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Implementation of the search patients function with Supabase
 * @param args The search arguments
 * @param userId The user ID
 * @returns The search results
 */
export async function searchPatients(args: {
  query: string;
  limit?: number;
}, userId: string) {
  try {
    logger.info('Searching patients with Supabase', { userId, query: args.query });

    // Validate arguments using Zod schema
    const validatedArgs = searchPatientsSchema.parse(args);

    // Search for patients in the database using Supabase
    // If query is empty or '*', return all patients
    const isEmptyQuery = !validatedArgs.query || validatedArgs.query.trim() === '' || validatedArgs.query === '*';
    
    // Get a Supabase client with the user context
    const supabase = await getSupabaseForUser(userId);
    
    // Build the query
    let query = supabase
      .from('patients')
      .select(`
        id,
        first_name,
        last_name,
        contact_email,
        contact_phone,
        date_of_birth,
        appointments:appointments(date, status)!order(date.desc).limit(1)
      `)
      .eq('created_by_id', userId)
      .limit(validatedArgs.limit || 10);
    
    // Add search filters if not an empty query
    if (!isEmptyQuery) {
      const searchTerm = validatedArgs.query.toLowerCase();
      query = query.or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%,contact_phone.ilike.%${searchTerm}%`
      );
    }
    
    // Execute the query
    const { data: patients, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Format the results for better presentation
    const formattedPatients = (patients || []).map(patient => ({
      id: patient.id,
      name: `${patient.first_name} ${patient.last_name}`,
      email: patient.contact_email,
      phone: patient.contact_phone,
      dateOfBirth: patient.date_of_birth,
      age: patient.date_of_birth ? calculateAge(new Date(patient.date_of_birth)) : null,
      lastAppointment: patient.appointments?.[0] || null,
    }));

    logger.info('Patient search completed with Supabase', {
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
    logger.error('Error searching patients with Supabase', {
      userId,
      args,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

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

// Export all function declarations for the AI assistant
export const adminToolDeclarations = [
  searchPatientsDeclaration,
];
