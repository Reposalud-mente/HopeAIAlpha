import { z } from 'zod';
import { SessionStatus } from '@prisma/client';

// Define Zod schemas that match our TypeScript interfaces
export const sessionObjectiveSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const sessionActivitySchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(), // in minutes
  completed: z.boolean().optional(),
  materials: z.array(z.string()).optional(),
});

export const sessionAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  url: z.string(),
  uploadedAt: z.string(),
});

export const aiSuggestionAuditTrailSchema = z.object({
  action: z.enum(['created', 'edited', 'accepted', 'rejected']),
  timestamp: z.string(),
  content: z.string().optional(),
});

export const aiSuggestionSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: z.enum(['objective', 'activity', 'note']),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdAt: z.string(),
  auditTrail: z.array(aiSuggestionAuditTrailSchema).optional(),
});

// Main Session schema
export const sessionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  clinicianId: z.string(),
  createdAt: z.string(), // ISO string format
  updatedAt: z.string(), // ISO string format
  type: z.string(),
  objectives: z.array(sessionObjectiveSchema).optional(),
  notes: z.string().optional(),
  activities: z.array(sessionActivitySchema).optional(),
  status: z.nativeEnum(SessionStatus),
  attachments: z.array(sessionAttachmentSchema).optional(),
  aiSuggestions: z.array(aiSuggestionSchema).optional(),
});

// Schema for session creation/update input
export const sessionInputSchema = sessionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  // Convert JSON string fields to their parsed equivalents
  objectives: z.union([
    z.string().transform(str => {
      try {
        const parsed = JSON.parse(str);
        return sessionObjectiveSchema.array().parse(parsed);
      } catch (e) {
        return [];
      }
    }),
    z.array(sessionObjectiveSchema).optional(),
  ]),
  activities: z.union([
    z.string().transform(str => {
      try {
        const parsed = JSON.parse(str);
        return sessionActivitySchema.array().parse(parsed);
      } catch (e) {
        return [];
      }
    }),
    z.array(sessionActivitySchema).optional(),
  ]),
});

// Type definitions derived from Zod schemas
export type SessionObjective = z.infer<typeof sessionObjectiveSchema>;
export type SessionActivity = z.infer<typeof sessionActivitySchema>;
export type SessionAttachment = z.infer<typeof sessionAttachmentSchema>;
export type AISuggestion = z.infer<typeof aiSuggestionSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type SessionInput = z.infer<typeof sessionInputSchema>;

// Utility functions for type conversion
export function parseJsonField<T>(json: any, schema: z.ZodType<T>): T | undefined {
  if (!json) return undefined;
  
  try {
    if (typeof json === 'string') {
      return schema.parse(JSON.parse(json));
    }
    return schema.parse(json);
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return undefined;
  }
}

// Convert Prisma Session to TypeScript Session
export function prismaSessionToTypescript(prismaSession: any): Session {
  return {
    ...prismaSession,
    createdAt: prismaSession.createdAt.toISOString(),
    updatedAt: prismaSession.updatedAt.toISOString(),
    objectives: parseJsonField(prismaSession.objectives, z.array(sessionObjectiveSchema)),
    activities: parseJsonField(prismaSession.activities, z.array(sessionActivitySchema)),
    attachments: parseJsonField(prismaSession.attachments, z.array(sessionAttachmentSchema)),
    aiSuggestions: parseJsonField(prismaSession.aiSuggestions, z.array(aiSuggestionSchema)),
  };
}

// Convert TypeScript Session to Prisma format
export function typescriptSessionToPrisma(session: Partial<Session>): any {
  return {
    ...session,
    objectives: session.objectives ? JSON.stringify(session.objectives) : null,
    activities: session.activities ? JSON.stringify(session.activities) : null,
    attachments: session.attachments ? JSON.stringify(session.attachments) : null,
    aiSuggestions: session.aiSuggestions ? JSON.stringify(session.aiSuggestions) : null,
  };
}
