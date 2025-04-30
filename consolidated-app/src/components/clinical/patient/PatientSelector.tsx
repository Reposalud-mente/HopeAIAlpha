'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  contactEmail?: string;
  dateOfBirth?: string;
}

interface PatientSelectorProps {
  onSelectPatient: (patientId: string, patientName: string) => void;
  preSelectedPatientId?: string;
}

export function PatientSelector({ onSelectPatient, preSelectedPatientId }: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(preSelectedPatientId || null);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/patients');
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        const data = await response.json();

        // Handle different response structures
        let patientsList = [];
        if (Array.isArray(data)) {
          // Direct array of patients
          patientsList = data;
        } else if (data.items && Array.isArray(data.items)) {
          // Paginated response with items property
          patientsList = data.items;
        } else if (data.patients && Array.isArray(data.patients)) {
          // Response with patients property
          patientsList = data.patients;
        }

        console.log('Fetched patients:', patientsList);
        setPatients(patientsList);
        setFilteredPatients(patientsList);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');

        // For development/testing, use mock data if API fails
        const mockPatients: Patient[] = [
          { id: '1', firstName: 'Juan', lastName: 'Pérez', contactEmail: 'juan@example.com', dateOfBirth: '1985-05-15' },
          { id: '2', firstName: 'María', lastName: 'González', contactEmail: 'maria@example.com', dateOfBirth: '1990-10-20' },
          { id: '3', firstName: 'Carlos', lastName: 'Rodríguez', contactEmail: 'carlos@example.com', dateOfBirth: '1978-03-08' },
          { id: '4', firstName: 'Ana', lastName: 'Martínez', contactEmail: 'ana@example.com', dateOfBirth: '1995-12-30' },
          { id: '5', firstName: 'Pedro', lastName: 'Sánchez', contactEmail: 'pedro@example.com', dateOfBirth: '1982-07-22' },
        ];
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const email = patient.contactEmail?.toLowerCase() || '';
      return fullName.includes(query) || email.includes(query);
    });

    setFilteredPatients(filtered);
  }, [searchQuery, patients]);

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    console.log('Selected patient in PatientSelector:', patient);
    setSelectedPatientId(patient.id);
    const fullName = `${patient.firstName} ${patient.lastName}`;
    console.log('Calling onSelectPatient with:', patient.id, fullName);
    onSelectPatient(patient.id, fullName);
  };

  // Get patient initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar pacientes por nombre o email..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Cargando pacientes...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-4">
          <UserRound className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No se encontraron pacientes</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className={`cursor-pointer transition-colors hover:bg-muted ${
                  selectedPatientId === patient.id ? 'bg-muted border-primary' : ''
                }`}
                onClick={() => handleSelectPatient(patient)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(patient.firstName, patient.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {patient.firstName} {patient.lastName}
                    </p>
                    {patient.contactEmail && (
                      <p className="text-sm text-muted-foreground truncate">
                        {patient.contactEmail}
                      </p>
                    )}
                  </div>
                  {selectedPatientId === patient.id && (
                    <Button size="sm" variant="outline" className="ml-auto">
                      Seleccionado
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default PatientSelector;
