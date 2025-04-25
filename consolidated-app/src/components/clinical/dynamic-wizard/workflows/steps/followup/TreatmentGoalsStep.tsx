'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, Eye } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TreatmentGoalsStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

// Objetivos terapéuticos comunes
const COMMON_GOALS = [
  { id: 'reducir-ansiedad', label: 'Reducir niveles de ansiedad', achieved: false },
  { id: 'mejorar-estado-animo', label: 'Mejorar estado de ánimo', achieved: false },
  { id: 'desarrollar-habilidades', label: 'Desarrollar habilidades de afrontamiento', achieved: false },
  { id: 'mejorar-relaciones', label: 'Mejorar relaciones interpersonales', achieved: false },
  { id: 'aumentar-autoestima', label: 'Aumentar autoestima', achieved: false },
  { id: 'reducir-conductas', label: 'Reducir conductas problemáticas', achieved: false },
  { id: 'procesar-trauma', label: 'Procesar experiencias traumáticas', achieved: false },
  { id: 'mejorar-comunicacion', label: 'Mejorar habilidades de comunicación', achieved: false }
];

export default function TreatmentGoalsStep({ 
  formState, 
  updateForm, 
  updateReportData,
  onComplete 
}: TreatmentGoalsStepProps) {
  const [ajusteObjetivos, setAjusteObjetivos] = useState(formState.reportData.ajusteObjetivos || '');
  const [observacionesTerapeuta, setObservacionesTerapeuta] = useState(formState.reportData.observacionesTerapeuta || '');
  const [selectedGoals, setSelectedGoals] = useState<{id: string, achieved: boolean}[]>(
    formState.reportData.selectedGoals || []
  );
  
  // Manejar la selección de objetivos
  const handleGoalSelect = (goalId: string) => {
    const existingGoal = selectedGoals.find(g => g.id === goalId);
    
    if (existingGoal) {
      // Si ya existe, actualizar el estado de logro
      setSelectedGoals(selectedGoals.map(g => 
        g.id === goalId ? { ...g, achieved: !g.achieved } : g
      ));
    } else {
      // Si no existe, añadirlo
      setSelectedGoals([...selectedGoals, { id: goalId, achieved: false }]);
    }
  };
  
  // Manejar el cambio de estado de logro
  const handleAchievementChange = (goalId: string, achieved: boolean) => {
    setSelectedGoals(selectedGoals.map(g => 
      g.id === goalId ? { ...g, achieved } : g
    ));
  };
  
  // Guardar los datos y continuar
  const handleSave = () => {
    updateReportData({
      ajusteObjetivos,
      observacionesTerapeuta,
      selectedGoals
    });
    onComplete();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Objetivos Terapéuticos
        </h3>
        <p className="text-sm text-gray-600">
          Evalúe el progreso en los objetivos terapéuticos y realice ajustes si es necesario.
        </p>
      </div>
      
      {/* Objetivos terapéuticos */}
      <Card className="p-4 bg-gray-50 border border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">Objetivos terapéuticos</h4>
        <div className="space-y-3">
          {COMMON_GOALS.map(goal => {
            const selectedGoal = selectedGoals.find(g => g.id === goal.id);
            const isSelected = !!selectedGoal;
            const isAchieved = selectedGoal?.achieved || false;
            
            return (
              <div key={goal.id} className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id={`select-${goal.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleGoalSelect(goal.id)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`select-${goal.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {goal.label}
                  </label>
                </div>
                
                {isSelected && (
                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor={`achieved-${goal.id}`}
                      className="text-xs text-gray-600"
                    >
                      Logrado
                    </label>
                    <Checkbox
                      id={`achieved-${goal.id}`}
                      checked={isAchieved}
                      onCheckedChange={(checked) => handleAchievementChange(goal.id, checked as boolean)}
                      className="h-4 w-4"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Ajustes de objetivos */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          Ajustes de objetivos
        </Label>
        <Textarea
          value={ajusteObjetivos}
          onChange={(e) => setAjusteObjetivos(e.target.value)}
          placeholder="Indique si es necesario ajustar los objetivos terapéuticos..."
          className="min-h-[120px] bg-white"
        />
      </div>
      
      {/* Observaciones del terapeuta */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-600" />
          Observaciones del terapeuta
        </Label>
        <Textarea
          value={observacionesTerapeuta}
          onChange={(e) => setObservacionesTerapeuta(e.target.value)}
          placeholder="Incluya observaciones clínicas adicionales relevantes para el seguimiento..."
          className="min-h-[120px] bg-white"
        />
      </div>
      
      {/* Botón para guardar y continuar */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Guardar y Continuar
        </Button>
      </div>
    </div>
  );
}
