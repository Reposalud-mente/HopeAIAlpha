"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Bot, X, Loader, Mic, MicOff, RefreshCw, AlertCircle, PlusCircle, User, Zap, Terminal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import styles from "./PersistentAIPanel.module.css";
import { AIAssistantProvider, useAIAssistant } from "@/contexts/ai-assistant-context";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { Message } from "@/lib/ai-assistant/ai-assistant-service";
import { useAuth } from "@/hooks/useAuth";
import { getClientAIContext } from "@/lib/ai-assistant/client-context-gatherer";
import { ToolCallingVisualizer } from "./tool-calling-visualizer";
import { ClientStorageProvider } from "@/components/ai-assistant/ClientStorageProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePathname } from "next/navigation";

interface PersistentAIPanelProps {
  initialQuestion?: string;
}

/**
 * Persistent AI Panel component that displays on the right side of the screen
 */
export function PersistentAIPanel({
  initialQuestion = "¡Hola! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?"
}: PersistentAIPanelProps) {
  // State for the panel UI
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [input, setInput] = useState("");

  // State for platform context
  const [platformContext, setPlatformContext] = useState<Record<string, any>>({});

  // Get current path to extract context
  const pathname = usePathname();
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const currentSection = pathSegments[0] || '';
  const currentPage = pathSegments[1] || '';
  
  // Check if we're on a patient page
  const isPatientPage = currentSection === 'patients' && currentPage && currentPage !== 'new';
  const patientId = isPatientPage ? currentPage : undefined;
  const patientName = patientId ? 'Patient' : undefined; // This would need to be fetched from the API in a real implementation

  // Refs for DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Get the AI Assistant context
  const {
    messages,
    isLoading,
    error,
    streamMessage,
    clearError,
    clearMessages,
    addAssistantMessage,
    pendingFunctionCall,
    confirmPendingFunctionCall,
    setPendingFunctionCall
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
          patientId,
          patientName,
          firstName
        );
        setPlatformContext(context);
      } catch (error) {
        console.error('Error fetching platform context:', error);
      }
    };

    fetchContext();
  }, [currentSection, currentPage, patientId, patientName, session]);

  // Focus the input field when the panel is expanded
  useEffect(() => {
    if (!isCollapsed && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCollapsed]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update input field with voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Add initial greeting when the assistant is first loaded
  useEffect(() => {
    if (messages.length === 0) {
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
  }, [messages.length, addAssistantMessage, initialQuestion, session]);

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
        patientId,
        patientName,
        userName: firstName,
        session: null,
        userMessage: text
      };

      // Use the streamMessage function from the AI assistant context
      await streamMessage(text, contextParams);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [input, resetTranscript, streamMessage, currentSection, currentPage, patientId, patientName, session, pendingFunctionCall, confirmPendingFunctionCall]);

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
    // Add an initial greeting from the assistant directly
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

  // Toggle panel collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={cn(
        styles.panelContainer,
        isCollapsed ? styles.panelCollapsed : styles.panelExpanded
      )}
      aria-expanded={!isCollapsed}
    >
      {/* Collapse/Expand Button */}
      <button 
        className={styles.collapseButton}
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expandir asistente AI" : "Colapsar asistente AI"}
        title={isCollapsed ? "Expandir asistente AI" : "Colapsar asistente AI"}
      >
        {isCollapsed ? 
          (isMobile ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronLeft className="h-4 w-4" />) : 
          (isMobile ? <ChevronRight className="h-4 w-4 -rotate-90" /> : <ChevronRight className="h-4 w-4" />)
        }
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> HopeAI
        </div>
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
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <ScrollArea className={styles.messageContainer}>
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
                     (msg.content.includes('```tool_code') && msg.content.includes('```')) ||
                     msg.content.includes('function_call:') ||
                     msg.content.includes('functionCall:') ? (
                      <ToolCallingVisualizer
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
          className={styles.inputContainer}
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              aria-label="Mensaje para AI"
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
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Wrapper component that provides the AI Assistant context
 */
export function PersistentAIPanelWithProvider(props: PersistentAIPanelProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Check if the current path is a public route (login, register, landing page)
  const isPublicRoute = ['/', '/login', '/register', '/auth/login', '/auth/signup'].includes(pathname || '');

  // Don't render if not authenticated or on a public route
  if (loading || !user || isPublicRoute) {
    return null;
  }

  // Use email as a unique identifier if id is not available
  const userId = user.id || user.email || 'anonymous';

  return (
    <ClientStorageProvider userId={userId}>
      <AIAssistantProvider>
        <PersistentAIPanel {...props} />
      </AIAssistantProvider>
    </ClientStorageProvider>
  );
}
