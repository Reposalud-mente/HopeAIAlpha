/**
 * WebRTC Connection Monitor for quality monitoring and adaptation
 */
import { ConnectionQuality } from './types';
import { WebRTCService } from './webrtc-service';

export class ConnectionMonitor {
  private peerConnection: RTCPeerConnection;
  private statsInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private webrtcService: WebRTCService;
  private eventEmitter: any;
  private lastStats: any = {};
  private isVideoEnabled: boolean = true;
  
  constructor(peerConnection: RTCPeerConnection, webrtcService: WebRTCService) {
    this.peerConnection = peerConnection;
    this.webrtcService = webrtcService;
    this.eventEmitter = webrtcService;
  }
  
  /**
   * Start monitoring connection quality
   */
  startMonitoring(interval = 2000): void {
    this.statsInterval = setInterval(() => this.collectStats(), interval);
  }
  
  /**
   * Stop monitoring connection quality
   */
  stopMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }
  
  /**
   * Collect WebRTC stats and calculate connection quality
   */
  async collectStats(): Promise<ConnectionQuality> {
    const stats = await this.peerConnection.getStats();
    const videoStats = this.extractVideoStats(stats);
    const audioStats = this.extractAudioStats(stats);
    const connectionStats = this.extractConnectionStats(stats);
    
    const quality = this.calculateQuality(videoStats, audioStats, connectionStats);
    
    // Trigger adaptation if quality is poor
    if (quality.level === 'poor' || quality.level === 'critical') {
      this.adaptToPoorConnection(quality);
    }
    
    // Emit quality update event
    this.eventEmitter.emit('connectionQualityUpdate', quality);
    
    return quality;
  }
  
  /**
   * Extract video statistics from RTCStatsReport
   */
  private extractVideoStats(stats: RTCStatsReport): any {
    const videoStats: any = {};
    
    stats.forEach(stat => {
      if (stat.type === 'outbound-rtp' && stat.kind === 'video') {
        videoStats.outbound = {
          bytesSent: stat.bytesSent,
          packetsSent: stat.packetsSent,
          framesSent: stat.framesSent,
          framesEncoded: stat.framesEncoded,
          frameWidth: stat.frameWidth,
          frameHeight: stat.frameHeight,
          framesPerSecond: stat.framesPerSecond,
          qualityLimitationReason: stat.qualityLimitationReason,
        };
      } else if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
        videoStats.inbound = {
          bytesReceived: stat.bytesReceived,
          packetsReceived: stat.packetsReceived,
          packetsLost: stat.packetsLost,
          framesReceived: stat.framesReceived,
          framesDecoded: stat.framesDecoded,
          frameWidth: stat.frameWidth,
          frameHeight: stat.frameHeight,
          framesPerSecond: stat.framesPerSecond,
        };
      }
    });
    
    return videoStats;
  }
  
  /**
   * Extract audio statistics from RTCStatsReport
   */
  private extractAudioStats(stats: RTCStatsReport): any {
    const audioStats: any = {};
    
    stats.forEach(stat => {
      if (stat.type === 'outbound-rtp' && stat.kind === 'audio') {
        audioStats.outbound = {
          bytesSent: stat.bytesSent,
          packetsSent: stat.packetsSent,
        };
      } else if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
        audioStats.inbound = {
          bytesReceived: stat.bytesReceived,
          packetsReceived: stat.packetsReceived,
          packetsLost: stat.packetsLost,
          jitter: stat.jitter,
        };
      }
    });
    
    return audioStats;
  }
  
  /**
   * Extract connection statistics from RTCStatsReport
   */
  private extractConnectionStats(stats: RTCStatsReport): any {
    const connectionStats: any = {};
    
    stats.forEach(stat => {
      if (stat.type === 'transport') {
        connectionStats.transport = {
          bytesReceived: stat.bytesReceived,
          bytesSent: stat.bytesSent,
          selectedCandidatePairId: stat.selectedCandidatePairId,
        };
      } else if (stat.type === 'candidate-pair' && stat.selected) {
        connectionStats.candidatePair = {
          availableOutgoingBitrate: stat.availableOutgoingBitrate,
          currentRoundTripTime: stat.currentRoundTripTime,
          localCandidateId: stat.localCandidateId,
          remoteCandidateId: stat.remoteCandidateId,
          state: stat.state,
        };
      }
    });
    
    return connectionStats;
  }
  
  /**
   * Calculate connection quality based on collected stats
   */
  private calculateQuality(videoStats: any, audioStats: any, connectionStats: any): ConnectionQuality {
    // Calculate bandwidth
    let bandwidth = 0;
    let packetLoss = 0;
    let latency = 0;
    let jitter = 0;
    
    // Calculate bandwidth from transport stats if available
    if (connectionStats.transport) {
      const bytesSent = connectionStats.transport.bytesSent;
      const bytesReceived = connectionStats.transport.bytesReceived;
      
      if (this.lastStats.bytesSent && this.lastStats.timestamp) {
        const timeDiff = Date.now() - this.lastStats.timestamp;
        const bytesDiff = (bytesSent + bytesReceived) - (this.lastStats.bytesSent + this.lastStats.bytesReceived);
        
        // Convert to kbps (bits per second / 1000)
        bandwidth = Math.round((bytesDiff * 8) / timeDiff);
      }
      
      this.lastStats.bytesSent = bytesSent;
      this.lastStats.bytesReceived = bytesReceived;
    }
    
    // Calculate packet loss from audio stats (more reliable than video)
    if (audioStats.inbound && audioStats.inbound.packetsReceived > 0) {
      const packetsLost = audioStats.inbound.packetsLost || 0;
      const packetsReceived = audioStats.inbound.packetsReceived;
      
      packetLoss = (packetsLost / (packetsLost + packetsReceived)) * 100;
    }
    
    // Get latency from candidate pair
    if (connectionStats.candidatePair && connectionStats.candidatePair.currentRoundTripTime) {
      // Convert to milliseconds
      latency = connectionStats.candidatePair.currentRoundTripTime * 1000;
    }
    
    // Get jitter from audio inbound
    if (audioStats.inbound && audioStats.inbound.jitter) {
      // Convert to milliseconds
      jitter = audioStats.inbound.jitter * 1000;
    }
    
    // Determine video dimensions and frame rate
    let videoWidth = 0;
    let videoHeight = 0;
    let frameRate = 0;
    
    if (videoStats.inbound) {
      videoWidth = videoStats.inbound.frameWidth || 0;
      videoHeight = videoStats.inbound.frameHeight || 0;
      frameRate = videoStats.inbound.framesPerSecond || 0;
    }
    
    // Determine quality level
    let level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'good';
    
    if (bandwidth > 2000 && packetLoss < 1 && latency < 100) {
      level = 'excellent';
    } else if (bandwidth > 1000 && packetLoss < 3 && latency < 200) {
      level = 'good';
    } else if (bandwidth > 500 && packetLoss < 7 && latency < 300) {
      level = 'fair';
    } else if (bandwidth > 250 && packetLoss < 15 && latency < 500) {
      level = 'poor';
    } else {
      level = 'critical';
    }
    
    this.lastStats.timestamp = Date.now();
    
    return {
      bandwidth,
      latency,
      packetLoss,
      jitter,
      level,
      timestamp: Date.now(),
      videoWidth,
      videoHeight,
      frameRate,
    };
  }
  
  /**
   * Adapt to poor connection quality
   */
  private adaptToPoorConnection(quality: ConnectionQuality): void {
    // Implement bandwidth adaptation
    if (quality.bandwidth < 300) { // Less than 300kbps
      this.reduceVideoQuality();
    }
    
    // Check for connection failures
    if (this.peerConnection.connectionState === 'failed') {
      this.attemptReconnection();
    }
  }
  
  /**
   * Reduce video quality to adapt to poor connection
   */
  private async reduceVideoQuality(): Promise<void> {
    if (!this.isVideoEnabled) return;
    
    const senders = this.peerConnection.getSenders();
    const videoSender = senders.find(sender => 
      sender.track && sender.track.kind === 'video'
    );
    
    if (videoSender) {
      const parameters = videoSender.getParameters();
      
      // Don't modify if encodings aren't set up yet
      if (!parameters.encodings || parameters.encodings.length === 0) {
        parameters.encodings = [{}];
      }
      
      // Reduce resolution and bitrate
      parameters.encodings[0].scaleResolutionDownBy = 2;
      parameters.encodings[0].maxBitrate = 250000; // 250 kbps
      
      try {
        await videoSender.setParameters(parameters);
        this.eventEmitter.emit('videoQualityReduced');
      } catch (error) {
        console.error('Failed to reduce video quality:', error);
      }
    }
  }
  
  /**
   * Attempt to reconnect after connection failure
   */
  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.triggerFallbackMode();
      return;
    }
    
    this.reconnectAttempts++;
    try {
      // Recreate peer connection with existing configuration
      await this.webrtcService.recreateConnection();
    } catch (error) {
      console.error('Reconnection attempt failed:', error);
    }
  }
  
  /**
   * Trigger fallback mode when reconnection fails
   */
  private triggerFallbackMode(): void {
    // Switch to audio-only mode if video is causing issues
    this.webrtcService.switchToAudioOnly();
    
    // Notify user about connection issues
    this.eventEmitter.emit('connection-degraded');
  }
}