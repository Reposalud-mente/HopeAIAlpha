'use client';

import React from 'react';
import { FileCheck, TrendingUp } from 'lucide-react';
import { WorkflowStep } from '../DynamicReportWizard';

// Placeholder para los componentes reales
const TherapeuticAchievementsStep = () => <div>Componente de Logros Terapéuticos</div>;
const DischargeRecommendationsStep = () => <div>Componente de Recomendaciones al Alta</div>;

// Definir los pasos específicos para el alta terapéutica
const DischargeReportSteps: WorkflowStep[] = [
  {
    id: 'therapeutic-achievements',
    label: 'Logros Terapéuticos',
    icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    component: TherapeuticAchievementsStep,
    validationFn: (formState) => true
  },
  {
    id: 'discharge-recommendations',
    label: 'Recomendaciones al Alta',
    icon: <FileCheck className="w-5 h-5 text-blue-500" />,
    component: DischargeRecommendationsStep,
    validationFn: (formState) => true
  }
];

export default DischargeReportSteps;
