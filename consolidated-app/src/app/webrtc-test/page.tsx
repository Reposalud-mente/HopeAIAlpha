'use client'

import React from 'react'
import { WebRTCTest } from '@/components/webrtc/WebRTCTest'
import { WebRTCProvider } from '@/contexts/webrtc/WebRTCContext'

export default function WebRTCTestPage() {
  // Configuration for the WebRTC provider
  const webrtcConfig = {
    signalingUrl: '/api/signaling', // This would be your signaling server endpoint
    enableDataChannel: true,
    autoReconnect: true,
    maxReconnectAttempts: 3
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">WebRTC Test Page</h1>

      <div className="mb-6">
        <p className="text-muted-foreground">
          This page allows you to test your WebRTC capabilities, including camera, microphone,
          screen sharing, data channel messaging, and connection quality monitoring. Follow the
          instructions below to test your setup.
        </p>
      </div>

      <div className="bg-card rounded-xl p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          <li>Allow camera and microphone access when prompted</li>
          <li>Test your camera and microphone using the controls</li>
          <li>Check your browser compatibility for WebRTC features</li>
          <li>To test peer connection, open this page in another browser window</li>
          <li>Click "Join Test Session" in both windows to establish a connection</li>
          <li>Use the controls to test muting audio, disabling video, etc.</li>
          <li>Try screen sharing to share your screen with the remote peer</li>
          <li>Send messages through the data channel to test text communication</li>
          <li>Monitor connection quality metrics in real-time</li>
        </ol>

        <WebRTCProvider config={webrtcConfig}>
          <WebRTCTest />
        </WebRTCProvider>
      </div>
    </div>
  )
}