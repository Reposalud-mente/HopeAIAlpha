'use client';

import { useEffect } from 'react';
import { Typewriter } from '@/components/ui/Typewriter';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  const router = useRouter();

  return (
    <AppLayout>
      <TooltipProvider>
      {/* Telemedicine Dashboard */}
      <div className="container mx-auto px-[5vw] py-[4vw]">
        <div className="mb-8">
  <Typewriter
  as="h1"
  text="Plataforma de Telemedicina"
  speed={50}
  className="font-bold mb-2 leading-tight text-2xl md:text-4xl lg:text-5xl xl:text-6xl"
/>

  <p className="text-gray-600 text-base md:text-lg lg:text-xl xl:text-2xl">Gestione sus consultas virtuales de manera eficiente</p>
</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2vw] mb-[2vw] h-[24vw] min-h-[320px]">
  {/* Card 1: Pacientes Activos */}
  <Card className="flex flex-col flex-1 w-full h-full justify-between bg-blue-50 border border-blue-200 shadow-none">
    <div className="flex flex-col flex-1 justify-between h-full p-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[1vw] text-blue-700">Pacientes Activos</span>
        </div>
        <div className="text-[2.2vw] font-bold text-blue-900 mt-[0.5vw]">{dashboardSummary?.activePatients ?? 0}</div>
        <span className="text-[1vw] text-blue-600">en tratamiento</span>
      </div>
      <div className="flex gap-2 mt-6 items-end">
        <Button
  className="flex-1 min-w-[7vw] py-[0.7vw] text-[1vw] bg-blue-100 text-slate-700 font-semibold rounded shadow hover:bg-blue-200"
  onClick={() => router.push('/patients')}
  aria-label="Ver todos los pacientes registrados"
>
  Todos los Pacientes
</Button>
        
      </div>
    </div>
  </Card>

  {/* Card 2: Sesiones Hoy */}
  <Card className="flex flex-col flex-1 w-full h-full justify-between bg-green-50 border border-green-200 shadow-none">
    <div className="flex flex-col flex-1 justify-between h-full p-4">
      <div>
        <span className="text-[1vw] text-green-700">Sesiones Hoy</span>
        <div className="text-[2.2vw] font-bold text-green-900 mt-[0.5vw]">{dashboardSummary?.sessionsToday ?? 0}</div>
        <span className="text-[1vw] text-green-600 mt-[0.3vw]">evaluaciones pendientes</span>
      </div>
      <div className="flex gap-2 mt-6 items-end">
        <Button
  className="flex-1 min-w-[7vw] py-[0.7vw] text-[1vw] bg-green-100 text-slate-700 font-semibold rounded shadow hover:bg-green-200"
  onClick={() => router.push('/sessions')}
  aria-label="Ver todas las sesiones de hoy"
>
  Ver Sesiones
</Button>
      </div>
    </div>
  </Card>

  {/* Card 3: Asistente Clínico IA */}
  <Card className="flex flex-col flex-1 w-full h-full justify-between bg-purple-50 border border-purple-200 shadow-none">
    <div className="flex flex-col flex-1 justify-between h-full p-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-[0.7vw] w-[0.7vw] rounded-full bg-green-400 inline-block"></span>
          <span className="font-semibold text-purple-900 text-[1vw]">Listo para ayudar</span>
        </div>
        <span className="text-[1vw] text-purple-700 mt-[0.3vw]">Tu apoyo inteligente para documentación y consultas clínicas</span>
      </div>
      <div className="flex gap-2 mt-6 items-end">
        <Button
  className="flex-1 min-w-[7vw] py-[0.7vw] text-[1vw] bg-purple-100 text-slate-800 font-semibold rounded shadow hover:bg-purple-200"
  onClick={() => router.push('/consultas-ai')}
  aria-label="Acceder al asistente clínico de IA para consultas"
>
  Consultar
</Button>
        
      </div>
    </div>
  </Card>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"></div>
      </div>
      </TooltipProvider>
    </AppLayout>
  );
}