'use client';

import { useState, useEffect } from 'react';
import SessionList from '@/components/clinical/session/SessionList';
import PatientSessions from '@/components/clinical/session/PatientSessions';
import SessionEditor from '@/components/clinical/session/SessionEditor';
import SessionTransfer from '@/components/clinical/session/SessionTransfer';
import SessionExportImport from '@/components/clinical/session/SessionExportImport';
import { useParams, useRouter } from 'next/navigation';
import { usePatient, Patient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  UserCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  GraduationCap,
  Shield,
  AlertTriangle,
  Pencil,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import PatientForm from '@/components/clinical/patient/PatientForm';
import PatientDetailSkeleton from '@/components/clinical/patient/PatientDetailSkeleton';
import AppLayout from '@/components/layout/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PatientDetailPage() {
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const { getPatient, updatePatient, deletePatient, isLoading, error } = usePatient();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Load patient data
  useEffect(() => {
    console.log('PatientDetailPage useEffect triggered, patientId:', patientId);

    // Variable para controlar si el componente está montado
    let isMounted = true;

    const loadPatient = async () => {
      try {
        if (patientId) {
          console.log('Fetching patient data for ID:', patientId);
          const patientData = await getPatient(patientId);
          // Solo actualizar el estado si el componente sigue montado
          if (isMounted && patientData) {
            console.log('Patient data received, setting state');
            setPatient(patientData);
          }
        }
      } catch (err) {
        console.error('Error loading patient:', err);
      }
    };

    loadPatient();

    // Función de limpieza para evitar actualizar el estado si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [patientId]);  // Eliminamos getPatient y patient de las dependencias para evitar re-renders innecesarios

  // Handle patient update
  const handleUpdatePatient = async (patientData: Partial<Patient>) => {
    if (patient) {
      const updatedPatient = await updatePatient(patient.id, patientData);
      if (updatedPatient) {
        setPatient(updatedPatient);
        setIsEditing(false);
      }
    }
  };

  // Handle patient deletion
  const handleDeletePatient = async () => {
    if (patient) {
      setIsDeleting(true);
      const success = await deletePatient(patient.id);
      if (success) {
        router.push('/patients');
      } else {
        setIsDeleting(false);
      }
    }
  };

  // Format patient name
  const formatPatientName = (patient: Patient) => {
    return `${patient.firstName} ${patient.lastName}`;
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

  // Render PatientSessions below main info when patient is loaded
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <PatientDetailSkeleton />
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
          <Button asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pacientes
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (!patient) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Paciente no encontrado</h3>
              <p className="text-sm text-amber-700">No se pudo encontrar el paciente solicitado.</p>
            </div>
          </div>
          <Button asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pacientes
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" asChild>
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pacientes
            </Link>
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Eliminar paciente?</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-gray-700">
                    ¿Estás seguro de que deseas eliminar a {formatPatientName(patient)}? Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {}}>Cancelar</Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeletePatient}
                    disabled={isDeleting}
                  >
                    {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Eliminar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Patient Profile Card - Unified */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle className="h-16 w-16 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h1 className="text-2xl font-bold mb-1">{formatPatientName(patient)}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(patient.dateOfBirth, 'dd/MM/yyyy')} ({calculateAge(patient.dateOfBirth)} años)</span>
                  </div>
                  {patient.gender && (
                    <div className="flex items-center">
                      <UserCircle className="h-4 w-4 mr-1" />
                      <span>{patient.gender}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3 text-gray-700">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{patient.contactEmail || 'Sin email'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{patient.contactPhone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{patient.address || 'Sin dirección'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Tabs for additional sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Información Personal</TabsTrigger>
            <TabsTrigger value="assessments">Evaluaciones</TabsTrigger>
            <TabsTrigger value="sessions">Sesiones</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Teléfono</p>
                        <p className="text-gray-600">{patient.contactPhone || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Dirección</p>
                        <p className="text-gray-600">{patient.address || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Briefcase className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Ocupación</p>
                        <p className="text-gray-600">{patient.occupation || 'No especificada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Heart className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Estado Civil</p>
                        <p className="text-gray-600">{patient.maritalStatus || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Nivel Educativo</p>
                        <p className="text-gray-600">{patient.educationLevel || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <UserCircle className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Nombre</p>
                        <p className="text-gray-600">{patient.emergencyContactName || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Teléfono</p>
                        <p className="text-gray-600">{patient.emergencyContactPhone || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información de Seguro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Proveedor</p>
                        <p className="text-gray-600">{patient.insuranceProvider || 'No especificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Número de Póliza</p>
                        <p className="text-gray-600">{patient.insuranceNumber || 'No especificado'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <UserCircle className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Creado por</p>
                        <p className="text-gray-600">
                          {patient.createdBy
                            ? `${patient.createdBy.firstName} ${patient.createdBy.lastName}`
                            : 'Usuario desconocido'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Fecha de Creación</p>
                        <p className="text-gray-600">{format(patient.createdAt, 'dd MMMM yyyy, HH:mm', { locale: es })}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">Última Actualización</p>
                        <p className="text-gray-600">{format(patient.updatedAt, 'dd MMMM yyyy, HH:mm', { locale: es })}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Evaluaciones</CardTitle>
                <Button asChild>
                  <Link href={`/patients/${patient.id}/assessment/new`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Evaluación
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {patient.assessments && patient.assessments.length > 0 ? (
                  <div className="divide-y">
                    {patient.assessments.map((assessment: any) => (
                      <div key={assessment.id} className="py-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">Evaluación del {format(new Date(assessment.assessmentDate), 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-gray-600">
                            Estado: {assessment.status === 'DRAFT' ? 'Borrador' :
                                    assessment.status === 'IN_PROGRESS' ? 'En Progreso' :
                                    assessment.status === 'COMPLETED' ? 'Completada' : 'Archivada'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/assessments/${assessment.id}`}>
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay evaluaciones</h3>
                    <p className="text-gray-500 mb-6">Este paciente aún no tiene evaluaciones registradas.</p>
                    <Button asChild>
                      <Link href={`/patients/${patient.id}/assessment/new`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Evaluación
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            {/* Session Management (Unified Clinical Sessions) */}
            <SessionList patientId={patientId} onSelectSession={setSelectedSession} />
            {selectedSession && (
              <>
                <SessionEditor sessionId={selectedSession.id} />
                <SessionTransfer sessionId={selectedSession.id} />
                <SessionExportImport sessionId={selectedSession.id} />
              </>
            )}
          </TabsContent>

        </Tabs>

        {/* Edit Patient Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Editar Paciente</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  ×
                </Button>
              </div>
              <ScrollArea className="p-6 max-h-[calc(90vh-80px)]">
                <PatientForm
                  patient={patient}
                  onSubmit={handleUpdatePatient}
                  onCancel={() => setIsEditing(false)}
                  isEditing={true}
                />
              </ScrollArea>
            </div>
          </div>
        )}
        {/* Patient Sessions Section */}
        {patient && (
          <div className="mt-10">
            <PatientSessions patientId={patient.id} patientName={formatPatientName(patient)} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
