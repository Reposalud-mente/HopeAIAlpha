import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus } from "lucide-react";
import SessionCreation from "./SessionCreation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Session, SessionWithRelations } from "./types";
import { SessionStatus } from "@prisma/client";

// Interface for the session data displayed in the UI
// This will be derived from the Prisma Session model
interface SessionData {
  id: string;
  date: string; // Derived from createdAt
  time: string; // Derived from createdAt
  duration: string; // Not in Prisma model, could be calculated or stored in activities
  type: string;
  provider: string; // Derived from clinician relation
  status: SessionStatus;
  notes?: string;
}

interface PatientSessionsProps {
  patientId: string;
  patientName: string;
  onSelectSession?: (session: SessionWithRelations) => void;
}

const PatientSessions = ({ patientId, patientName, onSelectSession }: PatientSessionsProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [sessions, setSessions] = useState<SessionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sessions from the API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/patients/${patientId}/sessions`);
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchSessions();
    }
  }, [patientId]);

  // Transform SessionWithRelations to SessionData for UI display
  const transformedSessions: SessionData[] = sessions.map(session => {
    const createdDate = new Date(session.createdAt);
    return {
      id: session.id,
      date: createdDate.toLocaleDateString(),
      time: createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '30 min', // Default duration or calculate from activities if available
      type: session.type,
      provider: session.clinician ?
        `${session.clinician.firstName} ${session.clinician.lastName}` :
        'Unknown Provider',
      status: session.status,
      notes: session.notes || undefined
    };
  });

  // Handle session selection
  const handleSelectSession = (sessionData: SessionData) => {
    // Find the original session with all data
    const fullSession = sessions.find(s => s.id === sessionData.id);
    if (fullSession && onSelectSession) {
      onSelectSession(fullSession);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <CardTitle>Sesiones para {patientName}</CardTitle>
            <CardDescription>Todas las sesiones clínicas para este paciente.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Cargando sesiones...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-red-500">
                    {error}
                  </TableCell>
                </TableRow>
              ) : transformedSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                    <Calendar className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-gray-800">No hay sesiones</h3>
                    <p className="text-gray-500 mb-6">Este paciente aún no tiene sesiones registradas.</p>
                    <Button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Sesión
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {transformedSessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          {session.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-muted-foreground" />
                          {session.time}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {session.type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          session.status === SessionStatus.COMPLETED
                            ? "default"
                            : session.status === SessionStatus.SCHEDULED
                            ? "secondary"
                            : session.status === SessionStatus.CANCELLED
                            ? "destructive"
                            : session.status === SessionStatus.NO_SHOW
                            ? "outline"
                            : session.status === SessionStatus.IN_PROGRESS
                            ? "secondary"
                            : session.status === SessionStatus.TRANSFERRED
                            ? "outline"
                            : "outline"
                        }>
                          {session.status === SessionStatus.COMPLETED ? "Completada" :
                           session.status === SessionStatus.SCHEDULED ? "Programada" :
                           session.status === SessionStatus.CANCELLED ? "Cancelada" :
                           session.status === SessionStatus.NO_SHOW ? "No asistió" :
                           session.status === SessionStatus.IN_PROGRESS ? "En progreso" :
                           session.status === SessionStatus.TRANSFERRED ? "Transferida" :
                           session.status === SessionStatus.DRAFT ? "Borrador" :
                           session.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectSession(session)}
                        >
                          Ver detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 border-t border-dashed border-gray-200">
                      <Button
                        onClick={() => setShowCreate(true)}
                        variant="outline"
                        size="sm"
                        className="mt-2 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar nueva sesión
                      </Button>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
              <div className="max-w-3xl w-full">
                <SessionCreation
                  patientId={patientId}
                  patientName={patientName}
                  onSubmit={() => {
                    setShowCreate(false);
                    // Refresh the sessions list after creation
                    const fetchSessions = async () => {
                      try {
                        setLoading(true);
                        const response = await fetch(`/api/patients/${patientId}/sessions`);
                        if (!response.ok) {
                          throw new Error('Failed to fetch sessions');
                        }
                        const data = await response.json();
                        setSessions(data);
                      } catch (err) {
                        console.error('Error fetching sessions:', err);
                        setError('Failed to load sessions');
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchSessions();
                  }}
                  onCancel={() => setShowCreate(false)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export default PatientSessions;
