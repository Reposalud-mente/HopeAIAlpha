"use client"

import React, { useState } from 'react';
import { Search, Bell, Mic, FileText, ChevronDown, AlertCircle, Zap, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import SimplifiedSidebar from '@/components/layout/simplified-sidebar';
import DailyPulse from './daily-pulse';
import { AIAssistanceSection } from '@/components/ai/ai-assistance-section';
import { AIAssistant } from '@/components/ai/ai-chat';
import { useNavbar } from '@/contexts/NavbarContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const ClinicalDashboard = () => {
  const { isExpanded } = useNavbar();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentPatient] = useState("Juan Pérez");

  const insights = [
    { id: 1, type: 'pattern', text: 'Aumento de sintomatología depresiva en 3 pacientes' },
    { id: 2, type: 'recommendation', text: 'Protocolo CBT sugerido para 2 casos' }
  ];

  return (
    <div className="h-screen flex">
      {/* Fixed position sidebar - vertical navigation */}
      <div className="fixed left-0 top-0 h-full z-50">
        <SimplifiedSidebar />
      </div>

      {/* Main content area with appropriate margin based on sidebar width */}
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-500",
        isExpanded ? "ml-64" : "ml-20"
      )}>
        {/* Header with search and notifications */}
        <div className="flex justify-between items-center p-6 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-medium text-gray-900 tracking-tight">Dashboard Clínico</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              Vista General
            </span>
          </div>

          {/* Search and user actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50/50 w-64 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            <button type="button" className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex p-6">
          {/* Clinical Snapshot - Left Column */}
          <div className={cn(
            "border-r border-gray-100",
            "bg-gradient-to-b from-gray-50/50 to-white backdrop-blur-sm",
            "w-[280px] shrink-0" // Fixed width, no transition needed
          )}>
            <div className="p-5 h-full">
              <AIAssistanceSection onChatOpen={() => setIsChatOpen(true)} />
            </div>
          </div>

          {/* Dynamic Workspace - Center Column */}
          <div className="flex-1 min-w-0 p-6">
            <DailyPulse />
          </div>

          {/* Insight Panel - Right Column */}
          <div className={cn(
            "border-l border-gray-100 bg-gradient-to-b from-gray-50/30 to-white",
            "w-[300px] shrink-0"
          )}>
            <div className="p-5 h-full flex flex-col space-y-6">
              {/* AI Insights Section */}
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-amber-500" />
                  AI Insights
                </h2>
                <div className="space-y-3">
                  {insights.map(insight => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      whileHover={{ y: -2 }}
                    >
                      <Card className="bg-gradient-to-br from-white to-gray-50/30 rounded-xl hover:shadow-md transition-all duration-500 group">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 group-hover:from-emerald-200 group-hover:to-emerald-100 transition-colors duration-500">
                              <AlertCircle className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
                              <div className="mt-2 flex items-center text-xs text-gray-500">
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                                  {insight.type === 'pattern' ? 'Patrón' : 'Recomendación'}
                                </span>
                                <span className="mx-1.5 h-1 w-1 rounded-full bg-gray-300"></span>
                                <span>Hace 2h</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Progress Overview Section */}
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Pendientes
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="bg-gradient-to-br from-white to-gray-50/30 rounded-xl hover:shadow-md transition-all duration-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center">
                              <div className="h-2 w-2 rounded-full bg-amber-400 mr-3"></div>
                              <span className="text-sm text-gray-700">Informe pendiente</span>
                            </div>
                            <span className="text-xs text-gray-500">Hoy</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Quick Tools Section */}
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-3">Acciones Rápidas</h2>
                <div className="space-y-2">
                  {['Genogramas', 'Tipos de Informes', 'Aprende sobre CBT'].map((tool, index) => (
                    <motion.button
                      type="button"
                      key={tool}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 * index }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-300",
                        "text-gray-700 hover:text-gray-900",
                        "bg-gradient-to-r from-white to-gray-50/80 hover:from-gray-50 hover:to-gray-100/80",
                        "border border-gray-100 hover:border-gray-200",
                        "shadow-sm hover:shadow"
                      )}
                    >
                      {tool}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat assistant overlay */}
      {isChatOpen && (
        <div className="fixed right-6 bottom-6 w-96 h-3/4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" />
              Asistente AI
            </h3>
            <button type="button" onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {/* Chat content would go here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalDashboard;