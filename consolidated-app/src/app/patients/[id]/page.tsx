'use client';

import { useState, useEffect } from 'react';
import PatientSessions from '@/components/clinical/session/PatientSessions';
import { Session, SessionWithRelations } from '@/components/clinical/session/types';
import SessionEditor from '@/components/clinical/session/SessionEditor';
import SessionTransfer from '@/components/clinical/session/SessionTransfer';
import SessionExportImport from '@/components/clinical/session/SessionExportImport';
import { useParams, useRouter } from 'next/navigation';
import { usePatient, Patient } from '@/contexts/PatientContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import {
  UserCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
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
import { formatPatientName, calculateAge } from '@/lib/patient-utils';

export default function PatientDetailPage() {
  const [selectedSession, setSelectedSession] = useState<SessionWithRelations | null>(null);
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

  // Hook para mostrar toasts
  const { toast } = useToast();

  // Handle patient update
  const handleUpdatePatient = async (patientData: Partial<Patient>) => {
    if (patient) {
      const updatedPatient = await updatePatient(patient.id, patientData);
      if (updatedPatient) {
        setPatient(updatedPatient);
        setIsEditing(false);
        // Mostrar toast de éxito
        toast({
          title: "Paciente actualizado",
          description: `La información de ${formatPatientName(updatedPatient)} ha sido actualizada correctamente.`,
          duration: 3000,
        });
      } else {
        // Mostrar toast de error
        toast({
          title: "Error al actualizar",
          description: "No se pudo actualizar la información del paciente. Inténtelo de nuevo.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  // Handle patient deletion
  const handleDeletePatient = async () => {
    if (patient) {
      setIsDeleting(true);
      const patientName = formatPatientName(patient); // Guardar el nombre antes de eliminar
      const success = await deletePatient(patient.id);
      if (success) {
        // Mostrar toast de éxito
        toast({
          title: "Paciente eliminado",
          description: `${patientName} ha sido eliminado correctamente.`,
          duration: 3000,
        });
        router.push('/patients');
      } else {
        setIsDeleting(false);
        // Mostrar toast de error
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar el paciente. Inténtelo de nuevo.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  // Patient utility functions are now imported from @/lib/patient-utils

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
        {/* Back button and actions - Redesigned for better clarity */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors pl-2">
              <Link href="/patients" className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="font-medium">Volver a Pacientes</span>
              </Link>
            </Button>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setIsEditing(true)} className="hover:bg-blue-50 hover:text-blue-700 transition-colors">
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="hover:bg-red-600 transition-colors">
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
        </div>

        {/* Patient Profile Card - Redesigned for better cohesion */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Patient header with avatar and name */}
          <div className="flex items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
            <div className="flex-shrink-0 mr-5">
              <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-blue-50 text-blue-700 text-xl font-bold">
                  {`${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-xl font-bold text-gray-800 flex items-center flex-wrap">
                    {formatPatientName(patient)}
                    <span className="text-sm font-medium text-blue-600 ml-2 bg-blue-50 px-2 py-0.5 rounded-md">
                      {calculateAge(patient.dateOfBirth)} años
                    </span>
                    <Badge
                      variant={patient.isActive ? "default" : "outline"}
                      className={`ml-2 ${patient.isActive ? 'bg-green-100 hover:bg-green-100 text-green-800' : 'text-gray-500'}`}
                      aria-label={patient.isActive ? 'Paciente activo' : 'Paciente inactivo'}
                    >
                      {patient.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Contact information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-gray-50/50">
            <div className="flex items-center p-4 hover:bg-blue-50/30 transition-colors">
              <Mail className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="text-gray-700 font-medium truncate">{patient.contactEmail || 'Sin email'}</p>
              </div>
            </div>
            <div className="flex items-center p-4 hover:bg-blue-50/30 transition-colors">
              <Phone className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                <p className="text-gray-700 font-medium truncate">{patient.contactPhone || 'Sin teléfono'}</p>
              </div>
            </div>
            <div className="flex items-center p-4 hover:bg-blue-50/30 transition-colors">
              <MapPin className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
              <div className="min-w-0 overflow-hidden">
                <p className="text-xs text-gray-500 font-medium">Dirección</p>
                <p className="text-gray-700 font-medium truncate">{patient.address || 'Sin dirección'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for additional sections - Redesigned for better cohesion */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4 p-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
            <TabsTrigger value="info" className="data-[state=active]:font-medium data-[state=active]:text-blue-700 hover:bg-blue-50 hover:border-b-2 hover:border-blue-300 transition-colors duration-200 rounded-md px-4 py-2">
              <UserCircle className="h-4 w-4 mr-2" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:font-medium data-[state=active]:text-blue-700 hover:bg-blue-50 hover:border-b-2 hover:border-blue-300 transition-colors duration-200 rounded-md px-4 py-2">
              <FileText className="h-4 w-4 mr-2" />
              Evaluaciones
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:font-medium data-[state=active]:text-blue-700 hover:bg-blue-50 hover:border-b-2 hover:border-blue-300 transition-colors duration-200 rounded-md px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              Sesiones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="space-y-6">
              {/* Datos Personales y Profesionales - Simplificado */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-gray-100 py-4">
                  <CardTitle className="text-lg flex items-center">
                    <UserCircle className="h-5 w-5 text-blue-600 mr-2" />
                    Datos Personales
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Columna izquierda - Datos básicos */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                        <span className="text-sm font-medium text-gray-600">Fecha de Nacimiento:</span>
                        <span className="text-sm font-medium text-gray-800">{format(patient.dateOfBirth, 'dd/MM/yyyy')}</span>
                      </div>

                      {patient.gender && (
                        <div className="flex items-center justify-between p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Género:</span>
                          <span className="text-sm font-medium text-gray-800">{patient.gender}</span>
                        </div>
                      )}

                      {patient.maritalStatus && (
                        <div className="flex items-center justify-between p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                          <span className="text-sm font-medium text-gray-600">Estado Civil:</span>
                          <span className="text-sm font-medium text-gray-800">{patient.maritalStatus}</span>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha - Datos profesionales */}
                    <div className="space-y-4">
                      {patient.occupation && (
                        <div className="flex items-center p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                          <Briefcase className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Ocupación</p>
                            <p className="font-medium text-gray-800">{patient.occupation}</p>
                          </div>
                        </div>
                      )}

                      {patient.educationLevel && (
                        <div className="flex items-center p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                          <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Nivel Educativo</p>
                            <p className="font-medium text-gray-800">{patient.educationLevel}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contacto de Emergencia y Seguro Médico */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contacto de Emergencia */}
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 py-4">
                    <CardTitle className="text-lg flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                      Contacto de Emergencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {patient.emergencyContactName || patient.emergencyContactPhone ? (
                      <div className="space-y-4">
                        {patient.emergencyContactName && (
                          <div className="flex items-center p-3 hover:bg-amber-50/30 rounded-md border-b border-gray-100 transition-colors">
                            <UserCircle className="h-5 w-5 text-amber-600 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Nombre</p>
                              <p className="font-medium text-gray-800">{patient.emergencyContactName}</p>
                            </div>
                          </div>
                        )}
                        {patient.emergencyContactPhone && (
                          <div className="flex items-center p-3 hover:bg-amber-50/30 rounded-md border-b border-gray-100 transition-colors">
                            <Phone className="h-5 w-5 text-amber-600 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                              <p className="font-medium text-gray-800">{patient.emergencyContactPhone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-amber-200 rounded-md bg-amber-50/20">
                        <AlertCircle className="h-10 w-10 text-amber-300 mx-auto mb-2" />
                        <p className="text-amber-700 text-sm">No se ha especificado un contacto de emergencia</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Seguro Médico */}
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 py-4">
                    <CardTitle className="text-lg flex items-center">
                      <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                      Seguro Médico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(patient.insuranceProvider || patient.insuranceNumber) ? (
                      <div className="space-y-4">
                        {patient.insuranceProvider && (
                          <div className="flex items-center p-3 hover:bg-indigo-50/30 rounded-md border-b border-gray-100 transition-colors">
                            <Shield className="h-5 w-5 text-indigo-600 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Proveedor</p>
                              <p className="font-medium text-gray-800">{patient.insuranceProvider}</p>
                            </div>
                          </div>
                        )}
                        {patient.insuranceNumber && (
                          <div className="flex items-center p-3 hover:bg-indigo-50/30 rounded-md border-b border-gray-100 transition-colors">
                            <FileText className="h-5 w-5 text-indigo-600 mr-3" />
                            <div>
                              <p className="text-xs text-gray-500 font-medium">Número de Póliza</p>
                              <p className="font-medium text-gray-800">{patient.insuranceNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed border-indigo-200 rounded-md bg-indigo-50/20">
                        <Shield className="h-10 w-10 text-indigo-300 mx-auto mb-2" />
                        <p className="text-indigo-700 text-sm">No se ha especificado información de seguro médico</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Información del Sistema - Simplificada */}
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100 py-3">
                  <CardTitle className="text-sm flex items-center">
                    <FileText className="h-4 w-4 text-slate-600 mr-2" />
                    Información del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex items-center p-3 rounded-md hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
                      <UserCircle className="h-5 w-5 text-slate-500 mr-3" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Creado por</p>
                        <p className="text-sm font-medium text-gray-800">
                          {patient.createdBy
                            ? `${patient.createdBy.firstName} ${patient.createdBy.lastName}`
                            : 'Usuario desconocido'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 rounded-md hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
                      <Calendar className="h-5 w-5 text-slate-500 mr-3" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Fecha de Creación</p>
                        <p className="text-sm font-medium text-gray-800">{format(patient.createdAt, 'dd/MM/yyyy, HH:mm', { locale: es })}</p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 rounded-md hover:bg-slate-50/50 transition-colors border border-transparent hover:border-slate-100">
                      <Calendar className="h-5 w-5 text-slate-500 mr-3" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Última Actualización</p>
                        <p className="text-sm font-medium text-gray-800">{format(patient.updatedAt, 'dd/MM/yyyy, HH:mm', { locale: es })}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50 border-b border-gray-100">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Evaluaciones
                </CardTitle>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                  <Link href={`/reports?patientId=${patient.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Evaluación
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                {patient.assessments && patient.assessments.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {patient.assessments.map((assessment: any) => (
                      <div key={assessment.id} className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-md transition-colors">
                        <div>
                          <p className="font-medium text-gray-800">Evaluación del {format(new Date(assessment.assessmentDate), 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${assessment.status === 'COMPLETED' ? 'bg-green-500' : assessment.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-gray-400'}`}></span>
                            Estado: {assessment.status === 'DRAFT' ? 'Borrador' :
                                    assessment.status === 'IN_PROGRESS' ? 'En Progreso' :
                                    assessment.status === 'COMPLETED' ? 'Completada' : 'Archivada'}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-700 transition-colors">
                          <Link href={`/assessments/${assessment.id}`}>
                            Ver Detalles
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <FileText className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-gray-800">No hay evaluaciones</h3>
                    <p className="text-gray-500 mb-6">Este paciente aún no tiene evaluaciones registradas.</p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
                      <Link href={`/reports?patientId=${patient.id}`}>
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
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-gray-100">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    Sesiones Clínicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-5">
                    <PatientSessions
                      patientId={patientId}
                      patientName={formatPatientName(patient)}
                      onSelectSession={setSelectedSession}
                    />
                  </div>
                </CardContent>
              </Card>

              {selectedSession && (
                <div className="space-y-4 mt-6 bg-gray-50/50 p-5 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    Detalles de la Sesión
                  </h3>
                  <div className="space-y-4">
                    <SessionEditor sessionId={selectedSession.id} />
                    <SessionTransfer sessionId={selectedSession.id} />
                    <SessionExportImport sessionId={selectedSession.id} />
                  </div>
                </div>
              )}
            </div>
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
      </div>
    </AppLayout>
  );
}
