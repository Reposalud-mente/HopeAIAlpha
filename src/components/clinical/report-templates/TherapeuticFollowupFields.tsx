'use client';

import React, { useState } from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Activity,
  Target,
  ChevronRight,
  Info,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface TherapeuticFollowupFieldsProps extends ReportFieldsProps {
  evolucion: string;
  onEvolucionChange: (value: string) => void;
  cambiosSintomas: string;
  onCambiosSintomasChange: (value: string) => void;
  nivelMejoria: number;
  onNivelMejoriaChange: (value: number) => void;
  adherenciaTratamiento: string;
  onAdherenciaTratamientoChange: (value: string) => void;
  ajusteObjetivos: string;
  onAjusteObjetivosChange: (value: string) => void;
  observacionesTerapeuta: string;
  onObservacionesTerapeutaChange: (value: string) => void;
}

export default function TherapeuticFollowupFields({
  evolucion = '',
  onEvolucionChange,
  cambiosSintomas = '',
  onCambiosSintomasChange,
  nivelMejoria = 5,
  onNivelMejoriaChange,
  adherenciaTratamiento = '',
  onAdherenciaTratamientoChange,
  ajusteObjetivos = '',
  onAjusteObjetivosChange,
  observacionesTerapeuta = '',
  onObservacionesTerapeutaChange,
  onComplete
}: TherapeuticFollowupFieldsProps) {
  // Validación de campos obligatorios
  const [touched, setTouched] = useState({
    evolucion: false,
    cambiosSintomas: false,
    adherenciaTratamiento: false,
    ajusteObjetivos: false,
    observacionesTerapeuta: false,
  });

  const [aiSuggestionActive, setAiSuggestionActive] = useState<string | null>(null);

  const isFieldEmpty = (value: string) => value.trim().length === 0;
  const isFormValid =
    !isFieldEmpty(evolucion) &&
    !isFieldEmpty(cambiosSintomas) &&
    !isFieldEmpty(adherenciaTratamiento) &&
    !isFieldEmpty(ajusteObjetivos) &&
    !isFieldEmpty(observacionesTerapeuta);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = () => {
    setTouched({
      evolucion: true,
      cambiosSintomas: true,
      adherenciaTratamiento: true,
      ajusteObjetivos: true,
      observacionesTerapeuta: true,
    });
    if (isFormValid && onComplete) {
      onComplete();
    }
  };

  // Sugerencias de IA para cada campo
  const aiSuggestions = {
    adherenciaTratamiento: "El paciente muestra buena adherencia al tratamiento farmacológico prescrito. Reporta tomar la medicación según lo indicado y no ha experimentado efectos secundarios significativos que interfieran con su cumplimiento.",
    ajusteObjetivos: "Considerando el progreso actual, se mantienen los objetivos terapéuticos establecidos inicialmente. Se refuerza la importancia de continuar trabajando en las estrategias de afrontamiento ante situaciones de estrés.",
    observacionesTerapeuta: "Se observa una actitud colaborativa durante la sesión. El paciente muestra mayor insight sobre sus patrones de pensamiento y ha comenzado a implementar las técnicas de regulación emocional aprendidas en situaciones cotidianas."
  };

  const handleAiSuggestion = (field: string) => {
    setAiSuggestionActive(field);

    // Simular un breve retraso para dar sensación de procesamiento
    setTimeout(() => {
      switch(field) {
        case 'adherenciaTratamiento':
          onAdherenciaTratamientoChange(aiSuggestions.adherenciaTratamiento);
          break;
        case 'ajusteObjetivos':
          onAjusteObjetivosChange(aiSuggestions.ajusteObjetivos);
          break;
        case 'observacionesTerapeuta':
          onObservacionesTerapeutaChange(aiSuggestions.observacionesTerapeuta);
          break;
      }
      setAiSuggestionActive(null);
    }, 600);
  };

  // Color dinámico para el slider
  const getSliderColor = (value: number) => {
    if (value <= 3) return 'bg-red-200 text-red-800';
    if (value <= 7) return 'bg-yellow-200 text-yellow-800';
    return 'bg-green-200 text-green-800';
  };

  const getMejoriaText = (value: number) => {
    if (value <= 3) return 'Mejoría mínima';
    if (value <= 7) return 'Mejoría moderada';
    return 'Mejoría significativa';
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Seguimiento Terapéutico</h1>
          <p className="text-sm text-gray-500 mb-3">
            Complete los campos para documentar la evolución del paciente. Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </p>

          {/* Sección 1: Evolución y Cambios */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-700">Evolución y Cambios</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Evolución */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Evolución desde la última sesión
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Describa los cambios observados en el paciente desde la sesión anterior
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  value={evolucion}
                  onChange={(e) => onEvolucionChange(e.target.value)}
                  onBlur={() => handleBlur('evolucion')}
                  placeholder="¿Qué cambios ha notado desde la última sesión?"
                  className={cn(
                    "min-h-[80px] resize-none bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all",
                    touched.evolucion && isFieldEmpty(evolucion) && 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  )}
                />
                {touched.evolucion && isFieldEmpty(evolucion) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="h-3 w-3" /> Este campo es obligatorio
                  </div>
                )}
              </div>

              {/* Cambios en síntomas */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Cambios en síntomas
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Detalle los cambios específicos en los síntomas principales
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  value={cambiosSintomas}
                  onChange={(e) => onCambiosSintomasChange(e.target.value)}
                  onBlur={() => handleBlur('cambiosSintomas')}
                  placeholder="¿Qué cambios ha habido en los síntomas principales?"
                  className={cn(
                    "min-h-[80px] resize-none bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all",
                    touched.cambiosSintomas && isFieldEmpty(cambiosSintomas) && 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  )}
                />
                {touched.cambiosSintomas && isFieldEmpty(cambiosSintomas) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="h-3 w-3" /> Este campo es obligatorio
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <Separator className="my-3" />

          {/* Sección 2: Nivel de Mejoría y Adherencia */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-700">Mejoría y Adherencia</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Nivel de mejoría */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-0">
                  <Label className="text-sm font-medium text-gray-700">Nivel de mejoría</Label>
                  <Badge variant="outline" className={cn("font-medium text-xs py-0 h-5", getSliderColor(nivelMejoria))}>
                    {getMejoriaText(nivelMejoria)}
                  </Badge>
                </div>

                <div className="px-1 py-0">
                  <Slider
                    defaultValue={[nivelMejoria]}
                    max={10}
                    step={1}
                    onValueChange={(value) => onNivelMejoriaChange(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Sin mejoría</span>
                    <span>Mejoría moderada</span>
                    <span>Mejoría completa</span>
                  </div>
                </div>
              </div>

              {/* Adherencia al tratamiento */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Adherencia al tratamiento
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Evalúe el cumplimiento del tratamiento y la respuesta del paciente
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  value={adherenciaTratamiento}
                  onChange={(e) => onAdherenciaTratamientoChange(e.target.value)}
                  onBlur={() => handleBlur('adherenciaTratamiento')}
                  placeholder="¿Cómo ha sido la adherencia al tratamiento?"
                  className={cn(
                    "min-h-[80px] resize-none bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all",
                    touched.adherenciaTratamiento && isFieldEmpty(adherenciaTratamiento) && 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  )}
                />
                {touched.adherenciaTratamiento && isFieldEmpty(adherenciaTratamiento) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="h-3 w-3" /> Este campo es obligatorio
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => handleAiSuggestion('adherenciaTratamiento')}
                  variant="outline"
                  size="sm"
                  className="mt-0.5 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  disabled={aiSuggestionActive !== null}
                >
                  {aiSuggestionActive === 'adherenciaTratamiento' ? (
                    <>Generando sugerencia<span className="animate-pulse">...</span></>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Sugerir texto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <Separator className="my-3" />

          {/* Sección 3: Objetivos y Observaciones */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-700">Objetivos y Observaciones</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Ajuste de objetivos */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Ajuste de objetivos terapéuticos
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Indique si es necesario modificar los objetivos del tratamiento
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  value={ajusteObjetivos}
                  onChange={(e) => onAjusteObjetivosChange(e.target.value)}
                  onBlur={() => handleBlur('ajusteObjetivos')}
                  placeholder="¿Es necesario ajustar los objetivos terapéuticos?"
                  className={cn(
                    "min-h-[80px] resize-none bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all",
                    touched.ajusteObjetivos && isFieldEmpty(ajusteObjetivos) && 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  )}
                />
                {touched.ajusteObjetivos && isFieldEmpty(ajusteObjetivos) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="h-3 w-3" /> Este campo es obligatorio
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => handleAiSuggestion('ajusteObjetivos')}
                  variant="outline"
                  size="sm"
                  className="mt-0.5 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  disabled={aiSuggestionActive !== null}
                >
                  {aiSuggestionActive === 'ajusteObjetivos' ? (
                    <>Generando sugerencia<span className="animate-pulse">...</span></>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Sugerir texto
                    </>
                  )}
                </Button>
              </div>

              {/* Observaciones del terapeuta */}
              <div className="space-y-1">
                <div className="flex items-center gap-1 mb-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Observaciones clínicas
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-pointer ml-1" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      Incluya observaciones relevantes para el seguimiento
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  value={observacionesTerapeuta}
                  onChange={(e) => onObservacionesTerapeutaChange(e.target.value)}
                  onBlur={() => handleBlur('observacionesTerapeuta')}
                  placeholder="Observaciones clínicas adicionales"
                  className={cn(
                    "min-h-[80px] resize-none bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all",
                    touched.observacionesTerapeuta && isFieldEmpty(observacionesTerapeuta) && 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  )}
                />
                {touched.observacionesTerapeuta && isFieldEmpty(observacionesTerapeuta) && (
                  <div className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                    <AlertCircle className="h-3 w-3" /> Este campo es obligatorio
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => handleAiSuggestion('observacionesTerapeuta')}
                  variant="outline"
                  size="sm"
                  className="mt-0.5 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  disabled={aiSuggestionActive !== null}
                >
                  {aiSuggestionActive === 'observacionesTerapeuta' ? (
                    <>Generando sugerencia<span className="animate-pulse">...</span></>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      Sugerir texto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Botón de acción */}
          <motion.div
            className="flex justify-end mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="button"
              onClick={handleSubmit}
              className={cn(
                "bg-blue-600 hover:bg-blue-700 text-white transition-colors",
                !isFormValid && 'opacity-60 cursor-not-allowed'
              )}
              disabled={!isFormValid}
            >
              Guardar y continuar
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}