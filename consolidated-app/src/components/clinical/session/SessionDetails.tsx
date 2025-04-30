'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Tag, 
  CheckCircle, 
  Edit, 
  Trash2, 
  ArrowRightLeft, 
  Download, 
  X, 
  Paperclip,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { SessionWithRelations } from './types';
import { SessionStatus } from '@prisma/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSessionSocket } from '@/hooks/useSessionSocket';

interface SessionDetailsProps {
  sessionId: string;
  onEdit?: () => void;
  onBack?: () => void;
  onDelete?: () => void;
}

const SessionDetails: React.FC<SessionDetailsProps> = ({ 
  sessionId, 
  onEdit, 
  onBack,
  onDelete
}) => {
  const [session, setSession] = useState<SessionWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would be:
        // const response = await fetch(`/api/sessions/${sessionId}`);
        // if (!response.ok) throw new Error('Failed to fetch session details');
        // const data = await response.json();
        
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Mock session data
        const mockSession: SessionWithRelations = {
          id: sessionId,
          patientId: '101',
          clinicianId: '201',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: 'Evaluación inicial',
          notes: 'El paciente presenta síntomas de ansiedad moderada. Se observa tensión muscular y preocupación excesiva por situaciones cotidianas. Reporta dificultades para conciliar el sueño y concentrarse en el trabajo.',
          objectives: [
            { title: 'Evaluar nivel de ansiedad', completed: true, priority: 'high' },
            { title: 'Identificar factores desencadenantes', completed: true, priority: 'medium' },
            { title: 'Establecer plan de tratamiento inicial', completed: false, priority: 'high' }
          ],
          activities: [
            { title: 'Entrevista clínica estructurada', duration: 30, completed: true },
            { title: 'Aplicación de escala de ansiedad de Beck', duration: 15, completed: true },
            { title: 'Técnica de respiración diafragmática', duration: 10, completed: true }
          ],
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
        };
        
        setSession(mockSession);
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('No se pudo cargar los detalles de la sesión');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  // Subscribe to real-time updates
  useSessionSocket({
    sessionId,
    onUpdate: (data) => {
      setSession(prev => ({ ...prev, ...data } as SessionWithRelations));
    },
    onDelete: () => {
      toast({
        title: "Sesión eliminada",
        description: "Esta sesión ha sido eliminada por otro usuario.",
        variant: "destructive",
      });
      onBack?.();
    }
  });

  // Handle delete
  const handleDelete = async () => {
    try {
      // In a real implementation, this would be:
      // const response = await fetch(`/api/sessions/${sessionId}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Failed to delete session');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada exitosamente.",
      });
      
      if (onDelete) {
        onDelete();
      } else {
        onBack?.();
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      toast({
        title: "Error",
        description: "No se pudo eliminar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      // In a real implementation, this would be:
      // const response = await fetch(`/api/sessions/${sessionId}/export?format=json`);
      // if (!response.ok) throw new Error('Failed to export session');
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `session-${sessionId}.json`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sesión exportada",
        description: "La sesión ha sido exportada exitosamente.",
      });
    } catch (err) {
      console.error('Error exporting session:', err);
      toast({
        title: "Error",
        description: "No se pudo exportar la sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Handle transfer
  const handleTransfer = () => {
    // In a real implementation, this would open a dialog to select a clinician
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La transferencia de sesiones estará disponible próximamente.",
    });
  };

  // Render status badge
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

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !session) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col justify-center items-center h-64">
            <X className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar la sesión</h3>
            <p className="text-muted-foreground mb-4">{error || 'No se encontró la sesión solicitada'}</p>
            <Button onClick={onBack}>Volver</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const createdDate = new Date(session.createdAt);

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onBack} 
                  className="mr-2"
                  aria-label="Volver"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <CardTitle className="text-xl">Detalles de la sesión</CardTitle>
                <CardDescription>
                  {session.type} - {createdDate.toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                className="text-xs"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEdit}
                className="text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Paciente</p>
                <p className="text-sm text-muted-foreground">
                  {session.patient ? `${session.patient.firstName} ${session.patient.lastName}` : 'Desconocido'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Profesional</p>
                <p className="text-sm text-muted-foreground">
                  {session.clinician ? `${session.clinician.firstName} ${session.clinician.lastName}` : 'Desconocido'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Fecha y hora</p>
                <p className="text-sm text-muted-foreground">
                  {createdDate.toLocaleDateString()} - {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Tipo</p>
                <p className="text-sm text-muted-foreground">{session.type}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Estado</p>
                <div className="mt-1">{getStatusBadge(session.status)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Duración</p>
                <p className="text-sm text-muted-foreground">
                  {session.activities && session.activities.reduce((total, activity) => total + (activity.duration || 0), 0)} minutos
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Session notes */}
          <div className="space-y-2">
            <h3 className="text-md font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Notas clínicas
            </h3>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm whitespace-pre-line">{session.notes}</p>
            </div>
          </div>

          {/* Session objectives */}
          {session.objectives && session.objectives.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-md font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-500" />
                Objetivos
              </h3>
              <div className="space-y-2">
                {session.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${objective.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {objective.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{objective.title}</p>
                      {objective.description && (
                        <p className="text-xs text-muted-foreground mt-1">{objective.description}</p>
                      )}
                    </div>
                    {objective.priority && (
                      <Badge variant="outline" className={
                        objective.priority === 'high' ? 'bg-red-50 text-red-600' :
                        objective.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }>
                        {objective.priority === 'high' ? 'Alta' :
                         objective.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session activities */}
          {session.activities && session.activities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-md font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Actividades
              </h3>
              <div className="space-y-2">
                {session.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${activity.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      {activity.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                      )}
                    </div>
                    {activity.duration && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-600">
                        {activity.duration} min
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {session.attachments && session.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-md font-medium flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-amber-500" />
                Archivos adjuntos
              </h3>
              <div className="space-y-2">
                {session.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Subido el {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button variant="outline" onClick={handleTransfer}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transferir
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionDetails;
