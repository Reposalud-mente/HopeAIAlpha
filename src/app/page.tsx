'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight, Users, Sparkles // Absolute essentials
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UltimateMinimalistLandingPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [elementsVisible, setElementsVisible] = useState(false);

  const heroWords = ["Potencia.", "Simplifica.", "Transforma."];
  const [currentHeroWordIndex, setCurrentHeroWordIndex] = useState(0);

  useEffect(() => {
    // Gentle fade-in for all primary content
    const mainContentTimer = setTimeout(() => setElementsVisible(true), 200);

    const wordInterval = setInterval(() => {
      setCurrentHeroWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500); // Slightly slower, more deliberate word change

    return () => {
      clearTimeout(mainContentTimer);
      clearInterval(wordInterval);
    };
  }, [heroWords.length]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden antialiased text-gray-800">
      {/* --- ULTRA-SUBTLE, ALMOST IMPERCEPTIBLE BACKGROUND ENERGY --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[20%] -left-[20%] w-[120%] h-[120%] opacity-0"
          style={{
            background: 'radial-gradient(circle, rgba(239, 246, 255, 0.5) 0%, transparent 60%)', // Very light blue, large, soft
          }}
          animate={{ opacity: elementsVisible ? 1 : 0 }}
          transition={{ duration: 3, delay: 0.5, ease: [0.42, 0, 0.58, 1] }} // Slow, smooth ease
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[20%] w-[100%] h-[100%] opacity-0"
          style={{
            background: 'radial-gradient(circle, rgba(245, 243, 255, 0.4) 0%, transparent 65%)', // Very light purple
          }}
          animate={{ opacity: elementsVisible ? 1 : 0 }}
          transition={{ duration: 3.5, delay: 0.8, ease: [0.42, 0, 0.58, 1] }}
        />
      </div>

      {/* --- HYPER-MINIMALIST HEADER --- */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: elementsVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 flex justify-center p-4"
      >
        <div className="flex items-center justify-between w-full max-w-4xl">
          <Link href="/" aria-label="HopeAI Home" className="group flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-indigo-200 transition-shadow">
              H
            </div>
            <span className="text-base font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">HopeAI</span>
          </Link>
          {/* Potentially no other links, or an ultra-discrete "Support" if essential */}
        </div>
      </motion.header>

      {/* --- REFINED MAIN CONTENT --- */}
      <main
        className="flex-grow flex flex-col items-center justify-center px-4 w-full z-10 pt-24 pb-16 sm:pt-28"
        role="main"
      >
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: elementsVisible ? 1 : 0, y: elementsVisible ? 0 : 15 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="w-full max-w-md text-center"
        >
          {/* HERO TEXT - ELEGANT & FOCUSED */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentHeroWordIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'fadeInOut' }} // Simplified transition for words
                  className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 min-h-[48px] sm:min-h-[60px]"
                >
                  {heroWords[currentHeroWordIndex]}
                </motion.span>
              </AnimatePresence>
              <br className="block sm:hidden"/> La Práctica Clínica.
            </h1>
            <p className="mt-3 text-base text-gray-600 max-w-xs sm:max-w-sm mx-auto">
              La plataforma IA para psicólogos que buscan la excelencia.
            </p>
          </div>

          {/* MAIN ACTION CARD - PURE FOCUS */}
          <div
            className="w-full bg-white rounded-xl shadow-lg border border-gray-200/60 p-6 sm:p-7"
          >
            <div className="mb-6">
              <div className="bg-gray-100 p-1 rounded-lg flex items-center relative">
                 {['login', 'signup'].map((tabId) => (
                    <button
                      key={tabId}
                      type="button"
                      onClick={() => setActiveTab(tabId)}
                      className={`w-1/2 py-2.5 rounded-md text-sm font-medium relative transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                        ${activeTab === tabId ? 'text-white' : 'text-gray-500 hover:text-indigo-600'}`}
                      aria-label={tabId === 'login' ? "Ingresar a su cuenta" : "Crear una nueva cuenta"}
                    >
                      {activeTab === tabId && (
                        <motion.div
                          layoutId="ultimateActivePill"
                          className="absolute inset-0 bg-indigo-500 rounded-md z-0 shadow"
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }} // Tweaked spring for feel
                        />
                      )}
                      <span className="relative z-10">
                        {tabId === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="relative h-24"> {/* Fixed height is crucial for smooth tab content transition */}
              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.div
                    key="loginAction"
                    initial={{ opacity: 0, y: 10 }} // Subtle Y motion
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }} // Standard ease for content
                    className="absolute w-full space-y-2.5 text-center"
                  >
                    <Button asChild size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 text-[15px] rounded-md shadow-sm hover:shadow-md transition-all group">
                      <Link href="/auth/login">
                        Acceder a mi Cuenta <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 transition-transform opacity-80" />
                      </Link>
                    </Button>
                    <p className="text-xs text-gray-400 pt-0.5">Continúa tu impacto.</p>
                  </motion.div>
                )}
                {activeTab === 'signup' && (
                  <motion.div
                    key="signupAction"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                    className="absolute w-full space-y-2.5 text-center"
                  >
                    <Button asChild variant="outline" size="lg" className="w-full border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-medium py-3 text-[15px] rounded-md shadow-sm hover:shadow-md transition-all group">
                      <Link href="/auth/signup">
                        Unirme a HopeAI <Users className="ml-1.5 w-4 h-4 group-hover:scale-105 transition-transform opacity-80" />
                      </Link>
                    </Button>
                     <p className="text-xs text-gray-400 pt-0.5">Inicia tu evolución profesional.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

            {/* THE "ONE DROP OF PERFUME" - Subtle Hint of AI capabilities */}
           <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: elementsVisible ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 1.0, ease: "easeOut" }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-gray-500 inline-flex items-center gap-1">
                Potenciado por IA
                <Sparkles className="w-3 h-3 text-indigo-400 opacity-70" />
                <span className="sr-only">con inteligencia artificial</span>
              </p>
           </motion.div>

        </motion.div>
      </main>

      {/* --- ULTIMATE MINIMALIST FOOTER --- */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: elementsVisible ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-5 px-4"
      >
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} HopeAI</span>
            <span className="opacity-50">·</span>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacidad</Link>
          </div>
      </motion.footer>
    </div>
  );
}