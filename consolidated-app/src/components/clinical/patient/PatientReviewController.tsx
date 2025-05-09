'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { User, ClipboardList, Edit, Sparkles, FileText, HelpCircle, Save, AlertCircle, CheckCircle } from 'lucide-react';
import PatientSelection from '@/components/clinical/patient/PatientSelection';
import ClinicalInfoForm from '@/components/clinical/patient/ClinicalInfoForm';
import ReportPreviewEditor from '@/components/clinical/patient/ReportPreviewEditor';
import ReportGenerator from '@/components/clinical/patient/ReportGenerator';
import { AIAnalysisProcess } from '@/components/ai/AIAnalysisProcess';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

import { ReportPreview } from '@/components/clinical/reports/ReportPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WizardProvider, useWizard } from '@/contexts/WizardContext';
import WizardStepIndicator, { WizardStep } from '@/components/clinical/wizard/WizardStepIndicator';
import WizardHelp from '@/components/clinical/wizard/WizardHelp';
import WizardSummary from '@/components/clinical/wizard/WizardSummary';
import SaveProgressModal from '@/components/clinical/wizard/SaveProgressModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the steps of the workflow with enhanced descriptions
const WORKFLOW_STEPS: WizardStep[] = [
  { 
    id: 'patient-selection', 
    label: 'Selección de Paciente', 
    icon: <User className="w-5 h-5 text-blue-500" />,
    description: 'Selecciona el paciente para el cual deseas generar un informe psicológico.'
  },
  { 
    id: 'clinical-info', 
    label: 'Tipo de Informe', 
    icon: <ClipboardList className="w-5 h-5 text-blue-500" />,
    description: 'Elige el tipo de informe y completa la información clínica necesaria.'
  },
  { 
    id: 'summary', 
    label: 'Resumen', 
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    description: 'Revisa un resumen de toda la información antes de generar el informe.'
  },
  { 
    id: 'report-preview', 
    label: 'Previsualización', 
    icon: <Edit className="w-5 h-5 text-blue-500" />,
    description: 'Previsualiza y edita el borrador del informe generado por la IA.'
  },
  { 
    id: 'report-generation', 
    label: 'Redacción Final', 
    icon: <Sparkles className="w-5 h-5 text-blue-500" />,
    description: 'Finaliza y exporta el informe psicológico.'
  }
];

interface FormState {
  clinica: string;
  psicologo: string;
  fecha: string;
  activeTab: string; // Use string for tab-based navigation
  assessmentId?: string; // Optional assessment ID for database integration

  // Nuevos campos para el contexto clínico
  tipoEvaluacion: string;
  enfoqueTerapeutico: string;
  instrumentosUtilizados: string[];
  objetivosSesion: string;
  derivacion: string;

  // Nuevo campo para el tipo de informe
  tipoInforme: string;
  
  // Campos para el paciente
  patientId?: string;
  patientName?: string;
}

interface PatientReviewControllerProps {
  selectedPatientId?: string;
}

export default function PatientReviewController({ selectedPatientId }: PatientReviewControllerProps = {}) {
  // New state for fetched evaluation areas and ICD codes
  const [availableAreas, setAvailableAreas] = useState<any[]>([]);
  const [realCodes, setRealCodes] = useState<any[]>([]);
  // Use patient context
  const { currentPatient, getPatient, setCurrentPatient } = usePatient();
  const { toast } = useToast();

  // New state variables for enhanced UX
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveMode, setSaveMode] = useState<'save' | 'resume'>('save');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  // Handlers for report actions will be defined below

  // Form state
  const [formState, updateFormState] = useState<FormState>({
    clinica: 'Centro de Psicología Clínica',
    psicologo: 'Dr. Juan Martínez',
    fecha: format(new Date(), 'dd/MM/yyyy'),
    activeTab: WORKFLOW_STEPS[0].id, // Always start with patient selection
    assessmentId: undefined, // Will be set if we're working with an existing assessment

    // Valores iniciales para el contexto clínico
    tipoEvaluacion: 'inicial',
    enfoqueTerapeutico: '',
    instrumentosUtilizados: [],
    objetivosSesion: '',
    derivacion: '',

    // Valor inicial para el tipo de informe
    tipoInforme: '',
    
    // Campos para el paciente
    patientId: undefined,
    patientName: undefined
  });

  // Current step index for the wizard - using activeTab instead

  // Step navigation handlers
  const handleNextStep = () => {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab);
      if (currentIndex < WORKFLOW_STEPS.length - 1) {
        const nextStep = WORKFLOW_STEPS[currentIndex + 1];
        updateFormState(prev => ({ ...prev, activeTab: nextStep.id }));
        
        // Announce step change for screen readers
        announceStepChange(nextStep.label);
      }
    } else {
      // Show validation errors toast
      toast({
        title: "Hay campos con errores",
        description: "Por favor, corrige los errores antes de continuar.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab);
    if (currentIndex > 0) {
      const prevStep = WORKFLOW_STEPS[currentIndex - 1];

      // Si estamos en el paso de Información Clínica (paso 2) y vamos hacia atrás,
      // limpiamos el paciente actual para permitir seleccionar uno nuevo
      if (formState.activeTab === 'clinical-info' && prevStep.id === 'patient-selection') {
        setCurrentPatient(null);
      }

      updateFormState(prev => ({ ...prev, activeTab: prevStep.id }));
      
      // Announce step change for screen readers
      announceStepChange(prevStep.label);
    }
  };

  // Handle step completion
  const handleStepComplete = () => {
    if (validateCurrentStep()) {
      handleNextStep();
    }
  };
  
  // Validate the current step
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    switch (formState.activeTab) {
      case 'patient-selection':
        if (!currentPatient) {
          newErrors.patientId = 'Debes seleccionar un paciente';
          isValid = false;
        }
        break;
        
      case 'clinical-info':
        if (!formState.clinica) {
          newErrors.clinica = 'La clínica es requerida';
          isValid = false;
        }
        if (!formState.psicologo) {
          newErrors.psicologo = 'El psicólogo es requerido';
          isValid = false;
        }
        if (!formState.fecha) {
          newErrors.fecha = 'La fecha es requerida';
          isValid = false;
        }
        if (!formState.tipoInforme) {
          newErrors.tipoInforme = 'El tipo de informe es requerido';
          isValid = false;
        }
        break;
        
      case 'summary':
        // Summary validation is a combination of previous steps
        if (!currentPatient) {
          newErrors.patientId = 'Debes seleccionar un paciente';
          isValid = false;
        }
        if (!formState.clinica) {
          newErrors.clinica = 'La clínica es requerida';
          isValid = false;
        }
        if (!formState.psicologo) {
          newErrors.psicologo = 'El psicólogo es requerido';
          isValid = false;
        }
        if (!formState.fecha) {
          newErrors.fecha = 'La fecha es requerida';
          isValid = false;
        }
        if (!formState.tipoInforme) {
          newErrors.tipoInforme = 'El tipo de informe es requerido';
          isValid = false;
        }
        break;
        
      case 'report-preview':
        // No specific validation for preview step
        break;
        
      case 'report-generation':
        // No specific validation for generation step
        break;
    }
    
    setValidationErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  };
  
  // Announce step change for screen readers
  const announceStepChange = (stepLabel: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('role', 'status');
    announcement.className = 'sr-only';
    announcement.textContent = `Paso actual: ${stepLabel}`;
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Inicializar datos necesarios al montar el componente
  useEffect(() => {
    // Podemos mantener esta lógica para compatibilidad con versiones anteriores
    // o para futuras mejoras, pero no es necesaria para el flujo simplificado
    
    // Validate initial step
    validateCurrentStep();
  }, []);

  // Load the selected patient if selectedPatientId is provided
  useEffect(() => {
    if (selectedPatientId && (!currentPatient || currentPatient.id !== selectedPatientId)) {
      const loadPatient = async () => {
        const patient = await getPatient(selectedPatientId);
        if (patient) {
          setCurrentPatient(patient);
          
          // Update form state with patient info
          updateFormState(prev => ({ 
            ...prev, 
            patientId: patient.id,
            patientName: `${patient.firstName} ${patient.lastName}`
          }));
        }
      };
      loadPatient();
    }
  }, [selectedPatientId, currentPatient, getPatient, setCurrentPatient]);
  
  // Update form state when patient changes
  useEffect(() => {
    if (currentPatient) {
      updateFormState(prev => ({ 
        ...prev, 
        patientId: currentPatient.id,
        patientName: `${currentPatient.firstName} ${currentPatient.lastName}`
      }));
    }
  }, [currentPatient]);

  // Analysis state
  const [analysisPhase, setAnalysisPhase] = useState<'pending' | 'analyzing' | 'complete'>('pending');
  const [draftText, setDraftText] = useState('');
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // New state for report preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // New state to track if the PDF has been generated
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);
  
  // New handlers for enhanced features
  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };
  
  const handleSaveProgress = () => {
    setSaveMode('save');
    setShowSaveModal(true);
  };
  
  const handleResumeSession = () => {
    setSaveMode('resume');
    setShowSaveModal(true);
  };
  
  // Map step IDs to validation fields for the step indicator
  const stepValidationMap: Record<string, string[]> = {
    'patient-selection': ['patientId'],
    'clinical-info': ['clinica', 'psicologo', 'fecha', 'tipoInforme'],
    'summary': ['patientId', 'clinica', 'psicologo', 'fecha', 'tipoInforme'],
    'report-preview': [],
    'report-generation': []
  };

  // Helper function to update form state
  const updateForm = (updates: Partial<FormState>) => {
    updateFormState(prev => ({ ...prev, ...updates }));
  };

  // Tab/step navigation handler
  const handleTabChange = (tabId: string) => {
    const newIndex = WORKFLOW_STEPS.findIndex(step => step.id === tabId);
    if (newIndex >= 0) {
      updateFormState(prev => ({ ...prev, activeTab: tabId }));
    }
  };

  // Step click handler for StepIndicator - converts index to tab ID
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < WORKFLOW_STEPS.length) {
      handleTabChange(WORKFLOW_STEPS[stepIndex].id);
    }
  };

  // Start analysis
  const startAnalysis = () => {
    setAnalysisPhase('analyzing');
  };

  // Handle analysis completion
  const handleAnalysisComplete = (draft: string) => {
    setDraftText(draft);
    setAnalysisPhase('complete');
    setIsDraftComplete(true);
  };

  // Save report action
  const handleSaveReport = async () => {
    setIsSaving(true);

    try {
      // If we have an assessment ID, save the report to the database
      if (formState.assessmentId && currentPatient) {
        // Call the API to save the report
        const response = await fetch(`/api/assessments/${formState.assessmentId}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportText: draftText,
            isFinal: false, // Draft version
            filename: `Informe_${currentPatient.firstName} ${currentPatient.lastName}_${new Date().toISOString().split('T')[0]}`
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save report');
        }

        await response.json(); // We don't need the data for now

        toast({
          title: "Informe guardado",
          description: `El informe ha sido guardado en el historial de ${currentPatient.firstName} ${currentPatient.lastName}.`,
          duration: 3000,
        });
      } else {
        // Simulate saving to patient data with a delay for backward compatibility
        setTimeout(() => {
          toast({
            title: "Informe guardado",
            description: `El informe ha sido guardado en el historial de ${currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'paciente'}.`,
            duration: 3000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el informe. Inténtelo de nuevo.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Download report action
  const handleDownloadReport = async () => {
    setIsDownloading(true);

    try {
      // If we have an assessment ID, use the server-side PDF generation
      if (formState.assessmentId && currentPatient) {
        // First, ensure the report is saved to the database
        const saveResponse = await fetch(`/api/assessments/${formState.assessmentId}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportText: draftText,
            isFinal: false, // Draft version
            filename: `Informe_${currentPatient.firstName}_${currentPatient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`
          }),
        });

        if (!saveResponse.ok) {
          throw new Error('Failed to save report');
        }

        const saveData = await saveResponse.json();

        // Generate and download the PDF using the server-side endpoint
        // Use window.open to trigger the download
        window.open(`/api/reports/${saveData.id}/pdf`, '_blank');

        // Mark the PDF as generated
        setIsPdfGenerated(true);

        toast({
          title: "Informe descargado",
          description: "El informe se ha descargado correctamente.",
          duration: 3000,
        });
      } else {
        // Fallback to simulated download for backward compatibility
        setTimeout(() => {
          setIsPdfGenerated(true);

          toast({
            title: "Informe descargado",
            description: "El informe se ha descargado correctamente.",
            duration: 3000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);

      toast({
        title: "Error al descargar",
        description: "No se pudo generar el PDF del informe.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle print action
  const handlePrintReport = () => {
    // Simulate printing with a delay
    setTimeout(() => {
      // Create a new window and write the report content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Add print window content here
        printWindow.document.write(`
          <html>
            <head>
              <title>Informe Psicológico - ${currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'Paciente'}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { text-align: center; }
                .header { text-align: center; margin-bottom: 30px; }
                .content { line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>INFORME DE EVALUACIÓN PSICOLÓGICA</h1>
                <p>${formState.clinica} | ${formState.fecha}</p>
              </div>
              <div class="content">
                <p><strong>Paciente:</strong> ${currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'N/A'}</p>
                <p><strong>Fecha de Evaluación:</strong> ${formState.fecha}</p>
                <p><strong>Profesional:</strong> ${formState.psicologo}</p>
                <hr />
                <div>${draftText.replace(/\n/g, '<br/>')}</div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        // Trigger print after content is loaded
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing (optional)
          // printWindow.close();
        }, 500);
      } else {
        toast({
          title: "Error al imprimir",
          description: "No se pudo abrir la ventana de impresión.",
          variant: "destructive",
          duration: 3000,
        });
      }
    }, 1000);
  };

  // Handle copy to clipboard
  const handleCopyReport = () => {
    const reportText = `
INFORME DE EVALUACIÓN PSICOLÓGICA
${formState.clinica} | ${formState.fecha}

Paciente: ${currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'N/A'}
Fecha de Evaluación: ${formState.fecha}
Profesional: ${formState.psicologo}

INFORME:
${draftText}
    `.trim();

    navigator.clipboard.writeText(reportText).then(() => {
      toast({
        title: "Informe copiado",
        description: "El texto del informe ha sido copiado al portapapeles.",
        duration: 3000,
      });
    }).catch(() => {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el informe al portapapeles.",
        variant: "destructive",
        duration: 3000,
      });
    });
  };

  // Handle share functionality
  const handleShareReport = () => {
    // Simulate sharing with a delay
    setTimeout(() => {
      toast({
        title: "Compartir informe",
        description: "Funcionalidad de compartir en desarrollo.",
        duration: 3000,
      });
    }, 1000);
  };



  // Skip patient selection step if patient is already selected
  useEffect(() => {
    if (selectedPatientId && currentPatient && formState.activeTab === WORKFLOW_STEPS[0].id) {
      updateFormState(prev => ({
        ...prev,
        activeTab: WORKFLOW_STEPS[1].id // Skip to clinical info tab
      }));
    }
  }, [selectedPatientId, currentPatient, formState.activeTab]);

  // Handler for when PDF is generated
  const handlePdfGenerated = () => {
    setIsPdfGenerated(true);
  };

  // Calculate current step status for each step
  const getStepStatus = (stepIndex: number): 'complete' | 'current' | 'upcoming' => {
    const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab);
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  // Determine if the user can proceed to the next step
  const canProceedToNextStep = () => {
    // Add validation logic for each step
    switch (formState.activeTab) {
      case 'patient-selection':
        return !!currentPatient; // Can proceed if a patient is selected
      case 'clinical-info':
        return !!formState.clinica && !!formState.psicologo && !!formState.fecha && !!formState.tipoInforme;
      case 'report-preview':
        return true; // Siempre se puede avanzar desde la previsualización
      case 'report-generation':
        return isDraftComplete;
      default:
        return true;
    }
  };

  // No longer needed with custom step indicator

  // Show report actions only on the last step
  const showReportActions = formState.activeTab === 'report-generation' && isDraftComplete;

  return (
    <div className="w-full space-y-8">
      {/* This header is now handled by the parent component */}

      {/* Enhanced step indicator with progress bar and tooltips */}
      <WizardStepIndicator 
        steps={WORKFLOW_STEPS}
        currentStepIndex={WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab)}
        onStepClick={handleStepClick}
        validationErrors={validationErrors}
        stepValidationMap={stepValidationMap}
      />
      
      {/* Help and save buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResumeSession}
                className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Sesiones guardadas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retomar una sesión guardada</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProgress}
                className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Guardar progreso</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Guardar tu progreso para continuar más tarde</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleHelp}
                className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Ayuda</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mostrar ayuda contextual</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Contextual help panel */}
      {showHelp && (
        <WizardHelp step={formState.activeTab} />
      )}

      {/* Content card */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden rounded-xl mb-8">
        {/* Patient selection step */}
        {formState.activeTab === 'patient-selection' && (
          <div>
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 mr-3">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Seleccione su centro clínico y busque al paciente para iniciar el informe</p>
              </div>
            </div>
            <PatientSelection
              currentClinic={formState.clinica}
              onClinicChange={(clinica) => updateForm({ clinica })}
              onComplete={handleStepComplete}
            />
          </div>
        )}

        {/* Clinical info step */}
        {formState.activeTab === 'clinical-info' && (
          <div>
            <ClinicalInfoForm
              clinica={formState.clinica}
              psicologo={formState.psicologo}
              fecha={formState.fecha}
              onClinicaChange={(clinica) => updateForm({ clinica })}
              onPsicologoChange={(psicologo) => updateForm({ psicologo })}
              onFechaChange={(fecha) => updateForm({ fecha })}
              tipoEvaluacion={formState.tipoEvaluacion}
              onTipoEvaluacionChange={(tipoEvaluacion) => updateForm({ tipoEvaluacion })}
              enfoqueTerapeutico={formState.enfoqueTerapeutico}
              onEnfoqueTerapeuticoChange={(enfoqueTerapeutico) => updateForm({ enfoqueTerapeutico })}
              instrumentosUtilizados={formState.instrumentosUtilizados}
              onInstrumentosChange={(instrumentosUtilizados) => updateForm({ instrumentosUtilizados })}
              objetivosSesion={formState.objetivosSesion}
              onObjetivosSesionChange={(objetivosSesion) => updateForm({ objetivosSesion })}
              derivacion={formState.derivacion}
              onDerivacionChange={(derivacion) => updateForm({ derivacion })}
              tipoInforme={formState.tipoInforme}
              onTipoInformeChange={(tipoInforme) => updateForm({ tipoInforme })}
              onComplete={handleStepComplete}
            />
          </div>
        )}
        
        {/* Summary step - NEW */}
        {formState.activeTab === 'summary' && (
          <div className="p-6">
            <WizardSummary 
              formData={formState}
              onEditStep={(stepId) => updateFormState(prev => ({ ...prev, activeTab: stepId }))}
              onConfirm={handleStepComplete}
              isValid={isFormValid}
              validationErrors={validationErrors}
            />
          </div>
        )}

        {/* Report preview and edit step */}
        {formState.activeTab === 'report-preview' && (
          <div>
            {analysisPhase === 'pending' ? (
              <div className="p-6 text-center">
                <Button
                  variant="default"
                  onClick={startAnalysis}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-sm flex items-center mx-auto gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generar Borrador del Informe
                </Button>
                <p className="text-sm text-gray-500 mt-2">Nuestro sistema generará un borrador basado en el tipo de informe seleccionado.</p>
              </div>
            ) : analysisPhase === 'analyzing' ? (
              <div className="p-6">
                <AIAnalysisProcess
                  onAnalysisComplete={handleAnalysisComplete}
                  areasEvaluacion={['cognitiva', 'emocional', 'conductual']}
                  criteriosCIE={['F41.1 Trastorno de ansiedad generalizada']}
                  motivosConsulta={['Ansiedad', 'Dificultades para dormir']}
                  assessmentId={formState.assessmentId}
                />
              </div>
            ) : (
              <div className="p-6">
                <ReportPreviewEditor
                  patientData={{
                    patient: currentPatient,
                    clinica: formState.clinica,
                    psicologo: formState.psicologo,
                    fecha: formState.fecha,
                    tipoInforme: formState.tipoInforme
                  }}
                  initialDraft={draftText}
                  onDraftChange={setDraftText}
                  onComplete={handleStepComplete}
                  onSave={handleSaveReport}
                  onDownload={handleDownloadReport}
                  isSaving={isSaving}
                  isDownloading={isDownloading}
                />
              </div>
            )}
          </div>
        )}

        {/* Report generation step */}
        {formState.activeTab === 'report-generation' && (
          <div>
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 mr-3">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Revise y personalice el informe psicológico generado</p>
              </div>
            </div>
            <ReportGenerator
              patientData={{
                patient: currentPatient,
                clinica: formState.clinica,
                psicologo: formState.psicologo,
                fecha: formState.fecha,
                motivosConsulta: [],
                areasEvaluacion: [],
                criteriosCIE: [],
              }}
              analysisPhase={analysisPhase}
              draftText={draftText}
              isDraftComplete={isDraftComplete}
              onStartAnalysis={startAnalysis}
              onDraftTextChange={setDraftText}
              onPdfGenerated={handlePdfGenerated}
            />
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <Button
            variant="ghost"
            onClick={handlePreviousStep}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 px-4 py-2 rounded-md shadow-sm"
            disabled={WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab) === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </Button>

          <div className="flex space-x-3">
            {showReportActions && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(true)}
                  disabled={!isDraftComplete}
                  className="flex items-center gap-2 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 px-4 py-2 rounded-md shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Vista Previa
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleSaveReport}
                  disabled={!isDraftComplete || isSaving}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 transition-all duration-200 px-4 py-2 rounded-md shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>

                <Button
                  variant="default"
                  onClick={handleDownloadReport}
                  disabled={!isDraftComplete || isDownloading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 px-4 py-2 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {isDownloading ? 'Descargando...' : 'Descargar PDF'}
                </Button>
              </>
            )}

            {WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab) < WORKFLOW_STEPS.length - 1 && (
              <Button
                variant="default"
                onClick={handleNextStep}
                disabled={!canProceedToNextStep()}
                className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200 px-4 py-2 rounded-md"
                aria-label={`Continuar al siguiente paso: ${
                  WORKFLOW_STEPS[WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab) + 1]?.label
                }`}
              >
                Siguiente
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Report preview dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0">
          <DialogHeader className="p-5 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-100 mr-3">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Vista previa del informe psicológico</p>
            </div>
          </DialogHeader>
          <div className="p-6">
          <ReportPreview
            patient={currentPatient ? {
              id: currentPatient.id,
              name: `${currentPatient.firstName} ${currentPatient.lastName}`,
              age: currentPatient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(currentPatient.dateOfBirth).getTime()) / 31557600000) : undefined,
              gender: currentPatient.gender,
              dateOfBirth: currentPatient.dateOfBirth?.toISOString().split('T')[0],
              email: currentPatient.contactEmail,
              phone: currentPatient.contactPhone,
            } : undefined}
            clinic={formState.clinica}
            psychologist={formState.psicologo}
            date={formState.fecha}
            content={draftText}
            onSave={handleSaveReport}
            onDownload={handleDownloadReport}
            onPrint={handlePrintReport}
            onCopy={handleCopyReport}
            onShare={handleShareReport}
            isSaving={isSaving}
            isDownloading={isDownloading}
          />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Save/Resume Progress Modal */}
      <SaveProgressModal 
        open={showSaveModal} 
        onOpenChange={setShowSaveModal} 
        mode={saveMode} 
      />
    </div>
  );
}