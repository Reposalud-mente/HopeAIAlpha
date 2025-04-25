'use client';

import React, { useState } from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, FileText, ListChecks, Stethoscope, Lightbulb, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Propiedades específicas para la evaluación neuropsicológica
interface NeuropsychologicalEvaluationFieldsProps extends ReportFieldsProps {
  motivoDerivacion: string;
  onMotivoDerivacionChange: (value: string) => void;
  funcionesCognitivas: string[];
  onFuncionesCognitivasChange: (value: string[]) => void;
  resultadosPruebas: string;
  onResultadosPruebasChange: (value: string) => void;
  diagnosticoDiferencial: string;
  onDiagnosticoDiferencialChange: (value: string) => void;
  sugerenciasIntervencion: string;
  onSugerenciasIntervencionChange: (value: string) => void;
}

// Funciones cognitivas que pueden ser evaluadas
const funcionesCognitivas = [
  { id: 'atencion', name: 'Atención', description: 'Capacidad para concentrarse en estímulos específicos' },
  { id: 'memoria', name: 'Memoria', description: 'Capacidad para codificar, almacenar y recuperar información' },
  { id: 'funcionesEjecutivas', name: 'Funciones Ejecutivas', description: 'Planificación, organización, inhibición, flexibilidad' },
  { id: 'lenguaje', name: 'Lenguaje', description: 'Comprensión, expresión, denominación, fluidez verbal' },
  { id: 'visuoespacial', name: 'Habilidades Visuoespaciales', description: 'Percepción visual, organización espacial' },
  { id: 'praxias', name: 'Praxias', description: 'Capacidad para realizar movimientos voluntarios' },
  { id: 'gnosias', name: 'Gnosias', description: 'Reconocimiento de estímulos sensoriales' },
  { id: 'velocidadProcesamiento', name: 'Velocidad de Procesamiento', description: 'Rapidez con la que se procesa la información' },
  { id: 'razonamiento', name: 'Razonamiento', description: 'Capacidad para resolver problemas y razonar' }
];

// Tests neuropsicológicos comunes
const testsNeuropsicologicos = [
  { id: 'wais', name: 'WAIS-IV (Escala de Inteligencia de Wechsler para Adultos)' },
  { id: 'wisc', name: 'WISC-V (Escala de Inteligencia de Wechsler para Niños)' },
  { id: 'trailmaking', name: 'Trail Making Test (TMT)' },
  { id: 'stroop', name: 'Test de Stroop' },
  { id: 'rey', name: 'Test de la Figura Compleja de Rey' },
  { id: 'wisconsin', name: 'Test de Clasificación de Tarjetas de Wisconsin' },
  { id: 'benton', name: 'Test de Retención Visual de Benton' },
  { id: 'ravlt', name: 'Test de Aprendizaje Verbal de Rey (RAVLT)' },
  { id: 'torre', name: 'Torre de Londres/Hanoi' },
  { id: 'fluidezVerbal', name: 'Test de Fluidez Verbal' },
  { id: 'wms', name: 'Escala de Memoria de Wechsler (WMS)' },
  { id: 'nepsy', name: 'NEPSY-II (Evaluación Neuropsicológica Infantil)' }
];

export default function NeuropsychologicalEvaluationFields({
  motivoDerivacion = '',
  onMotivoDerivacionChange,
  funcionesCognitivas: selectedFunctions = [],
  onFuncionesCognitivasChange,
  resultadosPruebas = '',
  onResultadosPruebasChange,
  diagnosticoDiferencial = '',
  onDiagnosticoDiferencialChange,
  sugerenciasIntervencion = '',
  onSugerenciasIntervencionChange,
  onComplete
}: NeuropsychologicalEvaluationFieldsProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  // Manejar cambios en las funciones cognitivas seleccionadas
  const handleFunctionChange = (functionId: string) => {
    const updatedFunctions = selectedFunctions.includes(functionId)
      ? selectedFunctions.filter(id => id !== functionId)
      : [...selectedFunctions, functionId];

    onFuncionesCognitivasChange(updatedFunctions);
  };

  // Manejar cambios en los tests seleccionados
  const handleTestChange = (testId: string) => {
    const updatedTests = selectedTests.includes(testId)
      ? selectedTests.filter(id => id !== testId)
      : [...selectedTests, testId];

    setSelectedTests(updatedTests);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="px-0 space-y-5">
        {/* Motivo de derivación */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="h-4 w-4 text-blue-600 mr-2" />
            Motivo de derivación
          </Label>
          <Textarea
            value={motivoDerivacion}
            onChange={(e) => onMotivoDerivacionChange(e.target.value)}
            placeholder="Describa el motivo por el que se solicita la evaluación neuropsicológica"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Funciones cognitivas a evaluar */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Brain className="h-4 w-4 text-blue-600 mr-2" />
            Funciones cognitivas evaluadas
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
            {funcionesCognitivas.map(funcion => (
              <div key={funcion.id} className="flex items-start space-x-2 group">
                <Checkbox
                  id={funcion.id}
                  checked={selectedFunctions.includes(funcion.id)}
                  onCheckedChange={() => handleFunctionChange(funcion.id)}
                  className={cn(
                    "mt-1",
                    selectedFunctions.includes(funcion.id) ? "text-blue-600" : "text-gray-400"
                  )}
                />
                <div>
                  <label
                    htmlFor={funcion.id}
                    className={cn(
                      "text-sm font-medium cursor-pointer transition-colors",
                      selectedFunctions.includes(funcion.id) ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                    )}
                  >
                    {funcion.name}
                  </label>
                  <p className="text-xs text-gray-500">{funcion.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tests neuropsicológicos aplicados */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <ListChecks className="h-4 w-4 text-blue-600 mr-2" />
            Tests neuropsicológicos aplicados
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
            {testsNeuropsicologicos.map(test => (
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

        {/* Resultados de pruebas neuropsicológicas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <ListChecks className="h-4 w-4 text-blue-600 mr-2" />
            Resultados de pruebas neuropsicológicas
          </Label>
          <Textarea
            value={resultadosPruebas}
            onChange={(e) => onResultadosPruebasChange(e.target.value)}
            placeholder="Describa los resultados de las pruebas neuropsicológicas aplicadas y su interpretación"
            className="min-h-[120px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Diagnóstico diferencial */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Stethoscope className="h-4 w-4 text-blue-600 mr-2" />
            Diagnóstico diferencial
          </Label>
          <Textarea
            value={diagnosticoDiferencial}
            onChange={(e) => onDiagnosticoDiferencialChange(e.target.value)}
            placeholder="Indique el diagnóstico diferencial basado en la evaluación neuropsicológica"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Sugerencias de intervención */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
            Sugerencias de intervención
          </Label>
          <Textarea
            value={sugerenciasIntervencion}
            onChange={(e) => onSugerenciasIntervencionChange(e.target.value)}
            placeholder="Incluya sugerencias de intervención neuropsicológica o rehabilitación cognitiva"
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
