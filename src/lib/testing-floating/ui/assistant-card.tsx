/**
 * Assistant card component for the Enhanced AI Floating Assistant
 * Displays a card that opens the floating assistant when clicked
 */

'use client';

import React, { useState } from 'react';
import { Bot, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AssistantProvider } from '../state/assistant-context';
import { FloatingAssistant } from './floating-assistant';
import styles from './styles.module.css';

interface AssistantCardProps {
  patientName?: string;
  question?: string;
  currentSection?: string;
  currentPage?: string;
}

/**
 * Assistant card component
 */
export function AssistantCard({
  patientName,
  question = "¿Cómo puedo ayudarte?",
  currentSection,
  currentPage
}: AssistantCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Card
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${styles.assistantCard}`}
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
        <AssistantProvider>
          <FloatingAssistant
            patientName={patientName}
            initialQuestion={question}
            currentSection={currentSection}
            currentPage={currentPage}
            onClose={() => setIsOpen(false)}
          />
        </AssistantProvider>
      )}
    </div>
  );
}
