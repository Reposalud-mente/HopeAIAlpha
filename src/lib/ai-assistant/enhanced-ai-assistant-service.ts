/**
 * Enhanced AI Assistant Service for interacting with Gemini API
 * This service incorporates platform context and embodies the HopeAI spirit and values
 * Uses the Google AI SDK Chat class for better conversation management
 * Supports function calling for administrative tasks
 */
import { GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration } from '@google/genai';
import { ENV } from '../RagAI/config';
import { getEnhancedSystemPrompt } from '@/prompts/enhanced_clinical_assistant_prompt';
import { getClientAIContext } from './client-context-gatherer';
import { adminToolDeclarations } from './admin-tools';

// Define message types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
export class EnhancedAIAssistantService {
  private client: GoogleGenAI;
  private modelName: string;
  private temperature: number;
  private maxTokens: number;
  private maxResponseLength: number; // Maximum length of responses in characters
  private cache: Map<string, CacheItem>;
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
    modelName: string = 'gemini-2.5-flash-preview-04-17', // Using the requested model
    temperature: number = 0.7,
    maxTokens: number = 2048,
    maxResponseLength: number = 500, // Default to 500 characters for concise responses
    cacheExpiryTime: number = 60 * 60 * 1000, // 1 hour
  ) {
    if (!apiKey) {
      throw new Error('API key is required for EnhancedAIAssistantService');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.maxResponseLength = maxResponseLength;
    this.cache = new Map<string, CacheItem>();
    this.cacheExpiryTime = cacheExpiryTime;
  }

  // Track if function calling is causing errors
  private functionCallingErrorCount: number = 0;
  private maxFunctionCallingErrors: number = 3;
  private disableFunctionCalling: boolean = false;

  /**
   * Creates a new chat session with the specified model and configuration
   * @param enableFunctionCalling Whether to enable function calling
   * @returns A chat session that can be used for conversation
   */
  createChatSession(enableFunctionCalling: boolean = false) {
    const config: any = {
      temperature: this.temperature,
      maxOutputTokens: this.maxTokens,
    };

    // Add function calling configuration if enabled and not disabled due to errors
    if (enableFunctionCalling && !this.disableFunctionCalling) {
      try {
        // Add the function declarations to the config
        config.tools = [{
          functionDeclarations: adminToolDeclarations
        }];

        // Configure function calling to ANY mode for more reliable tool execution
        // This forces the model to use function calling when appropriate
        config.toolConfig = {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY
            // Note: allowedFunctionNames is not set, allowing any of the provided functions to be used
          }
        };

        console.log('Function calling enabled with tools:', adminToolDeclarations.map(d => d.name));
      } catch (error) {
        console.error('Error configuring function calling:', error);
        // Don't add function calling configuration if there's an error
      }
    }

    return this.client.chats.create({
      model: this.modelName,
      config
    });
  }

  /**
   * Handles function calling errors by tracking them and disabling function calling if needed
   * @param error The error that occurred
   */
  private handleFunctionCallingError(error: any): void {
    this.functionCallingErrorCount++;
    console.warn(`Function calling error ${this.functionCallingErrorCount}/${this.maxFunctionCallingErrors}:`, error);

    // If we've reached the maximum number of errors, disable function calling
    if (this.functionCallingErrorCount >= this.maxFunctionCallingErrors) {
      console.error('Too many function calling errors, disabling function calling');
      this.disableFunctionCalling = true;
    }
  }

  /**
   * Sends a message to the Gemini API and returns the response
   * @param message The user message
   * @param conversationHistory Previous messages in the conversation
   * @param contextParams Optional context parameters
   * @param enableFunctionCalling Whether to enable function calling
   * @returns Promise resolving to the assistant's response and any function calls
   */
  async sendMessage(
    message: string,
    conversationHistory: Message[] = [],
    contextParams?: {
      currentSection?: string;
      currentPage?: string;
      patientId?: string;
      patientName?: string;
      userName?: string;
      session?: any;
    },
    enableFunctionCalling: boolean = true
  ): Promise<{ text: string; functionCalls?: any[] }> {
    try {
      // Get platform context
      const context = contextParams
        ? getClientAIContext(
            contextParams.currentSection,
            contextParams.currentPage,
            contextParams.patientId,
            contextParams.patientName,
            contextParams.userName // Pass the user's name to the context gatherer
          )
        : {};

      // Generate cache key that includes context
      const cacheKey = this.generateCacheKey(message, context);

      // Check cache first (only if not using function calling)
      if (!enableFunctionCalling) {
        const cachedResponse = this.getCachedResponse(cacheKey);
        if (cachedResponse) {
          console.log('Using cached response');
          return { text: cachedResponse };
        }
      }

      // Create a chat session with function calling if enabled
      const chat = this.createChatSession(enableFunctionCalling);

      // Add conversation history to the chat
      if (conversationHistory.length > 0) {
        // Add each message to the chat history
        for (const msg of conversationHistory) {
          if (msg.role === 'user') {
            await chat.sendMessage({
              message: msg.content
            });
          }
        }
      }

      // Create a context-aware message
      let userMessage = message;
      if (Object.keys(context).length > 0) {
        // Format context information for the message
        const contextInfo = `
Context:
${context.currentSection ? `- Current section: ${context.currentSection}` : ''}
${context.currentPage ? `- Current page: ${context.currentPage}` : ''}
${context.patientInfo ? `- Patient: ${context.patientInfo}` : ''}
`;
        userMessage = `${contextInfo}\n\nUser question: ${message}`;
      }

      // Log the context for debugging
      console.log('AI Assistant context before sending message:', {
        userName: context.userName,
        userRole: context.userRole,
        contextParams,
        enableFunctionCalling
      });

      try {
        // Send the message to the chat
        const response = await chat.sendMessage({
          message: userMessage,
          config: {
            systemInstruction: getEnhancedSystemPrompt(context)
          }
        });

        // Check for function calls
        const functionCalls = response.functionCalls;

        // Extract the text from the response
        const responseText = response.text || '';

        // Limit the response length if needed
        const limitedResponse = this.limitResponseLength(responseText);

        // Cache the response with context (only if not a function call)
        if (!functionCalls || functionCalls.length === 0) {
          this.cacheResponse(cacheKey, limitedResponse, context);
        }

        // Reset function calling error count on success
        this.functionCallingErrorCount = 0;

        return {
          text: limitedResponse,
          functionCalls: functionCalls
        };
      } catch (error) {
        // If this was a function calling attempt, handle the error
        if (enableFunctionCalling) {
          this.handleFunctionCallingError(error);

          // Try again without function calling if we hit an error
          console.log('Retrying without function calling...');

          // Create a new chat session without function calling
          const fallbackChat = this.createChatSession(false);

          // Send the message without function calling
          const fallbackResponse = await fallbackChat.sendMessage({
            message: userMessage,
            config: {
              systemInstruction: getEnhancedSystemPrompt(context)
            }
          });

          // Extract and limit the text from the fallback response
          const fallbackText = fallbackResponse.text || '';
          const limitedFallbackText = this.limitResponseLength(fallbackText);

          // Cache the fallback response
          this.cacheResponse(cacheKey, limitedFallbackText, context);

          return {
            text: limitedFallbackText,
            functionCalls: undefined
          };
        }

        // If not a function calling attempt or fallback also failed, throw the error
        throw error;
      }
    } catch (error) {
      console.error('Error sending message to Gemini API:', error);
      throw new Error(`Failed to get response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Streams text generation using the Gemini API
   * @param message The user message
   * @param conversationHistory Previous messages in the conversation
   * @param onChunk Callback function for each chunk of generated text
   * @param contextParams Optional context parameters
   * @param onFunctionCall Callback function for function calls
   * @param enableFunctionCalling Whether to enable function calling
   * @returns Promise resolving when the generation is complete
   */
  async streamMessage(
    message: string,
    conversationHistory: Message[] = [],
    onChunk: (chunk: string) => void,
    contextParams?: {
      currentSection?: string;
      currentPage?: string;
      patientId?: string;
      patientName?: string;
      userName?: string;
      session?: any;
    },
    onFunctionCall?: (functionCall: any) => void,
    enableFunctionCalling: boolean = true
  ): Promise<void> {
    try {
      // Get platform context
      const context = contextParams
        ? getClientAIContext(
            contextParams.currentSection,
            contextParams.currentPage,
            contextParams.patientId,
            contextParams.patientName,
            contextParams.userName // Pass the user's name to the context gatherer
          )
        : {};

      // Check if we should use streaming or regular message for function calling
      if (enableFunctionCalling && !this.disableFunctionCalling) {
        try {
          // For function calling, we need to use the regular sendMessage method
          // as function calls are not supported in streaming mode
          const response = await this.sendMessage(
            message,
            conversationHistory,
            contextParams,
            true // Enable function calling
          );

          // Check if there are function calls
          if (response.functionCalls && response.functionCalls.length > 0 && onFunctionCall) {
            // Call the function call handler for each function call
            for (const functionCall of response.functionCalls) {
              // Format the function call as a special message for the visualizer
              const functionCallMessage = `function_call: ${JSON.stringify({
                name: functionCall.name,
                args: functionCall.args
              })}`;

              // Send the function call message as a chunk first
              onChunk(functionCallMessage);

              // Then call the function call handler
              onFunctionCall(functionCall);
            }

            // If there's also text, send it as a chunk
            if (response.text) {
              onChunk(response.text);
            }

            return;
          }

          // If no function calls, send the text as a chunk
          if (response.text) {
            onChunk(response.text);
          }

          return;
        } catch (error) {
          // If function calling fails, log the error and continue with regular streaming
          console.warn('Function calling failed in streamMessage, falling back to regular streaming:', error);
          this.handleFunctionCallingError(error);
          // Continue with regular streaming below
        }
      }

      // If function calling is disabled, use streaming as before
      // Create a chat session without function calling
      const chat = this.createChatSession(false);

      // Add conversation history to the chat
      if (conversationHistory.length > 0) {
        // Add each message to the chat history
        for (const msg of conversationHistory) {
          if (msg.role === 'user') {
            await chat.sendMessage({
              message: msg.content
            });
          }
        }
      }

      // Create a context-aware message
      let userMessage = message;
      if (Object.keys(context).length > 0) {
        // Format context information for the message
        const contextInfo = `
Context:
${context.currentSection ? `- Current section: ${context.currentSection}` : ''}
${context.currentPage ? `- Current page: ${context.currentPage}` : ''}
${context.patientInfo ? `- Patient: ${context.patientInfo}` : ''}
`;
        userMessage = `${contextInfo}\n\nUser question: ${message}`;
      }

      // Log the context for debugging
      console.log('AI Assistant context before streaming message:', {
        userName: context.userName,
        userRole: context.userRole,
        contextParams,
        enableFunctionCalling
      });

      // Send the message to the chat with streaming
      const responseStream = await chat.sendMessageStream({
        message: userMessage,
        config: {
          systemInstruction: getEnhancedSystemPrompt(context)
        }
      });

      // Process the stream
      let fullResponse = '';
      let isLengthLimited = false;

      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText && !isLengthLimited) {
          // Add the chunk to the full response
          fullResponse += chunkText;

          // Check if we've exceeded the maximum length
          if (fullResponse.length > this.maxResponseLength) {
            isLengthLimited = true;

            // Trim the response to the maximum length
            const trimmedResponse = this.limitResponseLength(fullResponse);

            // Calculate the difference to determine what part of the chunk to send
            const alreadySentLength = fullResponse.length - chunkText.length;
            if (alreadySentLength < this.maxResponseLength) {
              // Send only the part of the chunk that fits within the limit
              const partialChunk = chunkText.substring(0, this.maxResponseLength - alreadySentLength);
              onChunk(partialChunk);

              // Send an indicator that the response was truncated
              const truncationMessage = "\n\n[Respuesta truncada por brevedad]";
              onChunk(truncationMessage);
            }

            // Update the full response to the trimmed version plus truncation message
            fullResponse = trimmedResponse + "\n\n[Respuesta truncada por brevedad]";
          } else {
            // Send the chunk as is
            onChunk(chunkText);
          }
        }
      }

      // Cache the full response (which may have been limited)
      const cacheKey = this.generateCacheKey(message, context);
      this.cacheResponse(cacheKey, fullResponse, context);
    } catch (error) {
      console.error('Error streaming message from Gemini API:', error);
      throw new Error(`Failed to stream response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a cache key that includes context information
   * @param message The user message
   * @param context The context object
   * @returns A cache key string
   */
  private generateCacheKey(message: string, context: Record<string, any>): string {
    // Normalize the message
    const normalizedMessage = this.normalizeMessage(message);

    // Include relevant context in the cache key
    // Only include context elements that would affect the response
    const contextKey = context.currentSection || '';

    // Combine message and context for the cache key
    return `${normalizedMessage}|${contextKey}`;
  }

  /**
   * Gets a cached response for a message if available
   * @param cacheKey The cache key
   * @returns The cached response or null if not found or expired
   */
  private getCachedResponse(cacheKey: string): string | null {
    const cachedItem = this.cache.get(cacheKey);

    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheExpiryTime) {
      return cachedItem.response;
    }

    return null;
  }

  /**
   * Caches a response for a message
   * @param cacheKey The cache key
   * @param response The assistant's response
   * @param context The context object
   */
  private cacheResponse(cacheKey: string, response: string, context?: Record<string, any>): void {
    this.cache.set(cacheKey, {
      question: cacheKey,
      response,
      timestamp: Date.now(),
      context
    });
  }

  /**
   * Normalizes a message for caching
   * @param message The message to normalize
   * @returns The normalized message
   */
  private normalizeMessage(message: string): string {
    // Convert to lowercase and remove extra whitespace
    return message.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Limits the response length to the maximum allowed
   * @param response The response to limit
   * @returns The limited response
   */
  private limitResponseLength(response: string): string {
    if (response.length <= this.maxResponseLength) {
      return response;
    }

    // Try to find a good breaking point (end of sentence) near the limit
    const searchWindow = Math.min(100, Math.floor(this.maxResponseLength * 0.2)); // Look for a period in the last 20% of the allowed text
    const searchStart = this.maxResponseLength - searchWindow;
    const searchEnd = this.maxResponseLength;

    const textToSearch = response.substring(searchStart, searchEnd);
    const lastPeriodIndex = textToSearch.lastIndexOf('.');

    if (lastPeriodIndex !== -1) {
      // Found a good breaking point
      return response.substring(0, searchStart + lastPeriodIndex + 1);
    }

    // No good breaking point found, just cut at the limit
    return response.substring(0, this.maxResponseLength);
  }

  /**
   * Clears expired items from the cache
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheExpiryTime) {
        this.cache.delete(key);
      }
    }
  }
}

// Create a singleton instance of the service
let enhancedAIAssistantServiceInstance: EnhancedAIAssistantService | null = null;

/**
 * Gets the singleton instance of the Enhanced AI Assistant Service
 * @param maxResponseLength Optional maximum length for responses in characters
 * @returns The Enhanced AI Assistant Service instance
 */
export function getEnhancedAIAssistantService(maxResponseLength?: number): EnhancedAIAssistantService {
  if (!enhancedAIAssistantServiceInstance) {
    enhancedAIAssistantServiceInstance = new EnhancedAIAssistantService(
      undefined, // Use default API key
      undefined, // Use default model
      undefined, // Use default temperature
      undefined, // Use default max tokens
      maxResponseLength // Use provided max response length or default
    );
  }
  return enhancedAIAssistantServiceInstance;
}