'use client';

import { Patient } from '@/contexts/PatientContext';
import { Mail, Phone, FileText } from 'lucide-react';

interface PatientInfoPanelProps {
  patient: Patient;
  className?: string;
}

export default function PatientInfoPanel({ patient, className = '' }: PatientInfoPanelProps) {
  // Calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <div className="flex items-center p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-700 font-bold text-lg shadow-sm flex-shrink-0 border-2 border-white">
          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-semibold text-gray-800">{`${patient.firstName} ${patient.lastName}`}</h3>

            {patient.dateOfBirth && (
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {calculateAge(patient.dateOfBirth)} años
              </span>
            )}
          </div>

          {/* Contact information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            {patient.contactEmail && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-3.5 w-3.5 text-blue-500 mr-1 flex-shrink-0" />
                <span className="truncate">{patient.contactEmail}</span>
              </div>
            )}

            {patient.contactPhone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-3.5 w-3.5 text-blue-500 mr-1 flex-shrink-0" />
                <span>{patient.contactPhone}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 border border-blue-100"
          onClick={() => window.open(`/patients/${patient.id}`, '_blank')}
          aria-label="Ver historial completo del paciente"
        >
          <FileText className="h-3.5 w-3.5" />
          Ver historial
        </button>
      </div>
    </div>
  );
}
