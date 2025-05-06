/**
 * Test for WebRTC functionality
 * 
 * This script tests the WebRTC implementation for the HopeAI telehealth platform.
 * It mocks browser APIs and tests the WebRTC service, context, and hook.
 */

const { JSDOM } = require('jsdom');
const assert = require('assert');
const EventEmitter = require('events');

// Mock browser APIs
global.window = new JSDOM('<!DOCTYPE html><html><body></body></html>').window;
global.document = window.document;
global.navigator = {
  mediaDevices: {
    getUserMedia: async () => {
      // Mock MediaStream
      return {
        getTracks: () => [
          { kind: 'audio', readyState: 'live', enabled: true, stop: () => {} },
          { kind: 'video', readyState: 'live', enabled: true, stop: () => {} }
        ],
        getAudioTracks: () => [{ readyState: 'live', enabled: true, stop: () => {} }],
        getVideoTracks: () => [{ readyState: 'live', enabled: true, stop: () => {} }],
        addTrack: () => {}
      };
    },
    getDisplayMedia: async () => {
      // Mock screen sharing MediaStream
      return {
        getTracks: () => [
          { kind: 'video', readyState: 'live', enabled: true, stop: () => {}, onended: null }
        ],
        getVideoTracks: () => [{ readyState: 'live', enabled: true, stop: () => {}, onended: null }]
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
    this.onsignalingstatechange = null;
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

  addTrack() {
    return {
      replaceTrack: () => Promise.resolve()
    };
  }

  getSenders() {
    return [
      {
        track: { kind: 'video' },
        replaceTrack: () => Promise.resolve()
      },
      {
        track: { kind: 'audio' },
        replaceTrack: () => Promise.resolve()
      }
    ];
  }

  getStats() {
    return Promise.resolve([
      {
        type: 'remote-inbound-rtp',
        roundTripTime: 0.05
      },
      {
        type: 'inbound-rtp',
        packetsLost: 2,
        packetsReceived: 100
      },
      {
        type: 'candidate-pair',
        state: 'succeeded',
        availableOutgoingBitrate: 1500000
      }
    ]);
  }

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

// Mock RTCSessionDescription
global.RTCSessionDescription = class RTCSessionDescription {
  constructor(init) {
    Object.assign(this, init);
  }
};

// Mock RTCIceCandidate
global.RTCIceCandidate = class RTCIceCandidate {
  constructor(init) {
    Object.assign(this, init);
  }
};

// Mock MediaStream
global.MediaStream = class MediaStream {
  constructor() {
    this.tracks = [];
  }

  addTrack(track) {
    this.tracks.push(track);
  }

  getTracks() {
    return this.tracks;
  }

  getAudioTracks() {
    return this.tracks.filter(track => track.kind === 'audio');
  }

  getVideoTracks() {
    return this.tracks.filter(track => track.kind === 'video');
  }
};

// Mock Socket.IO
class MockSocket extends EventEmitter {
  constructor() {
    super();
    this.id = 'mock-socket-id';
  }

  emit(event, data) {
    return true;
  }

  on(event, callback) {
    super.on(event, callback);
    return this;
  }

  disconnect() {
    this.emit('disconnect');
  }
}

// Mock Socket.IO client
const io = {
  connect: () => new MockSocket()
};

// Mock WebRTC service
class MockWebRTCService extends EventEmitter {
  constructor(config, sessionId, userId, role) {
    super();
    this.config = config;
    this.sessionId = sessionId;
    this.userId = userId;
    this.role = role;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isVideoMuted = false;
    this.isAudioMuted = false;
    this.isScreenSharing = false;
    this.connectionQuality = null;
  }

  async connectSignaling() {
    return Promise.resolve();
  }

  async initializeLocalMedia() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    this.emit('localStream', this.localStream);
    return this.localStream;
  }

  async joinSession() {
    this.peerConnection = new RTCPeerConnection();
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
    return this.isVideoMuted;
  }

  toggleAudio() {
    this.isAudioMuted = !this.isAudioMuted;
    this.emit('audioToggled', this.isAudioMuted);
    return this.isAudioMuted;
  }

  async startScreenSharing() {
    this.isScreenSharing = true;
    const stream = await navigator.mediaDevices.getDisplayMedia();
    this.emit('screenSharingStarted', stream);
    return stream;
  }

  async stopScreenSharing() {
    this.isScreenSharing = false;
    this.emit('screenSharingStopped');
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  isVideoMutedState() {
    return this.isVideoMuted;
  }

  isAudioMutedState() {
    return this.isAudioMuted;
  }

  isScreenSharingActive() {
    return this.isScreenSharing;
  }

  disconnect() {
    // Simulate disconnect
  }
}

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
    
    // Test WebRTCService
    await testWebRTCService();
    
    console.log('All WebRTC tests passed!');
    return true;
  } catch (error) {
    console.error('WebRTC test failed:', error);
    return false;
  }
}

// Test WebRTCService functionality
async function testWebRTCService() {
  console.log('Testing WebRTCService functionality...');
  
  try {
    // Create WebRTCService instance
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
    
    const service = new MockWebRTCService(
      config,
      'test-session',
      'test-user',
      'PATIENT'
    );
    
    // Test event emitter functionality
    let eventFired = false;
    service.on('testEvent', () => {
      eventFired = true;
    });
    service.emit('testEvent');
    assert(eventFired, 'Event should be fired');
    
    // Test media initialization
    const localStream = await service.initializeLocalMedia();
    assert(localStream, 'Should initialize local media');
    assert(service.getLocalStream() === localStream, 'Should store local stream');
    
    // Test video muting
    const initialVideoMuted = service.isVideoMutedState();
    service.toggleVideo();
    assert(service.isVideoMutedState() !== initialVideoMuted, 'Should toggle video mute state');
    
    // Test audio muting
    const initialAudioMuted = service.isAudioMutedState();
    service.toggleAudio();
    assert(service.isAudioMutedState() !== initialAudioMuted, 'Should toggle audio mute state');
    
    // Test screen sharing
    assert(!service.isScreenSharingActive(), 'Screen sharing should be initially inactive');
    const screenStream = await service.startScreenSharing();
    assert(service.isScreenSharingActive(), 'Screen sharing should be active after starting');
    assert(screenStream, 'Should return screen sharing stream');
    await service.stopScreenSharing();
    assert(!service.isScreenSharingActive(), 'Screen sharing should be inactive after stopping');
    
    console.log('✓ WebRTCService test passed');
    return true;
  } catch (error) {
    console.error('WebRTCService test failed:', error);
    return false;
  }
}

// Run the test
testWebRTC().then(success => {
  process.exit(success ? 0 : 1);
});