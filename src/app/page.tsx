'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Users, Lock, ArrowRight, CheckCircle } from 'lucide-react';


export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimalistic header */}
      <header className="w-full py-3 px-6 absolute top-0 left-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex justify-start items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2xl font-montserrat-bold text-primary tracking-wider">HopeAI</span>
            <div className="hidden md:flex items-center border-l border-gray-200 pl-3">
              <span className="text-xs md:text-sm text-gray-500 font-montserrat-regular tracking-wide">Psicología clínica simplificada</span>
            </div>
          </div>
        </div>
      </header>

      {/* Two-column Hero Section with clinical authority */}
      <main className="flex-grow flex flex-col items-center justify-center px-3 sm:px-4 md:px-5 lg:px-6 py-5 md:py-8 w-full">
        <div className="w-[90%] md:w-[85%] lg:w-[80%] flex flex-col items-center justify-center">

          {/* Main Content */}
          <div className="w-full flex flex-col items-center text-center py-4 md:py-6">

            {/* Main Headline */}
            <div className="w-full mb-6 md:mb-8 animate-fadeIn">
              <div className="flex items-center justify-center gap-[3%]">
                <div className="h-px w-[20%] sm:w-[15%] md:w-[12%] bg-gradient-to-r from-transparent via-primary/30 to-primary/50"></div>
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl uppercase tracking-wider letter-spacing-wider clinical-platform-text px-[2%] py-1">Plataforma Clínica</span>
                <div className="h-px w-[20%] sm:w-[15%] md:w-[12%] bg-gradient-to-l from-transparent via-secondary/30 to-secondary/50"></div>
              </div>
            </div>

            {/* Enhanced Access Cards */}
            <div className="w-full md:w-[95%] lg:w-[90%] xl:w-[85%] mx-auto mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[3%] lg:gap-[4%]">
              {/* Login Card - Enhanced */}
              <div className="p-[5%] sm:p-[6%] md:p-[7%] rounded-lg primary-card transition-all duration-300 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <h3 className="font-montserrat-bold text-gray-900 mb-[5%] text-lg sm:text-xl md:text-2xl flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-[4%] shadow-sm">
                    <Lock className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  Acceso Profesional
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-[8%] font-montserrat-regular">Accede a tu cuenta para gestionar pacientes y generar informes clínicos</p>
                <Link href="/auth/login" className="block w-full mt-auto">
                  <Button
                    size="lg"
                    className="bg-primary text-white font-montserrat-medium w-full py-[3%] text-sm sm:text-base rounded-lg transition-all duration-300 flex items-center justify-center tracking-wide"
                  >
                    Iniciar sesión
                    <ArrowRight className="ml-[3%] w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Register Card - Enhanced */}
              <div className="p-[5%] sm:p-[6%] md:p-[7%] rounded-lg secondary-card transition-all duration-300 flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                <h3 className="font-montserrat-bold text-gray-900 mb-[5%] text-lg sm:text-xl md:text-2xl flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-full mr-[4%] shadow-sm">
                    <Users className="text-secondary w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  Nuevo Profesional
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-[8%] font-montserrat-regular">Regístrate para acceder a todas las herramientas clínicas de HopeAI</p>
                <Link href="/auth/signup" className="block w-full mt-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="secondary-outline-button font-montserrat-medium w-full py-[3%] text-sm sm:text-base rounded-lg flex items-center justify-center tracking-wide hover:bg-[#3CADA7] hover:text-white hover:border-[#3CADA7]"
                  >
                    Crear cuenta
                    <ArrowRight className="ml-[3%] w-4 h-4 sm:w-5 sm:h-5 opacity-70 group-hover:translate-x-1 transition-all duration-300" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Minimalistic Security Banner */}
            <div className="p-[2%] rounded-lg w-[80%] md:w-[70%] lg:w-[60%] mx-auto mb-2 border border-gray-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <Shield className="text-primary w-4 h-4" />
                  <p className="text-xs text-gray-600 font-montserrat-regular">Seguridad clínica</p>
                </div>
                <div className="hidden sm:block h-4 border-r border-gray-200"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-primary w-4 h-4" />
                  <p className="text-xs text-gray-600 font-montserrat-regular">Validado por profesionales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}