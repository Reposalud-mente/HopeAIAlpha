'use client';

import React from 'react';
import { Brain, ListChecks } from 'lucide-react';
import { WorkflowStep } from '../DynamicReportWizard';

// Placeholder para los componentes reales
const CognitiveFunctionsStep = () => <div>Componente de Funciones Cognitivas</div>;
const NeuropsychologicalResultsStep = () => <div>Componente de Resultados Neuropsicológicos</div>;

// Definir los pasos específicos para la evaluación neuropsicológica
const NeuropsychologicalEvaluationSteps: WorkflowStep[] = [
  {
    id: 'cognitive-functions',
    label: 'Funciones Cognitivas',
    icon: <Brain className="w-5 h-5 text-blue-500" />,
    component: CognitiveFunctionsStep,
    validationFn: (formState) => true
  },
  {
    id: 'neuropsychological-results',
    label: 'Resultados',
    icon: <ListChecks className="w-5 h-5 text-blue-500" />,
    component: NeuropsychologicalResultsStep,
    validationFn: (formState) => true
  }
];

export default NeuropsychologicalEvaluationSteps;
