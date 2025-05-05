/**
 * WebRTC Signaling Service using Socket.IO
 */
import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { SignalingMessage } from './types';

export class SignalingService {
  private socket: Socket | null = null;
  private eventEmitter: EventEmitter;
  private signalingUrl: string;
  private connected: boolean = false;
  
  constructor(signalingUrl: string) {
    this.signalingUrl = signalingUrl;
    this.eventEmitter = new EventEmitter();
  }
  
  /**
   * Connect to the signaling server
   */
  async connect(): Promise<void> {
    if (this.connected) return;
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.signalingUrl, {
          path: '/api/rtc',
          transports: ['websocket', 'polling'],
          auth: {
            token: localStorage.getItem('auth_token') || '',
          },
        });
        
        this.socket.on('connect', () => {
          this.connected = true;
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Signaling connection error:', error);
          reject(error);
        });
        
        this.socket.on('signal', (message: SignalingMessage) => {
          this.handleSignalingMessage(message);
        });
        
        this.socket.on('disconnect', () => {
          this.connected = false;
          this.eventEmitter.emit('disconnected');
        });
      } catch (error) {
        console.error('Error connecting to signaling server:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from the signaling server
   */
  async disconnect(): Promise<void> {
    if (!this.socket || !this.connected) return;
    
    return new Promise((resolve) => {
      this.socket!.disconnect();
      this.socket = null;
      this.connected = false;
      resolve();
    });
  }
  
  /**
   * Join a session
   */
  joinSession(sessionId: string, userId: string, role: string): void {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected to signaling server');
    }
    
    const message: SignalingMessage = {
      type: 'join',
      sessionId,
      payload: { role },
      sender: userId,
      timestamp: Date.now(),
    };
    
    this.socket.emit('signal', message);
  }
  
  /**
   * Leave a session
   */
  leaveSession(sessionId: string, userId: string): void {
    if (!this.socket || !this.connected) return;
    
    const message: SignalingMessage = {
      type: 'leave',
      sessionId,
      payload: {},
      sender: userId,
      timestamp: Date.now(),
    };
    
    this.socket.emit('signal', message);
  }
  
  /**
   * Send an offer to the signaling server
   */
  sendOffer(sessionId: string, offer: RTCSessionDescriptionInit, userId: string, recipient?: string): void {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected to signaling server');
    }
    
    const message: SignalingMessage = {
      type: 'offer',
      sessionId,
      payload: offer,
      sender: userId,
      recipient,
      timestamp: Date.now(),
    };
    
    this.socket.emit('signal', message);
  }
  
  /**
   * Send an answer to the signaling server
   */
  sendAnswer(sessionId: string, answer: RTCSessionDescriptionInit, userId: string, recipient?: string): void {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected to signaling server');
    }
    
    const message: SignalingMessage = {
      type: 'answer',
      sessionId,
      payload: answer,
      sender: userId,
      recipient,
      timestamp: Date.now(),
    };
    
    this.socket.emit('signal', message);
  }
  
  /**
   * Send an ICE candidate to the signaling server
   */
  sendICECandidate(sessionId: string, candidate: RTCIceCandidate, userId: string, recipient?: string): void {
    if (!this.socket || !this.connected) {
      throw new Error('Not connected to signaling server');
    }
    
    const message: SignalingMessage = {
      type: 'ice-candidate',
      sessionId,
      payload: candidate,
      sender: userId,
      recipient,
      timestamp: Date.now(),
    };
    
    this.socket.emit('signal', message);
  }
  
  /**
   * Handle incoming signaling messages
   */
  private handleSignalingMessage(message: SignalingMessage): void {
    this.eventEmitter.emit(message.type, message);
  }
  
  /**
   * Add event listener
   */
  on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }
  
  /**
   * Remove event listener
   */
  off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }
}