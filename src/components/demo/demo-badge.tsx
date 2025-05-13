'use client';

/**
 * Demo Badge Component
 * 
 * This component displays a badge for demo patients.
 */

import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DemoBadgeProps {
  className?: string;
}

export function DemoBadge({ className = '' }: DemoBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`bg-blue-50 text-blue-700 hover:bg-blue-100 ${className}`}>
            <Info className="h-3 w-3 mr-1" />
            Demo
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Este es un paciente de demostración creado para fines de prueba.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Check if a patient is a demo patient
 * 
 * @param firstName The patient's first name
 * @returns True if the patient is a demo patient, false otherwise
 */
export function isDemo(firstName?: string): boolean {
  if (!firstName) return false;
  return firstName.startsWith('[DEMO]');
}
