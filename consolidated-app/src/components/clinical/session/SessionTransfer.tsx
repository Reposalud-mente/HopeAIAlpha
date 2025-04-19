import React, { useState } from 'react';

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
    <div>
      <h4>Transfer Session</h4>
      <input
        placeholder="Target Clinician ID"
        value={targetClinicianId}
        onChange={e => setTargetClinicianId(e.target.value)}
      />
      <button onClick={handleTransfer} disabled={loading || !targetClinicianId}>
        {loading ? 'Transferring...' : 'Transfer'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default SessionTransfer;
