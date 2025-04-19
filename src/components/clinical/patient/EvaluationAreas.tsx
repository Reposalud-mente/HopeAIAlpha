'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EvaluationAreasProps {
  areasEvaluacion: string[];
  onAreasChange: (areas: string[]) => void;
  onComplete: () => void;
  availableAreas?: any[];
}

// Default available evaluation areas with descriptions
const defaultAreas = [
  {
    id: 'cognitiva',
    name: 'Función Cognitiva',
    description: 'Memoria, atención, concentración y funciones ejecutivas',
  },
  {
    id: 'emocional',
    name: 'Regulación Emocional',
    description: 'Manejo de emociones, expresión afectiva y reactividad',
  },
  {
    id: 'conductual',
    name: 'Comportamiento',
    description: 'Patrones de conducta, hábitos y comportamientos específicos',
  },
  {
    id: 'social',
    name: 'Funcionamiento Social',
    description: 'Habilidades sociales, relaciones interpersonales y adaptación',
  },
  {
    id: 'personalidad',
    name: 'Rasgos de Personalidad',
    description: 'Características persistentes de pensamiento, comportamiento y emoción',
  },
  {
    id: 'autoconcepto',
    name: 'Autoconcepto',
    description: 'Autopercepción, autoestima e identidad',
  },
  {
    id: 'trauma',
    name: 'Trauma',
    description: 'Experiencias traumáticas y respuestas asociadas',
  },
  {
    id: 'estres',
    name: 'Estrés y Afrontamiento',
    description: 'Niveles de estrés y estrategias de adaptación',
  },
  {
    id: 'familiar',
    name: 'Dinámica Familiar',
    description: 'Relaciones, comunicación y estructura familiar',
  },
];

export default function EvaluationAreas({
  areasEvaluacion,
  onAreasChange,
  onComplete,
  availableAreas: customAreas
}: EvaluationAreasProps) {
  // Use custom areas if provided, otherwise use default areas
  const availableAreas = customAreas && customAreas.length > 0 ? customAreas : defaultAreas;
  const MAX_SELECTIONS = 4; // Maximum number of areas that can be selected

  const handleAreaToggle = (areaId: string) => {
    if (areasEvaluacion.includes(areaId)) {
      // Remove area if already selected
      onAreasChange(areasEvaluacion.filter(area => area !== areaId));
    } else if (areasEvaluacion.length < MAX_SELECTIONS) {
      // Add area if under the limit
      onAreasChange([...areasEvaluacion, areaId]);
    }
  };

  return (
    <div className="space-y-6">
      <div>

        <p className="text-sm text-gray-500 mb-6">
          Seleccione hasta {MAX_SELECTIONS} áreas a evaluar según el motivo de consulta.
        </p>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {availableAreas.map((area) => (
              <Card
                key={area.id}
                className={`p-4 cursor-pointer transition-all ${
                  areasEvaluacion.includes(area.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => handleAreaToggle(area.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex h-5 items-center">
                    <Checkbox
                      id={`area-${area.id}`}
                      checked={areasEvaluacion.includes(area.id)}
                      onCheckedChange={() => {}}
                      className={areasEvaluacion.includes(area.id) ? 'bg-blue-500' : ''}
                    />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={`area-${area.id}`}
                      className="text-base font-medium cursor-pointer"
                    >
                      {area.name}
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">{area.description}</p>
                  </div>
                  {areasEvaluacion.includes(area.id) && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {areasEvaluacion.length === MAX_SELECTIONS && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
            Has seleccionado el máximo de {MAX_SELECTIONS} áreas. Deselecciona alguna para cambiar tu selección.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          {areasEvaluacion.length} de {MAX_SELECTIONS} áreas seleccionadas
        </div>
        <Button
          onClick={onComplete}
          disabled={areasEvaluacion.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}