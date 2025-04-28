"use client"

import React, { useState, FormEvent, useCallback } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft, AlertTriangle, Copy, RefreshCcw, BarChart2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Custom components implementation
interface ScrollState {
  isAtBottom: boolean;
  autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
  offset?: number;
  smooth?: boolean;
  content?: React.ReactNode;
}

function useAutoScroll(options: UseAutoScrollOptions = {}) {
  const { offset = 20, smooth = false } = options;
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const [lastContentHeight, setLastContentHeight] = useState<number>(0);
  const [userHasScrolled, setUserHasScrolled] = useState<boolean>(false);

  const [scrollState, setScrollState] = useState<ScrollState>({
    isAtBottom: true,
    autoScrollEnabled: true,
  });

  const scrollRefCallback = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setScrollRef(node);
    }
  }, []);

  const checkIsAtBottom = useCallback(
    (element: HTMLElement) => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceToBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );
      return distanceToBottom <= offset;
    },
    [offset]
  );

  const scrollToBottom = useCallback(
    (instant?: boolean) => {
      if (!scrollRef) return;

      const targetScrollTop =
        scrollRef.scrollHeight - scrollRef.clientHeight;

      if (instant) {
        scrollRef.scrollTop = targetScrollTop;
      } else {
        scrollRef.scrollTo({
          top: targetScrollTop,
          behavior: smooth ? "smooth" : "auto",
        });
      }

      setScrollState({
        isAtBottom: true,
        autoScrollEnabled: true,
      });
      setUserHasScrolled(false);
    },
    [smooth, scrollRef]
  );

  const disableAutoScroll = useCallback(() => {
    const atBottom = scrollRef
      ? checkIsAtBottom(scrollRef)
      : false;

    if (!atBottom) {
      setUserHasScrolled(true);
      setScrollState((prev) => ({
        ...prev,
        autoScrollEnabled: false,
      }));
    }
  }, [checkIsAtBottom, scrollRef]);

  return {
    scrollRef: scrollRefCallback,
    isAtBottom: scrollState.isAtBottom,
    autoScrollEnabled: scrollState.autoScrollEnabled,
    scrollToBottom: () => scrollToBottom(false),
    disableAutoScroll,
  };
}

function MessageLoading() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="text-foreground"
    >
      <circle cx="4" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_qFRN"
          begin="0;spinner_OcgL.end+0.25s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="12" cy="12" r="2" fill="currentColor">
        <animate
          begin="spinner_qFRN.begin+0.1s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
      <circle cx="20" cy="12" r="2" fill="currentColor">
        <animate
          id="spinner_OcgL"
          begin="spinner_qFRN.begin+0.2s"
          attributeName="cy"
          calcMode="spline"
          dur="0.6s"
          values="12;6;12"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
        />
      </circle>
    </svg>
  );
}

interface ChatBubbleProps {
  variant?: "sent" | "received"
  layout?: "default" | "ai"
  className?: string
  children: React.ReactNode
}

function ChatBubble({
  variant = "received",
  layout = "default",
  className,
  children,
}: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 mb-4",
        variant === "sent" && "flex-row-reverse",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ChatBubbleMessageProps {
  variant?: "sent" | "received"
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
}

function ChatBubbleMessage({
  variant = "received",
  isLoading,
  className,
  children,
}: ChatBubbleMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-3",
        variant === "sent" ? "bg-primary text-primary-foreground" : "bg-muted",
        className
      )}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        children
      )}
    </div>
  )
}

interface ChatBubbleAvatarProps {
  src?: string
  fallback?: string
  className?: string
}

function ChatBubbleAvatar({
  src,
  fallback = "AI",
  className,
}: ChatBubbleAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8", className)}>
      {src && <AvatarImage src={src} />}
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}

interface ChatBubbleActionProps {
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

function ChatBubbleAction({
  icon,
  onClick,
  className,
}: ChatBubbleActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6", className)}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}

function ChatBubbleActionWrapper({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex items-center gap-1 mt-2", className)}>
      {children}
    </div>
  )
}

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
}

function ChatMessageList({ className, children, smooth = false, ...props }: ChatMessageListProps) {
  const {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
  } = useAutoScroll({
    smooth,
    content: children,
  });

  return (
    <div className="relative w-full h-full">
      <div
        className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
        ref={scrollRef}
        onWheel={disableAutoScroll}
        onTouchMove={disableAutoScroll}
        {...props}
      >
        <div className="flex flex-col gap-6">{children}</div>
      </div>

      {!isAtBottom && (
        <Button
          onClick={() => {
            scrollToBottom();
          }}
          size="icon"
          variant="outline"
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
          aria-label="Desplazarse al final"
        >
          <CornerDownLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>{}

const ChatInput = ({ className, ...props }: ChatInputProps) => (
  <Textarea
    autoComplete="off"
    name="message"
    className={cn(
      "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none",
      className,
    )}
    {...props}
  />
);

// Main component implementation
interface Message {
  id: number;
  content: string | React.ReactNode;
  sender: "user" | "ai";
  type?: "text" | "table" | "alert" | "chart";
}

interface ConsultasAIProps {
  className?: string;
}

function ConsultasAI({ className }: ConsultasAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "¡Hola! Soy el asistente de Consultas AI especializado en psicología clínica. ¿Cómo puedo ayudarte a mejorar la atención a tus pacientes hoy?",
      sender: "ai",
      type: "text"
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clinicalQuestions = [
    "¿Cómo interpretar los resultados de la prueba MMPI-2?",
    "¿Cuáles son los pasos para generar un informe psicológico?",
    "¿Cómo puedo gestionar la agenda y los expedientes de mis pacientes?",
    "¿Qué intervención se recomienda para la depresión moderada?",
    "¿Cómo se documenta un plan de terapia cognitivo-conductual?",
    "Mostrar resumen de paciente Juan Pérez",
    "Mostrar próxima cita y mensaje de Ana Martínez"
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedQuestion) return;

    const query = selectedQuestion || input;

    // Add user message to UI immediately for better UX
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: query,
        sender: "user",
        type: "text"
      },
    ]);

    setInput("");
    setSelectedQuestion(null);
    setIsLoading(true);
    setError(null);

    try {
      // Call the API endpoint
      const response = await fetch('/api/consultas-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          consultationId: consultationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Store the consultation ID for future messages
      setConsultationId(data.consultationId);

      // Get the AI response (last message in the array)
      const aiResponse = data.messages[data.messages.length - 1];

      // Get the content from the AI response
      const content = aiResponse.content;

      console.log('Received AI response:', content);

      // Update the messages state with the AI response
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: content,
          sender: "ai",
          type: "text"
        },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Show error message to user
      setError('Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta de nuevo más tarde.');
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta de nuevo más tarde.",
          sender: "ai",
          type: "text"
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (query: string): { content: React.ReactNode, type: "text" | "table" | "alert" | "chart" } => {
    const lowerQ = query.toLowerCase();
    // Respuestas simuladas orientadas a psicología clínica
    // 1. Dynamic patient summary for 'Juan Pérez'
    if (lowerQ.includes("juan pérez") || lowerQ.includes("juan perez")) {
      return {
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-700">Resumen del paciente: Juan Pérez</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border-2 border-white">JP</div>
                    <div>
                      <div className="font-medium text-gray-900">Juan Pérez</div>
                      <div className="text-xs text-gray-500">Ingeniero, 39 años</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div><b>Correo:</b> juan.perez@example.com</div>
                    <div><b>Teléfono:</b> +56912345678</div>
                    <div><b>Dirección:</b> Av. Providencia 1234, Santiago</div>
                    <div><b>Contacto de emergencia:</b> María Pérez (+56987654321)</div>
                    <div><b>Estado civil:</b> Casado</div>
                    <div><b>Previsión:</b> Fonasa</div>
                  </div>
                  <button type="button" className="mt-3 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-md border border-blue-100" onClick={() => window.open('/patients/juan-perez', '_blank')}>
                    <FileText className="h-3.5 w-3.5" /> Ver historial
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <div className="rounded-lg border bg-blue-50 p-4 shadow-sm">
                  <div className="font-semibold text-blue-700 mb-2">Áreas de evaluación recientes</div>
                  <ul className="list-disc pl-5 text-sm text-blue-900">
                    <li>Función Cognitiva</li>
                    <li>Regulación Emocional</li>
                    <li>Estrés y Afrontamiento</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ),
        type: "table",
      };
    }
    // 2. Dynamic appointment & message for 'Ana Martínez'
    if (lowerQ.includes("ana martínez") || lowerQ.includes("ana martinez")) {
      return {
        content: (
          <div className="space-y-4">
            <h3 className="font-semibold text-pink-700">Próxima cita y mensaje para Ana Martínez</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-lg border-2 border-white">AM</div>
                    <div>
                      <div className="font-medium text-gray-900">Ana Martínez</div>
                      <div className="text-xs text-gray-500">Estudiante, 29 años</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div><b>Correo:</b> ana.martinez@example.com</div>
                    <div><b>Próxima cita:</b> 3 de mayo, 10:30 AM</div>
                    <div><b>Estado:</b> Agendada</div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="rounded-lg border bg-pink-50 p-4 shadow-sm">
                  <div className="font-semibold text-pink-700 mb-2">Mensaje reciente</div>
                  <div className="text-sm text-pink-900">Hola Ana, espero que hayas tenido una buena semana. ¿Te gustaría compartir cómo te has sentido últimamente?</div>
                </div>
              </div>
            </div>
          </div>
        ),
        type: "table",
      };
    }
    if (lowerQ.includes("mmpi") || lowerQ.includes("prueba") || lowerQ.includes("evaluación")) {
      return {
        content: (
          <div className="space-y-4">
            <p>Resultados de la prueba MMPI-2 (ejemplo):</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escala</TableHead>
                  <TableHead>Puntuación T</TableHead>
                  <TableHead>Interpretación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Hipocondriasis (Hs)</TableCell>
                  <TableCell>65</TableCell>
                  <TableCell>Tendencia a somatizar el malestar</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Depresión (D)</TableCell>
                  <TableCell>72</TableCell>
                  <TableCell>Nivel clínico de síntomas depresivos</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Histeria (Hy)</TableCell>
                  <TableCell>58</TableCell>
                  <TableCell>Dentro de rango esperado</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p>Considera estos resultados junto con la entrevista clínica completa.</p>
          </div>
        ),
        type: "table",
      };
    } else if (lowerQ.includes("riesgo") || lowerQ.includes("suicid")) {
      return {
        content: (
          <Alert variant="destructive" className="space-x-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Se detecta posible riesgo suicida. Prioriza una evaluación inmediata de seguridad, establece un plan de crisis y considera derivación a urgencias si es necesario.
            </AlertDescription>
          </Alert>
        ),
        type: "alert",
      };
    } else if (lowerQ.includes("depresión") || lowerQ.includes("ansiedad") || lowerQ.includes("tratamiento")) {
      return {
        content: (
          <div className="space-y-4">
            <p>Eficacia comparativa de intervenciones para depresión moderada:</p>
            <div className="flex items-end space-x-2 h-40">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-10 h-24 rounded-t-md"></div>
                <span className="text-xs mt-1">TCC</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-green-500 w-10 h-20 rounded-t-md"></div>
                <span className="text-xs mt-1">Mindfulness</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-10 h-28 rounded-t-md"></div>
                <span className="text-xs mt-1">Terapia Interpersonal</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-amber-500 w-10 h-32 rounded-t-md"></div>
                <span className="text-xs mt-1">Farmacoterapia</span>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">0%</span>
              <span className="text-xs">100%</span>
            </div>
          </div>
        ),
        type: "chart",
      };
    } else if (lowerQ.includes("informe")) {
      return {
        content: (
          <div className="space-y-2">
            <p>Pasos sugeridos para generar un informe psicológico estandarizado:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Definir objetivo de la evaluación.</li>
              <li>Integrar datos de entrevistas, tests y observación.</li>
              <li>Interpretar resultados con base en normas clínicas.</li>
              <li>Redactar hallazgos relevantes, diagnóstico y recomendaciones.</li>
              <li>Revisar y firmar el informe, luego cargarlo al expediente del paciente.</li>
            </ol>
          </div>
        ),
        type: "text",
      };
    } else {
      return {
        content: "Lo siento, no tengo información específica sobre esa consulta. ¿Podrías reformular tu pregunta o elegir una de las preguntas sugeridas?",
        type: "text",
      };
    }
  };

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
    setInput(question);
  };

  return (
    <div className={cn("flex h-[600px] border rounded-lg bg-background", className)}>
      <div className="w-1/4 border-r p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Preguntas Frecuentes</h2>
        <ul className="space-y-2">
          {clinicalQuestions.map((question, index) => (
            <li key={index}>
              <Button
                variant="ghost"
                className="block w-full mb-2 whitespace-normal text-left justify-start text-sm h-auto py-2"
                onClick={() => handleQuestionClick(question)}
              >
                {question}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Consultas AI</h1>
          <p className="text-sm text-muted-foreground">Asistente psicológico inteligente</p>
        </div>

        <div className="flex-1 overflow-hidden">
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  fallback={message.sender === "user" ? "TU" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  {typeof message.content === 'string'
                    ? message.content
                    : React.isValidElement(message.content)
                      ? message.content
                      : JSON.stringify(message.content)}

                  {message.sender === "ai" && (
                    <ChatBubbleActionWrapper>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => console.log("Copiar respuesta")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => console.log("Regenerar respuesta")}
                      >
                        <RefreshCcw className="h-3 w-3" />
                      </Button>
                    </ChatBubbleActionWrapper>
                  )}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}

            {error && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  fallback="AI"
                />
                <ChatBubbleMessage variant="received">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </ChatBubbleMessage>
              </ChatBubble>
            )}
          </ChatMessageList>
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={handleSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta psicológica..."
              className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <div className="flex">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                >
                  <Paperclip className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                >
                  <Mic className="size-4" />
                </Button>
              </div>
              <Button type="submit" size="sm" className="ml-auto gap-1.5">
                Enviar
                <Send className="size-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ConsultasAIPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Consultas AI - Asistente Psicológico</h1>
      <ConsultasAI />
    </div>
  );
}