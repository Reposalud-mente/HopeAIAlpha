import { Prisma, SessionStatus } from '@prisma/client';

// Define more specific types for JSON fields
export interface SessionObjective {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface SessionActivity {
  title: string;
  description?: string;
  duration?: number; // in minutes
  completed?: boolean;
  materials?: string[];
}

export interface SessionAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface AISuggestion {
  id: string;
  content: string;
  type: 'objective' | 'activity' | 'note';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  auditTrail?: {
    action: 'created' | 'edited' | 'accepted' | 'rejected';
    timestamp: string;
    content?: string;
  }[];
}

// Base Session interface aligned with Prisma model
export interface Session {
  id: string;
  patientId: string;
  clinicianId: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  objectives?: SessionObjective[];
  notes?: string;
  activities?: SessionActivity[];
  status: SessionStatus;
  attachments?: SessionAttachment[];
  aiSuggestions?: AISuggestion[];
}

// Type for Session with included relations
export type SessionWithRelations = Prisma.SessionGetPayload<{
  include: {
    patient: true,
    clinician: true
  }
}>;
