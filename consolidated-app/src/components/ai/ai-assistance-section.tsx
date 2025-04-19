"use client"

import { Bot, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAssistanceCard } from "./ai-assistance-card";

interface AIAssistanceSectionProps {
  onChatOpen: () => void;
}

export function AIAssistanceSection({ onChatOpen }: AIAssistanceSectionProps) {
  const suggestions = [
    "¿Cómo puedo optimizar mis notas clínicas?",
    "Ayúdame a preparar un informe para un paciente",
    "Sugiéreme preguntas para evaluar ansiedad",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-neutral-text">Asistente AI</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 rounded-full"
          onClick={onChatOpen}
        >
          <Bot className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((question, index) => (
          <AIAssistanceCard 
            key={index}
            question={question}
          />
        ))}
      </div>
    </div>
  );
}
