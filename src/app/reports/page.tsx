"use client";

import React from 'react';
import PatientReviewController from '@/components/clinical/patient/PatientReviewController';
import { PatientProvider } from '@/contexts/PatientContext';
import AppLayout from '@/components/layout/app-layout';

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Informes Clínicos</h1>
          <p className="text-gray-600 mt-2">
            Genere informes clínicos psicológicos siguiendo el proceso paso a paso. 
            Utilice el botón <span className="text-blue-600 font-medium">Siguiente</span> para avanzar entre las diferentes etapas.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Consejo:</strong> Complete cada paso con la información necesaria y pulse "Siguiente" para continuar.
              Al finalizar, podrá revisar, guardar o descargar su informe.
            </p>
          </div>
        </div>
        
        <PatientProvider>
          <PatientReviewController />
        </PatientProvider>
      </div>
    </AppLayout>
  );
} 