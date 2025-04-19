'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';


export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Subtle header - logo size matching OpenAI */}
      <header className="w-full py-6 px-6 absolute top-0 left-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <span className="text-2xl font-semibold text-black tracking-tight">HopeAI</span>
        </div>
      </header>

      {/* Minimalist Hero Section - optimized for single page view with better space utilization */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 md:py-0">
        <div className="max-w-5xl w-full flex flex-col md:flex-row md:items-center md:justify-between md:gap-20 space-y-2 md:space-y-0 md:min-h-[calc(100vh-8rem)]">


          {/* Left column - intro content */}
          <div className="md:w-5/12 flex flex-col items-center md:items-start text-center md:text-left md:py-12">
            {/* Visual element to start the narrative - with subtle animation */}
            <div className="w-16 h-16 rounded-full bg-black mb-6 flex items-center justify-center animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11 8 11s8-5.6 8-11a8 8 0 0 0-8-8Z" />
              </svg>
            </div>

            {/* Simple, human-centered headline */}
            <h1 className="text-3xl md:text-4xl font-normal mb-4 text-gray-900 leading-tight tracking-tight">
              Psicología clínica simplificada
            </h1>

            {/* Clear, concise value proposition */}
            <p className="text-lg text-black/75 mb-6 font-light leading-relaxed">
              Herramientas inteligentes que te ayudan a centrarte en lo que realmente importa: tus pacientes.
            </p>

            {/* Single focused CTA with more subtle animation - moved up for desktop */}
            <div className="w-full pt-2 pb-4 relative hidden md:block">
              <div className="absolute -inset-4 bg-gray-50 rounded-xl -z-10"></div>
              <p className="text-sm text-black/75 mb-4">Acceso exclusivo para profesionales clínicos</p>
              <Link href="/login" className="block w-full max-w-[200px] mx-auto md:mx-0">
                <Button
                  size="lg"
                  className="
                    bg-black text-white font-normal
                    w-full py-3 text-base rounded-md
                    transition-all duration-700 ease-in-out
                    relative overflow-hidden
                    hover:bg-gray-900
                    
                  "
                >
                  <span className="relative z-10">Comenzar</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right column - benefits */}
          <div className="md:w-7/12 flex flex-col md:py-12">
            {/* Mobile-only section divider */}
            <div className="w-full flex md:hidden items-center justify-center mb-6">
              <div className="h-px w-16 bg-gray-200"></div>
              <span className="mx-4 text-xs uppercase tracking-wider text-black/50 font-medium">Beneficios clave</span>
              <div className="h-px w-16 bg-gray-200"></div>
            </div>

            {/* Desktop-only heading */}
            <h2 className="hidden md:block text-sm uppercase tracking-wider text-gray-500 font-medium mb-6">Beneficios clave</h2>

            {/* Three core benefits - with visual distinction */}
            <div className="w-full mb-8 flex flex-col gap-6">
              <div className="p-5 bg-gray-50 rounded-lg text-left border-l-4 border-black hover:bg-gray-100 transition-all duration-700 ease-in-out">
                <h3 className="font-medium text-gray-900 mb-2">Reduce la carga administrativa</h3>
                <p className="text-black/75 text-sm leading-relaxed">Más tiempo para tus pacientes, menos para el papeleo.</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg text-left border-l-4 border-black/75 hover:bg-gray-100 transition-all duration-700 ease-in-out">
                <h3 className="font-medium text-gray-900 mb-2">Mejora los resultados clínicos</h3>
                <p className="text-black/75 text-sm leading-relaxed">Herramientas inteligentes que potencian tu experiencia profesional.</p>
              </div>
              <div className="p-5 bg-gray-50 rounded-lg text-left border-l-4 border-black/50 hover:bg-gray-100 transition-all duration-700 ease-in-out">
                <h3 className="font-medium text-gray-900 mb-2">Simplifica la telemedicina</h3>
                <p className="text-black/75 text-sm leading-relaxed">Consultas virtuales seguras y sin complicaciones.</p>
              </div>
            </div>

            {/* Trust indicators - moved up for desktop */}
            <div className="hidden md:flex items-center gap-6 mt-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/50 mr-2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span className="text-xs text-gray-500">Seguridad clínica</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/50 mr-2">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
                <span className="text-xs text-gray-500">Validado por profesionales</span>
              </div>
            </div>
          </div>

          {/* Mobile-only CTA section */}
          <div className="md:hidden w-full">
            {/* Section divider */}
            <div className="w-full flex items-center justify-center mb-6">
              <div className="h-px w-16 bg-gray-200"></div>
              <span className="mx-4 text-xs uppercase tracking-wider text-black/50 font-medium">Comienza ahora</span>
              <div className="h-px w-16 bg-gray-200"></div>
            </div>

            {/* Single focused CTA with enhanced visual and subtle animation */}
            <div className="w-full pt-2 pb-4 relative">
              <div className="absolute -inset-4 bg-gray-50 rounded-xl -z-10"></div>
              <p className="text-sm text-black/75 mb-4">Acceso exclusivo para profesionales clínicos</p>
              <Link href="/login" className="block w-full max-w-[200px] mx-auto group">
                <Button
                  size="lg"
                  className="
                    bg-black text-white font-normal
                    w-full py-3 text-base rounded-md
                    transition-all duration-700 ease-in-out
                    relative overflow-hidden
                    hover:bg-gray-900
                    
                  "
                >
                  <span className="relative z-10">Comenzar</span>
                </Button>
              </Link>
            </div>

            {/* Trust indicators - mobile only */}
            <div className="flex items-center justify-center gap-6 pt-2">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/50 mr-2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span className="text-xs text-gray-500">Seguridad clínica</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/50 mr-2">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
                <span className="text-xs text-gray-500">Validado por profesionales</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced footer with visual separation - more compact */}
      <footer className="py-4 md:py-6 mt-auto md:mt-0 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-black/50">
              <span className="font-medium">&copy; 2025 HopeAI</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <Link href="/about" className="hover:text-gray-800 transition-colors duration-200">Sobre Nosotros</Link>
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <Link href="/terms" className="hover:text-gray-800 transition-colors duration-200">Términos</Link>
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <Link href="/privacy" className="hover:text-gray-800 transition-colors duration-200">Privacidad</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}