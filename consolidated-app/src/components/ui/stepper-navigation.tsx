import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, Save, FileDown, Eye } from 'lucide-react';

interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  canProceed: boolean;
  showReportActions?: boolean;
  isPreviewDisabled?: boolean;
  isSaveDisabled?: boolean;
  isDownloadDisabled?: boolean;
  onPreview?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  previewLabel?: string;
  saveLabel?: string;
  downloadLabel?: string;
  isSaving?: boolean;
  isDownloading?: boolean;
  showNextOnLastStep?: boolean;
  hideNextButtonOnFinalScreen?: boolean;
}

export function StepperNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canProceed,
  showReportActions = false,
  isPreviewDisabled = false,
  isSaveDisabled = false,
  isDownloadDisabled = false,
  onPreview,
  onSave,
  onDownload,
  previewLabel = 'Vista Previa',
  saveLabel = 'Guardar',
  downloadLabel = 'Descargar PDF',
  isSaving = false,
  isDownloading = false,
  showNextOnLastStep = false,
  hideNextButtonOnFinalScreen = false,
}: StepperNavigationProps) {
  const isLastStep = currentStep === totalSteps - 1;
  const shouldShowNextButton = 
    (!isLastStep) || 
    (isLastStep && showNextOnLastStep && !hideNextButtonOnFinalScreen);

  return (
    <div className="flex items-center justify-between mt-8">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        className="flex items-center"
        disabled={currentStep === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>
      
      <div className="flex space-x-3">
        {showReportActions && (
          <>
            {onPreview && (
              <Button 
                variant="outline"
                onClick={onPreview}
                disabled={isPreviewDisabled}
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewLabel}
              </Button>
            )}
            
            {onSave && (
              <Button 
                variant="secondary"
                onClick={onSave}
                disabled={isSaveDisabled || isSaving}
                className="flex items-center bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : saveLabel}
              </Button>
            )}
            
            {onDownload && (
              <Button 
                variant="default"
                onClick={onDownload}
                disabled={isDownloadDisabled || isDownloading}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                {isDownloading ? 'Descargando...' : downloadLabel}
              </Button>
            )}
          </>
        )}
        
        {shouldShowNextButton && (
          <Button 
            variant="default"
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center text-white bg-blue-600 hover:bg-blue-700 shadow-sm font-medium"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
} 