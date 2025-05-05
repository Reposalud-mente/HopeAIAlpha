'use client';

import { useState, useEffect } from 'react';
import { useCalendarStore, CalendarAppointment } from '@/store/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { format, addMonths } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { PatientSelector } from '@/components/calendar/PatientSelector';

export function AppointmentModal() {
  const { user } = useAuth();
  const {
    isModalOpen,
    closeModal,
    selectedAppointment,
    createAppointment,
    updateAppointment,
    openDeleteModal
  } = useCalendarStore();

  // Form state
  const [formData, setFormData] = useState({
    title: 'Consulta',
    date: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
    duration: 60,
    status: 'SCHEDULED',
    notes: '',
    location: '',
    isRecurring: false,
    patientId: '',
    userId: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reset form when modal opens/closes or selected appointment changes
  useEffect(() => {
    if (isModalOpen && selectedAppointment) {
      setFormData({
        ...selectedAppointment,
        date: new Date(selectedAppointment.date),
        endTime: new Date(selectedAppointment.endTime)
      });
      setIsEditing(!!selectedAppointment.id);
    } else {
      setFormData({
        title: 'Consulta',
        date: new Date(),
        endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
        duration: 60,
        status: 'SCHEDULED',
        notes: '',
        location: '',
        isRecurring: false,
        patientId: '',
        userId: user?.id || ''
      });
      setIsEditing(false);
    }
  }, [isModalOpen, selectedAppointment, user?.id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && selectedAppointment?.id) {
        await updateAppointment(selectedAppointment.id, formData);
      } else {
        await createAppointment(formData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          {/* Patient Selector */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="patientId">Paciente</Label>
            <PatientSelector
              selectedPatientId={formData.patientId || null}
              onPatientChange={(patientId) => setFormData({...formData, patientId})}
              required
            />
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                type="date"
                id="date"
                value={format(formData.date, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  newDate.setHours(formData.date.getHours(), formData.date.getMinutes());
                  setFormData({...formData, date: newDate});
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                type="time"
                id="time"
                value={format(formData.date, 'HH:mm')}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const newDate = new Date(formData.date);
                  newDate.setHours(hours, minutes);
                  setFormData({...formData, date: newDate});
                }}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Select
              value={String(formData.duration)}
              onValueChange={(value) => setFormData({...formData, duration: Number(value)})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
                <SelectItem value="120">120 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status || 'SCHEDULED'}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Programada</SelectItem>
                <SelectItem value="COMPLETED">Completada</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
                <SelectItem value="NO_SHOW">No asistió</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Notas adicionales sobre la cita"
              rows={3}
            />
          </div>

          <DialogFooter className="flex justify-between">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => openDeleteModal()}
              >
                Eliminar
              </Button>
            )}
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}