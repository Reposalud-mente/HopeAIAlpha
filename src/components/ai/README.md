# Floating AI Assistant with Gemini Integration

This component provides a floating AI assistant that uses Google's Gemini API to provide intelligent responses to user queries. The assistant is designed to help mental health professionals with clinical processes, administrative tasks, and general inquiries.

## Features

- **Real-time Gemini API Integration**: Replaces hardcoded responses with intelligent, context-aware responses from Gemini.
- **Contextual Memory**: Maintains conversation history across sessions using localStorage.
- **Multi-turn Conversations**: Supports complex, multi-turn conversations with context awareness.
- **Typing Indicators**: Shows typing indicators when Gemini is processing a response.
- **Voice Input**: Supports hands-free interaction with voice input capabilities.
- **Error Handling**: Provides detailed error messages and retry options if the Gemini API fails.
- **Performance Optimization**:
  - Uses debouncing for user input to reduce unnecessary API calls.
  - Caches frequently asked questions to reduce latency.
- **Accessibility**: Fully accessible with keyboard navigation and screen reader support.

## Components

### 1. AI Assistant Service

The `AIAssistantService` class handles communication with the Gemini API:

- **Location**: `src/lib/ai-assistant/ai-assistant-service.ts`
- **Key Features**:
  - Sends messages to Gemini API
  - Streams responses for real-time feedback
  - Implements caching for frequently asked questions
  - Provides error handling with retry logic

### 2. AI Assistant Context

The `AIAssistantContext` provides state management for the assistant:

- **Location**: `src/contexts/ai-assistant-context.tsx`
- **Key Features**:
  - Manages conversation history
  - Persists conversations to localStorage
  - Handles loading and error states
  - Provides methods to interact with the AI Assistant Service

### 3. Utility Hooks

- **useDebounce**: Debounces user input to reduce unnecessary API calls.
  - **Location**: `src/hooks/use-debounce.ts`

- **useVoiceInput**: Provides voice input functionality using the Web Speech API.
  - **Location**: `src/hooks/use-voice-input.ts`

### 4. FloatingAIAssistant Component

The main component that provides the UI for the assistant:

- **Location**: `src/components/ai/ai-assistance-card.tsx`
- **Key Features**:
  - Floating chat interface
  - Real-time responses from Gemini
  - Voice input support
  - Typing indicators
  - Error handling with retry options
  - Accessibility features

## Usage

### Basic Usage

```tsx
import { FloatingAIAssistantWithProvider } from '@/components/ai/ai-assistance-card';

// In your component or layout
<FloatingAIAssistantWithProvider />
```

### With Custom Initial Question

```tsx
<FloatingAIAssistantWithProvider 
  initialQuestion="¿Cómo puedo ayudarte con tus pacientes hoy?" 
/>
```

### As a Card Component

```tsx
import { AIAssistanceCard } from '@/components/ai/ai-assistance-card';

// In your component
<AIAssistanceCard 
  question="¿Necesitas ayuda con la documentación clínica?" 
/>
```

## Configuration

The AI Assistant uses the following environment variables:

- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key.

## Accessibility

The AI Assistant is designed to be fully accessible:

- All interactive elements have proper ARIA attributes
- Keyboard navigation is supported
- Screen reader announcements for important state changes
- Voice input for hands-free interaction

## Error Handling

The AI Assistant provides detailed error messages if the Gemini API fails:

- Shows error messages in the UI
- Provides retry options
- Implements automatic retries for transient errors

## Performance Optimization

The AI Assistant is optimized for performance:

- Debounces user input to reduce unnecessary API calls
- Caches frequently asked questions
- Uses streaming for real-time responses

## Future Enhancements

Potential future enhancements for the AI Assistant:

- Support for file uploads and document analysis
- Integration with other parts of the application for context-aware responses
- Customizable appearance and behavior
- Analytics to track usage and improve responses