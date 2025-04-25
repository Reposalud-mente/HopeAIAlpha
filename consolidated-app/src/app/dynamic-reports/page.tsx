'use client';

import React from 'react';
import { PatientProvider } from '@/contexts/PatientContext';
import DynamicReportWizard from '@/components/clinical/dynamic-wizard/DynamicReportWizard';

export default function DynamicReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Generación de Informes (Versión Dinámica)</h1>
        <p className="text-gray-600">
          Esta versión del generador de informes adapta los pasos según el tipo de informe seleccionado.
        </p>
      </div>
      
      <PatientProvider>
        <DynamicReportWizard />
      </PatientProvider>
    </div>
  );
}
