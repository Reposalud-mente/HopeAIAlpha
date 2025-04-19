'use client';

import { useState, useEffect } from 'react';
import { usePatient, PatientListItem } from '@/contexts/PatientContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserCircle, Calendar, Mail, Phone, Loader2, AlertCircle, FileText, Sparkles, ArrowRight, Wand2 } from 'lucide-react';

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

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return age;
  };

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  return (
    <Card className="w-full p-8 bg-white shadow-xl border-2 border-transparent rounded-2xl relative ai-glow">
        {/* Modern AI-driven card with animated blue glow */}
      {/* Patient selection card - optimized for desktop web experience */}
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-500 w-7 h-7" />
          <CardTitle className="text-2xl font-extrabold tracking-tight text-blue-800">Seleccionar Paciente</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <Input
              placeholder="Buscar pacientes..."
              className="pl-12 text-lg h-12 border-2 border-blue-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition-shadow shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mb-8 ml-1 text-sky-600 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Búsqueda inteligente potenciada por <span className="font-semibold">IA</span></span>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 text-blue-500 animate-spin mr-2" />
            <p className="text-gray-600">Cargando pacientes...</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <>
            {currentPatients.length > 0 ? (
              <table className="w-full text-left border-separate border-spacing-y-2 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-white via-blue-50 to-sky-50">
                <thead>
                  <tr className="text-gray-700 text-base bg-gradient-to-r from-blue-100 via-white to-sky-100">
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Edad</th>
                    <th className="px-4 py-3 font-semibold">Correo</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold flex items-center gap-1">Acción <ArrowRight className="w-4 h-4 text-blue-400" /></th>
                  </tr>
                </thead>
                <tbody>
                  {currentPatients.map((patient) => (
                    <tr key={patient.id} className="bg-white hover:bg-sky-50 rounded-xl transition-all shadow-sm group">
                      <td className="px-4 py-4 font-semibold text-gray-800 text-base group-hover:text-blue-700">{patient.firstName} {patient.lastName}</td>
                      <td className="px-4 py-4 text-gray-700">{calculateAge(patient.dateOfBirth)} años</td>
                      <td className="px-4 py-4 text-gray-700">{patient.contactEmail}</td>
                      <td className="px-4 py-4 text-gray-700">{patient.contactPhone || '-'}</td>
                      <td className="px-4 py-4">
                        <Button size="lg" variant="default" className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-1 transition-all duration-200 focus:ring-2 focus:ring-blue-200" onClick={() => onSelectPatient(patient)}>
                          <Wand2 className="w-4 h-4" />
                          Seleccionar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <UserCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No se encontraron pacientes</h3>
                <p className="text-gray-500 mb-6">No hay pacientes que coincidan con tu búsqueda.</p>
              </div>
            )}
          </>
        )}
        {patients.length > patientsPerPage && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-4 items-center">
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center px-6 text-lg font-semibold">
                Página {currentPage} de {totalPages}
              </div>
              <Button
                variant="outline"
                size="lg"
                className="px-8"
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
