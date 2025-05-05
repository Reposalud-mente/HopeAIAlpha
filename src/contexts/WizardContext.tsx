'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Define the structure of a saved wizard session
export interface WizardSession {
  id: string;
  patientId?: string;
  patientName?: string;
  step: string;
  formData: any;
  lastUpdated: string;
  clinicName?: string;
  reportType?: string;
}

// Define the context type
interface WizardContextType {
  // Current wizard state
  currentStep: string;
  setCurrentStep: (step: string) => void;
  formData: any;
  updateFormData: (data: any) => void;
  
  // Save and resume functionality
  saveProgress: () => Promise<string>;
  resumeSession: (sessionId: string) => Promise<boolean>;
  savedSessions: WizardSession[];
  loadSavedSessions: () => Promise<WizardSession[]>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  
  // Validation state
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
  validateField: (field: string, value: any) => boolean;
  
  // Help and guidance
  showHelp: boolean;
  toggleHelp: () => void;
  
  // Progress tracking
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

// Create the context with default values
const WizardContext = createContext<WizardContextType>({
  currentStep: '',
  setCurrentStep: () => {},
  formData: {},
  updateFormData: () => {},
  
  saveProgress: async () => '',
  resumeSession: async () => false,
  savedSessions: [],
  loadSavedSessions: async () => [],
  deleteSession: async () => false,
  
  validationErrors: {},
  setValidationErrors: () => {},
  validateField: () => true,
  
  showHelp: false,
  toggleHelp: () => {},
  
  isLoading: false,
  setIsLoading: () => {},
  progress: 0,
  setProgress: () => {},
});

// Provider component
export const WizardProvider = ({ children }: { children: ReactNode }) => {
  // State for wizard progress
  const [currentStep, setCurrentStep] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [savedSessions, setSavedSessions] = useState<WizardSession[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  const { toast } = useToast();
  
  // Load saved sessions from localStorage on mount
  useEffect(() => {
    loadSavedSessions();
  }, []);
  
  // Update form data
  const updateFormData = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  };
  
  // Toggle help visibility
  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };
  
  // Save current progress to localStorage
  const saveProgress = async (): Promise<string> => {
    try {
      const sessionId = `wizard-session-${Date.now()}`;
      const session: WizardSession = {
        id: sessionId,
        patientId: formData.patientId,
        patientName: formData.patientName,
        step: currentStep,
        formData,
        lastUpdated: new Date().toISOString(),
        clinicName: formData.clinica,
        reportType: formData.tipoInforme
      };
      
      // Get existing sessions
      const existingSessions = await loadSavedSessions();
      
      // Add new session
      const updatedSessions = [...existingSessions, session];
      
      // Save to localStorage
      localStorage.setItem('wizardSessions', JSON.stringify(updatedSessions));
      
      // Update state
      setSavedSessions(updatedSessions);
      
      toast({
        title: "Progreso guardado",
        description: "Podrás continuar desde este punto más tarde.",
        duration: 3000,
      });
      
      return sessionId;
    } catch (error) {
      console.error('Error saving progress:', error);
      
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el progreso. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
      
      return '';
    }
  };
  
  // Resume a saved session
  const resumeSession = async (sessionId: string): Promise<boolean> => {
    try {
      const sessions = await loadSavedSessions();
      const session = sessions.find(s => s.id === sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      // Restore state
      setCurrentStep(session.step);
      setFormData(session.formData);
      
      toast({
        title: "Sesión restaurada",
        description: "Continúa desde donde lo dejaste.",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('Error resuming session:', error);
      
      toast({
        title: "Error al restaurar",
        description: "No se pudo restaurar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    }
  };
  
  // Load saved sessions from localStorage
  const loadSavedSessions = async (): Promise<WizardSession[]> => {
    try {
      const sessionsJson = localStorage.getItem('wizardSessions');
      
      if (!sessionsJson) {
        return [];
      }
      
      const sessions = JSON.parse(sessionsJson) as WizardSession[];
      setSavedSessions(sessions);
      return sessions;
    } catch (error) {
      console.error('Error loading saved sessions:', error);
      return [];
    }
  };
  
  // Delete a saved session
  const deleteSession = async (sessionId: string): Promise<boolean> => {
    try {
      const sessions = await loadSavedSessions();
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      
      localStorage.setItem('wizardSessions', JSON.stringify(updatedSessions));
      setSavedSessions(updatedSessions);
      
      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada correctamente.",
        duration: 3000,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    }
  };
  
  // Validate a field
  const validateField = (field: string, value: any): boolean => {
    let isValid = true;
    const newErrors = { ...validationErrors };
    
    // Basic validation rules
    if (value === undefined || value === null || value === '') {
      newErrors[field] = `El campo ${field} es requerido`;
      isValid = false;
    } else {
      delete newErrors[field];
    }
    
    // Update validation errors
    setValidationErrors(newErrors);
    
    return isValid;
  };
  
  // Context value
  const value = {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    
    saveProgress,
    resumeSession,
    savedSessions,
    loadSavedSessions,
    deleteSession,
    
    validationErrors,
    setValidationErrors,
    validateField,
    
    showHelp,
    toggleHelp,
    
    isLoading,
    setIsLoading,
    progress,
    setProgress,
  };
  
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};

// Custom hook to use the wizard context
export const useWizard = () => {
  const context = useContext(WizardContext);
  
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  
  return context;
};