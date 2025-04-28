// -----------------------------------------------------------------------------
// FieldTextarea.tsx (Shared Component)
// Extracted from TherapeuticFollowupFields for reuse (HopeAI: Efficiency)
// -----------------------------------------------------------------------------
'use client';
import React, { useId } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ReactNode } from 'react';

export interface FieldTextareaProps {
  label: ReactNode;
  tooltip: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  showError: boolean;
  onSuggest?: () => void;
  loading?: boolean;
}

/**
 * FieldTextarea – reusable molecule for labelled textarea with validation, tooltip & optional
 * suggestion button.  This reduces duplicated markup, improves consistency, and makes future
 * field-type switches (e.g. from free text to checklist) trivial – HopeAI value: Efficiency.
 */
const FieldTextarea: React.FC<FieldTextareaProps> = ({
  label,
  tooltip,
  placeholder,
  required = false,
  value,
  onChange,
  onBlur,
  showError,
  onSuggest,
  loading = false,
}) => {
  const inputId = useId(); // unique per instance – accessibility best practice
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={inputId} className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                tabIndex={0}
                aria-label={`Ayuda sobre ${label}`}
                className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {onSuggest && (
          <button
            type="button"
            className={cn(
              'ml-2 px-2 py-1 text-xs rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition',
              loading && 'opacity-60 pointer-events-none'
            )}
            onClick={onSuggest}
            disabled={loading}
            aria-label={`Sugerir para ${label}`}
          >
            {loading ? 'Cargando...' : 'Sugerir'}
          </button>
        )}
      </div>
      <Textarea
        id={inputId}
        aria-describedby={showError ? errorId : undefined}
        aria-invalid={showError}
        aria-required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          'min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none',
          showError && 'border-red-500 focus:border-red-600 focus:ring-red-600', // stronger error indication
        )}
      />
      {/* Validation message */}
      {showError && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600 mt-1"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Este campo es obligatorio.</span>
        </div>
      )}
    </div>
  );
};

export default FieldTextarea;
