import { prisma } from '@/lib/prisma';
import { validateReportDataRequirements } from './database-validation';

/**
 * Interface for the report generation request
 */
export interface ReportGenerationRequest {
  assessmentId: string;
  userId: string;
  language?: 'es' | 'en';
  includeRecommendations?: boolean;
  includeTreatmentPlan?: boolean;
  reportStyle?: 'clinical' | 'educational' | 'concise';
}

/**
 * Interface for the report generation response
 */
export interface ReportGenerationResponse {
  success: boolean;
  reportId?: string;
  reportText?: string;
  error?: string;
}

/**
 * Main AI agent class for psychological report generation
 */
export class AIReportAgent {
  /**
   * Generates a psychological report based on assessment data
   * @param request The report generation request
   * @returns A promise resolving to the report generation response
   */
  public async generateReport(request: ReportGenerationRequest): Promise<ReportGenerationResponse> {
    try {
      // Step 1: Validate that all required data is available
      const validationResult = await validateReportDataRequirements(request.assessmentId);

      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.message,
        };
      }

      // Step 2: Extract all the necessary data for report generation
      const assessment = validationResult.assessment!;

      // Step 3: Generate the report content using the assessment data
      const reportText = await this.generateReportContent(assessment, request);

      // Step 4: Save the report to the database
      const report = await this.saveReportToDatabase(reportText, request);

      // Step 5: Return the successful response
      return {
        success: true,
        reportId: report.id,
        reportText: report.reportText,
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Generates the report content based on assessment data
   * @param assessment The assessment with all related data
   * @param request The report generation request
   * @returns The generated report text
   */
  private async generateReportContent(assessment: any, request: ReportGenerationRequest): Promise<string> {
    // Extract patient data
    const patient = assessment.patient;
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const patientAge = this.calculateAge(patient.dateOfBirth);

    // Extract clinician data
    const clinician = assessment.clinician;
    const clinicianName = `${clinician.firstName} ${clinician.lastName}`;

    // Extract consultation reasons
    const consultationReasons = assessment.consultationReasons.map((reason: any) => reason.reason);

    // Extract evaluation areas with notes
    const evaluationAreas = assessment.evaluationAreas.map((evalArea: any) => ({
      name: evalArea.area.name,
      description: evalArea.area.description,
      notes: evalArea.notes,
    }));

    // Extract ICD criteria with primary diagnosis first
    const primaryDiagnosis = assessment.icdCriteria
      .filter((criteria: any) => criteria.isPrimary)
      .map((criteria: any) => ({
        code: criteria.criteria.code,
        name: criteria.criteria.name,
        description: criteria.criteria.description,
        notes: criteria.notes,
        certaintyLevel: criteria.certaintyLevel,
      }));

    const secondaryDiagnoses = assessment.icdCriteria
      .filter((criteria: any) => !criteria.isPrimary)
      .map((criteria: any) => ({
        code: criteria.criteria.code,
        name: criteria.criteria.name,
        description: criteria.criteria.description,
        notes: criteria.notes,
        certaintyLevel: criteria.certaintyLevel,
      }));

    // Construct the report sections with proper typing
    const reportSections: Record<string, string> = {
      header: this.generateHeaderSection(patient, clinician, assessment.clinic),
      consultationReasons: this.generateConsultationReasonsSection(consultationReasons),
      evaluationAreas: this.generateEvaluationAreasSection(evaluationAreas),
      diagnosis: this.generateDiagnosisSection(primaryDiagnosis, secondaryDiagnoses),
      conclusions: this.generateConclusionsSection(evaluationAreas, primaryDiagnosis),
    };

    // Add optional sections based on request parameters
    if (request.includeRecommendations) {
      reportSections.recommendations = this.generateRecommendationsSection(
        primaryDiagnosis,
        evaluationAreas
      );
    }

    if (request.includeTreatmentPlan) {
      reportSections.treatmentPlan = this.generateTreatmentPlanSection(
        primaryDiagnosis,
        evaluationAreas
      );
    }

    // Combine all sections into the final report
    return this.assembleReportSections(reportSections, request.reportStyle || 'clinical');
  }

  /**
   * Saves the generated report to the database
   * @param reportText The generated report text
   * @param request The report generation request
   * @returns The saved report object
   */
  private async saveReportToDatabase(reportText: string, request: ReportGenerationRequest) {
    return await prisma.report.create({
      data: {
        assessmentId: request.assessmentId,
        reportText: reportText,
        createdById: request.userId,
        version: 1, // Initial version
        isFinal: false, // Not final until reviewed by clinician
        filename: `report_${request.assessmentId}_${new Date().toISOString().split('T')[0]}`,
      },
    });
  }

  /**
   * Calculates age from date of birth
   * @param dateOfBirth Date of birth
   * @returns Age in years
   */
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDifference = today.getMonth() - dateOfBirth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Generates the header section of the report
   */
  private generateHeaderSection(patient: any, clinician: any, clinic: any): string {
    const patientName = `${patient.firstName} ${patient.lastName}`;
    const patientAge = this.calculateAge(patient.dateOfBirth);
    const clinicianName = `${clinician.firstName} ${clinician.lastName}`;
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `# INFORME DE EVALUACIÓN PSICOLÓGICA

## DATOS DE IDENTIFICACIÓN
**Paciente:** ${patientName}
**Edad:** ${patientAge} años
**Fecha de Nacimiento:** ${patient.dateOfBirth.toLocaleDateString('es-ES')}
**Género:** ${patient.gender || 'No especificado'}

## DATOS DE LA EVALUACIÓN
**Profesional:** ${clinicianName}
**Licencia:** ${clinician.licenseNumber || 'No especificada'}
**Institución:** ${clinic.name}
**Fecha de Evaluación:** ${currentDate}`;
  }

  /**
   * Generates the consultation reasons section
   */
  private generateConsultationReasonsSection(reasons: string[]): string {
    return `## MOTIVO DE CONSULTA
${reasons.map(reason => `- ${reason}`).join('\n')}`;
  }

  /**
   * Generates the evaluation areas section
   */
  private generateEvaluationAreasSection(areas: any[]): string {
    let section = `## ÁREAS EVALUADAS\n`;

    areas.forEach(area => {
      section += `### ${area.name}\n`;
      if (area.notes) {
        section += `${area.notes}\n\n`;
      } else {
        section += `Se realizó evaluación de esta área.\n\n`;
      }
    });

    return section;
  }

  /**
   * Generates the diagnosis section
   */
  private generateDiagnosisSection(primaryDiagnosis: any[], secondaryDiagnoses: any[]): string {
    let section = `## DIAGNÓSTICO\n`;

    if (primaryDiagnosis.length > 0) {
      section += `### Diagnóstico Principal\n`;
      primaryDiagnosis.forEach(diagnosis => {
        section += `**${diagnosis.code} - ${diagnosis.name}**\n`;
        if (diagnosis.notes) {
          section += `${diagnosis.notes}\n\n`;
        }
      });
    }

    if (secondaryDiagnoses.length > 0) {
      section += `### Diagnósticos Secundarios\n`;
      secondaryDiagnoses.forEach(diagnosis => {
        section += `**${diagnosis.code} - ${diagnosis.name}**\n`;
        if (diagnosis.notes) {
          section += `${diagnosis.notes}\n\n`;
        }
      });
    }

    return section;
  }

  /**
   * Generates the conclusions section
   */
  private generateConclusionsSection(evaluationAreas: any[], primaryDiagnosis: any[]): string {
    // In a real implementation, this would use more sophisticated logic to generate
    // meaningful conclusions based on the evaluation areas and diagnoses

    return `## CONCLUSIONES
Basado en la evaluación realizada, se observa que el paciente presenta características consistentes con ${primaryDiagnosis[0]?.name || 'el diagnóstico indicado'}.

La evaluación de las diferentes áreas muestra ${evaluationAreas.length} áreas evaluadas, con hallazgos significativos en ${evaluationAreas.filter(a => a.notes).length} de ellas.`;
  }

  /**
   * Generates the recommendations section
   */
  private generateRecommendationsSection(primaryDiagnosis: any[], evaluationAreas: any[]): string {
    // In a real implementation, this would use more sophisticated logic to generate
    // tailored recommendations based on the diagnoses and evaluation areas

    return `## RECOMENDACIONES
1. Se recomienda seguimiento terapéutico enfocado en las áreas identificadas.
2. Evaluación periódica para monitorear el progreso.
3. Psicoeducación sobre el diagnóstico y estrategias de afrontamiento.
4. Considerar la inclusión de la familia en el proceso terapéutico.`;
  }

  /**
   * Generates the treatment plan section
   */
  private generateTreatmentPlanSection(primaryDiagnosis: any[], evaluationAreas: any[]): string {
    // In a real implementation, this would use more sophisticated logic to generate
    // a tailored treatment plan based on the diagnoses and evaluation areas

    return `## PLAN DE TRATAMIENTO
1. **Fase Inicial (1-4 semanas):**
   - Psicoeducación sobre el diagnóstico
   - Establecimiento de alianza terapéutica
   - Identificación de objetivos terapéuticos

2. **Fase Intermedia (5-12 semanas):**
   - Desarrollo de habilidades de afrontamiento
   - Trabajo en áreas específicas identificadas en la evaluación
   - Reevaluación de progresos

3. **Fase de Consolidación (13-20 semanas):**
   - Reforzamiento de logros
   - Prevención de recaídas
   - Planificación de seguimiento`;
  }

  /**
   * Assembles all report sections into the final report
   */
  private assembleReportSections(sections: Record<string, string>, style: string): string {
    // In a real implementation, the style parameter would affect the formatting and language
    // of the report. For now, we'll just concatenate all sections.

    return Object.values(sections).join('\n\n') + '\n\n---\n\nEste informe es de carácter confidencial y debe ser utilizado únicamente por profesionales de la salud mental autorizados.';
  }
}
