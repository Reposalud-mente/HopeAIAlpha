'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWizard, WizardSession } from '@/contexts/WizardContext';
import { Save, Trash2, Clock, FileText, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

interface SaveProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'resume';
}

export default function SaveProgressModal({ open, onOpenChange, mode }: SaveProgressModalProps) {
  const { saveProgress, savedSessions, loadSavedSessions, resumeSession, deleteSession, formData } = useWizard();
  const [sessionName, setSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle save progress
  const handleSaveProgress = async () => {
    setIsLoading(true);
    try {
      // Update form data with session name if provided
      const updatedFormData = sessionName ? { ...formData, sessionName } : formData;
      
      // Save progress
      await saveProgress();
      
      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resume session
  const handleResumeSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const success = await resumeSession(sessionId);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error resuming session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete session
  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsLoading(true);
    try {
      await deleteSession(sessionId);
      await loadSavedSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return 'Fecha desconocida';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'save' ? (
              <>
                <Save className="h-5 w-5 text-blue-600" />
                Guardar progreso
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 text-blue-600" />
                Retomar sesión guardada
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'save' 
              ? 'Guarda tu progreso actual para continuar más tarde.' 
              : 'Selecciona una sesión guardada para continuar desde donde lo dejaste.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'save' && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Nombre de la sesión (opcional)</Label>
              <Input 
                id="sessionName" 
                placeholder="Ej: Informe de Juan Pérez" 
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Añade un nombre descriptivo para identificar fácilmente esta sesión más tarde.
              </p>
            </div>
          </div>
        )}

        {mode === 'resume' && (
          <div className="py-2">
            {savedSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay sesiones guardadas.</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {savedSessions.map((session) => (
                    <Card 
                      key={session.id}
                      className="p-4 cursor-pointer hover:bg-blue-50 transition-colors border border-gray-200 rounded-lg"
                      onClick={() => handleResumeSession(session.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900">
                            {session.formData?.sessionName || `Sesión del ${formatDate(session.lastUpdated).split('a las')[0]}`}
                          </h3>
                          
                          <div className="flex items-center text-sm text-gray-500 gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(session.lastUpdated)}</span>
                          </div>
                          
                          {session.patientName && (
                            <div className="flex items-center text-sm text-gray-500 gap-1">
                              <User className="h-4 w-4" />
                              <span>{session.patientName}</span>
                            </div>
                          )}
                          
                          {session.clinicName && (
                            <div className="flex items-center text-sm text-gray-500 gap-1">
                              <Building className="h-4 w-4" />
                              <span>{session.clinicName}</span>
                            </div>
                          )}
                          
                          {session.reportType && (
                            <div className="flex items-center text-sm text-gray-500 gap-1">
                              <FileText className="h-4 w-4" />
                              <span>
                                {session.reportType === 'evaluacion-psicologica' && 'Evaluación Psicológica'}
                                {session.reportType === 'seguimiento-terapeutico' && 'Seguimiento Terapéutico'}
                                {session.reportType === 'evaluacion-neuropsicologica' && 'Evaluación Neuropsicológica'}
                                {session.reportType === 'informe-familiar' && 'Informe Familiar'}
                                {session.reportType === 'informe-educativo' && 'Informe Educativo'}
                                {session.reportType === 'alta-terapeutica' && 'Alta Terapéutica'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          
          {mode === 'save' && (
            <Button
              type="submit"
              onClick={handleSaveProgress}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Guardando...' : 'Guardar progreso'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}