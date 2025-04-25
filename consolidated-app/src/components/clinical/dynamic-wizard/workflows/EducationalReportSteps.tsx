'use client';

import React from 'react';
import { GraduationCap, BookOpen } from 'lucide-react';
import { WorkflowStep } from '../DynamicReportWizard';

// Placeholder para los componentes reales
const LearningDifficultiesStep = () => <div>Componente de Dificultades de Aprendizaje</div>;
const EducationalRecommendationsStep = () => <div>Componente de Recomendaciones Educativas</div>;

// Definir los pasos específicos para el informe educativo
const EducationalReportSteps: WorkflowStep[] = [
  {
    id: 'learning-difficulties',
    label: 'Dificultades de Aprendizaje',
    icon: <BookOpen className="w-5 h-5 text-blue-500" />,
    component: LearningDifficultiesStep,
    validationFn: (formState) => true
  },
  {
    id: 'educational-recommendations',
    label: 'Recomendaciones',
    icon: <GraduationCap className="w-5 h-5 text-blue-500" />,
    component: EducationalRecommendationsStep,
    validationFn: (formState) => true
  }
];

export default EducationalReportSteps;
