'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Patient {
  id: string;
  name: string;
  status: "Nueva Paciente" | "En Espera" | "Evaluación Pendiente" | "Nueva Cita";
  // Add more patient properties as needed
}

interface PatientContextType {
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;
  recentPatients: Patient[];
  addToRecentPatients: (patient: Patient) => void;
  searchPatients: (query: string) => Promise<Patient[]>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Sample data
const samplePatients: Patient[] = [
  { id: "1", name: "Ana García", status: "Nueva Cita" },
  { id: "2", name: "Carlos López", status: "Evaluación Pendiente" },
  { id: "3", name: "Elena Martínez", status: "En Espera" },
];

export function PatientProvider({ children }: { children: ReactNode }) {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>(samplePatients);

  const addToRecentPatients = (patient: Patient) => {
    setRecentPatients(prev => {
      // Remove the patient if they're already in the list
      const filtered = prev.filter(p => p.id !== patient.id);
      // Add the patient to the beginning of the list and limit to 5 patients
      return [patient, ...filtered].slice(0, 5);
    });
  };

  // Mock function for searching patients - would connect to API in real implementation
  const searchPatients = async (query: string): Promise<Patient[]> => {
    // Sample implementation - would be replaced with API call
    const mockPatients: Patient[] = [
      { id: "PS005", name: "Laura Fernández", status: "Nueva Paciente" },
      { id: "PS006", name: "Javier Morales", status: "En Espera" },
      { id: "PS007", name: "Isabel Torres", status: "Evaluación Pendiente" },
      { id: "PS008", name: "Miguel Ángel Ruiz", status: "Nueva Cita" },
    ];
    
    return mockPatients.filter(patient => 
      patient.name.toLowerCase().includes(query.toLowerCase()) ||
      patient.id.toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
    <PatientContext.Provider value={{
      currentPatient,
      setCurrentPatient,
      recentPatients,
      addToRecentPatients,
      searchPatients
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
} 