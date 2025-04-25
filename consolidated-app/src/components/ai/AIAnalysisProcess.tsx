'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertCircle, Sparkles, BrainCircuit, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePatient } from '@/contexts/PatientContext';
import { useAIReportGeneration } from '@/hooks/useAIReportGeneration';

// AI analysis process that generates a psychological report using the AI agent
interface AIAnalysisProcessProps {
  onAnalysisComplete: (draftText: string) => void;
  areasEvaluacion: string[];
  criteriosCIE: string[];
  motivosConsulta: string[];
  assessmentId?: string; // Optional assessment ID for real database integration
}

export function AIAnalysisProcess({
  onAnalysisComplete,
  areasEvaluacion,
  criteriosCIE,
  motivosConsulta,
  assessmentId
}: AIAnalysisProcessProps) {
  const { currentPatient } = usePatient();
  const {
    generateReport,
    isGenerating,
    progress,
    currentPhase,
    result
  } = useAIReportGeneration();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPatient) {
      setError('No se ha seleccionado un paciente');
      return;
    }

    // If we have an assessment ID, use the real AI agent
    if (assessmentId) {
      handleRealReportGeneration();
    } else {
      // Otherwise, use the mock implementation for backward compatibility
      handleMockReportGeneration();
    }
  }, [currentPatient, assessmentId]);

  // Handle real report generation using the AI agent
  const handleRealReportGeneration = async () => {
    try {
      if (!assessmentId) {
        setError('No se ha proporcionado un ID de evaluación');
        return;
      }

      // Generate the report using the AI agent
      const result = await generateReport(assessmentId, {
        includeRecommendations: true,
        includeTreatmentPlan: true,
        reportStyle: 'clinical'
      });

      // If successful, pass the report text to the parent component
      if (result.reportText) {
        onAnalysisComplete(result.reportText);
      } else if (result.error) {
        setError(`Error al generar el informe: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Error al generar el informe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Handle mock report generation for backward compatibility
  const handleMockReportGeneration = () => {
    // Phases of the mock analysis process
    const phases = [
      'Preparando datos del paciente...',
      'Analizando motivos de consulta...',
      'Evaluando áreas psicológicas...',
      'Correlacionando con criterios CIE-11...',
      'Generando borrador de informe...',
      'Refinando contenido...',
      'Completando documento final...'
    ];

    let currentPhaseIndex = 0;
    const totalPhases = phases.length;
    const phaseTime = 1000; // Time per phase in ms

    // Simulate AI processing through each phase
    const processInterval = setInterval(() => {
      if (currentPhaseIndex < totalPhases - 1) {
        currentPhaseIndex++;
        // No need to set phase and progress as they're now managed by the hook
        if (currentPhaseIndex < phases.length) {
          // setCurrentPhase(phases[currentPhaseIndex]);
          // setProgress(Math.floor((currentPhaseIndex / (totalPhases - 1)) * 100));
        }
      } else {
        // Complete the process
        clearInterval(processInterval);
        // setProgress(100);

        // Generate a mock report based on the provided data
        generateMockReport();
      }
    }, phaseTime);

    return () => clearInterval(processInterval);
  };

  // Generate a mock psychological report based on the provided data
  const generateMockReport = () => {
    // Mock report template - this is used when no assessmentId is provided
    const patientName = currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'Paciente';
    const patientId = currentPatient?.id || 'ID-Unknown';

    // Sample report text based on the selected areas and criteria
    const areasText = areasEvaluacion.map(area => {
      switch(area) {
        case 'cognitiva':
          return 'En la evaluación de la función cognitiva, el paciente muestra capacidades dentro del rango esperado en atención, memoria y razonamiento.';
        case 'emocional':
          return 'Se observa cierta dificultad en la regulación emocional, particularmente en situaciones de estrés agudo.';
        case 'conductual':
          return 'Los patrones conductuales muestran adaptación adecuada en entornos estructurados, pero cierta dificultad en situaciones menos previsibles.';
        default:
          return `Se realizó evaluación del área ${area}.`;
      }
    }).join('\n\n');

    const criteriosText = criteriosCIE.map(criterio => {
      return `De acuerdo con los criterios CIE-11, se observan características compatibles con ${criterio}.`;
    }).join('\n\n');

    const motivosText = motivosConsulta.join(', ');

    // Assemble the complete report
    const reportDraft = `
# INFORME PSICOLÓGICO

## DATOS DE IDENTIFICACIÓN
**Paciente:** ${patientName}
**ID:** ${patientId}

## MOTIVO DE CONSULTA
El paciente acude por: ${motivosText}

## ÁREAS EVALUADAS
${areasText}

## DIAGNÓSTICO
${criteriosText}

## CONCLUSIONES Y RECOMENDACIONES
Basado en la evaluación realizada, se recomienda un seguimiento terapéutico enfocado en las áreas identificadas de mejora. Se sugiere un enfoque de terapia cognitivo-conductual, con sesiones semanales durante un período inicial de 12 semanas.

## PLAN DE TRATAMIENTO
1. Psicoeducación sobre el diagnóstico identificado
2. Desarrollo de habilidades de afrontamiento y regulación emocional
3. Restructuración cognitiva de patrones de pensamiento desadaptativos
4. Establecimiento de rutinas y hábitos saludables

Este informe es de carácter confidencial y debe ser utilizado sólo por profesionales de la salud mental autorizados.
`;

    // Pass the generated report to the parent component
    onAnalysisComplete(reportDraft);
  };

  if (error) {
    return (
      <Card className="border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            Error en el análisis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isGenerating || (!error && !result)) {
    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
            <BrainCircuit className="h-5 w-5 text-blue-600 mr-2" />
            Análisis IA en proceso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Nuestro sistema está analizando la información del paciente para generar un borrador de informe.
            </p>

            <div className="space-y-2 bg-blue-50/50 p-4 rounded-md border border-blue-100">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-700">{currentPhase}</span>
                <span className="text-blue-700">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-blue-100" />
            </div>

            <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-md">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Procesando datos clínicos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show success state
  if (result && !result.error) {
    return (
      <Card className="border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-white border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            Informe generado correctamente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 bg-green-50 p-4 rounded-md border border-green-100">
            <FileText className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">El borrador del informe está listo para su revisión.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4">
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
          <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
          Análisis IA en proceso
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Nuestro sistema está analizando la información del paciente para generar un borrador de informe.
          </p>

          <div className="space-y-2 bg-blue-50/50 p-4 rounded-md border border-blue-100">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-blue-700">{currentPhase}</span>
              <span className="text-blue-700">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-blue-100" />
          </div>

          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-3 rounded-md">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Procesando datos clínicos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}