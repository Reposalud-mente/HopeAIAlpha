'use client';

import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { WorkflowStep } from '../DynamicReportWizard';

// Importar los componentes de pasos específicos
import EvolutionStep from './steps/followup/EvolutionStep';
import TreatmentGoalsStep from './steps/followup/TreatmentGoalsStep';

// Definir los pasos específicos para el seguimiento terapéutico
const TherapeuticFollowupSteps: WorkflowStep[] = [
  {
    id: 'evolution',
    label: 'Evolución',
    icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    component: EvolutionStep,
    validationFn: (formState) => !!formState.reportData.evolucion
  },
  {
    id: 'treatment-goals',
    label: 'Objetivos Terapéuticos',
    icon: <Target className="w-5 h-5 text-blue-500" />,
    component: TreatmentGoalsStep,
    validationFn: (formState) => true
  }
];

export default TherapeuticFollowupSteps;
