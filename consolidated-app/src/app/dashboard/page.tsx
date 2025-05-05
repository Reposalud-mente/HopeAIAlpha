'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { Typewriter } from '@/components/ui/Typewriter';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Video,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  FileText
} from 'lucide-react';

import AppLayout from '@/components/layout/app-layout';
import { useDashboardStore } from '@/store/dashboard';
import {
  CustomizableSection,
  CustomizableLayoutContainer
} from '@/components/dashboard/customizable-layout';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { ExportData } from '@/components/dashboard/export-data';
import { GuidedTour } from '@/components/dashboard/guided-tour';
import { HelpSection } from '@/components/dashboard/help-section';

// Lazy load non-critical components
const ClinicalDashboard = lazy(() => import('@/components/clinical/dashboard/clinical-dashboard'));

// Loading fallback component
const SectionSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton className="h-8 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    <Skeleton className="h-64" />
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    connectSocket,
    disconnectSocket,
    isConnected,
    getFilteredAppointments
  } = useDashboardStore();

  // Initialize data and connect socket for real-time updates
  useEffect(() => {
    // Use the demo psychologist's real UUID from the seed script
    setUserId('24312c0a-6317-4741-9330-ff581e2a24f3'); // admin@hopeai.com UUID

    // Fetch initial data
    fetchDashboardSummary();
    fetchPatients();
    fetchAppointments();
    fetchMessages();

    // Connect socket for real-time updates
    connectSocket();

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, [
    setUserId,
    fetchDashboardSummary,
    fetchPatients,
    fetchAppointments,
    fetchMessages,
    connectSocket,
    disconnectSocket
  ]);

  // Manual refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await Promise.all([
        fetchDashboardSummary(),
        fetchPatients(),
        fetchAppointments(),
        fetchMessages()
      ]);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter for upcoming appointments (future dates)
  const now = new Date();
  const filteredAppointments = getFilteredAppointments();

  // Only show one upcoming appointment per patient
  const seenPatientIds = new Set();
  const upcomingAppointments = filteredAppointments
    .filter((a) => new Date(a.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .filter((a) => {
      if (seenPatientIds.has(a.patientId)) return false;
      seenPatientIds.add(a.patientId);
      return true;
    })
    .slice(0, 3);

  // Metrics for cards
  const metrics = [
    {
      title: "Pacientes Activos",
      value: dashboardSummary?.activePatients ?? 0,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-500 bg-blue-50",
      href: "/patients"
    },
    {
      title: "Sesiones Hoy",
      value: dashboardSummary?.sessionsToday ?? 0,
      icon: <Calendar className="h-5 w-5" />,
      color: "text-green-500 bg-green-50",
      href: "/calendar"
    },
    {
      title: "Mensajes No Leídos",
      value: dashboardSummary?.unreadMessages ?? 0,
      icon: <AlertCircle className="h-5 w-5" />,
      color: "text-amber-500 bg-amber-50",
      href: "/messages"
    },
  ];

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="container mx-auto px-6 py-8">
          {/* Header with title and actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <Typewriter
                as="h1"
                text="Plataforma de Telemedicina"
                speed={50}
                className="font-bold mb-2 text-3xl md:text-4xl"
                id="dashboard-header"
              />
              <p className="text-gray-600">
                Gestione sus consultas virtuales de manera eficiente
              </p>
            </div>

            {/* Dashboard Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh dashboard data"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </Button>

              <GuidedTour />
              <HelpSection />

              {/* Real-time indicator */}
              <div className="flex items-center gap-1 ml-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Real-time' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <CustomizableLayoutContainer>
            {/* Metrics Section */}
            <CustomizableSection
              sectionId="metrics"
              title="Métricas Clave"
              data-tour="dashboard-metrics"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {metrics.map((metric) => (
                  <motion.div
                    key={metric.title}
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium">
                            {metric.title}
                          </CardTitle>
                          <div className={`p-2 rounded-full ${metric.color}`}>
                            {metric.icon}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{metric.value}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => router.push(metric.href)}
                        >
                          Ver detalles
                          <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CustomizableSection>

            {/* Appointments Section */}
            <CustomizableSection
              sectionId="appointments"
              title="Próximas Citas"
              data-tour="dashboard-appointments"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <DashboardFilters type="appointments" data-tour="dashboard-filters" />
                  <ExportData
                    data={filteredAppointments}
                    type="appointments"
                    data-tour="dashboard-export"
                  />
                </div>

                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => (
                      <Card key={appointment.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarFallback className="bg-blue-100 text-blue-800">
                                {appointment.patientName?.substring(0, 2) || "PT"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium truncate">
                                  {appointment.patientName || "Patient"}
                                </p>
                                <Badge variant="outline" className="ml-2">
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar size={14} className="mr-1" />
                                <span>
                                  {format(new Date(appointment.date), "PPP")}
                                </span>
                                <Clock size={14} className="ml-3 mr-1" />
                                <span>
                                  {format(new Date(appointment.date), "p")}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={() => router.push(`/appointments/${appointment.id}`)}
                            >
                              <ArrowRight size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming appointments</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => router.push('/calendar')}
                    >
                      Schedule Appointment
                    </Button>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => router.push('/calendar')}
                  >
                    View All Appointments
                    <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </CustomizableSection>

            {/* AI Insights Section */}
            <CustomizableSection
              sectionId="aiInsights"
              title="IA Insights"
              data-tour="dashboard-ai"
            >
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Video className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Asistente Clínico IA
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tu apoyo inteligente para documentación y consultas clínicas.
                      Obtén recomendaciones basadas en evidencia y genera informes
                      automáticamente.
                    </p>
                    <Button
                      onClick={() => router.push('/consultas-ai')}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    >
                      Iniciar Consulta IA
                    </Button>
                  </div>
                </div>
              </div>
            </CustomizableSection>

            {/* Quick Actions Section */}
            <CustomizableSection
              sectionId="quickActions"
              title="Acciones Rápidas"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Nueva Cita",
                    icon: <Calendar className="h-5 w-5" />,
                    href: "/calendar",
                    color: "bg-blue-50 text-blue-600",
                  },
                  {
                    title: "Nuevo Paciente",
                    icon: <Users className="h-5 w-5" />,
                    href: "/patients",
                    color: "bg-green-50 text-green-600",
                  },
                  {
                    title: "Generar Informe",
                    icon: <FileText className="h-5 w-5" />,
                    href: "/reports",
                    color: "bg-amber-50 text-amber-600",
                  },
                  {
                    title: "Consulta IA",
                    icon: <Video className="h-5 w-5" />,
                    href: "/consultas-ai",
                    color: "bg-purple-50 text-purple-600",
                  },
                ].map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className={`h-auto py-6 flex flex-col items-center justify-center gap-2 ${action.color} border-2 hover:bg-opacity-80`}
                    onClick={() => router.push(action.href)}
                  >
                    <div className="p-2 rounded-full bg-white">
                      {action.icon}
                    </div>
                    <span>{action.title}</span>
                  </Button>
                ))}
              </div>
            </CustomizableSection>
          </CustomizableLayoutContainer>
        </div>
      </TooltipProvider>
    </AppLayout>
  );
}