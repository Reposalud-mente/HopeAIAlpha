'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft,
  Search,
  Filter,
  HelpCircle,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  CalendarCheck,
  Ban,
  Loader,
  FileUp,
  Info,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { useRouter } from 'next/navigation';
import { SessionWithRelations, SessionObjective, SessionActivity, SessionAttachment } from './types';
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

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  itemId: string; // ID of the objective or activity this comment belongs to
  itemType: 'objective' | 'activity';
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
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    notes: boolean;
    objectives: boolean;
    activities: boolean;
    attachments: boolean;
    help: boolean;
  }>({ notes: true, objectives: true, activities: true, attachments: true, help: false });
  
  // Search and filter states
  const [objectivesFilter, setObjectivesFilter] = useState('');
  const [activitiesFilter, setActivitiesFilter] = useState('');
  const [attachmentsFilter, setAttachmentsFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentingOn, setCommentingOn] = useState<{id: string, type: 'objective' | 'activity'} | null>(null);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Selected items for bulk actions
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);

  const expandAll = () => {
    setExpandedSections({
      notes: true,
      objectives: true,
      activities: true,
      attachments: true,
      help: true
    });
  };

  const collapseAll = () => {
    setExpandedSections({
      notes: false,
      objectives: false,
      activities: false,
      attachments: false,
      help: false
    });
  };

  const toggleSection = (section: 'notes' | 'objectives' | 'activities' | 'attachments' | 'help') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  // Cache session data locally
  useEffect(() => {
    if (session) {
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(session));
    }
  }, [session, sessionId]);

  // Filter functions
  const filterObjectives = useCallback(() => {
    if (!session?.objectives) return [];
    
    return (session.objectives as SessionObjective[]).filter(objective => {
      const matchesText = objective.title.toLowerCase().includes(objectivesFilter.toLowerCase()) || 
                         (objective.description || '').toLowerCase().includes(objectivesFilter.toLowerCase());
      
      if (statusFilter === 'all') return matchesText;
      if (statusFilter === 'completed') return matchesText && objective.completed === true;
      if (statusFilter === 'pending') return matchesText && objective.completed !== true;
      
      return matchesText;
    });
  }, [session?.objectives, objectivesFilter, statusFilter]);

  const filterActivities = useCallback(() => {
    if (!session?.activities) return [];
    
    return (session.activities as SessionActivity[]).filter(activity => {
      const matchesText = activity.title.toLowerCase().includes(activitiesFilter.toLowerCase()) || 
                         (activity.description || '').toLowerCase().includes(activitiesFilter.toLowerCase());
      
      if (statusFilter === 'all') return matchesText;
      if (statusFilter === 'completed') return matchesText && activity.completed === true;
      if (statusFilter === 'pending') return matchesText && activity.completed !== true;
      
      return matchesText;
    });
  }, [session?.activities, activitiesFilter, statusFilter]);

  const filterAttachments = useCallback(() => {
    if (!session?.attachments) return [];
    
    return (session.attachments as SessionAttachment[]).filter(attachment => {
      return attachment.name.toLowerCase().includes(attachmentsFilter.toLowerCase()) || 
             attachment.type.toLowerCase().includes(attachmentsFilter.toLowerCase());
    });
  }, [session?.attachments, attachmentsFilter]);

  // Comment functions
  const addComment = (itemId: string, itemType: 'objective' | 'activity') => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `comment_${Date.now()}`,
      text: newComment,
      author: session?.clinician ? `${session.clinician.firstName} ${session.clinician.lastName}` : 'Usuario',
      createdAt: new Date().toISOString(),
      itemId,
      itemType
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
    setCommentingOn(null);
    
    toast({
      title: "Comentario añadido",
      description: "Tu comentario ha sido añadido exitosamente.",
    });
  };

  const getCommentsForItem = (itemId: string) => {
    return comments.filter(comment => comment.itemId === itemId);
  };

  // File handling functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // In a real implementation, this would upload the files to a server
    // For now, we'll just simulate adding them to the session
    const newAttachments: SessionAttachment[] = Array.from(files).map(file => ({
      id: `attachment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }));
    
    setSession(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments]
      };
    });
    
    toast({
      title: "Archivos adjuntos",
      description: `${files.length} archivo(s) adjuntado(s) exitosamente.`,
    });
  };

  // Bulk action functions
  const toggleSelectObjective = (id: string) => {
    setSelectedObjectives(prev => 
      prev.includes(id) ? prev.filter(objId => objId !== id) : [...prev, id]
    );
  };

  const toggleSelectActivity = (id: string) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(actId => actId !== id) : [...prev, id]
    );
  };

  const toggleSelectAttachment = (id: string) => {
    setSelectedAttachments(prev => 
      prev.includes(id) ? prev.filter(attId => attId !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = (type: 'objectives' | 'activities') => {
    if (type === 'objectives' && selectedObjectives.length > 0) {
      setSession(prev => {
        if (!prev || !prev.objectives) return prev;
        
        const updatedObjectives = (prev.objectives as SessionObjective[]).map(obj => {
          if (selectedObjectives.includes(obj.title)) {
            return { ...obj, completed: true };
          }
          return obj;
        });
        
        return { ...prev, objectives: updatedObjectives };
      });
      
      setSelectedObjectives([]);
      toast({
        title: "Objetivos actualizados",
        description: `${selectedObjectives.length} objetivos marcados como completados.`,
      });
    } else if (type === 'activities' && selectedActivities.length > 0) {
      setSession(prev => {
        if (!prev || !prev.activities) return prev;
        
        const updatedActivities = (prev.activities as SessionActivity[]).map(act => {
          if (selectedActivities.includes(act.title)) {
            return { ...act, completed: true };
          }
          return act;
        });
        
        return { ...prev, activities: updatedActivities };
      });
      
      setSelectedActivities([]);
      toast({
        title: "Actividades actualizadas",
        description: `${selectedActivities.length} actividades marcadas como completadas.`,
      });
    }
  };

  const handleBulkDelete = (type: 'attachments') => {
    if (type === 'attachments' && selectedAttachments.length > 0) {
      setSession(prev => {
        if (!prev || !prev.attachments) return prev;
        
        const updatedAttachments = (prev.attachments as SessionAttachment[]).filter(
          att => !selectedAttachments.includes(att.id)
        );
        
        return { ...prev, attachments: updatedAttachments };
      });
      
      setSelectedAttachments([]);
      toast({
        title: "Archivos eliminados",
        description: `${selectedAttachments.length} archivos eliminados exitosamente.`,
      });
    }
  };

  const { toast } = useToast();

  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        // Try to get from local cache first
        const cachedSession = localStorage.getItem(`session_${sessionId}`);
        if (cachedSession) {
          setSession(JSON.parse(cachedSession));
          setLoading(false);
        }
        
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

  // Using the shared translateSessionType function from session-utils

  // Render status badge with icons
  const getStatusBadge = (status: SessionStatus | string) => {
    switch (status) {
      case SessionStatus.COMPLETED:
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Completada</span>
          </Badge>
        );
      case SessionStatus.SCHEDULED:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CalendarCheck className="h-3 w-3" />
            <span>Programada</span>
          </Badge>
        );
      case SessionStatus.CANCELLED:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Ban className="h-3 w-3" />
            <span>Cancelada</span>
          </Badge>
        );
      case SessionStatus.NO_SHOW:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>No asistió</span>
          </Badge>
        );
      case SessionStatus.IN_PROGRESS:
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 flex items-center gap-1">
            <Loader className="h-3 w-3 animate-spin" />
            <span>En progreso</span>
          </Badge>
        );
      case SessionStatus.TRANSFERRED:
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-700 flex items-center gap-1">
            <ArrowRightLeft className="h-3 w-3" />
            <span>Transferida</span>
          </Badge>
        );
      case SessionStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Borrador</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>Desconocido</span>
          </Badge>
        );
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onEdit}
                      className="text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Editar sesión"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Editar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Editar detalles de la sesión</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExport}
                      className="text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      aria-label="Exportar sesión"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Exportar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar sesión en formato JSON</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Eliminar sesión"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Eliminar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar permanentemente esta sesión</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('help')}
                      className="text-xs hover:bg-green-50 hover:text-green-600 transition-colors"
                      aria-label="Ayuda"
                    >
                      <HelpCircle className="h-3.5 w-3.5 mr-1" />
                      Ayuda
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ver guía de ayuda</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                  aria-expanded={expandedSections.objectives}
                  aria-controls="objectives-content"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Tag className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Objetivos</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {Array.isArray(session.objectives)
                            ? `${session.objectives.filter((o: any) => o.completed).length} de ${session.objectives.length} completados`
                            : '0 de 0 completados'}
                        </p>
                        <div className="w-24">
                          <Progress 
                            value={Array.isArray(session.objectives) 
                              ? (session.objectives.filter((o: any) => o.completed).length / session.objectives.length) * 100 
                              : 0} 
                            className="h-1.5"
                            aria-label="Progreso de objetivos"
                          />
                        </div>
                      </div>
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
                  id="objectives-content"
                  className={cn(
                    "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                    expandedSections.objectives ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                  )}>
                    <div className="p-4 bg-white">
                      {/* Search and filter controls */}
                      <div className="mb-4 flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              type="search"
                              placeholder="Buscar objetivos..."
                              value={objectivesFilter}
                              onChange={(e) => setObjectivesFilter(e.target.value)}
                              className="pl-9"
                              aria-label="Buscar objetivos"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter('all')}
                            className={`text-xs ${statusFilter === 'all' ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            Todos
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter('completed')}
                            className={`text-xs ${statusFilter === 'completed' ? 'bg-green-100 text-green-700' : ''}`}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Completados
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter('pending')}
                            className={`text-xs ${statusFilter === 'pending' ? 'bg-amber-100 text-amber-700' : ''}`}
                          >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Pendientes
                          </Button>
                        </div>
                        {selectedObjectives.length > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleBulkComplete('objectives')}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white ml-auto"
                          >
                            <CheckSquare className="h-3.5 w-3.5 mr-1" />
                            Marcar {selectedObjectives.length} como completados
                          </Button>
                        )}
                      </div>

                      <div className="bg-gray-50/50 rounded-md border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                          {filterObjectives().map((objective: SessionObjective, index: number) => (
                            <li key={index} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center h-5 mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedObjectives.includes(objective.title)}
                                    onChange={() => toggleSelectObjective(objective.title)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    aria-label={`Seleccionar objetivo: ${objective.title}`}
                                  />
                                </div>
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
                                  
                                  {/* Comments section */}
                                  <div className="mt-2">
                                    {getCommentsForItem(objective.title).length > 0 && (
                                      <div className="bg-gray-50 rounded p-2 mb-2 border border-gray-100">
                                        <p className="text-xs font-medium text-gray-700 mb-1">Comentarios:</p>
                                        {getCommentsForItem(objective.title).map((comment, i) => (
                                          <div key={i} className="mb-1 last:mb-0">
                                            <p className="text-xs">
                                              <span className="font-medium">{comment.author}:</span> {comment.text}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                              {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {commentingOn?.id === objective.title ? (
                                      <div className="flex items-center gap-2 mt-2">
                                        <Input
                                          type="text"
                                          placeholder="Añadir comentario..."
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          className="text-xs h-8"
                                          aria-label="Escribir comentario"
                                        />
                                        <Button
                                          size="sm"
                                          variant="default"
                                          onClick={() => addComment(objective.title, 'objective')}
                                          className="h-8 text-xs"
                                        >
                                          Añadir
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setCommentingOn(null)}
                                          className="h-8 text-xs"
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCommentingOn({ id: objective.title, type: 'objective' })}
                                        className="text-xs mt-1 h-7 px-2 py-0"
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Comentar
                                      </Button>
                                    )}
                                  </div>
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
                          
                          {filterObjectives().length === 0 && (
                            <li className="p-4 text-center">
                              <p className="text-sm text-gray-500">No se encontraron objetivos que coincidan con los filtros.</p>
                            </li>
                          )}
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
                  aria-expanded={expandedSections.activities}
                  aria-controls="activities-content"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Actividades</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {Array.isArray(session.activities)
                            ? `${session.activities.filter((a: any) => a.completed).length} de ${session.activities.length} completadas`
                            : '0 de 0 completadas'}
                        </p>
                        <div className="w-24">
                          <Progress 
                            value={Array.isArray(session.activities) 
                              ? (session.activities.filter((a: any) => a.completed).length / session.activities.length) * 100 
                              : 0} 
                            className="h-1.5"
                            aria-label="Progreso de actividades"
                          />
                        </div>
                      </div>
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
                  id="activities-content"
                  className={cn(
                    "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                    expandedSections.activities ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                  )}>
                    <div className="p-4 bg-white">
                      {/* Search and filter controls */}
                      <div className="mb-4 flex flex-wrap gap-2 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              type="search"
                              placeholder="Buscar actividades..."
                              value={activitiesFilter}
                              onChange={(e) => setActivitiesFilter(e.target.value)}
                              className="pl-9"
                              aria-label="Buscar actividades"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter('all')}
                            className={`text-xs ${statusFilter === 'all' ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            Todas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter('completed')}
                            className={`text-xs ${statusFilter === 'completed' ? 'bg-green-100 text-green-700' : ''}`}
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Completadas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStatusFilter('pending')}
                            className={`text-xs ${statusFilter === 'pending' ? 'bg-amber-100 text-amber-700' : ''}`}
                          >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Pendientes
                          </Button>
                        </div>
                        {selectedActivities.length > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleBulkComplete('activities')}
                            className="text-xs bg-green-600 hover:bg-green-700 text-white ml-auto"
                          >
                            <CheckSquare className="h-3.5 w-3.5 mr-1" />
                            Marcar {selectedActivities.length} como completadas
                          </Button>
                        )}
                      </div>

                      <div className="bg-gray-50/50 rounded-md border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                          {filterActivities().map((activity: SessionActivity, index: number) => (
                            <li key={index} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex items-center h-5 mt-0.5">
                                  <input
                                    type="checkbox"
                                    checked={selectedActivities.includes(activity.title)}
                                    onChange={() => toggleSelectActivity(activity.title)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    aria-label={`Seleccionar actividad: ${activity.title}`}
                                  />
                                </div>
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
                                  
                                  {/* Comments section */}
                                  <div className="mt-2">
                                    {getCommentsForItem(activity.title).length > 0 && (
                                      <div className="bg-gray-50 rounded p-2 mb-2 border border-gray-100">
                                        <p className="text-xs font-medium text-gray-700 mb-1">Comentarios:</p>
                                        {getCommentsForItem(activity.title).map((comment, i) => (
                                          <div key={i} className="mb-1 last:mb-0">
                                            <p className="text-xs">
                                              <span className="font-medium">{comment.author}:</span> {comment.text}
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                              {new Date(comment.createdAt).toLocaleString()}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {commentingOn?.id === activity.title ? (
                                      <div className="flex items-center gap-2 mt-2">
                                        <Input
                                          type="text"
                                          placeholder="Añadir comentario..."
                                          value={newComment}
                                          onChange={(e) => setNewComment(e.target.value)}
                                          className="text-xs h-8"
                                          aria-label="Escribir comentario"
                                        />
                                        <Button
                                          size="sm"
                                          variant="default"
                                          onClick={() => addComment(activity.title, 'activity')}
                                          className="h-8 text-xs"
                                        >
                                          Añadir
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => setCommentingOn(null)}
                                          className="h-8 text-xs"
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCommentingOn({ id: activity.title, type: 'activity' })}
                                        className="text-xs mt-1 h-7 px-2 py-0"
                                      >
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        Comentar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {activity.duration && (
                                  <Badge variant="outline" className="bg-purple-50 text-purple-600">
                                    {activity.duration} min
                                  </Badge>
                                )}
                              </div>
                            </li>
                          ))}
                          
                          {filterActivities().length === 0 && (
                            <li className="p-4 text-center">
                              <p className="text-sm text-gray-500">No se encontraron actividades que coincidan con los filtros.</p>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
              </div>
            )}

            {/* Attachments card */}
            <div className="overflow-hidden hover:shadow-sm transition-shadow border-t border-gray-100">
              <div
                className="bg-gradient-to-r from-amber-50/70 to-amber-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('attachments')}
                aria-expanded={expandedSections.attachments}
                aria-controls="attachments-content"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-amber-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Paperclip className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Archivos adjuntos</h3>
                    <p className="text-xs text-gray-500">
                      {Array.isArray(session?.attachments) ? session.attachments.length : 0} archivos disponibles
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
                id="attachments-content"
                className={cn(
                  "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.attachments ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                )}>
                  <div className="p-4 bg-white">
                    {/* Search and upload controls */}
                    <div className="mb-4 flex flex-wrap gap-2 items-center">
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            type="search"
                            placeholder="Buscar archivos..."
                            value={attachmentsFilter}
                            onChange={(e) => setAttachmentsFilter(e.target.value)}
                            className="pl-9"
                            aria-label="Buscar archivos"
                          />
                        </div>
                      </div>
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileInputChange}
                          className="hidden"
                          multiple
                          aria-label="Subir archivos"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs"
                        >
                          <FileUp className="h-3.5 w-3.5 mr-1" />
                          Subir archivos
                        </Button>
                      </div>
                      {selectedAttachments.length > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleBulkDelete('attachments')}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white ml-auto"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Eliminar {selectedAttachments.length} archivo(s)
                        </Button>
                      )}
                    </div>

                    {/* Drag and drop area */}
                    <div 
                      className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragging ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FileUp className={`h-8 w-8 mb-2 ${isDragging ? 'text-amber-500' : 'text-gray-400'}`} />
                        <p className="text-sm font-medium mb-1">
                          {isDragging ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
                        </p>
                        <p className="text-xs text-gray-500">O haz clic en "Subir archivos" para seleccionarlos</p>
                      </div>
                    </div>

                    {/* Attachments list */}
                    {Array.isArray(session?.attachments) && session.attachments.length > 0 ? (
                      <div className="bg-gray-50/50 rounded-md border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                          {filterAttachments().map((attachment: SessionAttachment, index: number) => (
                            <li key={index} className="p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center h-5">
                                  <input
                                    type="checkbox"
                                    checked={selectedAttachments.includes(attachment.id)}
                                    onChange={() => toggleSelectAttachment(attachment.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    aria-label={`Seleccionar archivo: ${attachment.name}`}
                                  />
                                </div>
                                <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{attachment.name}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500">
                                      Subido el {new Date(attachment.uploadedAt).toLocaleDateString()}
                                    </p>
                                    <Badge variant="outline" className="text-xs bg-gray-50">
                                      {attachment.type}
                                    </Badge>
                                  </div>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-blue-600 hover:bg-blue-50 h-8 w-8 p-0 rounded-full"
                                        aria-label="Descargar archivo"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Descargar archivo</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-gray-50/50 rounded-md border border-gray-100 p-8 text-center">
                        <FileX className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No hay archivos adjuntos</p>
                        <p className="text-xs text-gray-400 mt-1">Sube archivos arrastrándolos o usando el botón "Subir archivos"</p>
                      </div>
                    )}
                    
                    {Array.isArray(session?.attachments) && session.attachments.length > 0 && filterAttachments().length === 0 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">No se encontraron archivos que coincidan con el filtro.</p>
                      </div>
                    )}
                  </div>
                </div>
            </div>
            {/* Help section */}
            <div className="overflow-hidden hover:shadow-sm transition-shadow border-t border-gray-100">
              <div
                className="bg-gradient-to-r from-blue-50/70 to-blue-50/30 px-4 py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('help')}
                aria-expanded={expandedSections.help}
                aria-controls="help-content"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Ayuda y guía</h3>
                    <p className="text-xs text-gray-500">
                      Información sobre cómo usar esta interfaz
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${expandedSections.help ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {expandedSections.help ? 'Mostrando' : 'Ver ayuda'}
                  </span>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${expandedSections.help ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {expandedSections.help ? (
                      <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
                    ) : (
                      <ChevronLeft className="h-3.5 w-3.5 -rotate-90" />
                    )}
                  </div>
                </div>
              </div>
              <div
                id="help-content"
                className={cn(
                  "border-t border-gray-100 transition-all duration-300 ease-in-out overflow-hidden",
                  expandedSections.help ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 border-t-0"
                )}>
                  <div className="p-4 bg-white">
                    <div className="bg-gray-50/50 rounded-md border border-gray-100 p-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                        <Info className="h-4 w-4 text-blue-600" />
                        Guía de uso de la interfaz de detalles de sesión
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Navegación</h5>
                          <p className="text-xs text-gray-600">
                            Puedes expandir o contraer cada sección haciendo clic en su encabezado. 
                            También puedes usar los botones "Expandir todo" o "Contraer todo" para gestionar todas las secciones a la vez.
                          </p>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Objetivos y Actividades</h5>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            <li>Usa el buscador para filtrar por texto</li>
                            <li>Filtra por estado (completado/pendiente) usando los botones</li>
                            <li>Selecciona varios elementos para realizar acciones en grupo</li>
                            <li>Añade comentarios a objetivos o actividades específicas</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Archivos adjuntos</h5>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            <li>Arrastra y suelta archivos en el área designada</li>
                            <li>O usa el botón "Subir archivos" para seleccionarlos desde tu dispositivo</li>
                            <li>Busca archivos por nombre o tipo</li>
                            <li>Selecciona varios archivos para eliminarlos en grupo</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Acciones principales</h5>
                          <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                            <li><span className="font-medium">Editar:</span> Modifica los detalles de la sesión</li>
                            <li><span className="font-medium">Exportar:</span> Descarga la sesión en formato JSON</li>
                            <li><span className="font-medium">Eliminar:</span> Borra permanentemente la sesión</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                          <p className="text-xs text-blue-700 flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5" />
                            <span>¿Necesitas más ayuda? Contacta al soporte técnico o consulta la documentación completa.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          {/* End of accordion container */}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-4 pb-4 bg-gray-50/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="hover:bg-white hover:text-gray-700 transition-colors"
                  aria-label="Volver a la lista de sesiones"
                >
                  Volver
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Volver a la lista de sesiones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  onClick={onEdit}
                  className="bg-primary hover:bg-primary/90 transition-colors"
                  aria-label="Editar esta sesión"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar sesión
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar detalles de esta sesión</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
