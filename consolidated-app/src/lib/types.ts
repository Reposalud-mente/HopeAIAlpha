// Patient types
export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  medicalHistory?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Report types
export interface Report {
  id: string;
  patientId: string;
  title: string;
  content: string;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Step interface for workflow
export interface Step {
  id: string;
  label: string;
  description?: string;
  status?: 'complete' | 'current' | 'upcoming';
  icon?: string;
} 