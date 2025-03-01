'use client';

import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { SelectClinica } from '@/components/ui/select-clinica';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface ClinicalInfoFormProps {
  clinica: string;
  psicologo: string;
  fecha: string;
  onClinicaChange: (clinica: string) => void;
  onPsicologoChange: (psicologo: string) => void;
  onFechaChange: (fecha: string) => void;
  onComplete: () => void;
}

export default function ClinicalInfoForm({
  clinica,
  psicologo,
  fecha,
  onClinicaChange,
  onPsicologoChange,
  onFechaChange,
  onComplete
}: ClinicalInfoFormProps) {
  const { currentPatient } = usePatient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateInputValue, setDateInputValue] = useState('');

  // Convert date format for input field
  useEffect(() => {
    try {
      // Try to parse the fecha as DD/MM/YYYY format
      const parts = fecha.split('/');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        // Format as YYYY-MM-DD for the date input
        setDateInputValue(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      } else {
        // If not in expected format, set today's date
        setDateInputValue(format(new Date(), 'yyyy-MM-dd'));
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      setDateInputValue(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [fecha]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateInputValue(inputValue);
    
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    if (inputValue) {
      const [year, month, day] = inputValue.split('-');
      onFechaChange(`${day}/${month}/${year}`);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!clinica) newErrors.clinica = "La clínica es requerida";
    if (!psicologo) newErrors.psicologo = "El psicólogo es requerido";
    if (!fecha) newErrors.fecha = "La fecha es requerida";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // This function will be used with navigation buttons from the parent component
  const handleValidateAndContinue = () => {
    if (validateForm()) {
      onComplete();
      return true;
    }
    return false;
  };

  if (!currentPatient) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Por favor seleccione un paciente primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Información Clínica</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient info (display only) */}
          <div>
            <h3 className="text-md font-medium mb-3">Información del Paciente</h3>
            <Card className="p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Nombre:</span>
                  <p className="font-medium">{currentPatient.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ID:</span>
                  <p>{currentPatient.id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Estado:</span>
                  <p>{currentPatient.status}</p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Clinical info (editable) */}
          <div>
            <h3 className="text-md font-medium mb-3">Información de la Consulta</h3>
            <div className="space-y-4">
              {/* Clinic selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Clínica</label>
                <SelectClinica 
                  value={clinica} 
                  onChange={onClinicaChange}
                />
                {errors.clinica && <p className="text-red-500 text-sm mt-1">{errors.clinica}</p>}
              </div>
              
              {/* Psicólogo */}
              <div>
                <label className="block text-sm font-medium mb-1">Psicólogo</label>
                <Input
                  value={psicologo}
                  onChange={(e) => onPsicologoChange(e.target.value)}
                  placeholder="Nombre del psicólogo"
                  className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.psicologo && <p className="text-red-500 text-sm mt-1">{errors.psicologo}</p>}
              </div>
              
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <Input
                  type="date"
                  value={dateInputValue}
                  onChange={handleDateChange}
                  className="bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 