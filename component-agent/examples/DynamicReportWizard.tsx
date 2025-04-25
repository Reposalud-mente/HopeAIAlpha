import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper, Step, StepLabel } from '@/components/ui/stepper';

// Definición de tipos
type WizardStep = {
  id: string;
  label: string;
  component: React.ComponentType<StepProps>;
  canNavigateTo: (data: WizardData) => boolean;
  isComplete: (data: WizardData) => boolean;
};

type WizardData = Record<string, any>;

interface StepProps {
  onNext: (data: Record<string, any>) => void;
  onPrevious: () => void;
  data: WizardData;
}

interface WizardContextType {
  currentStep: number;
  wizardData: WizardData;
  goToStep: (step: number) => void;
  updateData: (data: Record<string, any>) => void;
  isStepComplete: (stepIndex: number) => boolean;
  canNavigateToStep: (stepIndex: number) => boolean;
}

// Esquemas de validación
const patientSelectionSchema = z.object({
  patientId: z.string().min(1, "Se requiere seleccionar un paciente"),
});

const templateSelectionSchema = z.object({
  templateId: z.string().min(1, "Se requiere seleccionar una plantilla"),
});

const clinicalInfoSchema = z.object({
  clinicalInfo: z.string().min(10, "La información clínica debe tener al menos 10 caracteres"),
});

// Contexto del Wizard
const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

// Componentes de los pasos
const PatientSelectionStep: React.FC<StepProps> = ({ onNext, data }) => {
  const [selectedPatient, setSelectedPatient] = useState<string>(data.patientId || '');
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    try {
      patientSelectionSchema.parse({ patientId: selectedPatient });
      onNext({ patientId: selectedPatient });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selección de Paciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="patient-select" className="text-sm font-medium">
              Seleccione un paciente
            </label>
            <select
              id="patient-select"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border rounded-md"
              aria-describedby="patient-error"
            >
              <option value="">Seleccionar paciente</option>
              <option value="1">Juan Pérez</option>
              <option value="2">María García</option>
              <option value="3">Carlos López</option>
            </select>
            {error && (
              <p id="patient-error" className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleNext}>Siguiente</Button>
      </CardFooter>
    </Card>
  );
};

const TemplateSelectionStep: React.FC<StepProps> = ({ onNext, onPrevious, data }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(data.templateId || '');
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    try {
      templateSelectionSchema.parse({ templateId: selectedTemplate });
      onNext({ templateId: selectedTemplate });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selección de Plantilla</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <div role="radiogroup" aria-labelledby="template-heading" className="space-y-2">
              <h3 id="template-heading" className="text-sm font-medium">
                Seleccione una plantilla de informe
              </h3>
              {[
                { id: '1', name: 'Evaluación Psicológica', description: 'Plantilla para evaluaciones psicológicas generales' },
                { id: '2', name: 'Informe Clínico', description: 'Plantilla para informes clínicos detallados' },
                { id: '3', name: 'Seguimiento Terapéutico', description: 'Plantilla para seguimiento de terapias' }
              ].map(template => (
                <div key={template.id} className="flex items-start space-x-2 p-2 border rounded-md">
                  <input
                    type="radio"
                    id={`template-${template.id}`}
                    name="template"
                    value={template.id}
                    checked={selectedTemplate === template.id}
                    onChange={() => setSelectedTemplate(template.id)}
                    className="mt-1"
                    aria-describedby={`template-desc-${template.id}`}
                  />
                  <div>
                    <label htmlFor={`template-${template.id}`} className="font-medium">
                      {template.name}
                    </label>
                    <p id={`template-desc-${template.id}`} className="text-sm text-gray-500">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={handleNext}>Siguiente</Button>
      </CardFooter>
    </Card>
  );
};

const ClinicalInfoStep: React.FC<StepProps> = ({ onNext, onPrevious, data }) => {
  const [clinicalInfo, setClinicalInfo] = useState<string>(data.clinicalInfo || '');
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    try {
      clinicalInfoSchema.parse({ clinicalInfo });
      onNext({ clinicalInfo });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Clínica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="clinical-info" className="text-sm font-medium">
              Información clínica relevante
            </label>
            <textarea
              id="clinical-info"
              value={clinicalInfo}
              onChange={(e) => setClinicalInfo(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[150px]"
              placeholder="Ingrese información clínica relevante para el informe..."
              aria-describedby="clinical-info-error"
            />
            {error && (
              <p id="clinical-info-error" className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={handleNext}>Siguiente</Button>
      </CardFooter>
    </Card>
  );
};

const SummaryStep: React.FC<StepProps> = ({ onNext, onPrevious, data }) => {
  // Obtener información del paciente (simulado)
  const patientInfo = useMemo(() => {
    const patients = {
      '1': { name: 'Juan Pérez', age: 35, gender: 'Masculino' },
      '2': { name: 'María García', age: 42, gender: 'Femenino' },
      '3': { name: 'Carlos López', age: 28, gender: 'Masculino' }
    };
    return patients[data.patientId as keyof typeof patients] || { name: 'Desconocido', age: 0, gender: 'No especificado' };
  }, [data.patientId]);

  // Obtener información de la plantilla (simulado)
  const templateInfo = useMemo(() => {
    const templates = {
      '1': 'Evaluación Psicológica',
      '2': 'Informe Clínico',
      '3': 'Seguimiento Terapéutico'
    };
    return templates[data.templateId as keyof typeof templates] || 'Desconocido';
  }, [data.templateId]);

  const handleSubmit = () => {
    onNext({ completed: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Informe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Información del Paciente</h3>
            <div className="mt-2 space-y-1">
              <p><span className="font-medium">Nombre:</span> {patientInfo.name}</p>
              <p><span className="font-medium">Edad:</span> {patientInfo.age}</p>
              <p><span className="font-medium">Género:</span> {patientInfo.gender}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Plantilla Seleccionada</h3>
            <p className="mt-2">{templateInfo}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Información Clínica</h3>
            <p className="mt-2 whitespace-pre-wrap">{data.clinicalInfo}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={handleSubmit}>Generar Informe</Button>
      </CardFooter>
    </Card>
  );
};

// Definición de los pasos del wizard
const wizardSteps: WizardStep[] = [
  {
    id: 'patient-selection',
    label: 'Selección de Paciente',
    component: PatientSelectionStep,
    canNavigateTo: () => true,
    isComplete: (data) => Boolean(data.patientId)
  },
  {
    id: 'template-selection',
    label: 'Selección de Plantilla',
    component: TemplateSelectionStep,
    canNavigateTo: (data) => Boolean(data.patientId),
    isComplete: (data) => Boolean(data.templateId)
  },
  {
    id: 'clinical-info',
    label: 'Información Clínica',
    component: ClinicalInfoStep,
    canNavigateTo: (data) => Boolean(data.patientId) && Boolean(data.templateId),
    isComplete: (data) => Boolean(data.clinicalInfo) && data.clinicalInfo.length >= 10
  },
  {
    id: 'summary',
    label: 'Resumen',
    component: SummaryStep,
    canNavigateTo: (data) => Boolean(data.patientId) && Boolean(data.templateId) && Boolean(data.clinicalInfo) && data.clinicalInfo.length >= 10,
    isComplete: (data) => Boolean(data.completed)
  }
];

// Componente principal del Wizard
interface DynamicReportWizardProps {
  initialData?: WizardData;
  onComplete: (data: WizardData) => void;
}

/**
 * DynamicReportWizard - Componente para la creación de informes clínicos dinámicos
 * 
 * Este componente implementa un wizard de múltiples pasos que guía al usuario
 * a través del proceso de creación de un informe clínico dinámico.
 * 
 * @component
 * @example
 * ```tsx
 * <DynamicReportWizard 
 *   initialData={{ patientId: '123' }}
 *   onComplete={(data) => saveReport(data)}
 * />
 * ```
 */
const DynamicReportWizard: React.FC<DynamicReportWizardProps> = ({ 
  initialData = {}, 
  onComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>(initialData);

  // Navegar al siguiente paso
  const handleNext = useCallback((data: Record<string, any>) => {
    setWizardData(prev => ({ ...prev, ...data }));
    
    if (currentStep === wizardSteps.length - 1) {
      // Último paso, completar el wizard
      onComplete({ ...wizardData, ...data });
    } else {
      // Avanzar al siguiente paso
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, wizardData, onComplete]);

  // Navegar al paso anterior
  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  // Navegar a un paso específico
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < wizardSteps.length && canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  }, [wizardData]);

  // Actualizar datos del wizard
  const updateData = useCallback((data: Record<string, any>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  }, []);

  // Verificar si un paso está completo
  const isStepComplete = useCallback((stepIndex: number) => {
    const step = wizardSteps[stepIndex];
    return step ? step.isComplete(wizardData) : false;
  }, [wizardData]);

  // Verificar si se puede navegar a un paso
  const canNavigateToStep = useCallback((stepIndex: number) => {
    const step = wizardSteps[stepIndex];
    return step ? step.canNavigateTo(wizardData) : false;
  }, [wizardData]);

  // Obtener el componente del paso actual
  const CurrentStepComponent = wizardSteps[currentStep].component;

  // Valor del contexto
  const contextValue = useMemo(() => ({
    currentStep,
    wizardData,
    goToStep,
    updateData,
    isStepComplete,
    canNavigateToStep
  }), [currentStep, wizardData, goToStep, updateData, isStepComplete, canNavigateToStep]);

  return (
    <WizardContext.Provider value={contextValue}>
      <div className="space-y-6">
        <Stepper activeStep={currentStep}>
          {wizardSteps.map((step, index) => (
            <Step
              key={step.id}
              completed={isStepComplete(index)}
              disabled={!canNavigateToStep(index)}
              onClick={() => canNavigateToStep(index) && goToStep(index)}
            >
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <CurrentStepComponent
          onNext={handleNext}
          onPrevious={handlePrevious}
          data={wizardData}
        />
      </div>
    </WizardContext.Provider>
  );
};

export default DynamicReportWizard;
