'use client';

import { useState } from 'react';
import { usePatient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, UserCircle, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import PatientReviewController from '@/components/clinical/patient/PatientReviewController';
import AppLayout from '@/components/layout/app-layout';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const { searchPatients } = usePatient();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Sample patients data
  const samplePatients = [
    { id: 'P001', name: 'María González', status: 'En Tratamiento', lastVisit: '2023-05-15', nextAppointment: '2023-06-01' },
    { id: 'P002', name: 'Juan Pérez', status: 'Nueva Evaluación', lastVisit: '2023-05-20', nextAppointment: '2023-05-27' },
    { id: 'P003', name: 'Ana Rodríguez', status: 'Seguimiento', lastVisit: '2023-05-10', nextAppointment: '2023-06-10' },
    { id: 'P004', name: 'Carlos Sánchez', status: 'Alta Médica', lastVisit: '2023-04-30', nextAppointment: null },
    { id: 'P005', name: 'Laura Fernández', status: 'Nueva Paciente', lastVisit: null, nextAppointment: '2023-05-25' },
  ];
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 2) {
      setIsSearching(true);
      // Filter sample patients based on search term
      const results = samplePatients.filter(
        patient => 
          patient.name.toLowerCase().includes(value.toLowerCase()) ||
          patient.id.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };
  
  return (
    <AppLayout>
      {/* Header - Simplified */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              HA
            </div>
            <h1 className="text-xl font-semibold">HopeAI</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <Button onClick={() => setShowNewPatientForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pacientes por nombre o ID..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          {/* Search Results */}
          {searchTerm.length > 2 && (
            <div className="mt-2">
              {isSearching ? (
                <p className="text-sm text-gray-500">Buscando...</p>
              ) : searchResults.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {searchResults.map(patient => (
                        <li key={patient.id} className="p-4 hover:bg-gray-50">
                          <Link href={`/patients/${patient.id}`} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <UserCircle className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-gray-500">ID: {patient.id}</p>
                              </div>
                            </div>
                            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {patient.status}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-sm text-gray-500 mt-2">No se encontraron pacientes con ese criterio.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Patient List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samplePatients.map(patient => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <UserCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <p className="text-sm text-gray-500">ID: {patient.id}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {patient.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Última visita: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Próxima cita: {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Historial
                  </Button>
                  <Button size="sm" className="flex-1">
                    Nueva Evaluación
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Patient Review Controller (conditionally rendered) */}
        {showNewPatientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Nueva Evaluación de Paciente</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowNewPatientForm(false)}>
                  ×
                </Button>
              </div>
              <div className="p-6">
                <PatientReviewController />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 