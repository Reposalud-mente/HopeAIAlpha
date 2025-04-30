'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Search, RefreshCw, Filter as FilterIcon, SlidersHorizontal, UserRound } from 'lucide-react';
import { PatientSelector } from '@/components/clinical/patient/PatientSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SessionWithRelations } from './types';
import SessionsTable from './SessionsTable';
import SessionCreation from './SessionCreation';
import SessionDetails from './SessionDetails';
import SessionFilters, { SessionFilters as SessionFiltersType } from './SessionFilters';
import { SessionFormData } from '@/lib/validations/session-form';
import { useToast } from '@/components/ui/use-toast';
import { useSessionSocket } from '@/hooks/useSessionSocket';
import { SessionStatus } from '@prisma/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

const SessionsPage: React.FC = () => {
  // State for sessions data
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for UI controls
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // State for patient selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');

  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for filters
  const [filters, setFilters] = useState<SessionFiltersType>({
    status: [],
    type: [],
  });

  const { toast } = useToast();

  // Fetch all sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      // For now, we'll use mock data since the API endpoint might not be fully implemented
      // In a real implementation, this would be:
      // const response = await fetch('/api/sessions');
      // if (!response.ok) {
      //   throw new Error('Failed to fetch sessions');
      // }
      // const data = await response.json();

      // Mock data for testing
      const mockData: SessionWithRelations[] = [
        {
          id: '1',
          patientId: '101',
          clinicianId: '201',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: 'Evaluación inicial',
          notes: 'Primera sesión con el paciente',
          status: 'COMPLETED',
          patient: {
            id: '101',
            firstName: 'Juan',
            lastName: 'Pérez',
            email: 'juan@example.com',
          },
          clinician: {
            id: '201',
            firstName: 'Dr. Carlos',
            lastName: 'Rivera',
            email: 'carlos@example.com',
          }
        },
        {
          id: '2',
          patientId: '102',
          clinicianId: '201',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'Sesión terapéutica',
          notes: 'Seguimiento de terapia cognitivo-conductual',
          status: 'SCHEDULED',
          patient: {
            id: '102',
            firstName: 'María',
            lastName: 'González',
            email: 'maria@example.com',
          },
          clinician: {
            id: '201',
            firstName: 'Dr. Carlos',
            lastName: 'Rivera',
            email: 'carlos@example.com',
          }
        },
        {
          id: '3',
          patientId: '103',
          clinicianId: '202',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          type: 'Consulta',
          notes: 'Consulta breve sobre medicación',
          status: 'CANCELLED',
          patient: {
            id: '103',
            firstName: 'Pedro',
            lastName: 'Sánchez',
            email: 'pedro@example.com',
          },
          clinician: {
            id: '202',
            firstName: 'Dra. Ana',
            lastName: 'Martínez',
            email: 'ana@example.com',
          }
        }
      ];

      setSessions(mockData);
      setFilteredSessions(mockData);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('No se pudieron cargar las sesiones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Subscribe to real-time session updates
  useSessionSocket({
    sessionId: 'all', // Special value to listen for all session updates
    onUpdate: (data) => {
      if (!data || !data.id) return;

      setSessions(prev => {
        const index = prev.findIndex(s => s.id === data.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data };
          return updated;
        }
        return prev;
      });
    },
    onDelete: (data) => {
      if (!data || !data.id) return;

      setSessions(prev => prev.filter(s => s.id !== data.id));

      if (selectedSessionId === data.id) {
        setSelectedSessionId(null);
        setShowDetails(false);
        toast({
          title: "Sesión eliminada",
          description: "La sesión que estabas viendo ha sido eliminada.",
        });
      }
    },
  });

  // Apply filters and search
  useEffect(() => {
    let result = [...sessions];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(session => {
        const patientName = session.patient
          ? `${session.patient.firstName} ${session.patient.lastName}`.toLowerCase()
          : '';
        const clinicianName = session.clinician
          ? `${session.clinician.firstName} ${session.clinician.lastName}`.toLowerCase()
          : '';
        const sessionType = session.type.toLowerCase();
        const sessionStatus = session.status.toLowerCase();

        return patientName.includes(query) ||
               clinicianName.includes(query) ||
               sessionType.includes(query) ||
               sessionStatus.includes(query);
      });
    }

    // Apply filters
    if (filters.dateFrom) {
      result = result.filter(session => new Date(session.createdAt) >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      result = result.filter(session => new Date(session.createdAt) <= filters.dateTo!);
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter(session => filters.status!.includes(session.status as SessionStatus));
    }

    if (filters.type && filters.type.length > 0) {
      result = result.filter(session => filters.type!.includes(session.type));
    }

    if (filters.clinicianId && filters.clinicianId.length > 0) {
      result = result.filter(session => filters.clinicianId!.includes(session.clinicianId));
    }

    if (filters.patientId && filters.patientId.length > 0) {
      result = result.filter(session => filters.patientId!.includes(session.patientId));
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      switch (sortColumn) {
        case 'patient':
          valueA = a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '';
          valueB = b.patient ? `${b.patient.firstName} ${b.patient.lastName}` : '';
          break;
        case 'clinician':
          valueA = a.clinician ? `${a.clinician.firstName} ${a.clinician.lastName}` : '';
          valueB = b.clinician ? `${b.clinician.firstName} ${b.clinician.lastName}` : '';
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredSessions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, sessions, filters, sortColumn, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle session creation
  const handleCreateSession = async (formData: SessionFormData) => {
    try {
      // This would typically include API call to create session
      // For now, we'll just close the modal and refresh the list
      setShowCreate(false);
      setSelectedPatientId(''); // Reset selected patient
      setSelectedPatientName('');

      toast({
        title: "Sesión creada",
        description: "La sesión ha sido creada exitosamente.",
        variant: "default",
      });
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Handle session update
  const handleUpdateSession = async (formData: SessionFormData) => {
    try {
      // This would typically include API call to update session
      setEditMode(false);
      setShowDetails(true);
      toast({
        title: "Sesión actualizada",
        description: "La sesión ha sido actualizada exitosamente.",
        variant: "default",
      });
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Handle session selection
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setShowDetails(true);
    setEditMode(false);
  };

  // Handle session edit
  const handleEditSession = () => {
    setEditMode(true);
    setShowDetails(false);
  };

  // Handle session deletion
  const handleDeleteSession = async () => {
    try {
      // This would typically include API call to delete session
      setShowDetails(false);
      setSelectedSessionId(null);
      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada exitosamente.",
        variant: "default",
      });
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patientId: string, patientName: string) => {
    console.log('Patient selected:', patientId, patientName);
    setSelectedPatientId(patientId);
    setSelectedPatientName(patientName);

    // Optionally fetch sessions for this patient
    if (patientId) {
      // In a real implementation, we would fetch sessions for this patient
      // For now, we'll just filter the mock data
      const patientSessions = sessions.filter(session => session.patientId === patientId);
      setFilteredSessions(patientSessions);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, sessionIds: string[]) => {
    try {
      // This would typically include API calls for bulk actions
      if (action === 'delete') {
        // Delete multiple sessions
        toast({
          title: "Sesiones eliminadas",
          description: `${sessionIds.length} sesiones han sido eliminadas exitosamente.`,
          variant: "default",
        });
      } else if (action === 'export') {
        // Export multiple sessions
        toast({
          title: "Sesiones exportadas",
          description: `${sessionIds.length} sesiones han sido exportadas exitosamente.`,
          variant: "default",
        });
      } else if (action === 'transfer') {
        // Transfer multiple sessions
        toast({
          title: "Funcionalidad en desarrollo",
          description: "La transferencia de múltiples sesiones estará disponible próximamente.",
          variant: "default",
        });
      }

      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error(`Error performing bulk action ${action}:`, error);
      toast({
        title: "Error",
        description: `No se pudo completar la acción. Por favor, intenta de nuevo.`,
        variant: "destructive",
      });
    }
  };

  // Handle sorting
  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: SessionFiltersType) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: [],
      type: [],
    });
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración de Sesiones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas las sesiones terapéuticas de tus pacientes
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="md:w-auto w-full">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Sesiones</CardTitle>
              <CardDescription>
                {filteredSessions.length} sesiones encontradas
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar sesiones..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <SessionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                sessionTypes={['Evaluación inicial', 'Seguimiento', 'Sesión terapéutica', 'Consulta', 'Intervención en crisis']}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={fetchSessions}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchSessions}
              >
                Reintentar
              </Button>
            </div>
          ) : loading && sessions.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando sesiones...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay sesiones</h3>
              <p className="text-muted-foreground mb-6">
                No se encontraron sesiones con los criterios de búsqueda actuales.
              </p>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Sesión
              </Button>
            </div>
          ) : (
            <>
              <SessionsTable
                sessions={currentItems}
                onRefresh={fetchSessions}
                onBulkAction={handleBulkAction}
                sortable={true}
                onSort={handleSort}
                onViewSession={handleSelectSession}
              />

              {/* Simple Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Creation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full">
            {selectedPatientId ? (
              <SessionCreation
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                onSubmit={handleCreateSession}
                onCancel={() => {
                  setShowCreate(false);
                  setSelectedPatientId('');
                  setSelectedPatientName('');
                }}
              />
            ) : (
              <Card className="bg-white dark:bg-gray-950 shadow-xl">
                <CardHeader>
                  <CardTitle>Seleccionar Paciente</CardTitle>
                  <CardDescription>
                    {selectedPatientId ? (
                      <span className="text-green-600 font-medium">
                        Paciente seleccionado: {selectedPatientName}
                      </span>
                    ) : (
                      'Selecciona un paciente para crear una nueva sesión'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PatientSelector onSelectPatient={handlePatientSelect} />

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={() => {
                      setShowCreate(false);
                      setSelectedPatientId('');
                      setSelectedPatientName('');
                    }} className="mr-2">
                      Cancelar
                    </Button>

                    {selectedPatientId && (
                      <Button
                        onClick={() => {
                          // Force re-render with the selected patient
                          const patientId = selectedPatientId;
                          const patientName = selectedPatientName;
                          setSelectedPatientId('');
                          setTimeout(() => {
                            setSelectedPatientId(patientId);
                            setSelectedPatientName(patientName);
                          }, 0);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Continuar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Session Details Sheet */}
      <Sheet open={showDetails} onOpenChange={setShowDetails}>
        <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl overflow-y-auto" side="right">
          {selectedSessionId && (
            <SessionDetails
              sessionId={selectedSessionId}
              onEdit={handleEditSession}
              onBack={() => setShowDetails(false)}
              onDelete={handleDeleteSession}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Session Edit Modal */}
      {editMode && selectedSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full">
            <SessionCreation
              patientId={sessions.find(s => s.id === selectedSessionId)?.patientId || ""}
              patientName={sessions.find(s => s.id === selectedSessionId)?.patient ?
                `${sessions.find(s => s.id === selectedSessionId)?.patient.firstName} ${sessions.find(s => s.id === selectedSessionId)?.patient.lastName}` : ""}
              onSubmit={handleUpdateSession}
              onCancel={() => {
                setEditMode(false);
                setShowDetails(true);
              }}
              initialData={{
                // In a real implementation, we would fetch the session data
                // For now, we'll use placeholder data
                type: 'initial_assessment',
                status: 'completed',
                notes: 'Notas de la sesión',
                objectives: 'Objetivos de la sesión',
                activities: 'Actividades realizadas',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
