'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Stethoscope, 
  Users, 
  Video, 
  MessageSquare, 
  BarChart4, 
  Clock, 
  FileText,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-blue-600 text-2xl font-bold mb-6">
            HA
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">HopeAI</h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-8">
            Plataforma integral para profesionales de la psicología clínica
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                Ver Demostración
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Todo lo que necesitas en un solo lugar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <Stethoscope className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Gestión Clínica</CardTitle>
                <CardDescription>Administra tu práctica clínica de forma eficiente</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Historias clínicas digitales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>Informes y documentación</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Seguimiento de tratamientos</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard" className="text-blue-600 font-medium flex items-center">
                  Explorar Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Telemedicina</CardTitle>
                <CardDescription>Consultas virtuales seguras y eficaces</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-blue-500" />
                    <span>Videoconferencias HD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span>Chat integrado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span>Notas de sesión</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/demo" className="text-blue-600 font-medium flex items-center">
                  Ver Demostración <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                  <BarChart4 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Análisis y CRM</CardTitle>
                <CardDescription>Gestión de pacientes y análisis de datos</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Gestión de pacientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5 text-blue-500" />
                    <span>Estadísticas y análisis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span>Gestión de citas</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/patients" className="text-blue-600 font-medium flex items-center">
                  Ver Pacientes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para mejorar tu práctica profesional?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Únete a miles de profesionales que ya utilizan HopeAI para optimizar su trabajo clínico.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Prueba la Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold mr-3">
                HA
              </div>
              <h3 className="text-xl font-bold text-white">HopeAI</h3>
            </div>
            <div className="flex gap-6">
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/patients" className="hover:text-white">Pacientes</Link>
              <Link href="/demo" className="hover:text-white">Demo</Link>
              <Link href="/login" className="hover:text-white">Login</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 HopeAI. Todos los derechos reservados.</p>
            <p className="mt-2">Plataforma para profesionales de la psicología clínica</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 