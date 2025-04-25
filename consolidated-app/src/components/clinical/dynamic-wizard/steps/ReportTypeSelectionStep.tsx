'use client';

import React from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, HeartPulse, Users, GraduationCap, FileCheck, FileText, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Tipos de informes disponibles
const REPORT_TYPES = [
  {
    value: 'evaluacion-psicologica',
    label: 'Evaluación Psicológica',
    description: 'Informe completo de evaluación psicológica con diagnóstico y recomendaciones',
    icon: <Brain className="h-6 w-6" />
  },
  {
    value: 'seguimiento-terapeutico',
    label: 'Seguimiento Terapéutico',
    description: 'Informe de progreso y evolución del paciente durante el tratamiento',
    icon: <HeartPulse className="h-6 w-6" />
  },
  {
    value: 'evaluacion-neuropsicologica',
    label: 'Evaluación Neuropsicológica',
    description: 'Evaluación detallada de funciones cognitivas y neuropsicológicas',
    icon: <Brain className="h-6 w-6" />
  },
  {
    value: 'informe-familiar',
    label: 'Informe Familiar/Sistémico',
    description: 'Evaluación de dinámicas familiares y sistemas de relación',
    icon: <Users className="h-6 w-6" />
  },
  {
    value: 'informe-educativo',
    label: 'Informe Psicoeducativo',
    description: 'Evaluación para contextos educativos y adaptaciones curriculares',
    icon: <GraduationCap className="h-6 w-6" />
  },
  {
    value: 'alta-terapeutica',
    label: 'Alta Terapéutica',
    description: 'Informe de cierre y finalización del proceso terapéutico',
    icon: <FileCheck className="h-6 w-6" />
  }
];

interface ReportTypeSelectionStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

export default function ReportTypeSelectionStep({
  formState,
  updateForm,
  updateReportData,
  onComplete
}: ReportTypeSelectionStepProps) {
  const { currentPatient } = usePatient();
  const [dateInputValue, setDateInputValue] = React.useState(format(new Date(), 'yyyy-MM-dd'));

  // Manejar la selección del tipo de informe
  const handleSelectReportType = (type: string) => {
    updateForm({ tipoInforme: type });
    onComplete();
  };

  // Manejar cambios en la fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateInputValue(inputValue);

    // Convertir de YYYY-MM-DD a DD/MM/YYYY
    if (inputValue) {
      const [year, month, day] = inputValue.split('-');
      updateForm({ fecha: `${day}/${month}/${year}` });
    }
  };

  if (!currentPatient) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Por favor seleccione un paciente primero.</p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent relative">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl font-semibold text-gray-900">Selección de plantilla de informe clínico</CardTitle>
        </div>

        {/* Información del paciente seleccionado */}
        <div className="flex items-center py-2 px-3 bg-blue-50/50 border border-blue-100/50 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
            {currentPatient.firstName[0]}{currentPatient.lastName[0]}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 text-sm">{currentPatient.firstName} {currentPatient.lastName}</h4>
            <p className="text-xs text-gray-500">{currentPatient.age} años</p>
          </div>
        </div>

        {/* Fecha del informe - posición aún más discreta */}
        <div className="absolute top-0 right-0 pt-1 pr-1">
          <div className="flex items-center text-xs text-gray-300 hover:text-gray-600 transition-colors">
            <Calendar className="h-3 w-3 mr-1" />
            <Input
              type="date"
              value={dateInputValue}
              onChange={handleDateChange}
              className="h-5 w-24 bg-transparent border-0 p-0 focus:ring-0 text-xs"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REPORT_TYPES.map((type) => (
            <div
              key={type.value}
              onClick={() => handleSelectReportType(type.value)}
              className={cn(
                "group flex items-start p-4 rounded-lg border border-gray-200",
                "hover:border-blue-300 hover:bg-blue-50/20 cursor-pointer",
                "transition-all duration-200 shadow-sm hover:shadow-md"
              )}
            >
              <div className="bg-blue-50 p-2.5 rounded-full mr-4 text-blue-600 group-hover:bg-blue-100 transition-colors">
                {type.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                    {type.label}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
