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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ChevronRight,
  LayoutGrid,
  List,
  Filter,
  X,
  CheckSquare,
  Square,
  Trash2,
  Download,
  UserCheck,
  UserX
} from 'lucide-react';
import { DemoModeBanner } from '@/components/demo/demo-mode-banner';
import { DemoBadge, isDemo } from '@/components/demo/demo-badge';
import Link from 'next/link';
import PatientForm from '@/components/clinical/patient/PatientForm';
import AppLayout from '@/components/layout/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatPatientName, calculateAge } from '@/lib/patient-utils';

export default function PatientListPage() {
  const router = useRouter();
  const { searchPatients, createPatient, bulkDeletePatients, bulkUpdatePatients, isLoading, error } = usePatient();

  // State for patient list
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsPerPage] = useState(10);

  // State for bulk actions and filtering
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'activate' | 'deactivate' | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Función para cargar pacientes
  const loadPatients = async (search: string) => {
    try {
      const results = await searchPatients(search);
      console.log('Patients loaded:', results); // Mensaje de depuración

      // Apply status filter if needed
      let filteredResults = results;
      if (statusFilter !== 'all') {
        filteredResults = results.filter(patient =>
          statusFilter === 'active' ? patient.isActive : !patient.isActive
        );
      }

      setPatients(filteredResults);
      setTotalPatients(filteredResults.length);

      // Clear selected patients when loading new data
      setSelectedPatients([]);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  // Cargar todos los pacientes al inicio y restaurar preferencia de vista
  useEffect(() => {
    console.log('Cargando pacientes al inicio...');
    // Llamamos a loadPatients con una cadena vacía para cargar todos los pacientes
    loadPatients('');
    console.log('Solicitud de carga de pacientes enviada');

    // Restaurar preferencia de vista desde localStorage
    const savedViewMode = localStorage.getItem('patientsViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
    }
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
  }, [searchTerm, statusFilter]);

  // Effect to show/hide bulk actions bar
  useEffect(() => {
    setShowBulkActions(selectedPatients.length > 0);
  }, [selectedPatients]);

  // Hook para mostrar toasts
  const { toast } = useToast();

  // Toggle selection of a single patient
  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  // Toggle selection of all patients on current page
  const toggleSelectAll = () => {
    if (selectedPatients.length === currentPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(currentPatients.map(patient => patient.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: 'delete' | 'activate' | 'deactivate') => {
    setBulkActionType(action);
    setIsConfirmDialogOpen(true);
  };

  // Execute bulk action after confirmation
  const executeBulkAction = async () => {
    if (!bulkActionType) return;

    setIsBulkActionLoading(true);

    try {
      let success = false;

      // Implement the actual bulk actions here
      switch (bulkActionType) {
        case 'delete':
          // Call the bulk delete function
          success = await bulkDeletePatients(selectedPatients);
          if (success) {
            toast({
              title: "Pacientes eliminados",
              description: `${selectedPatients.length} pacientes han sido eliminados.`,
              duration: 3000,
            });
          } else {
            throw new Error('No se pudieron eliminar algunos pacientes');
          }
          break;

        case 'activate':
          // Call the bulk update function to activate patients
          success = await bulkUpdatePatients(selectedPatients, { isActive: true });
          if (success) {
            toast({
              title: "Pacientes activados",
              description: `${selectedPatients.length} pacientes han sido activados.`,
              duration: 3000,
            });
          } else {
            throw new Error('No se pudieron activar algunos pacientes');
          }
          break;

        case 'deactivate':
          // Call the bulk update function to deactivate patients
          success = await bulkUpdatePatients(selectedPatients, { isActive: false });
          if (success) {
            toast({
              title: "Pacientes desactivados",
              description: `${selectedPatients.length} pacientes han sido desactivados.`,
              duration: 3000,
            });
          } else {
            throw new Error('No se pudieron desactivar algunos pacientes');
          }
          break;
      }

      // Reload patients after bulk action
      await loadPatients(searchTerm);

    } catch (error) {
      console.error('Error executing bulk action:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo completar la acción. Inténtelo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsBulkActionLoading(false);
      setIsConfirmDialogOpen(false);
      setBulkActionType(null);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    // Just update the state, the useEffect will handle the filtering
    setStatusFilter(value as 'all' | 'active' | 'inactive');
    // No need to call loadPatients directly, as the useEffect will handle it
  };

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
        {/* Demo Mode Banner */}
        <DemoModeBanner className="mb-6" />

        {/* Header with title and create button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        </div>

        {/* Search and filter bar with view toggle */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar pacientes..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter dropdown - Simplified to avoid nesting Radix UI components */}
          <div className="flex items-center">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="flex items-center gap-2 min-w-[140px]">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => {
                setViewMode('grid');
                localStorage.setItem('patientsViewMode', 'grid');
              }}
              className="h-9 w-9"
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => {
                setViewMode('list');
                localStorage.setItem('patientsViewMode', 'list');
              }}
              className="h-9 w-9"
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk actions bar - appears when patients are selected */}
        {showBulkActions && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">
                {selectedPatients.length} {selectedPatients.length === 1 ? 'paciente' : 'pacientes'} seleccionado{selectedPatients.length !== 1 ? 's' : ''}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPatients([])}
                className="text-blue-700 hover:bg-blue-100"
              >
                <X className="h-4 w-4 mr-1" />
                Limpiar selección
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                className="bg-white"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                className="bg-white"
              >
                <UserX className="h-4 w-4 mr-1" />
                Desactivar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        )}

        {/* Patient list - Toggleable between grid and list view */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Pacientes</CardTitle>
            {viewMode === 'grid' && currentPatients.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={currentPatients.length > 0 && selectedPatients.length === currentPatients.length}
                  onCheckedChange={toggleSelectAll}
                  id="select-all-grid"
                />
                <label htmlFor="select-all-grid" className="text-sm cursor-pointer">
                  Seleccionar todos
                </label>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {patients.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentPatients.map((patient) => {
                    // Avatar initials
                    const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
                    // Status badge (active/inactive)
                    const statusColor = patient.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500';
                    const isSelected = selectedPatients.includes(patient.id);
                    return (
                      <div
                        key={patient.id}
                        className={`flex flex-col bg-white border rounded-lg shadow-sm p-4 transition hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50/30' : ''}`}
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => togglePatientSelection(patient.id)}
                              aria-label={`Seleccionar paciente ${formatPatientName(patient)}`}
                              className="mr-1"
                            />
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600" aria-label="Avatar">
                              {initials}
                            </div>
                          </div>
                          <div className="flex flex-col flex-1 ml-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg leading-tight truncate" title={formatPatientName(patient)}>{formatPatientName(patient)}</span>
                              {isDemo(patient.firstName) && <DemoBadge />}
                            </div>
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
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={currentPatients.length > 0 && selectedPatients.length === currentPatients.length}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Seleccionar todos los pacientes"
                          />
                        </TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Edad</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Sesiones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPatients.map((patient) => {
                        // Avatar initials
                        const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
                        const isSelected = selectedPatients.includes(patient.id);
                        return (
                          <TableRow
                            key={patient.id}
                            className={`hover:bg-muted/50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                          >
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => togglePatientSelection(patient.id)}
                                aria-label={`Seleccionar paciente ${formatPatientName(patient)}`}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600" aria-label="Avatar">
                                  {initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">{formatPatientName(patient)}</div>
                                    {isDemo(patient.firstName) && <DemoBadge />}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{patient.contactEmail}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.isActive ? "default" : "outline"} className={patient.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-100"}>
                                {patient.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{calculateAge(patient.dateOfBirth)} años</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{patient.contactEmail}</span>
                                </div>
                                {patient.contactPhone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{patient.contactPhone}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <PatientSessionSummary patientId={patient.id} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/patients/${patient.id}`}>Ver Detalles</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )
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

        {/* Confirmation Dialog for Bulk Actions - Using Radix UI Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={(open) => {
          setIsConfirmDialogOpen(open);
          if (!open) setBulkActionType(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {bulkActionType === 'delete' ? 'Eliminar pacientes' :
                 bulkActionType === 'activate' ? 'Activar pacientes' : 'Desactivar pacientes'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                {bulkActionType === 'delete' ?
                  `¿Está seguro de que desea eliminar ${selectedPatients.length} paciente${selectedPatients.length !== 1 ? 's' : ''}? Esta acción no se puede deshacer.` :
                  bulkActionType === 'activate' ?
                  `¿Está seguro de que desea activar ${selectedPatients.length} paciente${selectedPatients.length !== 1 ? 's' : ''}?` :
                  `¿Está seguro de que desea desactivar ${selectedPatients.length} paciente${selectedPatients.length !== 1 ? 's' : ''}?`}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setBulkActionType(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant={bulkActionType === 'delete' ? 'destructive' : 'default'}
                onClick={executeBulkAction}
                disabled={isBulkActionLoading}
              >
                {isBulkActionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : 'Confirmar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Patient Modal - Using Radix UI Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Nuevo Paciente</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-150px)]">
              <div className="p-4">
                <PatientForm
                  onSubmit={handleCreatePatient}
                  onCancel={() => setIsCreating(false)}
                  isEditing={false}
                />
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );


}
