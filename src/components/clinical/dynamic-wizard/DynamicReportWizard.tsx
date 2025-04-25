'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  User, 
  ClipboardList, 
  MessageCircle, 
  Layers, 
  ListChecks, 
  Sparkles,
  Brain,
  HeartPulse,
  Users,
  GraduationCap,
  FileCheck,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Importar componentes de pasos
import PatientSelectionStep from './steps/PatientSelectionStep';
import ReportTypeSelectionStep from './steps/ReportTypeSelectionStep';

// Importar componentes específicos para cada tipo de informe
import PsychologicalEvaluationSteps from './workflows/PsychologicalEvaluationSteps';
import TherapeuticFollowupSteps from './workflows/TherapeuticFollowupSteps';
import NeuropsychologicalEvaluationSteps from './workflows/NeuropsychologicalEvaluationSteps';
import FamilyReportSteps from './workflows/FamilyReportSteps';
import EducationalReportSteps from './workflows/EducationalReportSteps';
import DischargeReportSteps from './workflows/DischargeReportSteps';
import ReportGenerationStep from './steps/ReportGenerationStep';

// Definir la interfaz para el estado del formulario
interface FormState {
  // Datos básicos
  clinica: string;
  psicologo: string;
  fecha: string;
  activeStep: number;
  
  // Tipo de informe
  tipoInforme: string;
  
  // Campos para todos los tipos de informes
  reportData: {
    [key: string]: any;
  };
}

// Definir la interfaz para un paso del workflow
export interface WorkflowStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  validationFn?: (formState: FormState) => boolean;
}

// Definir los pasos base que siempre están presentes
const BASE_STEPS: WorkflowStep[] = [
  {
    id: 'patient-selection',
    label: 'Selección de Paciente',
    icon: <User className="w-5 h-5 text-blue-500" />,
    component: PatientSelectionStep,
    validationFn: (formState: FormState) => !!formState.reportData.patientId
  },
  {
    id: 'report-type-selection',
    label: 'Selección de Tipo de Informe',
    icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
    component: ReportTypeSelectionStep,
    validationFn: (formState: FormState) => !!formState.tipoInforme
  }
];

// Definir el paso final de generación de informe
const FINAL_STEP: WorkflowStep = {
  id: 'report-generation',
  label: 'Generación de Informe',
  icon: <Sparkles className="w-5 h-5 text-blue-500" />,
  component: ReportGenerationStep,
  validationFn: () => true
};

// Definir los flujos de trabajo específicos para cada tipo de informe
const WORKFLOW_DEFINITIONS: { [key: string]: WorkflowStep[] } = {
  'evaluacion-psicologica': PsychologicalEvaluationSteps,
  'seguimiento-terapeutico': TherapeuticFollowupSteps,
  'evaluacion-neuropsicologica': NeuropsychologicalEvaluationSteps,
  'informe-familiar': FamilyReportSteps,
  'informe-educativo': EducationalReportSteps,
  'alta-terapeutica': DischargeReportSteps
};

// Componente principal del wizard dinámico
export default function DynamicReportWizard() {
  const { currentPatient } = usePatient();
  
  // Estado del formulario
  const [formState, setFormState] = useState<FormState>({
    clinica: 'Centro de Psicología Clínica',
    psicologo: 'Dr. Juan Martínez',
    fecha: format(new Date(), 'dd/MM/yyyy'),
    activeStep: 0,
    tipoInforme: '',
    reportData: {}
  });
  
  // Estado para controlar si se está generando el informe
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Obtener los pasos actuales basados en el tipo de informe seleccionado
  const getCurrentSteps = (): WorkflowStep[] => {
    const specificSteps = formState.tipoInforme 
      ? WORKFLOW_DEFINITIONS[formState.tipoInforme] || []
      : [];
    
    return [...BASE_STEPS, ...specificSteps, FINAL_STEP];
  };
  
  // Obtener el paso actual
  const currentSteps = getCurrentSteps();
  const currentStep = currentSteps[formState.activeStep];
  
  // Función para actualizar el estado del formulario
  const updateForm = (updates: Partial<FormState>) => {
    setFormState(prev => ({
      ...prev,
      ...updates,
      reportData: {
        ...prev.reportData,
        ...(updates.reportData || {})
      }
    }));
  };
  
  // Función para actualizar datos específicos del informe
  const updateReportData = (updates: { [key: string]: any }) => {
    setFormState(prev => ({
      ...prev,
      reportData: {
        ...prev.reportData,
        ...updates
      }
    }));
  };
  
  // Función para avanzar al siguiente paso
  const handleNextStep = () => {
    if (formState.activeStep < currentSteps.length - 1) {
      // Si estamos en el paso de selección de tipo de informe y cambia el tipo,
      // necesitamos recalcular los pasos
      if (currentStep.id === 'report-type-selection') {
        // Actualizar los pasos basados en el nuevo tipo de informe
        const newSteps = getCurrentSteps();
        setFormState(prev => ({
          ...prev,
          activeStep: 2 // Avanzar al primer paso específico del tipo de informe
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          activeStep: prev.activeStep + 1
        }));
      }
    }
  };
  
  // Función para retroceder al paso anterior
  const handlePreviousStep = () => {
    if (formState.activeStep > 0) {
      setFormState(prev => ({
        ...prev,
        activeStep: prev.activeStep - 1
      }));
    }
  };
  
  // Verificar si se puede avanzar al siguiente paso
  const canProceedToNextStep = (): boolean => {
    const validationFn = currentStep.validationFn;
    return validationFn ? validationFn(formState) : true;
  };
  
  // Renderizar el componente del paso actual
  const CurrentStepComponent = currentStep.component;
  
  return (
    <Card className="border border-gray-200 shadow-md rounded-lg overflow-hidden">
      {/* Indicador de pasos */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {currentStep.label}
          </h2>
          <div className="text-sm text-gray-500">
            Paso {formState.activeStep + 1} de {currentSteps.length}
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          {currentSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index === formState.activeStep 
                    ? 'bg-blue-500 text-white' 
                    : index < formState.activeStep 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.icon}
              </div>
              
              {index < currentSteps.length - 1 && (
                <div 
                  className={`flex-1 h-1 mx-2 ${
                    index < formState.activeStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Contenido del paso actual */}
      <div className="p-6">
        <CurrentStepComponent 
          formState={formState}
          updateForm={updateForm}
          updateReportData={updateReportData}
          onComplete={handleNextStep}
        />
      </div>
      
      {/* Botones de navegación */}
      <div className="bg-gray-50 px-6 py-4 flex justify-between border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePreviousStep}
          disabled={formState.activeStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        {formState.activeStep === currentSteps.length - 1 ? (
          <Button
            variant="default"
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating || !canProceedToNextStep()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? 'Generando...' : 'Generar Informe'}
            <Sparkles className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={handleNextStep}
            disabled={!canProceedToNextStep()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
