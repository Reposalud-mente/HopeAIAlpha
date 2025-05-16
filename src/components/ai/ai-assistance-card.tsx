"use client"

// Floating AI Assistant with Gemini integration
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Bot, X, Loader, Mic, MicOff, RefreshCw, AlertCircle, PlusCircle, User, Zap, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import styles from "./FloatingAIAssistant.module.css";
import { AIAssistantProvider, useAIAssistant } from "@/contexts/ai-assistant-context";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { Message } from "@/lib/ai-assistant/ai-assistant-service";
import { useAuth } from "@/hooks/useAuth";
// Import the client-side context gatherer for platform context
import { getClientAIContext } from "@/lib/ai-assistant/client-context-gatherer";
// Import the tool calling visualizer component
import { NewToolCallingVisualizer } from "./new-tool-calling-visualizer";
// Import the client storage provider
import { ClientStorageProvider } from "@/components/ai-assistant/ClientStorageProvider";

interface FloatingAIAssistantProps {
  patientName?: string;
  initialQuestion?: string;
  currentSection?: string;
  currentPage?: string;
}

interface AIAssistanceCardProps {
  patientName?: string;
  question?: string;
  currentSection?: string;
  currentPage?: string;
}

/**
 * Floating AI Assistant component with Gemini integration
 */
export function FloatingAIAssistant({
  patientName = '',
  initialQuestion = "¡Hola! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?",
  currentSection = '',
  currentPage = ''
}: FloatingAIAssistantProps) {
  // State for the assistant UI
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  // State for platform context
  const [platformContext, setPlatformContext] = useState<Record<string, any>>({});

  // Refs for DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get the AI Assistant context
  const {
    messages,
    isLoading,
    error,
    streamMessage,
    clearError,
    clearMessages, // Use the existing clearMessages function from context
    addAssistantMessage, // Use the new addAssistantMessage function
    pendingFunctionCall, // Get the pending function call
    confirmPendingFunctionCall, // Get the function to confirm pending function calls
    setPendingFunctionCall // Get the function to set pending function calls
  } = useAIAssistant();

  // Initialize voice input
  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
    supported: voiceSupported
  } = useVoiceInput({
    language: 'es-ES',
    continuous: false,
    interimResults: true
  });

  // Get the user session to access user information
  const { user: session } = useAuth();

  // Get platform context when the component mounts or context changes
  useEffect(() => {
    const fetchContext = async () => {
      try {
        // Get the user's full name or email from the session
        const fullName = session?.user_metadata?.full_name || session?.email || '';

        // Extract the first name (everything before the first space)
        const firstName = fullName.split(' ')[0] || fullName;

        // Get context using the client-side context gatherer
        const context = getClientAIContext(
          currentSection,
          currentPage,
          patientName ? 'mock-patient-id' : undefined,
          patientName,
          firstName // Pass only the first name to the context gatherer
        );
        setPlatformContext(context);

        // Log for debugging
        console.log('AI Assistant context with user name:', { fullName, firstName, context });
      } catch (error) {
        console.error('Error fetching platform context:', error);
      }
    };

    fetchContext();
  }, [currentSection, currentPage, patientName, session]);

  // Focus the input field when the assistant is opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Debug log to help diagnose message issues
    if (messages.length > 0) {
      console.log('Current messages in UI:', messages.map(m => ({
        role: m.role,
        id: m.id,
        contentPreview: m.content.substring(0, 20) + '...'
      })));
    }
  }, [messages]);

  // Close the assistant when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Update input field with voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Add initial greeting when the assistant is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Get the user's full name or email from the session
      const fullName = session?.user_metadata?.full_name || session?.email || '';

      // Extract the first name (everything before the first space)
      const firstName = fullName.split(' ')[0] || fullName;

      // Create a personalized greeting if we have the user's name
      let greeting = initialQuestion;
      if (firstName && firstName !== '') {
        // Insert the user's first name at the beginning of the greeting
        greeting = `¡Hola ${firstName}! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?`;
      }

      // Add the personalized greeting
      addAssistantMessage(greeting);
    }
  }, [isOpen, messages.length, addAssistantMessage, initialQuestion, session]);

  // Handle sending a message with enhanced context and action detection
  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim()) return;

    // Clear the input field and reset voice transcript
    setInput("");
    resetTranscript();

    // Check if this is a confirmation for a pending function call
    const confirmationKeywords = ['procede', 'confirma', 'confirmo', 'sí', 'si', 'adelante', 'ejecuta', 'ok', 'okay'];
    const isConfirmation = confirmationKeywords.some(keyword =>
      text.toLowerCase().includes(keyword)
    );

    // If this is a confirmation and there's a pending function call, execute it
    if (isConfirmation && pendingFunctionCall) {
      try {
        await confirmPendingFunctionCall();
        return;
      } catch (error) {
        console.error('Error confirming function call:', error);
      }
    }

    try {
      // Get the user's full name or email from the session
      const fullName = session?.user_metadata?.full_name || session?.email || '';

      // Extract the first name (everything before the first space)
      const firstName = fullName.split(' ')[0] || fullName;

      // Create context parameters
      const contextParams = {
        currentSection,
        currentPage,
        patientId: patientName ? 'mock-patient-id' : undefined,
        patientName,
        userName: firstName, // Pass the user's first name to the AI assistant
        session: null, // Pass null to indicate we're not in a request context
        userMessage: text // Pass the user's message to help with tool detection
      };

      // Use the streamMessage function from the AI assistant context
      // This will handle adding the user message and streaming the response
      await streamMessage(text, contextParams);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [input, resetTranscript, streamMessage, currentSection, currentPage, patientName, session, pendingFunctionCall, confirmPendingFunctionCall]);

  // Handle form submission
  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  }, [handleSend]);

  // Handle voice input toggle
  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      stopListening();
      // If there's a transcript, send it
      if (transcript) {
        handleSend(transcript);
      }
    } else {
      startListening();
    }
  }, [isListening, stopListening, transcript, handleSend, startListening]);

  // Handle starting a new conversation
  const handleNewConversation = useCallback(() => {
    // Clear all messages
    clearMessages();
    // Add an initial greeting from the assistant directly (not as a user message)
    setTimeout(() => {
      // Get the user's full name or email from the session
      const fullName = session?.user_metadata?.full_name || session?.email || '';

      // Extract the first name (everything before the first space)
      const firstName = fullName.split(' ')[0] || fullName;

      // Create a personalized greeting if we have the user's name
      let greeting = initialQuestion;
      if (firstName && firstName !== '') {
        // Insert the user's first name at the beginning of the greeting
        greeting = `¡Hola ${firstName}! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?`;
      }

      // Add the personalized greeting
      addAssistantMessage(greeting);
    }, 100);
  }, [clearMessages, addAssistantMessage, initialQuestion, session]);

  // Group messages by sender for better visual separation
  const groupedMessages = useMemo(() => {
    const groups: { role: 'user' | 'assistant', messages: Message[], groupId: string }[] = [];
    let currentGroup: { role: 'user' | 'assistant', messages: Message[], groupId: string } | null = null;

    messages.forEach(message => {
      if (!currentGroup || currentGroup.role !== message.role) {
        // Create a new group with a unique ID
        currentGroup = {
          role: message.role,
          messages: [message],
          groupId: `group_${message.role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <div className={styles.fab}>
        <Button
          size="icon"
          className={cn("shadow-lg", styles.fabButton)}
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

                {/* Context Indicator */}
                {Object.keys(platformContext).length > 0 && (
                  <div
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1"
                    title="El asistente tiene contexto de la plataforma"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Contexto</span>
                  </div>
                )}

                {/* Pending Function Call Indicator */}
                {pendingFunctionCall && (
                  <div
                    className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center gap-1"
                    title="Hay una acción pendiente de confirmación"
                  >
                    <Terminal className="h-3 w-3" />
                    <span>Acción Pendiente</span>
                  </div>
                )}

                {error && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={clearError}
                    aria-label="Limpiar error"
                    title="Limpiar error"
                  >
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar"
                  title="Cerrar asistente"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea style={{ height: 320 }} className="p-4">
                <div className="flex flex-col gap-4">
                  {/* Grouped Messages for better visual separation */}
                  {groupedMessages.map((group) => (
                    <div
                      key={group.groupId}
                      className={cn(
                        "flex flex-col gap-2",
                        group.role === 'assistant' ? "items-start" : "items-end"
                      )}
                    >
                      {/* Sender Label */}
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs text-muted-foreground px-2",
                          group.role === 'assistant' ? "self-start" : "self-end"
                        )}
                      >
                        {group.role === 'assistant' ? (
                          <>
                            <Bot className="h-3 w-3" />
                            <span>HopeAI</span>
                          </>
                        ) : (
                          <>
                            <span>Tú</span>
                            <User className="h-3 w-3" />
                          </>
                        )}
                      </div>

                      {/* Messages */}
                      {group.messages.map((msg, msgIndex) => (
                        <div
                          key={`${msg.id}_${msgIndex}`}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm max-w-[90%]",
                            group.role === 'assistant'
                              ? "bg-muted"
                              : "bg-[#1e293b] text-white",
                            // Add special styling for action messages
                            msg.content.startsWith('Ejecutando:')
                              ? "border border-amber-300 bg-amber-50 text-amber-800"
                              : "",
                            msg.content.startsWith('Resultado:')
                              ? "border border-green-300 bg-green-50 text-green-800"
                              : "",
                            msg.content.startsWith('Error al ejecutar')
                              ? "border border-red-300 bg-red-50 text-red-800"
                              : ""
                          )}
                        >
                          {/* Tool Calling Visualization */}
                          {msg.content.startsWith('Ejecutando:') ||
                           msg.content.startsWith('Resultado:') ||
                           msg.content.startsWith('Error al ejecutar') ||
                           msg.content.includes('¿Confirmas esta acción?') ||
                           msg.content.includes('search_patients') ||
                           msg.content.includes('list_patients') ||
                           // Detect function call patterns from Gemini API
                           msg.content.includes('function_call:') ||
                           msg.content.includes('functionCall:') ? (
                            <NewToolCallingVisualizer
                              content={msg.content}
                              confirmPendingFunctionCall={confirmPendingFunctionCall}
                              pendingFunctionCall={pendingFunctionCall}
                              addAssistantMessage={addAssistantMessage}
                              setPendingFunctionCall={setPendingFunctionCall}
                            />
                          ) : (
                            // Regular message content
                            msg.content
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs bg-muted self-start rounded-lg px-3 py-2">
                      <Loader className="animate-spin h-4 w-4" />
                      <span aria-live="polite">Pensando...</span>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div
                      className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg"
                      role="alert"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Error: {error}</span>
                      </div>
                      <div className="mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-6"
                          onClick={() => {
                            clearError();
                            // Retry the last message if there is one
                            const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
                            if (lastUserMessage) {
                              handleSend(lastUserMessage.content);
                            }
                          }}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Reintentar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Voice input error */}
                  {voiceError && (
                    <div
                      className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg"
                      role="alert"
                    >
                      {voiceError}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input form */}
              <form
                onSubmit={onSubmit}
                className="flex items-center gap-2 border-t p-2"
                aria-describedby="ai-assistant-description"
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
                  placeholder="Escribe tu mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isLoading}
                  aria-label="Mensaje para AI"
                  id="ai-assistant-input"
                />

                {/* Voice input button */}
                {voiceSupported && (
                  <Button
                    type="button"
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={toggleVoiceInput}
                    disabled={isLoading}
                    aria-label={isListening ? "Detener grabación" : "Grabar mensaje de voz"}
                    title={isListening ? "Detener grabación" : "Grabar mensaje de voz"}
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                )}

                {/* Send button */}
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || (!input.trim() && !transcript)}
                  aria-label="Enviar mensaje"
                  title="Enviar mensaje"
                >
                  <Bot className="h-5 w-5" />
                </Button>
              </form>

              {/* Screen reader description */}
              <div id="ai-assistant-description" className="sr-only">
                Asistente de inteligencia artificial para ayudarte con consultas y tareas.
                Puedes escribir mensajes o usar la entrada de voz si está disponible.
                El asistente puede realizar acciones en la plataforma cuando se le solicita.
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

/**
 * Wrapper component that provides the AI Assistant context
 * Only renders when a user is authenticated
 */
export function FloatingAIAssistantWithProvider(props: FloatingAIAssistantProps) {
  const { user, loading } = useAuth();

  // Don't render if not authenticated
  if (loading || !user) {
    return null;
  }

  // Use email as a unique identifier if id is not available
  const userId = user.id || user.email || 'anonymous';

  return (
    <ClientStorageProvider userId={userId}>
      <AIAssistantProvider>
        <FloatingAIAssistant {...props} />
      </AIAssistantProvider>
    </ClientStorageProvider>
  );
}

/**
 * Card component that opens the AI Assistant when clicked
 * Only renders when a user is authenticated
 */
export function AIAssistanceCard({
  patientName,
  question = "¿Cómo puedo ayudarte?",
  currentSection,
  currentPage
}: AIAssistanceCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user: session, loading } = useAuth();

  // Don't render if not authenticated
  if (loading || !session) {
    return null;
  }

  return (
    <div className="relative">
      <Card
        className="cursor-pointer transition-colors hover:bg-muted/50"
        onClick={() => setIsOpen(true)}
        tabIndex={0}
        role="button"
        aria-label="Abrir asistente AI"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(true);
          }
        }}
      >
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{question}</p>
            {/* Show context indicator if context is available */}
            {(currentSection || currentPage) && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Asistente contextual</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {isOpen && (
        <ClientStorageProvider userId={session.email || 'anonymous'}>
          <AIAssistantProvider>
            <FloatingAIAssistant
              patientName={patientName}
              initialQuestion={question}
              currentSection={currentSection}
              currentPage={currentPage}
            />
          </AIAssistantProvider>
        </ClientStorageProvider>
      )}
    </div>
  );
}