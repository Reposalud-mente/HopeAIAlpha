import { z } from 'zod';
import { SessionStatus } from '@prisma/client';
import {
  sessionObjectiveSchema,
  sessionActivitySchema,
  sessionAttachmentSchema,
  aiSuggestionSchema
} from './session';

// Schema for the form data
export const sessionFormSchema = z.object({
  type: z.string().min(1, { message: 'El tipo de sesión es obligatorio' }).refine(val => val !== 'none', {
    message: 'Debe seleccionar un tipo de sesión válido'
  }),
  status: z.nativeEnum(SessionStatus, {
    errorMap: () => ({ message: 'Estado de sesión inválido' })
  }),
  notes: z.string().min(1, { message: 'Las notas clínicas son obligatorias' }),
  objectives: z.string().min(1, { message: 'Los objetivos de la sesión son obligatorios' }),
  activities: z.string().min(1, { message: 'Las actividades son obligatorias' }),
  aiSuggestions: z.string().optional(),
  attachments: z.union([
    z.array(z.instanceof(File)),
    z.array(sessionAttachmentSchema),
    z.array(z.any())
  ]).optional(),
  selectedNotes: z.array(z.string()).optional(),
  selectedPastSessions: z.array(z.string()).optional(),
  selectedReports: z.array(z.string()).optional(),
});

// Type definition derived from the schema
export type SessionFormData = z.infer<typeof sessionFormSchema>;

// Utility function to convert form data to session input
export function formDataToSessionInput(formData: SessionFormData) {
  return {
    type: formData.type,
    status: formData.status,
    notes: formData.notes,
    objectives: parseJsonField(formData.objectives),
    activities: parseJsonField(formData.activities),
    aiSuggestions: formData.aiSuggestions ? parseJsonField(formData.aiSuggestions) : undefined,
    // Attachments need to be handled separately as they are File objects
  };
}

// Parse JSON string to object
function parseJsonField(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return {};
  }
}

// Validate form data
export function validateSessionForm(formData: SessionFormData) {
  try {
    return {
      success: true,
      data: sessionFormSchema.parse(formData)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a more usable format
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach(err => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      return {
        success: false,
        errors: fieldErrors
      };
    }
    return {
      success: false,
      errors: { form: 'Validation failed' }
    };
  }
}
