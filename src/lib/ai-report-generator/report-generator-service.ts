import { generateClinicalReport, WizardReportData } from './ai-report-generating';

/**
 * Service to generate clinical reports using the Google Gemini API
 */
export class ReportGeneratorService {
  private apiKey: string;

  /**
   * Constructor
   * @param apiKey Google Gemini API key
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;

    // Validate API key
    if (!this.apiKey) {
      console.warn('No API key provided for ReportGeneratorService');
    }
  }

  /**
   * Generates a clinical report based on assessment data
   * @param assessmentId The assessment ID
   * @param options Options for report generation
   * @returns Promise resolving to the generated report
   */
  public async generateReport(
    assessmentId: string,
    options: {
      language?: 'es' | 'en';
      includeRecommendations?: boolean;
      includeTreatmentPlan?: boolean;
      reportStyle?: 'clinical' | 'educational' | 'concise';
    } = {}
  ): Promise<{ reportText: string } | { error: string }> {
    try {
      // Fetch assessment data from the database
      const assessmentData = await this.fetchAssessmentData(assessmentId);

      if (!assessmentData) {
        return { error: 'Assessment not found' };
      }

      // Transform assessment data to wizard data format
      const wizardData = this.transformToWizardData(assessmentData, options);

      // Generate the report
      const reportText = await generateClinicalReport(wizardData, this.apiKey);

      return { reportText };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Fetches assessment data from the database
   * @param assessmentId The assessment ID
   * @returns Promise resolving to the assessment data
   */
  private async fetchAssessmentData(assessmentId: string): Promise<any> {
    try {
      // Make API call to fetch assessment data
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessment data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assessment data:', error);
      throw error;
    }
  }

  /**
   * Transforms assessment data to wizard data format
   * @param assessmentData Assessment data from the database
   * @param options Options for report generation
   * @returns Wizard data for report generation
   */
  private transformToWizardData(
    assessmentData: any,
    options: {
      language?: 'es' | 'en';
      includeRecommendations?: boolean;
      includeTreatmentPlan?: boolean;
      reportStyle?: 'clinical' | 'educational' | 'concise';
    }
  ): WizardReportData {
    const { patient, clinician, clinic, consultationReasons, evaluationAreas, icdCriteria } = assessmentData;

    // Extract template-specific fields based on the assessment type
    const templateFields = this.extractTemplateFields(assessmentData);

    return {
      // Patient information
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName || ''}`,
      patientAge: patient.dateOfBirth ? this.calculateAge(patient.dateOfBirth) : undefined,
      patientGender: patient.gender,
      patientDateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : undefined,

      // Clinician and clinic information
      clinicianName: `${clinician.firstName} ${clinician.lastName || ''}`,
      clinicName: clinic.name,
      assessmentDate: assessmentData.assessmentDate ? new Date(assessmentData.assessmentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],

      // Report type and template
      reportType: assessmentData.reportType || 'evaluacion-psicologica',

      // Clinical data
      consultationReasons: consultationReasons?.map((reason: any) => reason.description) || [],
      evaluationAreas: evaluationAreas?.map((area: any) => area.area.name) || [],
      icdCriteria: icdCriteria?.map((criteria: any) => `${criteria.criteria.name} (${criteria.criteria.code})`) || [],
      isPrimaryDiagnosis: icdCriteria?.some((criteria: any) => criteria.isPrimary) || false,

      // Template-specific fields
      templateFields,

      // Generation options
      includeRecommendations: options.includeRecommendations !== undefined ? options.includeRecommendations : true,
      includeTreatmentPlan: options.includeTreatmentPlan !== undefined ? options.includeTreatmentPlan : true,
      language: options.language || 'es',
    };
  }

  /**
   * Extracts template-specific fields from assessment data
   * @param assessmentData Assessment data from the database
   * @returns Template-specific fields
   */
  private extractTemplateFields(_assessmentData: any): Record<string, any> {
    // This would extract fields specific to each report type
    // For now, we'll return an empty object
    return {};
  }

  /**
   * Calculates age from date of birth
   * @param dateOfBirth Date of birth
   * @returns Age in years
   */
  private calculateAge(dateOfBirth: string | Date): number {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }
}
