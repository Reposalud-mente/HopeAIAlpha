"use client"

import { useState, useEffect, useCallback } from 'react';
import {
  Terminal, Zap, AlertCircle, Check, Loader2,
  ChevronDown, ChevronUp, Copy, CheckCircle2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { logger } from '@/lib/logger';

interface ToolCallingVisualizerProps {
  content: string;
  confirmPendingFunctionCall: () => Promise<void>;
  pendingFunctionCall: { name: string; args: any } | null;
  addAssistantMessage: (content: string) => void;
  setPendingFunctionCall: (call: { name: string; args: any } | null) => void;
}

/**
 * A simplified and more reliable tool calling visualizer component
 */
export function NewToolCallingVisualizer({
  content,
  confirmPendingFunctionCall,
  pendingFunctionCall,
  addAssistantMessage,
  setPendingFunctionCall
}: ToolCallingVisualizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    type: 'executing' | 'result' | 'error' | 'function_call' | 'unknown';
    title: string;
    details: string;
    functionName?: string;
    functionArgs?: any;
    resultData?: any;
  } | null>(null);

  // Copy to clipboard function
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Parse the content when it changes
  useEffect(() => {
    try {
      // Reset error state
      setError(null);

      // Check for executing message
      if (content.startsWith('Ejecutando:')) {
        const parts = content.replace('Ejecutando:', '').trim().split('...');
        const functionName = parts[0].trim();

        setParsedData({
          type: 'executing',
          title: 'Ejecutando acción',
          details: `Ejecutando ${functionName}...`,
          functionName
        });
        return;
      }

      // Check for result message
      if (content.startsWith('Resultado:')) {
        const resultText = content.replace('Resultado:', '').trim();
        let resultData = null;

        // Try to parse as JSON if it looks like JSON
        if (resultText.trim().startsWith('{') && resultText.trim().endsWith('}')) {
          try {
            resultData = JSON.parse(resultText);
          } catch (e) {
            // Not valid JSON, use as is
            resultData = null;
          }
        }

        setParsedData({
          type: 'result',
          title: 'Resultado de la acción',
          details: resultText,
          resultData
        });
        return;
      }

      // Check for error message
      if (content.startsWith('Error al ejecutar')) {
        setParsedData({
          type: 'error',
          title: 'Error en la acción',
          details: content.replace('Error al ejecutar', '').trim()
        });
        return;
      }

      // Check for function call
      if (content.includes('function_call:') ||
          content.includes('functionCall:') ||
          content.includes('search_patients') ||
          content.includes('list_patients')) {

        // Try to extract function name and args
        let functionName = '';
        let functionArgs = {};

        // Check for search_patients or list_patients in plain text
        if (content.includes('search_patients') || content.includes('list_patients')) {
          functionName = content.includes('search_patients') ? 'search_patients' : 'list_patients';

          // Try to extract query parameter with improved regex patterns
          // First try to match quoted strings
          let queryMatch = content.match(/["']([^"']+)["']/);

          // If no quoted string, try to match query parameter assignment
          if (!queryMatch) {
            queryMatch = content.match(/query\s*=\s*["']?([^"',\s}]+)["']?/);
          }

          // If still no match, try to find any email-like string that might be incorrectly used as a query
          if (!queryMatch) {
            const emailMatch = content.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) {
              queryMatch = emailMatch;
            }
          }

          if (queryMatch && queryMatch[1]) {
            const extractedQuery = queryMatch[1];

            // Check if the extracted query is "tool_code", looks like an email, or is empty
            const isToolCode = extractedQuery === 'tool_code';
            const isEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/.test(extractedQuery);
            const isEmpty = !extractedQuery || extractedQuery.trim() === '';

            // If it's "tool_code", an email, or empty, replace with "*" to list all patients
            const queryValue = isToolCode || isEmail || isEmpty ? '*' : extractedQuery;
            functionArgs = { query: queryValue };

            logger.info('Extracted query from tool calling content', {
              originalQuery: extractedQuery,
              finalQuery: queryValue,
              isToolCode,
              isEmail
            });
          } else {
            // For list_patients with empty query, use "*" to list all patients
            functionArgs = { query: functionName === 'list_patients' ? '*' : '' };
          }

          // Set pending function call if not already set
          if (!pendingFunctionCall) {
            setPendingFunctionCall({
              name: functionName,
              args: functionArgs
            });
          }
        }
        // Try to parse JSON function call
        else if (content.includes('function_call:') || content.includes('functionCall:')) {
          const functionCallMatch = content.match(/(?:function_call|functionCall):\s*(\{[\s\S]*\})/);
          if (functionCallMatch && functionCallMatch[1]) {
            try {
              const functionCallData = JSON.parse(functionCallMatch[1]);
              functionName = functionCallData.name;
              functionArgs = functionCallData.args || {};

              // Fix for the "tool_code" placeholder issue and email queries
              if ((functionName === 'search_patients' || functionName === 'list_patients') &&
                  functionArgs && typeof functionArgs === 'object' &&
                  'query' in functionArgs) {

                const query = functionArgs.query;

                // Check if the query is "tool_code", looks like an email, or is empty
                const isToolCode = query === 'tool_code';
                const isEmail = typeof query === 'string' && /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+$/.test(query);
                const isEmpty = !query || (typeof query === 'string' && query.trim() === '');

                // If it's "tool_code", an email, or empty, replace with "*" to list all patients
                if (isToolCode || isEmail || isEmpty) {
                  logger.info('Replacing query in JSON function call', {
                    originalQuery: query,
                    isToolCode,
                    isEmail,
                    isEmpty
                  });
                  functionArgs.query = '*';
                }
              }

              // Set pending function call if not already set
              if (!pendingFunctionCall) {
                setPendingFunctionCall({
                  name: functionName,
                  args: functionArgs
                });
              }
            } catch (e) {
              setError('Error parsing function call JSON');
            }
          }
        }

        setParsedData({
          type: 'function_call',
          title: 'Acción detectada',
          details: `Función: ${functionName}\nArgumentos: ${JSON.stringify(functionArgs, null, 2)}`,
          functionName,
          functionArgs
        });
        return;
      }

      // If we couldn't parse the content, just show it as is
      setParsedData({
        type: 'unknown',
        title: 'Mensaje',
        details: content
      });

    } catch (e) {
      setError(`Error parsing content: ${e instanceof Error ? e.message : 'Unknown error'}`);
      logger.error('Error parsing tool calling content', {
        error: e instanceof Error ? e.message : 'Unknown error',
        content
      });
    }
  }, [content, pendingFunctionCall, setPendingFunctionCall]);

  // Handle confirmation
  const handleConfirm = async () => {
    if (!pendingFunctionCall) return;

    setIsProcessing(true);
    try {
      await confirmPendingFunctionCall();
    } catch (e) {
      setError(`Error executing function: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    setPendingFunctionCall(null);
    addAssistantMessage("Acción cancelada. ¿En qué más puedo ayudarte?");
  };

  // Get function icon
  const getFunctionIcon = (name?: string) => {
    if (!name) return <Terminal className="h-4 w-4" />;

    switch (name) {
      case 'search_patients':
      case 'list_patients':
        return <Search className="h-4 w-4" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };

  // If we couldn't parse the content, just show it as regular text
  if (!parsedData) {
    return <div className="text-sm">{content}</div>;
  }

  return (
    <div className="w-full rounded-md border border-muted mb-2 overflow-hidden">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 p-2",
        parsedData.type === 'executing' ? "bg-amber-50" : "",
        parsedData.type === 'result' ? "bg-green-50" : "",
        parsedData.type === 'error' ? "bg-red-50" : "",
        parsedData.type === 'function_call' ? "bg-blue-50" : ""
      )}>
        {/* Icon */}
        <div className="flex-shrink-0">
          {parsedData.type === 'executing' && <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />}
          {parsedData.type === 'result' && <Zap className="h-4 w-4 text-green-600" />}
          {parsedData.type === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
          {parsedData.type === 'function_call' && getFunctionIcon(parsedData.functionName)}
        </div>

        {/* Title */}
        <div className="flex-1">
          <span className="font-medium text-sm">{parsedData.title}</span>
          {parsedData.functionName && (
            <span className="text-xs text-muted-foreground ml-1">
              ({parsedData.functionName})
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {parsedData.type === 'result' && parsedData.resultData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(JSON.stringify(parsedData.resultData, null, 2))}
                  >
                    {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? 'Copiado!' : 'Copiar resultado'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {(parsedData.details.length > 50 || parsedData.functionArgs) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Detalles
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-2 text-xs text-red-500 bg-red-50 border-t border-red-100">
          <AlertCircle className="h-3 w-3 inline-block mr-1" />
          {error}
        </div>
      )}

      {/* Details */}
      {parsedData.details && (
        <div className={cn(
          "transition-all duration-200 overflow-hidden",
          showDetails ? "max-h-96" : "max-h-20"
        )}>
          <div className="p-2 text-sm whitespace-pre-wrap">
            {parsedData.type === 'result' && parsedData.resultData?.patients ? (
              // Special handling for patient search results
              <div>
                <div className="font-medium mb-2">
                  {parsedData.resultData.patients.length > 0
                    ? `Encontrados ${parsedData.resultData.patients.length} pacientes`
                    : "No se encontraron pacientes"}
                </div>
                <div className="space-y-2">
                  {parsedData.resultData.patients.map((patient: any, index: number) => (
                    <div key={patient.id || index} className="p-2 bg-muted/50 rounded-md">
                      <div className="font-medium">{patient.name}</div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {patient.email && (
                          <div className="text-xs">
                            <span className="opacity-70">Email:</span> {patient.email}
                          </div>
                        )}
                        {patient.phone && (
                          <div className="text-xs">
                            <span className="opacity-70">Teléfono:</span> {patient.phone}
                          </div>
                        )}
                        {patient.age && (
                          <div className="text-xs">
                            <span className="opacity-70">Edad:</span> {patient.age} años
                          </div>
                        )}
                      </div>
                      {patient.lastAppointment && (
                        <div className="mt-1 text-xs">
                          <span className="opacity-70">Última cita:</span> {new Date(patient.lastAppointment.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Default display for other content
              parsedData.details
            )}
          </div>
        </div>
      )}

      {/* Function call confirmation */}
      {parsedData.type === 'function_call' && pendingFunctionCall && (
        <div className="p-2 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-700 mb-2">
            ¿Confirmas ejecutar esta acción?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Ejecutar
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
