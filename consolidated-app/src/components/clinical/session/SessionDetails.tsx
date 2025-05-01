'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  FileText,
  FileX,
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
// import { useRouter } from 'next/navigation';
import { SessionWithRelations } from './types';
import { SessionStatus } from '@prisma/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSessionSocket } from '@/hooks/useSessionSocket';
import { translateSessionType } from '@/lib/session-utils';

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
  const [expandedSections, setExpandedSections] = useState<{
    notes: boolean;
    objectives: boolean;
    activities: boolean;
    attachments: boolean;
  }>({ notes: true, objectives: true, activities: true, attachments: true });

  const expandAll = () => {
    setExpandedSections({
      notes: true,
      objectives: true,
      activities: true,
      attachments: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      notes: false,
      objectives: false,
      activities: false,
      attachments: false
    });
  };

  const toggleSection = (section: 'notes' | 'objectives' | 'activities' | 'attachments') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const { toast } = useToast();

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        // Fetch the actual session data from the API
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch session details');
        const data = await response.json();

        setSession(data);
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
      // Use the actual API endpoint
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete session');

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
      // Use the actual API endpoint
      const response = await fetch(`/api/sessions/${sessionId}/export?format=json`);
      if (!response.ok) throw new Error('Failed to export session');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

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

  // Handle transfer - Commented out as it's not currently used
  // const handleTransfer = () => {
  //   // In a real implementation, this would open a dialog to select a clinician
  //   toast({
  //     title: "Funcionalidad en desarrollo",
  //     description: "La transferencia de sesiones estará disponible próximamente.",
  //   });
  // };

  // Using the shared translateSessionType function from session-utils

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
      <Card className="w-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="bg-gray-50/70 rounded-lg p-4 border border-gray-100 h-24 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-16 bg-gray-100/80 rounded animate-pulse"></div>
                <div className="h-16 bg-gray-100/80 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="h-32 bg-gray-100/50 rounded-lg border border-gray-100 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-24 bg-gray-100/50 rounded-lg border border-gray-100 animate-pulse"></div>
              <div className="h-24 bg-gray-100/50 rounded-lg border border-gray-100 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !session) {
    return (
      <Card className="w-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-white border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <X className="h-5 w-5" />
            Error al cargar la sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-red-50/30 rounded-lg p-6 border border-red-100 flex flex-col items-center justify-center text-center">
            <div className="bg-white p-3 rounded-full shadow-sm mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-800">No se pudo cargar la sesión</h3>
            <p className="text-gray-600 mb-6">{error || 'No se encontró la sesión solicitada'}</p>
            <Button
              onClick={onBack}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              Volver a sesiones
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const createdDate = new Date(session.createdAt);

  return (
    <>
      <Card className="w-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="mr-2 hover:bg-white/50 hover:text-primary transition-colors"
                  aria-label="Volver"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary/10 text-primary">
                      {translateSessionType(session.type)}
                    </span>
                  </CardTitle>
                  {getStatusBadge(session.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Exportar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Eliminar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session metadata - Styled like accordion cards */}
          <div className="overflow-hidden hover:shadow-sm transition-shadow border border-gray-100 rounded-lg">
            <div className="bg-gradient-to-r from-indigo-50/70 to-indigo-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Participantes y detalles</h3>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column - People */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-md transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Paciente</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {session.patient ? `${session.patient.firstName} ${session.patient.lastName}` : 'Desconocido'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-md transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Profesional</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      {session.clinician ? `${session.clinician.firstName} ${session.clinician.lastName}` : 'Desconocido'}
                    </span>
                  </div>
                </div>

                {/* Right column - Session details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 hover:bg-gray-50/50 rounded-md transition-colors">
                      <p className="text-xs text-gray-500">Duración</p>
                      <p className="text-sm font-medium">
                        {session.activities && Array.isArray(session.activities)
                          ? session.activities.reduce((total: number, activity: any) => total + (activity.duration || 0), 0)
                          : 0} minutos
                      </p>
                    </div>
                    <div className="p-2 hover:bg-gray-50/50 rounded-md transition-colors">
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="text-sm font-medium">
                        {createdDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global controls */}
          <div className="flex justify-end mb-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAll}
                className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Expandir todo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAll}
                className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
              >
                Contraer todo
              </Button>
            </div>
          </div>

          {/* Accordion sections container */}
          <div className="accordion-container border border-gray-100 rounded-lg overflow-hidden divide-y-0 divide-gray-100">

          {/* Notes Card */}
          <div className="overflow-hidden hover:shadow-sm transition-shadow">
            <div
              className="bg-gradient-to-r from-blue-50/70 to-blue-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('notes')}
            >
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Notas clínicas</h3>
                  <p className="text-xs text-gray-500">{session.notes ? `${session.notes.substring(0, 30)}${session.notes.length > 30 ? '...' : ''}` : 'Sin notas'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${expandedSections.notes ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {expandedSections.notes ? 'Mostrando' : 'Ver notas'}
                </span>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${expandedSections.notes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                  {expandedSections.notes ? (
                    <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                  ) : (
                    <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                  )}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                expandedSections.notes ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
              )}>
                <div className="p-4 bg-white">
                  {session.notes ? (
                    <div className="bg-gray-50/50 p-4 rounded-md border border-gray-100">
                      <p className="text-sm leading-relaxed whitespace-pre-line text-gray-800">{session.notes}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50/50 p-4 rounded-md border border-gray-100 flex flex-col items-center justify-center text-center">
                      <FileX className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No hay notas clínicas para esta sesión.</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={onEdit}>
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Añadir notas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* Content cards with expandable sections */}
            {/* Objectives card */}
            {session.objectives && Array.isArray(session.objectives) && session.objectives.length > 0 && (
              <div className="overflow-hidden hover:shadow-sm transition-shadow border-t border-gray-100">
                <div
                  className="bg-gradient-to-r from-green-50/70 to-green-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('objectives')}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Tag className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Objetivos</h3>
                      <p className="text-xs text-gray-500">
                        {Array.isArray(session.objectives)
                          ? `${session.objectives.filter((o: any) => o.completed).length} de ${session.objectives.length} completados`
                          : '0 de 0 completados'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expandedSections.objectives ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {expandedSections.objectives ? 'Mostrando' : 'Ver todos'}
                    </span>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${expandedSections.objectives ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {expandedSections.objectives ? (
                        <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                      ) : (
                        <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                    expandedSections.objectives ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                  )}>
                    <div className="p-4 bg-white">
                      <div className="bg-gray-50/50 rounded-md border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                          {Array.isArray(session.objectives) && session.objectives.map((objective: any, index: number) => (
                            <li key={index} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${objective.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                  {objective.completed ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  ) : (
                                    <Clock className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{objective.title}</p>
                                  {objective.description && (
                                    <p className="text-xs text-gray-500 mt-1">{objective.description}</p>
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
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
              </div>
            )}

            {/* Activities card */}
            {session.activities && Array.isArray(session.activities) && session.activities.length > 0 && (
              <div className="overflow-hidden hover:shadow-sm transition-shadow border-t border-gray-100">
                <div
                  className="bg-gradient-to-r from-purple-50/70 to-purple-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('activities')}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Actividades</h3>
                      <p className="text-xs text-gray-500">
                        {Array.isArray(session.activities)
                          ? `${session.activities.filter((a: any) => a.completed).length} de ${session.activities.length} completadas`
                          : '0 de 0 completadas'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expandedSections.activities ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {expandedSections.activities ? 'Mostrando' : 'Ver todas'}
                    </span>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${expandedSections.activities ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                      {expandedSections.activities ? (
                        <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                      ) : (
                        <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                    expandedSections.activities ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                  )}>
                    <div className="p-4 bg-white">
                      <div className="bg-gray-50/50 rounded-md border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                          {Array.isArray(session.activities) && session.activities.map((activity: any, index: number) => (
                            <li key={index} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activity.completed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                  {activity.completed ? (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  ) : (
                                    <Clock className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{activity.title}</p>
                                  {activity.description && (
                                    <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                                  )}
                                </div>
                                {activity.duration && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-600">
                                    {activity.duration} min
                                  </Badge>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
              </div>
            )}

            {/* Attachments card */}
            {session.attachments && Array.isArray(session.attachments) && session.attachments.length > 0 && (
              <div className="overflow-hidden hover:shadow-sm transition-shadow border-t border-gray-100">
                <div
                  className="bg-gradient-to-r from-amber-50/70 to-amber-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('attachments')}
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Paperclip className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Archivos adjuntos</h3>
                      <p className="text-xs text-gray-500">
                        {Array.isArray(session.attachments) ? session.attachments.length : 0} archivos disponibles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expandedSections.attachments ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {expandedSections.attachments ? 'Mostrando' : 'Ver todos'}
                    </span>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${expandedSections.attachments ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                      {expandedSections.attachments ? (
                        <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                      ) : (
                        <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                    expandedSections.attachments ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                  )}>
                    <div className="p-4 bg-white">
                      <div className="bg-gray-50/50 rounded-md border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                          {Array.isArray(session.attachments) && session.attachments.map((attachment: any, index: number) => (
                            <li key={index} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{attachment.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Subido el {new Date(attachment.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 rounded-full">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
              </div>
            )}
          </div>
          {/* End of accordion container */}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-4 pb-4 bg-gray-50/30">
          <Button
            variant="ghost"
            onClick={onBack}
            className="hover:bg-white hover:text-gray-700 transition-colors"
          >
            Volver
          </Button>
          <Button
            variant="default"
            onClick={onEdit}
            className="bg-primary hover:bg-primary/90 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar sesión
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
