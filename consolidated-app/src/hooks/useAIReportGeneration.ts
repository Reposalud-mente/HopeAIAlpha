import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ReportGeneratorService } from '@/lib/ai-report-generator/report-generator-service';

interface AIReportGenerationOptions {
  language?: 'es' | 'en';
  includeRecommendations?: boolean;
  includeTreatmentPlan?: boolean;
  reportStyle?: 'clinical' | 'educational' | 'concise';
  wizardData?: any; // Optional wizard data for direct AI report generation
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

  // Get the API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  // Create an instance of the report generator service with the API key
  const reportGeneratorService = new ReportGeneratorService(apiKey);

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

      // Define phases with more detailed descriptions
      const phases = [
        'Preparando datos del paciente...',
        'Analizando motivos de consulta...',
        'Evaluando áreas psicológicas...',
        'Correlacionando con criterios CIE-11...',
        'Aplicando criterios DSM-5...',
        'Iniciando modelo de IA...',
        'Generando borrador de informe...',
        'Estructurando contenido clínico...',
        'Refinando diagnóstico y recomendaciones...',
        'Completando documento final...'
      ];

      // Start the progress simulation with slower progression
      let currentPhaseIndex = 0;
      const totalPhases = phases.length;
      const initialPhases = 5; // Number of phases to show before AI generation starts
      const phaseTime = 1200; // Time per phase in ms (slower to give more time for reading)

      setCurrentPhase(phases[currentPhaseIndex]);
      setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));

      const progressInterval = setInterval(() => {
        if (currentPhaseIndex < initialPhases - 1) {
          // Move through initial phases at regular intervals
          currentPhaseIndex++;
          setCurrentPhase(phases[currentPhaseIndex]);
          setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));
        } else if (currentPhaseIndex === initialPhases - 1) {
          // Pause at the "Iniciando modelo de IA" phase
          currentPhaseIndex++;
          setCurrentPhase(phases[currentPhaseIndex]);
          setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));
        }
        // The remaining phases will be updated during/after the actual AI generation
      }, phaseTime);

      // Generate the report using our service
      let generationResult;

      try {
        // Update to the next phase - AI generation is starting
        currentPhaseIndex = Math.max(initialPhases, currentPhaseIndex);
        setCurrentPhase(phases[currentPhaseIndex]);
        setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));

        if (options.wizardData) {
          // If wizard data is provided, use it directly with the AI report generator
          const { generateClinicalReport } = await import('@/lib/ai-report-generator/ai-report-generating');
          const reportText = await generateClinicalReport(options.wizardData, apiKey);
          generationResult = { reportText };
        } else {
          // Otherwise, use the report generator service
          generationResult = await reportGeneratorService.generateReport(assessmentId, options);
        }

        // AI generation is complete, move to the next phase
        currentPhaseIndex++;
        setCurrentPhase(phases[currentPhaseIndex]);
        setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));

        // Wait a moment before moving to the next phase
        await new Promise(resolve => setTimeout(resolve, phaseTime));

        // Move to the refinement phase
        currentPhaseIndex++;
        setCurrentPhase(phases[currentPhaseIndex]);
        setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));

        // Wait a moment before completing
        await new Promise(resolve => setTimeout(resolve, phaseTime));
      } finally {
        // Clear the interval when the generation completes or fails
        clearInterval(progressInterval);
      }

      // Final phase - report is complete
      setProgress(100);
      setCurrentPhase('Informe completado');

      if ('error' in generationResult) {
        throw new Error(generationResult.error);
      }

      // Save the report to the database if we have a real assessment ID
      let data = { id: `temp-${Date.now()}` };

      if (assessmentId && !assessmentId.startsWith('temp-')) {
        const response = await fetch(`/api/assessments/${assessmentId}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportText: generationResult.reportText,
            isFinal: false, // Draft version
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save report');
        }

        data = await response.json();
      }

      // Set the result
      const result = {
        reportId: data.id,
        reportText: generationResult.reportText,
      };

      setResult(result);

      // Show success toast
      toast({
        title: 'Informe generado',
        description: 'El informe ha sido generado exitosamente.',
        duration: 3000,
      });

      return result;
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
