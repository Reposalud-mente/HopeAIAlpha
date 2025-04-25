"use client";

import React, { Suspense } from 'react';
import PatientReviewController from '@/components/clinical/patient/PatientReviewController';
import { PatientProvider } from '@/contexts/PatientContext';
import AppLayout from '@/components/layout/app-layout';
import { FileText, Loader2 } from 'lucide-react';

// Componente que utiliza useSearchParams
const ReportsContent = () => {
  // Importamos useSearchParams dinámicamente dentro del componente
  // que está envuelto en Suspense
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

  return (
    <PatientProvider>
      {/* Main workflow controller - pass patientId if available */}
      <div>
        <PatientReviewController selectedPatientId={patientId || undefined} />
      </div>
    </PatientProvider>
  );
};

// Componente de carga mientras se resuelve la suspensión
const LoadingReports = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center">
    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
    <div className="text-blue-700 text-lg font-medium">
      Cargando informes...
    </div>
  </div>
);

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header section with title and description - enhanced for better visual hierarchy */}
        <div className="border-b border-gray-200 pb-5 mb-8">
          <div className="flex items-center mb-3">
            <div className="bg-blue-50 p-2 rounded-lg mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Informes Clínicos</h1>
          </div>
          <p className="text-gray-600 ml-16">Genere informes psicológicos detallados para sus pacientes siguiendo un proceso guiado.</p>
        </div>

        {/* Main container for Reports page - optimized for desktop web experience */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Suspense fallback={<LoadingReports />}>
            <ReportsContent />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}