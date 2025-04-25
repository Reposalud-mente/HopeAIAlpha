import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/lib/types';
import { ReportActionsBar } from '@/components/ui/report-actions-bar';
import { FileText } from 'lucide-react';

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
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-800">Vista Previa del Informe</h2>
          </div>
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
      </div>

      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 py-4">
          <CardTitle className="text-lg font-bold text-gray-800">{title}</CardTitle>
          {(clinic || date) && (
            <p className="text-sm text-gray-600 mt-1">{clinic} {clinic && date && '|'} {date}</p>
          )}
        </CardHeader>
        <CardContent className="p-6 max-h-[600px] overflow-auto">
          <div className="space-y-4">
            {patient && (
              <div className="p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-600 mb-1">Paciente:</p>
                <p className="font-medium text-gray-800">{patient.name}</p>
                {patient.age && <p className="text-sm text-gray-700 mt-1">Edad: {patient.age} años</p>}
              </div>
            )}

            {psychologist && (
              <div className="p-3 hover:bg-blue-50/30 rounded-md border-b border-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-600 mb-1">Profesional:</p>
                <p className="font-medium text-gray-800">{psychologist}</p>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3 pb-2 border-b border-gray-200">Contenido del Informe:</h3>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}