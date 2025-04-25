'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Activity, Pill } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface EvolutionStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

export default function EvolutionStep({ 
  formState, 
  updateForm, 
  updateReportData,
  onComplete 
}: EvolutionStepProps) {
  const [evolucion, setEvolucion] = useState(formState.reportData.evolucion || '');
  const [cambiosSintomas, setCambiosSintomas] = useState(formState.reportData.cambiosSintomas || '');
  const [nivelMejoria, setNivelMejoria] = useState(formState.reportData.nivelMejoria || 5);
  const [adherenciaTratamiento, setAdherenciaTratamiento] = useState(formState.reportData.adherenciaTratamiento || '');
  
  // Guardar los datos y continuar
  const handleSave = () => {
    updateReportData({
      evolucion,
      cambiosSintomas,
      nivelMejoria,
      adherenciaTratamiento
    });
    onComplete();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Evolución del Paciente
        </h3>
        <p className="text-sm text-gray-600">
          Describa la evolución del paciente desde la última sesión y los cambios observados.
        </p>
      </div>
      
      {/* Evolución desde la última sesión */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          Evolución desde la última sesión
        </Label>
        <Textarea
          value={evolucion}
          onChange={(e) => setEvolucion(e.target.value)}
          placeholder="Describa la evolución del paciente desde la última sesión..."
          className="min-h-[120px] bg-white"
        />
      </div>
      
      {/* Cambios en síntomas */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          Cambios en síntomas
        </Label>
        <Textarea
          value={cambiosSintomas}
          onChange={(e) => setCambiosSintomas(e.target.value)}
          placeholder="Detalle los cambios observados en los síntomas principales..."
          className="min-h-[120px] bg-white"
        />
      </div>
      
      {/* Nivel de mejoría (escala visual) */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          Nivel de mejoría
        </Label>
        <div className="px-2">
          <Slider
            defaultValue={[nivelMejoria]}
            max={10}
            step={1}
            onValueChange={(value) => setNivelMejoria(value[0])}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Sin mejoría</span>
            <span>Mejoría moderada</span>
            <span>Mejoría significativa</span>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-md text-center">
          <span className="text-blue-700 font-medium">Nivel actual: {nivelMejoria}/10</span>
        </div>
      </div>
      
      {/* Adherencia y respuesta al tratamiento */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Pill className="h-4 w-4 text-blue-600" />
          Adherencia y respuesta al tratamiento
        </Label>
        <Textarea
          value={adherenciaTratamiento}
          onChange={(e) => setAdherenciaTratamiento(e.target.value)}
          placeholder="Describa la adherencia del paciente al tratamiento y su respuesta..."
          className="min-h-[120px] bg-white"
        />
      </div>
      
      {/* Botón para guardar y continuar */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={!evolucion}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Guardar y Continuar
        </Button>
      </div>
    </div>
  );
}
