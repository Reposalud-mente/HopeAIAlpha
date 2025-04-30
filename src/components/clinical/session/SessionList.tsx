import React, { useEffect, useState } from 'react';
import { Session } from './types';
import SessionCreation from './SessionCreation';
import { SessionFormData, formDataToSessionInput } from '@/lib/validations/session-form';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

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

  const handleCreateSave = async (formData: SessionFormData) => {
    setCreating(true);
    try {
      // Convert form data to session input format
      const sessionInput = formDataToSessionInput(formData);

      // Add patient ID and other required fields
      const sessionData = {
        ...sessionInput,
        patientId,
        // Let the backend set clinicianId from the authenticated user
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      toast({
        title: 'Sesión creada',
        description: 'La sesión ha sido creada exitosamente',
        variant: 'default',
      });

      setShowCreate(false);
      fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create session',
        variant: 'destructive',
      });
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
            <button
              type="button"
              onClick={() => onSelectSession?.(session)}
              className="text-left p-2 hover:bg-gray-100 rounded w-full"
            >
              {session.type} - {new Date(session.createdAt).toLocaleDateString()} ({session.status})
            </button>
          </li>
        ))}

      </ul>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="max-w-3xl w-full">
            <SessionCreation
              onSubmit={handleCreateSave}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionList;
