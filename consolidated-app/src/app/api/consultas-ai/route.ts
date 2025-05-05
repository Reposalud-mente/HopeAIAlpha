import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';
import { google } from '@ai-sdk/google';
import { streamText, type Message } from 'ai';
import { getEnhancedSystemPrompt } from '@/prompts/enhanced_clinical_assistant_prompt';
import { getAIContext } from '@/lib/ai-assistant/context-gatherer';
import { getEnhancedAIAssistantService } from '@/lib/ai-assistant/enhanced-ai-assistant-service';

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
    const { message, consultationId, currentSection, currentPage, patientId } = await request.json();

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
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      console.log('Calling Google AI with API key:', apiKey ? 'API key exists' : 'API key missing');

      if (apiKey) {
        // Get platform context
        console.log('[ConsultasAI] Gathering platform context...');
        const context = await getAIContext(currentSection, currentPage, patientId);
        
        // Convert messages to the format expected by the AI service
        const formattedMessages = currentMessages.map((m: any) => ({
          id: String(m.id),
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: String(m.content)
        }));
        
        // Remove the last message (user message) as we'll send it separately
        const conversationHistory = formattedMessages.slice(0, -1);
        const userMessage = message;
        
        console.log('[ConsultasAI] About to call Enhanced AI Assistant Service');
        
        // Use the enhanced AI assistant service
        const enhancedAIService = getEnhancedAIAssistantService();
        
        // Use SDK-native abortSignal for timeout (60s)
        const TIMEOUT_MS = 60000;
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS);
        
        try {
          // Use streaming for better user experience
          const textParts: string[] = [];
          
          await enhancedAIService.streamMessage(
            userMessage,
            conversationHistory,
            (chunk) => {
              textParts.push(chunk);
            },
            { currentSection, currentPage, patientId }
          );
          
          aiResponseContent = textParts.join('');
          console.log('[ConsultasAI] Received AI response');
          console.log('Using enhanced AI assistant service');
        } catch (streamError) {
          console.error('[ConsultasAI] Error streaming response:', streamError);
          
          // Fallback to non-streaming response
          console.log('[ConsultasAI] Falling back to non-streaming response');
          aiResponseContent = await enhancedAIService.sendMessage(
            userMessage,
            conversationHistory,
            { currentSection, currentPage, patientId }
          );
        } finally {
          clearTimeout(timeoutId);
        }
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
