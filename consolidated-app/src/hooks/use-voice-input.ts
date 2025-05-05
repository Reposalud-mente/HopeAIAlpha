"use client"

import { useState, useEffect, useCallback } from 'react';

interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface VoiceInputResult {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

/**
 * A hook for voice input using the Web Speech API
 * @param options Options for the speech recognition
 * @returns Voice input state and controls
 */
export function useVoiceInput(options: VoiceInputOptions = {}): VoiceInputResult {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  
  // Reference to the speech recognition instance
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if the browser supports speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const instance = new SpeechRecognition();
        
        // Configure the recognition
        instance.lang = options.language || 'es-ES';
        instance.continuous = options.continuous !== undefined ? options.continuous : false;
        instance.interimResults = options.interimResults !== undefined ? options.interimResults : true;
        
        // Set up event handlers
        instance.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptValue = result[0].transcript;
          
          setTranscript(transcriptValue);
        };
        
        instance.onerror = (event) => {
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };
        
        instance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(instance);
      } else {
        setSupported(false);
        setError('Speech recognition is not supported in this browser');
      }
    }
    
    // Clean up
    return () => {
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        
        if (isListening) {
          recognition.stop();
        }
      }
    };
  }, [options.language, options.continuous, options.interimResults]);

  // Start listening
  const startListening = useCallback(() => {
    setError(null);
    
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setError(`Failed to start speech recognition: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else if (!supported) {
      setError('Speech recognition is not supported in this browser');
    }
  }, [recognition, supported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition, isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    supported
  };
}

// Add type definitions for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}