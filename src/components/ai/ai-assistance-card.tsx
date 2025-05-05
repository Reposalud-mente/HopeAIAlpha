"use client"

// Floating AI Assistant with Gemini integration
import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Loader, Mic, MicOff, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import styles from "./FloatingAIAssistant.module.css";
import { AIAssistantProvider, useAIAssistant } from "@/contexts/ai-assistant-context";
import { useDebounce } from "@/hooks/use-debounce";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { Message } from "@/lib/ai-assistant/ai-assistant-service";

interface FloatingAIAssistantProps {
  patientName?: string;
  initialQuestion?: string;
}

interface AIAssistanceCardProps {
  patientName?: string;
  question?: string;
}

/**
 * Floating AI Assistant component with Gemini integration
 */
export function FloatingAIAssistant({ 
  patientName = '', 
  initialQuestion = "¡Hola! 😊 Soy HopeAI. Puedo ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?" 
}: FloatingAIAssistantProps) {
  // State for the assistant UI
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 300); // Debounce input to reduce unnecessary renders
  
  // Refs for DOM elements
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Get the AI Assistant context
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    streamMessage, 
    clearError 
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

  // Add initial message if messages is empty
  useEffect(() => {
    if (messages.length === 0) {
      // Add the initial message
      sendMessage(initialQuestion);
    }
  }, [messages.length, initialQuestion, sendMessage]);

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

  // Handle sending a message
  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim()) return;
    
    // Clear the input field and reset voice transcript
    setInput("");
    resetTranscript();
    
    // Send the message
    await streamMessage(text);
  }, [input, resetTranscript, streamMessage]);

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
                <div className="flex flex-col gap-2">
                  {messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm max-w-[90%]",
                        msg.role === 'assistant'
                          ? "bg-muted self-start"
                          : "bg-[#1e293b] text-white self-end"
                      )}
                    >
                      {msg.content}
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
                              sendMessage(lastUserMessage.content);
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
 */
export function FloatingAIAssistantWithProvider(props: FloatingAIAssistantProps) {
  return (
    <AIAssistantProvider>
      <FloatingAIAssistant {...props} />
    </AIAssistantProvider>
  );
}

/**
 * Card component that opens the AI Assistant when clicked
 */
export function AIAssistanceCard({ patientName, question = "¿Cómo puedo ayudarte?" }: AIAssistanceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          <p className="text-sm font-medium">{question}</p>
        </CardContent>
      </Card>
      {isOpen && (
        <AIAssistantProvider>
          <FloatingAIAssistant
            patientName={patientName}
            initialQuestion={question}
          />
        </AIAssistantProvider>
      )}
    </div>
  );
}