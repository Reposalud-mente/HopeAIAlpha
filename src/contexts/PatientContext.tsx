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
  primaryProviderId: string;
  status: string; // PatientStatus enum value
  // Relations
  primaryProvider?: {
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
  status: string; // PatientStatus enum value
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
  bulkDeletePatients: (ids: string[]) => Promise<boolean>;
  bulkUpdatePatients: (ids: string[], data: Partial<Patient>) => Promise<boolean>;

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
        const response = await fetch('/api/patients?limit=5', {
          credentials: 'same-origin',
          // Add cache control to prevent stale responses
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        // Handle authentication errors specifically
        if (response.status === 401) {
          console.log('Authentication required. User needs to log in.');
          // Don't set error state for auth issues to avoid showing error on initial load
          return;
        }

        if (!response.ok) {
          console.error(`Failed to load recent patients: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          setRecentPatients(data.items.map((patient: Patient) => ({
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            dateOfBirth: new Date(patient.dateOfBirth),
            contactEmail: patient.contactEmail,
            contactPhone: patient.contactPhone,
            status: patient.status,
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

  // Cache para almacenar resultados de búsqueda recientes
  const searchCache = React.useRef<{[key: string]: {timestamp: number, results: PatientListItem[]}}>({});
  const CACHE_EXPIRY = 30000; // 30 segundos de validez para la caché

  // Search patients using the API
  const searchPatients = async (query: string): Promise<PatientListItem[]> => {
    // Construir la clave de caché basada en la consulta
    const cacheKey = query || 'all_patients';
    const now = Date.now();

    // Verificar si tenemos resultados en caché y si son válidos
    if (searchCache.current[cacheKey] &&
        now - searchCache.current[cacheKey].timestamp < CACHE_EXPIRY) {
      return searchCache.current[cacheKey].results;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Construir la URL con o sin parámetro de búsqueda
      // Siempre usamos limit=100 para obtener más pacientes
      const url = query && query.length >= 2
        ? `/api/patients?search=${encodeURIComponent(query)}&limit=100`
        : '/api/patients?limit=100';

      const response = await fetch(url, { credentials: 'same-origin' });

      if (!response.ok) throw new Error(`Failed to search patients: ${response.status} ${response.statusText}`);

      const data = await response.json();
      setIsLoading(false);

      if (data.items && Array.isArray(data.items)) {
        const mappedPatients = data.items.map((patient: Patient) => ({
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          dateOfBirth: new Date(patient.dateOfBirth),
          contactEmail: patient.contactEmail,
          contactPhone: patient.contactPhone,
          status: patient.status,
          createdAt: new Date(patient.createdAt),
          updatedAt: new Date(patient.updatedAt)
        }));

        // Guardar resultados en caché
        searchCache.current[cacheKey] = {
          timestamp: now,
          results: mappedPatients
        };

        return mappedPatients;
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
          status: patient.status,
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
              status: patient.status,
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
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete patient');
        } catch (parseError) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to delete patient');
        }
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

  // Bulk delete patients (mark as inactive)
  const bulkDeletePatients = async (ids: string[]): Promise<boolean> => {
    if (!ids.length) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Process each patient deletion sequentially
      let allSuccessful = true;

      for (const id of ids) {
        const response = await fetch(`/api/patients/${id}`, {
          credentials: 'same-origin',
          method: 'DELETE',
        });

        if (!response.ok) {
          allSuccessful = false;
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            console.error(`Failed to delete patient ${id}:`, errorJson);
          } catch {
            console.error(`Failed to delete patient ${id}:`, errorText);
          }
        } else {
          // Remove from recent patients
          setRecentPatients(prev => prev.filter(p => p.id !== id));

          // Clear current patient if this is the one being viewed
          if (currentPatient && currentPatient.id === id) {
            setCurrentPatient(null);
          }
        }
      }

      setIsLoading(false);
      return allSuccessful;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error deleting patients');
      console.error('Error deleting patients:', err);
      return false;
    }
  };

  // Bulk update patients (activate/deactivate)
  const bulkUpdatePatients = async (ids: string[], data: Partial<Patient>): Promise<boolean> => {
    if (!ids.length) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Process each patient update sequentially
      let allSuccessful = true;

      for (const id of ids) {
        const response = await fetch(`/api/patients/${id}`, {
          credentials: 'same-origin',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          allSuccessful = false;
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            console.error(`Failed to update patient ${id}:`, errorJson);
          } catch {
            console.error(`Failed to update patient ${id}:`, errorText);
          }
        } else {
          // Successfully updated the patient
          await response.json(); // Read the response but we don't need to use it

          // Update recent patients list if this patient is in it
          setRecentPatients(prev => {
            const index = prev.findIndex(p => p.id === id);
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                ...data,
                updatedAt: new Date()
              };
              return updated;
            }
            return prev;
          });

          // Update current patient if this is the one being viewed
          if (currentPatient && currentPatient.id === id) {
            setCurrentPatient({
              ...currentPatient,
              ...data,
              updatedAt: new Date()
            });
          }
        }
      }

      setIsLoading(false);
      return allSuccessful;
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Error updating patients');
      console.error('Error updating patients:', err);
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
      bulkDeletePatients,
      bulkUpdatePatients,
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