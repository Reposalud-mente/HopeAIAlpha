'use client';

import React, { useState, useEffect } from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import FieldTextarea from '@/components/shared/FieldTextarea'; // Reusable molecule for text fields – HopeAI: Efficiency
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Brain, Stethoscope, ClipboardList, ListChecks, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Propiedades específicas para la evaluación psicológica
interface PsychologicalEvaluationFieldsProps extends ReportFieldsProps {
  motivoConsulta: string;
  onMotivoConsultaChange: (value: string) => void;
  antecedentes: string;
  onAntecedentesChange: (value: string) => void;
  testsPsicometricos: string[];
  onTestsPsicometricosChange: (value: string[]) => void;
  resultadosPruebas: string;
  onResultadosPruebasChange: (value: string) => void;
  diagnosticoPresuntivo: string;
  onDiagnosticoPresuntivoChange: (value: string) => void;
  recomendaciones: string;
  onRecomendacionesChange: (value: string) => void;
}

// Lista de tests psicométricos comunes
const commonTests = [
  { id: 'wais', name: 'WAIS-IV (Escala de Inteligencia de Wechsler para Adultos)' },
  { id: 'wisc', name: 'WISC-V (Escala de Inteligencia de Wechsler para Niños)' },
  { id: 'mmpi', name: 'MMPI-2 (Inventario Multifásico de Personalidad de Minnesota)' },
  { id: 'beck', name: 'Inventario de Depresión de Beck' },
  { id: 'stai', name: 'STAI (Inventario de Ansiedad Estado-Rasgo)' },
  { id: 'rorschach', name: 'Test de Rorschach' },
  { id: 'bender', name: 'Test Gestáltico Visomotor de Bender' },
  { id: 'htp', name: 'HTP (Casa-Árbol-Persona)' },
  { id: 'scl90r', name: 'SCL-90-R (Inventario de Síntomas)' },
  { id: 'zung', name: 'Escala de Depresión de Zung' },
  { id: 'hamilton', name: 'Escala de Hamilton para Ansiedad/Depresión' },
  { id: 'mcmi', name: 'MCMI-III (Inventario Clínico Multiaxial de Millon)' }
];

export default function PsychologicalEvaluationFields({
  motivoConsulta = '',
  onMotivoConsultaChange,
  antecedentes = '',
  onAntecedentesChange,
  testsPsicometricos = [],
  onTestsPsicometricosChange,
  resultadosPruebas = '',
  onResultadosPruebasChange,
  diagnosticoPresuntivo = '',
  onDiagnosticoPresuntivoChange,
  recomendaciones = '',
  onRecomendacionesChange,
  onComplete
}: PsychologicalEvaluationFieldsProps) {
  // -------------------------------------------------------------------------
  // State for psychometric test selection (unchanged) – HopeAI: Simplicity
  // -------------------------------------------------------------------------
  const [selectedTests, setSelectedTests] = useState<string[]>(testsPsicometricos);

  // -------------------------------------------------------------------------
  // Validation state for required fields – HopeAI: Clinical Enhancement
  // -------------------------------------------------------------------------
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Helper: Check if a field is empty (required validation)
  const isFieldEmpty = (val: string) => !val.trim();

  // Helper: Form-level validation (all required fields filled)
  const isFormValid =
    !isFieldEmpty(motivoConsulta) &&
    !isFieldEmpty(antecedentes) &&
    !isFieldEmpty(resultadosPruebas) &&
    !isFieldEmpty(diagnosticoPresuntivo) &&
    !isFieldEmpty(recomendaciones);

  // Handle submit: set submitAttempted, call onComplete if valid
  const handleSubmit = () => {
    // Only set submitAttempted to trigger validation messages
    setSubmitAttempted(true);

    // If the form is valid, proceed to the next step
    if (isFormValid) onComplete?.();
  };

  // -----------------------------
  // Psychometric test selection UI
  // -----------------------------
  const handleTestChange = (testId: string) => {
    const updatedTests = selectedTests.includes(testId)
      ? selectedTests.filter(id => id !== testId)
      : [...selectedTests, testId];
    setSelectedTests(updatedTests);
    onTestsPsicometricosChange(updatedTests);
  };

  // -----------------------------
  // UI rendering
  // -----------------------------
  // No need for a ref since we're scrolling to an element by ID

  // Scroll to the template header when component mounts
  useEffect(() => {
    // Find the header element by ID
    const headerElement = document.getElementById('report-template-header');
    if (headerElement) {
      headerElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <Card className="border-none shadow-none bg-transparent">

      <CardContent className="px-0 space-y-6">
        {/* Motivo de consulta – FieldTextarea for consistency, validation, tooltip */}
        {/* HopeAI: Simplicity, Efficiency, Clinical Enhancement */}
        <FieldTextarea
          label={
            <span className="flex items-center"><ClipboardList className="h-4 w-4 text-blue-600 mr-2" />Motivo de consulta</span>
          }
          tooltip="Describa brevemente la razón principal por la que el paciente inicia o continúa el proceso de evaluación psicológica. Ejemplo: 'Paciente refiere sentirse ansioso y con dificultades para dormir.'"
          placeholder="Ej: 'Paciente refiere sentirse ansioso y con dificultades para dormir...'"
          required
          value={motivoConsulta}
          onChange={onMotivoConsultaChange}
          onBlur={() => {}}
          showError={submitAttempted && isFieldEmpty(motivoConsulta)}
        />

        {/* Antecedentes personales/familiares – FieldTextarea for maintainability */}
        {/* HopeAI: Efficiency, Clinical Enhancement */}
        <FieldTextarea
          label={<span className="flex items-center"><FileText className="h-4 w-4 text-blue-600 mr-2" />Antecedentes personales/familiares</span>}
          tooltip="Incluya información relevante sobre antecedentes médicos, psicológicos, familiares o sociales que puedan influir en la evaluación."
          placeholder="Ej: 'Antecedentes de depresión materna, historial de ansiedad en la familia...'"
          required
          value={antecedentes}
          onChange={onAntecedentesChange}
          onBlur={() => {}}
          showError={submitAttempted && isFieldEmpty(antecedentes)}
        />

        {/* Evaluación psicométrica (tests aplicados) – Keep as custom UI, ensure accessibility */}
        {/* HopeAI: Simplicity, Accessibility */}
        <section aria-labelledby="tests-aplicados-label">
          <label id="tests-aplicados-label" className="text-sm font-medium text-gray-700 flex items-center">
            <Brain className="h-4 w-4 text-blue-600 mr-2" />
            Evaluación psicométrica (tests aplicados)
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200 mt-1" role="group" aria-label="Tests psicométricos comunes">
            {commonTests.map(test => (
              <div
                key={test.id}
                onClick={() => handleTestChange(test.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedTests.includes(test.id)}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') handleTestChange(test.id);
                }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200",
                  "border shadow-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400",
                  selectedTests.includes(test.id)
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
                aria-label={test.name}
              >
                {test.name.split(' ')[0]}
                {selectedTests.includes(test.id) && (
                  <ChevronRight className="h-3 w-3 text-blue-500 ml-1" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Resultados de pruebas – FieldTextarea for validation, tooltip */}
        {/* HopeAI: Clinical Enhancement, Efficiency */}
        <FieldTextarea
          label={<span className="flex items-center"><ListChecks className="h-4 w-4 text-blue-600 mr-2" />Resultados de pruebas</span>}
          tooltip="Describa los resultados principales de las pruebas aplicadas y su interpretación clínica."
          placeholder="Ej: 'WAIS-IV: CI total en rango promedio. MMPI-2: Elevación en escala de ansiedad...'"
          required
          value={resultadosPruebas}
          onChange={onResultadosPruebasChange}
          onBlur={() => {}}
          showError={submitAttempted && isFieldEmpty(resultadosPruebas)}
        />

        {/* Diagnóstico presuntivo – FieldTextarea for validation, tooltip */}
        {/* HopeAI: Clinical Enhancement */}
        <FieldTextarea
          label={<span className="flex items-center"><Stethoscope className="h-4 w-4 text-blue-600 mr-2" />Diagnóstico presuntivo</span>}
          tooltip="Indique el diagnóstico presuntivo basado en la evaluación realizada, siguiendo criterios clínicos actuales."
          placeholder="Ej: 'Trastorno de ansiedad generalizada (F41.1, CIE-10)'"
          required
          value={diagnosticoPresuntivo}
          onChange={onDiagnosticoPresuntivoChange}
          onBlur={() => {}}
          showError={submitAttempted && isFieldEmpty(diagnosticoPresuntivo)}
        />

        {/* Recomendaciones – FieldTextarea for validation, tooltip */}
        {/* HopeAI: Clinical Enhancement, Efficiency */}
        <FieldTextarea
          label={<span className="flex items-center"><ClipboardList className="h-4 w-4 text-blue-600 mr-2" />Recomendaciones</span>}
          tooltip="Incluya recomendaciones terapéuticas, de seguimiento o derivación relevantes para el paciente."
          placeholder="Ej: 'Se recomienda iniciar terapia cognitivo-conductual y seguimiento psiquiátrico.'"
          required
          value={recomendaciones}
          onChange={onRecomendacionesChange}
          onBlur={() => {}}
          showError={submitAttempted && isFieldEmpty(recomendaciones)}
        />

        {/* Botón de acción – Disabled unless form valid, TFF-style */}
        {/* HopeAI: Simplicity, Efficiency, Clinical Enhancement */}
        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            disabled={!isFormValid}
            aria-disabled={!isFormValid}
          >
            Guardar y Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
