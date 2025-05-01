import { GoogleGenAI } from '@google/genai';

/**
 * Interface for the wizard report data
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
 * Generates a clinical report based on wizard data
 * @param wizardData Data collected from the clinical wizard
 * @param apiKey Google Gemini API key
 * @returns Generated report text
 */
async function clinicalReportWorkflow({ wizardData, apiKey }: { wizardData: WizardReportData, apiKey: string }) {
  // Initialize the Google GenAI with the API key
  if (!apiKey) {
    throw new Error('API key is required for Gemini API');
  }

  // Initialize the Google GenAI client according to the official documentation
  const ai = new GoogleGenAI({apiKey: apiKey});

  // Get the models API reference

  // Step 1: Prepare clinical data
  const clinicalData = {
    patientInfo: {
      name: wizardData.patientName,
      age: wizardData.patientAge?.toString() || 'No especificado',
      gender: wizardData.patientGender || 'No especificado',
      dateOfBirth: wizardData.patientDateOfBirth || 'No especificado',
      presentingConcerns: wizardData.consultationReasons?.join(", ") || 'No especificado',
    },
    assessmentDetails: {
      assessmentType: mapReportTypeToAssessmentType(wizardData.reportType),
      assessmentDate: wizardData.assessmentDate,
      clinicianName: wizardData.clinicianName,
      clinicName: wizardData.clinicName,
      // Extract template-specific fields based on report type
      ...extractTemplateFields(wizardData.reportType, wizardData.templateFields || {}),
    },
    clinicalImpressions: {
      diagnosticConsiderations: wizardData.icdCriteria?.join(", ") || 'No especificado',
      isPrimaryDiagnosis: wizardData.isPrimaryDiagnosis || false,
      evaluationAreas: wizardData.evaluationAreas?.join(", ") || 'No especificado',
    },
    reportType: wizardData.reportType,
    includeRecommendations: wizardData.includeRecommendations || true,
    includeTreatmentPlan: wizardData.includeTreatmentPlan || true,
    language: wizardData.language || 'es',
  };

  // Step 2: Define report structure based on report type
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

  const reportStructure = {
    reportType: clinicalData.reportType,
    sections: structures[clinicalData.reportType] || structures['evaluacion-psicologica'],
  };

  // Step 3: Generate the clinical report content using Gemini
  const prompt = `
  # SISTEMA DE GENERACIÓN DE INFORMES PSICOLÓGICOS

  Eres un agente especializado en psicología clínica diseñado para generar informes psicológicos profesionales en español. Tu objetivo es analizar datos clínicos y producir un informe estructurado que cumpla con estándares profesionales.

  ## DEFINICIÓN DEL FLUJO DE TRABAJO
  Ejecutarás este flujo de trabajo secuencial, verificando cada paso antes de continuar:

  1. PREPARACIÓN DE DATOS [Obligatorio]
     - Analiza todos los datos del paciente, evaluación e impresiones clínicas proporcionados
     - Identifica qué información está disponible y cuál falta para cada sección requerida
     - Organiza los datos disponibles según las secciones del informe

  2. PLANIFICACIÓN DEL INFORME [Obligatorio]
     - Determina el contenido apropiado para cada sección basándote solo en los datos disponibles
     - Planifica cómo presentar la información de manera coherente y profesional
     - Identifica posibles limitaciones en los datos y cómo abordarlas

  3. REDACCIÓN DEL INFORME [Obligatorio]
     - Redacta cada sección siguiendo estrictamente el formato especificado
     - Utiliza un lenguaje clínico profesional pero accesible
     - Asegúrate de que cada sección tenga contenido sustancial y bien estructurado

  4. VALIDACIÓN Y CORRECCIÓN [Obligatorio]
     - Verifica que cada sección cumpla con los requisitos de formato
     - Confirma que no hay saltos de línea adicionales antes de los encabezados
     - Comprueba que toda la información incluida esté respaldada por los datos proporcionados
     - Corrige cualquier problema detectado antes de finalizar

  ## ESPECIFICACIONES DE FORMATO
  Sigue estas especificaciones exactas:

  - ENCABEZADOS: Utiliza "## NOMBRE DE SECCIÓN" (sin comillas) para cada sección. NO incluyas líneas en blanco antes de los encabezados.
  - ESTRUCTURA: El informe debe incluir exactamente estas secciones en este orden: ${reportStructure.sections.join(", ")}.
  - LISTAS: Utiliza viñetas (*) para listas no ordenadas y numeración (1., 2., etc.) para listas ordenadas.
  - DATOS DE IDENTIFICACIÓN: Presenta siempre esta información en formato de lista con viñetas.
  - DIAGNÓSTICO: Presenta los criterios diagnósticos con sus códigos en formato de lista.

  ## DIRECTRICES DE CONTENIDO CLÍNICO
  - TERMINOLOGÍA: Utiliza terminología clínica precisa pero comprensible para profesionales no especializados.
  - DISTINCIÓN DE FUENTES: Diferencia claramente entre síntomas reportados, observaciones clínicas y tus interpretaciones.
  - DATOS LIMITADOS: Cuando la información sea insuficiente, indica explícitamente las limitaciones sin inventar datos.
  - CONEXIONES LÓGICAS: Establece relaciones claras entre síntomas, observaciones y conclusiones diagnósticas.
  - LENGUAJE CENTRADO EN LA PERSONA: Evita etiquetas estigmatizantes y utiliza lenguaje que respete la dignidad del paciente.

  ## MANEJO DE SECCIONES CONDICIONALES
  - RECOMENDACIONES: ${clinicalData.includeRecommendations ? "Incluye recomendaciones específicas y relevantes basadas en el diagnóstico identificado. Estructura esta sección con viñetas o numeración para mayor claridad." : "Omite recomendaciones detalladas o indica brevemente que no se solicitan en esta evaluación."}
  - PLAN DE TRATAMIENTO: ${clinicalData.includeTreatmentPlan ? "Proporciona un plan de tratamiento estructurado con objetivos a corto y mediano plazo. Utiliza viñetas o numeración y organiza por fases temporales." : "Omite el plan de tratamiento o indica brevemente que no se incluye en esta evaluación."}

  ## GUARDRAILS Y RESTRICCIONES
  Estas restricciones son absolutas y no pueden ser ignoradas bajo ninguna circunstancia:

  - NO incluyas información que no esté explícitamente respaldada por los datos proporcionados.
  - NO utilices conocimiento externo sobre condiciones médicas o psicológicas no mencionadas en los datos.
  - NO incluyas saltos de línea adicionales antes de los encabezados de sección.
  - NO utilices lenguaje estigmatizante o patologizante.
  - NO hagas recomendaciones farmacológicas específicas.
  - NO generes contenido ficticio para completar secciones con datos insuficientes.

  ## MANEJO DE ERRORES Y LIMITACIONES
  Si encuentras alguna de estas situaciones, actúa según se indica:

  - DATOS INSUFICIENTES: Indica claramente "Información no disponible en los datos proporcionados" en la sección correspondiente.
  - INCONSISTENCIAS: Si detectas inconsistencias en los datos, prioriza la información más específica y reciente.
  - FORMATO INCORRECTO: Si detectas problemas de formato durante la validación, corrígelos antes de finalizar.

  ## DATOS PARA EL INFORME
  Genera un informe psicológico completo de tipo "${reportStructure.reportType}" con las secciones especificadas, basándote EXCLUSIVAMENTE en esta información:

  Información del paciente: ${JSON.stringify(clinicalData.patientInfo)}
  Detalles de la evaluación: ${JSON.stringify(clinicalData.assessmentDetails)}
  Impresiones clínicas: ${JSON.stringify(clinicalData.clinicalImpressions)}

  ## VALIDACIÓN FINAL
  Antes de finalizar, verifica que tu informe cumple con todos estos criterios:
  1. Todas las secciones requeridas están presentes y correctamente formateadas
  2. No hay saltos de línea adicionales antes de los encabezados
  3. Toda la información incluida está respaldada por los datos proporcionados
  4. El lenguaje es profesional, claro y respetuoso
  5. Las secciones condicionales se han manejado según las instrucciones

  Genera ahora el informe completo en español, siguiendo estrictamente todas las instrucciones anteriores.
  `;

  // Generate content with Gemini using the correct API pattern
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt
  });

  // Get the text from the response
  const text = response.text || '';

  return text;
}

/**
 * Helper function to map report type to assessment type
 */
function mapReportTypeToAssessmentType(reportType: string): string {
  const mapping: Record<string, string> = {
    'evaluacion-psicologica': 'Evaluación Psicológica',
    'seguimiento-terapeutico': 'Seguimiento Terapéutico',
    'evaluacion-neuropsicologica': 'Evaluación Neuropsicológica',
    'informe-familiar': 'Evaluación Familiar',
    'informe-educativo': 'Evaluación Educativa',
    'alta-terapeutica': 'Alta Terapéutica',
  };
  return mapping[reportType] || 'Evaluación Psicológica';
}

/**
 * Helper function to extract template-specific fields
 */
function extractTemplateFields(_reportType: string, templateFields: Record<string, any>): Record<string, any> {
  // Return the template fields directly, they're already structured by the wizard
  return templateFields;
}

/**
 * Main function to generate a clinical report
 * @param wizardData Data from the clinical wizard
 * @param apiKey OpenAI API key
 * @returns Generated report text
 */
export async function generateClinicalReport(wizardData: WizardReportData, apiKey: string): Promise<string> {
  try {
    const result = await clinicalReportWorkflow({
      wizardData,
      apiKey
    });
    return result;
  } catch (error) {
    console.error('Error generating clinical report:', error);
    return `Error generando el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`;
  }
}