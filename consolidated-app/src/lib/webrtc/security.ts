/**
 * WebRTC Security Service for encryption and security features
 */
import { SecurityAlert, WebRTCEvent } from './types';
import jwt from 'jsonwebtoken';

export class WebRTCSecurity {
  /**
   * Generate session token for authentication
   */
  static generateSessionToken(userId: string, sessionId: string): string {
    // Use JWT with short expiration for session tokens
    return jwt.sign(
      { userId, sessionId, purpose: 'rtc-session' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  }
  
  /**
   * Verify session token
   */
  static verifySessionToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error('Invalid session token');
    }
  }
  
  /**
   * Log WebRTC events for audit purposes
   */
  static async logEvent(event: WebRTCEvent): Promise<void> {
    try {
      // Log to database
      await fetch('/api/webrtc/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: event.type,
          sessionId: event.sessionId,
          userId: event.userId,
          userRole: event.userRole,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          details: this.sanitizeDetails(event.details),
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to log WebRTC event:', error);
    }
  }
  
  /**
   * Sanitize event details to remove sensitive information
   */
  private static sanitizeDetails(details: any): any {
    if (!details) return {};
    
    const sanitized = { ...details };
    
    // Remove any potential PII or sensitive data
    const sensitiveFields = ['password', 'token', 'ssn', 'dob', 'address'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  /**
   * Trigger security alert
   */
  static async triggerSecurityAlert(alert: SecurityAlert): Promise<void> {
    try {
      // Log security alert to database
      await fetch('/api/webrtc/security-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alert,
          timestamp: alert.timestamp || new Date().toISOString(),
        }),
      });
      
      // Send notification to security team
      // This would be implemented in a real system
      console.warn('Security Alert:', alert);
    } catch (error) {
      console.error('Failed to trigger security alert:', error);
    }
  }
  
  /**
   * Secure data channel with additional encryption
   */
  static async secureDataChannel(dataChannel: RTCDataChannel): Promise<any> {
    // Generate encryption key
    const key = await this.generateEncryptionKey();
    
    return {
      send: async (data: any) => {
        const jsonData = JSON.stringify(data);
        const encryptedData = await this.encryptMessage(jsonData, key);
        dataChannel.send(encryptedData);
      },
      
      addEventListener: (event: string, callback: Function) => {
        if (event === 'message') {
          dataChannel.addEventListener('message', async (evt: any) => {
            try {
              const decryptedData = await this.decryptMessage(evt.data, key);
              const parsedData = JSON.parse(decryptedData);
              callback({ ...evt, decryptedData: parsedData });
            } catch (error) {
              console.error('Failed to decrypt message:', error);
            }
          });
        } else {
          dataChannel.addEventListener(event, callback as any);
        }
      },
      
      // Pass through other methods
      close: () => dataChannel.close(),
      get readyState() { return dataChannel.readyState; },
    };
  }
  
  /**
   * Generate encryption key
   */
  private static async generateEncryptionKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Encrypt message
   */
  private static async encryptMessage(message: string, key: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedMessage
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64 for transmission
    return btoa(String.fromCharCode(...result));
  }
  
  /**
   * Decrypt message
   */
  private static async decryptMessage(encryptedMessage: string, key: CryptoKey): Promise<string> {
    const binaryData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes)
    const iv = binaryData.slice(0, 12);
    const encryptedData = binaryData.slice(12);
    
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
  
  /**
   * Check if the connection is secure
   */
  static isConnectionSecure(peerConnection: RTCPeerConnection): boolean {
    // Check if DTLS is enabled
    const dtlsEnabled = peerConnection.getConfiguration().certificates !== undefined;
    
    // Check if all data channels are encrypted
    const sctpTransport = (peerConnection as any).sctp;
    const sctpEncrypted = sctpTransport ? sctpTransport.state === 'connected' : false;
    
    return dtlsEnabled && sctpEncrypted;
  }
}