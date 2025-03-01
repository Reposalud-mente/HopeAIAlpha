'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserCircle, 
  ClipboardList, 
  Calendar, 
  BarChart4, 
  Users,
  FileText
} from 'lucide-react';

// Import dashboard components and layout
import ClinicalDashboard from '@/components/clinical/dashboard/clinical-dashboard';
import DailyPulse from '@/components/clinical/dashboard/daily-pulse';
import AppLayout from '@/components/layout/app-layout';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Demo data for the dashboard
  const demoStats = {
    patientsTotal: 24,
    patientsNew: 3,
    upcomingSessions: 7,
    evaluationsInProgress: 5,
    reportsCompleted: 12,
  };
  
  const demoAppointments = [
    { id: '1', patientName: 'Carlos Rodríguez', time: '09:00', date: new Date().toISOString(), status: 'confirmed' },
    { id: '2', patientName: 'María González', time: '11:30', date: new Date().toISOString(), status: 'pending' },
    { id: '3', patientName: 'Juan Pérez', time: '14:00', date: new Date().toISOString(), status: 'confirmed' },
  ];
  
  const demoEvaluations = [
    { id: '1', patientName: 'Laura Torres', status: 'En progreso', progress: 65, lastUpdated: '2 horas atrás' },
    { id: '2', patientName: 'Miguel Sánchez', status: 'Pendiente revisión', progress: 100, lastUpdated: '1 día atrás' },
    { id: '3', patientName: 'Ana Silva', status: 'Recién iniciada', progress: 15, lastUpdated: '3 horas atrás' },
  ];
  
  return (
    <AppLayout>
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <DailyPulse />
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pacientes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{demoStats.patientsTotal}</span>
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  +{demoStats.patientsNew} nuevos
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Consultas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{demoStats.upcomingSessions}</span>
                <span className="ml-2 text-sm text-gray-500">esta semana</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Casos Críticos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">3</span>
                <span className="ml-2 text-sm text-gray-500">-1 desde ayer</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Progreso Clínico</CardTitle>
              <p className="text-sm text-gray-500">Seguimiento de evaluaciones y consultas</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Evaluaciones Completadas</span>
                  <span className="font-medium">8/12</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '66.7%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Seguimientos Realizados</span>
                  <span className="font-medium">15/20</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Agenda de Hoy</CardTitle>
              <p className="text-sm text-gray-500">Próximas consultas programadas</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {demoAppointments.map(appointment => (
                  <li key={appointment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-3">
                      {appointment.patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-xs text-gray-500">{appointment.time} AM - {appointment.status === 'confirmed' ? 'Seguimiento' : 'Primera Consulta'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pacientes Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">24</span>
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                  +3 nuevos
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Sesiones Próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">7</span>
                <span className="ml-2 text-sm text-gray-500">esta semana</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Evaluaciones en Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardList className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">5</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sesiones Próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {demoAppointments.map(appointment => (
                  <li key={appointment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">Hoy, {appointment.time}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Evaluaciones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {demoEvaluations.map(evaluation => (
                  <li key={evaluation.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">{evaluation.patientName}</p>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {evaluation.status}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${evaluation.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Actualizado: {evaluation.lastUpdated}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 