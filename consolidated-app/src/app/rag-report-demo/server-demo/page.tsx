'use server';

import { ClinicalReportAgent, WizardReportData } from '@/lib/RagAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// This is a server component that demonstrates how to use the RAG report generator
// Note: This is just for demonstration purposes and won't actually work in the browser
// since it's a server component that can't have interactive elements

export default async function ServerDemo() {
  // Sample wizard data
  const sampleWizardData: WizardReportData = {
    patientId: 'server-demo-patient',
    patientName: 'Ana Martínez',
    patientAge: 42,
    patientGender: 'Femenino',
    clinicianName: 'Dr. Carlos Rodríguez',
    clinicName: 'Instituto de Psicología Clínica',
    assessmentDate: new Date().toISOString().split('T')[0],
    reportType: 'evaluacion-psicologica',
    consultationReasons: [
      'Dificultad para concentrarse',
      'Cambios de humor frecuentes',
      'Problemas de sueño'
    ],
    evaluationAreas: [
      'Atención y concentración',
      'Estado de ánimo',
      'Ansiedad'
    ],
    icdCriteria: [
      'Trastorno depresivo (F32.1)',
      'Trastorno de ansiedad (F41.9)'
    ],
    isPrimaryDiagnosis: true,
    includeRecommendations: true,
    includeTreatmentPlan: true,
    language: 'es',
  };

  // This function would generate a report on the server
  // Note: This is just for demonstration and won't be called
  async function generateServerReport() {
    'use server';
    
    try {
      // Create the clinical report agent
      const reportAgent = new ClinicalReportAgent({
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
        driveFolderId: process.env.NEXT_PUBLIC_DSM5_DRIVE_FOLDER_ID || '',
        driveApiKey: process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY || '',
      });
      
      // Generate the report
      const result = await reportAgent.generateReport(sampleWizardData);
      
      return result.reportText;
    } catch (error) {
      console.error('Error generating report:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Generación de Informes en el Servidor</h1>
      <p className="text-gray-600 mb-8">
        Esta página demuestra cómo se podría utilizar el generador de informes RAG en un componente de servidor.
        Tenga en cuenta que este es solo un ejemplo y no funcionará interactivamente ya que es un componente de servidor.
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Datos de Muestra</CardTitle>
          <CardDescription>
            Estos son los datos que se utilizarían para generar un informe en el servidor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-md border overflow-auto text-sm">
            {JSON.stringify(sampleWizardData, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generación en el Servidor</CardTitle>
          <CardDescription>
            En un escenario real, podría generar informes directamente en el servidor utilizando Server Actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Para generar un informe en el servidor, utilizaría código similar a este:
          </p>
          <pre className="bg-gray-50 p-4 rounded-md border overflow-auto text-sm">
{`// Server Action
async function generateReport(formData: FormData) {
  'use server';
  
  // Extract data from formData
  const wizardData = {
    patientName: formData.get('patientName'),
    // ... other fields
  };
  
  // Create the clinical report agent
  const reportAgent = new ClinicalReportAgent({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    // ... other config
  });
  
  // Generate the report
  const result = await reportAgent.generateReport(wizardData);
  
  // Save to database or return
  return result.reportText;
}`}
          </pre>
          
          <div className="flex justify-center mt-6">
            <Link href="/rag-report-demo">
              <Button>Volver a la Demo Interactiva</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
