'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';
import { useNavbar } from '@/contexts/NavbarContext';
import { cn } from '@/lib/utils';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Demo data
  const upcomingAppointments = [
    { id: 1, patientName: 'María García', time: '10:00', date: 'Hoy', status: 'confirmed' },
    { id: 2, patientName: 'Carlos López', time: '14:30', date: 'Mañana', status: 'pending' },
  ];
  
  const recentMessages = [
    { id: 1, from: 'Dr. Rodríguez', time: '09:15', preview: 'Revisé el caso que me enviaste...' },
    { id: 2, from: 'Ana Martínez', time: 'Ayer', preview: 'Gracias por la sesión de hoy...' },
  ];
  
  return (
    <AppLayout>
      {/* Demo mode banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <p className="font-medium">Modo Demostración</p>
            <p className="ml-2 text-sm hidden md:inline">Explore las funcionalidades de telemedicina</p>
          </div>
          <div>
            <Link href="/login">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-blue-700">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
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
                <CardTitle>Próximas Consultas Virtuales</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.map(appointment => (
                  <div key={appointment.id} className="mb-4 p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-gray-500">{appointment.date}, {appointment.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </span>
                      <Button size="sm" variant="default">
                        Iniciar
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">Ver Todas las Consultas</Button>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Mensajes Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {recentMessages.map(message => (
                  <div key={message.id} className="mb-3 p-3 border rounded-lg">
                    <div className="flex justify-between mb-1">
                      <p className="font-medium">{message.from}</p>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{message.preview}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">Ver Todos los Mensajes</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 