"use client"

import { useState, useEffect, useCallback } from 'react';
import {
  Terminal, Zap, AlertCircle, Check, Loader2,
  ChevronDown, ChevronUp, Copy, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
 * An enhanced component for visualizing tool calling processes
 * in the AI assistant chat interface with improved UI and user experience.
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
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Determine the type of message
  const isExecuting = content.startsWith('Ejecutando:');
  const isResult = content.startsWith('Resultado:');
  const isError = content.startsWith('Error al ejecutar');
  const isConfirmation = content.includes('¿Confirmas esta acción?');
  const isToolCode = content.includes('```tool_code') && content.includes('```');
  
  // Updated function call detection patterns to support the new Google GenAI SDK format
  const isFunctionCall = 
    content.includes('function_call:') || 
    content.includes('functionCall:') || 
    // New SDK format detection
    /functionCalls\s*[(\[]/.test(content) ||
    content.includes('"name":') && (content.includes('"args":') || content.includes('"parameters":'));

  // Additional pattern for detecting function calls in plain text format
  const hasPlainTextFunctionCall = /(\w+)\s*\(\s*(.*)\s*\)/.test(content);

  // Extract the relevant parts of the message
  let title = '';
  let details = '';
  let functionName = '';
  let functionArgs: Record<string, any> = {};
  let resultCode: string | null = null;
  let errorCode: string | null = null;

  // Function to format JSON for display
  const formatJSON = useCallback((obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return String(obj);
    }
  }, []);

  // Copy to clipboard function
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // Helper to extract function calls from the SDK's response format
  const extractFunctionCallsFromContent = useCallback((content: string): { name: string, args: any } | null => {
    try {
      // Check for SDK response patterns in the content
      // First, find the full JSON object if it exists
      const jsonMatch = content.match(/\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g);
      if (jsonMatch) {
        for (const match of jsonMatch) {
          try {
            const parsedJson = JSON.parse(match);
            
            // Check for different SDK patterns
            if (parsedJson.functionCalls && Array.isArray(parsedJson.functionCalls) && parsedJson.functionCalls.length > 0) {
              // New SDK format: { functionCalls: [{ name, args }] }
              const functionCall = parsedJson.functionCalls[0];
              if (functionCall.name) {
                return {
                  name: functionCall.name,
                  args: functionCall.args || {}
                };
              }
            } else if (parsedJson.function_call || parsedJson.functionCall) {
              // Legacy format: { function_call: { name, args } }
              const functionCall = parsedJson.function_call || parsedJson.functionCall;
              if (functionCall.name) {
                return {
                  name: functionCall.name,
                  args: functionCall.args || functionCall.arguments || {}
                };
              }
            } else if (parsedJson.name && (parsedJson.args || parsedJson.parameters)) {
              // Direct format: { name, args }
              return {
                name: parsedJson.name,
                args: parsedJson.args || parsedJson.parameters || {}
              };
            }
          } catch (e) {
            // Continue to next JSON candidate
            logger.warn('Failed to parse JSON candidate:', { error: e });
          }
        }
      }
      
      return null;
    } catch (error) {
      logger.warn('Error extracting function calls from content:', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        contentPreview: content.substring(0, 100) + '...'
      });
      return null;
    }
  }, []);

  // Component mount effect - add debug logging for the component
  useEffect(() => {
    // Log basic debug info when the component mounts
    const hasValidContent = content && content.length > 0;
    logger.info('ToolCallingVisualizer mounted', { 
      contentLength: hasValidContent ? content.length : 0,
      hasPendingCall: !!pendingFunctionCall,
      detectedType: {
        isExecuting,
        isResult,
        isError,
        isConfirmation,
        isToolCode,
        isFunctionCall,
        hasPlainTextFunctionCall
      }
    });
    
    // Log a sample of the content for debugging
    if (hasValidContent) {
      logger.debug('ToolCallingVisualizer content sample:', {
        preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
      });
    }
  }, []);

  // Parse the content based on its type
  useEffect(() => {
    setParseError(null);

    try {
      if (isExecuting) {
        title = 'Ejecutando acción';
        details = content.replace('Ejecutando: ', '');
        functionName = details.split('...')[0];
      } else if (isResult) {
        title = 'Resultado de la acción';
        details = content.replace('Resultado: ', '');

        // Try to parse JSON result if it looks like JSON
        if (details.trim().startsWith('{') && details.trim().endsWith('}')) {
          try {
            const resultObj = JSON.parse(details);
            resultCode = formatJSON(resultObj);
          } catch (e) {
            // Not valid JSON, use as is
          }
        }
      } else if (isError) {
        title = 'Error en la acción';
        details = content.replace('Error al ejecutar ', '');

        // Extract error code if present
        const errorCodeMatch = details.match(/código:\s*"([^"]+)"/i);
        if (errorCodeMatch && errorCodeMatch[1]) {
          errorCode = errorCodeMatch[1];
        }
      } else if (isConfirmation) {
        title = 'Confirmación requerida';
        const parts = content.split('¿Confirmas esta acción?');
        details = parts[0].trim();
      } else if (isFunctionCall) {
        // Handle direct function call format from Gemini API
        title = 'Acción detectada';

        // First try the new SDK helper method
        const extractedCall = extractFunctionCallsFromContent(content);
        
        if (extractedCall) {
          functionName = extractedCall.name;
          functionArgs = extractedCall.args;
          
          // Format the arguments for display and set details
          details = `Función: ${functionName}\nArgumentos: ${formatJSON(functionArgs)}`;
          
          // Create a pending function call object if one doesn't exist
          if (!pendingFunctionCall) {
            setPendingFunctionCall({
              name: functionName,
              args: functionArgs
            });
          }
        } else {
          // Fall back to the existing parsing logic if helper doesn't find anything
          try {
            // Previous patterns still included for backwards compatibility
            const functionCallJSONMatch = content.match(/(?:function_call|functionCall):\s*(\{[\s\S]*?\})/);
            const newSdkMatch = content.match(/functionCalls\s*[(\[]\s*(\{[\s\S]*?\})/);
            const rawJsonMatch = /({"name":.+?"args":.+?}|{"name":.+?"parameters":.+?})/.exec(content);
            
            let extractedJson = null;
            if (functionCallJSONMatch && functionCallJSONMatch[1]) {
              extractedJson = functionCallJSONMatch[1];
            } else if (newSdkMatch && newSdkMatch[1]) {
              extractedJson = newSdkMatch[1];
            } else if (rawJsonMatch && rawJsonMatch[1]) {
              extractedJson = rawJsonMatch[1];
            }
            
            if (extractedJson) {
              // Clean JSON and parse
              try {
                const cleanedJson = extractedJson.replace(/^[^{]*/,'').replace(/[^}]*$/,'');
                const functionCallData = JSON.parse(cleanedJson);
                
                functionName = functionCallData.name;
                functionArgs = functionCallData.args || functionCallData.parameters || {};
                
                details = `Función: ${functionName}\nArgumentos: ${formatJSON(functionArgs)}`;
                
                if (!pendingFunctionCall) {
                  setPendingFunctionCall({
                    name: functionName,
                    args: functionArgs
                  });
                }
              } catch (jsonError) {
                logger.error('Error parsing JSON function call:', {
                  error: jsonError instanceof Error ? jsonError.message : 'Unknown error',
                  extractedJson
                });
                setParseError('Error al analizar JSON: ' + 
                  (jsonError instanceof Error ? jsonError.message : 'Unknown error'));
              }
            } else {
              // If no JSON, try key-value patterns
              const nameMatch = content.match(/[nN]ame\s*[:=]\s*["']?([^"',}]+)["']?/);
              if (nameMatch && nameMatch[1]) {
                functionName = nameMatch[1].trim();
                
                // Try to extract arguments as simple key:value pairs
                const argsMatches = [...content.matchAll(/([a-zA-Z0-9_]+)\s*[:=]\s*["']?([^"',}]+)["']?/g)];
                const extractedArgs: Record<string, any> = {};
                
                argsMatches.forEach(match => {
                  if (match[1] !== 'name' && match[1] !== 'function') {
                    extractedArgs[match[1]] = match[2].trim();
                  }
                });
                
                if (Object.keys(extractedArgs).length > 0) {
                  functionArgs = extractedArgs;
                  details = `Función: ${functionName}\nArgumentos: ${formatJSON(extractedArgs)}`;
                  
                  if (!pendingFunctionCall) {
                    setPendingFunctionCall({
                      name: functionName,
                      args: extractedArgs
                    });
                  }
                } else {
                  details = `Función: ${functionName}\nNo se detectaron argumentos`;
                  
                  if (!pendingFunctionCall) {
                    setPendingFunctionCall({
                      name: functionName,
                      args: {}
                    });
                  }
                }
              } else {
                details = 'No se pudo extraer la información de la función';
                setParseError('No se pudo extraer la información de la función');
              }
            }
          } catch (error) {
            logger.error('Error parsing function call:', {
              error: error instanceof Error ? error.message : 'Unknown error',
              content
            });
            details = 'Error al procesar la llamada a función';
            setParseError('Error al procesar la llamada a función: ' + 
              (error instanceof Error ? error.message : 'Unknown error'));
          }
        }
      } else if (isToolCode || hasPlainTextFunctionCall) {
        // Extract function name and details from tool code or plain text
        title = 'Acción detectada';

        // First try to extract from tool code format
        let code = '';
        if (isToolCode) {
          const codeMatch = content.match(/```tool_code\s*([\s\S]*?)\s*```/);
          if (codeMatch && codeMatch[1]) {
            code = codeMatch[1].trim();
          } else {
            details = 'No se pudo extraer el código de la herramienta';
            setParseError('No se pudo extraer el código de la herramienta');
            return;
          }
        } else {
          // Try to extract from plain text format
          code = content.trim();
        }

        // Try to extract function name and arguments - improved pattern matching
        // This pattern handles both search_patients("query") and search_patients(query="value") formats
        const functionMatch = code.match(/(\w+)\s*\(\s*(.*?)\s*\)/);
        if (functionMatch) {
          functionName = functionMatch[1];
          const args = functionMatch[2];
          details = `Función: ${functionName}\nArgumentos: ${args}`;

          // Create a pending function call object if one doesn't exist
          if (!pendingFunctionCall) {
            // Handle search_patients function specifically
            if (functionName === 'search_patients') {
              // Try different patterns for search_patients arguments
              let query = '';

              // Handle direct string format: search_patients("Pedro")
              if (args.startsWith('"') && args.endsWith('"')) {
                query = args.slice(1, -1);
              }
              // Handle direct string format with single quotes: search_patients('Pedro')
              else if (args.startsWith("'") && args.endsWith("'")) {
                query = args.slice(1, -1);
              }
              // Pattern: query="text" or query='text'
              else {
                const quotedArgsMatch = args.match(/query\s*=\s*["'](.*)["']/);
                if (quotedArgsMatch) {
                  query = quotedArgsMatch[1];
                }
                // Pattern: query=text (without quotes)
                else {
                  const unquotedArgsMatch = args.match(/query\s*=\s*([^,\s]+)/);
                  if (unquotedArgsMatch) {
                    query = unquotedArgsMatch[1];
                  }
                }
              }

              if (query) {
                functionArgs = { query };
                setPendingFunctionCall({
                  name: 'search_patients',
                  args: { query }
                });
              } else {
                setParseError('No se pudo extraer el parámetro de búsqueda');
              }
            }
            // Handle other functions by parsing the arguments
            else {
              try {
                // First, try to parse as JSON if it looks like JSON
                if (args.trim().startsWith('{') && args.trim().endsWith('}')) {
                  try {
                    const argsObj = JSON.parse(args);
                    functionArgs = argsObj;
                    setPendingFunctionCall({
                      name: functionName,
                      args: argsObj
                    });
                    return;
                  } catch (e) {
                    // Not valid JSON, continue with other parsing methods
                    logger.warn('Failed to parse JSON arguments, trying alternative methods', { args, error: e });
                  }
                }

                // Try to parse the arguments as a JavaScript object
                try {
                  // Convert the args string to a proper object format
                  // Handle both key=value and key: value formats
                  let argsStr = args
                    .replace(/(\w+)\s*=\s*/g, '"$1":')  // Convert key=value to "key":value
                    .replace(/(\w+):\s*/g, '"$1":')     // Convert key: value to "key":value
                    .replace(/'/g, '"');                // Replace single quotes with double quotes

                  // Make sure string values are properly quoted
                  argsStr = argsStr.replace(/"([^"]+)":\s*([^",{}\[\]\s][^,{}\[\]]*)/g, '"$1":"$2"');

                  // Wrap in curly braces if not already
                  const jsonStr = argsStr.startsWith('{') ? argsStr : `{${argsStr}}`;

                  // Try to parse the JSON
                  const argsObj = JSON.parse(jsonStr);
                  functionArgs = argsObj;

                  setPendingFunctionCall({
                    name: functionName,
                    args: argsObj
                  });
                  return;
                } catch (e) {
                  // JSON parsing failed, continue with other methods
                  logger.warn('Failed to parse arguments as JSON object', { args, error: e });
                }
              } catch (error) {
                logger.error('Error parsing function arguments:', {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  args
                });

                // Fallback to simple parsing for basic cases
                logger.info('Attempting fallback parsing method for arguments', { args });

                // Handle function call format: functionName("single argument")
                if ((args.startsWith('"') && args.endsWith('"')) ||
                    (args.startsWith("'") && args.endsWith("'"))) {
                  // For functions that expect a single string parameter
                  const singleValue = args.slice(1, -1);

                  // Map to the appropriate parameter name based on function
                  let paramName = 'query'; // Default for search_patients
                  if (functionName === 'generate_report') paramName = 'patientId';

                  const parsedArgs = { [paramName]: singleValue };
                  functionArgs = parsedArgs;
                  setPendingFunctionCall({
                    name: functionName,
                    args: parsedArgs
                  });
                  return;
                }

                // Try comma-separated key=value pairs
                const argPairs = args.split(',').map(pair => pair.trim());
                const parsedArgs: Record<string, any> = {};

                argPairs.forEach(pair => {
                  // Handle both key=value and key: value formats
                  const equalsSplit = pair.split('=').map(part => part.trim());
                  const colonSplit = pair.split(':').map(part => part.trim());

                  // Use whichever split produced a valid key-value pair
                  let key, value;
                  if (equalsSplit.length === 2) {
                    [key, value] = equalsSplit;
                  } else if (colonSplit.length === 2) {
                    [key, value] = colonSplit;
                  }

                  if (key && value) {
                    // Remove quotes if present
                    const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
                    parsedArgs[key] = cleanValue;
                  }
                });

                if (Object.keys(parsedArgs).length > 0) {
                  functionArgs = parsedArgs;
                  setPendingFunctionCall({
                    name: functionName,
                    args: parsedArgs
                  });
                } else {
                  // Last resort: if it's search_patients and we have any text, use it as query
                  if (functionName === 'search_patients' && args.trim()) {
                    // Strip any quotes or special characters and use as query
                    const query = args.replace(/['"{}]/g, '').trim();
                    if (query) {
                      functionArgs = { query };
                      setPendingFunctionCall({
                        name: 'search_patients',
                        args: { query }
                      });
                      return;
                    }
                  }

                  setParseError('No se pudieron analizar los argumentos de la función');
                }
              }
            }
          }
        } else {
          details = code;
          setParseError('No se pudo identificar la función a ejecutar');
        }
      }
    } catch (error) {
      logger.error('Error in ToolCallingVisualizer:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        content
      });
      setParseError('Error al procesar la acción');
    }
  }, [content, pendingFunctionCall, setPendingFunctionCall, formatJSON]);

  // Get a friendly name for the function
  const getFriendlyFunctionName = useCallback((name: string): string => {
    const functionNameMap: Record<string, string> = {
      'schedule_session': 'Agendar sesión',
      'create_reminder': 'Crear recordatorio',
      'search_patients': 'Buscar pacientes',
      'generate_report': 'Generar informe',
    };

    return functionNameMap[name] || name;
  }, []);

  // Store the current function context to prevent loss after confirmation
  const [storedFunctionContext, setStoredFunctionContext] = useState<{
    name: string;
    args: any;
    originalContent: string;
  } | null>(null);

  // Update stored context when function call is detected
  useEffect(() => {
    if (pendingFunctionCall && !storedFunctionContext) {
      setStoredFunctionContext({
        name: pendingFunctionCall.name,
        args: pendingFunctionCall.args,
        originalContent: content
      });
      logger.info('Function context stored', {
        name: pendingFunctionCall.name,
        args: pendingFunctionCall.args
      });
    }
  }, [pendingFunctionCall, storedFunctionContext, content]);

  // Handle confirmation with improved context preservation
  const handleConfirm = async () => {
    setIsProcessing(true);

    // Use stored context if available, otherwise use current pendingFunctionCall
    const functionToExecute = storedFunctionContext ||
      (pendingFunctionCall ? {
        name: pendingFunctionCall.name,
        args: pendingFunctionCall.args,
        originalContent: content
      } : null);

    if (!functionToExecute) {
      logger.error('No function context available for execution');
      addAssistantMessage("Error: No se pudo recuperar el contexto de la función. Por favor, intenta de nuevo.");
      setIsProcessing(false);
      return;
    }

    try {
      logger.info('Executing function with preserved context', {
        name: functionToExecute.name,
        args: functionToExecute.args
      });

      // Execute the function with the preserved context
      await confirmPendingFunctionCall();

      // Clear the stored context after successful execution
      setStoredFunctionContext(null);
    } catch (error) {
      logger.error('Error confirming function call:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        functionName: functionToExecute.name,
        functionArgs: functionToExecute.args
      });

      // Provide a more user-friendly error message
      addAssistantMessage(`Error al ejecutar la acción: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle cancellation with improved feedback
  const handleCancel = () => {
    // Clear the stored context
    setStoredFunctionContext(null);

    // Reset the pending function call
    setPendingFunctionCall(null);

    // Provide a friendly cancellation message
    addAssistantMessage("Acción cancelada. ¿En qué más puedo ayudarte?");

    logger.info('Function execution cancelled by user');
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

  // Get the appropriate icon for the function
  const getFunctionIcon = (name: string) => {
    switch (name) {
      case 'schedule_session':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>;
      case 'create_reminder':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>;
      case 'search_patients':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>;
      case 'generate_report':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>;
      default:
        return <Terminal className="h-4 w-4" />;
    }
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
        {/* Enhanced header with icon and title */}
        <motion.div
          className={cn(
            "flex items-center gap-2 mb-1 p-2 rounded-t-md",
            isExecuting ? "bg-amber-50" : "",
            isResult ? "bg-green-50" : "",
            isError ? "bg-red-50" : "",
            (isConfirmation || isToolCode || isFunctionCall) ? "bg-blue-50" : ""
          )}
          variants={itemVariants}
        >
          {/* Status icons with improved visual feedback */}
          <div className="flex-shrink-0">
            {isExecuting && <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />}
            {isResult && <Zap className="h-4 w-4 text-green-600" />}
            {isError && <AlertCircle className="h-4 w-4 text-red-600" />}
            {(isConfirmation || isToolCode || isFunctionCall) &&
              (functionName ? getFunctionIcon(functionName) : <Terminal className="h-4 w-4 text-blue-600" />)}
          </div>

          {/* Title and badges section */}
          <div className="flex flex-col">
            <span className="font-medium text-sm">{title}</span>

            {/* Function description - new addition */}
            {functionName && (isConfirmation || isToolCode || isFunctionCall) && (
              <span className="text-xs text-muted-foreground">
                {getFriendlyFunctionName(functionName)}
              </span>
            )}
          </div>

          {/* Status badges */}
          <div className="flex gap-1 ml-auto">
            {/* Function name badge */}
            {functionName && (isConfirmation || isToolCode || isFunctionCall) && (
              <Badge variant="outline" className="text-xs font-normal">
                {functionName}
              </Badge>
            )}

            {/* Error code badge */}
            {errorCode && (
              <Badge variant="destructive" className="text-xs font-normal">
                {errorCode}
              </Badge>
            )}

            {/* Toggle details button */}
            {(isResult || isError || (Object.keys(functionArgs).length > 0)) && (
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
        </motion.div>

        {/* Parse error message with improved styling */}
        {parseError && (
          <motion.div
            className="mx-2 p-2 text-xs text-red-500 bg-red-50 rounded-md mb-2 border border-red-200"
            variants={itemVariants}
          >
            <AlertCircle className="h-3 w-3 inline-block mr-1" />
            {parseError}
          </motion.div>
        )}

        {/* Function arguments with improved styling */}
        {Object.keys(functionArgs).length > 0 && (
          <motion.div
            className={cn("transition-all duration-200",
              showDetails ? "opacity-100 max-h-96" : "opacity-80 max-h-12 overflow-hidden"
            )}
            variants={itemVariants}
          >
            <div className="mx-2 bg-muted rounded-md p-2 relative border border-muted-foreground/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Parámetros de la acción</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(formatJSON(functionArgs))}
                      >
                        {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? 'Copiado!' : 'Copiar parámetros'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Display arguments in a more user-friendly format */}
              <div className="text-xs">
                {Object.entries(functionArgs).map(([key, value]) => (
                  <div key={key} className="flex py-1 border-b border-muted-foreground/10 last:border-0">
                    <span className="font-medium w-1/3">{key}:</span>
                    <span className="w-2/3 break-words">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                  </div>
                ))}
              </div>

              {!showDetails && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted to-transparent" />
              )}
            </div>
          </motion.div>
        )}

        {/* Result content with improved styling */}
        {resultCode ? (
          <motion.div
            className={cn("transition-all duration-200 mt-2",
              showDetails ? "opacity-100 max-h-96" : "opacity-80 max-h-12 overflow-hidden"
            )}
            variants={itemVariants}
          >
            <div className="mx-2 bg-muted rounded-md p-2 relative border border-muted-foreground/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">Resultado de la acción</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(resultCode || '')}
                      >
                        {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copied ? 'Copiado!' : 'Copiar resultado'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                {resultCode}
              </pre>

              {!showDetails && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-muted to-transparent" />
              )}
            </div>
          </motion.div>
        ) : details && (
          <motion.div
            className={cn(
              "mx-2 p-2 text-sm rounded-md",
              (isResult || isError) && details.length > 50 && !showDetails ? "line-clamp-2" : ""
            )}
            variants={itemVariants}
          >
            {details}
          </motion.div>
        )}

        {/* Confirmation buttons with improved styling */}
        {(isConfirmation || isToolCode || isFunctionCall) && pendingFunctionCall && (
          <motion.div
            className="flex gap-2 mt-2 mx-2 p-2 bg-blue-50 rounded-md border border-blue-100"
            variants={itemVariants}
          >
            <div className="flex-1">
              <p className="text-xs text-blue-700 mb-2">
                {storedFunctionContext ?
                  `¿Confirmas ejecutar la acción "${getFriendlyFunctionName(storedFunctionContext.name)}"?` :
                  "¿Confirmas ejecutar esta acción?"}
              </p>

              <div className="flex gap-2">
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
                      Ejecutar
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
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress indicator for executing actions */}
        {(isExecuting || (isToolCode && isProcessing)) && (
          <motion.div
            className="flex items-center gap-2 mt-2 mx-2 p-2 text-xs bg-amber-50 rounded-md border border-amber-100"
            variants={itemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
            <span className="text-amber-700">Procesando acción...</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}