'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePatient } from '@/contexts/PatientContext';
import { StepIndicator } from '@/components/ui/step-indicator';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save, FileDown, FileText, Printer, Copy, Share2 } from 'lucide-react';
import PatientSelection from '@/components/clinical/patient/PatientSelection';
import ClinicalInfoForm from '@/components/clinical/patient/ClinicalInfoForm';
import ConsultationReasons from '@/components/clinical/patient/ConsultationReason';
import EvaluationAreas from '@/components/clinical/patient/EvaluationAreas';
import ICDCriteria from '@/components/clinical/patient/ICDCriteria';
import ReportGenerator from '@/components/clinical/patient/ReportGenerator';
import { AIAnalysisProcess } from '@/components/ai/AIAnalysisProcess';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { StepperNavigation } from '@/components/ui/stepper-navigation';
import { ReportPreview } from '@/components/clinical/reports/ReportPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

// Define the steps of the workflow
const WORKFLOW_STEPS = [
  { id: 'patient-selection', label: 'Selección de Paciente' },
  { id: 'clinical-info', label: 'Información Clínica' },
  { id: 'consultation-reasons', label: 'Motivos de Consulta' },
  { id: 'evaluation-areas', label: 'Áreas de Evaluación' },
  { id: 'icd-criteria', label: 'Criterios CIE-11' },
  { id: 'report-generation', label: 'Generación de Informe' }
];

interface FormState {
  clinica: string;
  psicologo: string;
  fecha: string;
  motivosConsulta: string[];
  areasEvaluacion: string[];
  criteriosCIE: string[];
  currentFormStep: number;
}

export default function PatientReviewController() {
  // Use patient context
  const { currentPatient } = usePatient();
  const { toast } = useToast();
  
  // Form state
  const [formState, updateFormState] = useState<FormState>({
    clinica: 'Centro de Psicología Clínica',
    psicologo: 'Dr. Juan Martínez',
    fecha: format(new Date(), 'dd/MM/yyyy'),
    motivosConsulta: [],
    areasEvaluacion: [],
    criteriosCIE: [],
    currentFormStep: 0
  });
  
  // Analysis state
  const [analysisPhase, setAnalysisPhase] = useState<'pending' | 'analyzing' | 'complete'>('pending');
  const [draftText, setDraftText] = useState('');
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // New state for report preview dialog
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // New state to track if the PDF has been generated
  const [isPdfGenerated, setIsPdfGenerated] = useState(false);
  
  // Helper function to update form state
  const updateForm = (updates: Partial<FormState>) => {
    updateFormState(prev => ({ ...prev, ...updates }));
  };

  // Navigation functions
  const goToNextStep = () => {
    if (formState.currentFormStep < WORKFLOW_STEPS.length - 1) {
      updateForm({ currentFormStep: formState.currentFormStep + 1 });
    } else if (formState.currentFormStep === WORKFLOW_STEPS.length - 1 && isDraftComplete) {
      // If we're on the last step and the draft is complete, show the preview
      handleOpenPreview();
    }
  };

  const goToPreviousStep = () => {
    if (formState.currentFormStep > 0) {
      updateForm({ currentFormStep: formState.currentFormStep - 1 });
    }
  };

  const goToStep = (stepIndex: number) => {
    // Only allow navigation to steps that have been visited or are the next step
    if (stepIndex >= 0 && stepIndex <= Math.min(formState.currentFormStep + 1, WORKFLOW_STEPS.length - 1)) {
      // For the last step, only allow navigation if the draft is complete
      if (stepIndex === WORKFLOW_STEPS.length - 1 && !isDraftComplete && formState.currentFormStep !== WORKFLOW_STEPS.length - 1) {
        toast({
          title: "Completar pasos anteriores",
          description: "Debe completar todos los pasos previos antes de generar el informe.",
          duration: 3000,
        });
        return;
      }
      updateForm({ currentFormStep: stepIndex });
    } else if (stepIndex > formState.currentFormStep + 1) {
      toast({
        title: "Completar pasos anteriores",
        description: "Complete los pasos previos antes de avanzar.",
        duration: 3000,
      });
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
  const handleSaveReport = () => {
    setIsSaving(true);
    
    // Simulate saving to patient data with a delay
    setTimeout(() => {
      setIsSaving(false);
      
      toast({
        title: "Informe guardado",
        description: `El informe ha sido guardado en el historial de ${currentPatient?.name || 'paciente'}.`,
        duration: 3000,
      });
    }, 1000);
  };
  
  // Download report action
  const handleDownloadReport = () => {
    setIsDownloading(true);
    
    // Get reference to the ReportGenerator component's handleDownloadPDF method
    // We'll create a reference to hold the download function
    if (formState.currentFormStep === 5 && analysisPhase === 'complete') {
      // Call the onPdfGenerated callback to indicate PDF has been generated
      setIsPdfGenerated(true);
      
      // Create a PDF document using the same formatting as in ReportGenerator
      try {
        const doc = new jsPDF();
        
        // Set font types and styles
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        
        // Add title with professional formatting
        doc.setFontSize(18);
        doc.text('INFORME DE EVALUACIÓN PSICOLÓGICA', 105, 20, { align: 'center' });
        
        // Horizontal line under title
        doc.setDrawColor(70, 130, 180); // Steel blue color
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
        
        // Add patient information section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('DATOS DEL PACIENTE', 20, 35);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Nombre: ${currentPatient?.name || 'N/A'}`, 20, 45);
        doc.text(`Fecha de Evaluación: ${formState.fecha}`, 20, 50);
        doc.text(`Psicólogo/a: ${formState.psicologo}`, 20, 55);
        doc.text(`Clínica: ${formState.clinica}`, 20, 60);
        
        // Add motives section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('MOTIVO DE CONSULTA', 20, 70);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(formState.motivosConsulta.join(', '), 20, 80);
        
        // Add evaluated areas section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('ÁREAS EVALUADAS', 20, 90);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        // Use the same logic from ReportGenerator to map area IDs to names
        const availableAreas = [
          { id: 'cognitiva', name: 'Función Cognitiva' },
          { id: 'emocional', name: 'Regulación Emocional' },
          { id: 'conductual', name: 'Comportamiento' },
          { id: 'social', name: 'Funcionamiento Social' },
          { id: 'personalidad', name: 'Rasgos de Personalidad' },
          { id: 'autoconcepto', name: 'Autoconcepto' },
          { id: 'trauma', name: 'Trauma' },
          { id: 'estres', name: 'Estrés y Afrontamiento' },
          { id: 'familiar', name: 'Dinámica Familiar' },
        ];
        const evaluatedAreas = formState.areasEvaluacion.map(areaId => {
          const area = availableAreas.find(a => a.id === areaId);
          return area?.name;
        }).filter(Boolean).join(', ');
        doc.text(evaluatedAreas, 20, 100);
        
        // Add ICD criteria section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('CRITERIOS DIAGNÓSTICOS CIE-11', 20, 110);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        // Use a simplified version of the criteria display
        doc.text(formState.criteriosCIE.join(', '), 20, 120);
        
        // Add report content section title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text('INFORME', 20, 135);
        
        // Format the report text
        const addContent = (text: string) => {
          let yPosition = 140;
          
          // Split the text into lines to respect formatting
          const lines = text.split('\n');
          let currentSection = '';
          
          lines.forEach((line: string) => {
            const trimmedLine = line.trim();
            
            // Check if this is a section header (all caps or ends with colon)
            const isHeader = 
              trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3 || 
              trimmedLine.endsWith(':');
            
            if (isHeader && trimmedLine) {
              // Add some spacing before headers
              yPosition += 10;
              
              doc.setFont("helvetica", "bold");
              doc.setFontSize(12);
              doc.text(trimmedLine, 20, yPosition);
              yPosition += 5;
              
              doc.setFont("helvetica", "normal");
              doc.setFontSize(10);
            } else if (trimmedLine) {
              // Split long paragraphs to fit page width
              const textLines = doc.splitTextToSize(trimmedLine, 170);
              doc.text(textLines, 20, yPosition);
              yPosition += 5 * (textLines.length);
            }
            
            // Check if we need a new page
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
          });
        };
        
        // Add the report content
        addContent(draftText);
        
        // Add footer
        const totalPages = doc.internal.pages.length - 1;
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.text(`Informe generado el ${new Date().toLocaleDateString()} - Página ${i} de ${totalPages}`, 105, 285, { align: 'center' });
        }
        
        // Generate filename
        const fileName = `Informe_${currentPatient?.name || 'Paciente'}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
        
        // Save the PDF
        doc.save(`${fileName}.pdf`);
        
        toast({
          title: "Informe descargado",
          description: "El informe se ha descargado correctamente.",
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error al descargar",
          description: "No se pudo generar el PDF del informe.",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsDownloading(false);
      }
    } else {
      // Fallback to simulated download for other cases
      setTimeout(() => {
        setIsDownloading(false);
        setIsPdfGenerated(true);
        
        toast({
          title: "Informe descargado",
          description: "El informe se ha descargado correctamente.",
          duration: 3000,
        });
      }, 1000);
    }
  };

  // Handle print action
  const handlePrintReport = () => {
    setIsPrinting(true);
    
    // Simulate printing with a delay
    setTimeout(() => {
      // Create a new window and write the report content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Informe Psicológico - ${currentPatient?.name || 'Paciente'}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1 { color: #2563eb; }
                .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .section-title { color: #2563eb; font-weight: bold; }
                .content { white-space: pre-line; }
                @media print {
                  body { padding: 0; }
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>INFORME DE EVALUACIÓN PSICOLÓGICA</h1>
                <p>${formState.clinica} | ${formState.fecha}</p>
              </div>
              <div class="section">
                <p class="section-title">Paciente:</p>
                <p>${currentPatient?.name || 'N/A'}</p>
              </div>
              <div class="section">
                <p class="section-title">Fecha de Evaluación:</p>
                <p>${formState.fecha}</p>
              </div>
              <div class="section">
                <p class="section-title">Profesional:</p>
                <p>${formState.psicologo}</p>
              </div>
              <div class="section">
                <p class="section-title">Informe:</p>
                <div class="content">${draftText}</div>
              </div>
              <script>
                window.onload = function() { window.print(); }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      
      setIsPrinting(false);
      
      toast({
        title: "Impresión iniciada",
        description: "El informe se está imprimiendo.",
        duration: 3000,
      });
    }, 1000);
  };
  
  // Handle copy to clipboard
  const handleCopyReport = () => {
    setIsCopying(true);
    
    const reportText = `
INFORME DE EVALUACIÓN PSICOLÓGICA
${formState.clinica} | ${formState.fecha}

Paciente: ${currentPatient?.name || 'N/A'}
Fecha de Evaluación: ${formState.fecha}
Profesional: ${formState.psicologo}

INFORME:
${draftText}
    `.trim();
    
    navigator.clipboard.writeText(reportText).then(() => {
      setIsCopying(false);
      
      toast({
        title: "Informe copiado",
        description: "El texto del informe ha sido copiado al portapapeles.",
        duration: 3000,
      });
    }).catch(() => {
      setIsCopying(false);
      
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
    setIsSharing(true);
    
    // Simulate sharing with a delay
    setTimeout(() => {
      setIsSharing(false);
      
      toast({
        title: "Compartir informe",
        description: "Funcionalidad de compartir en desarrollo.",
        duration: 3000,
      });
    }, 1000);
  };
  
  // Report preview dialog handler
  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
    // Also mark the PDF as generated when the preview is opened
    setIsPdfGenerated(true);
  };

  // Check if user can proceed to next step
  const canProceedToNextStep = () => {
    switch (formState.currentFormStep) {
      case 0:
        return !!currentPatient;
      case 1:
        return !!formState.clinica && !!formState.psicologo && !!formState.fecha;
      case 2:
        return formState.motivosConsulta.length > 0;
      case 3:
        return formState.areasEvaluacion.length > 0;
      case 4:
        return formState.criteriosCIE.length > 0;
      case 5:
        // Can proceed to preview if the report is complete
        return isDraftComplete;
      default:
        return true;
    }
  };
  
  // Handler for when PDF is generated
  const handlePdfGenerated = () => {
    setIsPdfGenerated(true);
  };

  // Render the current step based on form state
  const renderCurrentStep = () => {
    switch (formState.currentFormStep) {
      case 0:
        return (
          <PatientSelection 
            currentClinic={formState.clinica}
            onClinicChange={(clinica) => updateForm({ clinica })}
            onComplete={() => goToNextStep()}
          />
        );
      case 1:
        return (
          <ClinicalInfoForm
            clinica={formState.clinica}
            psicologo={formState.psicologo}
            fecha={formState.fecha}
            onClinicaChange={(clinica) => updateForm({ clinica })}
            onPsicologoChange={(psicologo) => updateForm({ psicologo })}
            onFechaChange={(fecha) => updateForm({ fecha })}
            onComplete={() => goToNextStep()}
          />
        );
      case 2:
        return (
          <ConsultationReasons
            motivosConsulta={formState.motivosConsulta}
            onMotivosChange={(motivosConsulta) => updateForm({ motivosConsulta })}
            onComplete={() => goToNextStep()}
          />
        );
      case 3:
        return (
          <EvaluationAreas
            areasEvaluacion={formState.areasEvaluacion}
            onAreasChange={(areasEvaluacion) => updateForm({ areasEvaluacion })}
            onComplete={() => goToNextStep()}
          />
        );
      case 4:
        return (
          <ICDCriteria
            criteriosCIE={formState.criteriosCIE}
            areasEvaluacion={formState.areasEvaluacion}
            onCriteriosChange={(criteriosCIE) => updateForm({ criteriosCIE })}
            onComplete={() => goToNextStep()}
          />
        );
      case 5:
        return (
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
        );
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  // Determine if we're on the final step
  const isLastStep = formState.currentFormStep === WORKFLOW_STEPS.length - 1;
  const showReportActions = isLastStep && analysisPhase === 'complete';

  return (
    <div className="space-y-6">
      <StepIndicator 
        currentStep={formState.currentFormStep}
        steps={WORKFLOW_STEPS}
        onStepClick={goToStep}
      />
      
      <Card className="p-6">
        {renderCurrentStep()}

        {/* Navigation buttons using the StepperNavigation component */}
        <StepperNavigation 
          currentStep={formState.currentFormStep}
          totalSteps={WORKFLOW_STEPS.length}
          onPrevious={goToPreviousStep}
          onNext={goToNextStep}
          canProceed={canProceedToNextStep()}
          showReportActions={showReportActions}
          onPreview={handleOpenPreview}
          onSave={handleSaveReport}
          onDownload={handleDownloadReport}
          isSaving={isSaving}
          isDownloading={isDownloading}
          showNextOnLastStep={isDraftComplete}
          hideNextButtonOnFinalScreen={isPdfGenerated}
        />
      </Card>
      
      {/* Report Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa del Informe</DialogTitle>
          </DialogHeader>
          
          <ReportPreview 
            patient={currentPatient || undefined}
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
      
      {analysisPhase === 'analyzing' && (
        <div className="mt-6">
          <AIAnalysisProcess
            onAnalysisComplete={handleAnalysisComplete}
            areasEvaluacion={formState.areasEvaluacion}
            criteriosCIE={formState.criteriosCIE}
            motivosConsulta={formState.motivosConsulta}
          />
        </div>
      )}
    </div>
  );
}