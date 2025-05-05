'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { CheckIcon, AlertCircle } from 'lucide-react';

export interface WizardStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface WizardStepIndicatorProps {
  steps: WizardStep[];
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
  validationErrors?: Record<string, string>;
  stepValidationMap?: Record<string, string[]>;
}

export default function WizardStepIndicator({
  steps,
  currentStepIndex,
  onStepClick,
  validationErrors = {},
  stepValidationMap = {}
}: WizardStepIndicatorProps) {
  // Calculate progress percentage
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Check if a step has validation errors
  const hasStepErrors = (stepId: string): boolean => {
    const fieldsToCheck = stepValidationMap[stepId] || [];
    return fieldsToCheck.some(field => validationErrors[field]);
  };

  return (
    <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progreso</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {/* Steps container with connecting line */}
      <div className="relative flex items-center justify-between">
        {/* Line connecting steps */}
        <div className="absolute h-0.5 bg-gradient-to-r from-blue-100 via-gray-200 to-blue-100 left-8 right-8 top-1/2 transform -translate-y-1/2 z-0" />

        {/* Steps */}
        <div className="flex justify-between w-full relative z-10">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const hasErrors = hasStepErrors(step.id);
            
            return (
              <TooltipProvider key={step.id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex flex-col items-center cursor-pointer group ${onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={() => onStepClick && onStepClick(index)}
                      role="button"
                      tabIndex={onStepClick ? 0 : -1}
                      aria-label={`${step.label}${isActive ? ' (paso actual)' : isCompleted ? ' (completado)' : ' (pendiente)'}`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <div
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-full text-white font-medium text-sm mb-3 transition-all shadow-sm
                          ${isActive ? 'bg-blue-600 ring-4 ring-blue-100' : 
                            isCompleted ? (hasErrors ? 'bg-amber-500' : 'bg-green-600') : 
                            'bg-gray-300'}
                          ${onStepClick ? 'group-hover:scale-105' : ''}
                        `}
                      >
                        {isCompleted ? (
                          hasErrors ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <CheckIcon className="h-5 w-5" />
                          )
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span 
                        className={`
                          text-xs font-medium transition-colors
                          ${isActive ? 'text-blue-700' : 
                            isCompleted ? (hasErrors ? 'text-amber-700' : 'text-green-700') : 
                            'text-gray-500'}
                          ${onStepClick ? 'group-hover:font-semibold' : ''}
                        `}
                      >
                        {step.label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-2 p-1">
                      <p className="font-medium">{step.label}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                      {hasErrors && (
                        <p className="text-xs text-amber-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Hay campos con errores en este paso
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    </div>
  );
}