"use client";

import React, { Suspense } from 'react';
import PatientReviewController from '@/components/clinical/patient/PatientReviewController';
import { PatientProvider } from '@/contexts/PatientContext';
import AppLayout from '@/components/layout/app-layout';

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
  <div className="w-full h-64 flex items-center justify-center">
    <div className="animate-pulse text-blue-600 text-lg font-medium">
      Cargando informes...
    </div>
  </div>
);

export default function ReportsPage() {
  return (
    <AppLayout>
      {/* Main container for Reports page - optimized for desktop web experience */}
      <div className="w-full px-12 py-10 bg-white rounded-xl shadow-md border border-gray-100">
        <Suspense fallback={<LoadingReports />}>
          <ReportsContent />
        </Suspense>
      </div>
    </AppLayout>
  );
}