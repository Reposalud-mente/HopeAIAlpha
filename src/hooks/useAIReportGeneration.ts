import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface AIReportGenerationOptions {
  language?: 'es' | 'en';
  includeRecommendations?: boolean;
  includeTreatmentPlan?: boolean;
  reportStyle?: 'clinical' | 'educational' | 'concise';
}

interface AIReportGenerationResult {
  reportId?: string;
  reportText?: string;
  error?: string;
}

/**
 * Hook for AI report generation
 */
export function useAIReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [result, setResult] = useState<AIReportGenerationResult | null>(null);
  const { toast } = useToast();

  /**
   * Generates a report using the AI agent
   * @param assessmentId The assessment ID
   * @param options Options for report generation
   * @returns Promise resolving to the generation result
   */
  const generateReport = async (
    assessmentId: string,
    options: AIReportGenerationOptions = {}
  ): Promise<AIReportGenerationResult> => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setCurrentPhase('Preparando datos del paciente...');
      setResult(null);

      // Simulate progress through phases
      const phases = [
        'Preparando datos del paciente...',
        'Analizando motivos de consulta...',
        'Evaluando áreas psicológicas...',
        'Correlacionando con criterios CIE-11...',
        'Aplicando criterios DSM-5...',
        'Generando borrador de informe...',
        'Refinando contenido...',
        'Completando documento final...'
      ];

      // Start the progress simulation
      let currentPhaseIndex = 0;
      const totalPhases = phases.length;
      const phaseTime = 800; // Time per phase in ms

      const progressInterval = setInterval(() => {
        if (currentPhaseIndex < totalPhases - 1) {
          currentPhaseIndex++;
          setCurrentPhase(phases[currentPhaseIndex]);
          setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));
        } else {
          clearInterval(progressInterval);
        }
      }, phaseTime);

      // Make the actual API call
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessmentId,
          ...options,
        }),
      });

      // Clear the interval when the API call completes
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentPhase('Informe completado');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();

      // Set the result
      const generationResult = {
        reportId: data.reportId,
        reportText: data.reportText,
      };

      setResult(generationResult);

      // Show success toast
      toast({
        title: 'Informe generado',
        description: 'El informe ha sido generado exitosamente.',
        duration: 3000,
      });

      return generationResult;
    } catch (error) {
      console.error('Error generating report:', error);

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      // Set the error result
      const errorResult = {
        error: errorMessage,
      };

      setResult(errorResult);

      // Show error toast
      toast({
        title: 'Error al generar informe',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });

      return errorResult;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReport,
    isGenerating,
    progress,
    currentPhase,
    result,
  };
}
