'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { Input } from '@/components/ui/input';
import { SelectClinica } from '@/components/ui/select-clinica';
import { calculateAge } from '@/lib/patient-utils';

interface PatientSelectionProps {
  currentClinic: string;
  onClinicChange: (clinic: string) => void;
  onComplete: () => void;
}

// Using calculateAge from utility functions

// Convertir pacientes reales al formato esperado por la interfaz
const formatPatientForDisplay = (patient: any) => ({
  id: patient.id,
  name: `${patient.firstName} ${patient.lastName}`,
  age: patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null,
  gender: patient.gender || 'No especificado',
  lastUpdate: patient.updatedAt ? new Date(patient.updatedAt) : null,
  status: patient.isActive ? "Activo" : "Inactivo",
});

export default function PatientSelection({
  currentClinic,
  onClinicChange,
  onComplete
}: PatientSelectionProps) {
  const { searchPatients, setCurrentPatient, currentPatient, getPatient } = usePatient();
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
    // No realizar búsquedas si no hay término de búsqueda y no se ha solicitado mostrar todos
    if (searchTerm.length < 2 && !showAllPatients) {
      setSearchResults([]);
      return;
    }

    // Evitar búsquedas innecesarias
    let isMounted = true;
    const delaySearch = setTimeout(async () => {
      if (!isMounted) return;

      setIsSearching(true);
      try {
        // Buscar pacientes reales usando la API solo cuando sea necesario
        const patients = await searchPatients(showAllPatients ? '' : searchTerm);

        if (!isMounted) return;

        if (patients && patients.length > 0) {
          // Convertir los pacientes al formato esperado por la interfaz
          const formattedPatients = patients.map(formatPatientForDisplay);
          setSearchResults(formattedPatients);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error searching patients:', error);
          setSearchResults([]);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(delaySearch);
    };
  }, [searchTerm, showAllPatients]); // Eliminamos searchPatients de las dependencias

  // Handle patient selection
  const handlePatientSelect = async (patient: any) => {
    try {
      // Obtener los detalles completos del paciente usando el ID
      const fullPatient = await getPatient(patient.id);

      if (fullPatient) {
        // Establecer el paciente completo como paciente actual
        setCurrentPatient(fullPatient);
        // Avanzar automáticamente al siguiente paso
        onComplete();
      } else {
        console.error('No se pudo cargar la información completa del paciente');
      }
    } catch (error) {
      console.error('Error al seleccionar el paciente:', error);
    }
  };

  return (
    <div className="px-6 pb-6">
      <div className="mt-4">
        {/* Clinic selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Centro Clínico</label>
            {currentClinic && (
              <div className="text-xs text-blue-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Seleccionado
              </div>
            )}
          </div>
          <SelectClinica
            value={currentClinic}
            onChange={handleClinicChange}
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Patient search - only show after clinic is selected */}
        {clinicSelected && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Buscar Paciente</label>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limpiar
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <Input
                placeholder="Buscar por nombre o ID del paciente..."
                className="pl-10 py-6 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-md"
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
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                  aria-label="Limpiar búsqueda"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search results */}
            {isSearching ? (
              <div className="mt-4 flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-600">Buscando pacientes...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm cursor-pointer transition-all duration-150 group"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mr-3 text-blue-700 font-medium shadow-sm">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</div>
                            <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-x-3 gap-y-1">
                              {patient.age !== null && (
                                <span className="inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {patient.age} años
                                </span>
                              )}
                              {patient.gender && (
                                <span className="inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : patient.gender}
                                </span>
                              )}
                              {patient.lastUpdate && (
                                <span className="inline-flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Últ. actualización: {patient.lastUpdate.toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {patient.status === 'Activo' ? (
                        <div className="flex items-center px-2 py-1 rounded-full bg-green-100 border border-green-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                          <span className="text-xs text-green-800 font-medium">Activo</span>
                        </div>
                      ) : (
                        <div className="flex items-center px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                          <span className="text-xs text-gray-600 font-medium">Inactivo</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 || showAllPatients ? (
              <div className="mt-4 py-8 text-center border border-gray-200 rounded-lg bg-gray-50">
                <div className="text-gray-400 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-700">No se encontraron pacientes</p>
                <div className="mt-3 max-w-xs mx-auto">
                  <p className="text-sm text-gray-500">Pruebe con otro término de búsqueda o verifique que el paciente esté registrado en el sistema</p>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAllPatients(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Ver todos los pacientes
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Add instructions */}
      {clinicSelected && !currentPatient && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Seleccione un paciente para continuar al siguiente paso
            </span>
          </div>
        </div>
      )}
    </div>
  );
}