'use client';

import React from 'react';
import { Users, Network } from 'lucide-react';
import { WorkflowStep } from '../DynamicReportWizard';

// Placeholder para los componentes reales
const FamilyDynamicsStep = () => <div>Componente de Dinámica Familiar</div>;
const FamilyInterventionStep = () => <div>Componente de Intervención Familiar</div>;

// Definir los pasos específicos para el informe familiar
const FamilyReportSteps: WorkflowStep[] = [
  {
    id: 'family-dynamics',
    label: 'Dinámica Familiar',
    icon: <Users className="w-5 h-5 text-blue-500" />,
    component: FamilyDynamicsStep,
    validationFn: (formState) => true
  },
  {
    id: 'family-intervention',
    label: 'Intervención',
    icon: <Network className="w-5 h-5 text-blue-500" />,
    component: FamilyInterventionStep,
    validationFn: (formState) => true
  }
];

export default FamilyReportSteps;
