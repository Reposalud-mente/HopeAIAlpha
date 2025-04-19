"use client";

import React from 'react';
import PatientReviewController from '@/components/clinical/patient/PatientReviewController';
import { PatientProvider } from '@/contexts/PatientContext';
import AppLayout from '@/components/layout/app-layout';

export default function ReportsPage() {
  return (
    <AppLayout>
      {/* Main container for Reports page - optimized for desktop web experience */}
      <div className="w-full px-12 py-10 bg-white rounded-xl shadow-md border border-gray-100">
        {/* Header and workflow guidance */}
        <div className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-normal tracking-tight text-gray-900">Informes Clínicos</h1>
          <p className="text-lg text-black/75 mt-4 font-light">
            Genere informes clínicos psicológicos siguiendo el proceso paso a paso.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Consejo:</strong> Complete cada paso con la información necesaria y pulse "Siguiente" para avanzar entre las diferentes etapas.
              Al finalizar, podrá revisar, guardar o descargar su informe.
            </p>
          </div>
        </div>

        <PatientProvider>
          {/* Main workflow controller - direct access without initial patient selection */}
          <div className="mt-8">
            <PatientReviewController />
          </div>
        </PatientProvider>
      </div>
    </AppLayout>
  );
}