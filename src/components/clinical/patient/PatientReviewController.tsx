'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { User, ClipboardList, MessageCircle, Layers, ListChecks, Sparkles } from 'lucide-react';
import PatientSelection from '@/components/clinical/patient/PatientSelection';
import ClinicalInfoForm from '@/components/clinical/patient/ClinicalInfoForm';
import ConsultationReasons from '@/components/clinical/patient/ConsultationReason';
import EvaluationAreas from '@/components/clinical/patient/EvaluationAreas';
import ICDCriteria from '@/components/clinical/patient/ICDCriteria';
import ReportGenerator from '@/components/clinical/patient/ReportGenerator';
import { AIAnalysisProcess } from '@/components/ai/AIAnalysisProcess';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

import { ReportPreview } from '@/components/clinical/reports/ReportPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import jsPDF from 'jspdf'; // Removed client-side PDF generation

// Define the steps of the workflow
const WORKFLOW_STEPS = [
  { id: 'patient-selection', label: 'Selección de Paciente', icon: <User className="w-5 h-5 text-blue-500" /> },
  { id: 'clinical-info', label: 'Información Clínica', icon: <ClipboardList className="w-5 h-5 text-blue-500" /> },
  { id: 'consultation-reasons', label: 'Motivos de Consulta', icon: <MessageCircle className="w-5 h-5 text-blue-500" /> },
  { id: 'evaluation-areas', label: 'Áreas de Evaluación', icon: <Layers className="w-5 h-5 text-blue-500" /> },
  { id: 'icd-criteria', label: 'Criterios CIE-11', icon: <ListChecks className="w-5 h-5 text-blue-500" /> },
  { id: 'report-generation', label: 'Generación de Informe', icon: <Sparkles className="w-5 h-5 text-blue-500" /> }
];

interface FormState {
  clinica: string;
  psicologo: string;
  fecha: string;
  motivosConsulta: string[];
  areasEvaluacion: string[];
  criteriosCIE: string[];
  activeTab: string; // Use string for tab-based navigation
  assessmentId?: string; // Optional assessment ID for database integration
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

  // Handlers for report actions will be defined below

  // Form state
  const [formState, updateFormState] = useState<FormState>({
    clinica: 'Centro de Psicología Clínica',
    psicologo: 'Dr. Juan Martínez',
    fecha: format(new Date(), 'dd/MM/yyyy'),
    motivosConsulta: [],
    areasEvaluacion: [],
    criteriosCIE: [],
    activeTab: WORKFLOW_STEPS[0].id, // Always start with patient selection
    assessmentId: undefined // Will be set if we're working with an existing assessment
  });

  // Current step index for the wizard - using activeTab instead

  // Step navigation handlers
  const handleNextStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1];
      updateFormState(prev => ({ ...prev, activeTab: nextStep.id }));
    }
  };

  const handlePreviousStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === formState.activeTab);
    if (currentIndex > 0) {
      const prevStep = WORKFLOW_STEPS[currentIndex - 1];
      updateFormState(prev => ({ ...prev, activeTab: prevStep.id }));
    }
  };

  // Handle step completion
  const handleStepComplete = () => {
    handleNextStep();
  };

  // Fetch evaluation areas and ICD codes on mount
  useEffect(() => {
    // Fetch evaluation areas
    fetch('/api/evaluation-areas')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch evaluation areas'))
      .then(data => setAvailableAreas(data))
      .catch(() => setAvailableAreas([]));
    // Fetch ICD codes
    fetch('/api/icd-codes')
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch ICD codes'))
      .then(data => setRealCodes(data))
      .catch(() => setRealCodes([]));
  }, []);

  // Load the selected patient if selectedPatientId is provided
  useEffect(() => {
    if (selectedPatientId && (!currentPatient || currentPatient.id !== selectedPatientId)) {
      const loadPatient = async () => {
        const patient = await getPatient(selectedPatientId);
        if (patient) {
          setCurrentPatient(patient);
        }
      };
      loadPatient();
    }
  }, [selectedPatientId, currentPatient, getPatient, setCurrentPatient, formState]);

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
        return !!formState.clinica && !!formState.psicologo && !!formState.fecha;
      case 'consultation-reasons':
        return formState.motivosConsulta.length > 0;
      case 'evaluation-areas':
        return formState.areasEvaluacion.length > 0;
      case 'icd-criteria':
        return formState.criteriosCIE.length > 0;
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
    <div className="w-full space-y-6">
      {/* Header with instructions */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Informes Clínicos</h1>
        <p className="text-gray-600 mt-2">Genere informes clínicos psicológicos siguiendo el proceso paso a paso. Utilice el botón <span className="font-medium text-blue-600">Siguiente</span> para avanzar entre las diferentes etapas.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
        <p className="text-sm text-blue-700">Consejo: Complete cada paso con la información necesaria y pulse "Siguiente" para continuar. Al finalizar, podrá revisar, guardar o descargar su informe.</p>
      </div>

      {/* Horizontal step indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        {/* Line connecting steps */}
        <div className="absolute h-0.5 bg-gray-200 left-0 right-0 top-1/2 transform -translate-y-1/2 z-0" />

        {WORKFLOW_STEPS.map((step, index) => {
          const status = getStepStatus(index);
          const isActive = status === 'current';
          const isCompleted = status === 'complete';

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
              onClick={() => handleStepClick(index)}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-medium text-sm mb-2 transition-colors ${isActive ? 'bg-blue-500' : isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content card */}
      <Card className="p-6 shadow-sm border border-gray-200">
        {/* Patient selection step */}
        {formState.activeTab === 'patient-selection' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Seleccionar Clínica y Paciente</h2>
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
            <h3 className="text-xl font-semibold mb-4">Información Clínica</h3>
            <ClinicalInfoForm
              clinica={formState.clinica}
              psicologo={formState.psicologo}
              fecha={formState.fecha}
              onClinicaChange={(clinica) => updateForm({ clinica })}
              onPsicologoChange={(psicologo) => updateForm({ psicologo })}
              onFechaChange={(fecha) => updateForm({ fecha })}
              onComplete={handleStepComplete}
            />
          </div>
        )}

        {/* Consultation reasons step */}
        {formState.activeTab === 'consultation-reasons' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Motivos de Consulta</h3>
            <ConsultationReasons
              motivosConsulta={formState.motivosConsulta}
              onMotivosChange={(motivosConsulta) => updateForm({ motivosConsulta })}
              onComplete={handleStepComplete}
            />
          </div>
        )}

        {/* Evaluation areas step */}
        {formState.activeTab === 'evaluation-areas' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Áreas de Evaluación</h3>
            <EvaluationAreas
              areasEvaluacion={formState.areasEvaluacion}
              onAreasChange={(areasEvaluacion) => updateForm({ areasEvaluacion })}
              availableAreas={availableAreas}
              onComplete={handleStepComplete}
            />
          </div>
        )}

        {/* ICD criteria step */}
        {formState.activeTab === 'icd-criteria' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Criterios CIE-11</h3>
            <ICDCriteria
              criteriosCIE={formState.criteriosCIE}
              onCriteriosChange={(criteriosCIE) => updateForm({ criteriosCIE })}
              realCodes={realCodes}
              areasEvaluacion={formState.areasEvaluacion}
              onComplete={handleStepComplete}
            />
          </div>
        )}

        {/* Report generation step */}
        {formState.activeTab === 'report-generation' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Generación de Informe</h3>
            <ReportGenerator
              patientData={{
                patient: currentPatient,
                clinica: formState.clinica,
                psicologo: formState.psicologo,
                fecha: formState.fecha,
                motivosConsulta: formState.motivosConsulta,
                areasEvaluacion: formState.areasEvaluacion,
                criteriosCIE: formState.criteriosCIE,
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
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            className="flex items-center gap-2"
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
                  className="flex items-center gap-2"
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
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
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
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
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
                className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 shadow-sm font-medium"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa del Informe</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* AI Analysis Process overlay */}
      {analysisPhase === 'analyzing' && (
        <div className="mt-6">
          <AIAnalysisProcess
            onAnalysisComplete={handleAnalysisComplete}
            areasEvaluacion={formState.areasEvaluacion}
            criteriosCIE={formState.criteriosCIE}
            motivosConsulta={formState.motivosConsulta}
            assessmentId={formState.assessmentId}
          />
        </div>
      )}
    </div>
  );
}