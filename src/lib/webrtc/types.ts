/**
 * Core WebRTC types and interfaces for the telehealth platform
 */

export interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  streams: MediaStream[];
  connectionState: RTCPeerConnectionState;
  iceCandidates: RTCIceCandidate[];
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'leave' | 'join';
  sessionId: string;
  payload: any;
  sender: string;
  recipient?: string;
  timestamp: number;
}

export const DEFAULT_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30, max: 30 },
  facingMode: 'user',
};

export const DEFAULT_AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 48000,
};

export const DEFAULT_RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Production TURN servers will be configured here
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  iceCandidatePoolSize: 10,
};

export interface WebRTCEvent {
  type: string;
  sessionId: string;
  userId: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

export interface SecurityAlert {
  type: string;
  userId: string;
  count?: number;
  timestamp: string;
  details?: any;
}

export interface SessionDetails {
  session: any;
  sessionToken: string;
  patientDetails: any;
  therapistDetails: any;
  sessionTemplate?: any;
}

export interface SessionSummary {
  notes: string;
  assessmentResults?: any;
  followUpTasks?: FollowUpTask[];
}

export interface FollowUpTask {
  title: string;
  description: string;
  dueDate: Date;
  assignedToId: string;
  patientId: string;
  priority: string;
}

export interface ConnectionQuality {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  timestamp: number;
  videoWidth?: number;
  videoHeight?: number;
  frameRate?: number;
}

export interface BrowserInfo {
  browser: string;
  version: number;
}

export interface WebRTCConfig {
  signalingUrl: string;
  iceServers?: RTCIceServer[];
  mediaConstraints?: {
    audio: MediaTrackConstraints;
    video: MediaTrackConstraints;
  };
  enableDataChannel?: boolean;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

export interface SecureDataChannel {
  send: (data: any) => Promise<void>;
  addEventListener: (event: string, callback: Function) => void;
  close: () => void;
  readyState: RTCDataChannelState;
}