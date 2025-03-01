"use client"
import { Bot, X, Loader } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useChat } from "ai/react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import React from "react"

interface AIAssistantProps {
  initialQuestion: string
  isOpen: boolean
  onClose: () => void
  patientName: string
}

export function AIAssistant({ initialQuestion, isOpen, onClose, patientName }: AIAssistantProps) {
  const { messages, input, handleInputChange, handleSubmit: submitMessage } = useChat({
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: initialQuestion,
      },
    ],
  })

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await submitMessage(e);
    } catch {
      setError('Error al enviar el mensaje. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add keyboard support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input on open
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null

  return (
    <Card className="fixed left-4 bottom-4 z-50 w-[400px] shadow-lg h-[600px] flex flex-col bg-white rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b bg-white/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-2 text-base text-neutral-text">
          <Bot className="h-5 w-5 text-calm-primary" />
          Asistente IA - {patientName}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 text-neutral-text hover:bg-calm-secondary/50">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3 text-sm", {
                  "justify-end": message.role === "user",
                })}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-calm-primary text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={cn("rounded-xl px-4 py-2 max-w-[80%]", {
                    "bg-calm-secondary/50": message.role === "assistant",
                    "bg-calm-primary text-white": message.role === "user",
                  })}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4 bg-white/50 backdrop-blur-sm rounded-b-xl">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Escribe tu mensaje..."
              className="flex-1 rounded-full border-calm-primary/20 bg-white px-4 py-2 text-sm focus:ring-calm-primary"
              ref={inputRef}
            />
            <Button type="submit" className="rounded-full bg-calm-primary hover:bg-calm-deep" disabled={isLoading}>
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Enviar'}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

