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
          "flex items-center justify-between w-full px-4 py-2 text-left border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          isOpen && "ring-2 ring-blue-500 border-blue-500",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value || "Seleccionar clínica"}
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {clinicas.map((clinica) => (
            <div
              key={clinica}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-gray-100",
                value === clinica && "bg-blue-50 text-blue-700"
              )}
              onClick={() => handleSelect(clinica)}
            >
              {clinica}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 