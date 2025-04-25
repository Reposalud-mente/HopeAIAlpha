'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, Lightbulb, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  content: string;
  type: 'diagnosis' | 'recommendation' | 'tip';
}

interface AssistantPanelProps {
  step: string;
  category?: string;
  onSuggestionApply: (suggestion: Suggestion) => void;
}

export default function AssistantPanel({ 
  step, 
  category,
  onSuggestionApply 
}: AssistantPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  
  // Generar sugerencias basadas en el paso actual y la categoría seleccionada
  const getSuggestions = (): Suggestion[] => {
    if (step === 'diagnostic-criteria') {
      if (category === 'trastornos-animo') {
        return [
          {
            id: 'depression-mild',
            title: 'Trastorno depresivo leve',
            content: 'Trastorno depresivo leve (F32.0). El paciente presenta síntomas depresivos de intensidad leve con aproximadamente 1 mes de evolución. Los síntomas incluyen estado de ánimo bajo, disminución del interés y fatiga aumentada. Estos síntomas causan malestar pero solo un deterioro menor en el funcionamiento social o laboral.',
            type: 'diagnosis'
          },
          {
            id: 'depression-moderate',
            title: 'Trastorno depresivo moderado',
            content: 'Trastorno depresivo moderado (F32.1). El paciente presenta un cuadro clínico caracterizado por síntomas depresivos de intensidad moderada con aproximadamente 2 meses de evolución. Los síntomas principales incluyen estado de ánimo deprimido la mayor parte del día, disminución marcada del interés y capacidad para el placer, alteraciones del sueño, fatiga persistente, dificultades de concentración y sentimientos de inutilidad. Estos síntomas han generado un deterioro significativo en su funcionamiento social y laboral.',
            type: 'diagnosis'
          },
          {
            id: 'depression-severe',
            title: 'Trastorno depresivo grave',
            content: 'Trastorno depresivo grave (F32.2). El paciente presenta un cuadro depresivo severo caracterizado por síntomas intensos y persistentes durante más de 3 meses. Presenta marcado estado de ánimo deprimido, anhedonia completa, alteraciones significativas del sueño y apetito, agitación o enlentecimiento psicomotor, fatiga intensa, sentimientos de inutilidad y culpa desproporcionada, y dificultades graves de concentración. El funcionamiento social, laboral y personal está severamente comprometido, requiriendo apoyo para actividades básicas.',
            type: 'diagnosis'
          }
        ];
      } else if (category === 'trastornos-ansiedad') {
        return [
          {
            id: 'gad',
            title: 'Trastorno de ansiedad generalizada',
            content: 'Trastorno de ansiedad generalizada (F41.1). El paciente presenta un patrón persistente de preocupación excesiva y ansiedad anticipatoria de difícil control, presente la mayor parte de los días durante al menos 6 meses. Esta preocupación abarca múltiples áreas vitales y se acompaña de síntomas como tensión muscular, irritabilidad, inquietud psicomotriz, dificultades de concentración y alteraciones del sueño. La sintomatología ansiosa genera un malestar clínicamente significativo e interfiere con su funcionamiento cotidiano.',
            type: 'diagnosis'
          },
          {
            id: 'panic',
            title: 'Trastorno de pánico',
            content: 'Trastorno de pánico (F41.0). El paciente presenta ataques recurrentes e inesperados de miedo intenso que alcanzan su máxima expresión en minutos, acompañados de síntomas físicos (palpitaciones, sudoración, temblores, sensación de ahogo, náuseas, mareo) y cognitivos (miedo a perder el control, miedo a morir). Estos episodios generan preocupación persistente por la posibilidad de sufrir nuevos ataques y cambios significativos en el comportamiento relacionados con los ataques.',
            type: 'diagnosis'
          },
          {
            id: 'social-phobia',
            title: 'Fobia social',
            content: 'Fobia social (F40.1). El paciente presenta un miedo intenso y persistente a situaciones sociales o actuaciones en público por temor a que resulten embarazosas o humillantes. La exposición a estas situaciones provoca casi invariablemente una respuesta inmediata de ansiedad. Las situaciones sociales temidas se evitan o se soportan con intenso malestar, interfiriendo significativamente con la rutina normal, el funcionamiento laboral y las relaciones sociales.',
            type: 'diagnosis'
          }
        ];
      } else if (!category) {
        return [
          {
            id: 'diagnostic-tip',
            title: 'Cómo escribir un buen diagnóstico',
            content: 'Un diagnóstico clínico efectivo debe incluir: 1) El nombre específico del trastorno y su código, 2) Los síntomas principales que presenta el paciente, 3) La duración e intensidad de los síntomas, 4) El impacto funcional en diferentes áreas de la vida del paciente, y 5) Elementos relevantes para el diagnóstico diferencial.',
            type: 'tip'
          }
        ];
      }
    } else if (step === 'recommendations') {
      if (category === 'trastornos-animo') {
        return [
          {
            id: 'depression-cbt',
            title: 'TCC para depresión',
            content: '**Intervención psicoterapéutica:**\n- Se recomienda iniciar psicoterapia con enfoque cognitivo-conductual, con frecuencia semanal durante las primeras 8 semanas.\n- Implementar técnicas de activación conductual para incrementar gradualmente actividades gratificantes y significativas.\n- Trabajar en la identificación y reestructuración de patrones de pensamiento negativo y creencias disfuncionales.\n\n**Consideraciones farmacológicas:**\n- Derivar a evaluación psiquiátrica para valorar la pertinencia de tratamiento farmacológico complementario.\n\n**Recomendaciones de estilo de vida:**\n- Establecer rutinas regulares de sueño.\n- Incorporar actividad física moderada de forma regular.\n- Fomentar la conexión social y actividades que promuevan un sentido de logro.',
            type: 'recommendation'
          }
        ];
      } else if (category === 'trastornos-ansiedad') {
        return [
          {
            id: 'anxiety-management',
            title: 'Manejo de ansiedad',
            content: '**Intervención psicoterapéutica:**\n- Iniciar psicoterapia cognitivo-conductual con énfasis en técnicas de manejo de ansiedad, con frecuencia semanal.\n- Entrenamiento en técnicas de relajación: respiración diafragmática, relajación muscular progresiva y mindfulness.\n- Reestructuración cognitiva enfocada en la identificación y modificación de pensamientos catastrofistas.\n\n**Recomendaciones de estilo de vida:**\n- Reducir o eliminar el consumo de estimulantes (cafeína, bebidas energéticas).\n- Incorporar prácticas de mindfulness o meditación diarias.\n- Establecer rutinas de sueño saludables y consistentes.',
            type: 'recommendation'
          }
        ];
      } else {
        return [
          {
            id: 'recommendation-tip',
            title: 'Cómo escribir buenas recomendaciones',
            content: 'Las recomendaciones terapéuticas efectivas deben ser: 1) Específicas y concretas, 2) Organizadas por áreas (psicoterapia, estilo de vida, etc.), 3) Realistas y alcanzables, 4) Personalizadas para el paciente específico, y 5) Incluir un plan de seguimiento claro.',
            type: 'tip'
          }
        ];
      }
    }
    
    return [
      {
        id: 'general-tip',
        title: 'Consejo general',
        content: 'Seleccione una categoría diagnóstica para recibir sugerencias específicas que le ayudarán a completar este paso de manera más eficiente.',
        type: 'tip'
      }
    ];
  };
  
  const suggestions = getSuggestions();
  
  const handleSuggestionClick = (suggestionId: string) => {
    if (activeSuggestion === suggestionId) {
      setActiveSuggestion(null);
    } else {
      setActiveSuggestion(suggestionId);
    }
  };
  
  const handleApplySuggestion = (suggestion: Suggestion) => {
    onSuggestionApply(suggestion);
    setActiveSuggestion(null);
  };
  
  return (
    <Card className="border border-blue-100 bg-blue-50/50 overflow-hidden transition-all duration-300">
      <div 
        className="bg-gradient-to-r from-blue-100 to-blue-50 p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-700">Asistente IA</h3>
        </div>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-3">
          <p className="text-sm text-blue-700 mb-3">
            Sugerencias para ayudarte a completar este paso:
          </p>
          
          <div className="space-y-2">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className="rounded-md overflow-hidden border border-blue-200">
                <div 
                  className={`p-2 flex items-center justify-between cursor-pointer ${
                    activeSuggestion === suggestion.id ? 'bg-blue-100' : 'bg-white hover:bg-blue-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion.id)}
                >
                  <div className="flex items-center gap-2">
                    {suggestion.type === 'diagnosis' && <Sparkles className="h-4 w-4 text-blue-600" />}
                    {suggestion.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-amber-500" />}
                    {suggestion.type === 'tip' && <MessageSquare className="h-4 w-4 text-green-600" />}
                    <span className="text-sm font-medium">{suggestion.title}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${activeSuggestion === suggestion.id ? 'rotate-180' : ''}`} />
                </div>
                
                {activeSuggestion === suggestion.id && (
                  <div className="p-3 bg-white border-t border-blue-100">
                    <div className="text-sm text-gray-700 whitespace-pre-line mb-3">
                      {suggestion.content}
                    </div>
                    
                    {suggestion.type !== 'tip' && (
                      <Button 
                        size="sm" 
                        className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        <Check className="h-3 w-3" />
                        <span>Aplicar esta sugerencia</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
