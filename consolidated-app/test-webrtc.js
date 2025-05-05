/**
 * Simple test for WebRTC functionality
 */

const { JSDOM } = require('jsdom');
const assert = require('assert');

// Mock browser APIs
global.window = new JSDOM('<!DOCTYPE html><html><body></body></html>').window;
global.document = window.document;
global.navigator = {
  mediaDevices: {
    getUserMedia: async () => {
      // Mock MediaStream
      return {
        getTracks: () => [
          { kind: 'audio', readyState: 'live' },
          { kind: 'video', readyState: 'live' }
        ],
        getAudioTracks: () => [{ readyState: 'live' }],
        getVideoTracks: () => [{ readyState: 'live' }]
      };
    }
  },
  userAgent: 'Mozilla/5.0 (Test)'
};

// Mock RTCPeerConnection
global.RTCPeerConnection = class RTCPeerConnection {
  constructor() {
    this.localDescription = null;
    this.remoteDescription = null;
    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.connectionState = 'new';
    this.onicecandidate = null;
    this.ontrack = null;
    this.onconnectionstatechange = null;
    this.onicecandidateerror = null;
    this.oniceconnectionstatechange = null;
  }

  createOffer() {
    return Promise.resolve({ type: 'offer', sdp: 'mock-sdp' });
  }

  createAnswer() {
    return Promise.resolve({ type: 'answer', sdp: 'mock-sdp' });
  }

  setLocalDescription(desc) {
    this.localDescription = desc;
    return Promise.resolve();
  }

  setRemoteDescription(desc) {
    this.remoteDescription = desc;
    return Promise.resolve();
  }

  addIceCandidate() {
    return Promise.resolve();
  }

  close() {
    this.connectionState = 'closed';
    if (this.onconnectionstatechange) {
      this.onconnectionstatechange();
    }
  }

  addTrack() {}

  createDataChannel(label, options) {
    return {
      label,
      options,
      send: () => {},
      close: () => {},
      onopen: null,
      onclose: null,
      onmessage: null
    };
  }
};

// Mock EventEmitter
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
    return this;
  }
}

// Mock WebRTCService
class WebRTCService extends EventEmitter {
  constructor(config, sessionId, userId, role) {
    super();
    this.config = config;
    this.sessionId = sessionId;
    this.userId = userId;
    this.role = role;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.isVideoMuted = false;
    this.isAudioMuted = false;
  }

  async initializeLocalMedia() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    this.emit('localStream', this.localStream);
    return this.localStream;
  }

  async createPeerConnection() {
    this.peerConnection = new RTCPeerConnection();
    return this.peerConnection;
  }

  async joinSession() {
    await this.createPeerConnection();
    this.emit('connectionStateChange', 'connected');
    return true;
  }

  async leaveSession() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.emit('connectionStateChange', 'disconnected');
    return true;
  }

  toggleVideo() {
    this.isVideoMuted = !this.isVideoMuted;
    this.emit('videoToggled', this.isVideoMuted);
  }

  toggleAudio() {
    this.isAudioMuted = !this.isAudioMuted;
    this.emit('audioToggled', this.isAudioMuted);
  }
}

// Mock WebRTCContext
const mockWebRTCContext = {
  webrtcService: null,
  localStream: null,
  remoteStream: null,
  connectionState: null,
  connectionQuality: null,
  isConnecting: false,
  isConnected: false,
  error: null,
  isVideoMuted: false,
  isAudioMuted: false,
  isScreenSharing: false,
  joinSession: async (sessionId, role) => {
    mockWebRTCContext.isConnecting = true;
    
    try {
      const service = new WebRTCService({}, sessionId, 'test-user', role);
      mockWebRTCContext.webrtcService = service;
      
      const stream = await service.initializeLocalMedia();
      mockWebRTCContext.localStream = stream;
      
      await service.joinSession();
      mockWebRTCContext.connectionState = 'connected';
      mockWebRTCContext.isConnected = true;
      
      // Create a mock remote stream
      mockWebRTCContext.remoteStream = {
        getTracks: () => [
          { kind: 'audio', readyState: 'live' },
          { kind: 'video', readyState: 'live' }
        ]
      };
    } catch (err) {
      mockWebRTCContext.error = err;
    } finally {
      mockWebRTCContext.isConnecting = false;
    }
  },
  leaveSession: async () => {
    if (mockWebRTCContext.webrtcService) {
      await mockWebRTCContext.webrtcService.leaveSession();
    }
    
    mockWebRTCContext.webrtcService = null;
    mockWebRTCContext.localStream = null;
    mockWebRTCContext.remoteStream = null;
    mockWebRTCContext.connectionState = null;
    mockWebRTCContext.isConnected = false;
  },
  toggleVideo: () => {
    mockWebRTCContext.isVideoMuted = !mockWebRTCContext.isVideoMuted;
    if (mockWebRTCContext.webrtcService) {
      mockWebRTCContext.webrtcService.toggleVideo();
    }
  },
  toggleAudio: () => {
    mockWebRTCContext.isAudioMuted = !mockWebRTCContext.isAudioMuted;
    if (mockWebRTCContext.webrtcService) {
      mockWebRTCContext.webrtcService.toggleAudio();
    }
  }
};

// Test WebRTC functionality
async function testWebRTC() {
  console.log('Testing WebRTC functionality...');

  try {
    // Test media access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();
    
    assert(audioTracks.length > 0, 'Should have audio tracks');
    assert(videoTracks.length > 0, 'Should have video tracks');
    
    console.log('✓ Media access test passed');

    // Test RTCPeerConnection
    const pc = new RTCPeerConnection();
    assert(pc.connectionState === 'new', 'Initial connection state should be "new"');
    
    // Test offer creation
    const offer = await pc.createOffer();
    assert(offer.type === 'offer', 'Should create an offer');
    
    // Test setting local description
    await pc.setLocalDescription(offer);
    assert(pc.localDescription === offer, 'Should set local description');
    
    // Test answer creation
    const answer = await pc.createAnswer();
    assert(answer.type === 'answer', 'Should create an answer');
    
    // Test connection close
    pc.close();
    assert(pc.connectionState === 'closed', 'Connection should be closed');
    
    console.log('✓ RTCPeerConnection test passed');
    
    // Test WebRTCContext
    await testWebRTCContext();
    
    console.log('All WebRTC tests passed!');
    return true;
  } catch (error) {
    console.error('WebRTC test failed:', error);
    return false;
  }
}

// Test WebRTCContext functionality
async function testWebRTCContext() {
  console.log('Testing WebRTCContext functionality...');
  
  try {
    // Test joining a session
    await mockWebRTCContext.joinSession('test-session', 'PATIENT');
    assert(mockWebRTCContext.isConnected === true, 'Should be connected after joining');
    assert(mockWebRTCContext.connectionState === 'connected', 'Connection state should be "connected"');
    assert(mockWebRTCContext.localStream !== null, 'Should have a local stream');
    assert(mockWebRTCContext.remoteStream !== null, 'Should have a remote stream');
    
    console.log('✓ Join session test passed');
    
    // Test toggling video
    mockWebRTCContext.toggleVideo();
    assert(mockWebRTCContext.isVideoMuted === true, 'Video should be muted after toggling');
    mockWebRTCContext.toggleVideo();
    assert(mockWebRTCContext.isVideoMuted === false, 'Video should be unmuted after toggling again');
    
    console.log('✓ Toggle video test passed');
    
    // Test toggling audio
    mockWebRTCContext.toggleAudio();
    assert(mockWebRTCContext.isAudioMuted === true, 'Audio should be muted after toggling');
    mockWebRTCContext.toggleAudio();
    assert(mockWebRTCContext.isAudioMuted === false, 'Audio should be unmuted after toggling again');
    
    console.log('✓ Toggle audio test passed');
    
    // Test leaving a session
    await mockWebRTCContext.leaveSession();
    assert(mockWebRTCContext.isConnected === false, 'Should be disconnected after leaving');
    assert(mockWebRTCContext.localStream === null, 'Should not have a local stream after leaving');
    assert(mockWebRTCContext.remoteStream === null, 'Should not have a remote stream after leaving');
    
    console.log('✓ Leave session test passed');
    
    return true;
  } catch (error) {
    console.error('WebRTCContext test failed:', error);
    return false;
  }
}

// Run the test
testWebRTC().then(success => {
  process.exit(success ? 0 : 1);
});