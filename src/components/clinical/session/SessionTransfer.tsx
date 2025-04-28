import React, { useState } from 'react';
import { SessionWithRelations } from './types';

interface SessionTransferProps {
  sessionId: string;
  onTransferred?: () => void;
}

const SessionTransfer: React.FC<SessionTransferProps> = ({ sessionId, onTransferred }) => {
  const [targetClinicianId, setTargetClinicianId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetClinicianId }),
      });
      if (!res.ok) throw new Error('Transfer failed');
      setLoading(false);
      onTransferred?.();
    } catch (err) {
      setError('Failed to transfer session');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <h4 className="text-md font-medium">Transfer Session</h4>
      <div className="space-y-2">
        <label htmlFor="target-clinician" className="block text-sm font-medium mb-1">
          Target Clinician ID
        </label>
        <input
          id="target-clinician"
          className="w-full p-2 border rounded-md"
          placeholder="Enter clinician ID"
          value={targetClinicianId}
          onChange={e => setTargetClinicianId(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        onClick={handleTransfer}
        disabled={loading || !targetClinicianId}
      >
        {loading ? 'Transferring...' : 'Transfer'}
      </button>
      {error && <div className="mt-2 text-red-500">{error}</div>}
    </div>
  );
};

export default SessionTransfer;
