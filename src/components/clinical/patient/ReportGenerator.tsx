'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  Save, 
  DownloadCloud, 
  Download, 
  MoreHorizontal, 
  RefreshCw, 
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { formatFileName } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Patient {
  id: string;
  name: string;
  status: string;
}

interface PatientData {
  patient: any; // Replace with your actual Patient type
  clinica: string;
  psicologo: string;
  fecha: string;
  motivosConsulta: string[];
  areasEvaluacion: string[];
  criteriosCIE: string[];
}

interface ReportGeneratorProps {
  patientData: PatientData;
  analysisPhase: 'pending' | 'analyzing' | 'complete';
  draftText: string;
  isDraftComplete: boolean;
  onStartAnalysis: () => void;
  onDraftTextChange: (text: string) => void;
  onPdfGenerated?: () => void;
}

export default function ReportGenerator({
  patientData,
  analysisPhase,
  draftText,
  isDraftComplete,
  onStartAnalysis,
  onDraftTextChange,
  onPdfGenerated
}: ReportGeneratorProps) {
  const [isPreparingAnalysis, setIsPreparingAnalysis] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success'>('success');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Call onPdfGenerated when analysisPhase becomes 'complete'
  // This ensures the "siguiente" button disappears when the draft is first shown
  useEffect(() => {
    if (analysisPhase === 'complete' && isDraftComplete && onPdfGenerated) {
      onPdfGenerated();
    }
  }, [analysisPhase, isDraftComplete, onPdfGenerated]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      showAlert('Error al copiar al portapapeles', 'error');
    }
  };

  const showAlert = (message: string, type: 'error' | 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(''), 3000);
  };
  
  const handleSaveReport = () => {
    setIsSaving(true);
    
    // Simulate saving to patient data with a delay
    setTimeout(() => {
      setIsSaving(false);
      
      // Show success message
      showAlert('Informe guardado correctamente en el historial del paciente', 'success');
      
      // Show toast notification
      toast({
        title: "Informe guardado",
        description: `El informe ha sido guardado en el historial de ${patientData.patient?.name || 'paciente'}.`,
        duration: 3000,
      });
    }, 1000);
  };
  
  const handleDownloadPDF = () => {
    if (!patientData.patient) return;
    
    setIsDownloading(true);
    try {
      // Create new PDF document with more formatting options
      const doc = new jsPDF();
      
      // Set font types and styles
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      
      // Add header image or logo (placeholder)
      // doc.addImage(headerLogo, 'PNG', 15, 15, 30, 15);
      
      // Add title with more professional formatting
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
      doc.text(`Nombre: ${patientData.patient?.name || 'N/A'}`, 20, 45);
      doc.text(`Fecha de Evaluación: ${patientData.fecha}`, 20, 50);
      doc.text(`Psicólogo/a: ${patientData.psicologo}`, 20, 55);
      doc.text(`Clínica: ${patientData.clinica}`, 20, 60);
      
      // Add motives section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text('MOTIVO DE CONSULTA', 20, 70);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(patientData.motivosConsulta.join(', '), 20, 80);
      
      // Add evaluated areas section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text('ÁREAS EVALUADAS', 20, 90);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const evaluatedAreas = patientData.areasEvaluacion.map(areaId => {
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
      doc.text(getICDCriteriaText(patientData.criteriosCIE), 20, 120);
      
      // Add report content
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text('INFORME', 20, 135);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Format the report text - this splits sections by their headers
      const formattedText = formatReportText(draftText);
      let yPosition = 145;
      
      formattedText.forEach(section => {
        if (section.isHeader) {
          // Add some spacing before headers (except the first one)
          if (yPosition > 145) yPosition += 5;
          
          doc.setFont("helvetica", "bold");
          doc.text(section.text, 20, yPosition);
          yPosition += 5;
        } else {
          doc.setFont("helvetica", "normal");
          // Split long paragraphs to fit page width
          const textLines = doc.splitTextToSize(section.text, 170);
          doc.text(textLines, 20, yPosition);
          yPosition += 5 * (textLines.length);
          
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        }
      });
      
      // Add footer
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(`Informe generado el ${new Date().toLocaleDateString()} - Página ${i} de ${totalPages}`, 105, 285, { align: 'center' });
      }
      
      // Generate filename
      const fileName = formatFileName(`Informe_${patientData.patient.name}_${new Date().toISOString().split('T')[0]}`);
      
      // Save the PDF
      doc.save(`${fileName}.pdf`);
      
      // Notify parent component that PDF has been generated
      if (onPdfGenerated) {
        onPdfGenerated();
      }
    } catch (error) {
      showAlert('Error al generar el PDF', 'error');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Helper for formatting the report text into sections
  const formatReportText = (text: string) => {
    const sections: { text: string; isHeader: boolean }[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Identify headers (all caps or ending with ":" typically indicates a header)
      const isHeader = 
        trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3 || 
        trimmedLine.endsWith(':');
      
      if (trimmedLine) {
        sections.push({ text: trimmedLine, isHeader });
      }
    });
    
    return sections;
  };
  
  // Get formatted text for ICD criteria
  const getICDCriteriaText = (criterios: string[]) => {
    if (!criterios.length) return "No se especificaron criterios diagnósticos";
    
    return criterios.map(criterio => {
      // Find the code details from allCodes
      // This is a simplified version, you should use a proper lookup from your actual data
      return criterio;
    }).join(', ');
  };
  
  // Format test names for display
  const getTestNamesById = (testIds: string[]) => {
    if (!testIds.length) return "No se especificaron criterios diagnósticos";
    
    // In a real implementation, this would look up the actual code names from your data
    // For now, just display the codes
    return testIds.map(id => {
      // Mock data lookup - replace with actual code lookup in production
      const codeObj = allCodes.find(c => c.id === id);
      return codeObj ? `${id}: ${codeObj.name}` : id;
    }).join(', ');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Generación de Informe</h2>
        <p className="text-gray-600">
          Cree un informe psicológico basado en los datos del paciente y las áreas evaluadas.
        </p>
        
        {analysisPhase === 'pending' && (
          <Card className="mb-6 mt-4 border border-blue-100 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <FileText className="h-12 w-12 text-blue-500" />
                <div>
                  <h3 className="text-lg font-medium text-blue-700">Listo para generar el informe</h3>
                  <p className="text-gray-500 mt-1">
                    Presione el botón para iniciar el análisis y generar un borrador del informe psicológico.
                  </p>
                </div>
                <Button 
                  onClick={onStartAnalysis} 
                  variant="default"
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
                  size="lg"
                >
                  Generar Informe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Draft Complete Message */}
        {isDraftComplete && (
          <Card className="p-4 border border-green-100 bg-green-50 mt-4 mb-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700">Informe generado correctamente</p>
                <p className="text-sm text-green-600">
                  Pulse "Siguiente" para previsualizar, descargar o guardar el informe.
                </p>
              </div>
            </div>
          </Card>
        )}
          
        {analysisPhase === 'complete' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Borrador del Informe</h3>
            </div>
            
            {alertMessage && (
              <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
                alertType === 'error' 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{alertMessage}</span>
              </div>
            )}
            
            <Textarea
              ref={textareaRef}
              value={draftText}
              onChange={(e) => onDraftTextChange(e.target.value)}
              className="min-h-[400px] font-mono text-sm bg-white text-gray-900"
              placeholder="El informe se generará aquí..."
            />
            
            <div className="mt-4 text-sm text-gray-500">
              <p>
                ℹ️ Puede editar el texto del informe directamente en este campo antes de guardarlo o descargarlo.
              </p>
            </div>
          </>
        )}
      </div>
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista Previa del Informe</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-6 bg-white rounded border space-y-6 text-gray-900">
              {/* Header with logo/clinic info */}
              <div className="border-b-2 border-blue-600 pb-4">
                <h1 className="text-2xl font-bold text-center text-blue-800 mb-2">INFORME DE EVALUACIÓN PSICOLÓGICA</h1>
                <div className="text-center text-sm text-gray-500">{patientData.clinica}</div>
              </div>
              
              {/* Patient information section */}
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Datos del Paciente</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Nombre:</p>
                    <p>{patientData.patient?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium">Fecha de Evaluación:</p>
                    <p>{patientData.fecha}</p>
                  </div>
                  <div>
                    <p className="font-medium">Profesional:</p>
                    <p>{patientData.psicologo}</p>
                  </div>
                  <div>
                    <p className="font-medium">Centro:</p>
                    <p>{patientData.clinica}</p>
                  </div>
                </div>
              </div>
              
              {/* Evaluation details */}
              <div>
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Motivo de Consulta</h2>
                <p className="text-sm bg-white p-3 border rounded">{patientData.motivosConsulta.join(', ')}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Áreas Evaluadas</h2>
                <p className="text-sm bg-white p-3 border rounded">{patientData.areasEvaluacion.map(areaId => {
                  const area = availableAreas.find(a => a.id === areaId);
                  return area?.name;
                }).filter(Boolean).join(', ')}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Criterios Diagnósticos CIE-11</h2>
                <p className="text-sm bg-white p-3 border rounded">{getTestNamesById(patientData.criteriosCIE)}</p>
              </div>
              
              {/* Report content */}
              <div>
                <h2 className="text-lg font-semibold text-blue-700 mb-2">Informe</h2>
                <div className="whitespace-pre-line bg-white p-4 border rounded text-sm">
                  {draftText}
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t pt-4 mt-6 text-xs text-gray-500 text-center">
                <p>Informe generado el {new Date().toLocaleDateString()}</p>
                <p className="mt-1">{patientData.clinica} • {patientData.psicologo}</p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Cerrar</Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSaveReport}
              disabled={isSaving}
            >
              {isSaving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Guardar
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
              Descargar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Available evaluation areas - from EvaluationAreas for reference
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

// Mock data for ICD codes
const allCodes = [
  { id: '6A00', name: 'Trastornos del desarrollo intelectual' },
  { id: '6A01', name: 'Trastornos del espectro autista' },
  { id: '6A02', name: 'Trastornos del desarrollo del habla o lenguaje' },
  { id: '6A20', name: 'Esquizofrenia' },
  { id: '6A21', name: 'Trastorno esquizoafectivo' },
  { id: '6A22', name: 'Trastorno esquizotípico' },
  { id: '6A70', name: 'Episodio depresivo' },
  { id: '6A71', name: 'Trastorno depresivo recurrente' },
  { id: '6A60', name: 'Trastorno bipolar tipo I' },
  { id: '6A61', name: 'Trastorno bipolar tipo II' },
  { id: '6B00', name: 'Trastorno de ansiedad generalizada' },
  { id: '6B01', name: 'Trastorno de pánico' },
  { id: '6B04', name: 'Trastorno de ansiedad social' },
  { id: '6B40', name: 'Trastorno de estrés postraumático' },
  { id: '6B41', name: 'Trastorno de adaptación' },
  { id: '6B20', name: 'Trastorno obsesivo-compulsivo' },
  { id: '6B22', name: 'Trastorno dismórfico corporal' },
  { id: '6D10', name: 'Trastorno de personalidad leve' },
  { id: '6D11', name: 'Trastorno de personalidad moderado' },
  { id: '6D12', name: 'Trastorno de personalidad severo' },
]; 