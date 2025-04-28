import React, { useEffect, useState } from 'react';
import { Session, SessionWithRelations, SessionObjective, SessionActivity, SessionAttachment, AISuggestion } from './types';
import { useSessionSocket } from '@/hooks/useSessionSocket';
import { SessionStatus } from '@prisma/client';

export interface SessionEditorProps {
  sessionId?: string;
  onSave?: (session: SessionWithRelations) => void;
  mode?: 'create' | 'edit';
  patientId?: string;
  isSaving?: boolean;
}


const SessionEditor: React.FC<SessionEditorProps> = ({ sessionId, onSave, mode = 'edit', patientId, isSaving }) => {
  const isCreate = mode === 'create' || !sessionId;
  const [session, setSession] = useState<SessionWithRelations | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // For editing objectives/activities as JSON
  const [objectivesStr, setObjectivesStr] = useState('');
  const [activitiesStr, setActivitiesStr] = useState('');
  // For AI suggestions interaction
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  // For editing suggestion content inline
  const [editSuggestionIdx, setEditSuggestionIdx] = useState<number | null>(null);
  const [editSuggestionContent, setEditSuggestionContent] = useState<string>('');

  // Real-time: subscribe to updates and deletions
  // Type guard for Session
  function isSession(obj: any): obj is SessionWithRelations {
    return obj && typeof obj === 'object' && typeof obj.id === 'string' && typeof obj.patientId === 'string';
  }

  useSessionSocket({
    sessionId: sessionId || '',
    onUpdate: (data) => {
      // Only update if this session is open and data matches Session shape
      if (data && data.id === sessionId && isSession(data)) {
        setSession(data);
        setObjectivesStr(JSON.stringify(data.objectives || {}, null, 2));
        setActivitiesStr(JSON.stringify(data.activities || {}, null, 2));
        setAiSuggestions(Array.isArray(data.aiSuggestions) ? data.aiSuggestions : []);
      }
    },
    onDelete: (data) => {
      if (data && data.id === sessionId) {
        setError('This session was deleted by another user.');
        setSession(null);
      }
    },
  });

  useEffect(() => {
    if (isCreate) {
      // Initialize blank session
      const blank: SessionWithRelations = {
        id: '',
        patientId: patientId || '',
        clinicianId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: '',
        objectives: [] as SessionObjective[],
        notes: '',
        activities: [] as SessionActivity[],
        status: SessionStatus.DRAFT,
        attachments: [] as SessionAttachment[],
        aiSuggestions: [] as AISuggestion[],
        patient: null as any, // Will be populated on save
        clinician: null as any, // Will be populated on save
      };
      setSession(blank);
      setObjectivesStr(JSON.stringify(blank.objectives, null, 2));
      setActivitiesStr(JSON.stringify(blank.activities, null, 2));
      setAiSuggestions([]);
      setLoading(false);
    } else if (sessionId) {
      setLoading(true);
      fetch(`/api/sessions/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setSession(data);
          setObjectivesStr(JSON.stringify(data.objectives || {}, null, 2));
          setActivitiesStr(JSON.stringify(data.activities || {}, null, 2));
          setAiSuggestions(Array.isArray(data.aiSuggestions) ? data.aiSuggestions : []);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load session');
          setLoading(false);
        });
    }
  }, [isCreate, sessionId, patientId]);

  const handleChange = (field: keyof Session, value: any) => {
    if (!session) return;
    setSession({ ...session, [field]: value });
  };

  const handleObjectivesChange = (val: string) => {
    setObjectivesStr(val);
    try {
      const parsed = JSON.parse(val) as SessionObjective[];
      handleChange('objectives', parsed);
    } catch (error) {
      console.error('Error parsing objectives JSON:', error);
    }
  };
  const handleActivitiesChange = (val: string) => {
    setActivitiesStr(val);
    try {
      const parsed = JSON.parse(val) as SessionActivity[];
      handleChange('activities', parsed);
    } catch (error) {
      console.error('Error parsing activities JSON:', error);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    try {
      let updated: Session;
      if (isCreate) {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...session, patientId }),
        });
        updated = await res.json();
      } else {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session),
        });
        updated = await res.json();
      }
      setSession(updated);
      setSaving(false);
      onSave?.(updated);
    } catch (err) {
      setError('Failed to save session');
      setSaving(false);
    }
  };

  // AI suggestions advanced workflow with audit trail
  const getCurrentUser = () => session?.clinicianId || 'clinician'; // fallback to 'clinician' if not loaded

  const updateSuggestion = (idx: number, updates: any) => {
    setAiSuggestions(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const addAuditTrail = (idx: number, action: string, content?: string) => {
    const now = new Date().toISOString();
    const user = getCurrentUser();
    setAiSuggestions(prev => prev.map((s, i) => {
      if (i !== idx) return s;
      const history = Array.isArray(s.history) ? [...s.history] : [];
      history.push({ action, user, timestamp: now, content });
      return { ...s, history };
    }));
  };

  const handleAcceptSuggestion = (idx: number, editedContent?: string) => {
    if (!session) return;
    const suggestion = aiSuggestions[idx];
    const contentToAccept = editedContent !== undefined ? editedContent : suggestion.content;
    // Accept: merge suggestion into notes/objectives (or other field by type)
    let updatedSession = { ...session };
    if (suggestion.type === 'objective') {
      // Merge into objectives JSON (assume suggestion.content is JSON or string)
      let obj = {};
      try { obj = JSON.parse(contentToAccept); } catch { obj = { suggestion: contentToAccept }; }
      updatedSession.objectives = { ...(session.objectives || {}), ...obj };
      setObjectivesStr(JSON.stringify(updatedSession.objectives, null, 2));
    } else if (suggestion.type === 'activity') {
      let act = {};
      try { act = JSON.parse(contentToAccept); } catch { act = { suggestion: contentToAccept }; }
      updatedSession.activities = { ...(session.activities || {}), ...act };
      setActivitiesStr(JSON.stringify(updatedSession.activities, null, 2));
    } else {
      updatedSession.notes = (session.notes || '') + '\n' + contentToAccept;
    }
    handleChange('notes', updatedSession.notes);
    handleChange('objectives', updatedSession.objectives);
    handleChange('activities', updatedSession.activities);
    addAuditTrail(idx, 'accepted', contentToAccept);
    updateSuggestion(idx, { status: 'accepted', content: contentToAccept });
    setEditSuggestionIdx(null);
    setEditSuggestionContent('');
  };

  const handleEditSuggestion = (idx: number) => {
    setEditSuggestionIdx(idx);
    setEditSuggestionContent(aiSuggestions[idx].content);
  };

  const handleSaveEditedSuggestion = (idx: number) => {
    updateSuggestion(idx, { content: editSuggestionContent });
    addAuditTrail(idx, 'edited', editSuggestionContent);
    setEditSuggestionIdx(null);
    setEditSuggestionContent('');
  };

  const handleRejectSuggestion = (idx: number) => {
    addAuditTrail(idx, 'rejected');
    updateSuggestion(idx, { status: 'rejected' });
    setEditSuggestionIdx(null);
    setEditSuggestionContent('');
  };

  if (loading) return <div>Loading session...</div>;
  if (error) return <div>{error}</div>;
  if (!session) return <div>No session found.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{isCreate ? 'Create Session' : 'Edit Session'}</h3>
      <div className="space-y-2">
        <div>
          <label htmlFor="session-type" className="block text-sm font-medium mb-1">Type:</label>
          <input
            id="session-type"
            className="w-full p-2 border rounded-md"
            value={session.type}
            onChange={e => handleChange('type', e.target.value)}
            placeholder="Session type"
          />
        </div>
        <div>
          <label htmlFor="session-status" className="block text-sm font-medium mb-1">Status:</label>
          <select
            id="session-status"
            className="w-full p-2 border rounded-md"
            value={session.status}
            onChange={e => handleChange('status', e.target.value as SessionStatus)}
          >
            <option value={SessionStatus.DRAFT}>Borrador</option>
            <option value={SessionStatus.SCHEDULED}>Programada</option>
            <option value={SessionStatus.IN_PROGRESS}>En progreso</option>
            <option value={SessionStatus.COMPLETED}>Completada</option>
            <option value={SessionStatus.CANCELLED}>Cancelada</option>
            <option value={SessionStatus.NO_SHOW}>No asistió</option>
            <option value={SessionStatus.TRANSFERRED}>Transferida</option>
          </select>
        </div>
        <div>
          <label htmlFor="session-notes" className="block text-sm font-medium mb-1">Notes:</label>
          <textarea
            id="session-notes"
            className="w-full p-2 border rounded-md"
            value={session.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Session notes"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="session-objectives" className="block text-sm font-medium mb-1">Objectives (JSON):</label>
          <textarea
            id="session-objectives"
            className="w-full p-2 border rounded-md font-mono text-sm"
            value={objectivesStr}
            onChange={e => handleObjectivesChange(e.target.value)}
            rows={4}
            placeholder="Enter objectives in JSON format"
          />
        </div>
        <div>
          <label htmlFor="session-activities" className="block text-sm font-medium mb-1">Activities (JSON):</label>
          <textarea
            id="session-activities"
            className="w-full p-2 border rounded-md font-mono text-sm"
            value={activitiesStr}
            onChange={e => handleActivitiesChange(e.target.value)}
            rows={4}
            placeholder="Enter activities in JSON format"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">AI Suggestions:</label>
        {aiSuggestions.length === 0 && <div className="text-gray-500 italic">No suggestions available.</div>}
        <ul className="space-y-3">
          {aiSuggestions.map((s: AISuggestion, idx: number) => (
            <li key={idx} className="border border-gray-200 rounded-md p-3">
              <div className="mb-2">
                <strong className="text-gray-700">{s.type || 'Suggestion'}:</strong>
                {editSuggestionIdx === idx ? (
                  <textarea
                    className="w-full mt-1 p-2 border rounded-md"
                    value={editSuggestionContent}
                    onChange={e => setEditSuggestionContent(e.target.value)}
                    rows={2}
                    placeholder="Edit suggestion content"
                  />
                ) : (
                  <span className="ml-1">{s.content}</span>
                )}
              </div>

              <div className="text-xs text-gray-500 mb-2">
                Generated by: {s.generatedBy || 'AI'} |
                Time: {s.timestamp ? new Date(s.timestamp).toLocaleString() : 'N/A'} |
                Status: {s.status || 'pending'}
              </div>

              <div className="flex space-x-2">
                {editSuggestionIdx === idx ? (
                  <>
                    <button
                      type="button"
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      onClick={() => handleSaveEditedSuggestion(idx)}
                    >
                      Save Edit
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                      onClick={() => setEditSuggestionIdx(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      onClick={() => handleAcceptSuggestion(idx)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                      onClick={() => handleEditSuggestion(idx)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      onClick={() => handleRejectSuggestion(idx)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>

              {/* Audit trail/history */}
              {Array.isArray(s.history) && s.history.length > 0 && (
                <div className="mt-2 bg-gray-50 p-2 rounded text-xs">
                  <strong className="text-gray-700">Audit Trail:</strong>
                  <ul className="mt-1 pl-4 list-disc">
                    {s.auditTrail?.map((h, hidx: number) => (
                      <li key={hidx} className="text-gray-600">
                        [{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}] {h.action}{h.content ? ` (content: ${h.content})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSave}
          disabled={saving || isSaving}
        >
          {(saving || isSaving) ? 'Saving...' : (isCreate ? 'Create' : 'Save')}
        </button>

        <div className="mt-2 text-xs text-gray-500">
          Changes to AI suggestions (accept/edit/reject) are tracked and saved to the audit trail. Remember to save the session to persist these actions.
        </div>
      </div>
    </div>
  );
};

export default SessionEditor;
