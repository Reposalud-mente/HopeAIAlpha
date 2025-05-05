'use client';

import { useState } from 'react';
import { CalendarAppointment, useCalendarStore } from '@/store/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar as CalendarIcon, Clock, MapPin, User, RotateCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppointmentListProps {
  appointments: CalendarAppointment[];
}

export function AppointmentList({ appointments }: AppointmentListProps) {
  const { setSelectedAppointment, openModal } = useCalendarStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment => {
    const patientName = appointment.patient 
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase() 
      : '';
    
    return (
      appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientName.includes(searchTerm.toLowerCase()) ||
      format(new Date(appointment.date), 'dd/MM/yyyy').includes(searchTerm)
    );
  });

  // Sort appointments by date
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group appointments by date
  const groupedAppointments: Record<string, CalendarAppointment[]> = {};
  
  sortedAppointments.forEach(appointment => {
    const dateKey = format(new Date(appointment.date), 'yyyy-MM-dd');
    if (!groupedAppointments[dateKey]) {
      groupedAppointments[dateKey] = [];
    }
    groupedAppointments[dateKey].push(appointment);
  });

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Programada</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completada</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      case 'NO_SHOW':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">No asistió</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    openModal();
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Buscar por paciente, título o fecha..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Appointments list */}
      {Object.keys(groupedAppointments).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay citas que coincidan con la búsqueda</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          {Object.keys(groupedAppointments).map(dateKey => (
            <div key={dateKey} className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2 sticky top-0 bg-white py-2 z-10">
                {format(new Date(dateKey), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </h3>
              <div className="space-y-3">
                {groupedAppointments[dateKey].map(appointment => (
                  <div 
                    key={appointment.id} 
                    className="border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {appointment.patient && (
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{appointment.patient.firstName} {appointment.patient.lastName}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(appointment.date), 'HH:mm')} - 
                          {format(new Date(appointment.endTime), 'HH:mm')} 
                          ({appointment.duration} min)
                        </span>
                      </div>
                      
                      {appointment.location && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{appointment.location}</span>
                        </div>
                      )}
                      
                      {appointment.isRecurring && (
                        <div className="flex items-center text-gray-600">
                          <RotateCw className="h-4 w-4 mr-2" />
                          <span>
                            Cita recurrente 
                            {appointment.recurrencePattern === 'weekly' && ' (semanal)'}
                            {appointment.recurrencePattern === 'biweekly' && ' (quincenal)'}
                            {appointment.recurrencePattern === 'monthly' && ' (mensual)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
}