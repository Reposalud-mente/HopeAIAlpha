'use client';

import React, { useState, useEffect } from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, FileText, BookOpen, Lightbulb, ListChecks, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// Propiedades específicas para el informe psicoeducativo
interface EducationalReportFieldsProps extends ReportFieldsProps {
  motivoEvaluacionEscolar: string;
  onMotivoEvaluacionEscolarChange: (value: string) => void;
  areasDificultad: string[];
  onAreasDificultadChange: (value: string[]) => void;
  evaluacionesAplicadas: string;
  onEvaluacionesAplicadasChange: (value: string) => void;
  diagnosticoEducativo: string;
  onDiagnosticoEducativoChange: (value: string) => void;
  recomendacionesEscolares: string;
  onRecomendacionesEscolaresChange: (value: string) => void;
}

// Áreas de dificultad comunes en el ámbito educativo
const areasDificultad = [
  { id: 'lectura', name: 'Lectura', description: 'Dificultades en decodificación, fluidez o comprensión lectora' },
  { id: 'escritura', name: 'Escritura', description: 'Problemas en grafía, ortografía o expresión escrita' },
  { id: 'matematicas', name: 'Matemáticas', description: 'Dificultades en cálculo, resolución de problemas o razonamiento matemático' },
  { id: 'atencion', name: 'Atención', description: 'Problemas para mantener la atención o concentración' },
  { id: 'conducta', name: 'Conducta', description: 'Dificultades de comportamiento en el aula' },
  { id: 'habilidadesSociales', name: 'Habilidades Sociales', description: 'Problemas en la interacción con pares o adultos' },
  { id: 'motivacion', name: 'Motivación', description: 'Falta de interés o motivación hacia el aprendizaje' },
  { id: 'organizacion', name: 'Organización', description: 'Dificultades para organizar tareas y materiales' },
  { id: 'lenguaje', name: 'Lenguaje', description: 'Problemas de expresión o comprensión del lenguaje' }
];

// Evaluaciones educativas comunes
const evaluacionesEducativas = [
  { id: 'wisc', name: 'WISC-V (Escala de Inteligencia de Wechsler para Niños)' },
  { id: 'prolec', name: 'PROLEC-R (Evaluación de procesos lectores)' },
  { id: 'proesc', name: 'PROESC (Evaluación de procesos de escritura)' },
  { id: 'tale', name: 'TALE (Test de Análisis de Lectoescritura)' },
  { id: 'enfen', name: 'ENFEN (Evaluación Neuropsicológica de las Funciones Ejecutivas en Niños)' },
  { id: 'caras', name: 'Test de Percepción de Diferencias - Caras' },
  { id: 'd2', name: 'Test de Atención d2' },
  { id: 'itpa', name: 'ITPA (Test Illinois de Aptitudes Psicolingüísticas)' },
  { id: 'badyg', name: 'BADYG (Batería de Aptitudes Diferenciales y Generales)' },
  { id: 'tamai', name: 'TAMAI (Test Autoevaluativo Multifactorial de Adaptación Infantil)' }
];

// Niveles de severidad para el diagnóstico educativo
const nivelesSeveridad = [
  { value: 'leve', label: 'Leve - Requiere adaptaciones mínimas' },
  { value: 'moderado', label: 'Moderado - Requiere adaptaciones significativas' },
  { value: 'severo', label: 'Severo - Requiere adaptaciones muy significativas' }
];

export default function EducationalReportFields({
  motivoEvaluacionEscolar = '',
  onMotivoEvaluacionEscolarChange,
  areasDificultad: selectedAreas = [],
  onAreasDificultadChange,
  evaluacionesAplicadas = '',
  onEvaluacionesAplicadasChange,
  diagnosticoEducativo = '',
  onDiagnosticoEducativoChange,
  recomendacionesEscolares = '',
  onRecomendacionesEscolaresChange,
  onComplete
}: EducationalReportFieldsProps) {
  const [selectedEvaluaciones, setSelectedEvaluaciones] = useState<string[]>([]);
  const [nivelSeveridad, setNivelSeveridad] = useState<string>('');

  // Manejar cambios en las áreas de dificultad seleccionadas
  const handleAreaChange = (areaId: string) => {
    const updatedAreas = selectedAreas.includes(areaId)
      ? selectedAreas.filter(id => id !== areaId)
      : [...selectedAreas, areaId];

    onAreasDificultadChange(updatedAreas);
  };

  // Manejar cambios en las evaluaciones seleccionadas
  const handleEvaluacionChange = (evaluacionId: string) => {
    const updatedEvaluaciones = selectedEvaluaciones.includes(evaluacionId)
      ? selectedEvaluaciones.filter(id => id !== evaluacionId)
      : [...selectedEvaluaciones, evaluacionId];

    setSelectedEvaluaciones(updatedEvaluaciones);

    // Actualizar el texto del área de evaluaciones aplicadas
    const evaluacionesText = updatedEvaluaciones.map(id => {
      const evaluacion = evaluacionesEducativas.find(e => e.id === id);
      return evaluacion ? evaluacion.name : '';
    }).join(', ');

    onEvaluacionesAplicadasChange(evaluacionesText);
  };

  // Manejar cambios en el nivel de severidad
  const handleSeveridadChange = (value: string) => {
    setNivelSeveridad(value);
    onDiagnosticoEducativoChange(`${diagnosticoEducativo}\nNivel de severidad: ${value}`);
  };

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
      <CardContent className="px-0 space-y-5">
        {/* Motivo de evaluación escolar */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="h-4 w-4 text-blue-600 mr-2" />
            Motivo de evaluación escolar
          </Label>
          <Textarea
            value={motivoEvaluacionEscolar}
            onChange={(e) => onMotivoEvaluacionEscolarChange(e.target.value)}
            placeholder="Describa el motivo por el que se solicita la evaluación psicoeducativa"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Áreas de dificultad */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
            Áreas de dificultad
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
            {areasDificultad.map(area => (
              <div key={area.id} className="flex items-start space-x-2 group">
                <Checkbox
                  id={area.id}
                  checked={selectedAreas.includes(area.id)}
                  onCheckedChange={() => handleAreaChange(area.id)}
                  className={cn(
                    "mt-1",
                    selectedAreas.includes(area.id) ? "text-blue-600" : "text-gray-400"
                  )}
                />
                <div>
                  <label
                    htmlFor={area.id}
                    className={cn(
                      "text-sm font-medium cursor-pointer transition-colors",
                      selectedAreas.includes(area.id) ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                    )}
                  >
                    {area.name}
                  </label>
                  <p className="text-xs text-gray-500">{area.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluaciones aplicadas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <ListChecks className="h-4 w-4 text-blue-600 mr-2" />
            Evaluaciones aplicadas
          </Label>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200 mb-2">
            {evaluacionesEducativas.map(evaluacion => (
              <div
                key={evaluacion.id}
                onClick={() => handleEvaluacionChange(evaluacion.id)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200",
                  "border shadow-sm flex items-center gap-1",
                  selectedEvaluaciones.includes(evaluacion.id)
                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                {evaluacion.name.split(' ')[0]}
                {selectedEvaluaciones.includes(evaluacion.id) && (
                  <ChevronRight className="h-3 w-3 text-blue-500 ml-1" />
                )}
              </div>
            ))}
          </div>
          <Textarea
            value={evaluacionesAplicadas}
            onChange={(e) => onEvaluacionesAplicadasChange(e.target.value)}
            placeholder="Detalle las evaluaciones psicoeducativas aplicadas"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Diagnóstico educativo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <GraduationCap className="h-4 w-4 text-blue-600 mr-2" />
            Diagnóstico educativo
          </Label>

          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200 mb-2">
            <p className="text-sm font-medium mb-2">Nivel de severidad:</p>
            <RadioGroup value={nivelSeveridad} onValueChange={handleSeveridadChange} className="space-y-2">
              {nivelesSeveridad.map(nivel => (
                <div key={nivel.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={nivel.value} id={nivel.value} className={nivelSeveridad === nivel.value ? "text-blue-600" : ""} />
                  <Label htmlFor={nivel.value} className={cn(
                    "text-sm transition-colors",
                    nivelSeveridad === nivel.value ? "text-blue-700 font-medium" : "text-gray-700"
                  )}>
                    {nivel.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Textarea
            value={diagnosticoEducativo}
            onChange={(e) => onDiagnosticoEducativoChange(e.target.value)}
            placeholder="Indique el diagnóstico educativo basado en la evaluación realizada"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Recomendaciones para la escuela/familia */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
            Recomendaciones para la escuela/familia
          </Label>
          <Textarea
            value={recomendacionesEscolares}
            onChange={(e) => onRecomendacionesEscolaresChange(e.target.value)}
            placeholder="Incluya recomendaciones específicas para el contexto escolar y familiar"
            className="min-h-[120px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
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
