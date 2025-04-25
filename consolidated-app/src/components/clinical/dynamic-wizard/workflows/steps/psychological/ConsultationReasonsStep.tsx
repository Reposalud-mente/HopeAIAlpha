'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, FileText, Sparkles, PlusCircle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConsultationReasonsStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

// Motivos de consulta comunes
const COMMON_REASONS = [
  { id: 'ansiedad', label: 'Ansiedad', description: 'Preocupación excesiva, nerviosismo, ataques de pánico' },
  { id: 'depresion', label: 'Depresión', description: 'Tristeza persistente, pérdida de interés, fatiga' },
  { id: 'estres', label: 'Estrés', description: 'Dificultad para manejar presiones, agotamiento' },
  { id: 'relaciones', label: 'Problemas de relación', description: 'Conflictos de pareja, familiares o sociales' },
  { id: 'autoestima', label: 'Baja autoestima', description: 'Autoimagen negativa, autocrítica excesiva' },
  { id: 'trauma', label: 'Trauma', description: 'Experiencias traumáticas, TEPT' },
  { id: 'duelo', label: 'Duelo', description: 'Pérdida de un ser querido, proceso de duelo' },
  { id: 'adicciones', label: 'Adicciones', description: 'Consumo problemático de sustancias o conductas adictivas' },
  { id: 'trastorno-alimentario', label: 'Trastorno alimentario', description: 'Problemas con la alimentación, imagen corporal' },
  { id: 'insomnio', label: 'Insomnio', description: 'Dificultades para conciliar o mantener el sueño' },
  { id: 'fobias', label: 'Fobias', description: 'Miedos intensos y específicos' },
  { id: 'toc', label: 'TOC', description: 'Pensamientos intrusivos y comportamientos repetitivos' }
];

export default function ConsultationReasonsStep({
  formState,
  updateForm,
  updateReportData,
  onComplete
}: ConsultationReasonsStepProps) {
  const [motivoConsulta, setMotivoConsulta] = useState(formState.reportData.motivoConsulta || '');
  const [antecedentes, setAntecedentes] = useState(formState.reportData.antecedentes || '');
  const [selectedReasons, setSelectedReasons] = useState<string[]>(formState.reportData.selectedReasons || []);
  const [customReasons, setCustomReasons] = useState<string[]>(formState.reportData.customReasons || []);
  const [newCustomReason, setNewCustomReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manejar cambios en los motivos de consulta seleccionados
  const handleReasonChange = (reasonId: string) => {
    const updatedReasons = selectedReasons.includes(reasonId)
      ? selectedReasons.filter(id => id !== reasonId)
      : [...selectedReasons, reasonId];

    setSelectedReasons(updatedReasons);

    // Actualizar el texto del motivo de consulta con los motivos seleccionados
    if (!motivoConsulta || motivoConsulta === '') {
      updateMotivoConsultaFromReasons(updatedReasons, customReasons);
    }
  };

  // Añadir un motivo personalizado
  const handleAddCustomReason = () => {
    if (newCustomReason.trim() && !customReasons.includes(newCustomReason.trim())) {
      const updatedCustomReasons = [...customReasons, newCustomReason.trim()];
      setCustomReasons(updatedCustomReasons);
      setNewCustomReason('');

      // Actualizar el texto del motivo de consulta
      if (!motivoConsulta || motivoConsulta === '') {
        updateMotivoConsultaFromReasons(selectedReasons, updatedCustomReasons);
      }
    }
  };

  // Eliminar un motivo personalizado
  const handleRemoveCustomReason = (reason: string) => {
    const updatedCustomReasons = customReasons.filter(r => r !== reason);
    setCustomReasons(updatedCustomReasons);

    // Actualizar el texto del motivo de consulta
    if (!motivoConsulta || motivoConsulta === '') {
      updateMotivoConsultaFromReasons(selectedReasons, updatedCustomReasons);
    }
  };

  // Actualizar el texto del motivo de consulta basado en las selecciones
  const updateMotivoConsultaFromReasons = (selected: string[], custom: string[]) => {
    const selectedLabels = selected.map(id => {
      const reason = COMMON_REASONS.find(r => r.id === id);
      return reason ? reason.label : '';
    }).filter(Boolean);

    const allReasons = [...selectedLabels, ...custom];

    if (allReasons.length > 0) {
      setMotivoConsulta(`El paciente consulta por: ${allReasons.join(', ')}.`);
    } else {
      setMotivoConsulta('');
    }
  };

  // Generar motivo de consulta con IA
  const generateMotivoConsulta = () => {
    setIsGenerating(true);

    // Recopilar todos los motivos seleccionados
    const selectedLabels = selectedReasons.map(id => {
      const reason = COMMON_REASONS.find(r => r.id === id);
      return reason ? reason.label : '';
    }).filter(Boolean);

    const allReasons = [...selectedLabels, ...customReasons];

    // Simular una llamada a la API de IA (en una implementación real, esto sería una llamada a la API)
    setTimeout(() => {
      let generatedText = '';

      if (allReasons.length > 0) {
        generatedText = `El paciente acude a consulta presentando ${allReasons.join(', ')}. `;

        if (allReasons.includes('Ansiedad')) {
          generatedText += 'Refiere experimentar episodios de preocupación excesiva, tensión muscular y dificultad para concentrarse. ';
        }

        if (allReasons.includes('Depresión')) {
          generatedText += 'Manifiesta sentimientos de tristeza persistente, pérdida de interés en actividades que antes disfrutaba y fatiga constante. ';
        }

        if (allReasons.includes('Problemas de relación')) {
          generatedText += 'Describe dificultades significativas en sus relaciones interpersonales, con patrones de comunicación disfuncionales. ';
        }

        generatedText += 'Solicita apoyo profesional para desarrollar estrategias de afrontamiento efectivas y mejorar su bienestar emocional.';
      } else {
        generatedText = 'El paciente acude a consulta solicitando evaluación psicológica. Refiere malestar emocional significativo que está afectando su funcionamiento diario. Busca orientación profesional para comprender mejor su situación y desarrollar estrategias que le permitan mejorar su bienestar psicológico.';
      }

      setMotivoConsulta(generatedText);
      setIsGenerating(false);
    }, 1500);
  };

  // Generar antecedentes con IA
  const generateAntecedentes = () => {
    setIsGenerating(true);

    // Simular una llamada a la API de IA (en una implementación real, esto sería una llamada a la API)
    setTimeout(() => {
      const generatedText = 'El paciente no reporta antecedentes psiquiátricos previos ni tratamientos psicológicos anteriores. No hay historia familiar de trastornos mentales diagnosticados. Niega consumo de sustancias y no presenta condiciones médicas relevantes que puedan estar contribuyendo a su sintomatología actual. Su desarrollo psicosocial ha sido normativo, sin eventos traumáticos significativos reportados.';

      setAntecedentes(generatedText);
      setIsGenerating(false);
    }, 1500);
  };

  // Guardar los datos y continuar
  const handleSave = () => {
    updateReportData({
      motivoConsulta,
      antecedentes,
      selectedReasons,
      customReasons
    });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Motivos de Consulta
        </h3>
        <p className="text-sm text-gray-600">
          Seleccione o describa los motivos por los que el paciente busca atención psicológica.
        </p>
      </div>

      {/* Motivos de consulta comunes */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-600" />
          Motivos comunes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {COMMON_REASONS.map(reason => (
            <div
              key={reason.id}
              className={`flex items-start p-2 rounded-md border transition-all duration-200 cursor-pointer ${selectedReasons.includes(reason.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
              onClick={() => handleReasonChange(reason.id)}
            >
              <Checkbox
                id={reason.id}
                checked={selectedReasons.includes(reason.id)}
                onCheckedChange={() => handleReasonChange(reason.id)}
                className="mt-1 mr-2"
              />
              <div>
                <label
                  htmlFor={reason.id}
                  className="text-sm font-medium cursor-pointer"
                >
                  {reason.label}
                </label>
                <p className="text-xs text-gray-500">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Motivos personalizados */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Añadir motivo personalizado</h5>
          <div className="flex gap-2">
            <Input
              value={newCustomReason}
              onChange={(e) => setNewCustomReason(e.target.value)}
              placeholder="Escriba un motivo personalizado..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomReason()}
            />
            <Button
              onClick={handleAddCustomReason}
              variant="outline"
              size="icon"
              disabled={!newCustomReason.trim()}
              title="Añadir motivo personalizado"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          {customReasons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customReasons.map(reason => (
                <Badge
                  key={reason}
                  variant="secondary"
                  className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                >
                  {reason}
                  <button
                    type="button"
                    className="ml-1 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCustomReason(reason);
                    }}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Motivo de consulta detallado */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Motivo de consulta detallado
          </h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={generateMotivoConsulta}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Generando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs">Generar con IA</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Generar un motivo de consulta basado en las selecciones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          value={motivoConsulta}
          onChange={(e) => setMotivoConsulta(e.target.value)}
          placeholder="Describa en detalle el motivo por el que el paciente busca atención psicológica..."
          className="min-h-[120px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Card>

      {/* Antecedentes */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Antecedentes personales/familiares
          </h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={generateAntecedentes}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Generando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs">Generar con IA</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Generar antecedentes de ejemplo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          value={antecedentes}
          onChange={(e) => setAntecedentes(e.target.value)}
          placeholder="Incluya información relevante sobre antecedentes médicos, psicológicos, familiares o sociales..."
          className="min-h-[120px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </Card>

      {/* Botón para guardar y continuar */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={!motivoConsulta}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium"
        >
          Guardar y Continuar
        </Button>
      </div>
    </div>
  );
}
