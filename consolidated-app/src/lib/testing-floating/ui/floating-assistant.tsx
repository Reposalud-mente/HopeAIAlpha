/**
 * Floating assistant component for the Enhanced AI Floating Assistant
 * Provides a floating chat interface for interacting with the assistant
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Loader, Mic, MicOff, RefreshCw, AlertCircle, PlusCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { useAssistant } from '../state/assistant-context';
import { useVoiceInput, useFloatingAssistant } from '../state/hooks';
import { ToolVisualizer } from './tool-visualizer';
import { getClientContext } from '../context/context-gatherer';
import { useSession } from 'next-auth/react';
import styles from './styles.module.css';

interface FloatingAssistantProps {
  patientName?: string;
  initialQuestion?: string;
  currentSection?: string;
  currentPage?: string;
  onClose?: () => void;
}

/**
 * Floating assistant component
 */
export function FloatingAssistant({
  patientName = '',
  initialQuestion = "¡Hola! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?",
  currentSection = '',
  currentPage = '',
  onClose
}: FloatingAssistantProps) {
  // Get the assistant context
  const assistant = useAssistant();

  // State for the assistant UI
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState("");

  // Voice input
  const voiceInput = useVoiceInput();

  // Get the user session
  const { data: session } = useSession();

  // Refs for DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize the assistant with the initial question
  useEffect(() => {
    if (initialQuestion && assistant.messages.length === 0) {
      assistant.startNewConversation(initialQuestion);
    }
  }, [initialQuestion, assistant]);

  // Focus the input when the assistant opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [assistant.messages]);

  // Update input when transcript changes
  useEffect(() => {
    if (voiceInput.transcript) {
      setInput(voiceInput.transcript);
    }
  }, [voiceInput.transcript]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Get context with more detailed information
    const context = getClientContext(
      currentSection,
      currentPage,
      undefined, // patientId - would be populated in a real implementation
      patientName,
      session?.user?.name || undefined
    );

    // Log the context for debugging
    console.log('Sending message with context:', {
      currentSection,
      currentPage,
      patientName,
      userName: session?.user?.name
    });

    // Send message with context parameters
    await assistant.streamMessage(input, {
      currentSection,
      currentPage,
      patientName,
      patientId: undefined, // Would be populated in a real implementation
    });

    // Clear input
    setInput("");

    // Stop voice input if active
    if (voiceInput.isListening) {
      voiceInput.stopListening();
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();
    } else {
      voiceInput.startListening();
    }
  };

  // Handle new conversation
  const handleNewConversation = () => {
    assistant.startNewConversation();
    setInput("");
  };

  // Handle close
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Handle API key setup (for development only)
  const handleApiKeySetup = () => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const currentKey = localStorage.getItem('GEMINI_API_KEY') || '';
    const newKey = prompt('Enter your Gemini API key for development:', currentKey);

    if (newKey && newKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', newKey.trim());
      alert('API key saved. Please refresh the page to use the new key.');
    }
  };

  // Render loading indicator
  const renderLoadingIndicator = () => (
    <div className={styles.loadingDots}>
      <div className={styles.loadingDot}></div>
      <div className={styles.loadingDot}></div>
      <div className={styles.loadingDot}></div>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <div className={styles.fab}>
        <Button
          size="icon"
          className={styles.fabButton}
          onClick={() => setIsOpen(true)}
          aria-label="Abrir asistente AI"
          title="Abrir asistente AI"
        >
          <Bot className="h-7 w-7" />
        </Button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={styles.fabModal}
          role="dialog"
          aria-labelledby="ai-assistant-title"
          aria-describedby="ai-assistant-description"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
              <CardTitle id="ai-assistant-title" className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" /> HopeAI
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* New Conversation Button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 h-8 px-2"
                  onClick={handleNewConversation}
                  title="Iniciar nueva conversación"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="text-xs">Nueva</span>
                </Button>

                {/* API Key Setup Button (development only) */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 h-8 px-2"
                    onClick={handleApiKeySetup}
                    title="Configurar API Key (solo desarrollo)"
                  >
                    <span className="text-xs">API Key</span>
                  </Button>
                )}

                {/* Close Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleClose}
                  title="Cerrar asistente"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Message Area */}
            <ScrollArea className="h-[400px] p-4">
              <div id="ai-assistant-description" className="sr-only">
                Asistente de inteligencia artificial para ayudarte con tus tareas.
              </div>

              {/* Error Alert */}
              {assistant.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <div className="text-sm">
                    {assistant.error}
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-xs ml-2"
                      onClick={() => assistant.clearError()}
                    >
                      Cerrar
                    </Button>
                  </div>
                </Alert>
              )}

              {/* Messages */}
              {assistant.messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageBubble} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  {/* Message content */}
                  <div className="flex items-start gap-2">
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 mt-1 shrink-0" />
                    ) : (
                      <Bot className="h-4 w-4 mt-1 shrink-0" />
                    )}
                    <div>
                      {/* Render HTML content safely */}
                      <div dangerouslySetInnerHTML={{ __html: message.content }} />

                      {/* Function calls */}
                      {message.functionCalls && message.functionCalls.length > 0 && (
                        <>
                          {message.functionCalls.map((functionCall, index) => {
                            // Find matching result if any
                            const functionResult = message.functionResults?.find(
                              (result) => result.callId === functionCall.id
                            );

                            // Only show pending function call UI for the first unexecuted function call
                            const isPending = !functionResult &&
                              (assistant.pendingFunctionCall?.id === functionCall.id ||
                               (!assistant.pendingFunctionCall && index === 0));

                            // If this is the pending function call, update it in the context
                            if (isPending && !assistant.pendingFunctionCall) {
                              // Use setTimeout to avoid state updates during render
                              setTimeout(() => {
                                assistant.setPendingFunctionCall({
                                  name: functionCall.name,
                                  args: functionCall.args,
                                  id: functionCall.id
                                });
                              }, 0);
                            }

                            return (
                              <div key={functionCall.id} className={styles.functionCallWrapper}>
                                <ToolVisualizer
                                  functionCall={functionCall}
                                  functionResult={functionResult}
                                  onConfirm={isPending ? assistant.confirmPendingFunctionCall : undefined}
                                  onCancel={isPending ? () => assistant.setPendingFunctionCall(null) : undefined}
                                  isLoading={isPending && assistant.isLoading}
                                />
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {assistant.isLoading && (
                <div className={`${styles.messageBubble} ${styles.assistantMessage}`}>
                  {renderLoadingIndicator()}
                </div>
              )}

              {/* Bottom ref for scrolling */}
              <div ref={bottomRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className={styles.inputContainer}>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Escribe tu mensaje..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                disabled={assistant.isLoading}
                className="flex-1 mr-2"
              />

              {/* Voice Input Button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={handleVoiceInput}
                disabled={assistant.isLoading || voiceInput.error !== null}
                className="mr-2"
                title={voiceInput.isListening ? "Detener grabación" : "Iniciar grabación de voz"}
              >
                {voiceInput.isListening ? (
                  <MicOff className="h-5 w-5 text-destructive" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              {/* Send Button */}
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim() || assistant.isLoading}
                title="Enviar mensaje"
              >
                {assistant.isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5 rotate-90" />
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
