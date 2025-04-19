"use client"

// Floating AI Assistant for repetitive and bureaucratic tasks
import { useState, useRef, useEffect } from "react";
import { Bot, X, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import styles from "./FloatingAIAssistant.module.css";

interface FloatingAIAssistantProps {
  patientName?: string;
  initialQuestion?: string;
}

interface AIAssistanceCardProps {
  patientName?: string;
  question?: string;
}

interface AIAssistantProps extends FloatingAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingAIAssistant({ patientName = '', initialQuestion = "¡Hola! 😊 Soy HopeAI. Pronto podré ayudarte a buscar información de pacientes, sesiones, notas clínicas y mucho más. ¿Qué necesitas hoy?" }: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", role: "assistant", content: initialQuestion },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: String(Date.now()), role: 'user', content: text }]);
    setInput("");
    setIsLoading(true);
    setError(null);
    // Simulate AI response
    setTimeout(() => {
      let response = "Estoy aquí para apoyarte en lo que necesites, desde tareas administrativas hasta consultas sobre procesos. ¡Cuéntame cómo puedo facilitar tu día!";
      if (text.toLowerCase().includes("proceso") || text.toLowerCase().includes("burocracia")) {
        response = "¡Entiendo que los procesos pueden ser tediosos! 😊 Si necesitas automatizar reportes, gestionar formularios o simplificar trámites, estoy aquí para ayudarte paso a paso.";
      } else if (text.toLowerCase().includes("informe")) {
        response = "¡Claro! Para generar un informe, dime qué información tienes y qué necesitas lograr. Juntos podemos armar un documento claro y útil para ti y tus pacientes.";
      } else if (text.toLowerCase().includes("hola") || text.toLowerCase().includes("buenos días") || text.toLowerCase().includes("buenas tardes")) {
        response = "¡Hola! 😊 ¿En qué puedo ayudarte hoy? Recuerda que estoy aquí para hacer tu trabajo más sencillo y humano.";
      }
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1200);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

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
        <div className={styles.fabModal}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" /> HopeAI
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} aria-label="Cerrar">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea style={{ height: 320 }} className="p-4">
                <div className="flex flex-col gap-2">
                  {messages.map((msg) => (
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
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                      <Loader className="animate-spin h-4 w-4" /> Pensando...
                    </div>
                  )}
                  {error && (
                    <div className="text-xs text-destructive">{error}</div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-2">
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
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Bot className="h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Usage: Import <FloatingAIAssistant /> in your global layout or _app file to enable across the platform.

export function AIAssistanceCard({ patientName, question = "¿Cómo puedo ayudarte?" }: AIAssistanceCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setIsOpen(true)}>
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">{question}</p>
        </CardContent>
      </Card>
      {isOpen && (
        <FloatingAIAssistant
          patientName={patientName}
          initialQuestion={question}
        />
      )}
    </div>
  )
}

