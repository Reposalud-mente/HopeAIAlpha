/**
 * Gemini API client for the RAG workflow
 */
import { GoogleGenAI } from '@google/genai';
import { RAGError } from '../types';

/**
 * Client for interacting with the Gemini API
 */
export class GeminiClient {
  private client: GoogleGenAI;
  private modelName: string;
  private temperature: number;
  private maxTokens: number;
  private topK: number;

  /**
   * Constructor
   * @param apiKey Gemini API key
   * @param modelName Gemini model name
   * @param temperature Temperature for text generation
   * @param maxTokens Maximum tokens for text generation
   * @param topK Top-K for text generation
   */
  constructor(
    apiKey: string,
    modelName: string = 'gemini-2.5-flash-preview-04-17',
    temperature: number = 0.7,
    maxTokens: number = 4096,
    topK: number = 3
  ) {
    if (!apiKey) {
      throw new RAGError('API key is required for GeminiClient', 'configuration');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.topK = topK;
  }

  /**
   * Generates text using the Gemini API
   * @param prompt The prompt text
   * @returns Promise resolving to the generated text
   */
  async generateText(prompt: string): Promise<string> {
    try {
      console.log('Initializing Gemini model...');
      // Generate content directly using the models API
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
          topK: this.topK,
        }
      });

      console.log('Received response from Gemini API');
      // Extract the text from the response
      if (!response) {
        throw new RAGError('No response from Gemini API', 'generation');
      }

      // Access the text property directly (not as a method)
      const text = response.text;

      if (!text) {
        throw new RAGError('No text generated from Gemini API', 'generation');
      }

      return text;
    } catch (error) {
      console.error('Error generating text with Gemini API:', error);
      throw new RAGError(
        `Failed to generate text with Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'generation'
      );
    }
  }

  /**
   * Streams text generation using the Gemini API
   * @param prompt The prompt text
   * @param onChunk Callback function for each chunk of generated text
   * @returns Promise resolving when the generation is complete
   */
  async streamText(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      console.log('Initializing Gemini model for streaming...');

      console.log('Starting content stream...');
      // Generate content stream directly using the models API
      const result = await this.client.models.generateContentStream({
        model: this.modelName,
        contents: prompt,
        config: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
          topK: this.topK,
        }
      });

      console.log('Processing stream chunks...');
      // Stream the response
      for await (const chunk of result) {
        if (chunk && chunk.text) {
          onChunk(chunk.text);
        }
      }

      console.log('Stream completed');
    } catch (error) {
      console.error('Error streaming text with Gemini API:', error);
      throw new RAGError(
        `Failed to stream text with Gemini API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'generation'
      );
    }
  }
}
