"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Message, getAIAssistantService } from '@/lib/ai-assistant/ai-assistant-service';
import { getConversationSessionManager } from '@/lib/ai-assistant/conversation-session-manager';
import { generateUniqueId } from '@/lib/utils/id-generator';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/lib/logger';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';

// Define the context type
interface AIAssistantContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  streamMessage: (content: string, contextParams?: any) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  startNewConversation: (title?: string) => void;
  addAssistantMessage: (content: string) => void; // Add this function to add assistant messages directly
  executeFunctionCall: (functionName: string, args: any) => Promise<any>; // Execute a function call
  pendingFunctionCall: { name: string; args: any } | null; // Track pending function calls
  confirmPendingFunctionCall: () => Promise<void>; // Confirm and execute pending function call
  setPendingFunctionCall: (call: { name: string; args: any } | null) => void; // Set or clear pending function call
  memories: any[]; // Add memories from mem0.ai
  isLoadingMemories: boolean; // Loading state for memories
  refreshMemories: () => Promise<void>; // Function to refresh memories
}

// Create the context
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Props for the context provider
interface AIAssistantProviderProps {
  children: ReactNode;
  maxMessages?: number;
}

/**
 * Provider component for the AI Assistant context
 */
export function AIAssistantProvider({
  children,
  maxMessages = 50
}: AIAssistantProviderProps) {
  // State for messages, loading state, and errors
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State for pending function calls
  const [pendingFunctionCall, setPendingFunctionCall] = useState<{ name: string; args: any } | null>(null);

  // State for memories from mem0.ai
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState<boolean>(false);

  // Get the enhanced AI Assistant service with a maximum response length of 500 characters
  const aiService = getAIAssistantService(500); // Limit responses to 500 characters

  // Get the auth session to monitor for changes using Supabase
  const { user, loading: authLoading, error: authError } = useAuth();

  // Get the user ID from the session
  const userId = user?.id || user?.email || '';

  // Get the conversation session manager with the user ID
  const sessionManager = getConversationSessionManager(userId);

  // Track whether we've loaded the initial session
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // Function to refresh memories
  const refreshMemories = async () => {
    if (!userId) return;

    setIsLoadingMemories(true);
    try {
      const mem0Service = getMem0Service();
      const userMemories = await mem0Service.getAllMemories(userId);
      setMemories(userMemories);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoadingMemories(false);
    }
  };

  // Load memories when the user ID changes
  useEffect(() => {
    if (userId && !authLoading) {
      refreshMemories();
    }
  }, [userId, authLoading]);

  // Load messages from the active session on mount
  useEffect(() => {
    if (!sessionLoaded && user) {
      // Get the active session or create a new one if none exists
      let activeSession = sessionManager.getActiveSession();
      if (!activeSession) {
        activeSession = sessionManager.createSession();
      }

      // Log for debugging
      console.log('Loading session with messages:', activeSession.messages.length);

      // Set the messages from the active session
      // Make sure to create a deep copy to avoid reference issues
      const loadedMessages = activeSession.messages.map(msg => ({
        ...msg,
        // Ensure IDs are in the correct format
        id: msg.id.includes('_') ? msg.id : generateUniqueId(msg.role)
      }));

      setMessages(loadedMessages);

      // Mark session as loaded
      setSessionLoaded(true);
    }
  }, [sessionLoaded, user, sessionManager]);

  // Clear messages when user logs out
  useEffect(() => {
    if (!user && !authLoading) {
      // Clear messages when user is not authenticated
      setMessages([]);
      setSessionLoaded(false);
    }
  }, [user, authLoading]);

  // Update the session manager when messages change with enhanced persistence
  useEffect(() => {
    if (messages.length > 0) {
      // Get the active session
      const activeSession = sessionManager.getActiveSession();
      if (activeSession) {
        // Create a deep copy of the messages to ensure all properties are properly saved
        const messagesToSave = messages.map(msg => ({
          ...msg,
          id: msg.id.includes('_') ? msg.id : generateUniqueId(msg.role)
        }));

        // Replace all messages in the active session
        activeSession.messages = messagesToSave;

        // Update the session's timestamp to trigger a save
        activeSession.updatedAt = new Date();

        // Use the new direct save method to ensure messages are saved
        sessionManager.saveActiveSession();

        // Log for debugging
        logger.info('Saved messages to session', {
          messageCount: messagesToSave.length,
          sessionId: activeSession.id,
          sessionTitle: activeSession.title
        });

        // Store the last message timestamp for context awareness
        if (messagesToSave.length > 0) {
          try {
            localStorage.setItem('ai_assistant_last_message_time', new Date().toISOString());
          } catch (error) {
            logger.error('Error saving last message timestamp', { error });
          }
        }
      }
    }
  }, [messages]);

  /**
   * Starts a new conversation
   * @param title Optional title for the new conversation
   */
  const startNewConversation = (title?: string) => {
    // Create a new session
    sessionManager.createSession(title);

    // Update the messages state
    setMessages([]);
  };

  /**
   * Sends a message to the AI Assistant and adds the response to the messages
   * @param content The message content
   */
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: generateUniqueId('user'),
      role: 'user',
      content
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = messages.slice(-20);

      const response = await aiService.sendMessage(
        content,
        conversationHistory,
        {
          currentSection: window.location.pathname.split('/')[1] || undefined,
          currentPage: window.location.pathname.split('/')[2] || undefined,
          userName: user?.user_metadata?.full_name || user?.email || undefined,
          userId: userId, // Add userId for memory integration
          // cacheId has been removed
        }
      );

      // cacheId is no longer returned by the V2 service or stored.

      // Check for function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        // Handle function calls
        for (const functionCall of response.functionCalls) {
          // Determine if this function call requires confirmation
          const requiresConfirmation = ['schedule_session', 'create_reminder', 'generate_report'].includes(functionCall.name);

          if (requiresConfirmation) {
            // Set the pending function call
            setPendingFunctionCall({
              name: functionCall.name,
              args: functionCall.args
            });

            // Create a message asking for confirmation
            const confirmationMessage: Message = {
              id: generateUniqueId('assistant'),
              role: 'assistant',
              content: `Voy a ejecutar ${functionCall.name} con los siguientes parámetros: ${JSON.stringify(functionCall.args)}. ¿Confirmas esta acción?`
            };
            setMessages(prevMessages => [...prevMessages, confirmationMessage]);
            setIsLoading(false); // Stop loading while waiting for user confirmation

          } else {
            // For functions that don't require confirmation (like search_patients), execute immediately
            const executingMessage: Message = {
              id: generateUniqueId('assistant'),
              role: 'assistant',
              content: `Ejecutando ${functionCall.name}...`
            };
            setMessages(prevMessages => [...prevMessages, executingMessage]);
            setIsLoading(true); // Ensure loading is true while executing and waiting for AI

            try {
              const toolResult = await executeFunctionCall(functionCall.name, functionCall.args);

              // Placeholder for the AI's message that contained the function call.
              // This part needs to be correctly structured based on what aiService.sendMessage's `response.functionCalls` provides.
              // For now, we'll construct a basic representation.
              const aiFunctionCallInitiationMessage: Message = {
                id: generateUniqueId('assistant'), // This ID represents the AI's turn when it decided to call the function
                role: 'assistant',
                // The content here should ideally be the `parts` array from the AI's response that included the functionCall.
                // Storing it simply as a string for history might be lossy.
                // For robust history, the exact 'Content' object from the AI's function-calling turn should be preserved.
                content: `[AI decided to call ${functionCall.name} with args: ${JSON.stringify(functionCall.args)}]`
              };

              const historyForFunctionResponseProcessing = [
                ...messages, // History before the current user's message
                userMessage, // The current user's message that triggered the AI
                aiFunctionCallInitiationMessage // The AI's "message" that was the function call
              ];

              // TODO: Refactor aiService.sendMessage or add a new method (e.g., aiService.sendFunctionResult)
              // to properly send the `toolResult` back to the Gemini API as a FunctionResponsePart.
              // The current aiService.sendMessage(string, ...) is not suitable for this.
              // The call below is a placeholder and will likely NOT work as intended for sending function results.

              // For now, we will add the raw tool result to the chat for the user to see,
              // but the AI will remain "stuck" as it doesn't get this result back.
              // This addresses the linter errors but not the core "AI waiting" issue.

              const toolResultMessageForUI: Message = {
                id: generateUniqueId('assistant'),
                role: 'assistant',
                content: `Resultado de ${functionCall.name}: ${toolResult.message || JSON.stringify(toolResult)}`
              };
              setMessages(prevMessages => [...prevMessages, toolResultMessageForUI]);

              // Send the function result back to the AI for processing
              try {
                const finalAiResponse = await aiService.sendFunctionResult(
                  functionCall.name,
                  toolResult,
                  historyForFunctionResponseProcessing,
                  { userName: user?.user_metadata?.full_name || user?.email || undefined }
                );

                if (finalAiResponse.text) {
                  const assistantResponseMessage: Message = {
                    id: generateUniqueId('assistant'),
                    role: 'assistant',
                    content: finalAiResponse.text
                  };
                  setMessages(prevMessages => [...prevMessages, assistantResponseMessage]);
                }
              } catch (aiResponseError) {
                logger.error('Error getting AI response for function result:', {
                  error: aiResponseError instanceof Error ? aiResponseError.message : 'Unknown error',
                  stack: aiResponseError instanceof Error ? aiResponseError.stack : undefined,
                  functionName: functionCall.name
                });

                // Add an error message to the chat
                const errorMessage: Message = {
                  id: generateUniqueId('assistant'),
                  role: 'assistant',
                  content: 'Lo siento, tuve un problema al procesar el resultado de la acción. ¿Puedo ayudarte con algo más?'
                };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
              }

            } catch (toolError) {
              console.error('Error executing function call:', toolError);
              setError(toolError instanceof Error ? toolError.message : 'Error desconocido');
            }
          }
        }
      }

      // Create a new assistant message with a unique ID for the text response
      if (response.text) {
        const assistantMessage: Message = {
          id: generateUniqueId('assistant'),
          role: 'assistant',
          content: response.text
        };

        // Add the assistant message to the messages
        setMessages(prevMessages => {
          // Limit the number of messages
          const newMessages = [...prevMessages, assistantMessage];
          if (newMessages.length > maxMessages) {
            return newMessages.slice(-maxMessages);
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Detects and handles platform actions in AI responses
   * @param content The AI response content
   * @returns The processed content with actions handled
   */
  const detectAndHandleActions = async (content: string): Promise<string> => {
    // Look for action patterns in the response
    // Format: {{action:type|param1=value1|param2=value2}}
    const actionPattern = /\{\{action:(.*?)\}\}/g;
    const match = actionPattern.exec(content);

    if (match && match[1]) {
      try {
        // Parse the action string
        const actionStr = match[1];
        const [actionType, ...paramParts] = actionStr.split('|');

        // Parse parameters
        const params: Record<string, any> = {};
        paramParts.forEach(part => {
          const [key, value] = part.split('=');
          if (key && value) {
            params[key] = value;
          }
        });

        // Create the action object
        const action: any = {
          type: actionType,
          params
        };

        // Here you would execute the action
        // For now, we'll just log it
        console.log('Detected action:', action);

        // Remove the action pattern from the content
        return content.replace(match[0], `[Acción: ${actionType}]`);
      } catch (error) {
        console.error('Error handling action:', error);
        return content;
      }
    }

    return content;
  };

  /**
   * Streams a message to the AI Assistant and updates the response incrementally
   * Enhanced with advanced context management
   * @param content The message content
   * @param inputContextParams Optional context parameters
   */
  const streamMessage = async (content: string, inputContextParams?: any) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: generateUniqueId('user'),
      role: 'user',
      content
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = messages.slice(-20);

      let tempAssistantMessageId: string | null = null;
      let fullResponse = '';
      let functionCallData: any | null = null;

      await aiService.streamMessage(
        content,
        conversationHistory,
        (chunk: string) => {
          setMessages((prevMessages) => {
            if (tempAssistantMessageId === null) {
              tempAssistantMessageId = generateUniqueId('assistant');
              return [
                ...prevMessages,
                { id: tempAssistantMessageId, role: 'assistant', content: chunk },
              ];
            } else {
              return prevMessages.map((msg) =>
                msg.id === tempAssistantMessageId
                  ? { ...msg, content: msg.content + chunk }
                  : msg
              );
            }
          });
        },
        {
          currentSection: window.location.pathname.split('/')[1] || undefined,
          currentPage: window.location.pathname.split('/')[2] || undefined,
          userName: user?.user_metadata?.full_name || user?.email || undefined,
          userId: userId, // Add userId for memory integration
          ...inputContextParams
        },
        (functionCall: any) => {
          if (functionCall) {
            logger.info('Function call received in stream', { functionCall });
            functionCallData = functionCall; // Store function call data
            // Do not add function call message here; wait for stream to complete
          }
        },
        true // enableFunctionCalling
      );

      // Handle function calls after stream completes
      if (functionCallData) {
        // Handle function calls
        for (const functionCall of functionCallData) {
          // Determine if this function call requires confirmation
          const requiresConfirmation = ['schedule_session', 'create_reminder', 'generate_report'].includes(functionCall.name);

          if (requiresConfirmation) {
            // Set the pending function call
            setPendingFunctionCall({
              name: functionCall.name,
              args: functionCall.args
            });

            // Create a message asking for confirmation
            const confirmationMessage: Message = {
              id: generateUniqueId('assistant'),
              role: 'assistant',
              content: `Ejecutando: ${functionCall.name}...`
            };

            // Add the confirmation message
            setMessages(prevMessages => [...prevMessages, confirmationMessage]);
          } else {
            // For functions that don't require confirmation (like search_patients), execute immediately

            // Create a more detailed executing message
            const functionCallMessage: Message = {
              id: generateUniqueId('assistant'),
              role: 'assistant',
              content: `Ejecutando: ${functionCall.name}${functionCall.name === 'search_patients' ?
                ` con búsqueda "${functionCall.args.query || ''}"` :
                ''}...`
            };

            // Add the function call message
            setMessages(prevMessages => [...prevMessages, functionCallMessage]);

            // Log the function call for debugging
            logger.info('Executing function call in streamMessage', {
              functionName: functionCall.name,
              args: functionCall.args
            });

            try {
              // Execute the function call
              const result = await executeFunctionCall(functionCall.name, functionCall.args);

              // Create a message for the function result
              const functionResultMessage: Message = {
                id: generateUniqueId('assistant'),
                role: 'assistant',
                content: `Resultado: ${result.message || JSON.stringify(result)}`
              };

              // Add the function result message
              setMessages(prevMessages => {
                // Limit the number of messages
                const newMessages = [...prevMessages, functionResultMessage];
                if (newMessages.length > maxMessages) {
                  return newMessages.slice(-maxMessages);
                }
                return newMessages;
              });

              // Prepare history for function response processing
              const userMessage: Message = {
                id: generateUniqueId('user'),
                role: 'user',
                content: message
              };

              // Placeholder for the AI's message that contained the function call
              const aiFunctionCallInitiationMessage: Message = {
                id: generateUniqueId('assistant'),
                role: 'assistant',
                content: `[AI decided to call ${functionCall.name} with args: ${JSON.stringify(functionCall.args)}]`
              };

              const historyForFunctionResponseProcessing = [
                ...conversationHistory, // History before the current user's message
                userMessage, // The current user's message that triggered the AI
                aiFunctionCallInitiationMessage // The AI's "message" that was the function call
              ];

              // Send the function result back to the AI for processing
              try {
                const finalAiResponse = await aiService.sendFunctionResult(
                  functionCall.name,
                  result,
                  historyForFunctionResponseProcessing,
                  { userName: user?.user_metadata?.full_name || user?.email || undefined }
                );

                if (finalAiResponse.text) {
                  const assistantResponseMessage: Message = {
                    id: generateUniqueId('assistant'),
                    role: 'assistant',
                    content: finalAiResponse.text
                  };
                  setMessages(prevMessages => {
                    // Limit the number of messages
                    const newMessages = [...prevMessages, assistantResponseMessage];
                    if (newMessages.length > maxMessages) {
                      return newMessages.slice(-maxMessages);
                    }
                    return newMessages;
                  });
                }
              } catch (aiResponseError) {
                logger.error('Error getting AI response for function result in streamMessage:', {
                  error: aiResponseError instanceof Error ? aiResponseError.message : 'Unknown error',
                  stack: aiResponseError instanceof Error ? aiResponseError.stack : undefined,
                  functionName: functionCall.name
                });
              }
            } catch (error) {
              console.error('Error executing function call:', error);

              // Create an error message
              const errorMessage: Message = {
                id: generateUniqueId('assistant'),
                role: 'assistant',
                content: `Error al ejecutar ${functionCall.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`
              };

              // Add the error message
              setMessages(prevMessages => [...prevMessages, errorMessage]);
            }
          }
        }
      }

      // Create a new assistant message with a unique ID for the text response
      if (fullResponse) {
        const assistantMessage: Message = {
          id: generateUniqueId('assistant'),
          role: 'assistant',
          content: fullResponse
        };

        // Add the assistant message to the messages
        setMessages(prevMessages => {
          // Limit the number of messages
          const newMessages = [...prevMessages, assistantMessage];
          if (newMessages.length > maxMessages) {
            return newMessages.slice(-maxMessages);
          }
          return newMessages;
        });
      }
    } catch (err) {
      logger.error('Error streaming message:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });

      setError(err instanceof Error ? err.message : 'Failed to stream response from AI');

      // Remove the placeholder message if it exists
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.role !== 'assistant' || msg.content !== '')
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears all messages
   */
  const clearMessages = () => {
    setMessages([]);
    // Clear the active session messages
    sessionManager.clearActiveSessionMessages();
  };

  /**
   * Clears the error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Adds a message directly from the assistant
   * @param content The message content
   */
  const addAssistantMessage = (content: string) => {
    // Create a new assistant message with a unique ID
    const assistantMessage: Message = {
      id: generateUniqueId('assistant'),
      role: 'assistant',
      content
    };

    // Check if we already have this greeting message to avoid duplication
    // This prevents duplicate greetings when the component re-renders
    const hasGreeting = messages.some(msg =>
      msg.role === 'assistant' &&
      msg.content.includes('Soy HopeAI') &&
      content.includes('Soy HopeAI')
    );

    // Also check if there's a greeting in the session manager
    const activeSession = sessionManager.getActiveSession();
    const hasGreetingInSession = activeSession?.messages.some(msg =>
      msg.role === 'assistant' &&
      msg.content.includes('Soy HopeAI') &&
      content.includes('Soy HopeAI')
    );

    // Only add the greeting if it doesn't exist in the current messages or in the session
    if (!hasGreeting && !hasGreetingInSession) {
      console.log('Adding assistant message:', content.substring(0, 30) + '...');

      // If this is a new conversation or we don't have a greeting yet
      if (messages.length === 0) {
        // Add the assistant message as the first message
        setMessages([assistantMessage]);
      } else {
        // Add to existing messages
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }

      // The useEffect hook that tracks message changes will handle saving to localStorage
    }
  };

  /**
   * Executes a function call from the AI assistant
   * @param functionName The name of the function to execute
   * @param args The arguments for the function
   * @returns The result of the function execution
   */
  const executeFunctionCall = async (functionName: string, args: any): Promise<any> => {
    try {
      // Log the function call
      console.log(`Executing function call: ${functionName}`, args);

      // Show a toast notification
      toast({
        title: "Ejecutando acción",
        description: `${functionName}: ${JSON.stringify(args)}`,
        duration: 3000,
      });

      // Validate function name
      const validFunctions = ['schedule_session', 'create_reminder', 'search_patients', 'list_patients', 'generate_report'];

      // Handle special cases - map aliases to their actual functions
      if (functionName === 'print' || functionName === 'list_patients') {
        logger.info(`Mapping ${functionName} function to search_patients`, { args });
        functionName = 'search_patients';

        // For list_patients, if no query is provided, set it to empty string to list all patients
        if (functionName === 'list_patients' && (!args.query || args.query.trim() === '')) {
          args.query = '*';
        }
      }

      // Fix for the "tool_code" placeholder issue
      if (functionName === 'search_patients' && args.query === 'tool_code') {
        // Get the last user message to extract the actual search query
        const lastUserMessage = messages.findLast(msg => msg.role === 'user');
        if (lastUserMessage) {
          // Extract potential name from the user message
          const userText = lastUserMessage.content.toLowerCase();

          // Look for patterns like "buscar paciente [name]" or "pacientes llamados [name]"
          let extractedName = '';

          // Common patterns in Spanish
          if (userText.includes('llamado') || userText.includes('llamada')) {
            const match = userText.match(/llamad[oa][s]?\s+([a-zñáéíóúü]+(\s+[a-zñáéíóúü]+)?)/i);
            if (match && match[1]) extractedName = match[1];
          } else if (userText.includes('nombre')) {
            const match = userText.match(/nombre\s+([a-zñáéíóúü]+(\s+[a-zñáéíóúü]+)?)/i);
            if (match && match[1]) extractedName = match[1];
          } else if (userText.includes('buscar') || userText.includes('busca')) {
            const match = userText.match(/busc[ar]\s+([a-zñáéíóúü]+(\s+[a-zñáéíóúü]+)?)/i);
            if (match && match[1]) extractedName = match[1];
          } else {
            // Try to find any name after common words
            const words = userText.split(/\s+/);
            for (let i = 0; i < words.length; i++) {
              if (['paciente', 'pacientes', 'cliente', 'clientes', 'persona', 'personas'].includes(words[i])) {
                if (i + 1 < words.length && words[i + 1].length > 2) {
                  extractedName = words[i + 1];
                  // If the next word starts with a capital letter, it's likely a name
                  if (extractedName.charAt(0) === extractedName.charAt(0).toUpperCase()) {
                    break;
                  }
                }
              }
            }
          }

          // If we found a name, use it instead of "tool_code"
          if (extractedName) {
            logger.info(`Replacing "tool_code" with extracted name "${extractedName}"`, { originalQuery: args.query });
            args.query = extractedName;
          } else {
            // If we couldn't extract a specific name, use an empty query to list all patients
            logger.info(`Replacing "tool_code" with empty query to list all patients`, { originalQuery: args.query });
            args.query = '*';
          }
        }
      }

      if (!validFunctions.includes(functionName)) {
        throw new Error(`Función no reconocida: ${functionName}`);
      }

      // Make an API request to execute the function
      const response = await fetch('/api/ai-tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName,
          args,
        }),
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} ${errorText}`);
      }

      // Parse the response
      const result = await response.json();

      // Show a toast notification with the result
      toast({
        title: result.success ? "Acción completada" : "Error en la acción",
        description: result.message,
        variant: result.success ? "default" : "destructive",
        duration: 3000,
      });

      return result;
    } catch (error) {
      console.error(`Error executing function call ${functionName}:`, error);

      // Show an error toast
      toast({
        title: "Error en la acción",
        description: `No se pudo ejecutar ${functionName}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
        duration: 3000,
      });

      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  };

  /**
   * Confirms and executes a pending function call
   * This is used when the user confirms a function call with "procede", "confirma", etc.
   */
  const confirmPendingFunctionCall = async (): Promise<void> => {
    if (!pendingFunctionCall) {
      // No pending function call to execute
      return;
    }

    try {
      // Get the function call details
      const { name, args } = pendingFunctionCall;

      // Fix for the "tool_code" placeholder issue
      if (name === 'search_patients' && args.query === 'tool_code') {
        // Find the user message that triggered this function call
        const userMessages = messages.filter(msg => msg.role === 'user');
        if (userMessages.length > 0) {
          // Get the last user message before the confirmation
          const lastUserMessage = userMessages[userMessages.length - 2]; // Skip the confirmation message
          if (lastUserMessage) {
            // Extract potential name from the user message
            const userText = lastUserMessage.content.toLowerCase();

            // Look for patterns like "buscar paciente [name]" or "pacientes llamados [name]"
            let extractedName = '';

            // Common patterns in Spanish
            if (userText.includes('llamado') || userText.includes('llamada')) {
              const match = userText.match(/llamad[oa][s]?\s+([a-zñáéíóúü]+(\s+[a-zñáéíóúü]+)?)/i);
              if (match && match[1]) extractedName = match[1];
            } else if (userText.includes('nombre')) {
              const match = userText.match(/nombre\s+([a-zñáéíóúü]+(\s+[a-zñáéíóúü]+)?)/i);
              if (match && match[1]) extractedName = match[1];
            } else if (userText.includes('buscar') || userText.includes('busca')) {
              const match = userText.match(/busc[ar]\s+([a-zñáéíóúü]+(\s+[a-zñáéíóúü]+)?)/i);
              if (match && match[1]) extractedName = match[1];
            } else {
              // Try to find any name after common words
              const words = userText.split(/\s+/);
              for (let i = 0; i < words.length; i++) {
                if (['paciente', 'pacientes', 'cliente', 'clientes', 'persona', 'personas'].includes(words[i])) {
                  if (i + 1 < words.length && words[i + 1].length > 2) {
                    extractedName = words[i + 1];
                    // If the next word starts with a capital letter, it's likely a name
                    if (extractedName.charAt(0) === extractedName.charAt(0).toUpperCase()) {
                      break;
                    }
                  }
                }
              }
            }

            // If we found a name, use it instead of "tool_code"
            if (extractedName) {
              logger.info(`Replacing "tool_code" with extracted name "${extractedName}" in confirmPendingFunctionCall`, { originalQuery: args.query });
              args.query = extractedName;
            } else {
              // If we couldn't extract a specific name, use an empty query to list all patients
              logger.info(`Replacing "tool_code" with empty query to list all patients in confirmPendingFunctionCall`, { originalQuery: args.query });
              args.query = '*';
            }
          }
        }
      }

      // Create a message for the function call confirmation
      const confirmationMessage: Message = {
        id: generateUniqueId('assistant'),
        role: 'assistant',
        content: `Ejecutando: ${name}...`
      };

      // Add the confirmation message
      setMessages(prevMessages => [...prevMessages, confirmationMessage]);

      // Execute the function call
      const result = await executeFunctionCall(name, args);

      // Format the result for display
      let formattedResult = '';

      // Handle search_patients result specifically to format it nicely
      if (name === 'search_patients' && result.success && result.patients) {
        // Add metadata to the result for better visualization
        const enhancedResult = {
          ...result,
          _meta: {
            functionName: name,
            timestamp: new Date().toISOString(),
            resultType: 'patient_search'
          }
        };

        // Use the enhanced result as JSON for the visualizer to parse
        formattedResult = JSON.stringify(enhancedResult, null, 2);

        // If there are no patients, add a message
        if (result.patients.length === 0) {
          formattedResult = `No encontré pacientes que coincidan con "${args.query}". Por favor, intenta con otro nombre.`;
        }
      } else {
        // Default formatting for other function results
        formattedResult = result.message || JSON.stringify(result, null, 2);
      }

      // Create a message for the function result
      const resultMessage: Message = {
        id: generateUniqueId('assistant'),
        role: 'assistant',
        content: `Resultado: ${formattedResult}`
      };

      // Add the result message
      setMessages(prevMessages => {
        // Limit the number of messages
        const newMessages = [...prevMessages, resultMessage];
        if (newMessages.length > maxMessages) {
          return newMessages.slice(-maxMessages);
        }
        return newMessages;
      });

      // Clear the pending function call
      setPendingFunctionCall(null);

      // Prepare history for function response processing
      // Get the last user message that triggered this function call
      const lastUserMessageIndex = messages.findIndex(msg =>
        msg.role === 'user' && msg.content.toLowerCase().includes('confirma') ||
        msg.content.toLowerCase().includes('procede') ||
        msg.content.toLowerCase().includes('sí') ||
        msg.content.toLowerCase().includes('si')
      );

      if (lastUserMessageIndex !== -1) {
        const relevantHistory = messages.slice(0, lastUserMessageIndex + 1);

        // Placeholder for the AI's message that contained the function call
        const aiFunctionCallInitiationMessage: Message = {
          id: generateUniqueId('assistant'),
          role: 'assistant',
          content: `[AI decided to call ${name} with args: ${JSON.stringify(args)}]`
        };

        const historyForFunctionResponseProcessing = [
          ...relevantHistory,
          aiFunctionCallInitiationMessage
        ];

        // Send the function result back to the AI for processing
        try {
          const finalAiResponse = await aiService.sendFunctionResult(
            name,
            result,
            historyForFunctionResponseProcessing,
            { userName: user?.user_metadata?.full_name || user?.email || undefined }
          );

          if (finalAiResponse.text) {
            const assistantResponseMessage: Message = {
              id: generateUniqueId('assistant'),
              role: 'assistant',
              content: finalAiResponse.text
            };
            setMessages(prevMessages => [...prevMessages, assistantResponseMessage]);
          }
        } catch (aiResponseError) {
          logger.error('Error getting AI response for function result in confirmPendingFunctionCall:', {
            error: aiResponseError instanceof Error ? aiResponseError.message : 'Unknown error',
            stack: aiResponseError instanceof Error ? aiResponseError.stack : undefined,
            functionName: name
          });

          // Fallback to the old method if AI response fails
          setTimeout(() => {
            // Create a contextual follow-up based on the function and result
            let followUpMessage = '';

            if (name === 'search_patients') {
              if (result.patients && result.patients.length > 0) {
                followUpMessage = `Estos son los pacientes que encontré${args.query ? ` con el nombre "${args.query}"` : ''}. ¿Necesitas más información sobre alguno de ellos?`;
              } else {
                followUpMessage = `No encontré pacientes${args.query ? ` con el nombre "${args.query}"` : ''}. ¿Quieres buscar con otro nombre?`;
              }
            } else {
              followUpMessage = `He completado la acción solicitada. ¿Hay algo más en lo que pueda ayudarte?`;
            }

            // Add the follow-up message
            addAssistantMessage(followUpMessage);
          }, 500);
        }
      } else {
        // Fallback to the old method if we can't find the triggering user message
        setTimeout(() => {
          // Create a contextual follow-up based on the function and result
          let followUpMessage = '';

          if (name === 'search_patients') {
            if (result.patients && result.patients.length > 0) {
              followUpMessage = `Estos son los pacientes que encontré${args.query ? ` con el nombre "${args.query}"` : ''}. ¿Necesitas más información sobre alguno de ellos?`;
            } else {
              followUpMessage = `No encontré pacientes${args.query ? ` con el nombre "${args.query}"` : ''}. ¿Quieres buscar con otro nombre?`;
            }
          } else {
            followUpMessage = `He completado la acción solicitada. ¿Hay algo más en lo que pueda ayudarte?`;
          }

          // Add the follow-up message
          addAssistantMessage(followUpMessage);
        }, 500);
      }
    } catch (error) {
      console.error('Error confirming function call:', error);

      // Create an error message
      const errorMessage: Message = {
        id: generateUniqueId('assistant'),
        role: 'assistant',
        content: `Error al ejecutar la acción: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };

      // Add the error message
      setMessages(prevMessages => [...prevMessages, errorMessage]);

      // Clear the pending function call
      setPendingFunctionCall(null);

      // Add a recovery message
      setTimeout(() => {
        addAssistantMessage('Lo siento, hubo un problema al ejecutar la acción. ¿Puedo ayudarte con algo más?');
      }, 500);
    }
  };

  // Create the context value
  const contextValue: AIAssistantContextType = {
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
    memories,
    isLoadingMemories,
    refreshMemories
  };

  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  );
}

/**
 * Hook to use the AI Assistant context
 * @returns The AI Assistant context
 */
export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
}