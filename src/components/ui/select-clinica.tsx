'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectClinicaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const clinicas = [
  'Centro de Psicología Clínica',
  'Centro de Salud Mental Norte',
  'Clínica Psicológica Central',
  'Instituto Psiquiátrico Sur',
  'Centro Terapéutico Oriental',
  'Consulta Privada',
];

export function SelectClinica({ value, onChange, className }: SelectClinicaProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (clinica: string) => {
    onChange(clinica);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left border rounded-md",
          "bg-white hover:bg-gray-50 transition-colors duration-150",
          "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
          isOpen && "ring-1 ring-blue-500 border-blue-500",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-gray-800">{value || "Seleccionar clínica"}</span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-500 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {clinicas.map((clinica) => (
            <div
              key={clinica}
              className={cn(
                "px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150 flex items-center",
                value === clinica && "bg-blue-50 text-blue-700"
              )}
              onClick={() => handleSelect(clinica)}
            >
              {value === clinica && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {value !== clinica && <div className="w-6 mr-2"></div>}
              {clinica}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}