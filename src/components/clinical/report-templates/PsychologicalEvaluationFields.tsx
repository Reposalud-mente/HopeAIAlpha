'use client';

import React, { useState } from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const [selectedTests, setSelectedTests] = useState<string[]>(testsPsicometricos);

  // Manejar cambios en los tests seleccionados
  const handleTestChange = (testId: string) => {
    const updatedTests = selectedTests.includes(testId)
      ? selectedTests.filter(id => id !== testId)
      : [...selectedTests, testId];

    setSelectedTests(updatedTests);
    onTestsPsicometricosChange(updatedTests);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="px-0 space-y-5">
        {/* Motivo de consulta */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 flex items-center">
              <ClipboardList className="h-4 w-4 text-blue-600 mr-2" />
              Motivo de consulta
            </Label>
          </div>
          <Textarea
            value={motivoConsulta}
            onChange={(e) => onMotivoConsultaChange(e.target.value)}
            placeholder="Describa el motivo principal por el que el paciente busca atención psicológica"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Antecedentes personales/familiares */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="h-4 w-4 text-blue-600 mr-2" />
            Antecedentes personales/familiares
          </Label>
          <Textarea
            value={antecedentes}
            onChange={(e) => onAntecedentesChange(e.target.value)}
            placeholder="Incluya información relevante sobre antecedentes médicos, psicológicos, familiares o sociales"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Evaluación psicométrica (tests aplicados) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Brain className="h-4 w-4 text-blue-600 mr-2" />
            Evaluación psicométrica (tests aplicados)
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
            {commonTests.map(test => (
              <div
                key={test.id}
                onClick={() => handleTestChange(test.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200",
                  "border shadow-sm flex items-center gap-1",
                  selectedTests.includes(test.id)
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                {test.name.split(' ')[0]}
                {selectedTests.includes(test.id) && (
                  <ChevronRight className="h-3 w-3 text-blue-500 ml-1" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resultados de pruebas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <ListChecks className="h-4 w-4 text-blue-600 mr-2" />
            Resultados de pruebas
          </Label>
          <Textarea
            value={resultadosPruebas}
            onChange={(e) => onResultadosPruebasChange(e.target.value)}
            placeholder="Describa los resultados principales de las pruebas aplicadas y su interpretación"
            className="min-h-[120px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Diagnóstico presuntivo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Stethoscope className="h-4 w-4 text-blue-600 mr-2" />
            Diagnóstico presuntivo
          </Label>
          <Textarea
            value={diagnosticoPresuntivo}
            onChange={(e) => onDiagnosticoPresuntivoChange(e.target.value)}
            placeholder="Indique el diagnóstico presuntivo basado en la evaluación realizada"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Recomendaciones */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <ClipboardList className="h-4 w-4 text-blue-600 mr-2" />
            Recomendaciones
          </Label>
          <Textarea
            value={recomendaciones}
            onChange={(e) => onRecomendacionesChange(e.target.value)}
            placeholder="Incluya recomendaciones terapéuticas, de seguimiento o derivación"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={onComplete}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Guardar y Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
