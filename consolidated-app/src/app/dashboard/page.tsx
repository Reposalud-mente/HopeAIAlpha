'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { AiAssistComboBox } from "@/components/clinical/patient/AiAssistComboBox";
import AppLayout from '@/components/layout/app-layout';
import { useDashboardStore } from '@/store/dashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    userId,
    dashboardSummary,
    patients,
    appointments,
    messages,
    fetchDashboardSummary,
    fetchPatients,
    fetchAppointments,
    fetchMessages,
    setUserId,
  } = useDashboardStore();

  // Replace with actual user ID from session/auth in production!
  useEffect(() => {
    // Use the demo psychologist's real UUID from the seed script
    setUserId('24312c0a-6317-4741-9330-ff581e2a24f3'); // admin@hopeai.com UUID
    fetchDashboardSummary();
    fetchPatients();
    fetchAppointments();
    fetchMessages();
  }, [setUserId, fetchDashboardSummary, fetchPatients, fetchAppointments, fetchMessages]);

  // Filter for upcoming appointments (future dates)
  const now = new Date();
  // Only show one upcoming appointment per patient
const seenPatientIds = new Set();
const upcomingAppointments = appointments
  .filter((a: any) => new Date(a.date) > now)
  .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .filter((a: any) => {
    if (seenPatientIds.has(a.patientId)) return false;
    seenPatientIds.add(a.patientId);
    return true;
  })
  .slice(0, 3);

  // Placeholder for completed appointments and average duration
  const completedCount = dashboardSummary?.totalAppointments ?? 0;
  const avgDuration = 45; // Placeholder, replace with real calculation if available

  return (
    <AppLayout>
      {/* Telemedicine Dashboard */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Plataforma de Telemedicina</h1>
          <p className="text-gray-600">Gestione sus consultas virtuales de manera eficiente</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-600">Hoy</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">3</h3>
              <p className="text-gray-600">Consultas programadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Esta semana</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">12</h3>
              <p className="text-gray-600">Consultas completadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-purple-600">Promedio</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">45 min</h3>
              <p className="text-gray-600">Duración de consulta</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.map(appointment => {
                  const patient = Array.isArray(patients) ? patients.find((p: any) => p.id === appointment.patientId) : null;
                  return (
                    <div key={appointment.id} className="mb-4 p-4 border rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <p className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                          <span>
                            {new Date(appointment.date).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}, {new Date(appointment.date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row items-center mt-3 sm:mt-0 space-x-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-2 rounded-lg shadow"
                        >
                          Iniciar
                        </Button>
                        <AiAssistComboBox />
                      </div>
                    </div>
                  );
                })}
                <Button variant="outline" className="w-full mt-2">Ver Todas las Consultas</Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Mensajes Recientes</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Promueve la comunicación y el vínculo con tus pacientes</p>
              </CardHeader>
              <CardContent>
                {(() => {
  // Only show one message per patient
  const seenMsgPatientIds = new Set();
  const uniqueMessages = messages.filter((msg: any) => {
    if (seenMsgPatientIds.has(msg.patientId)) return false;
    seenMsgPatientIds.add(msg.patientId);
    return true;
  }).slice(0, 2);
  return uniqueMessages.map((msg: any) => {
    const patient = patients.find((p: any) => p.id === msg.patientId);
    return (
      <div key={msg.id} className="mb-3 p-3 border rounded-lg">
        <div className="flex justify-between mb-1">
          <p className="font-medium">{patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}</p>
          <span className="text-xs text-gray-500">{new Date(msg.sentAt).toLocaleTimeString('es-CL')}</span>
        </div>
        <p className="text-sm text-gray-700 italic truncate">
          {msg.content?.trim()
            ? msg.content
            : 'Mensaje de vínculo terapéutico'}
        </p>
      </div>
    );
  });
})()}
                <Button variant="outline" className="w-full mt-2">Ver Todos los Mensajes</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}