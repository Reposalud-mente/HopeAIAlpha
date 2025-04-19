import React, { useState } from 'react';

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
    <div>
      <h4>Export/Import Session</h4>
      <button onClick={() => handleExport('json')} disabled={exporting}>Export as JSON</button>
      <button onClick={() => handleExport('fhir')} disabled={exporting}>Export as FHIR</button>
      <button onClick={() => handleExport('hl7')} disabled={exporting}>Export as HL7</button>
      <input type="file" accept=".json,.hl7,.xml" onChange={handleImport} disabled={importing} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default SessionExportImport;
