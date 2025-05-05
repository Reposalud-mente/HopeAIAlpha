/**
 * Enhanced AI Assistant Service for interacting with Gemini API
 * This service incorporates platform context and embodies the HopeAI spirit and values
 */
import { GoogleGenAI } from '@google/genai';
import { ENV } from '../RagAI/config';
import { getEnhancedSystemPrompt } from '@/prompts/enhanced_clinical_assistant_prompt';
import { getAIContext } from './context-gatherer';

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
  private cache: Map<string, CacheItem>;
  private cacheExpiryTime: number; // Cache expiry time in milliseconds
  private maxRetries: number;
  private retryDelay: number; // Retry delay in milliseconds

  /**
   * Constructor
   * @param apiKey Gemini API key
   * @param modelName Gemini model name
   * @param temperature Temperature for text generation
   * @param maxTokens Maximum tokens for text generation
   * @param cacheExpiryTime Cache expiry time in milliseconds (default: 1 hour)
   * @param maxRetries Maximum number of retries for failed API calls
   * @param retryDelay Delay between retries in milliseconds
   */
  constructor(
    apiKey: string = ENV.GEMINI_API_KEY,
    modelName: string = 'gemini-2.5-pro-exp-03-25', // Using the latest model
    temperature: number = 0.7,
    maxTokens: number = 2048,
    cacheExpiryTime: number = 60 * 60 * 1000, // 1 hour
    maxRetries: number = 3,
    retryDelay: number = 1000 // 1 second
  ) {
    if (!apiKey) {
      throw new Error('API key is required for EnhancedAIAssistantService');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.cache = new Map<string, CacheItem>();
    this.cacheExpiryTime = cacheExpiryTime;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Sends a message to the Gemini API and returns the response
   * @param message The user message
   * @param conversationHistory Previous messages in the conversation
   * @param contextParams Optional context parameters
   * @returns Promise resolving to the assistant's response
   */
  async sendMessage(
    message: string, 
    conversationHistory: Message[] = [],
    contextParams?: {
      currentSection?: string;
      currentPage?: string;
      patientId?: string;
    }
  ): Promise<string> {
    try {
      // Get platform context
      const context = contextParams 
        ? await getAIContext(
            contextParams.currentSection,
            contextParams.currentPage,
            contextParams.patientId
          )
        : {};
      
      // Generate cache key that includes context
      const cacheKey = this.generateCacheKey(message, context);
      
      // Check cache first
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('Using cached response');
        return cachedResponse;
      }

      // Prepare conversation history for context
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Get the enhanced system prompt with context
      const systemPrompt = getEnhancedSystemPrompt(context);

      // Prepare the prompt with conversation history
      let prompt = systemPrompt;
      
      if (conversationHistory.length > 0) {
        prompt += "\n\n# Historial de Conversación\n";
        conversationHistory.forEach(msg => {
          prompt += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
        });
      }
      
      prompt += `\nUsuario: ${message}\nAsistente:`;

      // Generate response with retries
      let response = await this.generateTextWithRetry(prompt);

      // Cache the response with context
      this.cacheResponse(cacheKey, response, context);

      return response;
    } catch (error) {
      console.error('Error sending message to Gemini API:', error);
      throw new Error(`Failed to get response from AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates text using the Gemini API with retry logic
   * @param prompt The prompt text
   * @returns Promise resolving to the generated text
   */
  private async generateTextWithRetry(prompt: string): Promise<string> {
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.maxRetries) {
      try {
        // Generate content using the models API
        const response = await this.client.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            temperature: this.temperature,
            maxOutputTokens: this.maxTokens,
          }
        });

        // Extract the text from the response
        if (!response) {
          throw new Error('No response from Gemini API');
        }

        const text = response.text;

        if (!text) {
          throw new Error('No text generated from Gemini API');
        }

        return text;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Attempt ${retries + 1} failed: ${lastError.message}`);
        
        // If we've reached max retries, throw the error
        if (retries >= this.maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        retries++;
      }
    }

    throw lastError || new Error('Failed to generate text after retries');
  }

  /**
   * Streams text generation using the Gemini API
   * @param message The user message
   * @param conversationHistory Previous messages in the conversation
   * @param onChunk Callback function for each chunk of generated text
   * @param contextParams Optional context parameters
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
    }
  ): Promise<void> {
    try {
      // Get platform context
      const context = contextParams 
        ? await getAIContext(
            contextParams.currentSection,
            contextParams.currentPage,
            contextParams.patientId
          )
        : {};

      // Prepare conversation history for context
      const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Get the enhanced system prompt with context
      const systemPrompt = getEnhancedSystemPrompt(context);

      // Prepare the prompt with conversation history
      let prompt = systemPrompt;
      
      if (conversationHistory.length > 0) {
        prompt += "\n\n# Historial de Conversación\n";
        conversationHistory.forEach(msg => {
          prompt += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
        });
      }
      
      prompt += `\nUsuario: ${message}\nAsistente:`;

      // Generate content stream
      const result = await this.client.models.generateContentStream({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        }
      });

      // Process the stream
      let fullResponse = '';
      for await (const chunk of result) {
        if (chunk && chunk.text) {
          onChunk(chunk.text);
          fullResponse += chunk.text;
        }
      }

      // Cache the full response
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
 * @returns The Enhanced AI Assistant Service instance
 */
export function getEnhancedAIAssistantService(): EnhancedAIAssistantService {
  if (!enhancedAIAssistantServiceInstance) {
    enhancedAIAssistantServiceInstance = new EnhancedAIAssistantService();
  }
  return enhancedAIAssistantServiceInstance;
}