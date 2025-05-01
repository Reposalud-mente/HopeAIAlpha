import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Report types
type ReportType =
  | 'evaluacion-psicologica'
  | 'seguimiento-terapeutico'
  | 'evaluacion-neuropsicologica'
  | 'informe-familiar'
  | 'informe-educativo'
  | 'alta-terapeutica';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Generate a psychological evaluation report
 */
function generatePsychologicalEvaluationReport(patient: any, clinician: any, clinic: any) {
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientAge = calculateAge(patient.dateOfBirth);
  const patientGender = patient.gender === 'MALE' ? 'masculino' : 'femenino';
  const clinicianName = clinician ? `${clinician.firstName} ${clinician.lastName}` : 'Dr. Psicólogo';
  const clinicName = clinic ? clinic.name : 'Clínica HopeAI';
  const currentDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  // Motivos de consulta comunes
  const motivosConsulta = [
    'Ansiedad generalizada',
    'Síntomas depresivos',
    'Dificultades en relaciones interpersonales',
    'Problemas de autoestima',
    'Estrés laboral/académico',
    'Dificultades de adaptación',
    'Problemas de conducta',
    'Dificultades de aprendizaje',
    'Conflictos familiares',
    'Duelo'
  ];

  // Seleccionar 1-3 motivos de consulta aleatorios
  const selectedMotivos = [];
  const numMotivos = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numMotivos; i++) {
    const randomIndex = Math.floor(Math.random() * motivosConsulta.length);
    if (!selectedMotivos.includes(motivosConsulta[randomIndex])) {
      selectedMotivos.push(motivosConsulta[randomIndex]);
    }
  }

  // Áreas evaluadas
  const areasEvaluadas = [
    'Cognitiva',
    'Emocional',
    'Conductual',
    'Social',
    'Familiar',
    'Laboral/Académica'
  ];

  // Seleccionar 3-5 áreas evaluadas aleatorias
  const selectedAreas = [];
  const numAreas = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < numAreas; i++) {
    const randomIndex = Math.floor(Math.random() * areasEvaluadas.length);
    if (!selectedAreas.includes(areasEvaluadas[randomIndex])) {
      selectedAreas.push(areasEvaluadas[randomIndex]);
    }
  }

  // Diagnósticos comunes
  const diagnosticos = [
    'Trastorno de ansiedad generalizada (F41.1)',
    'Episodio depresivo moderado (F32.1)',
    'Trastorno de adaptación (F43.2)',
    'Trastorno mixto ansioso-depresivo (F41.2)',
    'Trastorno de estrés postraumático (F43.1)',
    'Trastorno de la personalidad (F60)',
    'Trastorno por déficit de atención e hiperactividad (F90.0)',
    'Trastorno del espectro autista (F84.0)',
    'Trastorno obsesivo-compulsivo (F42)',
    'Trastorno bipolar (F31)'
  ];

  // Seleccionar un diagnóstico principal aleatorio
  const diagnosticoPrincipal = diagnosticos[Math.floor(Math.random() * diagnosticos.length)];

  // Generar el informe
  return `# INFORME DE EVALUACIÓN PSICOLÓGICA

## DATOS DE IDENTIFICACIÓN
**Paciente:** ${patientName}
**Edad:** ${patientAge} años
**Género:** ${patientGender}
**Fecha de evaluación:** ${currentDate}
**Psicólogo/a:** ${clinicianName}
**Centro:** ${clinicName}

## MOTIVO DE CONSULTA
El/La paciente acude a consulta por ${selectedMotivos.join(', ').toLowerCase()}. Refiere que estos síntomas comenzaron hace aproximadamente ${Math.floor(Math.random() * 12) + 1} meses, con un impacto significativo en su funcionamiento diario.

## ANTECEDENTES RELEVANTES
${patientName} no refiere antecedentes psicopatológicos previos de relevancia. ${Math.random() > 0.5 ? 'No ha recibido tratamiento psicológico o psiquiátrico anteriormente.' : 'Ha recibido tratamiento psicológico previamente por un período breve, sin continuidad.'} ${Math.random() > 0.7 ? 'No reporta antecedentes familiares de trastornos psicológicos.' : 'Reporta antecedentes familiares de trastornos del estado de ánimo.'}

## ÁREAS EVALUADAS
Se realizó una evaluación integral que incluyó las siguientes áreas:
${selectedAreas.map(area => `- **Área ${area.toLowerCase()}**: Evaluación de ${getAreaDescription(area)}`).join('\n')}

## INSTRUMENTOS UTILIZADOS
- Entrevista clínica estructurada
- Observación conductual
${getRandomTests().map(test => `- ${test}`).join('\n')}

## RESULTADOS DE LA EVALUACIÓN

### Aspectos cognitivos
${getCognitiveResults(patientName)}

### Aspectos emocionales
${getEmotionalResults(selectedMotivos)}

### Aspectos conductuales
${getBehavioralResults()}

### Aspectos sociales
${getSocialResults()}

## DIAGNÓSTICO
**Diagnóstico Principal:**
${diagnosticoPrincipal}

${Math.random() > 0.5 ? `**Diagnóstico Secundario:**\n${diagnosticos[Math.floor(Math.random() * diagnosticos.length)]}\n` : ''}
## CONCLUSIONES
${getConclusions(patientName, selectedMotivos, diagnosticoPrincipal)}

## RECOMENDACIONES
${getRecommendations(diagnosticoPrincipal)}

## PLAN DE TRATAMIENTO
${getTreatmentPlan()}

---

Este informe es de carácter confidencial y está destinado únicamente al uso profesional. La información contenida debe ser interpretada por profesionales de la salud mental cualificados.

Firmado: ${clinicianName}
Fecha: ${currentDate}`;
}

/**
 * Helper function to calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Helper function to get area description
 */
function getAreaDescription(area: string): string {
  switch (area) {
    case 'Cognitiva':
      return 'procesos de atención, memoria, funciones ejecutivas y capacidad de resolución de problemas.';
    case 'Emocional':
      return 'regulación emocional, presencia de sintomatología ansiosa o depresiva, y manejo del estrés.';
    case 'Conductual':
      return 'patrones de comportamiento, hábitos, y respuestas ante situaciones específicas.';
    case 'Social':
      return 'habilidades sociales, calidad de las relaciones interpersonales y adaptación a diferentes contextos.';
    case 'Familiar':
      return 'dinámica familiar, roles, comunicación y posibles conflictos en el sistema familiar.';
    case 'Laboral/Académica':
      return 'desempeño, satisfacción, estrés y adaptación en el ámbito laboral o académico.';
    default:
      return 'diversos aspectos relevantes para la comprensión del caso.';
  }
}

/**
 * Helper function to get random psychological tests
 */
function getRandomTests(): string[] {
  const tests = [
    'Inventario de Ansiedad de Beck (BAI)',
    'Inventario de Depresión de Beck (BDI-II)',
    'Escala de Ansiedad de Hamilton (HARS)',
    'Escala de Depresión de Hamilton (HDRS)',
    'Escala de Impulsividad de Barratt (BIS-11)',
    'Inventario Clínico Multiaxial de Millon (MCMI-IV)',
    'Inventario Multifásico de Personalidad de Minnesota (MMPI-2)',
    'Escala de Inteligencia de Wechsler para Adultos (WAIS-IV)',
    'Test de Rorschach',
    'Test de Apercepción Temática (TAT)',
    'Escala de Afrontamiento de Moos (CRI-A)',
    'Cuestionario de 90 Síntomas Revisado (SCL-90-R)',
    'Escala de Trauma de Davidson',
    'Escala de Calidad de Vida (WHOQOL-BREF)',
    'Test del Dibujo de la Figura Humana'
  ];

  const selectedTests = [];
  const numTests = Math.floor(Math.random() * 3) + 2; // 2-4 tests

  for (let i = 0; i < numTests; i++) {
    const randomIndex = Math.floor(Math.random() * tests.length);
    if (!selectedTests.includes(tests[randomIndex])) {
      selectedTests.push(tests[randomIndex]);
    }
  }

  return selectedTests;
}

/**
 * Helper function to get cognitive results
 */
function getCognitiveResults(patientName: string): string {
  const cognitiveResults = [
    `${patientName} presenta un funcionamiento cognitivo dentro de parámetros normales. No se observan alteraciones significativas en procesos de atención, memoria o funciones ejecutivas.`,
    `Se observa un rendimiento adecuado en tareas de atención sostenida y selectiva. La memoria de trabajo y a largo plazo se encuentran preservadas, sin dificultades para el almacenamiento y recuperación de información.`,
    `Las funciones ejecutivas muestran un desarrollo adecuado, con capacidad de planificación, organización y resolución de problemas dentro de lo esperado para su edad y nivel educativo.`,
    `Se identifican leves dificultades en la atención sostenida, especialmente en tareas que requieren concentración prolongada. Esto podría estar relacionado con la sintomatología ansiosa referida.`,
    `El procesamiento de información se encuentra ligeramente enlentecido, posiblemente asociado a la presencia de rumiaciones y preocupaciones excesivas.`
  ];

  // Seleccionar 2-3 resultados aleatorios
  const selectedResults = [];
  const numResults = Math.floor(Math.random() * 2) + 2;

  for (let i = 0; i < numResults; i++) {
    const randomIndex = Math.floor(Math.random() * cognitiveResults.length);
    if (!selectedResults.includes(cognitiveResults[randomIndex])) {
      selectedResults.push(cognitiveResults[randomIndex]);
    }
  }

  return selectedResults.join(' ');
}

/**
 * Helper function to get emotional results
 */
function getEmotionalResults(motivos: string[]): string {
  let baseResults = '';

  if (motivos.includes('Ansiedad generalizada')) {
    baseResults += 'Se observa presencia de sintomatología ansiosa significativa, caracterizada por preocupación excesiva, tensión muscular, inquietud y dificultades para controlar las preocupaciones. Los resultados en las pruebas aplicadas indican niveles de ansiedad moderados a severos. ';
  }

  if (motivos.includes('Síntomas depresivos')) {
    baseResults += 'La evaluación revela presencia de sintomatología depresiva caracterizada por estado de ánimo bajo, anhedonia, fatiga, sentimientos de inutilidad y dificultades de concentración. Los resultados en las escalas de depresión indican un nivel moderado. ';
  }

  if (motivos.includes('Problemas de autoestima')) {
    baseResults += 'Se identifica una autoestima disminuida, con tendencia a la autocrítica excesiva y pensamientos negativos sobre sí mismo/a. Presenta dificultades para reconocer sus propias capacidades y logros. ';
  }

  if (motivos.includes('Estrés laboral/académico')) {
    baseResults += 'Se evidencia un nivel elevado de estrés relacionado con el ámbito laboral/académico, con dificultades para manejar la presión y establecer límites adecuados. Esto genera un impacto significativo en su bienestar emocional. ';
  }

  if (baseResults === '') {
    baseResults = 'La evaluación emocional muestra indicadores de malestar psicológico significativo, con presencia de sintomatología mixta ansiosa y depresiva. Se observa dificultad en la regulación emocional y tendencia a la rumiación de pensamientos negativos. ';
  }

  return baseResults;
}

/**
 * Helper function to get behavioral results
 */
function getBehavioralResults(): string {
  const behavioralResults = [
    'A nivel conductual, se observa un patrón de evitación de situaciones que generan malestar o ansiedad, lo que limita su funcionamiento en diversas áreas de su vida.',
    'Presenta patrones de comportamiento adaptativos en la mayoría de los contextos, aunque se identifican algunas conductas de evitación ante situaciones específicas que generan malestar.',
    'Se observan conductas de hipervigilancia y respuestas de sobresalto exageradas ante estímulos neutros, consistentes con un estado de alerta constante.',
    'A nivel conductual, mantiene un funcionamiento adecuado en sus actividades cotidianas, aunque con mayor esfuerzo debido a la sintomatología presente.',
    'Se identifican patrones de comportamiento caracterizados por la postergación de tareas y dificultades para mantener la constancia en actividades iniciadas.'
  ];

  return behavioralResults[Math.floor(Math.random() * behavioralResults.length)];
}

/**
 * Helper function to get social results
 */
function getSocialResults(): string {
  const socialResults = [
    'En el ámbito social, mantiene relaciones interpersonales significativas y una red de apoyo adecuada, aunque refiere cierta dificultad para expresar sus necesidades y establecer límites en algunas relaciones.',
    'Presenta habilidades sociales adecuadas, aunque se observa cierta tendencia al aislamiento en períodos de mayor sintomatología. Su red de apoyo social es limitada pero funcional.',
    'Se identifican dificultades significativas en las relaciones interpersonales, con tendencia al aislamiento y evitación de situaciones sociales que generan ansiedad.',
    'Mantiene un funcionamiento social adecuado en contextos estructurados, aunque con dificultades para iniciar y mantener nuevas relaciones. Cuenta con un círculo social reducido pero estable.',
    'A nivel social, presenta un funcionamiento preservado, con capacidad para establecer y mantener relaciones significativas, aunque refiere cierto malestar en situaciones sociales específicas.'
  ];

  return socialResults[Math.floor(Math.random() * socialResults.length)];
}

/**
 * Helper function to get conclusions
 */
function getConclusions(patientName: string, motivos: string[], diagnostico: string): string {
  let conclusion = `Tras la evaluación realizada, se concluye que ${patientName} presenta un cuadro clínico compatible con ${diagnostico.split('(')[0].trim()}. `;

  if (motivos.includes('Ansiedad generalizada')) {
    conclusion += 'La sintomatología ansiosa constituye el núcleo principal de su malestar, afectando significativamente su calidad de vida y funcionamiento diario. ';
  } else if (motivos.includes('Síntomas depresivos')) {
    conclusion += 'La sintomatología depresiva constituye el núcleo principal de su malestar, afectando su motivación, energía y capacidad para experimentar placer. ';
  } else if (motivos.includes('Dificultades en relaciones interpersonales')) {
    conclusion += 'Las dificultades en el ámbito interpersonal constituyen una fuente significativa de malestar, afectando su bienestar emocional y calidad de vida. ';
  }

  conclusion += 'Se recomienda iniciar un proceso de intervención psicológica estructurado para abordar la sintomatología presente y desarrollar estrategias de afrontamiento más adaptativas.';

  return conclusion;
}

/**
 * Helper function to get recommendations
 */
function getRecommendations(diagnostico: string): string {
  let baseRecommendations = '1. Iniciar proceso de psicoterapia individual con enfoque cognitivo-conductual.\n';

  if (diagnostico.includes('ansiedad') || diagnostico.includes('Ansiedad')) {
    baseRecommendations += '2. Entrenamiento en técnicas de relajación y manejo de la ansiedad.\n';
    baseRecommendations += '3. Psicoeducación sobre los mecanismos de la ansiedad y su mantenimiento.\n';
    baseRecommendations += '4. Exposición gradual a situaciones evitadas.\n';
  } else if (diagnostico.includes('depresivo') || diagnostico.includes('Depresivo')) {
    baseRecommendations += '2. Activación conductual para incrementar actividades gratificantes.\n';
    baseRecommendations += '3. Reestructuración cognitiva de pensamientos negativos.\n';
    baseRecommendations += '4. Establecimiento de rutinas diarias estructuradas.\n';
  } else if (diagnostico.includes('adaptación') || diagnostico.includes('Adaptación')) {
    baseRecommendations += '2. Desarrollo de estrategias de afrontamiento adaptativas.\n';
    baseRecommendations += '3. Fortalecimiento de la red de apoyo social.\n';
    baseRecommendations += '4. Técnicas de manejo del estrés.\n';
  } else {
    baseRecommendations += '2. Psicoeducación sobre su condición específica.\n';
    baseRecommendations += '3. Desarrollo de estrategias de afrontamiento adaptativas.\n';
    baseRecommendations += '4. Fortalecimiento de recursos personales y sociales.\n';
  }

  baseRecommendations += '5. Evaluación periódica de la evolución y ajuste del plan terapéutico según necesidades.\n';

  if (Math.random() > 0.5) {
    baseRecommendations += '6. Valoración por psiquiatría para evaluación de posible tratamiento farmacológico complementario.';
  }

  return baseRecommendations;
}

/**
 * Helper function to get treatment plan
 */
function getTreatmentPlan(): string {
  return `1. **Fase inicial (1-4 semanas)**
   - Establecimiento de alianza terapéutica
   - Evaluación detallada y formulación del caso
   - Psicoeducación sobre el trastorno y modelo de intervención
   - Introducción a técnicas básicas de manejo de síntomas

2. **Fase intermedia (5-12 semanas)**
   - Intervención específica según sintomatología predominante
   - Abordaje de patrones cognitivos disfuncionales
   - Desarrollo de habilidades de afrontamiento
   - Trabajo con conductas problemáticas específicas

3. **Fase de consolidación (13-20 semanas)**
   - Integración de aprendizajes y habilidades adquiridas
   - Prevención de recaídas
   - Generalización de logros a diferentes contextos
   - Planificación del seguimiento post-tratamiento`;
}

/**
 * Main function to seed reports
 */
async function main() {
  console.log('Starting reports seeding...');

  try {
    // Get all patients from the database
    const patients = await prisma.patient.findMany({
      include: {
        createdBy: true,
      }
    });

    if (patients.length === 0) {
      console.log('No patients found in the database. Please run the patient seed first.');
      return;
    }

    console.log(`Found ${patients.length} patients. Generating reports...`);

    // Get the clinic information
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      console.log('No clinic found in the database. Using default clinic information.');
    }

    // Count existing reports
    const existingReportsCount = await prisma.report.count();
    console.log(`Found ${existingReportsCount} existing reports.`);

    // Generate reports for each patient
    for (const patient of patients) {
      // Create a mock assessment for the patient if it doesn't exist
      let psychEvalAssessment = await prisma.assessment.findFirst({
        where: {
          patientId: patient.id,
          type: 'PSYCHOLOGICAL_EVALUATION'
        }
      });

      if (!psychEvalAssessment) {
        psychEvalAssessment = await prisma.assessment.create({
          data: {
            patientId: patient.id,
            clinicianId: patient.createdById,
            clinicId: clinic ? clinic.id : undefined,
            status: 'IN_PROGRESS',
            type: 'PSYCHOLOGICAL_EVALUATION',
          }
        });
        console.log(`Created new psychological evaluation assessment for patient ${patient.firstName} ${patient.lastName}`);
      }

      // Generate and create psychological evaluation report
      const psychEvalReportText = generatePsychologicalEvaluationReport(patient, patient.createdBy, clinic);

      await prisma.report.create({
        data: {
          assessmentId: psychEvalAssessment.id,
          reportText: psychEvalReportText,
          createdById: patient.createdById,
          version: 1,
          isFinal: true,
          filename: `Informe_Evaluacion_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
      });

      console.log(`Created psychological evaluation report for patient ${patient.firstName} ${patient.lastName}`);

      // Create a therapeutic follow-up assessment
      let followupAssessment = await prisma.assessment.findFirst({
        where: {
          patientId: patient.id,
          type: 'THERAPEUTIC_FOLLOWUP'
        }
      });

      if (!followupAssessment) {
        followupAssessment = await prisma.assessment.create({
          data: {
            patientId: patient.id,
            clinicianId: patient.createdById,
            clinicId: clinic ? clinic.id : undefined,
            status: 'IN_PROGRESS',
            type: 'THERAPEUTIC_FOLLOWUP',
          }
        });
        console.log(`Created new therapeutic follow-up assessment for patient ${patient.firstName} ${patient.lastName}`);
      }

      // Generate and create therapeutic follow-up report
      const followupReportText = generateTherapeuticFollowupReport(patient, patient.createdBy, clinic);

      await prisma.report.create({
        data: {
          assessmentId: followupAssessment.id,
          reportText: followupReportText,
          createdById: patient.createdById,
          version: 1,
          isFinal: true,
          filename: `Informe_Seguimiento_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`,
        }
      });

      console.log(`Created therapeutic follow-up report for patient ${patient.firstName} ${patient.lastName}`);
    }

    console.log('Reports seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding reports:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate a therapeutic follow-up report
 */
function generateTherapeuticFollowupReport(patient: any, clinician: any, clinic: any) {
  const patientName = `${patient.firstName} ${patient.lastName}`;
  const patientAge = calculateAge(patient.dateOfBirth);
  const patientGender = patient.gender === 'MALE' ? 'masculino' : 'femenino';
  const clinicianName = clinician ? `${clinician.firstName} ${clinician.lastName}` : 'Dr. Psicólogo';
  const clinicName = clinic ? clinic.name : 'Clínica HopeAI';
  const currentDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  // Fecha de inicio del tratamiento (entre 3 y 6 meses atrás)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (Math.floor(Math.random() * 4) + 3));
  const formattedStartDate = format(startDate, "d 'de' MMMM 'de' yyyy", { locale: es });

  // Número de sesiones realizadas (entre 8 y 15)
  const numSesiones = Math.floor(Math.random() * 8) + 8;

  // Diagnósticos comunes
  const diagnosticos = [
    'Trastorno de ansiedad generalizada (F41.1)',
    'Episodio depresivo moderado (F32.1)',
    'Trastorno de adaptación (F43.2)',
    'Trastorno mixto ansioso-depresivo (F41.2)',
    'Trastorno de estrés postraumático (F43.1)',
    'Trastorno de la personalidad (F60)',
    'Trastorno por déficit de atención e hiperactividad (F90.0)',
    'Trastorno del espectro autista (F84.0)',
    'Trastorno obsesivo-compulsivo (F42)',
    'Trastorno bipolar (F31)'
  ];

  // Seleccionar un diagnóstico principal aleatorio
  const diagnosticoPrincipal = diagnosticos[Math.floor(Math.random() * diagnosticos.length)];

  // Niveles de mejoría (CGI-I)
  const nivelesImprovement = [
    'Muchísimo mejor',
    'Mucho mejor',
    'Moderadamente mejor',
    'Levemente mejor',
    'Sin cambios',
    'Levemente peor',
    'Mucho peor'
  ];

  // Seleccionar un nivel de mejoría (con mayor probabilidad de mejoría)
  const randomValue = Math.random();
  let nivelMejoria;
  if (randomValue < 0.1) {
    nivelMejoria = nivelesImprovement[0]; // Muchísimo mejor (10%)
  } else if (randomValue < 0.4) {
    nivelMejoria = nivelesImprovement[1]; // Mucho mejor (30%)
  } else if (randomValue < 0.7) {
    nivelMejoria = nivelesImprovement[2]; // Moderadamente mejor (30%)
  } else if (randomValue < 0.85) {
    nivelMejoria = nivelesImprovement[3]; // Levemente mejor (15%)
  } else if (randomValue < 0.95) {
    nivelMejoria = nivelesImprovement[4]; // Sin cambios (10%)
  } else {
    nivelMejoria = nivelesImprovement[5]; // Levemente peor (5%)
  }

  // Generar el informe
  return `# INFORME DE SEGUIMIENTO TERAPÉUTICO

## DATOS DE IDENTIFICACIÓN
**Paciente:** ${patientName}
**Edad:** ${patientAge} años
**Género:** ${patientGender}
**Fecha del informe:** ${currentDate}
**Psicólogo/a:** ${clinicianName}
**Centro:** ${clinicName}

## INFORMACIÓN DEL TRATAMIENTO
**Fecha de inicio:** ${formattedStartDate}
**Número de sesiones realizadas:** ${numSesiones}
**Diagnóstico inicial:** ${diagnosticoPrincipal}
**Enfoque terapéutico:** Terapia Cognitivo-Conductual

## EVOLUCIÓN DEL TRATAMIENTO
${getEvolucionTratamiento(patientName, diagnosticoPrincipal)}

## CAMBIOS EN LA SINTOMATOLOGÍA
${getCambiosSintomatologia(diagnosticoPrincipal, nivelMejoria)}

## NIVEL DE MEJORÍA GLOBAL
Utilizando la Escala de Impresión Clínica Global de Mejoría (CGI-I), se valora que el/la paciente se encuentra **${nivelMejoria}** en comparación con el estado al inicio del tratamiento.

## ADHERENCIA AL TRATAMIENTO
${getAdherenciaTratamiento()}

## AJUSTE DE OBJETIVOS TERAPÉUTICOS
${getAjusteObjetivos(nivelMejoria)}

## OBSERVACIONES DEL TERAPEUTA
${getObservacionesTerapeuta(patientName, nivelMejoria)}

## PLAN DE CONTINUIDAD
${getPlanContinuidad(nivelMejoria)}

---

Este informe es de carácter confidencial y está destinado únicamente al uso profesional. La información contenida debe ser interpretada por profesionales de la salud mental cualificados.

Firmado: ${clinicianName}
Fecha: ${currentDate}`;
}

/**
 * Helper function to get treatment evolution
 */
function getEvolucionTratamiento(patientName: string, diagnostico: string): string {
  let evolucion = `${patientName} ha asistido regularmente a las sesiones programadas, mostrando `;

  if (diagnostico.includes('ansiedad') || diagnostico.includes('Ansiedad')) {
    evolucion += 'un compromiso adecuado con el proceso terapéutico. Durante las primeras sesiones, se trabajó en la psicoeducación sobre los mecanismos de la ansiedad y en el entrenamiento en técnicas de relajación y respiración. Posteriormente, se ha avanzado en la identificación de pensamientos automáticos negativos y en la reestructuración cognitiva de los mismos. También se ha iniciado la exposición gradual a situaciones evitadas, con resultados progresivamente favorables.';
  } else if (diagnostico.includes('depresivo') || diagnostico.includes('Depresivo')) {
    evolucion += 'una participación activa en el proceso terapéutico. Las primeras sesiones se centraron en la activación conductual, estableciendo rutinas diarias estructuradas e incrementando actividades gratificantes. Posteriormente, se ha trabajado en la identificación y modificación de patrones de pensamiento negativos, así como en el desarrollo de habilidades de afrontamiento más adaptativas. Se observa una recuperación gradual del interés y la motivación.';
  } else if (diagnostico.includes('adaptación') || diagnostico.includes('Adaptación')) {
    evolucion += 'una buena disposición hacia el trabajo terapéutico. Inicialmente, se abordó la situación estresante que desencadenó el cuadro, facilitando la expresión emocional y la normalización de las reacciones. Posteriormente, se ha trabajado en el desarrollo de estrategias de afrontamiento más adaptativas y en la reestructuración del significado atribuido a la situación. Se observa una progresiva adaptación a las circunstancias.';
  } else {
    evolucion += 'un compromiso variable con el proceso terapéutico. Se ha trabajado en la identificación de patrones disfuncionales específicos relacionados con su problemática, así como en el desarrollo de estrategias de afrontamiento más adaptativas. A lo largo de las sesiones, se han abordado tanto aspectos cognitivos como conductuales, observándose cambios graduales en su funcionamiento.';
  }

  return evolucion;
}

/**
 * Helper function to get symptom changes
 */
function getCambiosSintomatologia(diagnostico: string, nivelMejoria: string): string {
  let cambios = '';

  if (nivelMejoria.includes('Muchísimo mejor') || nivelMejoria.includes('Mucho mejor')) {
    if (diagnostico.includes('ansiedad') || diagnostico.includes('Ansiedad')) {
      cambios = 'Se observa una reducción significativa de la sintomatología ansiosa. El/la paciente refiere una disminución notable de la preocupación excesiva, la tensión muscular y la inquietud. Las respuestas de ansiedad ante situaciones previamente problemáticas han disminuido en frecuencia e intensidad. Ha desarrollado estrategias efectivas para manejar la ansiedad cuando ésta aparece.';
    } else if (diagnostico.includes('depresivo') || diagnostico.includes('Depresivo')) {
      cambios = 'Se evidencia una mejoría significativa del estado de ánimo. El/la paciente refiere una recuperación del interés y la capacidad para disfrutar de actividades, así como un incremento en los niveles de energía y motivación. Los pensamientos negativos han disminuido considerablemente, y ha mejorado su visión de sí mismo/a, del mundo y del futuro.';
    } else {
      cambios = 'Se observa una mejoría significativa en la sintomatología principal. El/la paciente refiere una reducción notable del malestar subjetivo y una recuperación del funcionamiento en las diferentes áreas de su vida. Ha desarrollado estrategias efectivas para manejar las dificultades cuando éstas aparecen.';
    }
  } else if (nivelMejoria.includes('Moderadamente mejor')) {
    if (diagnostico.includes('ansiedad') || diagnostico.includes('Ansiedad')) {
      cambios = 'Se observa una reducción moderada de la sintomatología ansiosa. El/la paciente refiere una disminución de la preocupación excesiva, aunque aún persisten episodios de ansiedad en situaciones específicas. La tensión muscular y la inquietud han disminuido. Ha comenzado a implementar estrategias para manejar la ansiedad, con resultados variables.';
    } else if (diagnostico.includes('depresivo') || diagnostico.includes('Depresivo')) {
      cambios = 'Se evidencia una mejoría moderada del estado de ánimo. El/la paciente refiere un incremento parcial del interés y la capacidad para disfrutar de actividades, así como cierta recuperación de los niveles de energía. Los pensamientos negativos han disminuido en frecuencia, aunque aún persisten en situaciones específicas.';
    } else {
      cambios = 'Se observa una mejoría moderada en la sintomatología principal. El/la paciente refiere una reducción del malestar subjetivo y una recuperación parcial del funcionamiento en las diferentes áreas de su vida. Ha comenzado a implementar estrategias para manejar las dificultades, con resultados variables.';
    }
  } else if (nivelMejoria.includes('Levemente mejor')) {
    if (diagnostico.includes('ansiedad') || diagnostico.includes('Ansiedad')) {
      cambios = 'Se observa una leve reducción de la sintomatología ansiosa. El/la paciente refiere episodios de menor intensidad, aunque la frecuencia se mantiene similar. La preocupación excesiva, la tensión muscular y la inquietud persisten, pero con momentos de mayor control. Está en proceso de aprendizaje de estrategias para manejar la ansiedad.';
    } else if (diagnostico.includes('depresivo') || diagnostico.includes('Depresivo')) {
      cambios = 'Se evidencia una leve mejoría del estado de ánimo. El/la paciente refiere momentos puntuales de mayor bienestar, aunque persiste la sintomatología depresiva. El interés, la energía y la motivación muestran fluctuaciones, con una tendencia incipiente hacia la mejoría. Los pensamientos negativos continúan presentes con frecuencia.';
    } else {
      cambios = 'Se observa una leve mejoría en la sintomatología principal. El/la paciente refiere momentos puntuales de mayor bienestar, aunque persiste un nivel significativo de malestar. El funcionamiento en las diferentes áreas de su vida muestra una recuperación incipiente. Está en proceso de aprendizaje de estrategias de afrontamiento.';
    }
  } else {
    if (diagnostico.includes('ansiedad') || diagnostico.includes('Ansiedad')) {
      cambios = 'No se observan cambios significativos en la sintomatología ansiosa. El/la paciente mantiene niveles similares de preocupación excesiva, tensión muscular e inquietud. Las respuestas de ansiedad ante situaciones problemáticas se mantienen en frecuencia e intensidad. Se encuentra en una fase inicial del aprendizaje de estrategias para manejar la ansiedad.';
    } else if (diagnostico.includes('depresivo') || diagnostico.includes('Depresivo')) {
      cambios = 'No se evidencian cambios significativos en el estado de ánimo. El/la paciente mantiene la sintomatología depresiva, con persistencia de la falta de interés, la baja energía y la desmotivación. Los pensamientos negativos continúan presentes con frecuencia e intensidad similares.';
    } else {
      cambios = 'No se observan cambios significativos en la sintomatología principal. El/la paciente mantiene un nivel similar de malestar subjetivo y de dificultades en el funcionamiento en las diferentes áreas de su vida. Se encuentra en una fase inicial del aprendizaje de estrategias de afrontamiento.';
    }
  }

  return cambios;
}

/**
 * Helper function to get treatment adherence
 */
function getAdherenciaTratamiento(): string {
  const adherenciaOptions = [
    'El/la paciente ha mostrado una excelente adherencia al tratamiento, asistiendo puntualmente a todas las sesiones programadas y realizando las tareas acordadas de manera consistente. Muestra un alto nivel de compromiso con el proceso terapéutico y una actitud proactiva hacia el cambio.',
    'El/la paciente ha mostrado una buena adherencia al tratamiento, asistiendo a la mayoría de las sesiones programadas y realizando gran parte de las tareas acordadas. Muestra un nivel adecuado de compromiso con el proceso terapéutico.',
    'El/la paciente ha mostrado una adherencia moderada al tratamiento, con algunas inasistencias a las sesiones programadas y un cumplimiento parcial de las tareas acordadas. No obstante, mantiene interés en continuar con el proceso terapéutico.',
    'El/la paciente ha mostrado dificultades en la adherencia al tratamiento, con inasistencias frecuentes a las sesiones programadas y un cumplimiento limitado de las tareas acordadas. Se han explorado los factores que dificultan la adherencia y se han establecido estrategias para mejorarla.'
  ];

  // Seleccionar una opción con mayor probabilidad de buena adherencia
  const randomValue = Math.random();
  if (randomValue < 0.4) {
    return adherenciaOptions[0]; // Excelente (40%)
  } else if (randomValue < 0.8) {
    return adherenciaOptions[1]; // Buena (40%)
  } else if (randomValue < 0.95) {
    return adherenciaOptions[2]; // Moderada (15%)
  } else {
    return adherenciaOptions[3]; // Dificultades (5%)
  }
}

/**
 * Helper function to get treatment goals adjustment
 */
function getAjusteObjetivos(nivelMejoria: string): string {
  if (nivelMejoria.includes('Muchísimo mejor') || nivelMejoria.includes('Mucho mejor')) {
    return 'Considerando la evolución favorable del/la paciente, se plantea una fase de consolidación de los logros alcanzados y prevención de recaídas. Se propone espaciar las sesiones (frecuencia quincenal o mensual) y trabajar en la generalización de las estrategias aprendidas a diferentes contextos. Se contempla la posibilidad de finalizar el tratamiento en las próximas 8-12 semanas, tras evaluar la estabilidad de los cambios.';
  } else if (nivelMejoria.includes('Moderadamente mejor')) {
    return 'Considerando la evolución favorable pero aún parcial del/la paciente, se mantienen los objetivos terapéuticos iniciales, con énfasis en las áreas que muestran menor mejoría. Se propone continuar con la frecuencia actual de sesiones y profundizar en las técnicas que han mostrado mayor efectividad. Se añade como objetivo el desarrollo de estrategias específicas para las situaciones que continúan generando dificultades.';
  } else if (nivelMejoria.includes('Levemente mejor')) {
    return 'Considerando la evolución limitada del/la paciente, se realiza un ajuste en los objetivos terapéuticos, priorizando la reducción de la sintomatología más incapacitante. Se propone mantener la frecuencia actual de sesiones y revisar las técnicas utilizadas, incorporando nuevas estrategias que puedan resultar más efectivas. Se plantea un abordaje más gradual, con metas a corto plazo más accesibles.';
  } else {
    return 'Considerando la ausencia de cambios significativos, se realiza una reformulación de los objetivos terapéuticos y del plan de intervención. Se propone una evaluación más detallada de los factores que pueden estar limitando el progreso, incluyendo posibles variables contextuales, motivacionales o relacionadas con el enfoque terapéutico. Se plantea la posibilidad de incorporar nuevas técnicas o de considerar un enfoque terapéutico complementario o alternativo.';
  }
}

/**
 * Helper function to get therapist observations
 */
function getObservacionesTerapeuta(patientName: string, nivelMejoria: string): string {
  if (nivelMejoria.includes('Muchísimo mejor') || nivelMejoria.includes('Mucho mejor')) {
    return `${patientName} ha mostrado una excelente capacidad para integrar los aprendizajes del proceso terapéutico. Se observa un desarrollo significativo de la conciencia sobre sus patrones cognitivos, emocionales y conductuales, así como de estrategias efectivas para modificarlos. Su actitud proactiva y compromiso con el cambio han sido factores determinantes en los resultados obtenidos. Presenta recursos personales sólidos que favorecen el mantenimiento de los logros alcanzados.`;
  } else if (nivelMejoria.includes('Moderadamente mejor')) {
    return `${patientName} ha mostrado una buena disposición hacia el proceso terapéutico, con avances significativos en la comprensión de sus dificultades. Se observa un desarrollo progresivo de estrategias de afrontamiento más adaptativas, aunque aún requiere consolidar su aplicación en situaciones de mayor complejidad. Presenta recursos personales adecuados que, con el apoyo terapéutico continuado, permitirán seguir avanzando hacia los objetivos planteados.`;
  } else if (nivelMejoria.includes('Levemente mejor')) {
    return `${patientName} ha mostrado una disposición variable hacia el proceso terapéutico, con avances modestos en la comprensión de sus dificultades. Se observan dificultades en la implementación consistente de las estrategias trabajadas, posiblemente relacionadas con factores contextuales o con la intensidad de la sintomatología. Se identifica la necesidad de fortalecer la motivación para el cambio y de adaptar las intervenciones a sus características específicas.`;
  } else {
    return `${patientName} ha presentado dificultades significativas en el proceso terapéutico, con limitados avances en la comprensión e intervención sobre sus dificultades. Se observan obstáculos importantes para la implementación de las estrategias trabajadas, que podrían estar relacionados con la complejidad del cuadro, factores contextuales no abordados o aspectos de la relación terapéutica. Se considera necesario reevaluar el enfoque terapéutico y posiblemente considerar opciones complementarias de tratamiento.`;
  }
}

/**
 * Helper function to get continuity plan
 */
function getPlanContinuidad(nivelMejoria: string): string {
  if (nivelMejoria.includes('Muchísimo mejor') || nivelMejoria.includes('Mucho mejor')) {
    return '1. Espaciar las sesiones a frecuencia quincenal durante el próximo mes, y posteriormente mensual.\n2. Trabajar en la prevención de recaídas, identificando señales de alerta y estrategias de afrontamiento.\n3. Consolidar la generalización de los aprendizajes a diferentes contextos.\n4. Evaluar la finalización del tratamiento en 2-3 meses, con seguimiento posterior a los 6 meses.';
  } else if (nivelMejoria.includes('Moderadamente mejor')) {
    return '1. Mantener la frecuencia semanal de sesiones durante el próximo mes, valorando posteriormente espaciarlas.\n2. Profundizar en las técnicas que han mostrado mayor efectividad.\n3. Desarrollar estrategias específicas para las situaciones que continúan generando dificultades.\n4. Reevaluar el progreso en 6-8 semanas para ajustar el plan terapéutico.';
  } else if (nivelMejoria.includes('Levemente mejor')) {
    return '1. Mantener la frecuencia semanal de sesiones.\n2. Revisar y ajustar las técnicas utilizadas, incorporando nuevas estrategias.\n3. Establecer objetivos a corto plazo más accesibles.\n4. Considerar la posibilidad de una evaluación psiquiátrica complementaria.\n5. Reevaluar el progreso en 4-6 semanas.';
  } else {
    return '1. Mantener la frecuencia semanal de sesiones.\n2. Realizar una evaluación más detallada de los factores que limitan el progreso.\n3. Reformular los objetivos terapéuticos y el plan de intervención.\n4. Considerar la incorporación de un enfoque terapéutico complementario o alternativo.\n5. Valorar la derivación para evaluación psiquiátrica.\n6. Reevaluar el progreso en 4 semanas.';
  }
}

// Execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
