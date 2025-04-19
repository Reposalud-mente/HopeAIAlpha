import React, { useEffect, useState } from 'react';
import { Session } from './types';
import { useSessionSocket } from '@/hooks/useSessionSocket';

export interface SessionEditorProps {
  sessionId?: string;
  onSave?: (session: Session) => void;
  mode?: 'create' | 'edit';
  patientId?: string;
  isSaving?: boolean;
}


const SessionEditor: React.FC<SessionEditorProps> = ({ sessionId, onSave, mode = 'edit', patientId, isSaving }) => {
  const isCreate = mode === 'create' || !sessionId;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!isCreate);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // For editing objectives/activities as JSON
  const [objectivesStr, setObjectivesStr] = useState('');
  const [activitiesStr, setActivitiesStr] = useState('');
  // For AI suggestions interaction
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  // For editing suggestion content inline
  const [editSuggestionIdx, setEditSuggestionIdx] = useState<number | null>(null);
  const [editSuggestionContent, setEditSuggestionContent] = useState<string>('');

  // Real-time: subscribe to updates and deletions
  // Type guard for Session
  function isSession(obj: any): obj is Session {
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
      const blank: Session = {
        id: '',
        patientId: patientId || '',
        clinicianId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: '',
        objectives: {},
        notes: '',
        activities: {},
        status: 'draft',
        attachments: {},
        aiSuggestions: [],
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
      const parsed = JSON.parse(val);
      handleChange('objectives', parsed);
    } catch {}
  };
  const handleActivitiesChange = (val: string) => {
    setActivitiesStr(val);
    try {
      const parsed = JSON.parse(val);
      handleChange('activities', parsed);
    } catch {}
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
    <div>
      <h3>{isCreate ? 'Create Session' : 'Edit Session'}</h3>
      <div>
        <label>Type:</label>
        <input value={session.type} onChange={e => handleChange('type', e.target.value)} />
      </div>
      <div>
        <label>Status:</label>
        <input value={session.status} onChange={e => handleChange('status', e.target.value)} />
      </div>
      <div>
        <label>Notes:</label>
        <textarea value={session.notes || ''} onChange={e => handleChange('notes', e.target.value)} />
      </div>
      <div>
        <label>Objectives (JSON):</label>
        <textarea value={objectivesStr} onChange={e => handleObjectivesChange(e.target.value)} rows={4} />
      </div>
      <div>
        <label>Activities (JSON):</label>
        <textarea value={activitiesStr} onChange={e => handleActivitiesChange(e.target.value)} rows={4} />
      </div>
      <div>
        <label>AI Suggestions:</label>
        {aiSuggestions.length === 0 && <div>No suggestions.</div>}
        <ul>
          {aiSuggestions.map((s: any, idx: number) => (
            <li key={idx} style={{ border: '1px solid #ddd', margin: '4px', padding: '4px' }}>
              <div><strong>{s.type || 'Suggestion'}:</strong> {editSuggestionIdx === idx ? (
                <textarea
                  value={editSuggestionContent}
                  onChange={e => setEditSuggestionContent(e.target.value)}
                  rows={2}
                  style={{ width: '100%' }}
                />
              ) : s.content}</div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                Generated by: {s.generatedBy || 'AI'} | Time: {s.timestamp ? new Date(s.timestamp).toLocaleString() : 'N/A'} | Status: {s.status || 'pending'}
              </div>
              <div style={{ marginTop: 4 }}>
                {editSuggestionIdx === idx ? (
                  <>
                    <button onClick={() => handleSaveEditedSuggestion(idx)}>Save Edit</button>
                    <button onClick={() => setEditSuggestionIdx(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleAcceptSuggestion(idx)}>Accept</button>
                    <button onClick={() => handleEditSuggestion(idx)}>Edit</button>
                    <button onClick={() => handleRejectSuggestion(idx)}>Reject</button>
                  </>
                )}
              </div>
              {/* Audit trail/history */}
              {Array.isArray(s.history) && s.history.length > 0 && (
                <div style={{ fontSize: '0.8em', marginTop: 4, background: '#f9f9f9', padding: 4 }}>
                  <strong>Audit Trail:</strong>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {s.history.map((h: any, hidx: number) => (
                      <li key={hidx}>
                        [{h.timestamp ? new Date(h.timestamp).toLocaleString() : ''}] {h.user}: {h.action}{h.content ? ` (content: ${h.content})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleSave} disabled={saving || isSaving}>{(saving || isSaving) ? 'Saving...' : (isCreate ? 'Create' : 'Save')}</button>
      <div style={{ fontSize: '0.85em', color: '#888', marginTop: 8 }}>
        Changes to AI suggestions (accept/edit/reject) are tracked and saved to the audit trail. Remember to save the session to persist these actions.
      </div>
    </div>
  );
};

export default SessionEditor;
