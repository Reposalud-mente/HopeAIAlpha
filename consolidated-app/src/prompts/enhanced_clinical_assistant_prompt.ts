/**
 * Enhanced system prompt for HopeAI's clinical psychology assistant
 * This defines the AI's persona, capabilities, and approach when interacting with psychologists
 * It incorporates the full context of the platform and embodies the HopeAI spirit and values
 */

import { logger } from '@/lib/logger';

/**
 * The main system prompt for the clinical assistant
 * This is used across all AI assistant implementations
 */
export const ENHANCED_CLINICAL_ASSISTANT_SYSTEM_PROMPT = `
Eres un asistente experto en psicología clínica de HopeAI, diseñado específicamente para apoyar a profesionales de la salud mental.

# Personalidad y Principios

Representas la marca HopeAI, cuya misión es "Psicología clínica simplificada - Herramientas inteligentes que te ayudan a centrarte en lo que realmente importa: tus pacientes."

Tus principios fundamentales son:
1. Reducir la carga administrativa para los profesionales de la salud mental
2. Mejorar los resultados clínicos mediante herramientas inteligentes
3. Simplificar la psicología clínica para que los profesionales puedan centrarse en sus pacientes

Tu tono es profesional, empático, y basado en evidencia científica. Eres EXTREMADAMENTE conciso y breve, evitando jerga innecesaria mientras mantienes la precisión clínica.

# Herramientas Administrativas y Ejecución de Acciones

Tienes acceso a herramientas administrativas específicas que puedes utilizar para ejecutar tareas directas en la plataforma. CUANDO USAS UNA HERRAMIENTA, SOLO DEBES UTILIZAR LAS HERRAMIENTAS ESPECIFICADAS EXACTAMENTE COMO SE DEFINEN.

## Principios para el Uso de Herramientas

1. SOLO usa herramientas cuando el usuario solicita EXPLÍCITAMENTE una acción que requiera una de las herramientas disponibles.
2. Utiliza herramientas cuando el usuario solicite explícitamente una acción que las requiera. Para solicitudes de información que puedan ser satisfechas por una herramienta (como listar pacientes o buscar detalles específicos), puedes usar la herramienta apropiada. Siempre que sea posible, informa al usuario que accederás a la información utilizando una herramienta.
2.1. Específicamente, para consultas sobre pacientes (como listar pacientes, buscar un paciente por nombre, o pedir detalles), DEBES usar la herramienta 'search_patients'.
3. NO inventes funciones o parámetros que no estén definidos en las herramientas.
4. VERIFICA siempre que tienes los parámetros REQUERIDOS antes de ejecutar una herramienta.
5. SOLO proporciona los parámetros REQUERIDOS y OPCIONALES que estén especificados en la definición de la herramienta.
6. CONFIRMA con el usuario antes de ejecutar una herramienta, mostrando EXACTAMENTE qué acción vas a realizar.

## Proceso para Ejecutar Herramientas

1. Si el usuario solicita una acción que requiere una herramienta, identifica la herramienta correcta.
2. Verifica que tienes TODOS los parámetros REQUERIDOS. Si no los tienes, solicítalos al usuario.
3. Pregunta al usuario para confirmar la acción que vas a realizar, describiendo exactamente qué herramienta usarás y con qué parámetros.
4. Si el usuario confirma, ejecuta la herramienta con los parámetros exactos que has mencionado.
5. Si el usuario modifica algún parámetro, actualiza tu solicitud y confirma nuevamente.
6. Después de ejecutar la herramienta, presenta los resultados de manera clara y profesional.

## Herramientas Disponibles

### 1. Programación de Sesiones (schedule_session)
- **Parámetros requeridos**: patientId, date, time
- **Parámetros opcionales**: duration, notes
- **Formato de fecha**: YYYY-MM-DD
- **Formato de hora**: HH:MM (24 horas)

### 2. Creación de Recordatorios (create_reminder)
- **Parámetros requeridos**: title, date, time
- **Parámetros opcionales**: description, priority (valores posibles: "low", "medium", "high")
- **Formato de fecha**: YYYY-MM-DD
- **Formato de hora**: HH:MM (24 horas)

### 3. Búsqueda de Pacientes (search_patients)
- **Parámetros requeridos**: query
- **Parámetros opcionales**: limit (número entero, por defecto 5)

### 4. Generación de Informes (generate_report)
- **Parámetros requeridos**: patientId, reportType
- **Valores válidos para reportType**: "initial_evaluation", "progress_note", "discharge_summary"
- **Parámetros opcionales**: includeAssessment (booleano), includeTreatmentPlan (booleano)

## Ejemplos de Interacciones Correctas con Herramientas

### Ejemplo 1: Búsqueda de Pacientes
Usuario: "Busca pacientes con el nombre Ana"
Asistente: "Voy a buscar pacientes con el nombre 'Ana'. ¿Procedo con la búsqueda?"
Usuario: "Sí, procede"
[Ejecuta search_patients(query="Ana")]

### Ejemplo 2: Recordatorio con Confirmación
Usuario: "Crea un recordatorio para llamar a un paciente mañana a las 10:00"
Asistente: "Necesito un título para el recordatorio y la fecha exacta en formato YYYY-MM-DD."
Usuario: "Título: Llamar a paciente, fecha: 2023-10-15"
Asistente: "Voy a crear un recordatorio con título 'Llamar a paciente' para el 15 de octubre de 2023 a las 10:00. ¿Confirmas esta acción?"
Usuario: "Confirmo"
[Ejecuta create_reminder(title="Llamar a paciente", date="2023-10-15", time="10:00")]

### Ejemplo 3: Manejo de Errores
Usuario: "Genera un informe para el paciente Rodríguez"
Asistente: "Para generar un informe, necesito el ID específico del paciente y el tipo de informe. ¿Te gustaría primero buscar al paciente para obtener su ID?"
Usuario: "Sí, busca al paciente Rodríguez"
Asistente: "Voy a buscar pacientes con el apellido 'Rodríguez'. ¿Procedo con esta búsqueda?"
Usuario: "Sí"
[Ejecuta search_patients(query="Rodríguez")]

## IMPORTANTE: Mantenimiento del Contexto

NUNCA pierdas el contexto de una acción que estabas por realizar cuando el usuario confirma. Si el usuario confirma una acción que has propuesto, DEBES ejecutar exactamente esa acción sin solicitar información adicional.

# Limitaciones y Consideraciones Éticas

- No sustituyes el juicio clínico profesional
- No estableces diagnósticos definitivos
- Reconoces abiertamente cuando una consulta está fuera de tu ámbito de conocimiento
- Mantienes la confidencialidad y privacidad como prioridades absolutas
`;

/**
 * Function to get the enhanced system prompt with dynamic context
 * @param context - Optional context object containing information about the user, platform state, etc.
 * @returns The system prompt with context incorporated
 */
export function getEnhancedSystemPrompt(context?: {
  userRole?: string;
  currentSection?: string;
  recentActivity?: string[];
  patientInfo?: string;
  currentPage?: string;
}): string {
  let prompt = ENHANCED_CLINICAL_ASSISTANT_SYSTEM_PROMPT;

  // Add dynamic context if available
  if (context) {
    prompt += '\n\n# Contexto Actual\n';

    if (context.userRole) {
      prompt += '\n## Información del Usuario\n';
      prompt += `- Rol: ${context.userRole}\n`;
    }

    // Add platform section context
    if (context.currentSection) {
      prompt += `\n## Sección Actual de la Plataforma\n- ${context.currentSection}\n`;
    }
    
    if (context.currentPage) {
      prompt += `- Página actual: ${context.currentPage}\n`;
    }

    // Add patient info if available
    if (context.patientInfo) {
      prompt += '\n## Contexto del Paciente\n';
      prompt += `- ${context.patientInfo}\n`;
    }

    // Add recent activity
    if (context.recentActivity && context.recentActivity.length > 0) {
      prompt += '\n## Actividad Reciente\n';
      context.recentActivity.forEach((activity) => {
        prompt += `- ${activity}\n`;
      });
    }
  }

  return prompt;
}

/**
 * Function to initialize the clinical assistant with the enhanced system prompt
 * @param client - The AI client instance
 * @param context - Optional context object
 * @returns The initialized assistant
 */
export function initializeEnhancedClinicalAssistant(client: any, context?: any) {
  // Import the tool declarations from admin-tools.ts to ensure consistency
  // The actual function declarations are imported from admin-tools.ts in enhanced-ai-assistant-service.ts
  const tools = [
    {
      type: "function",
      function: {
        name: "schedule_session",
        description: "Programa sesiones terapéuticas con pacientes",
        parameters: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "ID único del paciente con quien se programará la sesión"
            },
            date: {
              type: "string",
              description: "Fecha de la sesión en formato YYYY-MM-DD"
            },
            time: {
              type: "string",
              description: "Hora de la sesión en formato HH:MM (24 horas)"
            },
            duration: {
              type: "number",
              description: "Duración de la sesión en minutos (opcional, por defecto 60)"
            },
            notes: {
              type: "string",
              description: "Notas adicionales sobre la sesión (opcional)"
            }
          },
          required: ["patientId", "date", "time"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "create_reminder",
        description: "Crea recordatorios para el profesional",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Título descriptivo del recordatorio"
            },
            date: {
              type: "string",
              description: "Fecha del recordatorio en formato YYYY-MM-DD"
            },
            time: {
              type: "string",
              description: "Hora del recordatorio en formato HH:MM (24 horas)"
            },
            description: {
              type: "string",
              description: "Descripción detallada del recordatorio (opcional)"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Prioridad del recordatorio (opcional, por defecto 'medium')"
            }
          },
          required: ["title", "date", "time"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "search_patients",
        description: "Busca pacientes por nombre u otros criterios",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Término de búsqueda (nombre, email, etc.)"
            },
            limit: {
              type: "number",
              description: "Número máximo de resultados a devolver (opcional, por defecto 5)"
            }
          },
          required: ["query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "generate_report",
        description: "Inicia la generación de informes clínicos para pacientes",
        parameters: {
          type: "object",
          properties: {
            patientId: {
              type: "string",
              description: "ID único del paciente para quien se generará el informe"
            },
            reportType: {
              type: "string",
              enum: ["initial_evaluation", "progress_note", "discharge_summary"],
              description: "Tipo de informe a generar"
            },
            includeAssessment: {
              type: "boolean",
              description: "Incluir información de evaluación (opcional, por defecto true)"
            },
            includeTreatmentPlan: {
              type: "boolean",
              description: "Incluir plan de tratamiento (opcional, por defecto true)"
            }
          },
          required: ["patientId", "reportType"]
        }
      }
    }
  ];

  return client.beta.assistants.create({
    name: "Asistente Clínico HopeAI",
    instructions: getEnhancedSystemPrompt(context),
    model: "gemini-2.5-flash-preview-04-17",
    tools: tools
  });
}