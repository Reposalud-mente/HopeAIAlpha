"use client"

import React, { useState } from 'react';
import { Search, Bell, Mic, FileText, ChevronDown, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import SimplifiedSidebar from '@/components/layout/simplified-sidebar';
import DailyPulse from './daily-pulse';
import { AIAssistanceSection } from '@/components/ai/ai-assistance-section';
import { AIAssistant } from '@/components/ai/ai-chat';
import { useNavbar } from '@/contexts/NavbarContext';
import { cn } from '@/lib/utils';

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
        "flex-1 overflow-auto transition-all duration-300",
        isExpanded ? "ml-64" : "ml-20"
      )}>
        {/* Header with search and notifications */}
        <div className="flex justify-between items-center p-6 border-b bg-white">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Clínico</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
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
                className="pl-10 pr-4 py-2 border rounded-lg bg-gray-50 w-64"
              />
            </div>

            <button type="button" className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="h-5 w-5" />
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
            "border-r border-calm-primary/10",
            "bg-calm-bg/50 backdrop-blur-sm",
            "w-[250px] shrink-0" // Fixed width, no transition needed
          )}>
            <div className="p-4 h-full">
              <AIAssistanceSection onChatOpen={() => setIsChatOpen(true)} />
            </div>
          </div>

          {/* Dynamic Workspace - Center Column */}
          <div className="flex-1 min-w-0 p-6">
            <DailyPulse />
          </div>

          {/* Insight Panel - Right Column */}
          <div className={cn(
            "border-l bg-calm-bg",
            "w-[250px] shrink-0"
          )}>
            <div className="p-4 h-full flex flex-col space-y-6">
              {/* AI Insights Section */}
              <div>
                <h2 className="text-base font-medium text-neutral-text mb-3">AI Insights</h2>
                <div className="space-y-2">
                  {insights.map(insight => (
                    <Card key={insight.id} className="bg-white rounded-xl hover:shadow-md transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-calm-success/20">
                            <AlertCircle className="h-4 w-4 text-calm-success" />
                          </div>
                          <p className="text-sm text-neutral-text">{insight.text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Progress Overview Section */}
              <div>
                <h2 className="text-base font-medium text-neutral-text mb-3">Pendientes</h2>
                <Card className="bg-white rounded-xl hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    {/* Progress content here */}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Tools Section */}
              <div>
                <h2 className="text-base font-medium text-neutral-text mb-3">Acciones Rápidas</h2>
                <div className="space-y-1">
                  {['Genogramas', 'Tipos de Informes', 'Aprende sobre CBT'].map((tool) => (
                    <button
                      type="button"
                      key={tool}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm rounded-xl transition-all",
                        "text-neutral-text hover:bg-calm-secondary/50",
                        "bg-white/50 backdrop-blur-sm hover:shadow-sm"
                      )}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat assistant overlay */}
      {isChatOpen && (
        <div className="fixed right-6 bottom-6 w-96 h-3/4 bg-white rounded-lg shadow-xl border overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Asistente AI</h3>
            <button type="button" onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-gray-700">
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