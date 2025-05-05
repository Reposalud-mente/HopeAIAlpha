'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useWebRTC } from '@/contexts/webrtc/WebRTCContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { BrowserCompatibility } from '@/lib/webrtc/browser-compatibility'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneCall,
  PhoneOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ScreenShare,
  StopCircle,
  MessageSquare,
  Send,
  Gauge,
  Info
} from 'lucide-react'

export function WebRTCTest() {
  // Get WebRTC context
  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    connectionState,
    connectionQuality,
    error,
    isVideoMuted,
    isAudioMuted,
    isScreenSharing,
    joinSession,
    leaveSession,
    toggleVideo,
    toggleAudio,
    startScreenSharing,
    stopScreenSharing,
    sendMessage
  } = useWebRTC()

  // Local state
  const [sessionId, setSessionId] = useState<string>('test-session-123')
  const [devicesTested, setDevicesTested] = useState<boolean>(false)
  const [testResults, setTestResults] = useState<{ audio: boolean, video: boolean } | null>(null)
  const [role, setRole] = useState<'THERAPIST' | 'PATIENT'>('PATIENT')
  const [message, setMessage] = useState<string>('')
  const [messages, setMessages] = useState<Array<{text: string, sender: string}>>([])
  const [browserSupport, setBrowserSupport] = useState<Record<string, boolean> | null>(null)

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle joining a session
  const handleJoinSession = async () => {
    try {
      await joinSession(sessionId, role)
    } catch (err) {
      console.error('Failed to join session:', err)
    }
  }

  // Handle leaving a session
  const handleLeaveSession = async () => {
    try {
      await leaveSession()
    } catch (err) {
      console.error('Failed to leave session:', err)
    }
  }

  // Handle device testing
  const handleTestDevices = async () => {
    if (!localStream) return

    const audioTracks = localStream.getAudioTracks()
    const videoTracks = localStream.getVideoTracks()

    setTestResults({
      audio: audioTracks.length > 0 && audioTracks[0].readyState === 'live',
      video: videoTracks.length > 0 && videoTracks[0].readyState === 'live',
    })

    setDevicesTested(true)
  }

  // Toggle role between PATIENT and THERAPIST
  const toggleRole = () => {
    setRole(prev => prev === 'PATIENT' ? 'THERAPIST' : 'PATIENT')
  }

  // Handle screen sharing
  const handleScreenSharing = async () => {
    if (isScreenSharing) {
      await stopScreenSharing()
    } else {
      await startScreenSharing()
    }
  }

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim() || !isConnected) return

    // Send the message
    const success = sendMessage(message)

    if (success) {
      // Add to local messages
      setMessages(prev => [...prev, { text: message, sender: 'You' }])
      setMessage('')
    }
  }

  // Check browser compatibility
  const checkBrowserCompatibility = () => {
    const support = BrowserCompatibility.checkFeatureSupport()
    setBrowserSupport(support)
  }

  // Update video elements when streams change
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Initialize local media on component mount
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing media devices:', err)
      }
    }

    if (!localStream) {
      initializeMedia()
    }

    // Check browser compatibility
    checkBrowserCompatibility()

    return () => {
      // Clean up
      if (isConnected) {
        leaveSession()
      }
    }
  }, [])

  // Listen for data channel messages
  useEffect(() => {
    if (!isConnected) return

    const handleDataChannelMessage = (data: string) => {
      try {
        // Add received message to the list
        setMessages(prev => [...prev, { text: data, sender: 'Remote' }])
      } catch (err) {
        console.error('Error handling data channel message:', err)
      }
    }

    // Add event listener to WebRTC service
    const webrtcService = useWebRTC().webrtcService
    if (webrtcService) {
      webrtcService.on('dataChannelMessage', handleDataChannelMessage)

      // Clean up
      return () => {
        webrtcService.off('dataChannelMessage', handleDataChannelMessage)
      }
    }
  }, [isConnected])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div className="space-y-6">
      {/* Device Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Device Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Camera Preview</h3>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoMuted ? 'opacity-50' : ''}`}
                />
                {isVideoMuted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-white opacity-70" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Test Results</h3>
                {testResults ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {testResults.video ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <span>Camera: {testResults.video ? 'Working' : 'Not working'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResults.audio ? (
                        <CheckCircle2 className="text-green-500" />
                      ) : (
                        <XCircle className="text-red-500" />
                      )}
                      <span>Microphone: {testResults.audio ? 'Working' : 'Not working'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Click "Test Devices" to check your camera and microphone.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleTestDevices} disabled={!localStream}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Devices
                </Button>
                <Button variant="outline" onClick={toggleVideo} disabled={!localStream}>
                  {isVideoMuted ? (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Enable Video
                    </>
                  ) : (
                    <>
                      <VideoOff className="mr-2 h-4 w-4" />
                      Disable Video
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={toggleAudio} disabled={!localStream}>
                  {isAudioMuted ? (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Mute
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Local Stream</h3>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoMuted ? 'opacity-50' : ''}`}
                />
                {isVideoMuted && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VideoOff className="w-12 h-12 text-white opacity-70" />
                  </div>
                )}
                {isScreenSharing && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                    Screen Sharing
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Remote Stream</h3>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p>Waiting for remote connection...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Connection Status</h3>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' :
                isConnecting ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
              <span>
                {isConnected ? 'Connected' :
                 isConnecting ? 'Connecting...' :
                 'Disconnected'}
              </span>
              {connectionState && <span className="text-muted-foreground ml-2">({connectionState})</span>}
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Error: {error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Session ID:</span>
                <code className="bg-muted px-2 py-1 rounded">{sessionId}</code>
              </div>

              <div className="flex items-center gap-2">
                <span>Role:</span>
                <code className="bg-muted px-2 py-1 rounded">{role}</code>
                <Button variant="outline" size="sm" onClick={toggleRole}>
                  Switch Role
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-between">
          <div>
            <Button
              onClick={handleJoinSession}
              disabled={isConnected || isConnecting || !localStream}
              className="mr-2"
            >
              <PhoneCall className="mr-2 h-4 w-4" />
              Join Test Session
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveSession}
              disabled={!isConnected}
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              Leave Session
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleScreenSharing}
            disabled={!isConnected}
          >
            {isScreenSharing ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Sharing
              </>
            ) : (
              <>
                <ScreenShare className="mr-2 h-4 w-4" />
                Share Screen
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Connection Quality Section */}
      {isConnected && connectionQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="mr-2 h-5 w-5" />
              Connection Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Overall Quality</span>
                  <span className={`font-medium ${
                    connectionQuality.level === 'excellent' ? 'text-green-500' :
                    connectionQuality.level === 'good' ? 'text-green-400' :
                    connectionQuality.level === 'fair' ? 'text-yellow-500' :
                    connectionQuality.level === 'poor' ? 'text-orange-500' :
                    'text-red-500'
                  }`}>
                    {connectionQuality.level.charAt(0).toUpperCase() + connectionQuality.level.slice(1)}
                  </span>
                </div>
                <Progress
                  value={
                    connectionQuality.level === 'excellent' ? 100 :
                    connectionQuality.level === 'good' ? 80 :
                    connectionQuality.level === 'fair' ? 60 :
                    connectionQuality.level === 'poor' ? 30 :
                    10
                  }
                  className={`${
                    connectionQuality.level === 'excellent' ? 'bg-green-500' :
                    connectionQuality.level === 'good' ? 'bg-green-400' :
                    connectionQuality.level === 'fair' ? 'bg-yellow-500' :
                    connectionQuality.level === 'poor' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Bandwidth</h4>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{connectionQuality.bandwidth}</span>
                    <span className="ml-1 text-muted-foreground">kbps</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Latency</h4>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{Math.round(connectionQuality.latency)}</span>
                    <span className="ml-1 text-muted-foreground">ms</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Packet Loss</h4>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{connectionQuality.packetLoss.toFixed(1)}</span>
                    <span className="ml-1 text-muted-foreground">%</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Jitter</h4>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{Math.round(connectionQuality.jitter)}</span>
                    <span className="ml-1 text-muted-foreground">ms</span>
                  </div>
                </div>
              </div>

              {connectionQuality.videoWidth && connectionQuality.videoHeight && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Video Resolution</h4>
                  <div className="flex items-center">
                    <span className="font-medium">{connectionQuality.videoWidth} × {connectionQuality.videoHeight}</span>
                    {connectionQuality.frameRate && (
                      <span className="ml-2 text-muted-foreground">
                        {Math.round(connectionQuality.frameRate)} fps
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Channel Messaging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Data Channel Messaging
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-md p-4 h-48 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <p>No messages yet. Connect with a peer to start messaging.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg max-w-[80%] ${
                      msg.sender === 'You'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-secondary'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">{msg.sender}</div>
                    <div>{msg.text}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!isConnected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!isConnected || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Browser Compatibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Browser Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          {browserSupport ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${browserSupport.webrtc ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>WebRTC Support</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${browserSupport.screenSharing ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Screen Sharing</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${browserSupport.h264 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>H.264 Codec</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${browserSupport.vp8 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>VP8 Codec</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${browserSupport.opus ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Opus Audio Codec</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${browserSupport.audioProcessing ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Audio Processing</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Button onClick={checkBrowserCompatibility}>
                Check Browser Compatibility
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}