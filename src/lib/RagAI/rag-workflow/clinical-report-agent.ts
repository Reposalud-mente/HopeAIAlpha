/**
 * Main RAG workflow implementation for clinical report generation
 */
import { DSM5Retriever } from '../retrieval';
import { GeminiClient, getTemplateForReportType, fillTemplate } from '../generation';
import {
  ClinicalReportAgentConfig,
  DSM5RetrievalResult,
  RAGError,
  ReportGenerationOptions,
  ReportGenerationResult,
  WizardReportData
} from '../types';
import { DEFAULT_CONFIG, ENV, validateEnvironment } from '../config';

/**
 * Main entry point for generating reports using the RAG workflow
 */
export class ClinicalReportAgent {
  private config: ClinicalReportAgentConfig;
  private geminiClient: GeminiClient;
  private dsm5Retriever: DSM5Retriever | null = null;

  /**
   * Constructor
   * @param config Configuration for the clinical report agent
   */
  constructor(config: ClinicalReportAgentConfig) {
    // Validate the configuration
    if (!config.apiKey) {
      throw new RAGError('API key is required for ClinicalReportAgent', 'configuration');
    }

    // Set the configuration with defaults
    this.config = {
      apiKey: config.apiKey,
      modelName: config.modelName || DEFAULT_CONFIG.modelName,
      driveFolderId: config.driveFolderId || ENV.DSM5_DRIVE_FOLDER_ID,
      driveApiKey: config.driveApiKey || ENV.GOOGLE_DRIVE_API_KEY,
      temperature: config.temperature || DEFAULT_CONFIG.temperature,
      maxTokens: config.maxTokens || DEFAULT_CONFIG.maxTokens,
      topK: config.topK || DEFAULT_CONFIG.topK,
      streamResponse: config.streamResponse !== undefined ? config.streamResponse : DEFAULT_CONFIG.streamResponse,
    };

    // Initialize the Gemini client
    this.geminiClient = new GeminiClient(
      this.config.apiKey,
      this.config.modelName,
      this.config.temperature,
      this.config.maxTokens,
      this.config.topK
    );

    // Initialize the DSM-5 retriever if folder ID and API key are provided
    if (this.config.driveFolderId && this.config.driveApiKey) {
      this.dsm5Retriever = new DSM5Retriever(
        this.config.driveFolderId,
        this.config.driveApiKey
      );
    }
  }

  /**
   * Generates a clinical report using the RAG workflow
   * @param wizardData Data from the clinical wizard
   * @param options Options for report generation
   * @returns Promise resolving to the generated report
   */
  async generateReport(
    wizardData: WizardReportData,
    options: ReportGenerationOptions = {}
  ): Promise<ReportGenerationResult> {
    try {
      // Start timing
      const startTime = Date.now();

      // Instead of using the state graph, we'll implement the workflow directly
      // This avoids issues with the LangChain StateGraph implementation

      // 1. Prepare the query
      console.log('Preparing query...');
      const diagnosisPart = wizardData.icdCriteria?.join(' ') || '';
      const reasonsPart = wizardData.consultationReasons?.join(' ') || '';
      const areasPart = wizardData.evaluationAreas?.join(' ') || '';

      // Extract diagnostic codes for more targeted retrieval
      const diagnosticCodes = [];
      if (wizardData.icdCriteria && wizardData.icdCriteria.length > 0) {
        for (const criteria of wizardData.icdCriteria) {
          // Extract codes like F41.1, F32.0, etc.
          const codeMatch = criteria.match(/[A-Z]\d+(\.\d+)?/i);
          if (codeMatch) {
            diagnosticCodes.push(codeMatch[0]);
          }
        }
      }

      // Add specific terms to target diagnostic criteria sections
      const criteriaTerms = 'criterios diagnósticos criterio A criterio B criterio C criterio D';

      // Combine into a query
      let query = `${diagnosisPart} ${reasonsPart} ${areasPart}`.trim();

      // Add diagnostic codes and criteria terms for more targeted retrieval
      if (diagnosticCodes.length > 0) {
        query = `${query} ${diagnosticCodes.join(' ')} ${criteriaTerms}`;
      } else {
        query = `${query} ${criteriaTerms}`;
      }

      // If the query is empty, use a default query
      const finalQuery = query || 'evaluación psicológica general criterios diagnósticos';

      // 2. Retrieve context
      console.log('Retrieving context...');
      let retrievalResults: DSM5RetrievalResult[] = [];

      // Try to use the server-side API route for DSM-5 retrieval
      try {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';

        if (isBrowser) {
          // In browser environment, use the API route
          const response = await fetch('/api/dsm5-retrieval', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: finalQuery,
              maxResults: 5,
              minRelevanceScore: 0.7,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            retrievalResults = data.results;
            console.log(`Retrieved ${retrievalResults.length} results from API`);
          } else {
            throw new Error(data.error || 'Failed to retrieve DSM-5 content from API');
          }
        } else if (this.dsm5Retriever) {
          // In server environment, use the DSM5Retriever directly
          retrievalResults = await this.dsm5Retriever.retrieve(finalQuery);
          console.log(`Retrieved ${retrievalResults.length} results directly`);
        } else {
          throw new Error('No DSM-5 retriever available');
        }
      } catch (error) {
        console.warn('Error retrieving context, continuing with AI knowledge only:', error);
        // Add a fallback message to inform about the missing context
        retrievalResults = [{
          content: 'DSM-5 retrieval was not successful. Using AI knowledge without DSM-5 context.',
          source: 'System Message',
          relevanceScore: 1.0
        }];
      }

      // 3. Prepare the prompt
      console.log('Preparing prompt...');

      // Check if we're using DSM-5 data
      const usingDSM5 = retrievalResults.some(result =>
        result.source.toLowerCase().includes('dsm-5') ||
        result.source.toLowerCase().includes('dsm5')
      );

      // Format the retrieval results
      const contextText = this.formatRetrievalResults(retrievalResults, usingDSM5);

      // Add a note about including criteria codes and direct quotations
      const criteriaCodesNote = '\n\nIMPORTANTE: Cuando menciones diagnósticos basados en el DSM-5, debes OBLIGATORIAMENTE:\n\n1. Incluir los códigos específicos de los criterios (por ejemplo, A.1, A.2, B.1, etc.)\n2. Citar TEXTUALMENTE los criterios del DSM-5 que aparecen en el contexto proporcionado\n3. Explicar detalladamente cómo los síntomas específicos del paciente cumplen con cada criterio\n4. Incluir TODOS los criterios relevantes (A, B, C, etc.) aunque no todos estén presentes en el paciente\n\nEsto es un requisito indispensable para la validez clínica del informe. NO omitas ninguno de estos elementos.';
      const enhancedContextText = contextText + criteriaCodesNote;

      // Format the patient data
      const patientDataText = this.formatPatientData(wizardData);

      // Format the report structure
      const reportStructureText = this.formatReportStructure(wizardData);

      // Get DSM-5 file details if available
      const dsm5FileDetails = retrievalResults.find(result =>
        result.source.toLowerCase().includes('dsm-5') ||
        result.source.toLowerCase().includes('dsm5')
      )?.fileDetails;

      // Add DSM-5 usage instruction with file details if available
      let dsm5Instruction = '';
      if (usingDSM5) {
        dsm5Instruction = '\n\n## IMPORTANTE\n';
        dsm5Instruction += 'Este informe ha sido generado utilizando información del Manual Diagnóstico y Estadístico de los Trastornos Mentales (DSM-5) como fuente de referencia. ';

        if (dsm5FileDetails) {
          dsm5Instruction += `El archivo utilizado es "${dsm5FileDetails.fileName}" (ID: ${dsm5FileDetails.fileId}). `;
        }

        dsm5Instruction += 'Menciona explícitamente en la sección de METODOLOGÍA DE EVALUACIÓN o DIAGNÓSTICO que se ha consultado el DSM-5 como parte del proceso. ';
        dsm5Instruction += 'En la sección de DIAGNÓSTICO, OBLIGATORIAMENTE debes: ';
        dsm5Instruction += '\n1. Incluir los códigos específicos de los criterios diagnósticos (por ejemplo, A.1, A.2, B.1, etc.) ';
        dsm5Instruction += '\n2. Citar TEXTUALMENTE los criterios del DSM-5 que aparecen en el contexto proporcionado ';
        dsm5Instruction += '\n3. Explicar detalladamente cómo los síntomas específicos del paciente cumplen con cada criterio ';
        dsm5Instruction += '\n4. Incluir TODOS los criterios relevantes (A, B, C, etc.) aunque no todos estén presentes en el paciente ';
        dsm5Instruction += '\n\nNO omitas ninguno de estos elementos, ya que son indispensables para la validez clínica del informe.';
      }

      // Get the template for the report type
      const template = getTemplateForReportType(wizardData.reportType);

      // Fill the template
      const prompt = fillTemplate(template, {
        context: enhancedContextText, // Use the enhanced context with criteria codes note
        patientData: patientDataText,
        reportStructure: reportStructureText,
      }) + dsm5Instruction;

      // 4. Generate the report
      console.log('Generating report...');
      const reportText = await this.geminiClient.generateText(prompt);

      // Calculate the total time
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Get DSM-5 file details if available (reuse the variable from earlier)
      const dsm5ResultForMetadata = retrievalResults.find(result =>
        result.source.toLowerCase().includes('dsm-5') ||
        result.source.toLowerCase().includes('dsm5')
      );
      const dsm5FileDetailsForMetadata = dsm5ResultForMetadata?.fileDetails;

      // Return the result
      return {
        reportText,
        metadata: {
          generationTime: totalTime,
          modelName: this.config.modelName || DEFAULT_CONFIG.modelName,
          queryLength: finalQuery.length,
          promptLength: prompt.length,
          reportLength: reportText.length,
          retrievalCount: retrievalResults.length,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          usingDSM5,
          dsm5FileDetails: dsm5FileDetailsForMetadata,
          options,
        },
      };
    } catch (error) {
      console.error('Error generating clinical report:', error);
      throw new RAGError(
        `Failed to generate clinical report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'workflow'
      );
    }
  }

  /**
   * Formats the retrieval results for inclusion in the prompt
   * @param results The retrieval results
   * @param usingDSM5 Whether DSM-5 data is being used
   * @returns Formatted retrieval results as a string
   */
  private formatRetrievalResults(results: DSM5RetrievalResult[], usingDSM5: boolean = false): string {
    if (results.length === 0) {
      return 'No se encontró información relevante en la base de conocimientos DSM-5.';
    }

    // Find DSM-5 file details if available
    const dsm5Result = results.find(result =>
      result.source.toLowerCase().includes('dsm-5') ||
      result.source.toLowerCase().includes('dsm5')
    );

    // Add a header indicating DSM-5 usage with file details if available
    let header = '';
    if (usingDSM5 && dsm5Result?.fileDetails) {
      header = `INFORMACIÓN DEL DSM-5 (${dsm5Result.fileDetails.fileName}) Y OTRAS FUENTES CLÍNICAS:\n`;
    } else if (usingDSM5) {
      header = 'INFORMACIÓN DEL DSM-5 Y OTRAS FUENTES CLÍNICAS:\n';
    } else {
      header = 'INFORMACIÓN DE FUENTES CLÍNICAS:\n';
    }

    const formattedResults = results.map((result, index) => {
      // Add file details to the source if available
      let sourceInfo = result.source;
      if (result.fileDetails) {
        sourceInfo = `${result.source} [Archivo: ${result.fileDetails.fileName}]`;
      }

      // Check if this is a diagnostic criteria section
      let content = result.content;
      if (content.toLowerCase().includes('criterios diagnósticos') ||
          content.toLowerCase().includes('criterio a') ||
          content.toLowerCase().includes('criterio b')) {
        // Highlight diagnostic criteria sections
        content = `SECCIÓN DE CRITERIOS DIAGNÓSTICOS - CITA TEXTUALMENTE ESTOS CRITERIOS EN EL INFORME\n\n${content}`;
      }

      return `
FUENTE ${index + 1}: ${sourceInfo}
${'-'.repeat(80)}
${content}
${'-'.repeat(80)}
`;
    }).join('\n');

    return header + formattedResults;
  }

  /**
   * Formats the patient data for inclusion in the prompt
   * @param wizardData The wizard data
   * @returns Formatted patient data as a string
   */
  private formatPatientData(wizardData: WizardReportData): string {
    return `
INFORMACIÓN DEL PACIENTE:
- Nombre: ${wizardData.patientName}
- Edad: ${wizardData.patientAge || 'No especificada'}
- Género: ${wizardData.patientGender || 'No especificado'}
- Fecha de nacimiento: ${wizardData.patientDateOfBirth || 'No especificada'}

INFORMACIÓN DE LA EVALUACIÓN:
- Fecha de evaluación: ${wizardData.assessmentDate}
- Profesional: ${wizardData.clinicianName}
- Centro: ${wizardData.clinicName}

MOTIVOS DE CONSULTA:
${wizardData.consultationReasons?.map(reason => `- ${reason}`).join('\n') || '- No especificados'}

ÁREAS EVALUADAS:
${wizardData.evaluationAreas?.map(area => `- ${area}`).join('\n') || '- No especificadas'}

CRITERIOS DIAGNÓSTICOS:
${wizardData.icdCriteria?.map(criteria => `- ${criteria}`).join('\n') || '- No especificados'}
${wizardData.isPrimaryDiagnosis ? '- Diagnóstico primario confirmado' : ''}

INFORMACIÓN ADICIONAL:
${Object.entries(wizardData.templateFields || {})
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n') || '- No hay información adicional'}
`;
  }

  /**
   * Formats the report structure for inclusion in the prompt
   * @param wizardData The wizard data
   * @returns Formatted report structure as a string
   */
  private formatReportStructure(wizardData: WizardReportData): string {
    // Define report structure based on report type
    const structures: Record<string, string[]> = {
      'evaluacion-psicologica': [
        'DATOS DE IDENTIFICACIÓN',
        'MOTIVO DE CONSULTA',
        'METODOLOGÍA DE EVALUACIÓN',
        'RESULTADOS DE LA EVALUACIÓN',
        'DIAGNÓSTICO',
        'CONCLUSIONES',
        'RECOMENDACIONES',
      ],
      'seguimiento-terapeutico': [
        'DATOS DE IDENTIFICACIÓN',
        'ANTECEDENTES',
        'EVOLUCIÓN DEL TRATAMIENTO',
        'ESTADO ACTUAL',
        'OBJETIVOS TERAPÉUTICOS',
        'PLAN DE CONTINUIDAD',
      ],
      'evaluacion-neuropsicologica': [
        'DATOS DE IDENTIFICACIÓN',
        'MOTIVO DE CONSULTA',
        'HISTORIA CLÍNICA RELEVANTE',
        'PRUEBAS ADMINISTRADAS',
        'RESULTADOS POR DOMINIO COGNITIVO',
        'DIAGNÓSTICO',
        'CONCLUSIONES',
        'RECOMENDACIONES',
      ],
      'informe-familiar': [
        'DATOS DE IDENTIFICACIÓN',
        'MOTIVO DE CONSULTA FAMILIAR',
        'COMPOSICIÓN FAMILIAR',
        'DINÁMICA FAMILIAR',
        'FACTORES DE RIESGO Y PROTECCIÓN',
        'CONCLUSIONES',
        'INTERVENCIÓN SUGERIDA',
      ],
      'informe-educativo': [
        'DATOS DE IDENTIFICACIÓN',
        'MOTIVO DE EVALUACIÓN ESCOLAR',
        'HISTORIA ACADÉMICA',
        'EVALUACIONES APLICADAS',
        'RESULTADOS',
        'DIAGNÓSTICO EDUCATIVO',
        'RECOMENDACIONES ESCOLARES',
      ],
      'alta-terapeutica': [
        'DATOS DE IDENTIFICACIÓN',
        'DIAGNÓSTICO INICIAL',
        'RESUMEN DEL PROCESO TERAPÉUTICO',
        'LOGROS TERAPÉUTICOS',
        'ESTADO ACTUAL',
        'RECOMENDACIONES DE SEGUIMIENTO',
      ],
    };

    // Get the structure for the report type
    const structure = structures[wizardData.reportType] || structures['evaluacion-psicologica'];

    // Format the structure
    return structure.map((section, index) => `${index + 1}. ${section}`).join('\n');
  }

  /**
   * Validates the environment variables
   * @returns True if the environment is valid, false otherwise
   */
  static validateEnvironment(): boolean {
    const validation = validateEnvironment();

    if (!validation.isValid) {
      console.warn(`Missing environment variables: ${validation.missingVars.join(', ')}`);
      return false;
    }

    return true;
  }
}
