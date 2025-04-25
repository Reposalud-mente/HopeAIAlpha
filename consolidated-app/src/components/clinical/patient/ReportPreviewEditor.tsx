'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportPreview } from '@/components/clinical/reports/ReportPreview';
import { useToast } from '@/components/ui/use-toast';
import {
  FileText,
  Edit,
  Save,
  FileDown,
  RefreshCw,
  Sparkles,
  MessageCircle,
  Layers,
  ListChecks,
  Brain,
  Heart,
  Stethoscope,
  User
} from 'lucide-react';

interface PatientData {
  patient: any;
  clinica: string;
  psicologo: string;
  fecha: string;
  tipoInforme: string;
}

interface ReportPreviewEditorProps {
  patientData: PatientData;
  initialDraft: string;
  onDraftChange: (text: string) => void;
  onComplete: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  isSaving?: boolean;
  isDownloading?: boolean;
}

// Función para dividir el informe en secciones
const splitReportIntoSections = (reportText: string): Record<string, string> => {
  // Expresiones regulares para identificar secciones comunes en informes psicológicos
  const sectionPatterns = [
    { name: 'header', pattern: /^(.+?)(?=MOTIVO DE CONSULTA|ANTECEDENTES|EVALUACIÓN REALIZADA)/is },
    { name: 'motivoConsulta', pattern: /MOTIVO DE CONSULTA(.+?)(?=ANTECEDENTES|EVALUACIÓN REALIZADA|RESULTADOS|DIAGNÓSTICO)/is },
    { name: 'antecedentes', pattern: /ANTECEDENTES(.+?)(?=EVALUACIÓN REALIZADA|RESULTADOS|DIAGNÓSTICO)/is },
    { name: 'evaluacion', pattern: /EVALUACIÓN REALIZADA(.+?)(?=RESULTADOS|DIAGNÓSTICO|CONCLUSIONES)/is },
    { name: 'resultados', pattern: /RESULTADOS(.+?)(?=DIAGNÓSTICO|CONCLUSIONES|RECOMENDACIONES)/is },
    { name: 'diagnostico', pattern: /DIAGNÓSTICO(.+?)(?=CONCLUSIONES|RECOMENDACIONES)/is },
    { name: 'conclusiones', pattern: /CONCLUSIONES(.+?)(?=RECOMENDACIONES)/is },
    { name: 'recomendaciones', pattern: /RECOMENDACIONES(.+?)$/is }
  ];

  const sections: Record<string, string> = {};

  // Intentar extraer cada sección
  sectionPatterns.forEach(({ name, pattern }) => {
    const match = reportText.match(pattern);
    if (match && match[1]) {
      sections[name] = match[0].trim();
    } else if (name === 'header' && !sections.header) {
      // Si no se encontró un encabezado, usar las primeras líneas
      const lines = reportText.split('\n').slice(0, 5).join('\n');
      sections.header = lines;
    }
  });

  // Si alguna sección no se encontró, crear una sección "resto" con el texto no capturado
  if (Object.values(sections).join('').length < reportText.length * 0.7) {
    sections.resto = reportText;
  }

  return sections;
};

// Función para reconstruir el informe a partir de las secciones
const reconstructReport = (sections: Record<string, string>): string => {
  // Si solo tenemos la sección "resto", devolver esa
  if (sections.resto && Object.keys(sections).length === 1) {
    return sections.resto;
  }

  // Orden preferido de las secciones
  const sectionOrder = [
    'header',
    'motivoConsulta',
    'antecedentes',
    'evaluacion',
    'resultados',
    'diagnostico',
    'conclusiones',
    'recomendaciones'
  ];

  // Reconstruir el informe en el orden correcto
  return sectionOrder
    .filter(section => sections[section])
    .map(section => sections[section])
    .join('\n\n');
};

// Componente principal
export default function ReportPreviewEditor({
  patientData,
  initialDraft,
  onDraftChange,
  onComplete,
  onSave,
  onDownload,
  isSaving = false,
  isDownloading = false
}: ReportPreviewEditorProps) {
  const [reportSections, setReportSections] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string>('');
  const [editText, setEditText] = useState('');
  const [activeTab, setActiveTab] = useState('preview');

  const { toast } = useToast();

  // Dividir el informe en secciones al cargar
  useEffect(() => {
    const sections = splitReportIntoSections(initialDraft);
    setReportSections(sections);

    // Inicializar la sección activa con la primera sección disponible
    if (Object.keys(sections).length > 0 && !activeSection) {
      setActiveSection(Object.keys(sections)[0]);
    }
  }, [initialDraft, activeSection]);

  // Actualizar el borrador cuando cambian las secciones
  useEffect(() => {
    if (Object.keys(reportSections).length > 0) {
      const fullReport = reconstructReport(reportSections);
      onDraftChange(fullReport);
    }
  }, [reportSections, onDraftChange]);

  // Función para abrir el editor de sección
  const handleEditSection = (sectionName: string) => {
    setEditingSection(sectionName);
    setEditText(reportSections[sectionName] || '');
    setIsEditing(true);
  };

  // Función para guardar los cambios de una sección
  const handleSaveSection = () => {
    setReportSections(prev => ({
      ...prev,
      [editingSection]: editText
    }));
    setIsEditing(false);
    setEditingSection('');
    setEditText('');

    toast({
      title: "Sección actualizada",
      description: "Los cambios han sido aplicados al informe.",
      duration: 3000,
    });
  };

  // Función para mejorar automáticamente una sección
  const handleImproveSection = (sectionName: string) => {
    // Aquí se implementaría la lógica para mejorar automáticamente una sección
    // Por ahora, simulamos una mejora con un timeout
    toast({
      title: "Mejorando sección...",
      description: "Aplicando mejoras automáticas a la sección.",
      duration: 2000,
    });

    setTimeout(() => {
      // Ejemplo de mejora: añadir más detalle o corregir formato
      const currentText = reportSections[sectionName] || '';
      let improvedText = currentText;

      // Ejemplo simple de mejora para la sección de diagnóstico
      if (sectionName === 'diagnostico') {
        improvedText = currentText.replace(
          /DIAGNÓSTICO/i,
          "DIAGNÓSTICO\n\nBasado en la evaluación realizada y los criterios diagnósticos de la CIE-11,"
        );
      } else if (sectionName === 'conclusiones') {
        improvedText = currentText.replace(
          /CONCLUSIONES/i,
          "CONCLUSIONES\n\nEn síntesis, tras el proceso de evaluación psicológica realizado,"
        );
      }

      setReportSections(prev => ({
        ...prev,
        [sectionName]: improvedText
      }));

      toast({
        title: "Sección mejorada",
        description: "Se han aplicado mejoras automáticas a la sección.",
        duration: 3000,
      });
    }, 2000);
  };

  // Obtener el título del informe basado en el tipo
  const getReportTitle = () => {
    switch (patientData.tipoInforme) {
      case 'evaluacion-psicologica':
        return 'INFORME DE EVALUACIÓN PSICOLÓGICA';
      case 'seguimiento-terapeutico':
        return 'INFORME DE SEGUIMIENTO TERAPÉUTICO';
      case 'evaluacion-neuropsicologica':
        return 'INFORME DE EVALUACIÓN NEUROPSICOLÓGICA';
      case 'informe-familiar':
        return 'INFORME FAMILIAR/SISTÉMICO';
      case 'informe-educativo':
        return 'INFORME PSICOEDUCATIVO';
      case 'alta-terapeutica':
        return 'INFORME DE ALTA TERAPÉUTICA';
      default:
        return 'INFORME PSICOLÓGICO';
    }
  };

  // Renderizar las secciones del informe
  const renderSections = () => {
    // Si solo tenemos la sección "resto", mostrar todo el texto
    if (reportSections.resto && Object.keys(reportSections).length === 1) {
      return (
        <div className="space-y-4">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4 flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                Informe Completo
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection('resto')}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 whitespace-pre-wrap text-sm">
              {reportSections.resto}
            </CardContent>
          </Card>
        </div>
      );
    }

    // Mapeo de iconos para cada sección
    const sectionIcons: Record<string, React.ReactNode> = {
      header: <FileText className="h-5 w-5 text-blue-600 mr-2" />,
      motivoConsulta: <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />,
      antecedentes: <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />,
      evaluacion: <Layers className="h-5 w-5 text-blue-600 mr-2" />,
      resultados: <ListChecks className="h-5 w-5 text-blue-600 mr-2" />,
      diagnostico: <Brain className="h-5 w-5 text-blue-600 mr-2" />,
      conclusiones: <Sparkles className="h-5 w-5 text-blue-600 mr-2" />,
      recomendaciones: <Heart className="h-5 w-5 text-blue-600 mr-2" />
    };

    // Nombres amigables para las secciones
    const sectionNames: Record<string, string> = {
      header: 'Encabezado',
      motivoConsulta: 'Motivo de Consulta',
      antecedentes: 'Antecedentes',
      evaluacion: 'Evaluación Realizada',
      resultados: 'Resultados',
      diagnostico: 'Diagnóstico',
      conclusiones: 'Conclusiones',
      recomendaciones: 'Recomendaciones'
    };

    // Orden de las secciones
    const sectionOrder = [
      'header',
      'motivoConsulta',
      'antecedentes',
      'evaluacion',
      'resultados',
      'diagnostico',
      'conclusiones',
      'recomendaciones'
    ];

    return (
      <div className="space-y-4">
        {sectionOrder.filter(section => reportSections[section]).map(section => (
          <Card key={section} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4 flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
                {sectionIcons[section] || <FileText className="h-5 w-5 text-blue-600 mr-2" />}
                {sectionNames[section] || section}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImproveSection(section)}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="h-4 w-4" />
                  Mejorar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSection(section)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 whitespace-pre-wrap text-sm">
              {reportSections[section]}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
              <Edit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Previsualización y Edición del Informe
              </h1>
              <p className="text-sm text-gray-500">
                Revise y personalice el informe antes de la redacción final
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="px-5 py-3">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <FileText className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600">
              <Edit className="h-4 w-4" />
              Editar Secciones
            </TabsTrigger>
          </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b py-4">
              <div className="text-center">
                <CardTitle className="text-xl font-bold text-gray-800">{getReportTitle()}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{patientData.clinica} | {patientData.fecha}</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h2 className="text-md font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Datos del Paciente
                  </h2>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-white rounded border border-gray-100">
                      <p className="font-medium text-gray-700">Nombre:</p>
                      <p className="text-gray-900">{patientData.patient?.firstName} {patientData.patient?.lastName || ''}</p>
                    </div>
                    {patientData.patient?.dateOfBirth && (
                      <div className="p-2 bg-white rounded border border-gray-100">
                        <p className="font-medium text-gray-700">Fecha de Nacimiento:</p>
                        <p className="text-gray-900">{new Date(patientData.patient.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {patientData.patient?.gender && (
                      <div className="p-2 bg-white rounded border border-gray-100">
                        <p className="font-medium text-gray-700">Género:</p>
                        <p className="text-gray-900">{patientData.patient.gender}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {initialDraft}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Vista Previa Completa
            </Button>

            <div className="flex space-x-3">
              {onSave && (
                <Button
                  variant="secondary"
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              )}

              {onDownload && (
                <Button
                  variant="default"
                  onClick={onDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  {isDownloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                  {isDownloading ? 'Descargando...' : 'Descargar PDF'}
                </Button>
              )}

              <Button
                variant="default"
                onClick={onComplete}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Continuar a Redacción Final
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 overflow-hidden">
          <div className="flex h-full overflow-hidden">
            {/* Sidebar navigation for sections */}
            <div className="hidden md:flex flex-col w-56 border-r bg-gray-50 overflow-y-auto">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-700">Secciones del Informe</h3>
              </div>
              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {Object.keys(reportSections).map(section => {
                  const sectionNames: Record<string, string> = {
                    header: 'Encabezado',
                    motivoConsulta: 'Motivo de Consulta',
                    antecedentes: 'Antecedentes',
                    evaluacion: 'Evaluación Realizada',
                    resultados: 'Resultados',
                    diagnostico: 'Diagnóstico',
                    conclusiones: 'Conclusiones',
                    recomendaciones: 'Recomendaciones',
                    resto: 'Informe Completo'
                  };

                  const sectionIcons: Record<string, React.ReactNode> = {
                    header: <FileText className="h-4 w-4 text-blue-600" />,
                    motivoConsulta: <MessageCircle className="h-4 w-4 text-blue-600" />,
                    antecedentes: <Stethoscope className="h-4 w-4 text-blue-600" />,
                    evaluacion: <Layers className="h-4 w-4 text-blue-600" />,
                    resultados: <ListChecks className="h-4 w-4 text-blue-600" />,
                    diagnostico: <Brain className="h-4 w-4 text-blue-600" />,
                    conclusiones: <Sparkles className="h-4 w-4 text-blue-600" />,
                    recomendaciones: <Heart className="h-4 w-4 text-blue-600" />,
                    resto: <FileText className="h-4 w-4 text-blue-600" />
                  };

                  return (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setActiveSection(section)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSection === section
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex-shrink-0">{sectionIcons[section]}</span>
                      <span className="truncate">{sectionNames[section] || section}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Ver Vista Previa
                </Button>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Mobile section selector */}
              <div className="md:hidden mb-4">
                <Select value={activeSection} onValueChange={setActiveSection}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(reportSections).map(section => {
                      const sectionNames: Record<string, string> = {
                        header: 'Encabezado',
                        motivoConsulta: 'Motivo de Consulta',
                        antecedentes: 'Antecedentes',
                        evaluacion: 'Evaluación Realizada',
                        resultados: 'Resultados',
                        diagnostico: 'Diagnóstico',
                        conclusiones: 'Conclusiones',
                        recomendaciones: 'Recomendaciones',
                        resto: 'Informe Completo'
                      };

                      return (
                        <SelectItem key={section} value={section}>
                          {sectionNames[section] || section}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Active section content */}
              {activeSection && (
                <div className="space-y-4">
                  <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="bg-white border-b py-4 flex justify-between items-center">
                      <CardTitle className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        {activeSection === 'header' && <FileText className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'motivoConsulta' && <MessageCircle className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'antecedentes' && <Stethoscope className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'evaluacion' && <Layers className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'resultados' && <ListChecks className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'diagnostico' && <Brain className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'conclusiones' && <Sparkles className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'recomendaciones' && <Heart className="h-5 w-5 text-blue-600" />}
                        {activeSection === 'resto' && <FileText className="h-5 w-5 text-blue-600" />}
                        {{
                          'header': 'Encabezado',
                          'motivoConsulta': 'Motivo de Consulta',
                          'antecedentes': 'Antecedentes',
                          'evaluacion': 'Evaluación Realizada',
                          'resultados': 'Resultados',
                          'diagnostico': 'Diagnóstico',
                          'conclusiones': 'Conclusiones',
                          'recomendaciones': 'Recomendaciones',
                          'resto': 'Informe Completo'
                        }[activeSection] || activeSection}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImproveSection(activeSection)}
                          className="flex items-center gap-1"
                        >
                          <Sparkles className="h-4 w-4" />
                          Mejorar
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEditSection(activeSection)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 whitespace-pre-wrap text-sm bg-gray-50">
                      {reportSections[activeSection]}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Mobile footer */}
              <div className="md:hidden mt-6 pt-4 border-t">
                <Button
                  variant="default"
                  onClick={() => setActiveTab('preview')}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4" />
                  Ver Vista Previa
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para editar secciones */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0 bg-white">
          <DialogHeader className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <Edit className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Editar Sección: {{
                      'header': 'Encabezado',
                      'motivoConsulta': 'Motivo de Consulta',
                      'antecedentes': 'Antecedentes',
                      'evaluacion': 'Evaluación Realizada',
                      'resultados': 'Resultados',
                      'diagnostico': 'Diagnóstico',
                      'conclusiones': 'Conclusiones',
                      'recomendaciones': 'Recomendaciones',
                      'resto': 'Informe Completo'
                    }[editingSection] || editingSection}
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">Modifique el texto de esta sección del informe</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 border-b border-gray-100">
            <ScrollArea className="max-h-[60vh]">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[300px] font-mono text-sm resize-none border-gray-200 focus-visible:ring-blue-500 focus-visible:ring-opacity-25"
                placeholder="Escriba el contenido de esta sección..."
              />
            </ScrollArea>
          </div>

          <div className="p-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="mt-3 sm:mt-0">
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleSaveSection}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para vista previa completa */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white">
          <DialogHeader className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    Vista Previa del Informe
                  </DialogTitle>
                  <p className="text-sm text-gray-500 mt-1">Visualización completa del informe psicológico</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="p-6">
              <ReportPreview
                title={getReportTitle()}
                patient={patientData.patient ? {
                  id: patientData.patient.id,
                  name: `${patientData.patient.firstName} ${patientData.patient.lastName || ''}`,
                  age: patientData.patient.dateOfBirth ? Math.floor((new Date().getTime() - new Date(patientData.patient.dateOfBirth).getTime()) / 31557600000) : undefined,
                  gender: patientData.patient.gender,
                  dateOfBirth: patientData.patient.dateOfBirth?.toISOString().split('T')[0],
                  email: patientData.patient.contactEmail,
                  phone: patientData.patient.contactPhone,
                } : undefined}
                clinic={patientData.clinica}
                psychologist={patientData.psicologo}
                date={patientData.fecha}
                content={initialDraft}
                onSave={onSave}
                onDownload={onDownload}
                isSaving={isSaving}
                isDownloading={isDownloading}
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
