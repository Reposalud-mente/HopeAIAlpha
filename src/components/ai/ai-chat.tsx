"use client"

import { useState, useRef, useEffect } from "react";
import { Bot, X, Loader, Send, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIAssistant } from "@/contexts/ai-assistant-context";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection?: string;
  currentPage?: string;
  patientId?: string;
}

export function AIAssistant({ 
  isOpen, 
  onClose, 
  currentSection, 
  currentPage, 
  patientId 
}: AIAssistantProps) {
  const {
    messages,
    isLoading,
    streamMessage,
    clearError,
    error
  } = useAIAssistant();
  const [input, setInput] = useState("");
  const [isUsingContext, setIsUsingContext] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    setInput("");
    setIsUsingContext(
      currentSection !== undefined || 
      currentPage !== undefined || 
      patientId !== undefined
    );
    await streamMessage(text, { currentSection, currentPage, patientId });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 w-96 h-3/4 bg-white rounded-lg shadow-xl border overflow-hidden flex flex-col z-50">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> 
          Asistente AI
          {isUsingContext && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center">
                    <Info className="h-4 w-4 text-blue-500 cursor-help ml-1" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Usando contexto de la plataforma para respuestas personalizadas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                msg.role === 'assistant'
                  ? "bg-muted self-start"
                  : "bg-primary text-primary-foreground self-end"
              )}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs self-start">
              <Loader className="animate-spin h-3 w-3" /> 
              Escribiendo...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={onSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={isLoading || !input.trim()}
            className="h-9 w-9 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {currentSection && (
          <div className="mt-2 text-xs text-muted-foreground">
            Contexto: {currentSection} {currentPage ? `/ ${currentPage}` : ''}
          </div>
        )}
      </form>
    </div>
  );
}
