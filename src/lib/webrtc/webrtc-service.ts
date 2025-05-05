/**
 * WebRTC Service for managing peer connections
 */
import { EventEmitter } from 'events';
import {
  DEFAULT_RTC_CONFIG,
  DEFAULT_AUDIO_CONSTRAINTS,
  DEFAULT_VIDEO_CONSTRAINTS,
  PeerConnection,
  SignalingMessage,
  WebRTCConfig
} from './types';
import { SignalingService } from './signaling-service';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private signaling: SignalingService;
  private eventEmitter: EventEmitter;
  private sessionId: string;
  private userId: string;
  private role: 'THERAPIST' | 'PATIENT';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private autoReconnect: boolean = true;
  private isVideoMuted: boolean = false;
  private isAudioMuted: boolean = false;
  private isScreenSharing: boolean = false;
  private screenStream: MediaStream | null = null;

  constructor(config: WebRTCConfig, sessionId: string, userId: string, role: 'THERAPIST' | 'PATIENT') {
    this.signaling = new SignalingService(config.signalingUrl);
    this.eventEmitter = new EventEmitter();
    this.sessionId = sessionId;
    this.userId = userId;
    this.role = role;
    this.maxReconnectAttempts = config.maxReconnectAttempts || 5;
    this.autoReconnect = config.autoReconnect !== false;

    this.setupSignalingListeners();
  }

  /**
   * Initialize local media stream with audio and video
   */
  async initializeLocalMedia(
    constraints: MediaStreamConstraints = {
      audio: DEFAULT_AUDIO_CONSTRAINTS,
      video: DEFAULT_VIDEO_CONSTRAINTS
    }
  ): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.eventEmitter.emit('localStream', this.localStream);
      return this.localStream;
    } catch (error) {
      this.handleMediaError(error);
      throw new Error(`Failed to access media devices: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create RTCPeerConnection and set up event handlers
   */
  async createPeerConnection(): Promise<RTCPeerConnection> {
    this.peerConnection = new RTCPeerConnection(DEFAULT_RTC_CONFIG);

    // Add local tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Set up event handlers
    this.peerConnection.onicecandidate = this.handleICECandidate.bind(this);
    this.peerConnection.ontrack = this.handleRemoteTrack.bind(this);
    this.peerConnection.onconnectionstatechange = this.handleConnectionStateChange.bind(this);
    this.peerConnection.onicecandidateerror = this.handleICECandidateError.bind(this);
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChange.bind(this);

    // Create data channel if needed
    this.createDataChannel();

    return this.peerConnection;
  }

  /**
   * Create a data channel for sending text messages
   */
  private createDataChannel(): void {
    if (!this.peerConnection) return;

    try {
      this.dataChannel = this.peerConnection.createDataChannel('chat', {
        ordered: true,
      });

      this.dataChannel.onopen = () => {
        this.eventEmitter.emit('dataChannelOpen');
      };

      this.dataChannel.onclose = () => {
        this.eventEmitter.emit('dataChannelClose');
      };

      this.dataChannel.onmessage = (event) => {
        this.eventEmitter.emit('dataChannelMessage', event.data);
      };
    } catch (error) {
      console.error('Error creating data channel:', error);
    }
  }

  /**
   * Handle ICE candidate events
   */
  private handleICECandidate(event: RTCPeerConnectionIceEvent): void {
    if (event.candidate) {
      this.signaling.sendICECandidate(
        this.sessionId,
        event.candidate,
        this.userId
      );
    }
  }

  /**
   * Handle remote track events
   */
  private handleRemoteTrack(event: RTCTrackEvent): void {
    if (!this.remoteStream) {
      this.remoteStream = new MediaStream();
      this.eventEmitter.emit('remoteStream', this.remoteStream);
    }

    event.streams[0].getTracks().forEach(track => {
      this.remoteStream!.addTrack(track);
    });
  }

  /**
   * Handle connection state changes
   */
  private handleConnectionStateChange(): void {
    if (!this.peerConnection) return;

    const state = this.peerConnection.connectionState;
    this.eventEmitter.emit('connectionStateChange', state);

    if (state === 'connected') {
      this.reconnectAttempts = 0;
      this.eventEmitter.emit('connected');
    } else if (state === 'failed' || state === 'disconnected') {
      this.eventEmitter.emit('disconnected', state);

      if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.eventEmitter.emit('reconnecting', this.reconnectAttempts);
        this.reconnect();
      }
    }
  }

  /**
   * Handle ICE connection state changes
   */
  private handleICEConnectionStateChange(): void {
    if (!this.peerConnection) return;

    const state = this.peerConnection.iceConnectionState;
    this.eventEmitter.emit('iceConnectionStateChange', state);
  }

  /**
   * Handle ICE candidate errors
   */
  private handleICECandidateError(event: Event): void {
    this.eventEmitter.emit('error', {
      type: 'ice-candidate-error',
      error: event
    });
  }

  /**
   * Handle media errors
   */
  private handleMediaError(error: unknown): void {
    this.eventEmitter.emit('error', {
      type: 'media-error',
      error: error instanceof Error ? error : new Error(String(error))
    });
  }

  /**
   * Set up signaling listeners
   */
  private setupSignalingListeners(): void {
    this.signaling.on('signal', this.handleSignalingMessage.bind(this));
    this.signaling.on('disconnected', () => {
      this.eventEmitter.emit('signalingDisconnected');
    });
  }

  /**
   * Handle incoming signaling messages
   */
  private handleSignalingMessage(message: SignalingMessage): void {
    if (message.sessionId !== this.sessionId) return;

    switch (message.type) {
      case 'offer':
        this.handleOffer(message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'ice-candidate':
        this.handleRemoteICECandidate(message);
        break;
      default:
        console.warn('Unknown signaling message type:', message.type);
    }
  }

  /**
   * Handle remote offer
   */
  private async handleOffer(message: SignalingMessage): Promise<void> {
    if (!this.peerConnection) {
      await this.createPeerConnection();
    }

    try {
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(message.payload));

      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);

      this.signaling.sendAnswer(
        this.sessionId,
        answer,
        this.userId,
        message.sender
      );
    } catch (error) {
      console.error('Error handling offer:', error);
      this.eventEmitter.emit('error', {
        type: 'offer-error',
        error
      });
    }
  }

  /**
   * Handle remote answer
   */
  private async handleAnswer(message: SignalingMessage): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.payload));
    } catch (error) {
      console.error('Error handling answer:', error);
      this.eventEmitter.emit('error', {
        type: 'answer-error',
        error
      });
    }
  }

  /**
   * Handle remote ICE candidate
   */
  private async handleRemoteICECandidate(message: SignalingMessage): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(message.payload);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      this.eventEmitter.emit('error', {
        type: 'ice-candidate-error',
        error
      });
    }
  }

  /**
   * Join a session
   */
  async joinSession(): Promise<void> {
    try {
      // Connect to signaling server
      await this.signaling.connect();

      // Create peer connection if not exists
      if (!this.peerConnection) {
        await this.createPeerConnection();
      }

      // Create and send offer if we are the therapist
      if (this.role === 'THERAPIST') {
        const offer = await this.peerConnection!.createOffer();
        await this.peerConnection!.setLocalDescription(offer);

        this.signaling.sendOffer(
          this.sessionId,
          offer,
          this.userId
        );
      }

      // Join the session room
      this.signaling.joinSession(this.sessionId, this.userId, this.role);
    } catch (error) {
      console.error('Error joining session:', error);
      this.eventEmitter.emit('error', {
        type: 'join-error',
        error
      });
      throw error;
    }
  }

  /**
   * Leave the current session
   */
  leaveSession(): void {
    // Leave the signaling session
    this.signaling.leaveSession(this.sessionId, this.userId);

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Stop screen sharing if active
    this.stopScreenSharing();

    // Emit event
    this.eventEmitter.emit('left');
  }

  /**
   * Reconnect after connection failure
   */
  private async reconnect(): Promise<void> {
    try {
      // Close existing connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      // Create new connection
      await this.createPeerConnection();

      // Rejoin session
      await this.joinSession();
    } catch (error) {
      console.error('Error reconnecting:', error);
      this.eventEmitter.emit('error', {
        type: 'reconnect-error',
        error
      });
    }
  }

  /**
   * Toggle video mute state
   */
  toggleVideo(): boolean {
    if (!this.localStream) return this.isVideoMuted;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return this.isVideoMuted;

    this.isVideoMuted = !this.isVideoMuted;
    videoTracks.forEach(track => {
      track.enabled = !this.isVideoMuted;
    });

    this.eventEmitter.emit('videoToggled', this.isVideoMuted);
    return this.isVideoMuted;
  }

  /**
   * Toggle audio mute state
   */
  toggleAudio(): boolean {
    if (!this.localStream) return this.isAudioMuted;

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return this.isAudioMuted;

    this.isAudioMuted = !this.isAudioMuted;
    audioTracks.forEach(track => {
      track.enabled = !this.isAudioMuted;
    });

    this.eventEmitter.emit('audioToggled', this.isAudioMuted);
    return this.isAudioMuted;
  }

  /**
   * Start screen sharing
   */
  async startScreenSharing(): Promise<boolean> {
    if (!this.peerConnection) return false;

    try {
      // Get screen sharing stream
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      // Replace video track
      const videoTrack = this.screenStream.getVideoTracks()[0];

      const senders = this.peerConnection.getSenders();
      const videoSender = senders.find(sender =>
        sender.track && sender.track.kind === 'video'
      );

      if (videoSender) {
        await videoSender.replaceTrack(videoTrack);
      }

      // Set up track ended event
      videoTrack.onended = () => {
        this.stopScreenSharing();
      };

      this.isScreenSharing = true;
      this.eventEmitter.emit('screenSharingChanged', true);
      return true;
    } catch (error) {
      console.error('Error starting screen sharing:', error);
      this.eventEmitter.emit('error', {
        type: 'screen-sharing-error',
        error
      });
      return false;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenSharing(): Promise<boolean> {
    if (!this.peerConnection || !this.isScreenSharing || !this.localStream) return false;

    try {
      // Stop all screen sharing tracks
      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }

      // Replace with original video track
      const videoTrack = this.localStream.getVideoTracks()[0];

      if (videoTrack) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(sender =>
          sender.track && sender.track.kind === 'video'
        );

        if (videoSender) {
          await videoSender.replaceTrack(videoTrack);
        }
      }

      this.isScreenSharing = false;
      this.eventEmitter.emit('screenSharingChanged', false);
      return true;
    } catch (error) {
      console.error('Error stopping screen sharing:', error);
      this.eventEmitter.emit('error', {
        type: 'screen-sharing-error',
        error
      });
      return false;
    }
  }

  /**
   * Send a message through the data channel
   */
  sendMessage(message: string): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }

    try {
      this.dataChannel.send(message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Register event listener
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

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Get connection state
   */
  getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection ? this.peerConnection.connectionState : null;
  }

  /**
   * Get video mute state
   */
  isVideoEnabled(): boolean {
    return !this.isVideoMuted;
  }

  /**
   * Get audio mute state
   */
  isAudioEnabled(): boolean {
    return !this.isAudioMuted;
  }

  /**
   * Get screen sharing state
   */
  isScreenSharingActive(): boolean {
    return this.isScreenSharing;
  }
}