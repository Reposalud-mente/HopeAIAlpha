/**
 * Tool visualizer component for the Enhanced AI Floating Assistant
 * Displays function calls and their results
 */

'use client';

import React from 'react';
import { Terminal, Check, X, Loader2, ArrowRight, Database, Search, Calendar, Bell, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunctionCall, FunctionResult } from '../types';
import styles from './styles.module.css';

interface ToolVisualizerProps {
  functionCall: FunctionCall;
  functionResult?: FunctionResult;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Tool visualizer component
 */
export function ToolVisualizer({
  functionCall,
  functionResult,
  onConfirm,
  onCancel,
  isLoading = false,
}: ToolVisualizerProps) {
  // Format function name for display
  const formatFunctionName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
  };

  // Get function display name
  const functionDisplayName = formatFunctionName(functionCall.name);

  // Determine if the function has been executed
  const isExecuted = !!functionResult;

  // Get the appropriate icon for the function
  const getFunctionIcon = (name: string) => {
    switch (name) {
      case 'search_patients':
        return <Search size={16} className="text-blue-500" />;
      case 'schedule_session':
        return <Calendar size={16} className="text-green-500" />;
      case 'create_reminder':
        return <Bell size={16} className="text-amber-500" />;
      case 'generate_report':
        return <FileText size={16} className="text-purple-500" />;
      default:
        return <Terminal size={16} className="text-gray-500" />;
    }
  };

  // Format result for display
  const formatResult = (result: any) => {
    if (!result) return 'No hay resultados';

    // Special handling for patient search results
    if (functionCall.name === 'search_patients' && Array.isArray(result)) {
      return (
        <div className={styles.resultList}>
          {result.length === 0 ? (
            <div className={styles.emptyResult}>No se encontraron pacientes</div>
          ) : (
            result.map((patient, index) => (
              <div key={index} className={`${styles.resultItem} ${styles.patientCard}`}>
                <div className={styles.patientHeader}>
                  <span className={styles.patientName}>{patient.name || 'Paciente'}</span>
                  {patient.id && <span className={styles.patientId}>ID: {patient.id}</span>}
                </div>
                {Object.entries(patient).filter(([key]) => !['id', 'name'].includes(key)).map(([key, value]) => (
                  <div key={key} className={styles.resultProperty}>
                    <span className={styles.resultPropertyName}>{formatFunctionName(key)}:</span>
                    <span className={styles.resultPropertyValue}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      );
    }

    // Special handling for schedule confirmation
    if (functionCall.name === 'schedule_session' && typeof result === 'object' && result.success) {
      return (
        <div className={styles.successResult}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successMessage}>
            Sesión programada correctamente para {result.patientName || 'el paciente'} el {result.date} a las {result.time}.
          </div>
        </div>
      );
    }

    // Special handling for reminder creation
    if (functionCall.name === 'create_reminder' && typeof result === 'object' && result.success) {
      return (
        <div className={styles.successResult}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successMessage}>
            Recordatorio "{result.title}" creado para el {result.date} a las {result.time}.
          </div>
        </div>
      );
    }

    // Generic array handling
    if (Array.isArray(result)) {
      return (
        <div className={styles.resultList}>
          {result.length === 0 ? (
            <div className={styles.emptyResult}>No se encontraron resultados</div>
          ) : (
            result.map((item, index) => (
              <div key={index} className={styles.resultItem}>
                {typeof item === 'object' ? (
                  Object.entries(item).map(([key, value]) => (
                    <div key={key} className={styles.resultProperty}>
                      <span className={styles.resultPropertyName}>{formatFunctionName(key)}:</span>
                      <span className={styles.resultPropertyValue}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div>{String(item)}</div>
                )}
              </div>
            ))
          )}
        </div>
      );
    }

    // Generic object handling
    if (typeof result === 'object') {
      return (
        <div className={styles.resultObject}>
          {Object.entries(result).map(([key, value]) => (
            <div key={key} className={styles.resultProperty}>
              <span className={styles.resultPropertyName}>{formatFunctionName(key)}:</span>
              <span className={styles.resultPropertyValue}>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      );
    }

    return String(result);
  };

  return (
    <div className={`${styles.functionCallContainer} ${isExecuted ? styles.functionCallExecuted : ''}`}>
      <div className={styles.functionCallTitle}>
        {getFunctionIcon(functionCall.name)}
        {isExecuted ? 'Acción ejecutada:' : 'Acción propuesta:'} {functionDisplayName}
      </div>

      {/* Function parameters */}
      <div className={styles.functionCallParams}>
        {Object.entries(functionCall.args).map(([key, value]) => (
          <div key={key} className={styles.functionCallParam}>
            <span className={styles.functionCallParamName}>{formatFunctionName(key)}:</span>
            <span className={styles.functionCallParamValue}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && !isExecuted && (
        <div className={styles.loadingState}>
          <Loader2 size={16} className="animate-spin mr-2" />
          <span>Ejecutando acción...</span>
        </div>
      )}

      {/* Function result */}
      {isExecuted && functionResult && (
        <div className={styles.toolVisualizer}>
          <div className={styles.toolVisualizerTitle}>
            <Check size={16} className="text-green-500" />
            <span>Resultado</span>
          </div>
          <div className={styles.toolVisualizerResult}>
            {formatResult(functionResult.result)}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isExecuted && onConfirm && onCancel && (
        <div className={styles.functionCallActions}>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className={styles.cancelButton}
          >
            <X size={16} className="mr-1" />
            <span>Cancelar</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.confirmButton}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin mr-1" />
            ) : (
              <ArrowRight size={16} className="mr-1" />
            )}
            <span>Ejecutar</span>
          </Button>
        </div>
      )}
    </div>
  );
}
