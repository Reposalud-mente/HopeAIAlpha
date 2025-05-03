'use client';

import { useState } from 'react';
import { useRagReportGeneration } from '@/hooks/useRagReportGeneration';
import { WizardReportData } from '@/lib/RagAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

export default function RagReportDemo() {
  // State for form inputs
  const [patientName, setPatientName] = useState('Juan Pérez');
  const [patientAge, setPatientAge] = useState('35');
  const [patientGender, setPatientGender] = useState('Masculino');
  const [clinicianName, setClinicianName] = useState('Dra. María González');
  const [clinicName, setClinicName] = useState('Centro de Psicología Clínica');
  const [reportType, setReportType] = useState<WizardReportData['reportType']>('evaluacion-psicologica');
  const [consultationReasons, setConsultationReasons] = useState('Ansiedad, Problemas de sueño, Estrés laboral');
  const [evaluationAreas, setEvaluationAreas] = useState('Estado de ánimo, Ansiedad, Funcionamiento cognitivo');
  const [icdCriteria, setIcdCriteria] = useState('Trastorno de ansiedad generalizada (F41.1), Insomnio (F51.0)');
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [includeTreatmentPlan, setIncludeTreatmentPlan] = useState(true);

  // State for report output
  const [reportText, setReportText] = useState('');
  const [activeTab, setActiveTab] = useState('input');

  // Use the RAG report generation hook
  const { generateReport, isGenerating, progress, currentPhase, result } = useRagReportGeneration();

  // Handle form submission
  const handleGenerateReport = async () => {
    // Create wizard data from form inputs
    const wizardData: WizardReportData = {
      patientId: 'demo-patient-id',
      patientName,
      patientAge: parseInt(patientAge),
      patientGender,
      patientDateOfBirth: '', // Not used in demo
      clinicianName,
      clinicName,
      assessmentDate: new Date().toISOString().split('T')[0],
      reportType,
      consultationReasons: consultationReasons.split(',').map(reason => reason.trim()),
      evaluationAreas: evaluationAreas.split(',').map(area => area.trim()),
      icdCriteria: icdCriteria.split(',').map(criteria => criteria.trim()),
      isPrimaryDiagnosis: true,
      includeRecommendations,
      includeTreatmentPlan,
      language: 'es',
    };

    // Generate the report
    const result = await generateReport({
      wizardData,
      includeRecommendations,
      includeTreatmentPlan,
      language: 'es',
    });

    // Update the report text
    if (result.reportText) {
      setReportText(result.reportText);
      setActiveTab('output');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generador de Informes Clínicos con RAG</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Retrieval</CardTitle>
          </CardHeader>
          <CardContent>
            <p>El sistema recupera información relevante del DSM-5 para fundamentar el informe en conocimiento clínico autorizado.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Augmentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>La información recuperada se incorpora al prompt del modelo de lenguaje, enriqueciendo el contexto para la generación.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>El modelo Gemini-2.5-flash-preview-04-17 genera el informe final basado en los datos del paciente y el contexto clínico.</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-gray-600 mb-8">
        Esta demo utiliza Retrieval-Augmented Generation (RAG) para generar informes clínicos
        basados en datos estructurados y conocimiento del DSM-5. Complete el formulario a continuación
        para generar un informe clínico personalizado.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="input">Datos de Entrada</TabsTrigger>
          <TabsTrigger value="output">Informe Generado</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle>Datos para el Informe</CardTitle>
              <CardDescription>
                Ingrese los datos del paciente y la evaluación para generar un informe clínico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nombre del Paciente</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientAge">Edad</Label>
                  <Input
                    id="patientAge"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientGender">Género</Label>
                  <Select value={patientGender} onValueChange={setPatientGender}>
                    <SelectTrigger id="patientGender">
                      <SelectValue placeholder="Seleccione género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="No binario">No binario</SelectItem>
                      <SelectItem value="Prefiere no decir">Prefiere no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicianName">Nombre del Profesional</Label>
                  <Input
                    id="clinicianName"
                    value={clinicianName}
                    onChange={(e) => setClinicianName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicName">Centro o Clínica</Label>
                  <Input
                    id="clinicName"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportType">Tipo de Informe</Label>
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger id="reportType">
                      <SelectValue placeholder="Seleccione tipo de informe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evaluacion-psicologica">Evaluación Psicológica</SelectItem>
                      <SelectItem value="seguimiento-terapeutico">Seguimiento Terapéutico</SelectItem>
                      <SelectItem value="evaluacion-neuropsicologica">Evaluación Neuropsicológica</SelectItem>
                      <SelectItem value="informe-familiar">Informe Familiar</SelectItem>
                      <SelectItem value="informe-educativo">Informe Educativo</SelectItem>
                      <SelectItem value="alta-terapeutica">Alta Terapéutica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultationReasons">Motivos de Consulta (separados por comas)</Label>
                <Textarea
                  id="consultationReasons"
                  value={consultationReasons}
                  onChange={(e) => setConsultationReasons(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evaluationAreas">Áreas Evaluadas (separadas por comas)</Label>
                <Textarea
                  id="evaluationAreas"
                  value={evaluationAreas}
                  onChange={(e) => setEvaluationAreas(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icdCriteria">Criterios Diagnósticos (separados por comas)</Label>
                <Textarea
                  id="icdCriteria"
                  value={icdCriteria}
                  onChange={(e) => setIcdCriteria(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeRecommendations"
                  checked={includeRecommendations}
                  onCheckedChange={(checked) => setIncludeRecommendations(checked as boolean)}
                />
                <Label htmlFor="includeRecommendations">Incluir Recomendaciones</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTreatmentPlan"
                  checked={includeTreatmentPlan}
                  onCheckedChange={(checked) => setIncludeTreatmentPlan(checked as boolean)}
                />
                <Label htmlFor="includeTreatmentPlan">Incluir Plan de Tratamiento</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleGenerateReport} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Informe...
                  </>
                ) : (
                  'Generar Informe'
                )}
              </Button>
            </CardFooter>
          </Card>

          {isGenerating && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Generando Informe</CardTitle>
                <CardDescription>{currentPhase}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="output">
          <Card>
            <CardHeader>
              <CardTitle>Informe Generado</CardTitle>
              <CardDescription>
                Resultado del proceso de generación con RAG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reportText ? (
                <>
                  {result?.metadata?.usingDSM5 && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                      <strong>Nota:</strong> Este informe ha sido generado utilizando información del Manual Diagnóstico y Estadístico de los Trastornos Mentales (DSM-5) como fuente de referencia.
                      {result?.metadata?.dsm5FileDetails && (
                        <div className="mt-2 text-sm">
                          <strong>Archivo utilizado:</strong> {result.metadata.dsm5FileDetails.fileName} (ID: {result.metadata.dsm5FileDetails.fileId})
                        </div>
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                    {reportText}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic">
                  No hay informe generado. Complete los datos y haga clic en "Generar Informe".
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('input')}>
                Volver a Datos
              </Button>
              {reportText && (
                <Button onClick={() => {
                  navigator.clipboard.writeText(reportText);
                  alert('Informe copiado al portapapeles');
                }}>
                  Copiar Informe
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
