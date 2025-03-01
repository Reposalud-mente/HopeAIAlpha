'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConsultationReasonProps {
  motivosConsulta: string[];
  onMotivosChange: (motivos: string[]) => void;
  onComplete: () => void;
}

export default function ConsultationReason({
  motivosConsulta,
  onMotivosChange,
  onComplete
}: ConsultationReasonProps) {
  const [newMotivo, setNewMotivo] = useState('');
  
  // Suggested reasons for consultation
  const motivosSugeridos = [
    "Ansiedad",
    "Depresión",
    "Problemas de sueño",
    "Estrés laboral",
    "Problemas de pareja",
    "Dificultades de concentración",
    "Ataques de pánico",
    "Problemas familiares"
  ];
  
  // Add a new reason
  const addMotivo = (motivo: string) => {
    if (!motivo.trim()) return;
    if (motivosConsulta.includes(motivo)) return;
    
    onMotivosChange([...motivosConsulta, motivo]);
    setNewMotivo('');
  };
  
  // Remove a reason
  const removeMotivo = (index: number) => {
    const newMotivos = [...motivosConsulta];
    newMotivos.splice(index, 1);
    onMotivosChange(newMotivos);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Motivo de Consulta</h2>
        
        {/* Add new reason */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Agregar motivo de consulta"
            value={newMotivo}
            onChange={(e) => setNewMotivo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMotivo(newMotivo);
              }
            }}
          />
          <Button onClick={() => addMotivo(newMotivo)} disabled={!newMotivo.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
        
        {/* List of selected reasons */}
        {motivosConsulta.length > 0 ? (
          <div className="mb-6 space-y-2">
            <label className="block text-sm font-medium">Motivos seleccionados:</label>
            <div className="flex flex-wrap gap-2">
              {motivosConsulta.map((motivo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{motivo}</span>
                  <button 
                    onClick={() => removeMotivo(index)}
                    className="h-4 w-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No hay motivos seleccionados. Agregue al menos uno para continuar.</p>
        )}
        
        {/* Suggested reasons */}
        <div>
          <label className="block text-sm font-medium mb-2">Motivos sugeridos:</label>
          <div className="flex flex-wrap gap-2">
            {motivosSugeridos.map((motivo) => (
              <button
                key={motivo}
                onClick={() => addMotivo(motivo)}
                disabled={motivosConsulta.includes(motivo)}
                className="px-3 py-1 text-sm rounded-full 
                  border border-gray-300 hover:bg-gray-100 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {motivo}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onComplete}
          disabled={motivosConsulta.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
} 