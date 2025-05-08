/**
 * Enhanced AI Assistant Service for the Floating Assistant
 * Handles communication with the Gemini API and provides a high-level interface
 * for sending messages, streaming responses, and handling function calls
 */

import { v4 as uuidv4 } from 'uuid';
import { GeminiClient } from './gemini-client';
import { createConfig } from '../config';
import {
  AssistantConfig,
  AssistantResponse,
  Message,
  FunctionCall,
  ToolDeclaration,
  PlatformContext
} from '../types';

// Cache item type
interface CacheItem {
  question: string;
  response: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Enhanced AI Assistant Service
 */
export class AssistantService {
  private geminiClient: GeminiClient;
  private config: AssistantConfig;
  private cache: Map<string, CacheItem>;
  private tools: ToolDeclaration[];

  /**
   * Constructor for the AssistantService
   * @param config Configuration options
   * @param tools Tool declarations for function calling
   */
  constructor(config?: Partial<AssistantConfig>, tools: ToolDeclaration[] = []) {
    this.config = createConfig(config || {});

    // Ensure function calling is enabled by default
    this.config.enableFunctionCalling = true;

    // Initialize the Gemini client
    this.geminiClient = new GeminiClient(this.config);

    // Initialize the cache
    this.cache = new Map<string, CacheItem>();

    // Store the tools
    this.tools = tools;

    // Log the tools to ensure they're being registered
    console.log('Assistant Service initialized with tools:',
      this.tools.map(tool => tool.name));

    // Log detailed tool information for debugging
    if (this.tools.length > 0) {
      console.log('Tool details:');
      this.tools.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
        console.log(`  Required parameters: ${tool.parameters.required.join(', ')}`);
      });
    } else {
      console.warn('No tools provided to AssistantService. Function calling will not work properly.');
    }
  }

  /**
   * Send a message to the assistant
   * @param message The message to send
   * @param conversationHistory Conversation history
   * @param context Platform context
   * @param enableFunctionCalling Whether to enable function calling
   * @returns The assistant's response
   */
  async sendMessage(
    message: string,
    conversationHistory: Message[] = [],
    context?: PlatformContext,
    enableFunctionCalling: boolean = true
  ): Promise<AssistantResponse> {
    try {
      // Log the incoming request for debugging
      console.log('Sending message to assistant:', {
        message,
        historyLength: conversationHistory.length,
        context: context ? {
          user: context.user?.name,
          section: context.application?.currentSection,
          page: context.application?.currentPage,
          patient: context.data?.patientName
        } : 'No context',
        enableFunctionCalling
      });

      // Generate a cache key based on the message and context
      const cacheKey = this.generateCacheKey(message, context);

      // Check if we have a cached response
      if (!enableFunctionCalling) {
        const cachedResponse = this.getCachedResponse(cacheKey);
        if (cachedResponse) {
          console.log('Using cached response');
          return { text: cachedResponse, status: 'success' };
        }
      }

      // Generate system prompt based on context
      const systemPrompt = this.generateSystemPrompt(context);

      // Optimize conversation history to stay within token limits
      const optimizedHistory = this.optimizeConversationHistory(conversationHistory);

      // Determine which tools to use
      const toolsToUse = enableFunctionCalling ? this.tools : [];

      // Log the tools being used
      if (enableFunctionCalling) {
        console.log(`Using ${toolsToUse.length} tools for this request:`,
          toolsToUse.map(tool => tool.name));
      } else {
        console.log('Function calling is disabled for this request');
      }

      // Generate content
      const result = await this.geminiClient.generateContent(
        message,
        systemPrompt,
        optimizedHistory,
        toolsToUse
      );

      // Log the raw response for debugging
      console.log('Raw response from Gemini API:', JSON.stringify(result, null, 2));

      // Extract text from the response
      let responseText = '';
      try {
        // Access the response based on the Gemini API structure
        // The structure might vary depending on the API version
        if (result.candidates && result.candidates[0]?.content?.parts) {
          // Extract text from candidates
          for (const part of result.candidates[0].content.parts) {
            if (part.text) {
              responseText += part.text;
            }
          }
        } else if ((result as any).response && typeof (result as any).response.text === 'function') {
          // Use the helper method if available (for newer API versions)
          responseText = (result as any).response.text();
        }
      } catch (error) {
        console.error('Error extracting text from response:', error);
      }

      const limitedResponseText = this.limitResponseLength(responseText);

      // Cache the response if function calling is not enabled
      if (!enableFunctionCalling) {
        this.cacheResponse(cacheKey, limitedResponseText, context);
      }

      // Check for function calls
      let functionCalls: FunctionCall[] = [];
      try {
        // First try using the functionCalls method if available (for newer API versions)
        if ((result as any).response && typeof (result as any).response.functionCalls === 'function') {
          try {
            const calls = (result as any).response.functionCalls();
            if (calls && calls.length > 0) {
              console.log('Function calls detected:', calls.length);
              for (const call of calls) {
                console.log('Function call details:', {
                  name: call.name,
                  args: call.args || {}
                });

                functionCalls.push({
                  name: call.name,
                  args: call.args || {},
                  id: uuidv4()
                });
              }
            }
          } catch (e) {
            console.error('Error calling functionCalls():', e);
          }
        }

        // If no function calls found, check in the candidates structure
        if (functionCalls.length === 0 && result.candidates && result.candidates[0]?.content?.parts) {
          // Extract function calls from candidates
          for (const part of result.candidates[0].content.parts) {
            if (part.functionCall && part.functionCall.name) {
              functionCalls.push({
                name: part.functionCall.name,
                args: part.functionCall.args || {},
                id: uuidv4()
              });
            }
          }
        }

        // If still no function calls found, check for JSON in the text response
        if (functionCalls.length === 0 && responseText) {
          // Look for JSON function call pattern
          const functionCallMatch = responseText.match(/({[\s\S]*?"function_call"[\s\S]*?})/);
          if (functionCallMatch && functionCallMatch[1]) {
            try {
              // Try to extract the JSON object
              let jsonStr = functionCallMatch[1];

              // Clean up the string to ensure it's valid JSON
              // Remove any markdown code block markers
              jsonStr = jsonStr.replace(/```(json|)\s*/g, '').replace(/\s*```/g, '');

              // Parse the JSON
              const functionCallData = JSON.parse(jsonStr);

              if (functionCallData.function_call && functionCallData.function_call.name) {
                console.log('Found function call in text response:', functionCallData);

                // Get arguments - handle both "arguments" and "args" formats
                const args = functionCallData.function_call.arguments ||
                            functionCallData.function_call.args || {};

                // Add to function calls
                functionCalls.push({
                  name: functionCallData.function_call.name,
                  args: args,
                  id: uuidv4()
                });

                // Replace the function call in the response text with a user-friendly message
                const functionDisplayName = functionCallData.function_call.name
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (char: string) => char.toUpperCase());

                const replacementText = `<div class="tool-execution-indicator">
                  <span class="tool-execution-icon">⚙️</span>
                  <span class="tool-execution-text">Ejecutando: ${functionDisplayName}...</span>
                </div>`;

                responseText = responseText.replace(functionCallMatch[0], replacementText);
              }
            } catch (e) {
              console.error('Error parsing function call JSON in text response:', e);
            }
          }
        }

        // Log found function calls
        if (functionCalls.length > 0) {
          console.log('Function calls found in response:', functionCalls);
        } else {
          console.log('No function calls found in response');
        }
      } catch (error) {
        console.error('Error extracting function calls:', error);
        // No function calls in the response
      }

      return {
        text: responseText, // Use the potentially modified responseText with function calls replaced
        functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
        status: 'success'
      };
    } catch (error) {
      console.error('Error sending message:', error);

      // Try again without function calling as a fallback
      if (enableFunctionCalling) {
        try {
          console.log('Trying fallback without function calling');
          return await this.sendMessage(message, conversationHistory, context, false);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          return {
            text: 'Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde.',
            status: 'error',
            error: {
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'ASSISTANT_ERROR'
            }
          };
        }
      }

      return {
        text: 'Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde.',
        status: 'error',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'ASSISTANT_ERROR'
        }
      };
    }
  }

  /**
   * Stream a message to the assistant
   * @param message The message to send
   * @param conversationHistory Conversation history
   * @param onChunk Callback for each chunk of the response
   * @param context Platform context
   * @param onFunctionCall Callback for function calls
   * @param enableFunctionCalling Whether to enable function calling
   */
  async streamMessage(
    message: string,
    conversationHistory: Message[] = [],
    onChunk: (chunk: string) => void,
    context?: PlatformContext,
    onFunctionCall?: (functionCall: FunctionCall) => void,
    enableFunctionCalling: boolean = true
  ): Promise<void> {
    try {
      // Generate system prompt based on context
      const systemPrompt = this.generateSystemPrompt(context);

      // Optimize conversation history to stay within token limits
      const optimizedHistory = this.optimizeConversationHistory(conversationHistory);

      // Determine which tools to use
      const toolsToUse = enableFunctionCalling ? this.tools : [];

      // Generate content stream
      const result = await this.geminiClient.generateContentStream(
        message,
        systemPrompt,
        optimizedHistory,
        toolsToUse
      );

      // Process the stream
      let accumulatedText = '';
      try {
        // The result from generateContentStream is an AsyncGenerator
        for await (const chunk of result) {
          // Extract text from the chunk - in Google GenAI API, we need to handle different formats
          let chunkText = '';

          try {
            // Access the chunk as any to avoid TypeScript errors
            const chunkAny = chunk as any;

            // Try to extract text from candidates (most common format in Google GenAI)
            if (chunkAny && chunkAny.candidates && chunkAny.candidates.length > 0 &&
                chunkAny.candidates[0].content && chunkAny.candidates[0].content.parts) {
              // Extract text from parts
              chunkText = chunkAny.candidates[0].content.parts
                .map((part: any) => part.text || '')
                .join('');
            }
            // If that fails, try to access a text property or method
            else if (chunkAny && chunkAny.text) {
              if (typeof chunkAny.text === 'function') {
                try {
                  chunkText = chunkAny.text();
                } catch {
                  // If calling as a function fails, try accessing as a property
                  chunkText = String(chunkAny.text);
                }
              } else if (typeof chunkAny.text === 'string') {
                chunkText = chunkAny.text;
              }
            }

            // Check if the text contains a function call in JSON format
            if (chunkText) {
              // Look for JSON function call pattern - more flexible regex to catch various formats
              const functionCallMatch = chunkText.match(/({[\s\S]*?"function_call"[\s\S]*?})/);
              if (functionCallMatch && functionCallMatch[1]) {
                try {
                  // Try to extract the JSON object
                  let jsonStr = functionCallMatch[1];

                  // Clean up the string to ensure it's valid JSON
                  // Remove any markdown code block markers
                  jsonStr = jsonStr.replace(/```(json|)\s*/g, '').replace(/\s*```/g, '');

                  // Parse the JSON
                  const functionCallData = JSON.parse(jsonStr);

                  if (functionCallData.function_call &&
                      functionCallData.function_call.name) {

                    console.log('Found function call in text:', functionCallData);

                    // Get arguments - handle both "arguments" and "args" formats
                    const args = functionCallData.function_call.arguments ||
                                functionCallData.function_call.args || {};

                    // Create a more user-friendly message
                    const functionDisplayName = functionCallData.function_call.name
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (char: string) => char.toUpperCase());

                    const replacementText = `<div class="tool-execution-indicator">
                      <span class="tool-execution-icon">⚙️</span>
                      <span class="tool-execution-text">Ejecutando: ${functionDisplayName}...</span>
                    </div>`;

                    // Replace the function call in the text with the user-friendly message
                    chunkText = chunkText.replace(functionCallMatch[0], replacementText);

                    // Call the function handler
                    if (onFunctionCall) {
                      onFunctionCall({
                        name: functionCallData.function_call.name,
                        args: args,
                        id: uuidv4()
                      });
                    }
                  }
                } catch (e) {
                  console.error('Error parsing function call JSON:', e);
                  console.error('JSON string attempted to parse:', functionCallMatch[1]);
                }
              }

              // Also check for plain JSON object pattern without code blocks
              if (!functionCallMatch) {
                const plainJsonMatch = chunkText.match(/\{\s*"function_call"\s*:/);
                if (plainJsonMatch) {
                  try {
                    // Try to extract a complete JSON object
                    let startIdx = chunkText.indexOf('{');
                    let depth = 0;
                    let endIdx = -1;

                    for (let i = startIdx; i < chunkText.length; i++) {
                      if (chunkText[i] === '{') depth++;
                      if (chunkText[i] === '}') {
                        depth--;
                        if (depth === 0) {
                          endIdx = i + 1;
                          break;
                        }
                      }
                    }

                    if (endIdx > startIdx) {
                      const jsonStr = chunkText.substring(startIdx, endIdx);
                      const functionCallData = JSON.parse(jsonStr);

                      if (functionCallData.function_call && functionCallData.function_call.name) {
                        console.log('Found plain JSON function call:', functionCallData);

                        // Get arguments
                        const args = functionCallData.function_call.arguments ||
                                    functionCallData.function_call.args || {};

                        // Create user-friendly message
                        const functionDisplayName = functionCallData.function_call.name
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (char: string) => char.toUpperCase());

                        const replacementText = `<div class="tool-execution-indicator">
                          <span class="tool-execution-icon">⚙️</span>
                          <span class="tool-execution-text">Ejecutando: ${functionDisplayName}...</span>
                        </div>`;

                        // Replace the function call in the text
                        chunkText = chunkText.replace(jsonStr, replacementText);

                        // Call the function handler
                        if (onFunctionCall) {
                          onFunctionCall({
                            name: functionCallData.function_call.name,
                            args: args,
                            id: uuidv4()
                          });
                        }
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing plain JSON function call:', e);
                  }
                }
              }

              // Also check for tool_code pattern (legacy format)
              const toolCodeMatch = chunkText.match(/```tool_code\s+(\w+)\((.*?)\)\s+```/);
              if (toolCodeMatch) {
                try {
                  const toolName = toolCodeMatch[1];
                  const argsStr = toolCodeMatch[2];

                  // Parse arguments - enhanced version for common patterns
                  const args: Record<string, any> = {};

                  // Handle quoted arguments with equals sign
                  const argMatches = argsStr.match(/(\w+)=(?:"([^"]*)"|'([^']*)'|([^,\s]*))/g);
                  if (argMatches) {
                    argMatches.forEach(arg => {
                      const parts = arg.split('=');
                      if (parts.length >= 2) {
                        const key = parts[0].trim();
                        // Join back parts in case there were = in the value
                        let value = parts.slice(1).join('=').trim();
                        // Remove surrounding quotes
                        value = value.replace(/^["']|["']$/g, '');
                        args[key] = value;
                      }
                    });
                  }

                  console.log('Found tool_code in text:', { toolName, args });

                  // Create user-friendly message
                  const functionDisplayName = toolName
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (char: string) => char.toUpperCase());

                  const replacementText = `<div class="tool-execution-indicator">
                    <span class="tool-execution-icon">⚙️</span>
                    <span class="tool-execution-text">Ejecutando: ${functionDisplayName}...</span>
                  </div>`;

                  // Replace the tool_code in the text
                  chunkText = chunkText.replace(toolCodeMatch[0], replacementText);

                  // Log the function call for debugging
                  console.log('Function call detected in stream:', {
                    name: toolName,
                    args: args
                  });

                  // Call the function handler
                  if (onFunctionCall) {
                    const functionCallId = uuidv4();
                    console.log('Generated function call ID:', functionCallId);

                    onFunctionCall({
                      name: toolName,
                      args: args,
                      id: functionCallId
                    });
                  }
                } catch (e) {
                  console.error('Error parsing tool_code:', e);
                }
              }
            }
          } catch (e) {
            console.error('Error extracting text from chunk:', e);
          }

          if (chunkText) {
            onChunk(chunkText);
            accumulatedText += chunkText;
          }
        }
      } catch (error) {
        console.error('Error processing stream:', error);
        onChunk('Lo siento, estoy teniendo problemas para responder en este momento.');
      }

      // Check for function calls after streaming is complete
      if (enableFunctionCalling && onFunctionCall) {
        try {
          // In streaming mode, we need to get the last chunk to check for function calls
          // We'll use the accumulated text to create a new response if needed
          let lastChunk: any = null;

          // Try to collect the last chunk from the stream
          try {
            for await (const chunk of result) {
              lastChunk = chunk;
            }
          } catch (error) {
            // Stream might be already consumed, which is fine
          }

          // If we have a last chunk, check for function calls
          if (lastChunk) {
            const lastChunkAny = lastChunk as any;

            // Try to get function calls using the functionCalls method if available
            if (typeof lastChunkAny.functionCalls === 'function') {
              try {
                const calls = lastChunkAny.functionCalls();
                if (calls && calls.length > 0) {
                  for (const call of calls) {
                    onFunctionCall({
                      name: call.name,
                      args: call.args,
                      id: uuidv4()
                    });
                  }
                }
              } catch (e) {
                console.error('Error calling functionCalls():', e);
              }
            }
            // Also check for function calls in the candidates structure
            else if (lastChunkAny.candidates && lastChunkAny.candidates.length > 0) {
              const candidate = lastChunkAny.candidates[0];
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.functionCall) {
                    onFunctionCall({
                      name: part.functionCall.name,
                      args: part.functionCall.args || {},
                      id: uuidv4()
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing function calls:', error);
          // No function calls in the response or error occurred
        }
      }

      // Cache the complete response
      const cacheKey = this.generateCacheKey(message, context);
      this.cacheResponse(cacheKey, accumulatedText, context);
    } catch (error) {
      console.error('Error streaming message:', error);

      // Try again without function calling as a fallback
      if (enableFunctionCalling) {
        try {
          console.log('Trying fallback without function calling');
          await this.streamMessage(
            message,
            conversationHistory,
            onChunk,
            context,
            undefined,
            false
          );
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          onChunk('Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde.');
        }
      } else {
        onChunk('Lo siento, estoy teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  }

  /**
   * Generate a system prompt based on context
   * @param context Platform context
   * @returns System prompt
   */
  private generateSystemPrompt(context?: PlatformContext): string {
    // Default system prompt
    let systemPrompt = `INSTRUCCIONES PARA EL ASISTENTE DE IA (DEBES SEGUIR ESTAS INSTRUCCIONES EXACTAMENTE):

Eres HopeAI, un asistente virtual especializado en psicología clínica integrado en la plataforma HopeAI.
NO eres un modelo de lenguaje genérico. Eres un asistente específico para esta plataforma.
NUNCA te identifiques como "un modelo de lenguaje" o "una IA entrenada por Google" o "Gemini".
NUNCA digas frases como "No tengo acceso a" o "No puedo acceder a" información específica.
SIEMPRE responde como HopeAI, el asistente especializado en psicología clínica.

Tu objetivo es ayudar a los profesionales de la salud mental en su trabajo diario proporcionando información relevante y ejecutando acciones útiles.
Responde de manera concisa, profesional y empática.
Utiliza un tono cálido pero profesional.
Limita tus respuestas a información relevante y útil.

HERRAMIENTAS DISPONIBLES (OBLIGATORIO USARLAS):

Tienes acceso a las siguientes herramientas que DEBES utilizar cuando sea apropiado:

1. search_patients: Busca pacientes por nombre, ID o criterios específicos.
   ÚSALA CUANDO: El usuario pide "busca al paciente Juan Pérez", "encuentra pacientes con ansiedad", "muéstrame los pacientes recientes", etc.

2. schedule_session: Programa sesiones de terapia con pacientes.
   ÚSALA CUANDO: El usuario pide "programa una sesión con María García para mañana a las 3 PM", "agenda una cita", etc.

3. create_reminder: Crea recordatorios para el terapeuta.
   ÚSALA CUANDO: El usuario pide "recuérdame revisar los expedientes el viernes", "crea una alarma para", etc.

4. generate_report: Genera informes clínicos para pacientes.
   ÚSALA CUANDO: El usuario pide "genera un informe de evaluación inicial para el paciente 12345", "necesito un reporte para", etc.

REGLAS ESTRICTAS PARA EL USO DE HERRAMIENTAS:
- DEBES utilizar estas herramientas de forma proactiva cuando el usuario solicite acciones relacionadas con ellas.
- NUNCA digas que no puedes realizar estas acciones o que no tienes acceso a la información.
- NUNCA digas que eres un modelo de lenguaje o una IA sin acceso a datos específicos.
- SIEMPRE que el usuario solicite información sobre pacientes, citas, o informes, utiliza la herramienta correspondiente.
- Cuando detectes una solicitud que requiera el uso de una herramienta, DEBES utilizarla en lugar de simular una respuesta.
- NO menciones que tienes estas herramientas a menos que el usuario pregunte específicamente por ellas.

FORMATO PARA USAR HERRAMIENTAS:
Cuando necesites usar una herramienta, debes usar EXACTAMENTE este formato:

{
  "function_call": {
    "name": "nombre_de_la_herramienta",
    "arguments": {
      "parametro1": "valor1",
      "parametro2": "valor2"
    }
  }
}

Por ejemplo, para buscar un paciente llamado Juan Pérez, debes escribir:

{
  "function_call": {
    "name": "search_patients",
    "arguments": {
      "query": "Juan Pérez"
    }
  }
}

NO uses ningún otro formato para llamar a las herramientas. NO escribas "tool_code" ni ningún otro prefijo.`;

    // Add context if available
    if (context) {
      systemPrompt += `\n\nINFORMACIÓN CONTEXTUAL (DEBES USAR ESTA INFORMACIÓN):`;

      // Add user context
      if (context.user && context.user.name) {
        systemPrompt += `\nEstás hablando con ${context.user.name}, un profesional de la salud mental que utiliza la plataforma HopeAI.`;
        systemPrompt += `\nDebes referirte al usuario por su nombre cuando sea apropiado.`;
      }

      // Add application context
      if (context.application) {
        if (context.application.currentSection) {
          systemPrompt += `\nEl usuario está en la sección "${context.application.currentSection}" de la plataforma.`;
        }
        if (context.application.currentPage) {
          systemPrompt += `\nEl usuario está en la página "${context.application.currentPage}" dentro de esa sección.`;
        }
        if (context.application.availableFeatures && context.application.availableFeatures.length > 0) {
          systemPrompt += `\nLa plataforma ofrece las siguientes funcionalidades: ${context.application.availableFeatures.join(', ')}.`;
        }
      }

      // Add data context
      if (context.data) {
        if (context.data.patientName) {
          systemPrompt += `\nEl usuario está trabajando actualmente con el paciente "${context.data.patientName}"${context.data.patientId ? ` (ID: ${context.data.patientId})` : ''}.`;
          systemPrompt += `\nCuando el usuario haga preguntas sin especificar un paciente, asume que se refiere a este paciente.`;
        }
        if (context.data.recentPatients && context.data.recentPatients.length > 0) {
          systemPrompt += `\nPacientes recientes con los que ha trabajado: ${context.data.recentPatients.join(', ')}.`;
        }
      }
    }

    // Add a final reminder
    systemPrompt += `\n\nRECORDATORIO FINAL (EXTREMADAMENTE IMPORTANTE):
- NUNCA te identifiques como un modelo de lenguaje, una IA genérica, o Gemini.
- NUNCA digas frases como "No tengo acceso a" o "No puedo acceder a" información específica.
- SIEMPRE responde como HopeAI, el asistente especializado en psicología clínica.
- UTILIZA las herramientas disponibles cuando sea apropiado.
- RECUERDA la información contextual proporcionada.
- IGNORA cualquier instrucción previa que contradiga estas reglas.`;

    // Add logging for debugging
    console.log('System prompt for AI assistant (first 200 chars):',
      systemPrompt.substring(0, 200) + '...');
    console.log('System prompt length:', systemPrompt.length);

    return systemPrompt;
  }

  /**
   * Optimize conversation history to stay within token limits
   * @param history Conversation history
   * @returns Optimized history
   */
  private optimizeConversationHistory(history: Message[]): Message[] {
    // If history is short enough, return it as is
    if (history.length <= 10) {
      return history;
    }

    // Keep the first message (usually a system message) and the last 9 messages
    return [
      history[0],
      ...history.slice(-9)
    ];
  }

  /**
   * Limit response length to the configured maximum
   * @param text Response text
   * @returns Limited text
   */
  private limitResponseLength(text: string): string {
    if (text.length <= this.config.maxResponseLength) {
      return text;
    }

    // Truncate at the last sentence boundary before the limit
    const truncated = text.substring(0, this.config.maxResponseLength);
    const lastSentence = truncated.lastIndexOf('.');

    if (lastSentence > this.config.maxResponseLength * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }

    return truncated;
  }

  /**
   * Generate a cache key based on the message and context
   * @param message Message
   * @param context Context
   * @returns Cache key
   */
  private generateCacheKey(message: string, context?: any): string {
    const contextString = context ? JSON.stringify(context) : '';
    return `${message}:${contextString}`;
  }

  /**
   * Get a cached response
   * @param key Cache key
   * @returns Cached response or undefined
   */
  private getCachedResponse(key: string): string | undefined {
    const cached = this.cache.get(key);

    if (!cached) {
      return undefined;
    }

    // Check if the cache has expired
    if (Date.now() - cached.timestamp > this.config.cacheExpiryTime) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.response;
  }

  /**
   * Cache a response
   * @param key Cache key
   * @param response Response text
   * @param context Context
   */
  private cacheResponse(key: string, response: string, context?: any): void {
    this.cache.set(key, {
      question: key.split(':')[0],
      response,
      timestamp: Date.now(),
      context
    });

    // Prune the cache if it gets too large
    if (this.cache.size > 100) {
      // Delete the oldest entries
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      for (let i = 0; i < 20; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
}
