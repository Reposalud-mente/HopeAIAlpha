import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Save, FileDown, Printer, Copy, Share2 } from 'lucide-react';

interface ReportActionsBarProps {
  onPreview?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  isPreviewDisabled?: boolean;
  isSaveDisabled?: boolean;
  isDownloadDisabled?: boolean;
  isPrintDisabled?: boolean;
  isCopyDisabled?: boolean;
  isShareDisabled?: boolean;
  isSaving?: boolean;
  isDownloading?: boolean;
  isPrinting?: boolean;
  isCopying?: boolean;
  isSharing?: boolean;
  className?: string;
  compact?: boolean;
}

export function ReportActionsBar({
  onPreview,
  onSave,
  onDownload,
  onPrint,
  onCopy,
  onShare,
  isPreviewDisabled = false,
  isSaveDisabled = false,
  isDownloadDisabled = false,
  isPrintDisabled = false,
  isCopyDisabled = false,
  isShareDisabled = false,
  isSaving = false,
  isDownloading = false,
  isPrinting = false,
  isCopying = false,
  isSharing = false,
  className = '',
  compact = false,
}: ReportActionsBarProps) {
  const buttonSize = compact ? "sm" : "default";
  const textClassName = compact ? "text-xs" : "text-sm";

  return (
    <div className={`flex items-center ${compact ? 'space-x-2' : 'space-x-3'} ${className}`}>
      {onPreview && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={onPreview}
          disabled={isPreviewDisabled}
          className="flex items-center border-gray-200 text-blue-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        >
          <Eye className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={textClassName}>Vista Previa</span>
        </Button>
      )}

      {onSave && (
        <Button
          variant="secondary"
          size={buttonSize}
          onClick={onSave}
          disabled={isSaveDisabled || isSaving}
          className="flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 transition-colors"
        >
          <Save className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={textClassName}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </span>
        </Button>
      )}

      {onDownload && (
        <Button
          variant="default"
          size={buttonSize}
          onClick={onDownload}
          disabled={isDownloadDisabled || isDownloading}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
        >
          <FileDown className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={textClassName}>
            {isDownloading ? 'Descargando...' : 'Descargar PDF'}
          </span>
        </Button>
      )}

      {onPrint && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={onPrint}
          disabled={isPrintDisabled || isPrinting}
          className="flex items-center border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Printer className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={textClassName}>
            {isPrinting ? 'Imprimiendo...' : 'Imprimir'}
          </span>
        </Button>
      )}

      {onCopy && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={onCopy}
          disabled={isCopyDisabled || isCopying}
          className="flex items-center border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Copy className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={textClassName}>
            {isCopying ? 'Copiando...' : 'Copiar'}
          </span>
        </Button>
      )}

      {onShare && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={onShare}
          disabled={isShareDisabled || isSharing}
          className="flex items-center border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Share2 className={`${compact ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={textClassName}>
            {isSharing ? 'Compartiendo...' : 'Compartir'}
          </span>
        </Button>
      )}
    </div>
  );
}