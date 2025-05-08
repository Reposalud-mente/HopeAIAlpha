'use client'

import React from 'react';
import { Bot, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssistantCard } from '@/lib/testing-floating';

interface EnhancedAISectionProps {
  onChatOpen?: () => void;
}

/**
 * Enhanced AI Section for the dashboard
 * Displays AI assistant cards with suggested questions
 */
export function EnhancedAISection({ onChatOpen }: EnhancedAISectionProps) {
  const suggestions = [
    "¿Cómo puedo optimizar mis notas clínicas?",
    "Ayúdame a preparar un informe para un paciente",
    "Sugiéreme preguntas para evaluar ansiedad",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-neutral-text flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          Asistente AI Mejorado
        </h3>
        {onChatOpen && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={onChatOpen}
          >
            <Bot className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {suggestions.map((question, index) => (
          <AssistantCard 
            key={index}
            question={question}
            currentSection="dashboard"
          />
        ))}
      </div>
    </div>
  );
}
