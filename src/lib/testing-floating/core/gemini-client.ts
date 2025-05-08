/**
 * Core Gemini API client for the Enhanced AI Floating Assistant
 * Handles communication with the Gemini API
 */

import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  HarmCategory,
  HarmBlockThreshold,
  GenerationConfig,
} from '@google/genai';
import { createConfig } from '../config';
import { AssistantConfig, Message, ToolDeclaration } from '../types';

/**
 * GeminiClient class for interacting with the Gemini API
 */
export class GeminiClient {
  private client: GoogleGenAI;
  private config: AssistantConfig;

  /**
   * Constructor for the GeminiClient
   * @param config Configuration options
   */
  constructor(config?: Partial<AssistantConfig>) {
    this.config = createConfig(config || {});

    if (!this.config.apiKey) {
      throw new Error('API key is required for GeminiClient');
    }

    console.log(`Initializing Gemini client with model: ${this.config.modelName}`);

    // Initialize the Google GenAI client with the API key
    this.client = new GoogleGenAI({ apiKey: this.config.apiKey });

    // Log API key status (not the actual key for security)
    console.log(`API key status: ${this.config.apiKey ? 'Provided' : 'Missing'}`);
    console.log(`API key length: ${this.config.apiKey?.length || 0} characters`);
  }

  /**
   * Generate content using the Gemini API
   * @param prompt The prompt to send to the API
   * @param systemInstruction System instruction for the model
   * @param history Conversation history
   * @param tools Tool declarations for function calling
   * @returns The generated content
   */
  async generateContent(
    prompt: string,
    systemInstruction?: string,
    history?: Message[],
    tools?: ToolDeclaration[]
  ) {
    try {
      // Convert history to the format expected by the API
      const formattedHistory = this.formatHistory(history || []);

      // Create generation config
      const generationConfig: GenerationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topK: 40,
        topP: 0.95,
      };

      // Create safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Create contents array with history and prompt
      let contents = [
        ...formattedHistory,
        { role: 'user', parts: [{ text: prompt }] },
      ];

      // Create model config
      const modelConfig: any = {
        generationConfig,
        safetySettings,
      };

      // Add system instruction if provided
      if (systemInstruction) {
        // Log the system instruction for debugging
        console.log('System instruction (first 100 chars):',
          systemInstruction.substring(0, 100) + '...');

        // For Gemini API, we need to add the system instruction as a user message
        // since "system" role is not supported
        contents.unshift({
          role: 'user',
          parts: [{ text: "SYSTEM INSTRUCTIONS (FOLLOW THESE EXACTLY): " + systemInstruction }]
        });

        // Add a model response to acknowledge the system instructions
        contents.unshift({
          role: 'model',
          parts: [{ text: "I'll follow these instructions carefully." }]
        });
      }

      // Add tools if provided and function calling is enabled
      if (tools && tools.length > 0 && this.config.enableFunctionCalling) {
        // Log tools being used
        console.log('Using tools in generateContent:', tools.map(t => t.name));
        console.log('Tool details:', tools.map(t => ({
          name: t.name,
          description: t.description,
          requiredParams: t.parameters.required
        })));

        // Make sure tools are properly formatted for the Gemini API
        const formattedTools = tools.map(tool => {
          // Ensure the tool has all required properties
          return {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: tool.parameters.type,
              properties: tool.parameters.properties,
              required: tool.parameters.required || []
            }
          };
        });

        // Log the formatted tools for debugging
        console.log('Formatted tools (first tool):',
          formattedTools.length > 0 ? JSON.stringify(formattedTools[0], null, 2) : 'No tools');

        modelConfig.tools = [{
          functionDeclarations: formattedTools,
        }];
        modelConfig.toolConfig = {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        };
      } else {
        console.log('No tools provided or function calling disabled');
      }

      // Generate content
      const result = await this.client.models.generateContent({
        model: this.config.modelName,
        contents,
        ...modelConfig,
      });

      return result;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  /**
   * Generate content stream using the Gemini API
   * @param prompt The prompt to send to the API
   * @param systemInstruction System instruction for the model
   * @param history Conversation history
   * @param tools Tool declarations for function calling
   * @returns The generated content stream
   */
  async generateContentStream(
    prompt: string,
    systemInstruction?: string,
    history?: Message[],
    tools?: ToolDeclaration[]
  ) {
    try {
      // Convert history to the format expected by the API
      const formattedHistory = this.formatHistory(history || []);

      // Create generation config
      const generationConfig: GenerationConfig = {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
        topK: 40,
        topP: 0.95,
      };

      // Create safety settings
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Create contents array with history and prompt
      let contents = [
        ...formattedHistory,
        { role: 'user', parts: [{ text: prompt }] },
      ];

      // Create model config
      const modelConfig: any = {
        generationConfig,
        safetySettings,
      };

      // Add system instruction if provided
      if (systemInstruction) {
        // Log the system instruction for debugging
        console.log('System instruction for stream (first 100 chars):',
          systemInstruction.substring(0, 100) + '...');

        // For Gemini API, we need to add the system instruction as a user message
        // since "system" role is not supported
        contents.unshift({
          role: 'user',
          parts: [{ text: "SYSTEM INSTRUCTIONS (FOLLOW THESE EXACTLY): " + systemInstruction }]
        });

        // Add a model response to acknowledge the system instructions
        contents.unshift({
          role: 'model',
          parts: [{ text: "I'll follow these instructions carefully." }]
        });
      }

      // Add tools if provided and function calling is enabled
      if (tools && tools.length > 0 && this.config.enableFunctionCalling) {
        // Log tools being used
        console.log('Using tools in generateContentStream:', tools.map(t => t.name));

        // Make sure tools are properly formatted for the Gemini API
        const formattedTools = tools.map(tool => {
          // Ensure the tool has all required properties
          return {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: tool.parameters.type,
              properties: tool.parameters.properties,
              required: tool.parameters.required || []
            }
          };
        });

        // Log the formatted tools for debugging
        console.log('Formatted tools for stream (first tool):',
          formattedTools.length > 0 ? JSON.stringify(formattedTools[0], null, 2) : 'No tools');

        modelConfig.tools = [{
          functionDeclarations: formattedTools,
        }];
        modelConfig.toolConfig = {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          },
        };
      } else {
        console.log('No tools provided or function calling disabled for stream');
      }

      // Generate content stream
      const result = await this.client.models.generateContentStream({
        model: this.config.modelName,
        contents,
        ...modelConfig,
      });

      return result;
    } catch (error) {
      console.error('Error generating content stream:', error);
      throw error;
    }
  }

  /**
   * Format conversation history for the Gemini API
   * @param history Conversation history
   * @returns Formatted history
   */
  private formatHistory(history: Message[]) {
    return history.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));
  }
}
