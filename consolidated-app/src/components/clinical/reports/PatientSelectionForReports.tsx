'use client';

import { useState, useEffect } from 'react';
import { usePatient, PatientListItem } from '@/contexts/PatientContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserCircle, Calendar, Mail, Phone, Loader2, AlertCircle, FileText, Sparkles, ArrowRight, Wand2 } from 'lucide-react';
import { calculateAge } from '@/lib/patient-utils';

interface PatientSelectionForReportsProps {
  onSelectPatient: (patient: PatientListItem) => void;
}

export function PatientSelectionForReports({ onSelectPatient }: PatientSelectionForReportsProps) {
  const { searchPatients, isLoading, error } = usePatient();
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);

  // Load patients on initial render
  useEffect(() => {
    loadPatients('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTerm === '') {
      loadPatients('');
      return;
    }

    const debounceTimeout = setTimeout(() => {
      loadPatients(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Load patients from API
  const loadPatients = async (search: string) => {
    try {
      const results = await searchPatients(search);
      setPatients(results);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  // Using calculateAge from utility functions

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  return (
    <Card className="w-full bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
      {/* Patient selection card - optimized for desktop web experience */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-600 w-5 h-5" />
          <CardTitle className="text-lg font-bold text-gray-800">Seleccionar Paciente</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
            <Input
              placeholder="Buscar pacientes..."
              className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-4 text-blue-600 text-sm flex items-center gap-2 bg-blue-50 p-2 rounded-md">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Búsqueda inteligente potenciada por <span className="font-semibold">IA</span></span>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <>
            {currentPatients.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-gray-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-700 text-sm bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 font-medium">Nombre</th>
                      <th className="px-4 py-3 font-medium">Edad</th>
                      <th className="px-4 py-3 font-medium">Correo</th>
                      <th className="px-4 py-3 font-medium">Teléfono</th>
                      <th className="px-4 py-3 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentPatients.map((patient) => (
                      <tr key={patient.id} className="bg-white hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{patient.firstName} {patient.lastName}</td>
                        <td className="px-4 py-3 text-gray-700">{calculateAge(patient.dateOfBirth)} años</td>
                        <td className="px-4 py-3 text-gray-700">{patient.contactEmail}</td>
                        <td className="px-4 py-3 text-gray-700">{patient.contactPhone || '-'}</td>
                        <td className="px-4 py-3">
                          <Button
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            onClick={() => onSelectPatient(patient)}
                          >
                            Seleccionar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <UserCircle className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-gray-800">No se encontraron pacientes</h3>
                <p className="text-gray-500 mb-4">No hay pacientes que coincidan con tu búsqueda.</p>
              </div>
            )}
          </>
        )}
        {patients.length > patientsPerPage && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center px-4 text-sm font-medium text-gray-700 bg-gray-50 rounded-md border border-gray-200 py-2">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-blue-50 hover:text-blue-700 transition-colors"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
