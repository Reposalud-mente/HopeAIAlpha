import React, { useState } from 'react';
import { SessionWithRelations } from './types';

interface SessionExportImportProps {
  sessionId: string;
}

const SessionExportImport: React.FC<SessionExportImportProps> = ({ sessionId }) => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/export?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExporting(false);
    } catch (err) {
      setError('Failed to export session');
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImporting(true);
    setError(null);
    try {
      const file = event.target.files?.[0];
      if (!file) throw new Error('No file selected');
      const formData = new FormData();
      formData.append('file', file);
      // Use fetch with POST and file content
      const res = await fetch(`/api/sessions/${sessionId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      if (!res.ok) throw new Error('Import failed');
      setImporting(false);
      alert('Imported session data');
    } catch (err) {
      setError('Failed to import session');
      setImporting(false);
    }
  };


  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <h4 className="text-md font-medium">Export/Import Session</h4>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Export session data in different formats:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            Export as JSON
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
            onClick={() => handleExport('fhir')}
            disabled={exporting}
          >
            Export as FHIR
          </button>
          <button
            type="button"
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
            onClick={() => handleExport('hl7')}
            disabled={exporting}
          >
            Export as HL7
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="import-file" className="block text-sm font-medium">
          Import session data:
        </label>
        <input
          id="import-file"
          type="file"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          accept=".json,.hl7,.xml"
          onChange={handleImport}
          disabled={importing}
        />
      </div>

      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  );
};

export default SessionExportImport;
