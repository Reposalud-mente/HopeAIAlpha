'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { CalendarComponent } from '@/components/calendar/CalendarComponent';
import { AppointmentModal } from '@/components/calendar/AppointmentModal';
import { DeleteAppointmentModal } from '@/components/calendar/DeleteAppointmentModal';
import { useCalendarStore } from '@/store/calendar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, ListFilter, Plus, Users } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentList } from '@/components/calendar/AppointmentList';
import { PatientSelector } from '@/components/calendar/PatientSelector';

export default function CalendarPage() {
  const { user } = useAuth();
  const {
    currentView,
    currentDate,
    appointments,
    isModalOpen,
    isDeleteModalOpen,
    selectedAppointment,
    setCurrentView,
    setCurrentDate,
    fetchAppointments,
    openModal,
  } = useCalendarStore();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch appointments when the view or date changes
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      let start, end;

      // Calculate date range based on current view
      if (currentView === 'day') {
        start = currentDate;
        end = currentDate;
      } else if (currentView === 'week') {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
      } else {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      }

      await fetchAppointments(
        user.id,
        start,
        end
      );
      setIsLoading(false);
    };

    fetchData();
  }, [user?.id, currentView, currentDate, fetchAppointments]);

  // Filter appointments by selected patient
  const filteredAppointments = selectedPatientId
    ? appointments.filter(app => app.patientId === selectedPatientId)
    : appointments;

  // Get upcoming appointments (next 7 days)
  const today = new Date();
  const upcomingAppointments = appointments
    .filter(app => {
      const appDate = new Date(app.date);
      return appDate >= today && appDate <= addDays(today, 7);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get today's appointments
  const todayAppointments = appointments.filter(app =>
    isSameDay(new Date(app.date), today)
  );

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Calendario de Citas</h1>
            <p className="text-gray-600">
              Gestione las citas de sus pacientes de manera eficiente
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <PatientSelector
              selectedPatientId={selectedPatientId}
              onPatientChange={setSelectedPatientId}
            />
            <Button onClick={() => openModal()} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Nueva Cita
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar and List View */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Calendario</CardTitle>
                  <Tabs
                    defaultValue={currentView}
                    className="w-auto"
                    onValueChange={(value) => setCurrentView(value as any)}
                  >
                    <TabsList>
                      <TabsTrigger value="day">Día</TabsTrigger>
                      <TabsTrigger value="week">Semana</TabsTrigger>
                      <TabsTrigger value="month">Mes</TabsTrigger>
                      <TabsTrigger value="list">Lista</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <CardDescription>
                  {currentView === 'day' && format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  {currentView === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d 'de' MMMM 'de' yyyy", { locale: es })}`}
                  {currentView === 'month' && format(currentDate, "MMMM 'de' yyyy", { locale: es })}
                  {currentView === 'list' && 'Próximas citas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentView === 'list' ? (
                  <AppointmentList appointments={filteredAppointments} />
                ) : (
                  <CalendarComponent
                    appointments={filteredAppointments}
                    isLoading={isLoading}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with summary */}
          <div className="space-y-6">
            {/* Today's appointments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Citas de Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay citas programadas para hoy</p>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</p>
                          <p className="text-sm text-gray-500">{format(new Date(appointment.date), 'HH:mm')}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'SCHEDULED' ? 'Programada' :
                           appointment.status === 'COMPLETED' ? 'Completada' :
                           appointment.status === 'CANCELLED' ? 'Cancelada' :
                           appointment.status === 'NO_SHOW' ? 'No asistió' :
                           appointment.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming appointments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Próximas Citas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay citas próximas programadas</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{appointment.patient?.firstName} {appointment.patient?.lastName}</p>
                          <p className="text-sm text-gray-500">{format(new Date(appointment.date), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AppointmentModal />
      <DeleteAppointmentModal />
    </AppLayout>
  );
}