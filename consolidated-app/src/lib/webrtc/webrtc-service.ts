/**
 * WebRTC Service
 * 
 * This service handles WebRTC connections, media streams, and signaling for the HopeAI telehealth platform.
 * It provides a clean API for establishing peer-to-peer connections between patients and healthcare providers.
 * 
 * HIPAA Compliance:
 * - All connections are encrypted (WebRTC's built-in encryption)
 * - No media is stored on servers
 * - Signaling is authenticated and secured
 * - Connection quality is monitored for telehealth reliability
 */

import { io, Socket } from 'socket.io-client';
import EventEmitter from 'events';

// Define connection quality levels
export type ConnectionQualityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

// Define connection quality object
export interface ConnectionQuality {
  level: ConnectionQualityLevel;
  rtt?: number;          // Round-trip time in ms
  packetLoss?: number;   // Packet loss percentage
  bandwidth?: number;    // Available bandwidth in kbps
  timestamp: number;     // When the measurement was taken
}

// Define session participant
export interface SessionParticipant {
  id: string;
  role: 'PATIENT' | 'THERAPIST';
}

// Define WebRTC configuration
export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
  sdpSemantics?: 'unified-plan' | 'plan-b';
}

// Define WebRTC service events
export interface WebRTCServiceEvents {
  // Connection events
  'connectionStateChange': (state: RTCPeerConnectionState) => void;
  'iceConnectionStateChange': (state: RTCIceConnectionState) => void;
  'signalingStateChange': (state: RTCSignalingState) => void;
  'connectionQualityChange': (quality: ConnectionQuality) => void;
  'error': (error: Error) => void;
  
  // Session events
  'sessionJoined': (sessionId: string, participants: SessionParticipant[]) => void;
  'participantJoined': (participant: SessionParticipant) => void;
  'participantLeft': (userId: string) => void;
  
  // Media events
  'localStream': (stream: MediaStream) => void;
  'remoteStream': (stream: MediaStream) => void;
  'audioToggled': (muted: boolean) => void;
  'videoToggled': (muted: boolean) => void;
  'screenSharingStarted': (stream: MediaStream) => void;
  'screenSharingStopped': () => void;
}

/**
 * WebRTC Service class for managing WebRTC connections
 */
export class WebRTCService extends EventEmitter {
  // Configuration
  private config: WebRTCConfig;
  private sessionId: string;
  private userId: string;
  private role: 'PATIENT' | 'THERAPIST';
  
  // Connection objects
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  
  // Media streams
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  
  // State tracking
  private isConnected = false;
  private isConnecting = false;
  private isVideoMuted = false;
  private isAudioMuted = false;
  private isScreenSharing = false;
  private connectionQuality: ConnectionQuality | null = null;
  private connectionMonitorInterval: NodeJS.Timeout | null = null;
  
  // Remote participant info
  private remoteUserId: string | null = null;
  private remoteUserRole: 'PATIENT' | 'THERAPIST' | null = null;
  
  /**
   * Constructor
   * @param config WebRTC configuration
   * @param sessionId Session identifier
   * @param userId User identifier
   * @param role User role (PATIENT or THERAPIST)
   */
  constructor(
    config: WebRTCConfig,
    sessionId: string,
    userId: string,
    role: 'PATIENT' | 'THERAPIST'
  ) {
    super();
    
    this.config = config;
    this.sessionId = sessionId;
    this.userId = userId;
    this.role = role;
    
    // Set max listeners to avoid memory leak warnings
    this.setMaxListeners(20);
  }
  
  /**
   * Initialize the signaling connection
   * @param token Authentication token
   * @returns Promise that resolves when connected
   */
  public async connectSignaling(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create socket connection to signaling server
        this.socket = io(process.env.NEXT_PUBLIC_SIGNALING_URL || 'http://localhost:3001', {
          transports: ['websocket'],
          auth: { token },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });
        
        // Handle connection events
        this.socket.on('connect', () => {
          console.log('Connected to signaling server');
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Signaling connection error:', error);
          reject(new Error('Failed to connect to signaling server'));
        });
        
        this.socket.on('error', (error) => {
          console.error('Signaling error:', error);
          this.emit('error', new Error(error.message || 'Signaling server error'));
        });
        
        // Set up signaling event handlers
        this.setupSignalingEvents();
      } catch (error) {
        console.error('Error connecting to signaling server:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Set up signaling event handlers
   */
  private setupSignalingEvents(): void {
    if (!this.socket) return;
    
    // Session events
    this.socket.on('session-joined', ({ sessionId, participants }) => {
      console.log(`Joined session ${sessionId} with ${participants.length} other participants`);
      this.emit('sessionJoined', sessionId, participants);
      
      // If there's another participant, initiate connection
      if (participants.length > 0) {
        const otherParticipant = participants[0];
        this.remoteUserId = otherParticipant.id;
        this.remoteUserRole = otherParticipant.role;
        
        // Create peer connection and send offer if we're the therapist
        // or if we're the patient and there's no therapist yet
        if (this.role === 'THERAPIST' || 
            (this.role === 'PATIENT' && otherParticipant.role !== 'THERAPIST')) {
          this.createPeerConnection();
          this.createAndSendOffer();
        }
      }
    });
    
    this.socket.on('participant-joined', ({ userId, role }) => {
      console.log(`Participant joined: ${userId} (${role})`);
      
      this.remoteUserId = userId;
      this.remoteUserRole = role;
      
      // Create peer connection if we're the therapist or if we're the patient and the new participant is not a therapist
      if (this.role === 'THERAPIST' || 
          (this.role === 'PATIENT' && role !== 'THERAPIST')) {
        this.createPeerConnection();
        this.createAndSendOffer();
      }
      
      this.emit('participantJoined', { id: userId, role });
    });
    
    this.socket.on('participant-left', ({ userId }) => {
      console.log(`Participant left: ${userId}`);
      
      if (userId === this.remoteUserId) {
        this.remoteUserId = null;
        this.remoteUserRole = null;
        this.closePeerConnection();
      }
      
      this.emit('participantLeft', userId);
    });
    
    // WebRTC signaling events
    this.socket.on('offer', async ({ userId, offer }) => {
      console.log(`Received offer from ${userId}`);
      
      this.remoteUserId = userId;
      
      // Create peer connection if it doesn't exist
      if (!this.peerConnection) {
        this.createPeerConnection();
      }
      
      try {
        // Set remote description from offer
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Create and send answer
        const answer = await this.peerConnection?.createAnswer();
        await this.peerConnection?.setLocalDescription(answer);
        
        // Send answer to remote peer
        this.socket?.emit('answer', {
          targetUserId: userId,
          answer: this.peerConnection?.localDescription
        });
      } catch (error) {
        console.error('Error handling offer:', error);
        this.emit('error', new Error('Failed to process offer'));
      }
    });
    
    this.socket.on('answer', async ({ userId, answer }) => {
      console.log(`Received answer from ${userId}`);
      
      try {
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
        this.emit('error', new Error('Failed to process answer'));
      }
    });
    
    this.socket.on('ice-candidate', async ({ userId, candidate }) => {
      try {
        if (candidate && this.peerConnection) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });
    
    // Connection quality events
    this.socket.on('participant-connection-quality', ({ userId, quality }) => {
      if (userId === this.remoteUserId) {
        // Update remote connection quality if needed
        console.log(`Remote connection quality: ${quality.level}`);
      }
    });
  }
  
  /**
   * Join a session
   * @returns Promise that resolves when joined
   */
  public async joinSession(): Promise<void> {
    if (!this.socket) {
      throw new Error('Not connected to signaling server');
    }
    
    if (this.isConnecting || this.isConnected) {
      throw new Error('Already joining or joined a session');
    }
    
    this.isConnecting = true;
    
    try {
      // Initialize local media
      await this.initializeLocalMedia();
      
      // Join the session room
      this.socket.emit('join-session', {
        sessionId: this.sessionId,
        role: this.role
      });
      
      this.isConnecting = false;
      this.isConnected = true;
      
      // Start connection quality monitoring
      this.startConnectionMonitoring();
      
      return Promise.resolve();
    } catch (error) {
      this.isConnecting = false;
      console.error('Error joining session:', error);
      throw error;
    }
  }
  
  /**
   * Leave the current session
   * @returns Promise that resolves when left
   */
  public async leaveSession(): Promise<void> {
    if (!this.isConnected) {
      return Promise.resolve();
    }
    
    try {
      // Stop connection monitoring
      this.stopConnectionMonitoring();
      
      // Close peer connection
      this.closePeerConnection();
      
      // Leave the session room
      this.socket?.emit('leave-session');
      
      // Stop local media
      this.stopLocalMedia();
      
      // Reset state
      this.isConnected = false;
      this.remoteUserId = null;
      this.remoteUserRole = null;
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error leaving session:', error);
      throw error;
    }
  }
  
  /**
   * Initialize local media (audio and video)
   * @returns Promise that resolves with the local media stream
   */
  public async initializeLocalMedia(): Promise<MediaStream> {
    try {
      // Request user media with audio and video
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      this.localStream = stream;
      this.emit('localStream', stream);
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera or microphone');
    }
  }
  
  /**
   * Stop local media streams
   */
  private stopLocalMedia(): void {
    // Stop all tracks in the local stream
    this.localStream?.getTracks().forEach(track => track.stop());
    this.localStream = null;
    
    // Stop screen sharing if active
    if (this.isScreenSharing) {
      this.stopScreenSharing();
    }
  }
  
  /**
   * Create a WebRTC peer connection
   */
  private createPeerConnection(): void {
    try {
      // Close existing connection if any
      this.closePeerConnection();
      
      // Create new peer connection with config
      this.peerConnection = new RTCPeerConnection(this.config);
      
      // Add local tracks to the connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection?.addTrack(track, this.localStream!);
        });
      }
      
      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.remoteUserId) {
          this.socket?.emit('ice-candidate', {
            targetUserId: this.remoteUserId,
            candidate: event.candidate
          });
        }
      };
      
      // Handle ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
        this.emit('iceConnectionStateChange', this.peerConnection?.iceConnectionState);
      };
      
      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection?.connectionState);
        this.emit('connectionStateChange', this.peerConnection?.connectionState);
      };
      
      // Handle signaling state changes
      this.peerConnection.onsignalingstatechange = () => {
        console.log('Signaling state:', this.peerConnection?.signalingState);
        this.emit('signalingStateChange', this.peerConnection?.signalingState);
      };
      
      // Handle remote tracks
      this.peerConnection.ontrack = (event) => {
        console.log('Remote track received:', event.track.kind);
        
        // Create remote stream if it doesn't exist
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
          this.emit('remoteStream', this.remoteStream);
        }
        
        // Add the track to the remote stream
        this.remoteStream.addTrack(event.track);
      };
      
      console.log('Peer connection created');
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw new Error('Failed to create peer connection');
    }
  }
  
  /**
   * Close the peer connection
   */
  private closePeerConnection(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      this.remoteStream = null;
    }
  }
  
  /**
   * Create and send an offer to the remote peer
   */
  private async createAndSendOffer(): Promise<void> {
    if (!this.peerConnection || !this.remoteUserId) return;
    
    try {
      // Create offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      // Set local description
      await this.peerConnection.setLocalDescription(offer);
      
      // Send offer to remote peer
      this.socket?.emit('offer', {
        targetUserId: this.remoteUserId,
        offer: this.peerConnection.localDescription
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      this.emit('error', new Error('Failed to create offer'));
    }
  }
  
  /**
   * Toggle video mute state
   * @returns New mute state
   */
  public toggleVideo(): boolean {
    if (!this.localStream) return this.isVideoMuted;
    
    const videoTracks = this.localStream.getVideoTracks();
    
    // Toggle enabled state for all video tracks
    videoTracks.forEach(track => {
      track.enabled = this.isVideoMuted;
    });
    
    // Update mute state
    this.isVideoMuted = !this.isVideoMuted;
    
    // Emit event
    this.emit('videoToggled', this.isVideoMuted);
    
    return this.isVideoMuted;
  }
  
  /**
   * Toggle audio mute state
   * @returns New mute state
   */
  public toggleAudio(): boolean {
    if (!this.localStream) return this.isAudioMuted;
    
    const audioTracks = this.localStream.getAudioTracks();
    
    // Toggle enabled state for all audio tracks
    audioTracks.forEach(track => {
      track.enabled = this.isAudioMuted;
    });
    
    // Update mute state
    this.isAudioMuted = !this.isAudioMuted;
    
    // Emit event
    this.emit('audioToggled', this.isAudioMuted);
    
    return this.isAudioMuted;
  }
  
  /**
   * Start screen sharing
   * @returns Promise that resolves with the screen sharing stream
   */
  public async startScreenSharing(): Promise<MediaStream> {
    if (this.isScreenSharing) {
      return this.screenStream!;
    }
    
    try {
      // Request screen sharing
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      // Store screen stream
      this.screenStream = stream;
      
      // Replace video track in peer connection
      if (this.peerConnection) {
        const videoTrack = stream.getVideoTracks()[0];
        
        // Find sender for video track
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track?.kind === 'video'
        );
        
        if (videoSender) {
          await videoSender.replaceTrack(videoTrack);
        }
      }
      
      // Update state
      this.isScreenSharing = true;
      
      // Handle screen sharing stop
      stream.getVideoTracks()[0].onended = () => {
        this.stopScreenSharing();
      };
      
      // Emit event
      this.emit('screenSharingStarted', stream);
      
      return stream;
    } catch (error) {
      console.error('Error starting screen sharing:', error);
      throw new Error('Failed to start screen sharing');
    }
  }
  
  /**
   * Stop screen sharing
   */
  public async stopScreenSharing(): Promise<void> {
    if (!this.isScreenSharing || !this.screenStream) return;
    
    try {
      // Stop all tracks in screen stream
      this.screenStream.getTracks().forEach(track => track.stop());
      
      // Replace with camera video track
      if (this.peerConnection && this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        
        // Find sender for video track
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track?.kind === 'video'
        );
        
        if (videoSender && videoTrack) {
          await videoSender.replaceTrack(videoTrack);
        }
      }
      
      // Update state
      this.isScreenSharing = false;
      this.screenStream = null;
      
      // Emit event
      this.emit('screenSharingStopped');
    } catch (error) {
      console.error('Error stopping screen sharing:', error);
      throw new Error('Failed to stop screen sharing');
    }
  }
  
  /**
   * Start monitoring connection quality
   */
  private startConnectionMonitoring(): void {
    // Clear existing interval if any
    this.stopConnectionMonitoring();
    
    // Set up monitoring interval
    this.connectionMonitorInterval = setInterval(async () => {
      if (!this.peerConnection) return;
      
      try {
        // Get connection stats
        const stats = await this.peerConnection.getStats();
        
        let rtt = 0;
        let packetsLost = 0;
        let packetsReceived = 0;
        let bandwidth = 0;
        
        // Process stats
        stats.forEach(report => {
          if (report.type === 'remote-inbound-rtp') {
            rtt = report.roundTripTime ? report.roundTripTime * 1000 : 0;
          }
          
          if (report.type === 'inbound-rtp') {
            packetsLost = report.packetsLost || 0;
            packetsReceived = report.packetsReceived || 0;
          }
          
          if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            bandwidth = report.availableOutgoingBitrate 
              ? report.availableOutgoingBitrate / 1000 
              : 0;
          }
        });
        
        // Calculate packet loss percentage
        const packetLoss = packetsReceived > 0 
          ? (packetsLost / (packetsLost + packetsReceived)) * 100 
          : 0;
        
        // Determine connection quality level
        let level: ConnectionQualityLevel = 'excellent';
        
        if (rtt > 300 || packetLoss > 15 || bandwidth < 100) {
          level = 'critical';
        } else if (rtt > 200 || packetLoss > 10 || bandwidth < 300) {
          level = 'poor';
        } else if (rtt > 100 || packetLoss > 5 || bandwidth < 500) {
          level = 'fair';
        } else if (rtt > 50 || packetLoss > 2 || bandwidth < 1000) {
          level = 'good';
        }
        
        // Create connection quality object
        const quality: ConnectionQuality = {
          level,
          rtt,
          packetLoss,
          bandwidth,
          timestamp: Date.now()
        };
        
        // Update state
        this.connectionQuality = quality;
        
        // Emit event
        this.emit('connectionQualityChange', quality);
        
        // Send to signaling server
        this.socket?.emit('connection-quality', { quality });
      } catch (error) {
        console.error('Error monitoring connection:', error);
      }
    }, 2000); // Check every 2 seconds
  }
  
  /**
   * Stop connection quality monitoring
   */
  private stopConnectionMonitoring(): void {
    if (this.connectionMonitorInterval) {
      clearInterval(this.connectionMonitorInterval);
      this.connectionMonitorInterval = null;
    }
  }
  
  /**
   * Get the current connection quality
   * @returns Connection quality or null if not available
   */
  public getConnectionQuality(): ConnectionQuality | null {
    return this.connectionQuality;
  }
  
  /**
   * Get the local media stream
   * @returns Local media stream or null if not available
   */
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }
  
  /**
   * Get the remote media stream
   * @returns Remote media stream or null if not available
   */
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
  
  /**
   * Check if video is muted
   * @returns True if video is muted
   */
  public isVideoMutedState(): boolean {
    return this.isVideoMuted;
  }
  
  /**
   * Check if audio is muted
   * @returns True if audio is muted
   */
  public isAudioMutedState(): boolean {
    return this.isAudioMuted;
  }
  
  /**
   * Check if screen sharing is active
   * @returns True if screen sharing is active
   */
  public isScreenSharingActive(): boolean {
    return this.isScreenSharing;
  }
  
  /**
   * Disconnect from signaling server
   */
  public disconnect(): void {
    // Leave session if connected
    if (this.isConnected) {
      this.leaveSession();
    }
    
    // Disconnect socket
    this.socket?.disconnect();
    this.socket = null;
  }
}