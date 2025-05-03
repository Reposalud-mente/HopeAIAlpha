/**
 * Types for the RAG-based Clinical Report Generator
 */

/**
 * Interface for the wizard report data
 * This is the input data for the clinical report generator
 */
export interface WizardReportData {
  // Patient information
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientDateOfBirth?: string;

  // Clinician and clinic information
  clinicianName: string;
  clinicName: string;
  assessmentDate: string;

  // Report type and template
  reportType: 'evaluacion-psicologica' | 'seguimiento-terapeutico' | 'evaluacion-neuropsicologica' |
             'informe-familiar' | 'informe-educativo' | 'alta-terapeutica';

  // Clinical data
  consultationReasons?: string[];
  evaluationAreas?: string[];
  icdCriteria?: string[];
  isPrimaryDiagnosis?: boolean;

  // Template-specific fields
  templateFields?: Record<string, any>;

  // Generation options
  includeRecommendations?: boolean;
  includeTreatmentPlan?: boolean;
  language?: 'es' | 'en';
}

/**
 * Interface for the clinical report generation options
 */
export interface ReportGenerationOptions {
  includeRecommendations?: boolean;
  includeTreatmentPlan?: boolean;
  language?: 'es' | 'en';
  reportStyle?: 'clinical' | 'educational' | 'concise';
}

/**
 * Interface for the clinical report generation result
 */
export interface ReportGenerationResult {
  reportText: string;
  metadata?: {
    generationTime: number;
    modelName: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    queryLength?: number;
    promptLength?: number;
    reportLength?: number;
    retrievalCount?: number;
    startTime?: string;
    endTime?: string;
    options?: any;
    [key: string]: any; // Allow additional metadata fields
  };
}

/**
 * Interface for the DSM-5 retrieval result
 */
export interface DSM5RetrievalResult {
  content: string;
  source: string;
  relevanceScore?: number;
  fileDetails?: {
    fileName: string;
    fileId: string;
    mimeType: string;
  };
}

/**
 * Interface for the knowledge base retrieval options
 */
export interface KnowledgeBaseRetrievalOptions {
  maxResults?: number;
  minRelevanceScore?: number;
}

/**
 * Interface for the clinical report agent configuration
 */
export interface ClinicalReportAgentConfig {
  apiKey: string;
  modelName?: string;
  driveFolderId?: string;
  driveApiKey?: string;
  temperature?: number;
  maxTokens?: number;
  topK?: number;
  streamResponse?: boolean;
}

/**
 * Custom error class for RAG workflow errors
 */
export class RAGError extends Error {
  type: 'retrieval' | 'generation' | 'workflow' | 'configuration';

  constructor(message: string, type: 'retrieval' | 'generation' | 'workflow' | 'configuration') {
    super(message);
    this.name = 'RAGError';
    this.type = type;
  }
}
