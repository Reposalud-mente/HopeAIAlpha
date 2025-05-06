/**
 * Conversation Session Manager for AI Assistant
 *
 * This module manages multiple conversation sessions for the AI assistant,
 * allowing users to have separate, independent conversations.
 */

import { Message } from './ai-assistant-service';
import { generateUniqueId } from '@/lib/utils/id-generator';

// Define the conversation session type
export interface ConversationSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Base storage key for sessions
const BASE_STORAGE_KEY = 'ai-assistant-sessions';

// Get the storage key for the current user
function getStorageKey(userId?: string): string {
  // If we have a user ID, include it in the storage key to separate sessions by user
  return userId ? `${BASE_STORAGE_KEY}-${userId}` : BASE_STORAGE_KEY;
}

/**
 * Class to manage conversation sessions
 */
export class ConversationSessionManager {
  private sessions: ConversationSession[];
  private activeSessionId: string | null;
  private userId?: string;

  /**
   * Constructor
   * @param userId Optional user ID to separate sessions by user
   */
  constructor(userId?: string) {
    this.sessions = [];
    this.activeSessionId = null;
    this.userId = userId;
    this.loadSessions();
  }

  /**
   * Load sessions from localStorage
   */
  private loadSessions(): void {
    try {
      // Get the storage key for the current user
      const storageKey = getStorageKey(this.userId);

      const storedSessions = localStorage.getItem(storageKey);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        if (Array.isArray(parsedSessions)) {
          // Convert date strings back to Date objects and ensure unique message IDs
          this.sessions = parsedSessions.map(session => {
            // Ensure each message has a unique ID
            const messagesWithUniqueIds = session.messages.map((message: Message) => ({
              ...message,
              // If the ID might be a duplicate (timestamp-based), regenerate it
              id: message.id.includes('_') ? message.id : generateUniqueId(message.role)
            }));

            return {
              ...session,
              messages: messagesWithUniqueIds,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt)
            };
          });

          // Set the active session to the most recent one
          if (this.sessions.length > 0) {
            this.activeSessionId = this.sessions[0].id;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load conversation sessions:', error);
      // If loading fails, initialize with empty sessions
      this.sessions = [];
      this.activeSessionId = null;
    }
  }

  /**
   * Save sessions to localStorage
   */
  private saveSessions(): void {
    try {
      // Get the storage key for the current user
      const storageKey = getStorageKey(this.userId);

      localStorage.setItem(storageKey, JSON.stringify(this.sessions));
      console.log('Saved sessions to localStorage:', this.sessions.length);
    } catch (error) {
      console.error('Failed to save conversation sessions:', error);
    }
  }

  /**
   * Save the active session with its current messages
   * This is a public method that can be called to force a save
   */
  saveActiveSession(): void {
    const activeSession = this.getActiveSession();
    if (activeSession) {
      activeSession.updatedAt = new Date();
      this.saveSessions();
    }
  }

  /**
   * Create a new conversation session
   * @param title Optional title for the session
   * @returns The new session
   */
  createSession(title: string = 'Nueva conversación'): ConversationSession {
    const now = new Date();
    const newSession: ConversationSession = {
      id: Date.now().toString(),
      title,
      messages: [],
      createdAt: now,
      updatedAt: now
    };

    // Add the new session to the beginning of the array
    this.sessions.unshift(newSession);

    // Set it as the active session
    this.activeSessionId = newSession.id;

    // Save the updated sessions
    this.saveSessions();

    return newSession;
  }

  /**
   * Get the active session
   * @returns The active session or null if none exists
   */
  getActiveSession(): ConversationSession | null {
    if (!this.activeSessionId) {
      return null;
    }

    const session = this.sessions.find(s => s.id === this.activeSessionId);
    return session || null;
  }

  /**
   * Set the active session
   * @param sessionId The ID of the session to set as active
   * @returns The active session or null if not found
   */
  setActiveSession(sessionId: string): ConversationSession | null {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      this.activeSessionId = sessionId;
      return session;
    }
    return null;
  }

  /**
   * Get all sessions
   * @returns Array of all sessions
   */
  getAllSessions(): ConversationSession[] {
    return [...this.sessions];
  }

  /**
   * Add a message to the active session
   * @param message The message to add
   * @returns The updated session or null if no active session
   */
  addMessage(message: Message): ConversationSession | null {
    const activeSession = this.getActiveSession();
    if (!activeSession) {
      return null;
    }

    // Ensure the message has a unique ID
    const messageWithUniqueId = {
      ...message,
      // If the ID doesn't follow our unique format, regenerate it
      id: message.id.includes('_') ? message.id : generateUniqueId(message.role)
    };

    // Add the message to the active session
    activeSession.messages.push(messageWithUniqueId);
    activeSession.updatedAt = new Date();

    // Save the updated sessions
    this.saveSessions();

    return activeSession;
  }

  /**
   * Update the title of a session
   * @param sessionId The ID of the session to update
   * @param title The new title
   * @returns The updated session or null if not found
   */
  updateSessionTitle(sessionId: string, title: string): ConversationSession | null {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = title;
      session.updatedAt = new Date();
      this.saveSessions();
      return session;
    }
    return null;
  }

  /**
   * Delete a session
   * @param sessionId The ID of the session to delete
   * @returns True if the session was deleted, false otherwise
   */
  deleteSession(sessionId: string): boolean {
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.id !== sessionId);

    // If we deleted the active session, set the most recent one as active
    if (this.activeSessionId === sessionId && this.sessions.length > 0) {
      this.activeSessionId = this.sessions[0].id;
    } else if (this.sessions.length === 0) {
      this.activeSessionId = null;
    }

    // Save the updated sessions
    this.saveSessions();

    return this.sessions.length < initialLength;
  }

  /**
   * Clear all messages from a session
   * @param sessionId The ID of the session to clear
   * @returns The updated session or null if not found
   */
  clearSessionMessages(sessionId: string): ConversationSession | null {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = [];
      session.updatedAt = new Date();
      this.saveSessions();
      return session;
    }
    return null;
  }

  /**
   * Clear all messages from the active session
   * @returns The updated session or null if no active session
   */
  clearActiveSessionMessages(): ConversationSession | null {
    if (!this.activeSessionId) {
      return null;
    }
    return this.clearSessionMessages(this.activeSessionId);
  }

  /**
   * Get the messages from the active session
   * @returns Array of messages from the active session or empty array if no active session
   */
  getActiveSessionMessages(): Message[] {
    const activeSession = this.getActiveSession();
    return activeSession ? [...activeSession.messages] : [];
  }
}

// Store instances by user ID
const sessionManagerInstances: Map<string, ConversationSessionManager> = new Map();

/**
 * Get the singleton instance of the ConversationSessionManager
 * @param userId Optional user ID to separate sessions by user
 * @returns The ConversationSessionManager instance
 */
export function getConversationSessionManager(userId?: string): ConversationSessionManager {
  // Use a special key for anonymous users
  const key = userId || 'anonymous';

  // Get or create an instance for this user
  if (!sessionManagerInstances.has(key)) {
    sessionManagerInstances.set(key, new ConversationSessionManager(userId));
  }

  return sessionManagerInstances.get(key)!;
}