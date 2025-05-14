/**
 * Context provider for the Enhanced AI Floating Assistant
 * Manages state and provides methods for interacting with the assistant
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/useAuth';
import { AssistantService } from '../core/assistant-service';
import { getClientContext } from '../context/context-gatherer';
import { tools, toolDeclarations } from '../tools';
import {
  Message,
  FunctionCall,
  FunctionResult,
  PlatformContext
} from '../types';

// Context type
interface AssistantContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  streamMessage: (content: string, contextParams?: any) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  startNewConversation: (title?: string) => void;
  addAssistantMessage: (content: string) => void;
  executeFunctionCall: (functionName: string, args: any) => Promise<any>;
  pendingFunctionCall: { name: string; args: any; id: string } | null;
  confirmPendingFunctionCall: () => Promise<void>;
  setPendingFunctionCall: (call: { name: string; args: any; id: string } | null) => void;
}

// Create context
const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

// Provider props
interface AssistantProviderProps {
  children: ReactNode;
  maxMessages?: number;
}

/**
 * Provider component for the AI Assistant context
 */
export function AssistantProvider({
  children,
  maxMessages = 50
}: AssistantProviderProps) {
  // State for messages, loading state, and errors
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFunctionCall, setPendingFunctionCall] = useState<{ name: string; args: any; id: string } | null>(null);

  // Get the user session from Supabase
  const { user } = useAuth();

  // Create the assistant service with tool declarations
  const assistantService = useMemo(() => {
    console.log('Creating AssistantService with tools:',
      toolDeclarations.map(tool => tool.name));

    return new AssistantService(
      {
        maxResponseLength: 500,
        enableFunctionCalling: true,
        temperature: 0.7, // Add temperature for more consistent responses
        modelName: 'gemini-2.0-flash' // Explicitly set the model
      },
      toolDeclarations
    );
  }, []);

  // Log available tools for debugging
  useEffect(() => {
    console.log('Available tools in AssistantProvider:',
      toolDeclarations.map(tool => tool.name));

    // Log the tools implementations for debugging
    console.log('Available tool implementations:',
      tools.map(tool => `${tool.declaration.name} (${tool.declaration.description})`));
  }, []);

  /**
   * Send a message to the assistant
   * @param content Message content
   */
  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to the conversation
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Get context
      const context = getClientContext(
        undefined,
        undefined,
        undefined,
        undefined,
        user?.user_metadata?.full_name || user?.email || undefined
      );

      // Send message to the assistant
      const response = await assistantService.sendMessage(
        content,
        messages,
        context,
        true
      );

      // Add assistant message to the conversation
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        functionCalls: response.functionCalls as FunctionCall[],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check for function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionCall = response.functionCalls[0];
        setPendingFunctionCall({
          name: functionCall.name,
          args: functionCall.args,
          id: functionCall.id,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Stream a message to the assistant
   * @param content Message content
   * @param contextParams Context parameters
   */
  const streamMessage = async (content: string, contextParams?: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to the conversation
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: new Date(),
      };

      // Add an empty assistant message that will be updated as chunks arrive
      const assistantMessageId = uuidv4();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);

      // Get context
      const context = getClientContext(
        contextParams?.currentSection,
        contextParams?.currentPage,
        contextParams?.patientId,
        contextParams?.patientName,
        user?.user_metadata?.full_name || user?.email || undefined
      );

      // Stream message to the assistant
      await assistantService.streamMessage(
        content,
        messages.slice(0, -1), // Exclude the empty assistant message
        (chunk: string) => {
          // Update the assistant message with the new chunk
          setMessages(prev => {
            const updatedMessages = [...prev];
            const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);

            if (assistantMessageIndex !== -1) {
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                content: updatedMessages[assistantMessageIndex].content + chunk,
              };
            }

            return updatedMessages;
          });
        },
        context,
        (functionCall: FunctionCall) => {
          // Update the assistant message with the function call
          setMessages(prev => {
            const updatedMessages = [...prev];
            const assistantMessageIndex = updatedMessages.findIndex(m => m.id === assistantMessageId);

            if (assistantMessageIndex !== -1) {
              updatedMessages[assistantMessageIndex] = {
                ...updatedMessages[assistantMessageIndex],
                functionCalls: [functionCall],
              };
            }

            return updatedMessages;
          });

          // Set the pending function call
          setPendingFunctionCall({
            name: functionCall.name,
            args: functionCall.args,
            id: functionCall.id,
          });
        },
        true
      );
    } catch (error) {
      console.error('Error streaming message:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all messages
   */
  const clearMessages = () => {
    setMessages([]);
    setPendingFunctionCall(null);
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Start a new conversation
   * @param title Optional title for the conversation
   */
  const startNewConversation = (title?: string) => {
    clearMessages();

    // Add a welcome message
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: title || '¡Hola! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?',
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
  };

  /**
   * Add an assistant message directly
   * @param content Message content
   */
  const addAssistantMessage = (content: string) => {
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  /**
   * Execute a function call
   * @param functionName Function name
   * @param args Function arguments
   */
  const executeFunctionCall = async (functionName: string, args: any) => {
    try {
      console.log(`Executing function call: ${functionName}`, args);

      // Find the tool implementation
      const tool = tools.find(t => t.declaration.name === functionName);

      if (!tool) {
        console.error(`Function not found: ${functionName}`);
        throw new Error(`Function not found: ${functionName}`);
      }

      console.log(`Found tool implementation for: ${functionName}`);

      // Validate arguments if possible
      let validatedArgs = args;
      try {
        validatedArgs = tool.implementation.validate(args);
        console.log('Arguments validated successfully');
      } catch (validationError) {
        console.warn('Argument validation failed:', validationError);
        // Continue with original args
      }

      // Execute the function
      console.log(`Executing ${functionName} with args:`, validatedArgs);
      const result = await tool.implementation.execute(validatedArgs, user?.id || '');
      console.log(`Function ${functionName} executed successfully:`, result);

      return result;
    } catch (error) {
      console.error('Error executing function call:', error);
      throw error;
    }
  };

  /**
   * Confirm and execute the pending function call
   */
  const confirmPendingFunctionCall = async () => {
    if (!pendingFunctionCall) {
      console.log('No pending function call to execute');
      return;
    }

    try {
      console.log('Confirming pending function call:', pendingFunctionCall);
      setIsLoading(true);

      // Execute the function
      const result = await executeFunctionCall(
        pendingFunctionCall.name,
        pendingFunctionCall.args
      );

      console.log('Function execution result:', result);

      // Add the function result to the message
      setMessages(prev => {
        const updatedMessages = [...prev];
        const lastAssistantMessageIndex = [...updatedMessages].reverse().findIndex(m => m.role === 'assistant');

        if (lastAssistantMessageIndex !== -1) {
          const actualIndex = updatedMessages.length - 1 - lastAssistantMessageIndex;
          console.log(`Updating message at index ${actualIndex} with function result`);

          // Check if functionResults already exists
          const existingResults = updatedMessages[actualIndex].functionResults || [];

          updatedMessages[actualIndex] = {
            ...updatedMessages[actualIndex],
            functionResults: [
              ...existingResults,
              {
                callId: pendingFunctionCall.id,
                result,
              },
            ],
          };
        } else {
          console.warn('No assistant message found to update with function result');
        }

        return updatedMessages;
      });

      // Add a message with the function result
      const resultMessage = `Acción completada: ${result.message || 'La acción se ha completado con éxito.'}`;
      addAssistantMessage(resultMessage);

      // Clear the pending function call
      setPendingFunctionCall(null);
    } catch (error) {
      console.error('Error confirming function call:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');

      // Add an error message
      addAssistantMessage(`Lo siento, ha ocurrido un error al ejecutar la acción: ${error instanceof Error ? error.message : 'Error desconocido'}`);

      // Clear the pending function call
      setPendingFunctionCall(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the conversation when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      startNewConversation();
    }
  }, []);

  // Create the context value
  const contextValue: AssistantContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    streamMessage,
    clearMessages,
    clearError,
    startNewConversation,
    addAssistantMessage,
    executeFunctionCall,
    pendingFunctionCall,
    confirmPendingFunctionCall,
    setPendingFunctionCall,
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
}

/**
 * Hook to use the AI Assistant context
 */
export function useAssistant() {
  const context = useContext(AssistantContext);

  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }

  return context;
}
