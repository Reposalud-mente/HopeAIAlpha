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
  AlertCircle,
  Sparkles,
  Printer,
  Share2
} from 'lucide-react';
// Removed client-side PDF generation
import { useToast } from '@/components/ui/use-toast';

interface Patient {
  id: string;
  name: string;
  status: string;
  assessmentId?: string; // Added to link to assessment
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
  availableAreas?: { id: string; name: string }[];
  realCodes?: { id: string; name: string }[];
}

export default function ReportGenerator({
  patientData,
  analysisPhase,
  draftText,
  isDraftComplete,
  onStartAnalysis,
  onDraftTextChange,
  onPdfGenerated,
  availableAreas = [],
  realCodes = [],
}: ReportGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success'>('success');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Call onPdfGenerated when analysisPhase becomes 'complete'
  // This ensures the "siguiente" button disappears when the draft is first shown
  useEffect(() => {
    if (analysisPhase === 'complete' && isDraftComplete && onPdfGenerated) {
      onPdfGenerated();
    }
  }, [analysisPhase, isDraftComplete, onPdfGenerated]);



  const showAlert = (message: string, type: 'error' | 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setTimeout(() => setAlertMessage(''), 3000);
  };

  const handleSaveReport = async () => {
    if (!patientData.patient || !patientData.patient.id) return;

    setIsSaving(true);

    try {
      // First, ensure the report is saved to the database
      const saveResponse = await fetch(`/api/assessments/${patientData.patient.assessmentId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportText: draftText,
          isFinal: false, // Draft version
          filename: `Informe_${patientData.patient.name}_${new Date().toISOString().split('T')[0]}.pdf`
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save report');
      }

      const saveData = await saveResponse.json();

      // Then, generate and save the PDF using the server-side endpoint
      const pdfResponse = await fetch(`/api/reports/${saveData.id}/pdf`, {
        method: 'POST',
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      await pdfResponse.json(); // Get the response data

      // Show success message
      showAlert('Informe guardado correctamente en el historial del paciente', 'success');

      // Show toast notification
      toast({
        title: "Informe guardado",
        description: `El informe ha sido guardado en el historial de ${patientData.patient?.name || 'paciente'}.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving report:', error);
      showAlert('Error al guardar el informe', 'error');

      toast({
        title: "Error",
        description: "No se pudo guardar el informe. Inténtelo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!patientData.patient) return;

    setIsDownloading(true);
    try {
      // First, ensure the report is saved to the database
      const saveResponse = await fetch(`/api/assessments/${patientData.patient.assessmentId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportText: draftText,
          isFinal: false, // Draft version
          filename: `Informe_${patientData.patient.name}_${new Date().toISOString().split('T')[0]}.pdf`
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save report');
      }

      const saveData = await saveResponse.json();

      // Generate and download the PDF using the server-side endpoint
      // Use window.open to trigger the download
      window.open(`/api/reports/${saveData.id}/pdf`, '_blank');

      // Notify parent component that PDF has been generated
      if (onPdfGenerated) {
        onPdfGenerated();
      }

      // Show success toast
      toast({
        title: "PDF generado",
        description: "El informe se ha descargado correctamente.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showAlert('Error al generar el PDF', 'error');

      toast({
        title: "Error",
        description: "No se pudo generar el PDF. Inténtelo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Format test names for display
  const getTestNamesById = (testIds: string[]) => {
    if (!testIds.length) return "No se especificaron criterios diagnósticos";

    // Look up actual code names from provided realCodes array
    return testIds.map(id => {
      const codeObj = realCodes.find((c: { id: string; name: string }) => c.id === id);
      return codeObj ? `${id}: ${codeObj.name}` : id;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div>

        <p className="text-gray-600">
          Cree un informe psicológico basado en los datos del paciente y las áreas evaluadas.
        </p>

        {analysisPhase === 'pending' && (
          <Card className="mb-6 mt-4 border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Sparkles className="h-12 w-12 text-blue-500 animate-pulse" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 mr-1 text-blue-400" /> Listo para generar el informe
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Presione el botón para iniciar el análisis y generar un borrador del informe psicológico.
                  </p>
                </div>
                <Button
                  onClick={onStartAnalysis}
                  variant="default"
                  className="mt-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg font-semibold rounded-full px-6 py-2 flex items-center gap-2"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-1" /> Generar Informe
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Draft Complete Message */}
      {isDraftComplete && (
        <Card className="p-4 border border-green-100 bg-white mt-4 mb-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700">Informe generado correctamente</p>
              <p className="text-sm text-gray-600">
                Pulse "Siguiente" para previsualizar, descargar o guardar el informe.
              </p>
            </div>
          </div>
        </Card>
      )}

      {analysisPhase === 'complete' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" /> Borrador del Informe
            </h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-blue-100"
                onClick={() => {
                  if (textareaRef.current) {
                    textareaRef.current.select();
                    document.execCommand('copy');
                  }
                }}
                aria-label="Copiar informe"
              >
                <Copy className="w-5 h-5 text-blue-500" />
              </Button>
            </div>
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
            className="min-h-[400px] font-mono text-sm bg-gray-50 text-gray-900 rounded-xl border-gray-200 shadow-sm"
            placeholder="El informe se generará aquí..."
          />
          <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Puede editar el texto del informe directamente en este campo antes de guardarlo o descargarlo.</span>
          </div>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Vista Previa del Informe</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="p-6 bg-gray-50 rounded border border-gray-200 space-y-6 text-gray-900 shadow-sm">
                  {/* Header with logo/clinic info */}
                  <div className="text-center text-sm text-gray-500">{patientData.clinica}</div>
                  {/* Patient information section */}
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Datos del Paciente</h2>
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
                <Button variant="outline" onClick={() => setShowPreview(false)} className="rounded-full px-4">Cerrar</Button>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white shadow-lg font-semibold rounded-full px-6 flex items-center gap-2"
                  onClick={handleSaveReport}
                  disabled={isSaving}
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Guardar
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="rounded-full px-6 flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md"
                >
                  {isDownloading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                  Descargar PDF
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 flex items-center gap-2 hover:bg-blue-50"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-1 text-blue-500" /> Imprimir
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-full px-4 flex items-center gap-2 hover:bg-blue-50"
                  onClick={() => navigator.share ? navigator.share({ title: 'Informe Psicológico', text: draftText }) : null}
                  disabled={!navigator.share}
                >
                  <Share2 className="w-4 h-4 mr-1 text-blue-500" /> Compartir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}