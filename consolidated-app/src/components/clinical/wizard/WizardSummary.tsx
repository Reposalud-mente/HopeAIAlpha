'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building, 
  Calendar, 
  FileText, 
  ClipboardList, 
  Brain, 
  MessageCircle, 
  Stethoscope, 
  ListChecks, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WizardSummaryProps {
  formData: any;
  onEditStep: (step: string) => void;
  onConfirm: () => void;
  isValid: boolean;
  validationErrors: Record<string, string>;
}

export default function WizardSummary({ 
  formData, 
  onEditStep, 
  onConfirm, 
  isValid,
  validationErrors
}: WizardSummaryProps) {
  // Format date if available
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return format(new Date(`${year}-${month}-${day}`), "d 'de' MMMM, yyyy", { locale: es });
      }
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  // Get report type name
  const getReportTypeName = (type: string) => {
    switch (type) {
      case 'evaluacion-psicologica': return 'Evaluación Psicológica';
      case 'seguimiento-terapeutico': return 'Seguimiento Terapéutico';
      case 'evaluacion-neuropsicologica': return 'Evaluación Neuropsicológica';
      case 'informe-familiar': return 'Informe Familiar/Sistémico';
      case 'informe-educativo': return 'Informe Psicoeducativo';
      case 'alta-terapeutica': return 'Alta Terapéutica';
      default: return 'No especificado';
    }
  };

  // Check if a section has validation errors
  const hasSectionErrors = (section: string) => {
    const sectionFields: Record<string, string[]> = {
      'patient-selection': ['patientId'],
      'clinical-info': ['clinica', 'psicologo', 'fecha', 'tipoInforme'],
      'report-preview': [],
      'report-generation': []
    };
    
    return sectionFields[section]?.some(field => validationErrors[field]);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Resumen del Informe
          </CardTitle>
          <p className="text-sm text-gray-600">
            Revisa toda la información antes de generar el informe final. Puedes volver a cualquier paso para realizar cambios.
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-8">
              {/* Patient Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Información del Paciente
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditStep('patient-selection')}
                    className={`flex items-center gap-1 ${hasSectionErrors('patient-selection') ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    {hasSectionErrors('patient-selection') ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Editar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.currentPatient ? (
                  <Card className="border border-gray-200 p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Nombre completo:</p>
                        <p className="font-medium">{formData.currentPatient.firstName} {formData.currentPatient.lastName}</p>
                      </div>
                      
                      {formData.currentPatient.dateOfBirth && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Fecha de nacimiento:</p>
                          <p className="font-medium">{formatDate(formData.currentPatient.dateOfBirth)}</p>
                        </div>
                      )}
                      
                      {formData.currentPatient.gender && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Género:</p>
                          <p className="font-medium">{formData.currentPatient.gender}</p>
                        </div>
                      )}
                      
                      {formData.currentPatient.contactEmail && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Email:</p>
                          <p className="font-medium">{formData.currentPatient.contactEmail}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <p>No se ha seleccionado ningún paciente.</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              {/* Report Type and Clinical Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Tipo de Informe e Información Clínica
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditStep('clinical-info')}
                    className={`flex items-center gap-1 ${hasSectionErrors('clinical-info') ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}
                  >
                    {hasSectionErrors('clinical-info') ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Editar
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Card className="border border-gray-200 p-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Tipo de informe:</p>
                      <p className="font-medium">{getReportTypeName(formData.tipoInforme)}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Centro clínico:</p>
                      <p className="font-medium">{formData.clinica || 'No especificado'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Profesional:</p>
                      <p className="font-medium">{formData.psicologo || 'No especificado'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Fecha:</p>
                      <p className="font-medium">{formatDate(formData.fecha)}</p>
                    </div>
                  </div>
                </Card>
              </div>
              </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Validation summary */}
      {!isValid && Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">Por favor corrige los siguientes errores:</p>
          </div>
          <ul className="list-disc list-inside space-y-1 pl-2">
            {Object.entries(validationErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="default"
          onClick={onConfirm}
          disabled={!isValid}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Generar Informe Final
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}