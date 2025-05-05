"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AIAssistantService, Message, getAIAssistantService } from '@/lib/ai-assistant/ai-assistant-service';

// Define the context type
interface AIAssistantContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  streamMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

// Create the context
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Storage key for persisting messages
const STORAGE_KEY = 'ai-assistant-messages';

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
  
  // Get the AI Assistant service
  const aiService = getAIAssistantService();

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(STORAGE_KEY);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
        }
      } catch (err) {
        console.error('Failed to parse stored messages:', err);
        // If parsing fails, clear the storage
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  /**
   * Sends a message to the AI Assistant and adds the response to the messages
   * @param content The message content
   */
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    // Add the user message to the messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the conversation history (excluding the message we just added)
      const conversationHistory = messages.slice(-10); // Use last 10 messages for context
      
      // Send the message to the AI Assistant
      const response = await aiService.sendMessage(content, conversationHistory);
      
      // Create a new assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response
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
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Streams a message to the AI Assistant and updates the response incrementally
   * @param content The message content
   */
  const streamMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };
    
    // Add the user message to the messages
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the conversation history (excluding the message we just added)
      const conversationHistory = messages.slice(-10); // Use last 10 messages for context
      
      // Create a placeholder for the assistant message
      const assistantMessageId = Date.now().toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      };
      
      // Add the placeholder message
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Stream the message and update the placeholder
      await aiService.streamMessage(
        content,
        conversationHistory,
        (chunk) => {
          setMessages(prevMessages => {
            const updatedMessages = prevMessages.map(msg => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  content: msg.content + chunk
                };
              }
              return msg;
            });
            return updatedMessages;
          });
        }
      );
    } catch (err) {
      console.error('Error streaming message:', err);
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
    localStorage.removeItem(STORAGE_KEY);
  };

  /**
   * Clears the error
   */
  const clearError = () => {
    setError(null);
  };

  // Create the context value
  const contextValue: AIAssistantContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    streamMessage,
    clearMessages,
    clearError
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