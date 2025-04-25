'use client';

import React from 'react';
import { ReportFieldsProps } from './ReportFieldsInterface';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileCheck, TrendingUp, Target, Calendar, Lightbulb, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// Propiedades específicas para el alta terapéutica
interface DischargeReportFieldsProps extends ReportFieldsProps {
  diagnosticoFinal: string;
  onDiagnosticoFinalChange: (value: string) => void;
  resumenEvolucion: string;
  onResumenEvolucionChange: (value: string) => void;
  logrosTerapeuticos: string;
  onLogrosTerapeuticosChange: (value: string) => void;
  nivelCumplimientoObjetivos: number;
  onNivelCumplimientoObjetivosChange: (value: number) => void;
  indicacionesAlta: string;
  onIndicacionesAltaChange: (value: string) => void;
  recomendacionesSeguimiento: string;
  onRecomendacionesSeguimientoChange: (value: string) => void;
}

// Tipos de alta terapéutica
const tiposAlta = [
  { value: 'objetivos-cumplidos', label: 'Por cumplimiento de objetivos terapéuticos' },
  { value: 'mejoria-significativa', label: 'Por mejoría significativa' },
  { value: 'decision-paciente', label: 'Por decisión del paciente' },
  { value: 'derivacion', label: 'Por derivación a otro profesional o servicio' },
  { value: 'otro', label: 'Otro motivo' }
];

export default function DischargeReportFields({
  diagnosticoFinal = '',
  onDiagnosticoFinalChange,
  resumenEvolucion = '',
  onResumenEvolucionChange,
  logrosTerapeuticos = '',
  onLogrosTerapeuticosChange,
  nivelCumplimientoObjetivos = 7,
  onNivelCumplimientoObjetivosChange,
  indicacionesAlta = '',
  onIndicacionesAltaChange,
  recomendacionesSeguimiento = '',
  onRecomendacionesSeguimientoChange,
  onComplete
}: DischargeReportFieldsProps) {
  const [tipoAlta, setTipoAlta] = React.useState<string>('');

  // Manejar cambios en el tipo de alta
  const handleTipoAltaChange = (value: string) => {
    setTipoAlta(value);
    onIndicacionesAltaChange(`Tipo de alta: ${tiposAlta.find(t => t.value === value)?.label || value}\n${indicacionesAlta}`);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="px-0 space-y-5">
        {/* Diagnóstico final */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FileCheck className="h-4 w-4 text-blue-600 mr-2" />
            Diagnóstico final
          </Label>
          <Textarea
            value={diagnosticoFinal}
            onChange={(e) => onDiagnosticoFinalChange(e.target.value)}
            placeholder="Indique el diagnóstico final al momento del alta"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Resumen de evolución */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
            Resumen de evolución
          </Label>
          <Textarea
            value={resumenEvolucion}
            onChange={(e) => onResumenEvolucionChange(e.target.value)}
            placeholder="Describa la evolución del paciente a lo largo del proceso terapéutico"
            className="min-h-[120px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Logros terapéuticos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Target className="h-4 w-4 text-blue-600 mr-2" />
            Logros terapéuticos
          </Label>
          <Textarea
            value={logrosTerapeuticos}
            onChange={(e) => onLogrosTerapeuticosChange(e.target.value)}
            placeholder="Detalle los principales logros alcanzados durante el proceso terapéutico"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Nivel de cumplimiento de objetivos (escala visual) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Target className="h-4 w-4 text-blue-600 mr-2" />
            Nivel de cumplimiento de objetivos
          </Label>
          <div className="px-2">
            <Slider
              defaultValue={[nivelCumplimientoObjetivos]}
              max={10}
              step={1}
              onValueChange={(value) => onNivelCumplimientoObjetivosChange(value[0])}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Bajo cumplimiento</span>
              <span>Cumplimiento parcial</span>
              <span>Alto cumplimiento</span>
            </div>
          </div>
          <div className="bg-blue-50/70 p-2 rounded-md text-center border border-blue-100">
            <span className="text-blue-700 font-medium text-sm">Nivel actual: {nivelCumplimientoObjetivos}/10</span>
          </div>
        </div>

        {/* Indicaciones al alta */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <FileCheck className="h-4 w-4 text-blue-600 mr-2" />
            Indicaciones al alta
          </Label>

          <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-200 mb-2">
            <p className="text-sm font-medium mb-2">Tipo de alta:</p>
            <RadioGroup value={tipoAlta} onValueChange={handleTipoAltaChange} className="space-y-2">
              {tiposAlta.map(tipo => (
                <div key={tipo.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={tipo.value} id={tipo.value} className={tipoAlta === tipo.value ? "text-blue-600" : ""} />
                  <Label htmlFor={tipo.value} className={cn(
                    "text-sm transition-colors",
                    tipoAlta === tipo.value ? "text-blue-700 font-medium" : "text-gray-700"
                  )}>
                    {tipo.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Textarea
            value={indicacionesAlta}
            onChange={(e) => onIndicacionesAltaChange(e.target.value)}
            placeholder="Incluya las indicaciones específicas al momento del alta"
            className="min-h-[90px] bg-white text-gray-900 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 hover:border-blue-300 resize-none"
          />
        </div>

        {/* Recomendaciones y seguimiento */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 flex items-center">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            Recomendaciones y seguimiento
          </Label>
          <Textarea
            value={recomendacionesSeguimiento}
            onChange={(e) => onRecomendacionesSeguimientoChange(e.target.value)}
            placeholder="Detalle las recomendaciones para el seguimiento posterior al alta"
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
