'use client';

import { useState } from 'react';
import { useCalendarStore } from '@/store/calendar';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function DeleteAppointmentModal() {
  const { 
    isDeleteModalOpen, 
    closeDeleteModal, 
    selectedAppointment, 
    deleteAppointment 
  } = useCalendarStore();
  
  const [deleteSeries, setDeleteSeries] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedAppointment?.id) return;
    
    setIsDeleting(true);
    try {
      await deleteAppointment(selectedAppointment.id, deleteSeries);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const isRecurring = selectedAppointment?.isRecurring || selectedAppointment?.parentAppointmentId;

  return (
    <AlertDialog open={isDeleteModalOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro de eliminar esta cita?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La cita será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {isRecurring && (
          <div className="flex items-center space-x-2 py-4">
            <Checkbox 
              id="deleteSeries" 
              checked={deleteSeries} 
              onCheckedChange={(checked) => setDeleteSeries(!!checked)} 
            />
            <Label htmlFor="deleteSeries" className="text-sm font-medium">
              {selectedAppointment?.parentAppointmentId 
                ? 'Eliminar esta y todas las citas futuras de la serie' 
                : 'Eliminar toda la serie de citas recurrentes'}
            </Label>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}