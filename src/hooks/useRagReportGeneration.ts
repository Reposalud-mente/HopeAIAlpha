/**
 * Hook for RAG-based clinical report generation
 */
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { WizardReportData, ReportGenerationOptions } from '@/lib/RagAI';

interface RagReportGenerationOptions extends ReportGenerationOptions {
  wizardData: WizardReportData;
}

interface RagReportGenerationResult {
  reportText?: string;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Hook for RAG-based clinical report generation
 */
export function useRagReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [result, setResult] = useState<RagReportGenerationResult | null>(null);
  const { toast } = useToast();

  // Define the phases of report generation
  const phases = [
    'Inicializando',
    'Recuperando contexto clínico',
    'Preparando datos',
    'Generando informe',
    'Finalizando',
  ];

  /**
   * Generates a clinical report using the RAG workflow
   * @param options Options for report generation
   * @returns Promise resolving to the generated report
   */
  const generateReport = async (options: RagReportGenerationOptions): Promise<RagReportGenerationResult> => {
    try {
      // Reset state
      setIsGenerating(true);
      setProgress(0);
      setCurrentPhase(phases[0]);
      setResult(null);

      // Initialize phase tracking
      let currentPhaseIndex = 0;
      const totalPhases = phases.length;
      const phaseInterval = 100 / totalPhases;

      // Update to the first phase
      setCurrentPhase(phases[currentPhaseIndex]);
      setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));

      // Make the API request
      const response = await fetch('/api/rag-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wizardData: options.wizardData,
          language: options.language,
          includeRecommendations: options.includeRecommendations,
          includeTreatmentPlan: options.includeTreatmentPlan,
          reportStyle: options.reportStyle,
        }),
      });

      // Simulate progress through phases
      const progressInterval = setInterval(() => {
        if (currentPhaseIndex < totalPhases - 1) {
          currentPhaseIndex++;
          setCurrentPhase(phases[currentPhaseIndex]);
          setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));
        } else {
          clearInterval(progressInterval);
        }
      }, 1500);

      // Parse the response
      const data = await response.json();

      // Clear the progress interval
      clearInterval(progressInterval);

      // Set the final phase and progress
      setCurrentPhase(phases[totalPhases - 1]);
      setProgress(100);

      // Handle the response
      if (response.ok && data.success) {
        const result = {
          reportText: data.reportText,
          metadata: data.metadata,
        };

        setResult(result);
        return result;
      } else {
        const error = data.error || 'Failed to generate report';
        
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });

        setResult({ error });
        return { error };
      }
    } catch (error) {
      console.error('Error generating report:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: 'Error',
        description: `Failed to generate report: ${errorMessage}`,
        variant: 'destructive',
      });

      setResult({ error: errorMessage });
      return { error: errorMessage };
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
