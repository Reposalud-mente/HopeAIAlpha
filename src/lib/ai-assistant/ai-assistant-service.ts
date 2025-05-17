/**
 * Enhanced AI Assistant Service for interacting with Gemini API
 * This service incorporates platform context and embodies the HopeAI spirit and values
 * Uses the Google AI SDK Chat class for better conversation management
 * Supports function calling for administrative tasks
 *
 * Updated to use the latest GenAI SDK patterns and best practices for function calling
 * MODIFIED to remove reliance on Gemini API's context caching for free-tier compatibility.
 */
import {
    GoogleGenAI,
    FunctionCallingConfigMode,
    // FunctionDeclaration, // Not directly used in this file's top level
    HarmCategory,
    HarmBlockThreshold,
    GenerationConfig, // Added for type hint
  } from '@google/genai';
import { ENV } from '../RagAI/config';
import { getEnhancedSystemPrompt } from '@/prompts/enhanced_clinical_assistant_prompt';
import { getClientAIContext } from './client-context-gatherer';
import { adminToolDeclarations as prismaToolDeclarations } from './admin-tools';
import { adminToolDeclarations as supabaseToolDeclarations } from './supabase-admin-tools';
import { logger } from '@/lib/logger';
import { getMem0Service } from './mem0-service';
import { generateUniqueId } from '@/lib/utils/id-generator';

  // Combine tool declarations from both Prisma and Supabase implementations
  // Prioritize Supabase implementations when there are duplicates
  const adminToolDeclarations = [
    ...prismaToolDeclarations.filter(tool =>
      !supabaseToolDeclarations.some(supaTool => supaTool.name === tool.name)
    ),
    ...supabaseToolDeclarations
  ];

// Define message types
export interface Message {
  id: string;
  role: 'user' | 'assistant'; // 'assistant' corresponds to 'model' in Gemini
  content: string;
  functionCalls?: any[];
  usedMemories?: any[];
  isUsingMemory?: boolean;
}

// Define context parameters type
export interface ContextParams {
  currentSection?: string;
  currentPage?: string;
  patientId?: string;
  patientName?: string;
  userName?: string;
  userId?: string;
  session?: any;
  userMessage?: string;
  useMemory?: boolean;
  memoryLimit?: number;
}

// Define cache item type
interface CacheItem {
  question: string;
  response: string;
  timestamp: number;
    context?: Record<string, any>;
}

/**
   * Enhanced service for interacting with the Gemini API for the AI Assistant
   * Incorporates platform context and embodies the HopeAI spirit and values
 */
  export class AIAssistantService {
  private client: GoogleGenAI;
  private modelName: string;
  private temperature: number;
  private maxTokens: number;
    private maxResponseLength: number; // Maximum length of responses in characters
    private cache: Map<string, CacheItem>; // This is for response caching, not API context caching
  private cacheExpiryTime: number; // Cache expiry time in milliseconds

  /**
   * Constructor
   * @param apiKey Gemini API key
   * @param modelName Gemini model name
   * @param temperature Temperature for text generation
   * @param maxTokens Maximum tokens for text generation
     * @param maxResponseLength Maximum length of responses in characters (default: 500)
   * @param cacheExpiryTime Cache expiry time in milliseconds (default: 1 hour)
   */
  constructor(
    apiKey: string = ENV.GEMINI_API_KEY,
    modelName: string = 'gemini-2.5-flash-preview-04-17',
    temperature: number = 0.7,
    maxTokens: number = 2048,
      maxResponseLength: number = 500,
    cacheExpiryTime: number = 60 * 60 * 1000, // 1 hour
  ) {
    if (!apiKey) {
        throw new Error('API key is required for AIAssistantService');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
      this.maxResponseLength = maxResponseLength;
    this.cache = new Map<string, CacheItem>();
    this.cacheExpiryTime = cacheExpiryTime;
    }

    private functionCallingErrorCount: number = 0;
    private maxFunctionCallingErrors: number = 3;
    private disableFunctionCalling: boolean = false;

    /**
     * Helper to convert Message[] to Gemini's Content[] format
     * @param messages Array of Message objects
     * @returns Array of Content objects
     */
    private mapMessagesToContent(messages: Message[]): any[] {
      return messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user', // Map 'assistant' to 'model'
        parts: [{ text: msg.content }],
      }));
    }

    /**
     * Creates a new chat session with the specified model and configuration
     * @param enableFunctionCalling Whether to enable function calling
     * @param contextHints Optional context hints to help the model decide when to use tools
     * @param specificFunctions Optional array of specific function names to allow (only used with ANY mode)
     * @param initialHistory Optional initial conversation history
     * @param systemInstruction Optional system instruction for the chat session
     * @returns A chat session that can be used for conversation
     */
    createChatSession(
      enableFunctionCalling: boolean = false,
      contextHints?: Record<string, any>,
      specificFunctions?: string[],
      initialHistory: Message[] = [], // Added
      systemInstruction?: string      // Added
    ): any { // Return type updated to any for compatibility
      const generationConfig: GenerationConfig = { // Use GenerationConfig type
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        // Add thinking budget for more complex reasoning
        // @ts-ignore // thinkingBudget might not be in GenerationConfig yet
        thinkingBudget: 8192,
      };

      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      // Configuration for the model
      const modelConfig: any = {
        model: this.modelName,
        generationConfig,
        safetySettings
      };

      if (systemInstruction) {
        modelConfig.systemInstruction = {
          role: "system",
          parts: [{ text: systemInstruction }]
        };
      }

      if (enableFunctionCalling && !this.disableFunctionCalling) {
        try {
          // Check if we should force tool usage based on context hints
          const shouldForceToolUsage = contextHints ? this.shouldForceToolUsage(contextHints) : false;

          // Default to ANY mode for more aggressive tool usage
          // This makes the AI more likely to use tools when appropriate
          const functionCallingMode = FunctionCallingConfigMode.ANY;

          // Configure tools
          modelConfig.tools = [{ functionDeclarations: adminToolDeclarations }];
          modelConfig.toolConfig = { functionCallingConfig: { mode: functionCallingMode } };

          // If specific functions are provided, use only those
          if (specificFunctions && specificFunctions.length > 0) {
            modelConfig.toolConfig.functionCallingConfig.allowedFunctionNames = specificFunctions;
            logger.info('Using specific functions in ANY mode:', { specificFunctions, contextHints });
          } else if (shouldForceToolUsage && contextHints?.userMessage) {
            // Try to determine which specific function to use based on the message
            const userMessage = contextHints.userMessage.toLowerCase();

            if (userMessage.includes('busca') || userMessage.includes('search') ||
                userMessage.includes('paciente') || userMessage.includes('patient') ||
                userMessage.includes('lista') || userMessage.includes('list') ||
                userMessage.includes('mostrar') || userMessage.includes('show') ||
                userMessage.includes('ver') || userMessage.includes('view')) {
              // Force search_patients function
              modelConfig.toolConfig.functionCallingConfig.allowedFunctionNames = ['search_patients'];
              logger.info('Forcing search_patients function based on user message', { userMessage });
            }
          }

          // Increase thinking budget for better reasoning
          // @ts-ignore
          modelConfig.generationConfig.thinkingBudget = 16384;

          logger.info('Function calling enabled with configuration:', {
            tools: adminToolDeclarations.map(d => d.name),
            mode: modelConfig.toolConfig.functionCallingConfig.mode,
            allowedFunctions: modelConfig.toolConfig.functionCallingConfig.allowedFunctionNames || 'all available',
            // @ts-ignore
            thinkingBudget: modelConfig.generationConfig.thinkingBudget,
          });
        } catch (error) {
          logger.error('Error configuring function calling:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      }

      // Prepare history in the format the SDK expects
      const formattedHistory = this.mapMessagesToContent(initialHistory);

      // Using the updated SDK pattern to get a model and start a chat
      const model = this.client.models.generateContent.bind(this.client.models);
      const chat = {
        startChat: (options: any) => {
          // Create a simplified chat object that mimics the SDK's chat functionality
          return {
            sendMessage: async (message: string) => {
              const apiResponse = await model({
                model: this.modelName,
                contents: [
                  ...(options.history || []),
                  { role: 'user', parts: [{ text: message }] }
                ],
                ...modelConfig
              });

              let combinedText = '';
              const actualFunctionCalls: any[] = [];

              if (apiResponse && apiResponse.candidates && apiResponse.candidates.length > 0) {
                if (apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
                  logger.warn('Prompt was blocked by API', {
                    reason: apiResponse.promptFeedback.blockReason,
                    safetyRatings: apiResponse.promptFeedback.safetyRatings,
                  });
                }
                for (const candidate of apiResponse.candidates) {
                  if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                      if (part.text) {
                        combinedText += part.text;
                      }
                      if (part.functionCall) {
                        actualFunctionCalls.push(part.functionCall);
                      }
                    }
                  }
                }
              } else if (apiResponse && apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
                 logger.warn('Prompt was blocked by API (no candidates returned)', {
                    reason: apiResponse.promptFeedback.blockReason,
                    safetyRatings: apiResponse.promptFeedback.safetyRatings,
                  });
              }

              return {
                response: {
                  text: () => combinedText,
                  functionCalls: () => actualFunctionCalls
                }
              };
            },
            sendMessageStream: async (message: string) => {
              const stream = await this.client.models.generateContentStream({
                model: this.modelName,
                contents: [
                  ...(options.history || []),
                  { role: 'user', parts: [{ text: message }] }
                ],
                ...modelConfig
              });

              // Collect the full response as chunks arrive
              let fullText = '';
              const streamWithResponse = {
                stream: stream,
                response: new Promise(async (resolve) => {
                  for await (const chunk of stream) {
                    if (chunk.text) {
                      fullText += chunk.text;
                    }
                  }
                  // Once streaming is complete, provide the full response
                  resolve({
                    text: () => fullText,
                    functionCalls: () => []
                  });
                })
              };

              return streamWithResponse;
            }
          };
        }
      };

      // Start and return the chat session
      return chat.startChat({
        history: formattedHistory,
      });
    }

    private shouldForceToolUsage(contextHints: Record<string, any>): boolean {
      // More comprehensive list of keywords for each tool
      const schedulingKeywords = ['agenda', 'agendar', 'calendario', 'cita', 'sesión', 'programar', 'schedule', 'appointment', 'session', 'fecha', 'hora', 'date', 'time', 'reservar', 'book'];
      const searchKeywords = ['buscar', 'encontrar', 'paciente', 'search', 'find', 'patient', 'lookup', 'consultar', 'query', 'lista', 'list', 'mostrar', 'show', 'ver', 'view', 'mis pacientes', 'my patients', 'pacientes activos', 'active patients'];
      const reminderKeywords = ['recordatorio', 'reminder', 'recordar', 'remember', 'alarma', 'alert', 'notificar', 'notify', 'aviso', 'notice'];
      const reportKeywords = ['informe', 'reporte', 'report', 'generate', 'generar', 'crear', 'create', 'documento', 'document'];
      const toolKeywords = ['herramienta', 'tool', 'función', 'function', 'tool calling', 'usala', 'use it', 'utiliza', 'utilize'];

      const userMessage = contextHints.userMessage?.toLowerCase() || '';

      // Check for explicit tool usage requests
      if (toolKeywords.some(keyword => userMessage.includes(keyword))) {
        logger.info('Forcing tool usage due to explicit tool request', { userMessage });
        return true;
      }

      // Check for specific tool-related keywords
      const allKeywords = [...schedulingKeywords, ...searchKeywords, ...reminderKeywords, ...reportKeywords];
      const hasToolKeyword = allKeywords.some(keyword => userMessage.includes(keyword));

      // More aggressive tool usage detection
      if (hasToolKeyword) {
        logger.info('Forcing tool usage due to tool-related keyword', { userMessage });
        return true;
      }

      // Check for questions about patients that might not have explicit keywords
      if (userMessage.includes('paciente') || userMessage.includes('patient') ||
          userMessage.includes('tengo') || userMessage.includes('mis') ||
          userMessage.includes('my') || userMessage.includes('have')) {
        logger.info('Forcing tool usage due to patient-related query', { userMessage });
        return true;
      }

      return false;
    }

    private handleFunctionCallingError(error: any): void {
      this.functionCallingErrorCount++;
      console.warn(`Function calling error ${this.functionCallingErrorCount}/${this.maxFunctionCallingErrors}:`, error);
      if (this.functionCallingErrorCount >= this.maxFunctionCallingErrors) {
        console.error('Too many function calling errors, disabling function calling');
        this.disableFunctionCalling = true;
    }
  }

  /**
     * Creates a context cache for improved performance and context retention.
     * THIS METHOD IS BYPASSED due to free-tier limitations on gemini-2.5-flash.
     * @param context The context object to cache
     * @returns Promise resolving to null, as API caching is not used.
     */
    private async createContextCache(context: Record<string, any>): Promise<string | null> {
      logger.warn('API-side createContextCache is bypassed due to model/tier limitations. Context will be managed client-side.');
      return Promise.resolve(null); // Do not attempt to create an API cache
    }

    private optimizeConversationHistory(conversationHistory: Message[], maxMessages: number = 20): Message[] {
      if (conversationHistory.length <= maxMessages) {
        return conversationHistory;
      }
      const initialContextCount = Math.min(5, Math.floor(maxMessages * 0.25)); // Keep ~25% or up to 5 for initial
      const recentMessagesCount = maxMessages - initialContextCount;
      const initialContextMessages = conversationHistory.slice(0, initialContextCount);
      const recentMessages = conversationHistory.slice(-recentMessagesCount);
      const optimizedHistory = [...initialContextMessages, ...recentMessages];
      logger.info('Optimized conversation history', {
        originalLength: conversationHistory.length,
        optimizedLength: optimizedHistory.length,
        initialContextCount,
        recentMessagesCount,
      });
      return optimizedHistory;
    }

    // Define context parameters interface
    export interface ContextParams {
      currentSection?: string;
      currentPage?: string;
      patientId?: string;
      patientName?: string;
      userName?: string;
      userId?: string; // User ID for memory integration
      session?: any;
      useMemory?: boolean; // Whether to use memory for this request
      memoryLimit?: number; // Maximum number of memories to retrieve
      // cacheId?: string; // API cacheId is no longer used (deprecated)
    }

    async sendMessage(
      message: string,
      conversationHistory: Message[] = [],
      contextParams?: ContextParams,
      enableFunctionCalling: boolean = true
    ): Promise<{
      text: string;
      functionCalls?: any[];
      status?: 'success' | 'fallback_success' | 'error';
      error?: { message: string; code: string };
      // cacheId?: string; // API cacheId is no longer returned
    }> {
      try {
        // Get relevant memories if userId is provided and memory is enabled
        let relevantMemories: any[] = [];
        let memoryContext = '';
        let isUsingMemory = false;

        if (contextParams?.userId && contextParams?.useMemory !== false) {
          try {
            const mem0Service = getMem0Service();

            // Check if memory service is available
            const isMemoryAvailable = await mem0Service.isAvailable();

            if (isMemoryAvailable) {
              // Only search for memories if the message is not too short
              if (message.trim().length > 5) {
                // Get memory limit from context params or use default
                const memoryLimit = contextParams?.memoryLimit || 5;

                // Search for memories with filters and limit
                relevantMemories = await mem0Service.searchMemories(
                  message,
                  contextParams.userId,
                  memoryLimit,
                  {} // No additional filters
                );

                if (relevantMemories && Array.isArray(relevantMemories) && relevantMemories.length > 0) {
                  // Format memories for inclusion in the prompt
                  memoryContext = relevantMemories
                    .filter(m => m && m.memory) // Ensure memory exists
                    .map(m => `- ${m.memory}`)
                    .join('\n');

                  isUsingMemory = true;

                  logger.info('Retrieved memories for context', {
                    count: relevantMemories.length,
                    userId: contextParams.userId
                  });
                }
              } else {
                logger.info('Message too short for memory search', { messageLength: message.trim().length });
              }
            } else {
              logger.warn('Memory service is not available', { userId: contextParams.userId });
            }
          } catch (error) {
            logger.error('Error retrieving memories', { error });
            // Continue without memories if there's an error
          }
        }

        // Get the standard context
        const context = contextParams ? getClientAIContext(
          contextParams.currentSection,
          contextParams.currentPage,
          contextParams.patientId,
          contextParams.patientName,
          contextParams.userName
        ) : {};

        // Add memories to context if available
        if (memoryContext) {
          context.memories = memoryContext;
        }

        const cacheKey = this.generateCacheKey(message, context); // For response caching

        if (!enableFunctionCalling) {
          const cachedResponse = this.getCachedResponse(cacheKey);
          if (cachedResponse) {
            logger.info('Using cached response', { cacheKey });
            return { text: cachedResponse, status: "success" };
          }
        }

        const contextHints = {
          userMessage: message,
          currentSection: contextParams?.currentSection,
          currentPage: contextParams?.currentPage,
          hasPatientContext: !!contextParams?.patientId || !!contextParams?.patientName,
          patientName: contextParams?.patientName,
          userName: contextParams?.userName,
        };

        const optimizedHistory = this.optimizeConversationHistory(conversationHistory);
        const systemPrompt = getEnhancedSystemPrompt(context);

        // Create a chat session with initial history and system prompt
        const chat = this.createChatSession(
          enableFunctionCalling,
          contextHints,
          undefined, // specificFunctions - let it default or be based on contextHints
          optimizedHistory,
          systemPrompt
        );

        logger.info('Using optimized conversation history', {
          originalLength: conversationHistory.length,
          optimizedLength: optimizedHistory.length,
        });

        let userMessageContent = message;
        // Context is now primarily handled by systemPrompt and history.
        // Avoid prepending too much explicit context to the user's immediate message
        // if the system prompt and history already cover it, to save tokens.
        // However, specific, highly relevant dynamic context can still be useful.
        if (Object.keys(context).length > 0 && !systemPrompt.includes(context.patientInfo || "dummy_patient_string_for_check")) { // Example check
          const contextInfo = `\nRelevant context for this query: Current section: ${context.currentSection || 'N/A'}. Patient: ${context.patientInfo || 'N/A'}.`;
          userMessageContent = `${message}${contextInfo}`; // Append for clarity or if system prompt is generic
        }


        logger.info('AI Assistant context before sending message:', {
          userName: context.userName,
          userRole: context.userRole,
          contextParams,
          enableFunctionCalling,
          contextHints,
          historyLength: optimizedHistory.length,
          systemPromptLength: systemPrompt.length
        });

        // API cacheId is no longer used from contextParams or created
        // const apiCacheIdToUse = contextParams?.cacheId; // No longer relevant for API calls

        try {
          const sendMessageWithRetry = async (retryCount = 0, maxRetries = 3): Promise<any> => {
            try {
              // Message content is just the user's message. System prompt and history are in the chat session.
              return await chat.sendMessage(userMessageContent);
            } catch (error) {
              if (retryCount >= maxRetries) {
                logger.error('Maximum retries reached for sendMessage', { retryCount, error: error instanceof Error ? error.message : 'Unknown error' });
                throw error;
              }
              logger.warn(`Retry attempt ${retryCount + 1}/${maxRetries} for sendMessage`, { error: error instanceof Error ? error.message : 'Unknown error' });
              const backoffTime = Math.pow(2, retryCount) * 500;
              await new Promise(resolve => setTimeout(resolve, backoffTime));
              return sendMessageWithRetry(retryCount + 1, maxRetries);
            }
          };

          const response = await sendMessageWithRetry();
          const functionCalls = response.response.functionCalls(); // SDK change: response.functionCalls()
          const responseText = response.response.text(); // SDK change: response.text()

          const limitedResponse = this.limitResponseLength(responseText);

          if (!functionCalls || functionCalls.length === 0) {
            this.cacheResponse(cacheKey, limitedResponse, context); // Response caching
          }
          this.functionCallingErrorCount = 0;

          // After getting the response, store the conversation in mem0
          if (contextParams?.userId && contextParams?.useMemory !== false && message.trim().length > 5 && limitedResponse.trim().length > 5) {
            try {
              // Add the new message and response to the history
              const updatedHistory = [
                { id: generateUniqueId('user'), role: 'user', content: message },
                { id: generateUniqueId('assistant'), role: 'assistant', content: limitedResponse }
              ];

              // Store in mem0 (don't await to avoid blocking)
              const mem0Service = getMem0Service();

              // Check if memory service is available
              const isMemoryAvailable = await mem0Service.isAvailable();

              if (isMemoryAvailable) {
                // Use setTimeout to ensure this doesn't block the response
                setTimeout(() => {
                  // Add metadata about the conversation
                  const metadata = {
                    source: 'conversation',
                    timestamp: new Date().toISOString(),
                    isUsingMemory: isUsingMemory,
                    memoryCount: relevantMemories.length
                  };

                  mem0Service.addConversation(updatedHistory, contextParams.userId, metadata)
                    .catch(error => logger.error('Failed to store conversation in mem0', { error }));
                }, 100);
              } else {
                logger.warn('Memory service is not available for storing conversation', { userId: contextParams.userId });
              }
            } catch (error) {
              logger.error('Error storing conversation in mem0', { error });
              // Continue even if storing fails
            }
          }

          return {
            text: limitedResponse,
            functionCalls: functionCalls,
            status: "success",
            usedMemories: relevantMemories,
            isUsingMemory: isUsingMemory
          };
        } catch (error) {
          if (enableFunctionCalling) {
            this.handleFunctionCallingError(error);
            logger.warn('Function calling failed, retrying without function calling...', {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
            });
            try {
              const fallbackChat = this.createChatSession(
                false, // disable function calling
                undefined,
                undefined,
                optimizedHistory,
                systemPrompt
              );
              const fallbackResponse = await fallbackChat.sendMessage(userMessageContent);
              const fallbackText = fallbackResponse.response.text();
              const limitedFallbackText = this.limitResponseLength(fallbackText);
              this.cacheResponse(cacheKey, limitedFallbackText, context); // Response caching
              return {
                text: limitedFallbackText,
                functionCalls: undefined,
                status: "fallback_success",
                error: { message: error instanceof Error ? error.message : 'Unknown error', code: error instanceof Error && 'code' in error ? (error as any).code : 'UNKNOWN_ERROR' },
              };
            } catch (fallbackError) {
              logger.error('Both function calling and fallback attempts failed', {
                originalError: error instanceof Error ? error.message : 'Unknown error',
                fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
              });
              return {
                text: "Lo siento, estoy teniendo dificultades para procesar tu solicitud en este momento. Por favor, intenta de nuevo en unos momentos.",
                functionCalls: undefined,
                status: "error",
                error: { message: "Multiple failures in processing request", code: "PROCESSING_ERROR" },
              };
            }
          }
          logger.error('Error in sendMessage (non-function calling)', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
          return {
            text: "Lo siento, no pude procesar tu solicitud. Por favor, intenta expresar tu pregunta de otra manera.",
            functionCalls: undefined,
            status: "error",
            error: { message: error instanceof Error ? error.message : 'Unknown error', code: error instanceof Error && 'code' in error ? (error as any).code : 'UNKNOWN_ERROR' },
          };
        }
      } catch (error) {
        logger.error('Error sending message to Gemini API:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          message,
        });
        throw new Error(`Failed to get response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

  async streamMessage(
    message: string,
    conversationHistory: Message[] = [],
      onChunk: (chunk: string) => void,
      contextParams?: ContextParams,
      onFunctionCall?: (functionCall: any) => void,
      enableFunctionCalling: boolean = true,
      onMemoryUsage?: (memories: any[]) => void
  ): Promise<void> {
    try {
        // Get relevant memories if userId is provided and memory is enabled
        let relevantMemories: any[] = [];
        let memoryContext = '';
        let isUsingMemory = false;

        if (contextParams?.userId && contextParams?.useMemory !== false) {
          try {
            const mem0Service = getMem0Service();

            // Check if memory service is available
            const isMemoryAvailable = await mem0Service.isAvailable();

            if (isMemoryAvailable) {
              // Only search for memories if the message is not too short
              if (message.trim().length > 5) {
                // Get memory limit from context params or use default
                const memoryLimit = contextParams?.memoryLimit || 5;

                // Search for memories with filters and limit
                relevantMemories = await mem0Service.searchMemories(
                  message,
                  contextParams.userId,
                  memoryLimit,
                  {} // No additional filters
                );

                if (relevantMemories && Array.isArray(relevantMemories) && relevantMemories.length > 0) {
                  // Format memories for inclusion in the prompt
                  memoryContext = relevantMemories
                    .filter(m => m && m.memory) // Ensure memory exists
                    .map(m => `- ${m.memory}`)
                    .join('\n');

                  isUsingMemory = true;

                  // Call the memory usage callback if provided
                  if (onMemoryUsage) {
                    onMemoryUsage(relevantMemories);
                  }

                  logger.info('Retrieved memories for streaming context', {
                    count: relevantMemories.length,
                    userId: contextParams.userId
                  });
                }
              } else {
                logger.info('Message too short for memory search in streaming', { messageLength: message.trim().length });
              }
            } else {
              logger.warn('Memory service is not available for streaming', { userId: contextParams.userId });
            }
          } catch (error) {
            logger.error('Error retrieving memories for streaming', { error });
            // Continue without memories if there's an error
          }
        }

        // Get the standard context
        const context = contextParams ? getClientAIContext(
          contextParams.currentSection,
          contextParams.currentPage,
          contextParams.patientId,
          contextParams.patientName,
          contextParams.userName
        ) : {};

        // Add memories to context if available
        if (memoryContext) {
          context.memories = memoryContext;
        }

        const systemPrompt = getEnhancedSystemPrompt(context);
        const optimizedHistory = this.optimizeConversationHistory(conversationHistory);

        // If function calling is enabled, it might not be streamable and falls back to sendMessage.
        // The current logic for streamMessage that calls this.sendMessage will inherit the context management changes.
        if (enableFunctionCalling && !this.disableFunctionCalling && onFunctionCall) {
            // Check if the context suggests a tool might be used
            const contextHints = {
              userMessage: message,
              currentSection: contextParams?.currentSection,
              currentPage: contextParams?.currentPage,
              hasPatientContext: !!contextParams?.patientId || !!contextParams?.patientName,
              patientName: contextParams?.patientName,
              userName: contextParams?.userName,
            };
            // If likely tool use, or if we always want to check for tools first when onFunctionCall is provided:
            if (this.shouldForceToolUsage(contextHints) || true) { // Or always try non-streaming if onFunctionCall is present
              logger.info('Potential function call in streamMessage, using non-streaming sendMessage first.');
              const response = await this.sendMessage(
                message,
                conversationHistory, // Will be optimized inside sendMessage
                contextParams,
                true // Enable function calling
              );

              if (response.functionCalls && response.functionCalls.length > 0 && onFunctionCall) {
                logger.info('Function calls detected in streamMessage (via sendMessage)', {
                  functionCalls: response.functionCalls.map((fc: any) => fc.name),
                  status: response.status,
                });
                for (const functionCall of response.functionCalls) {
                  const functionCallMessage = `function_call: ${JSON.stringify({ name: functionCall.name, args: functionCall.args })}`;
                  onChunk(functionCallMessage); // Send as a special chunk
                  onFunctionCall(functionCall);
                }
                if (response.text) onChunk(response.text); // Send any accompanying text
                return;
              }
              // If no function call, but we got a response, stream it if it was success
              if (response.text && (response.status === 'success' || response.status === 'fallback_success')) {
                  if (response.status === 'fallback_success') onChunk("⚠️ ");
                  onChunk(response.text);
                  return;
              }
              // If sendMessage failed to produce text or had an unrecoverable error, fall through to regular streaming
              logger.warn('sendMessage within streamMessage did not result in function call or usable text, proceeding to attempt direct streaming.', response);
            }
        }

        // Fallback to direct streaming if function calling is disabled, not needed, or initial check failed
        logger.info('Proceeding with direct streaming for streamMessage.');
        const chat = this.createChatSession(
          false, // No function calling for direct stream
          undefined,
          undefined,
          optimizedHistory,
          systemPrompt
        );

        let userMessageContent = message;
         // Context is now primarily handled by systemPrompt and history.
         // Avoid prepending too much explicit context to the user's immediate message
        if (Object.keys(context).length > 0 && !systemPrompt.includes(context.patientInfo || "dummy_patient_string_for_check")) { // Example check
          const contextInfo = `\nRelevant context for this query: Current section: ${context.currentSection || 'N/A'}. Patient: ${context.patientInfo || 'N/A'}.`;
          userMessageContent = `${message}${contextInfo}`;
        }

        logger.info('AI Assistant context before streaming message:', {
          userName: context.userName,
          userRole: context.userRole,
          contextParams,
          enableFunctionCalling: false, // for this streaming path
          historyLength: optimizedHistory.length
        });

        const responseStream = await chat.sendMessageStream(userMessageContent);

      let fullResponse = '';
        let isLengthLimited = false;

        for await (const chunk of responseStream) {
          // const chunkText = chunk.text; // Original SDK might be chunk.text()
          const chunkText = chunk.text(); // Check SDK version for correct property/method
          if (chunkText && !isLengthLimited) {
            fullResponse += chunkText;
            if (fullResponse.length > this.maxResponseLength) {
              isLengthLimited = true;
              const alreadySentLength = fullResponse.length - chunkText.length;
              const remainingSpace = this.maxResponseLength - alreadySentLength;
              if (remainingSpace > 0) {
                onChunk(chunkText.substring(0, remainingSpace));
              }
              onChunk("\n\n[Respuesta truncada por brevedad]");
              fullResponse = fullResponse.substring(0, this.maxResponseLength) + "\n\n[Respuesta truncada por brevedad]";
            } else {
              onChunk(chunkText);
            }
          }
        }
        const cacheKey = this.generateCacheKey(message, context); // For response caching
        this.cacheResponse(cacheKey, fullResponse, context);

        // After streaming completes, store the conversation in mem0
        if (contextParams?.userId && contextParams?.useMemory !== false && message.trim().length > 5 && fullResponse.trim().length > 5) {
          try {
            // Add the new message and response to the history
            const updatedHistory = [
              { id: generateUniqueId('user'), role: 'user', content: message },
              { id: generateUniqueId('assistant'), role: 'assistant', content: fullResponse }
            ];

            // Store in mem0 (don't await to avoid blocking)
            const mem0Service = getMem0Service();

            // Check if memory service is available
            const isMemoryAvailable = await mem0Service.isAvailable();

            if (isMemoryAvailable) {
              // Use setTimeout to ensure this doesn't block the response
              setTimeout(() => {
                // Add metadata about the conversation
                const metadata = {
                  source: 'streaming_conversation',
                  timestamp: new Date().toISOString(),
                  isUsingMemory: isUsingMemory,
                  memoryCount: relevantMemories.length
                };

                mem0Service.addConversation(updatedHistory, contextParams.userId, metadata)
                  .catch(error => logger.error('Failed to store streamed conversation in mem0', { error }));
              }, 100);
            } else {
              logger.warn('Memory service is not available for storing streamed conversation', { userId: contextParams.userId });
            }
          } catch (error) {
            logger.error('Error storing streamed conversation in mem0', { error });
            // Continue even if storing fails
          }
        }
      } catch (error) {
        logger.error('Error streaming message from Gemini API:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          message,
        });
        onChunk("Lo siento, ocurrió un error al intentar obtener una respuesta. Por favor, inténtalo de nuevo.");
        // throw new Error(`Failed to stream response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    private generateCacheKey(message: string, context: Record<string, any>): string {
      const normalizedMessage = this.normalizeMessage(message);
      const contextKey = context.currentSection || ''; // Simplified context key
      return `${normalizedMessage}|${contextKey}`;
    }

    private getCachedResponse(cacheKey: string): string | null {
      const cachedItem = this.cache.get(cacheKey);
    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheExpiryTime) {
      return cachedItem.response;
    }
    return null;
  }

    private cacheResponse(cacheKey: string, response: string, context?: Record<string, any>): void {
      this.cache.set(cacheKey, { question: cacheKey, response, timestamp: Date.now(), context });
    }

  private normalizeMessage(message: string): string {
    return message.toLowerCase().trim().replace(/\s+/g, ' ');
  }

    private limitResponseLength(response: string): string {
      if (response.length <= this.maxResponseLength) return response;
      const searchWindow = Math.min(100, Math.floor(this.maxResponseLength * 0.2));
      const searchStart = Math.max(0, this.maxResponseLength - searchWindow); // Ensure searchStart is not negative
      const textToSearch = response.substring(searchStart, this.maxResponseLength);
      const lastPeriodIndex = textToSearch.lastIndexOf('.');
      if (lastPeriodIndex !== -1 && (searchStart + lastPeriodIndex + 1) > this.maxResponseLength / 2 ) { // Ensure sentence isn't too short
        return response.substring(0, searchStart + lastPeriodIndex + 1);
      }
      return response.substring(0, this.maxResponseLength);
    }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheExpiryTime) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Sends the result of a function execution back to the AI model.
   * @param functionName The name of the function that was executed.
   * @param toolOutput The output from the executed function.
   * @param conversationHistory The history of the conversation leading up to this point.
   * @param contextParams Optional context parameters.
   * @returns The AI's natural language response after processing the function result.
   */
  async sendFunctionResult(
    functionName: string,
    toolOutput: any,
    conversationHistory: Message[],
    contextParams?: {
      userName?: string;
    }
  ): Promise<{
    text: string;
    status?: 'success' | 'error';
    error?: { message: string; code: string };
  }> {
    try {
      const systemInstructionText = getEnhancedSystemPrompt(getClientAIContext(undefined, undefined, undefined, undefined, contextParams?.userName));

      const contentsForApi = [
        ...this.mapMessagesToContent(conversationHistory),
        {
          role: "function",
          parts: [
            {
              functionResponse: {
                name: functionName,
                response: toolOutput
              }
            }
          ]
        }
      ];

      const generationConfig: GenerationConfig = {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      };

      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ];

      // Construct a modelConfig similar to createChatSession
      const modelConfigForThisCall: any = {
        model: this.modelName,
        generationConfig,
        safetySettings,
        systemInstruction: { role: "system", parts: [{ text: systemInstructionText }] }
        // Tools are explicitly not included as we are providing a function result.
      };

      if (!this.client.models?.generateContent) {
        logger.error('generateContent function not available on AI client.models');
        throw new Error("generateContent function not available on AI client.models");
      }

      const result = await this.client.models.generateContent({
        contents: contentsForApi,
        ...modelConfigForThisCall // Spread the model config which includes systemInstruction
      });

      const apiResponse = result;
      let combinedText = '';

      if (apiResponse && apiResponse.candidates && apiResponse.candidates.length > 0) {
        if (apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
          logger.warn('Prompt was blocked by API in sendFunctionResult', {
            reason: apiResponse.promptFeedback.blockReason,
            safetyRatings: apiResponse.promptFeedback.safetyRatings,
          });
          return { text: "", status: "error", error: { message: "Blocked by API", code: apiResponse.promptFeedback.blockReason.toString() } };
        }
        for (const candidate of apiResponse.candidates) {
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.text) {
                combinedText += part.text;
              }
              if (part.functionCall) {
                logger.warn('Unexpected function call received in response to sendFunctionResult', { functionCall: part.functionCall });
              }
            }
          }
        }
      } else if (apiResponse && apiResponse.promptFeedback && apiResponse.promptFeedback.blockReason) {
         logger.warn('Prompt was blocked by API in sendFunctionResult (no candidates returned)', {
            reason: apiResponse.promptFeedback.blockReason,
            safetyRatings: apiResponse.promptFeedback.safetyRatings,
          });
         return { text: "", status: "error", error: { message: "Blocked by API (no candidates)", code: apiResponse.promptFeedback.blockReason.toString() } };
      }

      const limitedResponse = this.limitResponseLength(combinedText);
      return { text: limitedResponse, status: "success" };

    } catch (error) {
      logger.error('Error in sendFunctionResult:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        functionName,
      });
      return {
        text: "Lo siento, tuve un problema al procesar el resultado de la acción.",
        status: "error",
        error: { message: error instanceof Error ? error.message : 'Unknown error', code: "SEND_FUNCTION_RESULT_ERROR" },
      };
    }
  }
}

// Create a singleton instance of the service
let aiAssistantServiceInstance: AIAssistantService | null = null;

/**
 * Gets the singleton instance of the AI Assistant Service
 * @param maxResponseLength Optional maximum length for responses
 * @returns The AI Assistant Service instance
 */
export function getAIAssistantService(maxResponseLength?: number): AIAssistantService {
  if (!aiAssistantServiceInstance) {
    aiAssistantServiceInstance = new AIAssistantService(
      undefined, undefined, undefined, undefined, maxResponseLength
    );
  } else if (maxResponseLength !== undefined &&
             // @ts-ignore // Access private member for comparison if necessary, or add a getter
             aiAssistantServiceInstance.maxResponseLength !== maxResponseLength) {
    // If maxResponseLength changes, we might want a new instance or to update existing.
    // For simplicity, let's assume it doesn't change often post-initialization or re-instantiate.
     logger.warn("Re-initializing AIAssistantService due to maxResponseLength change.");
     aiAssistantServiceInstance = new AIAssistantService(
        undefined, undefined, undefined, undefined, maxResponseLength
     );
  }
  return aiAssistantServiceInstance;
}

// Logger stub remains the same
if (typeof logger === 'undefined') {
    const consoleLogger = { info: console.info, warn: console.warn, error: console.error, debug: console.debug };
    // @ts-ignore
    global.logger = consoleLogger;
}