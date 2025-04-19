'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/layout/app-layout';
import PatientReviewController from '@/components/clinical/patient/PatientReviewController';

export default function NewAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const { getPatient, isLoading, error } = usePatient();
  const [patient, setPatient] = useState<any>(null);
  
  // Load patient data
  useEffect(() => {
    const loadPatient = async () => {
      if (patientId) {
        const patientData = await getPatient(patientId);
        setPatient(patientData);
      }
    };
    
    loadPatient();
  }, [patientId, getPatient]);
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
            <p className="text-gray-600">Cargando información del paciente...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/patients/${patientId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Paciente
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  if (!patient) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Paciente no encontrado</h3>
              <p className="text-sm text-amber-700">No se pudo encontrar el paciente solicitado.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pacientes
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href={`/patients/${patientId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Paciente
            </Link>
          </Button>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Nueva Evaluación</h1>
          <p className="text-gray-600 mt-2">
            Paciente: {patient.firstName} {patient.lastName}
          </p>
        </div>
        
        {/* Assessment form */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluación Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <PatientReviewController />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
