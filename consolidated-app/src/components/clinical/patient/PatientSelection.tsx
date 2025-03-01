'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectClinica } from '@/components/ui/select-clinica';

interface PatientSelectionProps {
  currentClinic: string;
  onClinicChange: (clinic: string) => void;
  onComplete: () => void;
}

// Sample patients for testing
const samplePatients = [
  { id: "PS001", name: "María González", status: "Nueva Paciente" },
  { id: "PS002", name: "Roberto Pérez", status: "En Espera" },
  { id: "PS003", name: "Carmen Rodríguez", status: "Evaluación Pendiente" },
  { id: "PS004", name: "José Luis Martínez", status: "Nueva Cita" },
];

export default function PatientSelection({ 
  currentClinic, 
  onClinicChange,
  onComplete 
}: PatientSelectionProps) {
  const { searchPatients, setCurrentPatient, currentPatient } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [clinicSelected, setClinicSelected] = useState(!!currentClinic);
  const [showAllPatients, setShowAllPatients] = useState(false);

  // Update clinicSelected when currentClinic changes
  useEffect(() => {
    setClinicSelected(!!currentClinic);
    // Show sample patients when clinic is selected
    if (!!currentClinic) {
      setShowAllPatients(true);
    }
  }, [currentClinic]);

  // Handle clinic selection
  const handleClinicChange = (clinic: string) => {
    onClinicChange(clinic);
    setClinicSelected(true);
    setShowAllPatients(true);
    // Clear search results when changing clinic
    setSearchResults([]);
    setSearchTerm('');
  };

  // Handle search
  useEffect(() => {
    if (searchTerm.length < 2 && !showAllPatients) {
      setSearchResults([]);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        if (searchTerm.length < 2 && showAllPatients) {
          // Show all sample patients if search field is empty
          setSearchResults(samplePatients);
        } else {
          // Filter sample patients based on search term
          const filteredResults = samplePatients.filter(
            patient => 
              patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              patient.id.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setSearchResults(filteredResults);
        }
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, searchPatients, showAllPatients]);

  // Handle patient selection
  const handlePatientSelect = (patient: any) => {
    setCurrentPatient(patient);
    // Automatically proceed to next step after selecting a patient
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Seleccionar Clínica y Paciente</h2>
        
        {/* Clinic selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Clínica</label>
          <SelectClinica 
            value={currentClinic} 
            onChange={handleClinicChange}
          />
        </div>
        
        {/* Patient search - only show after clinic is selected */}
        {clinicSelected && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Buscar Paciente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowAllPatients(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    e.preventDefault();
                    handlePatientSelect(searchResults[0]);
                  }
                }}
              />
            </div>
            
            {/* Search results */}
            {isSearching ? (
              <div className="mt-2 text-sm text-gray-500">Buscando...</div>
            ) : searchResults.length > 0 ? (
              <div className="mt-2 border rounded-md overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.map((patient) => (
                  <div 
                    key={patient.id}
                    className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-500">ID: {patient.id}</div>
                    </div>
                    <div className="text-sm px-2 py-1 rounded-full bg-gray-100">
                      {patient.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 || showAllPatients ? (
              <div className="mt-2 text-sm text-gray-500">No se encontraron resultados</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Add instructions */}
      {clinicSelected && !currentPatient && (
        <div className="text-sm text-gray-500 mt-4">
          Busque y seleccione un paciente para continuar automáticamente al siguiente paso.
          {!searchResults.length && showAllPatients && (
            <p className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchResults(samplePatients);
                }}
              >
                Mostrar todos los pacientes
              </Button>
            </p>
          )}
        </div>
      )}
    </div>
  );
} 