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
  {/* Card 1: Pacientes Activos */}
  <Card className="flex flex-col justify-between bg-blue-50 border border-blue-100 shadow-none h-full">
    <div className="flex flex-col flex-1 justify-between h-full p-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Pacientes Activos</span>
        </div>
        <div className="text-3xl font-bold text-blue-900 mt-2">{dashboardSummary?.activePatients ?? 0}</div>
        <span className="text-sm text-gray-500">en tratamiento</span>
      </div>
      <div className="flex gap-2 mt-6 items-end">
        <Button variant="outline" className="flex-1">Todos los Pacientes</Button>
        <Button variant="outline" className="flex-1">Métricas</Button>
      </div>
    </div>
  </Card>

  {/* Card 2: Sesiones Hoy */}
  <Card className="flex flex-col justify-between bg-green-50 border border-green-100 shadow-none h-full">
    <div className="flex flex-col flex-1 justify-between h-full p-4">
      <div>
        <span className="text-xs text-gray-500">Sesiones Hoy</span>
        <div className="text-3xl font-bold text-green-900 mt-2">{dashboardSummary?.sessionsToday ?? 0}</div>
        <span className="text-xs text-gray-500 mt-1">{dashboardSummary?.pendingEvaluations ?? 0} evaluaciones pendientes</span>
      </div>
      <div className="flex gap-2 mt-6 items-end">
        <Button variant="outline" className="flex-1">Calendario</Button>
        <Button variant="outline" className="flex-1">To Do</Button>
      </div>
    </div>
  </Card>

  {/* Card 3: Asistente Clínico IA */}
  <Card className="flex flex-col justify-between bg-purple-50 border border-purple-100 shadow-none h-full">
    <div className="flex flex-col flex-1 justify-between h-full p-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-2 w-2 rounded-full bg-green-400 inline-block"></span>
          <span className="font-semibold text-purple-900">Listo para ayudar</span>
        </div>
        <span className="text-xs text-gray-500 mt-1">Tu apoyo inteligente para documentación y consultas clínicas</span>
      </div>
      <div className="flex gap-2 mt-6 items-end">
        <Button variant="outline" className="flex-1">Consultar</Button>
        <Button variant="outline" className="flex-1">Generar Informe</Button>
      </div>
    </div>
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
            <Card className="flex flex-col justify-between h-full bg-blue-50 border border-blue-100 shadow-none">
  <div className="flex flex-col flex-1 justify-between h-full p-4">
    <div>
      <div className="mb-1">
        <span className="text-xs text-gray-500">Mensajes Recientes</span>
        <p className="text-xs text-blue-900 font-semibold mt-1">Promueve la comunicación y el vínculo con tus pacientes</p>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        {(() => {
          // Only show one message per patient
          const seenMsgPatientIds = new Set();
          const uniqueMessages = messages.filter((msg: any) => {
            if (seenMsgPatientIds.has(msg.patientId)) return false;
            seenMsgPatientIds.add(msg.patientId);
            return true;
          }).slice(0, 2);
          return uniqueMessages.length > 0 ? uniqueMessages.map((msg: any) => {
            const patient = patients.find((p: any) => p.id === msg.patientId);
            return (
              <div key={msg.id} className="p-3 rounded-lg bg-white border border-blue-100">
                <div className="flex justify-between mb-1">
                  <p className="font-medium text-blue-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}</p>
                  <span className="text-xs text-blue-700">{new Date(msg.sentAt).toLocaleTimeString('es-CL')}</span>
                </div>
                <p className="text-sm text-blue-800 italic truncate">
                  {msg.content?.trim()
                    ? msg.content
                    : 'Mensaje de vínculo terapéutico'}
                </p>
              </div>
            );
          }) : <div className="text-sm text-blue-400 italic">No hay mensajes recientes</div>;
        })()}
      </div>
    </div>
    <div className="flex items-end mt-6">
      <Button variant="outline" className="flex-1">Ver Todos los Mensajes</Button>
    </div>
  </div>
</Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}