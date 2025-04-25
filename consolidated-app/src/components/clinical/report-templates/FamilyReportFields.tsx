'use client';

import React, { useState } from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Network, Shield, Lightbulb, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Propiedades específicas para el informe familiar/sistémico
interface FamilyReportFieldsProps extends ReportFieldsProps {
  motivoConsultaFamiliar: string;
  onMotivoConsultaFamiliarChange: (value: string) => void;
  miembrosEvaluados: string;
  onMiembrosEvaluadosChange: (value: string) => void;
  dinamicaFamiliar: string;
  onDinamicaFamiliarChange: (value: string) => void;
  factoresRiesgoProteccion: string;
  onFactoresRiesgoProteccionChange: (value: string) => void;
  intervencionSugerida: string;
  onIntervencionSugeridaChange: (value: string) => void;
}

// Factores de riesgo y protección comunes
const factores = [
  { id: 'comunicacion', name: 'Comunicación', tipo: 'ambos', description: 'Patrones de comunicación familiar' },
  { id: 'limites', name: 'Límites y roles', tipo: 'ambos', description: 'Claridad en límites y roles familiares' },
  { id: 'conflictos', name: 'Conflictos no resueltos', tipo: 'riesgo', description: 'Conflictos crónicos sin resolución' },
  { id: 'apoyo', name: 'Apoyo emocional', tipo: 'proteccion', description: 'Nivel de apoyo emocional entre miembros' },
  { id: 'violencia', name: 'Violencia intrafamiliar', tipo: 'riesgo', description: 'Presencia de violencia física o psicológica' },
  { id: 'adicciones', name: 'Adicciones', tipo: 'riesgo', description: 'Consumo problemático de sustancias' },
  { id: 'flexibilidad', name: 'Flexibilidad', tipo: 'proteccion', description: 'Capacidad de adaptación a cambios' },
  { id: 'cohesion', name: 'Cohesión familiar', tipo: 'proteccion', description: 'Vínculos emocionales entre miembros' },
  { id: 'estresores', name: 'Estresores externos', tipo: 'riesgo', description: 'Factores externos que afectan a la familia' },
  { id: 'recursos', name: 'Recursos socioeconómicos', tipo: 'ambos', description: 'Disponibilidad de recursos materiales' }
];

export default function FamilyReportFields({
  motivoConsultaFamiliar = '',
  onMotivoConsultaFamiliarChange,
  miembrosEvaluados = '',
  onMiembrosEvaluadosChange,
  dinamicaFamiliar = '',
  onDinamicaFamiliarChange,
  factoresRiesgoProteccion = '',
  onFactoresRiesgoProteccionChange,
  intervencionSugerida = '',
  onIntervencionSugeridaChange,
  onComplete
}: FamilyReportFieldsProps) {
  const [selectedFactores, setSelectedFactores] = useState<string[]>([]);

  // Manejar cambios en los factores seleccionados
  const handleFactorChange = (factorId: string) => {
    const updatedFactores = selectedFactores.includes(factorId)
      ? selectedFactores.filter(id => id !== factorId)
      : [...selectedFactores, factorId];

    setSelectedFactores(updatedFactores);

    // Actualizar el texto del área de factores de riesgo/protección
    const factoresText = updatedFactores.map(id => {
      const factor = factores.find(f => f.id === id);
      return factor ? `${factor.name} (${factor.tipo === 'riesgo' ? 'Riesgo' : factor.tipo === 'proteccion' ? 'Protección' : 'Ambivalente'})` : '';
    }).join(', ');

    onFactoresRiesgoProteccionChange(factoresRiesgoProteccion + (factoresRiesgoProteccion ? '\n' : '') + factoresText);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="px-0 space-y-5">
        {/* Motivo de consulta familiar */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FileText className="h-4 w-4 text-blue-600 mr-2" />
            Motivo de consulta familiar
          </Label>
          <Textarea
            value={motivoConsultaFamiliar}
            onChange={(e) => onMotivoConsultaFamiliarChange(e.target.value)}
            placeholder="Describa el motivo por el que la familia busca atención psicológica"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Miembros evaluados */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Users className="h-4 w-4 text-blue-600 mr-2" />
            Miembros evaluados
          </Label>
          <Textarea
            value={miembrosEvaluados}
            onChange={(e) => onMiembrosEvaluadosChange(e.target.value)}
            placeholder="Indique qué miembros de la familia participaron en la evaluación"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Dinámica y roles familiares */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Network className="h-4 w-4 text-blue-600 mr-2" />
            Dinámica y roles familiares
          </Label>
          <Textarea
            value={dinamicaFamiliar}
            onChange={(e) => onDinamicaFamiliarChange(e.target.value)}
            placeholder="Describa la dinámica familiar, patrones de interacción, roles y subsistemas"
            className="min-h-[120px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Factores de riesgo/protección */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            Factores de riesgo/protección
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 mb-3 bg-gray-50/50 rounded-lg border border-gray-200">
            {factores.map(factor => (
              <div key={factor.id} className="flex items-start space-x-2 group">
                <Checkbox
                  id={factor.id}
                  checked={selectedFactores.includes(factor.id)}
                  onCheckedChange={() => handleFactorChange(factor.id)}
                  className={cn(
                    "mt-1",
                    selectedFactores.includes(factor.id) ?
                      factor.tipo === 'riesgo' ? "text-red-500" :
                      factor.tipo === 'proteccion' ? "text-green-500" : "text-blue-500"
                    : "text-gray-400"
                  )}
                />
                <div>
                  <label
                    htmlFor={factor.id}
                    className={cn(
                      "text-sm font-medium cursor-pointer transition-colors",
                      selectedFactores.includes(factor.id) ?
                        factor.tipo === 'riesgo' ? "text-red-600" :
                        factor.tipo === 'proteccion' ? "text-green-600" : "text-blue-600"
                      : "text-gray-700 group-hover:text-gray-900"
                    )}
                  >
                    {factor.name}
                    <span className="text-xs ml-1 text-gray-500">
                      ({factor.tipo === 'riesgo' ? 'Riesgo' : factor.tipo === 'proteccion' ? 'Protección' : 'Ambivalente'})
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Textarea
            value={factoresRiesgoProteccion}
            onChange={(e) => onFactoresRiesgoProteccionChange(e.target.value)}
            placeholder="Describa los factores de riesgo y protección identificados en el sistema familiar"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Intervenciones sugeridas */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Lightbulb className="h-4 w-4 text-blue-600 mr-2" />
            Intervenciones sugeridas
          </Label>
          <Textarea
            value={intervencionSugerida}
            onChange={(e) => onIntervencionSugeridaChange(e.target.value)}
            placeholder="Incluya sugerencias de intervención familiar o sistémica"
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
