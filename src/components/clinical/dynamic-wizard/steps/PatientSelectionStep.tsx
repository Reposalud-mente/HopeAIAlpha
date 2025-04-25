'use client';

import React, { useState, useEffect } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Datos de ejemplo para pacientes
const SAMPLE_PATIENTS = [
  { id: '1', firstName: 'Juan', lastName: 'Pérez', age: 35, lastVisit: '15/05/2023' },
  { id: '2', firstName: 'María', lastName: 'González', age: 42, lastVisit: '22/06/2023' },
  { id: '3', firstName: 'Carlos', lastName: 'Rodríguez', age: 28, lastVisit: '10/07/2023' },
  { id: '4', firstName: 'Ana', lastName: 'Martínez', age: 51, lastVisit: '05/08/2023' },
  { id: '5', firstName: 'Luis', lastName: 'Sánchez', age: 19, lastVisit: '30/08/2023' }
];

interface PatientSelectionStepProps {
  formState: any;
  updateForm: (updates: any) => void;
  updateReportData: (updates: any) => void;
  onComplete: () => void;
}

export default function PatientSelectionStep({ 
  formState, 
  updateForm, 
  updateReportData,
  onComplete 
}: PatientSelectionStepProps) {
  const { setCurrentPatient, currentPatient } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(SAMPLE_PATIENTS);
  
  // Filtrar pacientes basados en el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = SAMPLE_PATIENTS.filter(patient => 
        patient.firstName.toLowerCase().includes(lowercasedSearch) || 
        patient.lastName.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(SAMPLE_PATIENTS);
    }
  }, [searchTerm]);
  
  // Seleccionar un paciente
  const handleSelectPatient = (patient: any) => {
    setCurrentPatient(patient);
    updateReportData({ patientId: patient.id });
  };
  
  // Continuar al siguiente paso
  const handleContinue = () => {
    if (currentPatient) {
      onComplete();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800">Seleccione un paciente</h3>
        <p className="text-sm text-gray-600">
          Busque y seleccione el paciente para el cual desea generar un informe.
        </p>
      </div>
      
      {/* Barra de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar paciente por nombre..."
          className="pl-10 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Lista de pacientes */}
      <div className="space-y-3">
        {filteredPatients.map(patient => (
          <Card 
            key={patient.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
              currentPatient?.id === patient.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleSelectPatient(patient)}
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10 bg-blue-100 text-blue-600">
                <AvatarFallback>{patient.firstName[0]}{patient.lastName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{patient.firstName} {patient.lastName}</h4>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>{patient.age} años</span>
                  <span>Última visita: {patient.lastVisit}</span>
                </div>
              </div>
              {currentPatient?.id === patient.id && (
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Seleccionado
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {filteredPatients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron pacientes con ese nombre.
        </div>
      )}
      
      {/* Botón para continuar */}
      <div className="pt-4">
        <Button
          onClick={handleContinue}
          disabled={!currentPatient}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continuar con {currentPatient ? `${currentPatient.firstName} ${currentPatient.lastName}` : 'el paciente seleccionado'}
        </Button>
      </div>
    </div>
  );
}
