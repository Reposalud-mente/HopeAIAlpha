'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/auth-context';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface PatientSelectorProps {
  selectedPatientId: string | null;
  onPatientChange: (patientId: string) => void;
  required?: boolean;
}

export function PatientSelector({ selectedPatientId, onPatientChange, required = false }: PatientSelectorProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Fetch patients when component mounts
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/patients?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch patients');
        
        const data = await response.json();
        setPatients(Array.isArray(data) ? data : data.patients || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [user?.id]);

  // Update selected patient when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId && patients.length > 0) {
      const patient = patients.find(p => p.id === selectedPatientId);
      setSelectedPatient(patient || null);
    } else {
      setSelectedPatient(null);
    }
  }, [selectedPatientId, patients]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedPatient && "text-muted-foreground"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Cargando pacientes...</span>
            </div>
          ) : selectedPatient ? (
            `${selectedPatient.firstName} ${selectedPatient.lastName}`
          ) : (
            "Seleccionar paciente"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar paciente..." />
          <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {patients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`${patient.firstName} ${patient.lastName}`}
                onSelect={() => {
                  onPatientChange(patient.id);
                  setSelectedPatient(patient);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedPatientId === patient.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {patient.firstName} {patient.lastName}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}