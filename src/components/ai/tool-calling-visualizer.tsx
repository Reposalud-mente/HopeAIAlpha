"use client"

import { useState, useEffect } from 'react';
import { Terminal, Zap, AlertCircle, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolCallingVisualizerProps {
  content: string;
  confirmPendingFunctionCall: () => Promise<void>;
  pendingFunctionCall: { name: string; args: any } | null;
  addAssistantMessage: (content: string) => void;
  setPendingFunctionCall: (call: { name: string; args: any } | null) => void;
}

/**
 * A minimalistic and elegant component for visualizing tool calling processes
 * in the AI assistant chat interface.
 */
export function ToolCallingVisualizer({
  content,
  confirmPendingFunctionCall,
  pendingFunctionCall,
  addAssistantMessage,
  setPendingFunctionCall
}: ToolCallingVisualizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Determine the type of message
  const isExecuting = content.startsWith('Ejecutando:');
  const isResult = content.startsWith('Resultado:');
  const isError = content.startsWith('Error al ejecutar');
  const isConfirmation = content.includes('¿Confirmas esta acción?');
  const isToolCode = content.includes('```tool_code') && content.includes('```');
  const isFunctionCall = content.includes('function_call:') || content.includes('functionCall:');

  // Additional pattern for detecting function calls in plain text format
  const hasSearchPatientsCall = content.includes('search_patients(') || content.includes('buscar pacientes con');

  // Extract the relevant parts of the message
  let title = '';
  let details = '';
  let functionName = '';

  if (isExecuting) {
    title = 'Ejecutando acción';
    details = content.replace('Ejecutando: ', '');
    functionName = details.split('...')[0];
  } else if (isResult) {
    title = 'Resultado de la acción';
    details = content.replace('Resultado: ', '');
  } else if (isError) {
    title = 'Error en la acción';
    details = content.replace('Error al ejecutar ', '');
  } else if (isConfirmation) {
    title = 'Confirmación requerida';
    const parts = content.split('¿Confirmas esta acción?');
    details = parts[0].trim();
  } else if (isFunctionCall) {
    // Handle direct function call format from Gemini API
    title = 'Acción detectada';

    try {
      // Try to extract the function call information
      const functionCallMatch = content.match(/function_call:|functionCall:\s*(\{[\s\S]*\})/);
      if (functionCallMatch && functionCallMatch[1]) {
        // Parse the JSON function call
        const functionCallData = JSON.parse(functionCallMatch[1]);
        functionName = functionCallData.name;
        const args = functionCallData.args || {};

        // Format the arguments for display
        const formattedArgs = Object.entries(args)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(', ');

        details = `Función: ${functionName}\nArgumentos: ${formattedArgs}`;

        // Create a pending function call object if one doesn't exist
        if (!pendingFunctionCall) {
          setPendingFunctionCall({
            name: functionName,
            args: args
          });
        }
      } else {
        details = 'No se pudo extraer la información de la función';
      }
    } catch (error) {
      console.error('Error parsing function call:', error);
      details = 'Error al procesar la llamada a función';
    }
  } else if (isToolCode) {
    // Extract function name and details from tool code
    title = 'Acción detectada';

    // Extract the code between the backticks
    const codeMatch = content.match(/```tool_code\s*([\s\S]*?)\s*```/);
    if (codeMatch && codeMatch[1]) {
      const code = codeMatch[1].trim();

      // Try to extract function name and arguments
      const functionMatch = code.match(/(\w+)\s*\(\s*(.*)\s*\)/);
      if (functionMatch) {
        functionName = functionMatch[1];
        const args = functionMatch[2];
        details = `Función: ${functionName}\nArgumentos: ${args}`;

        // Create a pending function call object if one doesn't exist
        if (!pendingFunctionCall) {
          // Handle search_patients function
          if (functionName === 'search_patients') {
            const argsMatch = args.match(/query\s*=\s*["'](.*)["']/);
            if (argsMatch) {
              const query = argsMatch[1];
              setPendingFunctionCall({
                name: 'search_patients',
                args: { query }
              });
            }
          }
          // Handle other functions by parsing the arguments
          else {
            try {
              // Try to parse the arguments as a JavaScript object
              // Convert the args string to a proper object format
              const argsStr = args.replace(/(\w+)\s*=\s*/g, '"$1":')
                                 .replace(/'/g, '"')
                                 .replace(/(\w+):/g, '"$1":');

              // Wrap in curly braces if not already
              const argsObj = JSON.parse(argsStr.startsWith('{') ? argsStr : `{${argsStr}}`);

              setPendingFunctionCall({
                name: functionName,
                args: argsObj
              });
            } catch (error) {
              console.error('Error parsing function arguments:', error, args);
              // Fallback to simple parsing for basic cases
              const argPairs = args.split(',').map(pair => pair.trim());
              const parsedArgs: Record<string, any> = {};

              argPairs.forEach(pair => {
                const [key, value] = pair.split('=').map(part => part.trim());
                if (key && value) {
                  // Remove quotes if present
                  const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
                  parsedArgs[key] = cleanValue;
                }
              });

              if (Object.keys(parsedArgs).length > 0) {
                setPendingFunctionCall({
                  name: functionName,
                  args: parsedArgs
                });
              }
            }
          }
        }
      } else {
        details = code;
      }
    } else {
      details = 'No se pudo extraer el código de la herramienta';
    }
  }

  // Handle confirmation
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await confirmPendingFunctionCall();
    } catch (error) {
      console.error('Error confirming function call:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    addAssistantMessage("Acción cancelada. ¿En qué más puedo ayudarte?");
    setPendingFunctionCall(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        {/* Header with icon and title */}
        <motion.div
          className="flex items-center gap-2 mb-1"
          variants={itemVariants}
        >
          {isExecuting && <Terminal className="h-4 w-4 text-amber-600" />}
          {isResult && <Zap className="h-4 w-4 text-green-600" />}
          {isError && <AlertCircle className="h-4 w-4 text-red-600" />}
          {isConfirmation && <Terminal className="h-4 w-4 text-amber-600" />}
          {isToolCode && <Terminal className="h-4 w-4 text-blue-600" />}
          <span className="font-medium text-sm">{title}</span>

          {/* Toggle details button */}
          {(isResult || isError) && details.length > 50 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 ml-auto text-xs"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
            </Button>
          )}
        </motion.div>

        {/* Content */}
        {details && (
          <motion.div
            className={cn(
              "pl-6 text-sm",
              (isResult || isError) && details.length > 50 && !showDetails ? "line-clamp-2" : ""
            )}
            variants={itemVariants}
          >
            {details}
          </motion.div>
        )}

        {/* Confirmation buttons */}
        {(isConfirmation || isToolCode) && (
          <motion.div
            className="flex gap-2 mt-2 pl-6"
            variants={itemVariants}
          >
            <Button
              size="sm"
              variant="default"
              className="h-7 text-xs"
              onClick={handleConfirm}
              disabled={!pendingFunctionCall || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  {isToolCode ? 'Ejecutar' : 'Confirmar'}
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleCancel}
              disabled={!pendingFunctionCall || isProcessing}
            >
              Cancelar
            </Button>
          </motion.div>
        )}

        {/* Progress indicator for executing actions */}
        {(isExecuting || (isToolCode && isProcessing)) && (
          <motion.div
            className="flex items-center gap-2 mt-2 pl-6 text-xs text-muted-foreground"
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Procesando acción...</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
