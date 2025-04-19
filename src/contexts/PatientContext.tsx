'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the Patient interface based on the Prisma schema
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  occupation?: string;
  maritalStatus?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  educationLevel?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  isActive: boolean;
  // Relations
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assessments?: any[];
}

// Define a simplified patient type for display in lists
export interface PatientListItem {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PatientContextType {
  // Current patient for detailed view or editing
  currentPatient: Patient | null;
  setCurrentPatient: (patient: Patient | null) => void;

  // Recent patients for quick access
  recentPatients: PatientListItem[];
  addToRecentPatients: (patient: PatientListItem) => void;

  // Patient data operations
  searchPatients: (query: string) => Promise<PatientListItem[]>;
  getPatient: (id: string) => Promise<Patient | null>;
  createPatient: (patientData: Partial<Patient>) => Promise<Patient | null>;
  updatePatient: (id: string, patientData: Partial<Patient>) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [recentPatients, setRecentPatients] = useState<PatientListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load recent patients on initial render
  useEffect(() => {
    const loadRecentPatients = async () => {
      try {
        const response = await fetch('/api/patients?limit=5', { credentials: 'same-origin' });
        if (!response.ok) throw new Error('Failed to load recent patients');

        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setRecentPatients(data.items.map((patient: Patient) => ({
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: new Date(patient.dateOfBirth),
            contactEmail: patient.contactEmail,
            contactPhone: patient.contactPhone,
            isActive: patient.isActive,
            createdAt: new Date(patient.createdAt),
            updatedAt: new Date(patient.updatedAt)
          })));
        }
      } catch (err) {
        console.error('Error loading recent patients:', err);
        // Don't set error state here to avoid showing error on initial load
      }
    };

    loadRecentPatients();
  }, []);

  const addToRecentPatients = (patient: PatientListItem) => {
    setRecentPatients(prev => {
      // Remove the patient if they're already in the list
      const filtered = prev.filter(p => p.id !== patient.id);
      // Add the patient to the beginning of the list and limit to 5 patients
      return [patient, ...filtered].slice(0, 5);
    });
  };

  // Search patients using the API
  const searchPatients = async (query: string): Promise<PatientListItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir la URL con o sin parámetro de búsqueda
      // Siempre usamos limit=100 para obtener más pacientes
      const url = query && query.length >= 2
        ? `/api/patients?search=${encodeURIComponent(query)}&limit=100`
        : '/api/patients?limit=100';

      console.log('Fetching patients from URL:', url);
      const response = await fetch(url, { credentials: 'same-origin' });
      console.log('API response status:', response.status, response.statusText);

      if (!response.ok) throw new Error(`Failed to search patients: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('API response data:', data); // Mensaje de depuración detallado
      console.log('API returned items count:', data.items ? data.items.length : 0);
      setIsLoading(false);

      if (data.items && Array.isArray(data.items)) {
        console.log('API returned items:', data.items.length);
        const mappedPatients = data.items.map((patient: Patient) => ({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: new Date(patient.dateOfBirth),
          contactEmail: patient.contactEmail,
          contactPhone: patient.contactPhone,
          isActive: patient.isActive,
          createdAt: new Date(patient.createdAt),
          updatedAt: new Date(patient.updatedAt)
        }));
        console.log('Mapped patients:', mappedPatients.length);
        return mappedPatients;
      } else {
        console.log('API response does not contain items array:', data);
      }

      return [];
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error searching patients');
      console.error('Error searching patients:', err);
      return [];
    }
  };

  // Get a single patient by ID
  const getPatient = async (id: string): Promise<Patient | null> => {
    if (!id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${id}`, { credentials: 'same-origin' });
      if (!response.ok) {
        if (response.status === 404) {
          setIsLoading(false);
          return null;
        }
        throw new Error('Failed to fetch patient');
      }

      const patient = await response.json();
      setIsLoading(false);

      // Convert date strings to Date objects
      if (patient) {
        patient.dateOfBirth = new Date(patient.dateOfBirth);
        patient.createdAt = new Date(patient.createdAt);
        patient.updatedAt = new Date(patient.updatedAt);

        // Add to recent patients
        addToRecentPatients({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          contactEmail: patient.contactEmail,
          contactPhone: patient.contactPhone,
          isActive: patient.isActive,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt
        });
      }

      return patient;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error fetching patient');
      console.error('Error fetching patient:', err);
      return null;
    }
  };

  // Create a new patient
  const createPatient = async (patientData: Partial<Patient>): Promise<Patient | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/patients', {
      credentials: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patient');
      }

      const patient = await response.json();
      setIsLoading(false);

      // Convert date strings to Date objects
      if (patient) {
        patient.dateOfBirth = new Date(patient.dateOfBirth);
        patient.createdAt = new Date(patient.createdAt);
        patient.updatedAt = new Date(patient.updatedAt);

        // Add to recent patients
        addToRecentPatients({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: patient.dateOfBirth,
          contactEmail: patient.contactEmail,
          contactPhone: patient.contactPhone,
          isActive: patient.isActive,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt
        });
      }

      return patient;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error creating patient');
      console.error('Error creating patient:', err);
      return null;
    }
  };

  // Update an existing patient
  const updatePatient = async (id: string, patientData: Partial<Patient>): Promise<Patient | null> => {
    if (!id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${id}`, {
      credentials: 'same-origin',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update patient');
      }

      const patient = await response.json();
      setIsLoading(false);

      // Convert date strings to Date objects
      if (patient) {
        patient.dateOfBirth = new Date(patient.dateOfBirth);
        patient.createdAt = new Date(patient.createdAt);
        patient.updatedAt = new Date(patient.updatedAt);

        // Update recent patients list if this patient is in it
        setRecentPatients(prev => {
          const index = prev.findIndex(p => p.id === patient.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = {
              id: patient.id,
              firstName: patient.firstName,
              lastName: patient.lastName,
              dateOfBirth: patient.dateOfBirth,
              contactEmail: patient.contactEmail,
              contactPhone: patient.contactPhone,
              isActive: patient.isActive,
              createdAt: patient.createdAt,
              updatedAt: patient.updatedAt
            };
            return updated;
          }
          return prev;
        });

        // Update current patient if this is the one being viewed
        if (currentPatient && currentPatient.id === patient.id) {
          setCurrentPatient(patient);
        }
      }

      return patient;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error updating patient');
      console.error('Error updating patient:', err);
      return null;
    }
  };

  // Delete (deactivate) a patient
  const deletePatient = async (id: string): Promise<boolean> => {
    if (!id) return false;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${id}`, {
      credentials: 'same-origin',
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete patient');
      }

      setIsLoading(false);

      // Remove from recent patients
      setRecentPatients(prev => prev.filter(p => p.id !== id));

      // Clear current patient if this is the one being viewed
      if (currentPatient && currentPatient.id === id) {
        setCurrentPatient(null);
      }

      return true;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error deleting patient');
      console.error('Error deleting patient:', err);
      return false;
    }
  };

  return (
    <PatientContext.Provider value={{
      currentPatient,
      setCurrentPatient,
      recentPatients,
      addToRecentPatients,
      searchPatients,
      getPatient,
      createPatient,
      updatePatient,
      deletePatient,
      isLoading,
      error
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