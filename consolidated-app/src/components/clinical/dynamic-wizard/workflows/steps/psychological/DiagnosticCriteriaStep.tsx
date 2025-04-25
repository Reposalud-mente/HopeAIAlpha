'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListChecks, Stethoscope, Lightbulb, Sparkles, Loader2, Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AssistantPanel from '@/components/clinical/dynamic-wizard/shared/AssistantPanel';

interface DiagnosticCriteriaStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

// Categorías diagnósticas comunes de la CIE-11
const DIAGNOSTIC_CATEGORIES = [
  { id: 'trastornos-animo', label: 'Trastornos del estado de ánimo', code: 'F30-F39', icon: '😔' },
  { id: 'trastornos-ansiedad', label: 'Trastornos de ansiedad', code: 'F40-F48', icon: '😰' },
  { id: 'trastornos-personalidad', label: 'Trastornos de la personalidad', code: 'F60-F69', icon: '👤' },
  { id: 'trastornos-desarrollo', label: 'Trastornos del desarrollo', code: 'F80-F89', icon: '👶' },
  { id: 'trastornos-conducta', label: 'Trastornos de la conducta', code: 'F90-F98', icon: '💥' },
  { id: 'trastornos-alimentarios', label: 'Trastornos alimentarios', code: 'F50', icon: '🍽️' },
  { id: 'trastornos-sueno', label: 'Trastornos del sueño', code: 'F51', icon: '💤' },
  { id: 'trastornos-adaptativos', label: 'Trastornos adaptativos', code: 'F43', icon: '💭' }
];

// Niveles de severidad
const SEVERITY_LEVELS = [
  { value: 'leve', label: 'Leve' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'grave', label: 'Grave' }
];

export default function DiagnosticCriteriaStep({
  formState,
  updateForm,
  updateReportData,
  onComplete
}: DiagnosticCriteriaStepProps) {
  const [diagnosticoPresuntivo, setDiagnosticoPresuntivo] = useState(formState.reportData.diagnosticoPresuntivo || '');
  const [codigoCIE, setCodigoCIE] = useState(formState.reportData.codigoCIE || '');
  const [severidad, setSeveridad] = useState(formState.reportData.severidad || '');
  const [recomendaciones, setRecomendaciones] = useState(formState.reportData.recomendaciones || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Filtrar categorías basadas en la búsqueda
  const filteredCategories = DIAGNOSTIC_CATEGORIES.filter(category =>
    searchTerm === '' ||
    category.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar la selección de categoría diagnóstica
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = DIAGNOSTIC_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      setCodigoCIE(category.code);
    }
  };

  // Asistente de redacción para diagnóstico
  const generateDiagnostico = () => {
    if (!selectedCategory) return;

    setIsGenerating(true);

    // Obtener la categoría seleccionada
    const category = DIAGNOSTIC_CATEGORIES.find(c => c.id === selectedCategory);

    // Simular una llamada a la API de IA (en una implementación real, esto sería una llamada a la API)
    setTimeout(() => {
      // Estructura del diagnóstico: nombre del trastorno, código, severidad, síntomas principales, duración, impacto funcional
      let generatedText = '';

      switch (selectedCategory) {
        case 'trastornos-animo':
          generatedText = `Trastorno depresivo ${severidad || 'moderado'} (${codigoCIE || 'F32.1'}).

El paciente presenta un cuadro clínico caracterizado por síntomas depresivos de intensidad ${severidad || 'moderada'} con aproximadamente 2 meses de evolución. Los síntomas principales incluyen estado de ánimo deprimido la mayor parte del día, disminución marcada del interés y capacidad para el placer, alteraciones del sueño (insomnio de mantenimiento), fatiga persistente, dificultades de concentración y sentimientos de inutilidad.

Estos síntomas han generado un deterioro significativo en su funcionamiento social, laboral y familiar, afectando especialmente su rendimiento laboral y sus relaciones interpersonales. No se identifican ideas de muerte o suicidio activas. No hay antecedentes de episodios maníacos o hipomaníacos que sugieran un trastorno bipolar.`;
          break;
        case 'trastornos-ansiedad':
          generatedText = `Trastorno de ansiedad generalizada ${severidad || 'moderado'} (${codigoCIE || 'F41.1'}).

El paciente presenta un patrón persistente de preocupación excesiva y ansiedad anticipatoria de difícil control, presente la mayor parte de los días durante al menos 6 meses. Esta preocupación abarca múltiples áreas vitales (trabajo, salud, familia) y se acompaña de síntomas como tensión muscular, irritabilidad, inquietud psicomotriz, dificultades de concentración y alteraciones del sueño (principalmente dificultad para conciliar el sueño).

La sintomatología ansiosa genera un malestar clínicamente significativo e interfiere con su funcionamiento cotidiano, especialmente en el ámbito laboral y social. No se identifican factores orgánicos o consumo de sustancias que puedan explicar mejor los síntomas.`;
          break;
        default:
          generatedText = `${category?.label || 'Trastorno'} de intensidad ${severidad || 'moderada'} (${codigoCIE || 'Pendiente'}).

El paciente presenta un cuadro clínico caracterizado por [describir síntomas principales] con una evolución de aproximadamente [indicar duración]. La sintomatología incluye [detallar manifestaciones clínicas relevantes], que se presentan con una frecuencia [diaria/semanal] y una intensidad [leve/moderada/grave].

Estos síntomas generan un impacto significativo en [especificar áreas de funcionamiento afectadas: laboral, académica, social, familiar], manifestado por [describir consecuencias funcionales concretas]. No se identifican [mencionar factores descartados relevantes para el diagnóstico diferencial].`;
      }

      setDiagnosticoPresuntivo(generatedText);
      setIsGenerating(false);
    }, 1500);
  };

  // Asistente de redacción para recomendaciones
  const generateRecomendaciones = () => {
    if (!diagnosticoPresuntivo) return;

    setIsGenerating(true);

    // Simular una llamada a la API de IA (en una implementación real, esto sería una llamada a la API que analizaría el diagnóstico)
    setTimeout(() => {
      // Estructura de recomendaciones: intervención psicoterapéutica, consideraciones farmacológicas, cambios en estilo de vida, seguimiento
      let generatedText = '';

      switch (selectedCategory) {
        case 'trastornos-animo':
          generatedText = `**Intervención psicoterapéutica:**
- Se recomienda iniciar psicoterapia con enfoque cognitivo-conductual, con frecuencia semanal durante las primeras 8 semanas.
- Implementar técnicas de activación conductual para incrementar gradualmente actividades gratificantes y significativas.
- Trabajar en la identificación y reestructuración de patrones de pensamiento negativo y creencias disfuncionales.

**Consideraciones farmacológicas:**
- Derivar a evaluación psiquiátrica para valorar la pertinencia de tratamiento farmacológico complementario, especialmente si no hay respuesta adecuada a la intervención psicológica en 4-6 semanas.

**Recomendaciones de estilo de vida:**
- Establecer rutinas regulares de sueño, con horarios consistentes para acostarse y levantarse.
- Incorporar actividad física moderada de forma regular (30 minutos, al menos 3 veces por semana).
- Fomentar la conexión social y actividades que promuevan un sentido de logro y placer.

**Plan de seguimiento:**
- Reevaluación en 6 semanas para valorar evolución de síntomas y respuesta al tratamiento.
- Ajustar plan terapéutico según respuesta clínica.`;
          break;
        case 'trastornos-ansiedad':
          generatedText = `**Intervención psicoterapéutica:**
- Iniciar psicoterapia cognitivo-conductual con énfasis en técnicas de manejo de ansiedad, con frecuencia semanal.
- Entrenamiento en técnicas de relajación: respiración diafragmática, relajación muscular progresiva y mindfulness.
- Reestructuración cognitiva enfocada en la identificación y modificación de pensamientos catastrofistas y sobrestimación de amenazas.

**Consideraciones farmacológicas:**
- Valorar derivación a psiquiatría si los síntomas son de intensidad grave o interfieren significativamente con el funcionamiento diario.

**Recomendaciones de estilo de vida:**
- Reducir o eliminar el consumo de estimulantes (cafeína, bebidas energéticas).
- Incorporar prácticas de mindfulness o meditación diarias (10-15 minutos).
- Establecer rutinas de sueño saludables y consistentes.

**Plan de seguimiento:**
- Seguimiento en 4 semanas para evaluar progresos y ajustar intervenciones.
- Monitorizar la evolución de síntomas físicos de ansiedad.`;
          break;
        default:
          generatedText = `**Intervención psicoterapéutica:**
- Iniciar proceso psicoterapéutico con enfoque [especificar enfoque terapéutico más adecuado], con frecuencia [semanal/quincenal].
- Establecer objetivos terapéuticos específicos, medibles y alcanzables a corto y medio plazo.
- Implementar técnicas de [especificar técnicas relevantes para la problemática].

**Consideraciones adicionales:**
- [Incluir recomendaciones sobre evaluación complementaria o derivación si procede].
- Psicoeducación sobre la naturaleza de los síntomas y estrategias de afrontamiento adaptativas.

**Recomendaciones de estilo de vida:**
- Fomentar hábitos saludables: alimentación equilibrada, actividad física regular, higiene del sueño.
- Fortalecer red de apoyo social y familiar.

**Plan de seguimiento:**
- Reevaluación en [especificar tiempo] para valorar evolución y realizar ajustes en el plan de intervención si fuera necesario.`;
      }

      setRecomendaciones(generatedText);
      setIsGenerating(false);
    }, 1500);
  };

  // Funciones de ayuda para el indicador de progreso
  const getProgressColor = (length: number) => {
    if (length < 100) return 'bg-red-400';
    if (length < 250) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getProgressLabel = (length: number) => {
    if (length < 100) return 'Muy breve';
    if (length < 250) return 'Aceptable';
    if (length < 500) return 'Bueno';
    return 'Excelente';
  };

  const getProgressWidth = (length: number) => {
    // Convertir la longitud a un porcentaje de ancho (máximo 100%)
    const percentage = Math.min(100, length / 5);

    // Mapear el porcentaje a clases de Tailwind para anchos
    if (percentage <= 0) return 'w-0';
    if (percentage <= 5) return 'w-[5%]';
    if (percentage <= 10) return 'w-[10%]';
    if (percentage <= 15) return 'w-[15%]';
    if (percentage <= 20) return 'w-[20%]';
    if (percentage <= 25) return 'w-1/4';
    if (percentage <= 30) return 'w-[30%]';
    if (percentage <= 33) return 'w-1/3';
    if (percentage <= 40) return 'w-[40%]';
    if (percentage <= 50) return 'w-1/2';
    if (percentage <= 60) return 'w-[60%]';
    if (percentage <= 66) return 'w-2/3';
    if (percentage <= 70) return 'w-[70%]';
    if (percentage <= 75) return 'w-3/4';
    if (percentage <= 80) return 'w-[80%]';
    if (percentage <= 90) return 'w-[90%]';
    return 'w-full';
  };

  // Aplicar sugerencia del asistente
  const handleApplySuggestion = (suggestion: any) => {
    if (suggestion.type === 'diagnosis') {
      setDiagnosticoPresuntivo(suggestion.content);
    } else if (suggestion.type === 'recommendation') {
      setRecomendaciones(suggestion.content);
    }
  };

  // Guardar los datos y continuar
  const handleSave = () => {
    updateReportData({
      diagnosticoPresuntivo,
      codigoCIE,
      severidad,
      recomendaciones
    });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-blue-600" />
          Criterios Diagnósticos
        </h3>
        <p className="text-sm text-gray-600">
          Establezca el diagnóstico presuntivo y las recomendaciones terapéuticas.
        </p>
      </div>

      {/* Mensaje de bienvenida y guía */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Asistente de diagnóstico clínico</h4>
            <p className="text-sm text-blue-700">
              Este asistente le guiará en la formulación de un diagnóstico clínico preciso y recomendaciones terapéuticas efectivas. Seleccione una categoría diagnóstica para comenzar y utilice las sugerencias del panel de asistente para agilizar su trabajo.
            </p>
          </div>
        </div>
      </Card>

      {/* Pregunta sobre diagnóstico */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-blue-600" />
          Diagnóstico clínico
        </h4>

        <div className="p-3 bg-blue-50 rounded-md border border-blue-100 mb-4">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Registre el diagnóstico presuntivo basado en su evaluación clínica. Puede utilizar el asistente de IA para ayudarle a formular el diagnóstico.
          </p>
        </div>

        {/* Selector de categoría simplificado */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Categoría diagnóstica principal</Label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => handleCategorySelect(e.target.value)}
            aria-label="Categoría diagnóstica principal"
            id="diagnostic-category"
          >
            <option value="">Seleccione una categoría</option>
            {DIAGNOSTIC_CATEGORIES.map(category => (
              <option key={category.id} value={category.id}>
                {category.label} ({category.code})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código CIE-11 */}
          <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <Label className="text-sm font-medium text-gray-700 mb-2 block" htmlFor="codigo-cie">Código CIE-11</Label>
            <Input
              id="codigo-cie"
              value={codigoCIE}
              onChange={(e) => setCodigoCIE(e.target.value)}
              placeholder="Ej. F32.1"
              className="bg-white"
            />
            <p className="text-xs text-gray-500 mt-1">El código se ha rellenado automáticamente basado en la categoría seleccionada. Puede ajustarlo si es necesario.</p>
          </Card>

          {/* Nivel de severidad */}
          <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Nivel de severidad</Label>
            <RadioGroup value={severidad} onValueChange={setSeveridad} className="flex space-x-4">
              {SEVERITY_LEVELS.map(level => (
                <div key={level.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={level.value} id={level.value} />
                  <Label htmlFor={level.value} className="text-sm">{level.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </Card>
        </div>
      )}

      {/* Diagnóstico presuntivo */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-blue-600" />
            Diagnóstico presuntivo
          </h4>
          {selectedCategory && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={generateDiagnostico}
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
                        <span className="text-xs">Asistente de redacción</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Ayuda a formular el diagnóstico basado en la categoría seleccionada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="space-y-2">
          <Textarea
            value={diagnosticoPresuntivo}
            onChange={(e) => setDiagnosticoPresuntivo(e.target.value)}
            placeholder="Describa el diagnóstico presuntivo basado en la evaluación realizada..."
            className="min-h-[120px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />

          {/* Indicador de progreso */}
          {diagnosticoPresuntivo && (
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(diagnosticoPresuntivo.length)} ${getProgressWidth(diagnosticoPresuntivo.length)}`}
                  ></div>
                </div>
              </div>
              <div className="text-xs font-medium">
                {getProgressLabel(diagnosticoPresuntivo.length)}
              </div>
            </div>
          )}
        </div>

        {!selectedCategory ? (
          <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 text-blue-700 rounded-md">
            <Info className="h-4 w-4" />
            <p className="text-xs">Seleccione una categoría diagnóstica para utilizar el asistente de redacción.</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 text-gray-700 rounded-md border border-gray-200">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <p className="text-xs">Incluya información sobre los síntomas principales, duración, intensidad y el impacto en el funcionamiento del paciente.</p>
          </div>
        )}
      </Card>

      {/* Recomendaciones */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            Recomendaciones terapéuticas
          </h4>
          {diagnosticoPresuntivo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={generateRecomendaciones}
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
                        <span className="text-xs">Sugerir recomendaciones</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Sugerir recomendaciones basadas en el diagnóstico</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="space-y-2">
          <Textarea
            value={recomendaciones}
            onChange={(e) => setRecomendaciones(e.target.value)}
            placeholder="Incluya recomendaciones terapéuticas, de seguimiento o derivación..."
            className="min-h-[120px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />

          {/* Indicador de progreso */}
          {recomendaciones && (
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(recomendaciones.length)} ${getProgressWidth(recomendaciones.length)}`}
                  ></div>
                </div>
              </div>
              <div className="text-xs font-medium">
                {getProgressLabel(recomendaciones.length)}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 text-gray-700 rounded-md border border-gray-200">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <p className="text-xs">Incluya recomendaciones específicas y prácticas que ayuden al paciente a mejorar su situación. Considere intervenciones psicoterapéuticas, cambios en el estilo de vida, y seguimiento.</p>
        </div>
      </Card>

      {/* Asistente IA */}
      <AssistantPanel
        step="diagnostic-criteria"
        category={selectedCategory}
        onSuggestionApply={handleApplySuggestion}
      />

      {/* Botón para guardar y continuar */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={!diagnosticoPresuntivo}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium"
        >
          Guardar y Continuar
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Se requiere un diagnóstico presuntivo para continuar. Las recomendaciones son opcionales pero altamente recomendadas.
        </p>
      </div>
    </div>
  );
}
