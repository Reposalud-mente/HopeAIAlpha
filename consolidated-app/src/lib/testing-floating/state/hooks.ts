'use client'

/**
 * Custom hooks for the Enhanced AI Floating Assistant
 */

import { useState, useEffect, useCallback } from 'react';
import { useAssistant } from './assistant-context';

/**
 * Hook for voice input
 * @returns Voice input state and methods
 */
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if the browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError('Speech recognition is not supported in this browser.');
        return;
      }

      // Create a new recognition instance
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES';

      // Set up event handlers
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current];

        if (result.isFinal) {
          setTranscript(result[0].transcript);
        }
      };

      setRecognition(recognitionInstance);
    }

    // Clean up
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (recognition) {
      try {
        setTranscript('');
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setError('Error starting speech recognition.');
      }
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
  }, [recognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

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
  };
}

/**
 * Hook for managing the floating assistant UI
 * @returns Floating assistant UI state and methods
 */
export function useFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const assistant = useAssistant();
  const voiceInput = useVoiceInput();

  // Open the assistant
  const openAssistant = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close the assistant
  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Toggle the assistant
  const toggleAssistant = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    await assistant.sendMessage(input);
    setInput('');
  }, [input, assistant]);

  // Handle voice input
  const handleVoiceInput = useCallback(() => {
    if (voiceInput.isListening) {
      voiceInput.stopListening();

      if (voiceInput.transcript) {
        setInput(voiceInput.transcript);
      }
    } else {
      voiceInput.startListening();
    }
  }, [voiceInput]);

  // Update input when transcript changes
  useEffect(() => {
    if (voiceInput.transcript) {
      setInput(voiceInput.transcript);
    }
  }, [voiceInput.transcript]);

  return {
    isOpen,
    input,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    handleInputChange,
    handleSendMessage,
    handleVoiceInput,
    voiceInput,
  };
}
