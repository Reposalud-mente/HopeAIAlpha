'use client'

import React from 'react';
import { Bot, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAIPanel } from '@/contexts/ai-panel-context';
import { useAIAssistant } from '@/contexts/ai-assistant-context';
import { useAIPanelInput } from '@/contexts/ai-panel-input-context';

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

  // Get AI panel context to control panel state
  const { isCollapsed, setIsCollapsed } = useAIPanel();

  // Try to get the AI panel input context
  let panelInput;
  try {
    panelInput = useAIPanelInput();
  } catch (error) {
    // Context not available, will fall back to direct message sending
  }

  // Get AI assistant context to send messages
  const { streamMessage } = useAIAssistant();

  // Handle clicking on a suggestion card
  const handleSuggestionClick = async (question: string) => {
    // 1. Open the panel if it's collapsed
    if (isCollapsed) {
      setIsCollapsed(false);
    }

    // 2. If we have access to the panel input, set the text and send it
    if (panelInput) {
      try {
        // Set the input text first
        panelInput.setInputText(question);

        // Then send the message
        await panelInput.sendMessage(question);
      } catch (error) {
        console.error('Error using panel input context:', error);
        // Fall back to direct message sending
        await sendDirectMessage(question);
      }
    } else {
      // Fall back to direct message sending
      await sendDirectMessage(question);
    }
  };

  // Helper function to send a message directly using the AI assistant context
  const sendDirectMessage = async (question: string) => {
    try {
      await streamMessage(question, {
        currentSection: "dashboard",
        currentPage: "",
        patientId: undefined,
        patientName: undefined,
        userName: "",
        session: null,
        userMessage: question
      });
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-neutral-text flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          Asistente AI Mejorado
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
          onClick={() => setIsCollapsed(false)}
        >
          <Bot className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {suggestions.map((question, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => handleSuggestionClick(question)}
          >
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{question}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Asistente contextual</span>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
