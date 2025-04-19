export interface Session {
  id: string;
  patientId: string;
  clinicianId: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  objectives?: any; // JSON
  notes?: string;
  activities?: any; // JSON
  status: string;
  attachments?: any; // JSON
  aiSuggestions?: any; // JSON
}
