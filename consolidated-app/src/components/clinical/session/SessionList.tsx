import React, { useEffect, useState } from 'react';
import { Session } from './types';
import SessionCreation, { SessionFormData } from './SessionCreation';
import { Button } from '@/components/ui/button';

interface SessionListProps {
  patientId: string;
  onSelectSession?: (session: Session) => void;
}

const SessionList: React.FC<SessionListProps> = ({ patientId, onSelectSession }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchSessions = () => {
    setLoading(true);
    fetch(`/api/patients/${patientId}/sessions`)
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load sessions');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSessions();
  }, [patientId]);

  const handleCreateSave = async (session: Session) => {
    setCreating(true);
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...session, patientId }),
      });
      setShowCreate(false);
      fetchSessions();
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      
      <ul className="grid grid-cols-3 gap-4">
        {sessions.map(session => (
          <li key={session.id}>
            <button onClick={() => onSelectSession?.(session)}>
              {session.type} - {new Date(session.createdAt).toLocaleDateString()} ({session.status})
            </button>
          </li>
        ))}
        
      </ul>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full">
            <SessionCreation
              onSubmit={async (form: SessionFormData) => {
                await handleCreateSave({
                  ...form,
                  patientId,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  id: '', // Let backend assign or update after POST
                  clinicianId: '', // Fill as needed
                  status: form.status,
                } as any);
              }}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;
