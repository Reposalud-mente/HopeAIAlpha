'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, ListChecks, Sparkles, Loader2, Search, Info, Lightbulb } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PsychometricTestsStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

// Lista de tests psicométricos comunes
const COMMON_TESTS = [
  { id: 'wais', name: 'WAIS-IV', fullName: 'Escala de Inteligencia de Wechsler para Adultos', category: 'inteligencia' },
  { id: 'wisc', name: 'WISC-V', fullName: 'Escala de Inteligencia de Wechsler para Niños', category: 'inteligencia' },
  { id: 'mmpi', name: 'MMPI-2', fullName: 'Inventario Multifásico de Personalidad de Minnesota', category: 'personalidad' },
  { id: 'beck', name: 'BDI-II', fullName: 'Inventario de Depresión de Beck', category: 'depresion' },
  { id: 'stai', name: 'STAI', fullName: 'Inventario de Ansiedad Estado-Rasgo', category: 'ansiedad' },
  { id: 'rorschach', name: 'Rorschach', fullName: 'Test de Rorschach', category: 'proyectivo' },
  { id: 'bender', name: 'Bender', fullName: 'Test Gestáltico Visomotor de Bender', category: 'neuropsicologico' },
  { id: 'htp', name: 'HTP', fullName: 'Casa-Árbol-Persona', category: 'proyectivo' },
  { id: 'scl90r', name: 'SCL-90-R', fullName: 'Inventario de Síntomas', category: 'sintomas' },
  { id: 'zung', name: 'Zung', fullName: 'Escala de Depresión de Zung', category: 'depresion' },
  { id: 'hamilton', name: 'Hamilton', fullName: 'Escala de Hamilton para Ansiedad/Depresión', category: 'depresion' },
  { id: 'mcmi', name: 'MCMI-III', fullName: 'Inventario Clínico Multiaxial de Millon', category: 'personalidad' },
  { id: 'neo', name: 'NEO PI-R', fullName: 'Inventario de Personalidad NEO Revisado', category: 'personalidad' },
  { id: 'raven', name: 'Raven', fullName: 'Matrices Progresivas de Raven', category: 'inteligencia' },
  { id: 'stroop', name: 'Stroop', fullName: 'Test de Stroop', category: 'neuropsicologico' },
  { id: 'tmt', name: 'TMT', fullName: 'Trail Making Test', category: 'neuropsicologico' },
  { id: 'wms', name: 'WMS-IV', fullName: 'Escala de Memoria de Wechsler', category: 'memoria' },
  { id: 'rey', name: 'Rey', fullName: 'Test de la Figura Compleja de Rey', category: 'neuropsicologico' },
  { id: 'moca', name: 'MoCA', fullName: 'Evaluación Cognitiva de Montreal', category: 'neuropsicologico' },
  { id: 'mmse', name: 'MMSE', fullName: 'Mini-Mental State Examination', category: 'neuropsicologico' }
];

// Categorías de tests
const TEST_CATEGORIES = [
  { id: 'inteligencia', name: 'Inteligencia', icon: '🧠' },
  { id: 'personalidad', name: 'Personalidad', icon: '👤' },
  { id: 'depresion', name: 'Depresión', icon: '😔' },
  { id: 'ansiedad', name: 'Ansiedad', icon: '😰' },
  { id: 'proyectivo', name: 'Proyectivos', icon: '🎨' },
  { id: 'neuropsicologico', name: 'Neuropsicológicos', icon: '🔍' },
  { id: 'sintomas', name: 'Síntomas', icon: '📋' },
  { id: 'memoria', name: 'Memoria', icon: '📚' },
  { id: 'todos', name: 'Todos', icon: '✓' }
];

export default function PsychometricTestsStep({
  formState,
  updateForm,
  updateReportData,
  onComplete
}: PsychometricTestsStepProps) {
  // Simplificamos el estado: solo necesitamos saber si se aplicaron tests y los hallazgos
  const [selectedTests, setSelectedTests] = useState<string[]>(formState.reportData.testsPsicometricos?.length ? ['applied'] : []);
  const [resultadosPruebas, setResultadosPruebas] = useState(formState.reportData.resultadosPruebas || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Asistente de redacción para hallazgos clínicos
  const generateTestResults = () => {
    setIsGenerating(true);

    // Simular una llamada a la API de IA (en una implementación real, esto sería una llamada a la API)
    setTimeout(() => {
      // Plantilla estructurada para hallazgos clínicos
      const generatedText = `**Evaluación psicométrica aplicada:**
Se realizó una evaluación psicológica completa utilizando instrumentos estandarizados para valorar las áreas cognitiva, emocional y conductual.

**Hallazgos principales:**
- Funcionamiento cognitivo: Capacidades intelectuales dentro del rango promedio (CI estimado: 105), con un perfil cognitivo equilibrado. Destacan habilidades de razonamiento verbal y comprensión conceptual.

- Estado emocional: Presencia de sintomatología ansiosa de intensidad moderada (percentil 75 en escalas de ansiedad), caracterizada principalmente por preocupación excesiva, rumiación cognitiva y algunos síntomas somáticos como tensión muscular.

- Personalidad: Perfil de personalidad que muestra tendencias hacia la introspección, sensibilidad emocional elevada y patrones de afrontamiento predominantemente evitativo ante situaciones percibidas como amenazantes.

**Relevancia clínica:**
Los resultados de la evaluación son consistentes con el motivo de consulta y sugieren la presencia de un trastorno de ansiedad generalizada de intensidad moderada. Los patrones cognitivos identificados (tendencia a la catastrofización y sobrestimación de amenazas) constituyen factores de mantenimiento que deberían abordarse en la intervención terapéutica.`;

      setResultadosPruebas(generatedText);
      setIsGenerating(false);
    }, 1500);
  };

  // Guardar los datos y continuar
  const handleSave = () => {
    updateReportData({
      // Si hay tests seleccionados, guardamos 'applied', de lo contrario un array vacío
      testsPsicometricos: selectedTests.length > 0 ? ['applied'] : [],
      // Guardamos los hallazgos clínicos
      resultadosPruebas
    });
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          Evaluación Psicométrica
        </h3>
        <p className="text-sm text-gray-600">
          Registre los hallazgos principales de las evaluaciones psicométricas aplicadas.
        </p>
      </div>

      {/* Pregunta sobre evaluación psicométrica */}
      <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-600" />
          ¿Ha aplicado alguna evaluación psicométrica relevante para este caso?
        </h4>

        <div className="flex gap-3 mb-4">
          <Button
            variant={selectedTests.length > 0 ? "default" : "outline"}
            className={selectedTests.length > 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            onClick={() => setSelectedTests(['applied'])}
          >
            Sí
          </Button>
          <Button
            variant={selectedTests.length === 0 ? "default" : "outline"}
            className={selectedTests.length === 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            onClick={() => {
              setSelectedTests([]);
              setResultadosPruebas('');
            }}
          >
            No
          </Button>
        </div>

        {selectedTests.length > 0 && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Registre los hallazgos principales de la evaluación en el campo de abajo. No es necesario detallar cada test, solo incluya la información clínicamente relevante.
            </p>
          </div>
        )}
      </Card>

      {selectedTests.length > 0 && (
        <Card className="p-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-blue-600" />
              Hallazgos principales de la evaluación psicométrica
            </h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={generateTestResults}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Generando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span className="text-xs">Asistente de redacción</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Ayuda a estructurar y formalizar los hallazgos clínicos</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Textarea
            value={resultadosPruebas}
            onChange={(e) => setResultadosPruebas(e.target.value)}
            placeholder="Describa los hallazgos principales de la evaluación psicométrica y su relevancia clínica para este caso..."
            className="min-h-[200px] bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />

          <div className="flex items-center gap-2 mt-3 p-3 bg-gray-50 text-gray-700 rounded-md border border-gray-200">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <p className="text-xs">Enfoque en los aspectos clínicamente relevantes: resultados significativos, interpretación y cómo estos hallazgos informan el diagnóstico o plan de tratamiento.</p>
          </div>
        </Card>
      )}

      {/* Botón para guardar y continuar */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium"
        >
          Guardar y Continuar
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Nota: La evaluación psicométrica es opcional. Puede continuar sin registrar hallazgos si no se han aplicado tests relevantes.
        </p>
      </div>
    </div>
  );
}
