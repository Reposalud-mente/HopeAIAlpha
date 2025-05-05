/**
 * Browser Compatibility Service for WebRTC
 */
import { BrowserInfo } from './types';
import { DEFAULT_RTC_CONFIG } from './types';

export class BrowserCompatibility {
  /**
   * Detect browser and version
   */
  static detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';

    // Detect browser and version
    if (userAgent.indexOf('Chrome') !== -1) {
      browser = 'chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.indexOf('Firefox') !== -1) {
      browser = 'firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) {
      browser = 'safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.indexOf('Edg') !== -1) {
      browser = 'edge';
      version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown';
    }

    return { browser, version: parseInt(version) || 0 };
  }

  /**
   * Get optimal WebRTC configuration for the current browser
   */
  static getOptimalConfiguration(browserInfo: BrowserInfo): RTCConfiguration {
    const baseConfig = { ...DEFAULT_RTC_CONFIG };

    // Browser-specific optimizations
    switch (browserInfo.browser) {
      case 'safari':
        // Safari needs special handling for ICE
        baseConfig.iceTransportPolicy = 'all';
        // Safari has issues with TURN TCP
        baseConfig.iceServers = baseConfig.iceServers?.filter(
          server => !server.urls.toString().includes('transport=tcp')
        );
        break;

      case 'firefox':
        // Firefox works better with specific STUN servers
        if (browserInfo.version < 70) {
          baseConfig.iceServers = [
            { urls: 'stun:stun.services.mozilla.com' },
            ...(baseConfig.iceServers || [])
          ];
        }
        break;
    }

    return baseConfig;
  }

  /**
   * Apply polyfills for WebRTC
   */
  static applyPolyfills(): void {
    // Check if adapter.js is needed
    if (!window.RTCPeerConnection) {
      console.warn('WebRTC not supported natively, using adapter.js');
      // adapter.js should be imported in the main application
    }

    // Apply any additional polyfills needed
    this.polyfillGetUserMedia();
    this.polyfillRTCDataChannel();
  }

  /**
   * Polyfill getUserMedia
   */
  private static polyfillGetUserMedia(): void {
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {} as any;
    }

    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = (navigator as any).webkitGetUserMedia ||
                            (navigator as any).mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
  }

  /**
   * Polyfill RTCDataChannel
   */
  private static polyfillRTCDataChannel(): void {
    // This is a placeholder for RTCDataChannel polyfills if needed
    // Most modern browsers support RTCDataChannel natively
  }

  /**
   * Check if the browser supports WebRTC
   */
  static isWebRTCSupported(): boolean {
    return !!(
      window.RTCPeerConnection &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }

  /**
   * Check if screen sharing is supported
   */
  static isScreenSharingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }

  /**
   * Check if the browser supports specific WebRTC features
   */
  static checkFeatureSupport(): Record<string, boolean> {
    return {
      webrtc: this.isWebRTCSupported(),
      screenSharing: this.isScreenSharingSupported(),
      insertableStreams: !!(window as any).RTCRtpSender && !!(window as any).RTCRtpSender.prototype.createEncodedStreams,
      audioProcessing: !!(window.AudioContext || (window as any).webkitAudioContext),
      h264: this.isCodecSupported('video/h264'),
      vp8: this.isCodecSupported('video/VP8'),
      vp9: this.isCodecSupported('video/VP9'),
      opus: this.isCodecSupported('audio/opus'),
    };
  }

  /**
   * Check if a specific codec is supported
   * This is a best-effort check as there's no standard way to detect codec support
   */
  private static isCodecSupported(codec: string): boolean {
    try {
      // First try using RTCRtpSender.getCapabilities if available (more accurate)
      if (typeof RTCRtpSender !== 'undefined' && RTCRtpSender.getCapabilities) {
        const capabilities = RTCRtpSender.getCapabilities('video');
        if (capabilities && capabilities.codecs) {
          // Check if the codec is in the list of supported codecs
          return capabilities.codecs.some(c =>
            c.mimeType.toLowerCase() === codec.toLowerCase() ||
            c.mimeType.toLowerCase().includes(codec.toLowerCase().split('/')[1])
          );
        }
      }

      // Fallback to MediaRecorder.isTypeSupported
      if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
        return MediaRecorder.isTypeSupported(codec);
      }

      // If all else fails, assume support based on browser
      const browser = this.detectBrowser().browser;
      if (codec === 'video/h264') {
        // H.264 is supported in most modern browsers
        return true;
      } else if (codec === 'video/VP8') {
        // VP8 is supported in all WebRTC-capable browsers
        return true;
      } else if (codec === 'video/VP9') {
        // VP9 is supported in Chrome, Firefox, Edge
        return browser !== 'safari' || parseInt(navigator.userAgent.match(/Version\/(\d+)/)?.[1] || '0') >= 15;
      } else if (codec === 'audio/opus') {
        // Opus is supported in all WebRTC-capable browsers
        return true;
      }

      return false;
    } catch (e) {
      console.warn(`Error checking codec support for ${codec}:`, e);
      return false;
    }
  }

  /**
   * Get browser-specific constraints
   */
  static getBrowserSpecificConstraints(browserInfo: BrowserInfo): MediaStreamConstraints {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: true,
    };

    // Browser-specific constraints
    switch (browserInfo.browser) {
      case 'safari':
        // Safari has issues with some constraints
        constraints.audio = { echoCancellation: true };
        constraints.video = { width: { ideal: 1280 }, height: { ideal: 720 } };
        break;

      case 'firefox':
        // Firefox has good defaults but benefits from specific audio settings
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };
        break;

      default:
        // Chrome, Edge, etc. work well with the default constraints
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        };
    }

    return constraints;
  }
}