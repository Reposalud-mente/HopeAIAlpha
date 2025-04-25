'use client';

import React from 'react';
import { MessageCircle, ListChecks, Brain } from 'lucide-react';
import { WorkflowStep } from '../DynamicReportWizard';

// Importar los componentes de pasos específicos
import ConsultationReasonsStep from './steps/psychological/ConsultationReasonsStep';
import PsychometricTestsStep from './steps/psychological/PsychometricTestsStep';
import DiagnosticCriteriaStep from './steps/psychological/DiagnosticCriteriaStep';

// Definir los pasos específicos para la evaluación psicológica
const PsychologicalEvaluationSteps: WorkflowStep[] = [
  {
    id: 'consultation-reasons',
    label: 'Motivos de Consulta',
    icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
    component: ConsultationReasonsStep,
    validationFn: (formState) => !!formState.reportData.motivoConsulta
  },
  {
    id: 'psychometric-tests',
    label: 'Evaluación Psicométrica',
    icon: <Brain className="w-5 h-5 text-blue-500" />,
    component: PsychometricTestsStep,
    validationFn: (formState) => true // Opcional aplicar tests
  },
  {
    id: 'diagnostic-criteria',
    label: 'Criterios Diagnósticos',
    icon: <ListChecks className="w-5 h-5 text-blue-500" />,
    component: DiagnosticCriteriaStep,
    validationFn: (formState) => !!formState.reportData.diagnosticoPresuntivo
  }
];

export default PsychologicalEvaluationSteps;
