// NEW IMPLEMENTATION — COMPLETE REWRITE FOR CLARITY & MAINTAINABILITY
// -------------------------------------------------------------------------------------------------
// Rationale: The previous implementation, while functional, duplicated large chunks of UI logic for
// each textarea field, which made the component long, harder to maintain, and error-prone.  To
// embrace HopeAI’s values of Simplicity (cleaner code / UI), Clinical Enhancement (better UX &
// accessibility), and Efficiency (less boilerplate, faster future changes), the component has been
// refactored to:
//   • Extract a reusable <FieldTextarea> molecule that encapsulates label, tooltip, validation,
//     suggestion button, and error message rendering.  This dramatically reduces duplication.
//   • Keep state-lifting via props (same public API) to avoid a breaking change for parents yet
//     isolate internal form concerns.
//   • Enhance accessibility via explicit id/aria associations, keyboard-navigable suggestion button,
//     and descriptive aria-props.
//   • Simplify AI-suggestion handling with a single dictionary + helper.
//   • Provide richer clinical anchors for the improvement slider.
//   • Supply inline comments mapping each change to either a best practice or a HopeAI core value.
// -------------------------------------------------------------------------------------------------
'use client';

import React, { useId, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Activity,
  Target,
  ChevronRight,
  Info,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ReportFieldsProps } from './ReportFieldsInterface';

// ----------------------------
// Internal helper components
// ----------------------------
interface FieldTextareaProps {
  label: string;
  tooltip: string;
  placeholder: string;
  required?: boolean;
  value: string;
  /** Prop-drilled change handler coming from the parent */
  onChange: (val: string) => void;
  /** Callback to mark field as blurred (for validation) */
  onBlur: () => void;
  /** Whether field currently shows validation error */
  showError: boolean;
  /** Optional AI suggestion trigger */
  onSuggest?: () => void;
  /** Loading state of AI suggestion */
  loading?: boolean;
}

/**
 * FieldTextarea – reusable molecule for labelled textarea with validation, tooltip & optional
 * suggestion button.  This reduces duplicated markup, improves consistency, and makes future
 * field-type switches (e.g. from free text to checklist) trivial – HopeAI value: Efficiency.
 */
const FieldTextarea: React.FC<FieldTextareaProps> = ({
  label,
  tooltip,
  placeholder,
  required = false,
  value,
  onChange,
  onBlur,
  showError,
  onSuggest,
  loading = false,
}) => {
  const inputId = useId(); // unique per instance – accessibility best practice
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-1.5">
      {/* Label + Tooltip + (optional) Suggest button */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Info icon acts as additional accessible description target */}
              <Info aria-label="Ayuda" className="h-3.5 w-3.5 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs leading-relaxed">{tooltip}</TooltipContent>
          </Tooltip>
        </div>
        {/* Suggestion button only shown when onSuggest prop provided (clinical decision support) */}
        {!!onSuggest && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-blue-600 hover:bg-blue-50"
            onClick={onSuggest}
            disabled={loading}
            aria-label={`Generar sugerencia para ${label}`}
          >
            {loading ? (
              <>
                <span className="animate-spin h-3 w-3 mr-1 border-t-2 border-blue-600 border-solid rounded-full"></span>
                Generando…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Sugerir
              </>
            )}
          </Button>
        )}
      </div>

      {/* The controlled textarea */}
      <Textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={showError}
        aria-describedby={showError ? errorId : undefined}
        className={cn(
          'min-h-[100px] resize-none bg-gray-50 border-gray-300 transition-colors duration-150',
          'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          showError &&
            'border-red-500 focus:border-red-600 focus:ring-red-600', // stronger error indication
        )}
      />

      {/* Validation message */}
      {showError && (
        <div
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs text-red-600 mt-1"
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Este campo es obligatorio.</span>
        </div>
      )}
    </div>
  );
};

// ----------------------------
// Main component props
// ----------------------------
interface TherapeuticFollowupFieldsProps extends ReportFieldsProps {
  evolucion: string;
  onEvolucionChange: (value: string) => void;
  cambiosSintomas: string;
  onCambiosSintomasChange: (value: string) => void;
  nivelMejoria: number; // 1-7 for CGI-I scale
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
  nivelMejoria = 4, // Default to 'Sin cambios' (4) on the CGI-I scale - valor neutral para prevenir sesgos clínicos
  onNivelMejoriaChange,
  adherenciaTratamiento = '',
  onAdherenciaTratamientoChange,
  ajusteObjetivos = '',
  onAjusteObjetivosChange,
  observacionesTerapeuta = '',
  onObservacionesTerapeutaChange,
  onComplete,
}: TherapeuticFollowupFieldsProps) {
  // ----------------------------------
  // Ensure default value for CGI-I scale
  // ----------------------------------
  // Utilizamos useEffect para asegurar que el valor inicial sea siempre 4 ("Sin cambios")
  // para prevenir sesgos clínicos, independientemente del valor recibido – HopeAI valor: Mejora Clínica
  useEffect(() => {
    // Establecemos el valor a 4 ("Sin cambios") al inicializar el componente
    // para garantizar consistencia y prevenir sesgos clínicos
    onNivelMejoriaChange(4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Se ejecuta solo al montar el componente

  // ----------------------------------
  // Form validation helpers & state
  // ----------------------------------
  const isFieldEmpty = (val: string) => val.trim().length === 0;
  const [touched, setTouched] = useState({
    evolucion: false,
    cambiosSintomas: false,
    adherenciaTratamiento: false,
    ajusteObjetivos: false,
    observacionesTerapeuta: false,
  });

  // Add a state to track if form submission was attempted
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const markTouched = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const isFormValid =
    !isFieldEmpty(evolucion) &&
    !isFieldEmpty(cambiosSintomas) &&
    !isFieldEmpty(adherenciaTratamiento) &&
    !isFieldEmpty(ajusteObjetivos) &&
    !isFieldEmpty(observacionesTerapeuta);

  // ----------------------------------
  // Simulated AI suggestions logic
  // ----------------------------------
  const aiSuggestions = {
    adherenciaTratamiento:
      'El paciente muestra buena adherencia al tratamiento farmacológico prescrito. Reporta tomar la medicación según lo indicado y no ha experimentado efectos secundarios significativos que interfieran con su cumplimiento.',
    ajusteObjetivos:
      'Considerando el progreso actual, se mantienen los objetivos terapéuticos establecidos inicialmente. Se refuerza la importancia de continuar trabajando en las estrategias de afrontamiento ante situaciones de estrés.',
    observacionesTerapeuta:
      'Se observa una actitud colaborativa durante la sesión. El paciente muestra mayor insight sobre sus patrones de pensamiento y ha comenzado a implementar las técnicas de regulación emocional aprendidas en situaciones cotidianas.',
  } as const;

  type AiField = keyof typeof aiSuggestions;
  const [aiSuggestionActive, setAiSuggestionActive] = useState<AiField | null>(null);

  const triggerAiSuggestion = (field: AiField) => {
    setAiSuggestionActive(field);
    // Simulate latency to hint at processing – better UX expectation management
    setTimeout(() => {
      switch (field) {
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

  // ----------------------------------
  // CGI-I scale helpers
  // ----------------------------------
  // Función para obtener el color de la etiqueta según el valor de la escala CGI-I
  // Esto mejora la interpretabilidad clínica con indicadores visuales – HopeAI valor: Mejora Clínica
  const getCGIColor = (val: number) => {
    if (val <= 2) return 'bg-green-200 text-green-800 border-green-300'; // Improved
    if (val === 3) return 'bg-blue-200 text-blue-800 border-blue-300'; // Slightly improved
    if (val === 4) return 'bg-gray-200 text-gray-800 border-gray-300'; // No change
    return 'bg-red-200 text-red-800 border-red-300'; // Worse (5-7)
  };

  // Opciones de la escala CGI-I (Clinical Global Impression - Improvement)
  // Escala validada de 7 puntos que reemplaza la escala numérica de 0-10 para mayor validez clínica
  // y alineación con prácticas basadas en evidencia – HopeAI valor: Mejora Clínica
  // Los números (1-7) se muestran junto a cada opción para facilitar la referencia clínica
  // y mantener la consistencia con los formularios estándar de la escala CGI-I
  const cgiOptions = [
    { value: 1, label: 'Muchísimo mejor', description: 'Mejoría muy notable' },
    { value: 2, label: 'Mucho mejor', description: 'Mejoría considerable' },
    { value: 3, label: 'Levemente mejor', description: 'Mejoría leve pero apreciable' },
    { value: 4, label: 'Sin cambios', description: 'No hay cambios apreciables' },
    { value: 5, label: 'Levemente peor', description: 'Empeoramiento leve pero apreciable' },
    { value: 6, label: 'Mucho peor', description: 'Empeoramiento considerable' },
    { value: 7, label: 'Muchísimo peor', description: 'Empeoramiento muy grave' },
  ];

  // ----------------------------------
  // Submission handler
  // ----------------------------------
  const handleSubmit = () => {
    // Mark form submission as attempted to trigger validation messages
    setSubmitAttempted(true);

    // If the form is valid, proceed to the next step
    if (isFormValid && onComplete) onComplete();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  // No need for a ref since we're scrolling to an element by ID

  // Scroll to the template header when component mounts
  useEffect(() => {
    // Find the header element by ID
    const headerElement = document.getElementById('report-template-header');
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >

        <Card className="border-none shadow-none bg-transparent">
  <CardContent className="px-6 space-y-6">


          {/* ---------- Sección 1: Evolución y Cambios ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <header className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-700">Evolución y Cambios</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evolución */}
              <FieldTextarea
                label="Evolución desde la última sesión"
                tooltip="Describa los cambios observados en el paciente desde la sesión anterior (ej. ánimo, comportamiento, eventos significativos)."
                placeholder="Ej: 'Paciente reporta mejor ánimo general, aunque tuvo una discusión familiar relevante…'"
                required
                value={evolucion}
                onChange={onEvolucionChange}
                onBlur={() => markTouched('evolucion')}
                showError={submitAttempted && isFieldEmpty(evolucion)}
              />

              {/* Cambios de síntomas */}
              <FieldTextarea
                label="Cambios en síntomas principales"
                tooltip="Detalle cambios específicos en los síntomas clave definidos en el plan (ej. frecuencia de ataques de pánico, nivel de ansiedad subjetivo, horas de sueño)."
                placeholder="Ej: 'Reducción en frecuencia de rumiaciones negativas. Insomnio persiste…'"
                required
                value={cambiosSintomas}
                onChange={onCambiosSintomasChange}
                onBlur={() => markTouched('cambiosSintomas')}
                showError={submitAttempted && isFieldEmpty(cambiosSintomas)}
              />
            </div>
          </motion.section>

          <Separator className="my-5" />

          {/* ---------- Sección 2: Progreso y Adherencia ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <header className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-700">Progreso y Adherencia</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Escala de Impresión Clínica Global - Mejoría (CGI-I) */}
              {/* Implementación como dropdown para optimizar espacio y mantener consistencia – HopeAI valor: Simplicidad */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="cgi-select" className="text-sm font-medium text-gray-700">
                    Escala de Impresión Clínica Global - Mejoría (CGI-I)
                  </Label>
                  <Badge
                    variant="outline"
                    className={cn('font-semibold text-xs py-0.5 px-2 h-6 rounded', getCGIColor(nivelMejoria))}
                  >
                    {nivelMejoria ? `${nivelMejoria}. ${cgiOptions.find(opt => opt.value === nivelMejoria)?.label || ''}` : 'No seleccionado'}
                  </Badge>
                </div>

                {/* Select dropdown para la escala CGI-I - optimiza espacio y mantiene consistencia visual */}
                {/*
                  El valor por defecto es 'Sin cambios' (4) para evitar sesgos clínicos iniciales
                  y promover una evaluación objetiva – HopeAI valor: Mejora Clínica
                */}
                <Select
                  value={nivelMejoria.toString()}
                  defaultValue="4"
                  onValueChange={(value) => onNivelMejoriaChange(parseInt(value))}
                >
                  {/*
                    Trigger del dropdown con altura y espaciado optimizados para facilitar la interacción
                    y mejorar la legibilidad – HopeAI valor: Simplicidad y Eficiencia
                  */}
                  <SelectTrigger
                    id="cgi-select"
                    className="w-full bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 h-10 py-2 px-3 text-sm"
                    aria-label="Seleccionar nivel de mejoría global"
                  >
                    <SelectValue
                      placeholder="Seleccione el nivel de mejoría"
                      className="text-gray-600"
                      // Renderiza el valor seleccionado con el número de la escala CGI-I para mayor claridad clínica
                    />
                  </SelectTrigger>
                  {/*
                    Contenedor del dropdown con altura máxima definida y estilos mejorados
                    para una experiencia de usuario óptima – HopeAI valor: Mejora Clínica
                  */}
                  <SelectContent className="max-h-[280px] overflow-y-auto border border-gray-200 rounded-md shadow-md">
                    {cgiOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                        className="py-3 px-3 border-b border-gray-100 last:border-0"
                      >
                        {/*
                          Cada opción presenta un diseño limpio con espaciado adecuado entre
                          la etiqueta principal y su descripción – HopeAI valor: Simplicidad
                        */}
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm mb-1">
                            <span className="inline-block w-5 mr-1 text-gray-600">{option.value}.</span>
                            {option.label}
                          </span>
                          <span className="text-xs text-gray-500 pl-6">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/*
                  Texto explicativo que proporciona contexto clínico sobre la escala
                  sin ocupar demasiado espacio visual – HopeAI valor: Mejora Clínica
                */}
                <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Escala validada de 7 puntos que evalúa el cambio clínico global desde el inicio del tratamiento. El valor por defecto es "Sin cambios" para evitar sesgos en la evaluación clínica.
                </div>
              </div>

              {/* Adherencia al tratamiento */}
              <FieldTextarea
                label="Adherencia al plan terapéutico"
                tooltip="Evalúe el cumplimiento del paciente con las tareas, ejercicios, medicación (si aplica) y asistencia a sesiones."
                placeholder="Ej: 'Buena adherencia a tareas de registro. Olvidó medicación 2 veces…'"
                required
                value={adherenciaTratamiento}
                onChange={onAdherenciaTratamientoChange}
                onBlur={() => markTouched('adherenciaTratamiento')}
                showError={submitAttempted && isFieldEmpty(adherenciaTratamiento)}
                onSuggest={() => triggerAiSuggestion('adherenciaTratamiento')}
                loading={aiSuggestionActive === 'adherenciaTratamiento'}
              />
            </div>
          </motion.section>

          <Separator className="my-5" />

          {/* ---------- Sección 3: Objetivos & Observaciones ---------- */}
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <header className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-medium text-gray-700">Objetivos y Observaciones Clínicas</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ajuste de objetivos */}
              <FieldTextarea
                label="Ajuste de objetivos terapéuticos"
                tooltip="Indique si los objetivos actuales siguen siendo relevantes o si necesitan modificación basada en el progreso o nuevos hallazgos."
                placeholder="Ej: 'Mantener objetivos actuales. Considerar añadir objetivo sobre exposición social…'"
                required
                value={ajusteObjetivos}
                onChange={onAjusteObjetivosChange}
                onBlur={() => markTouched('ajusteObjetivos')}
                showError={submitAttempted && isFieldEmpty(ajusteObjetivos)}
                onSuggest={() => triggerAiSuggestion('ajusteObjetivos')}
                loading={aiSuggestionActive === 'ajusteObjetivos'}
              />

              {/* Observaciones del terapeuta */}
              <FieldTextarea
                label="Observaciones clínicas / Plan"
                tooltip="Incluya observaciones relevantes sobre el proceso terapéutico, la relación, contra-transferencia, y el plan para la próxima sesión."
                placeholder="Ej: 'Paciente receptivo, buena alianza terapéutica. Próxima sesión: revisar técnicas de respiración…'"
                required
                value={observacionesTerapeuta}
                onChange={onObservacionesTerapeutaChange}
                onBlur={() => markTouched('observacionesTerapeuta')}
                showError={submitAttempted && isFieldEmpty(observacionesTerapeuta)}
                onSuggest={() => triggerAiSuggestion('observacionesTerapeuta')}
                loading={aiSuggestionActive === 'observacionesTerapeuta'}
              />
            </div>
          </motion.section>

          {/* ---------- Submit ---------- */}
          <motion.div
            className="flex justify-end mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid || aiSuggestionActive !== null}
              aria-disabled={!isFormValid || aiSuggestionActive !== null}
              className={cn(
                'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md',
                'transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                !isFormValid && 'opacity-50 cursor-not-allowed hover:bg-blue-600',
              )}
            >
              Guardar Seguimiento
              <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  </TooltipProvider>
  );
}