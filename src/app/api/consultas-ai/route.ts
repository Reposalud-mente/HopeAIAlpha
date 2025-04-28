import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { google } from '@ai-sdk/google';
import { streamText, type Message } from 'ai';

// System prompt for HopeAI's clinical psychology assistant
const CLINICAL_ASSISTANT_SYSTEM_PROMPT = `
Eres un asistente experto en psicología clínica de HopeAI, diseñado específicamente para apoyar a profesionales de la salud mental.

# Personalidad y Valores de HopeAI

Representas la marca HopeAI, cuya misión es "Psicología clínica simplificada - Herramientas inteligentes que te ayudan a centrarte en lo que realmente importa: tus pacientes."

Tus principios fundamentales son:
1. Reducir la carga administrativa para los profesionales de la salud mental
2. Mejorar los resultados clínicos mediante herramientas inteligentes
3. Simplificar la psicología clínica para que los profesionales puedan centrarse en sus pacientes

Tu tono es profesional, empático, y basado en evidencia científica. Eres conciso pero completo, evitando jerga innecesaria mientras mantienes la precisión clínica.

# Áreas de Experiencia

Tienes conocimiento profundo en:
- Evaluación y diagnóstico psicológico (DSM-5-TR, CIE-11)
- Terapias basadas en evidencia (TCC, ACT, DBT, EMDR, etc.)
- Instrumentos de evaluación psicológica estandarizados
- Redacción de informes clínicos y documentación
- Planificación de tratamientos
- Seguimiento terapéutico y evaluación de resultados
- Consideraciones éticas y mejores prácticas en psicología clínica

# Enfoque de Asistencia

Cuando interactúas con profesionales de la salud mental:
1. Prioriza información basada en evidencia científica actualizada
2. Ofrece respuestas prácticas y aplicables al contexto clínico
3. Reconoce los límites de tu conocimiento y evita dar consejos fuera de tu ámbito
4. Respeta la autonomía profesional del psicólogo
5. Mantén la confidencialidad y privacidad de la información compartida

Recuerda que eres una herramienta de apoyo, no un reemplazo del juicio clínico profesional.
`;

// POST /api/consultas-ai - Process a chat message and return AI response
export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body
    const { message, consultationId } = await request.json();

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    let consultation;

    // If consultationId is provided, retrieve the existing consultation
    if (consultationId) {
      consultation = await prisma.aIConsultation.findUnique({
        where: { id: consultationId }
      });

      if (!consultation) {
        return NextResponse.json(
          { error: 'Consultation not found' },
          { status: 404 }
        );
      }
    } else {
      // Create a new consultation
      consultation = await prisma.aIConsultation.create({
        data: {
          userId: session.user.id,
          messages: [] // Start with empty messages array
        }
      });
    }

    // Get the current messages
    const currentMessages = consultation.messages as any[] || [];

    // Add the user message
    currentMessages.push({
      id: currentMessages.length + 1,
      content: message,
      sender: 'user',
      type: 'text',
      timestamp: new Date().toISOString()
    });

    // Variable to store the AI response
    let aiResponseContent = '';

    try {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      console.log('Calling Google AI with API key:', apiKey ? 'API key exists' : 'API key missing');

      if (apiKey) {
        // Call the real Google AI API
        console.log('[ConsultasAI] About to call Google AI');
        const model = google('gemini-2.5-pro-exp-03-25');
        // Use SDK-native abortSignal for timeout (60s)
        const TIMEOUT_MS = 60000;
        console.log('[ConsultasAI] Using SDK-native AbortSignal for timeout');
        const geminiMessages: Omit<Message, 'id'>[] = currentMessages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: String(m.content)
        }));
        const result = await streamText({
          model,
          system: CLINICAL_ASSISTANT_SYSTEM_PROMPT,
          messages: geminiMessages,
          abortSignal: AbortSignal.timeout(TIMEOUT_MS),
          onError({ error }) {
            console.error('[ConsultasAI] AI SDK error:', error);
          }
        });
        console.log('[ConsultasAI] Using HopeAI clinical assistant system prompt');
        console.log('[ConsultasAI] streamText call completed, reading textStream...');
        const textParts: string[] = [];
        for await (const part of result.textStream) {
          textParts.push(part);
        }
        aiResponseContent = textParts.join('');
        console.log('[ConsultasAI] Received AI response:', aiResponseContent);
        console.log('Using real AI response');
      } else {
        // Use mock response if API key is missing
        const mockResponse = 'Esta es una respuesta simulada del asistente AI. En un entorno de producción, esto sería reemplazado por la respuesta real del modelo de Google AI.';
        aiResponseContent = mockResponse;
        console.log('Using mock AI response for testing');
      }
    } catch (aiError) {
      console.error('Error generating AI response:', aiError);
      throw aiError;
    }

    currentMessages.push({
      id: currentMessages.length + 1,
      content: aiResponseContent,
      sender: 'ai',
      type: 'text',
      timestamp: new Date().toISOString()
    });

    // Update the consultation with the new messages
    const updatedConsultation = await prisma.aIConsultation.update({
      where: { id: consultation.id },
      data: {
        messages: currentMessages,
        updatedAt: new Date()
      }
    });

    // Return the updated consultation
    return NextResponse.json({
      consultationId: updatedConsultation.id,
      messages: currentMessages
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
