'use client';

import React, { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Download, Save, Copy, FileText } from 'lucide-react';

interface ReportGenerationStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

export default function ReportGenerationStep({ 
  formState, 
  updateForm, 
  updateReportData,
  onComplete 
}: ReportGenerationStepProps) {
  const { currentPatient } = usePatient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  // Función para generar el informe
  const generateReport = () => {
    setIsGenerating(true);
    
    // Simulamos una llamada a la API para generar el informe
    setTimeout(() => {
      const reportText = `
INFORME CLÍNICO PSICOLÓGICO
${getReportTypeLabel(formState.tipoInforme)}

Fecha: ${formState.fecha}
Psicólogo: ${formState.psicologo}
Centro: ${formState.clinica}

DATOS DEL PACIENTE
Nombre: ${currentPatient?.firstName} ${currentPatient?.lastName}
Edad: ${currentPatient?.age} años

${getReportContent(formState)}

Este informe ha sido generado con asistencia de inteligencia artificial y debe ser revisado por un profesional de la salud mental antes de su uso clínico.
      `;
      
      setGeneratedReport(reportText.trim());
      setIsGenerating(false);
    }, 2000);
  };
  
  // Función para obtener la etiqueta del tipo de informe
  const getReportTypeLabel = (type: string): string => {
    const reportTypes: {[key: string]: string} = {
      'evaluacion-psicologica': 'EVALUACIÓN PSICOLÓGICA',
      'seguimiento-terapeutico': 'SEGUIMIENTO TERAPÉUTICO',
      'evaluacion-neuropsicologica': 'EVALUACIÓN NEUROPSICOLÓGICA',
      'informe-familiar': 'INFORME FAMILIAR/SISTÉMICO',
      'informe-educativo': 'INFORME PSICOEDUCATIVO',
      'alta-terapeutica': 'ALTA TERAPÉUTICA'
    };
    
    return reportTypes[type] || 'INFORME CLÍNICO';
  };
  
  // Función para obtener el contenido específico del informe según el tipo
  const getReportContent = (formState: any): string => {
    const { tipoInforme, reportData } = formState;
    
    // Aquí generaríamos contenido específico según el tipo de informe y los datos recopilados
    // Este es solo un ejemplo simplificado
    switch (tipoInforme) {
      case 'evaluacion-psicologica':
        return `
MOTIVO DE CONSULTA
${reportData.motivoConsulta || 'No especificado'}

ANTECEDENTES
${reportData.antecedentes || 'No especificados'}

EVALUACIÓN PSICOMÉTRICA
${reportData.testsPsicometricos?.join(', ') || 'No se aplicaron tests psicométricos'}

RESULTADOS
${reportData.resultadosPruebas || 'No especificados'}

DIAGNÓSTICO PRESUNTIVO
${reportData.diagnosticoPresuntivo || 'No especificado'}

RECOMENDACIONES
${reportData.recomendaciones || 'No especificadas'}
        `;
        
      case 'seguimiento-terapeutico':
        return `
EVOLUCIÓN
${reportData.evolucion || 'No especificada'}

CAMBIOS EN SÍNTOMAS
${reportData.cambiosSintomas || 'No especificados'}

NIVEL DE MEJORÍA
${reportData.nivelMejoria || 'No especificado'}/10

ADHERENCIA AL TRATAMIENTO
${reportData.adherenciaTratamiento || 'No especificada'}

AJUSTE DE OBJETIVOS
${reportData.ajusteObjetivos || 'No especificado'}

OBSERVACIONES DEL TERAPEUTA
${reportData.observacionesTerapeuta || 'No especificadas'}
        `;
        
      // Aquí se añadirían los demás casos para los otros tipos de informes
      
      default:
        return 'Contenido del informe no disponible para este tipo de informe.';
    }
  };
  
  // Función para copiar el informe al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Función para descargar el informe como archivo de texto
  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedReport], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Informe_${currentPatient?.lastName}_${formState.fecha.replace(/\//g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800">Generación de Informe</h3>
        <p className="text-sm text-gray-600">
          Revise la información y genere el informe clínico.
        </p>
      </div>
      
      {/* Resumen de la información recopilada */}
      <Card className="p-4 bg-gray-50 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Resumen de la información</h4>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Paciente:</span> {currentPatient?.firstName} {currentPatient?.lastName}</p>
          <p><span className="font-medium">Tipo de informe:</span> {getReportTypeLabel(formState.tipoInforme)}</p>
          <p><span className="font-medium">Fecha:</span> {formState.fecha}</p>
          {/* Aquí se podría mostrar más información específica según el tipo de informe */}
        </div>
      </Card>
      
      {/* Botón para generar el informe */}
      {!generatedReport && (
        <Button
          onClick={generateReport}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-6"
        >
          {isGenerating ? (
            <>Generando informe... <Sparkles className="h-5 w-5 animate-pulse" /></>
          ) : (
            <>Generar Informe <Sparkles className="h-5 w-5" /></>
          )}
        </Button>
      )}
      
      {/* Informe generado */}
      {generatedReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Informe Generado
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                {isCopied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadReport}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>
          </div>
          
          <Textarea
            value={generatedReport}
            readOnly
            className="min-h-[400px] font-mono text-sm bg-white"
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setGeneratedReport('')}
              className="flex items-center gap-1"
            >
              Regenerar
            </Button>
            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Guardar Informe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
