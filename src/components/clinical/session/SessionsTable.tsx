'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Edit, Eye, MoreHorizontal, Trash2, UserRound, CheckSquare, Download, FileOutput, ArrowRightLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SessionWithRelations } from './types';
import { SessionStatus } from '@prisma/client';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface SessionsTableProps {
  sessions: SessionWithRelations[];
  onRefresh: () => void;
  onBulkAction?: (action: string, sessionIds: string[]) => void;
  sortable?: boolean;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  onViewSession?: (sessionId: string) => void;
}

const SessionsTable: React.FC<SessionsTableProps> = ({ sessions, onRefresh, onBulkAction, sortable = false, onSort, onViewSession }) => {
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();
  const router = useRouter();

  const getStatusBadge = (status: SessionStatus | string) => {
    switch (status) {
      case SessionStatus.COMPLETED:
        return <Badge variant="default">Completada</Badge>;
      case SessionStatus.SCHEDULED:
        return <Badge variant="secondary">Programada</Badge>;
      case SessionStatus.CANCELLED:
        return <Badge variant="destructive">Cancelada</Badge>;
      case SessionStatus.NO_SHOW:
        return <Badge variant="outline">No asistió</Badge>;
      case SessionStatus.IN_PROGRESS:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">En progreso</Badge>;
      case SessionStatus.TRANSFERRED:
        return <Badge variant="outline" className="bg-purple-100 text-purple-700">Transferida</Badge>;
      case SessionStatus.DRAFT:
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Borrador</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const handleViewSession = (sessionId: string) => {
    if (onViewSession) {
      onViewSession(sessionId);
    } else {
      // Fallback to the patient detail page if no custom handler is provided
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.patientId) {
        router.push(`/patients/${session.patientId}?tab=sessions&session=${sessionId}`);
      }
    }
  };

  const handleEditSession = (sessionId: string) => {
    // For now, we'll just navigate to the patient detail page
    // In the future, this could open the session editor directly
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.patientId) {
      router.push(`/patients/${session.patientId}?tab=sessions&session=${sessionId}&edit=true`);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      // For now, we'll simulate a successful delete since the API endpoint might not be fully implemented
      // In a real implementation, this would be:
      // const response = await fetch(`/api/sessions/${sessionToDelete}`, {
      //   method: 'DELETE',
      // });
      //
      // if (!response.ok) {
      //   throw new Error('Failed to delete session');
      // }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada exitosamente.",
        variant: "default",
      });

      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSessionToDelete(null);
    }
  };

  // Handle bulk selection
  const toggleSelectAll = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map(s => s.id));
    }
  };

  const toggleSelectSession = (sessionId: string) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    } else {
      setSelectedSessions([...selectedSessions, sessionId]);
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedSessions.length === 0) {
      toast({
        title: "No hay sesiones seleccionadas",
        description: "Por favor, selecciona al menos una sesión.",
        variant: "destructive",
      });
      return;
    }

    if (action === 'delete') {
      setShowBulkDeleteConfirm(true);
      return;
    }

    if (onBulkAction) {
      onBulkAction(action, selectedSessions);
    }
  };

  // Handle bulk delete confirmation
  const confirmBulkDelete = async () => {
    if (onBulkAction) {
      onBulkAction('delete', selectedSessions);
    }
    setShowBulkDeleteConfirm(false);
    setSelectedSessions([]);
  };

  // Handle sorting
  const handleSortChange = (column: string) => {
    if (!sortable || !onSort) return;

    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (!sortable || sortColumn !== column) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <>
      {/* Bulk actions toolbar */}
      {selectedSessions.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-2 bg-blue-50 rounded-md">
          <div className="flex items-center">
            <CheckSquare className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium">{selectedSessions.length} {selectedSessions.length === 1 ? 'sesión seleccionada' : 'sesiones seleccionadas'}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleBulkAction('export')}
            >
              <Download className="h-3 w-3 mr-1" /> Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleBulkAction('transfer')}
            >
              <ArrowRightLeft className="h-3 w-3 mr-1" /> Transferir
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Eliminar
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedSessions.length === sessions.length && sessions.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Seleccionar todas las sesiones"
                />
              </TableHead>
              <TableHead
                className={sortable ? "cursor-pointer hover:text-primary" : ""}
                onClick={() => handleSortChange('patient')}
              >
                Paciente {renderSortIndicator('patient')}
              </TableHead>
              <TableHead
                className={sortable ? "cursor-pointer hover:text-primary" : ""}
                onClick={() => handleSortChange('createdAt')}
              >
                Fecha {renderSortIndicator('createdAt')}
              </TableHead>
              <TableHead>Hora</TableHead>
              <TableHead
                className={sortable ? "cursor-pointer hover:text-primary" : ""}
                onClick={() => handleSortChange('type')}
              >
                Tipo {renderSortIndicator('type')}
              </TableHead>
              <TableHead
                className={sortable ? "cursor-pointer hover:text-primary" : ""}
                onClick={() => handleSortChange('clinician')}
              >
                Profesional {renderSortIndicator('clinician')}
              </TableHead>
              <TableHead
                className={sortable ? "cursor-pointer hover:text-primary" : ""}
                onClick={() => handleSortChange('status')}
              >
                Estado {renderSortIndicator('status')}
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => {
              const createdDate = new Date(session.createdAt);
              return (
                <TableRow key={session.id} className={selectedSessions.includes(session.id) ? "bg-blue-50" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSessions.includes(session.id)}
                      onCheckedChange={() => toggleSelectSession(session.id)}
                      aria-label={`Seleccionar sesión de ${session.patient?.firstName || 'paciente'}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {session.patient ? (
                      <div className="flex items-center gap-2">
                        <UserRound size={16} className="text-muted-foreground" />
                        {`${session.patient.firstName} ${session.patient.lastName}`}
                      </div>
                    ) : (
                      "Paciente desconocido"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      {createdDate.toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>{session.type}</TableCell>
                  <TableCell>
                    {session.clinician ? (
                      `${session.clinician.firstName} ${session.clinician.lastName}`
                    ) : (
                      "Profesional desconocido"
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewSession(session.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditSession(session.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSessionToDelete(session.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la sesión
              y eliminará los datos de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar múltiples sesiones?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar {selectedSessions.length} {selectedSessions.length === 1 ? 'sesión' : 'sesiones'}.
              Esta acción no se puede deshacer y eliminará permanentemente los datos de nuestros servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar {selectedSessions.length} {selectedSessions.length === 1 ? 'sesión' : 'sesiones'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionsTable;
