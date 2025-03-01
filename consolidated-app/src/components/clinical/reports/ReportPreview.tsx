import React from 'react';
import { Card } from '@/components/ui/card';
import { Patient } from '@/lib/types';
import { ReportActionsBar } from '@/components/ui/report-actions-bar';

interface ReportPreviewProps {
  title?: string;
  patient?: Patient;
  clinic?: string;
  psychologist?: string;
  date?: string;
  content: string;
  onSave?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  isSaving?: boolean;
  isDownloading?: boolean;
}

export function ReportPreview({
  title = 'INFORME DE EVALUACIÓN PSICOLÓGICA',
  patient,
  clinic,
  psychologist,
  date,
  content,
  onSave,
  onDownload,
  onPrint,
  onCopy,
  onShare,
  isSaving,
  isDownloading
}: ReportPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Vista Previa del Informe</h2>
        <ReportActionsBar
          onSave={onSave}
          onDownload={onDownload}
          onPrint={onPrint}
          onCopy={onCopy}
          onShare={onShare}
          isSaving={isSaving}
          isDownloading={isDownloading}
        />
      </div>
      
      <Card className="p-6 border border-gray-200 shadow-sm max-h-[700px] overflow-auto">
        <div className="border-b border-blue-600 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
          <p className="text-gray-600">{clinic} | {date}</p>
        </div>
        
        <div className="space-y-4">
          {patient && (
            <div className="mb-4">
              <p className="font-semibold text-blue-600">Paciente:</p>
              <p>{patient.name}</p>
              {patient.age && <p>Edad: {patient.age} años</p>}
            </div>
          )}
          
          {date && (
            <div className="mb-4">
              <p className="font-semibold text-blue-600">Fecha de Evaluación:</p>
              <p>{date}</p>
            </div>
          )}
          
          {psychologist && (
            <div className="mb-4">
              <p className="font-semibold text-blue-600">Profesional:</p>
              <p>{psychologist}</p>
            </div>
          )}
          
          <div className="mb-4">
            <p className="font-semibold text-blue-600">Informe:</p>
            <div className="whitespace-pre-line mt-2 text-gray-800">
              {content}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 