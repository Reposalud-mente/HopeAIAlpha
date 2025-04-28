'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

function PatientSessionSummary({ patientId }: { patientId: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [latest, setLatest] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/patients/${patientId}/sessions`)
      .then(res => res.json())
      .then((data) => {
        setCount(data.length);
        if (data.length > 0) {
          const latestSession = data.reduce((a: { createdAt: string }, b: { createdAt: string }) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b);
          setLatest(new Date(latestSession.createdAt).toLocaleDateString());
        }
      })
      .catch(() => {
        setCount(null);
        setLatest(null);
      });
  }, [patientId]);
  if (count === null) return <div className="text-xs text-gray-400">Sesiones: ...</div>;
  if (count === 0) return <div className="text-xs text-gray-400">Sin sesiones</div>;
  return <div className="text-xs text-blue-600">Sesiones: {count} (última: {latest})</div>;
}

import { usePatient, PatientListItem } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import {
  UserCircle,
  Calendar,
  Mail,
  Phone,
  Search,
  Plus,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import PatientForm from '@/components/clinical/patient/PatientForm';
import AppLayout from '@/components/layout/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPatientName, calculateAge } from '@/lib/patient-utils';

export default function PatientListPage() {
  const router = useRouter();
  const { searchPatients, createPatient, isLoading, error } = usePatient();

  // State for patient list
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsPerPage] = useState(10);

  // Función para cargar pacientes
  const loadPatients = async (search: string) => {
    try {
      const results = await searchPatients(search);
      console.log('Patients loaded:', results); // Mensaje de depuración
      setPatients(results);
      setTotalPatients(results.length);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  // Cargar todos los pacientes al inicio
  useEffect(() => {
    console.log('Cargando pacientes al inicio...');
    // Llamamos a loadPatients con una cadena vacía para cargar todos los pacientes
    loadPatients('');
    console.log('Solicitud de carga de pacientes enviada');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (searchTerm === '') {
      loadPatients('');
      return;
    }

    // Use a debounce to prevent too many API calls
    const debounceTimeout = setTimeout(() => {
      loadPatients(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Hook para mostrar toasts
  const { toast } = useToast();

  // Handle patient creation
  const handleCreatePatient = async (patientData: any) => {
    const newPatient = await createPatient(patientData);
    if (newPatient) {
      setIsCreating(false);
      // Refresh the patient list
      loadPatients(searchTerm);
      // Mostrar toast de éxito
      toast({
        title: "Paciente creado",
        description: `${formatPatientName(newPatient)} ha sido creado correctamente.`,
        duration: 3000,
      });
    } else {
      // Mostrar toast de error
      toast({
        title: "Error al crear paciente",
        description: "No se pudo crear el paciente. Inténtelo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Using formatPatientName and calculateAge from utility functions

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(patientsPerPage)].map((_, idx) => (
              <div key={idx} className="flex flex-col bg-white border rounded-lg shadow-sm p-4 animate-pulse">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-3" />
                  <div className="flex-1 h-4 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="mt-auto flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Render the patient list
  console.log('Rendering patient list, patients:', patients, 'currentPatients:', currentPatients);
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header with title and create button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Search and filter bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pacientes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Patient list - Modern card grid layout */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentPatients.map((patient) => {
                  // Avatar initials
                  const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
                  // Status badge (active/inactive)
                  const statusColor = patient.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500';
                  return (
                    <div key={patient.id} className="flex flex-col bg-white border rounded-lg shadow-sm p-4 transition hover:shadow-md">
                      <div className="flex items-center mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 mr-3" aria-label="Avatar">
                          {initials}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-lg leading-tight truncate" title={formatPatientName(patient)}>{formatPatientName(patient)}</span>
                          <span className={`mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor} w-max`} aria-label={patient.isActive ? 'Activo' : 'Inactivo'}>
                            {patient.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                          <PatientSessionSummary patientId={patient.id} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{calculateAge(patient.dateOfBirth)} años</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{patient.contactEmail}</span>
                        </div>
                        {patient.contactPhone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{patient.contactPhone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/patients/${patient.id}`}>Ver Detalles</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <UserCircle className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron pacientes</h3>
                <p className="text-gray-500 mb-6">No hay pacientes que coincidan con tu búsqueda.</p>
                <Button onClick={() => setIsCreating(true)} variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Nuevo Paciente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {patients.length > patientsPerPage && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.ceil(patients.length / patientsPerPage) }).map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(patients.length / patientsPerPage)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Create Patient Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Nuevo Paciente</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                  ×
                </Button>
              </div>
              <ScrollArea className="p-6 max-h-[calc(90vh-80px)]">
                <PatientForm
                  onSubmit={handleCreatePatient}
                  onCancel={() => setIsCreating(false)}
                  isEditing={false}
                />
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );


}
