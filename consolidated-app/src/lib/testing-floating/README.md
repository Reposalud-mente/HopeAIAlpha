# Enhanced AI Floating Assistant

A new implementation of the AI Floating Assistant with improved functionality:
- Tool integration for administrative actions
- Enhanced UI/UX
- Context awareness based on User ID

## Architecture

The Enhanced AI Floating Assistant follows a modular architecture with clear separation of concerns:

1. **Core Service Layer**: Handles communication with the Gemini API
2. **Context Management Layer**: Manages user and application context
3. **Tool Integration Layer**: Defines and handles administrative tools
4. **UI Layer**: Provides the floating UI components
5. **State Management Layer**: Manages conversation state and history

## Directory Structure

```
src/lib/testing-floating/
├── index.ts                     # Main export file
├── types.ts                     # Type definitions
├── config.ts                    # Configuration and environment variables
├── core/
│   ├── gemini-client.ts         # Core Gemini API client
│   ├── assistant-service.ts     # Main assistant service
│   └── index.ts                 # Exports for core components
├── context/
│   ├── context-gatherer.ts      # Context gathering functionality
│   ├── context-types.ts         # Context type definitions
│   └── index.ts                 # Exports for context components
├── tools/
│   ├── tool-declarations.ts     # Tool declarations for function calling
│   ├── tool-implementations.ts  # Tool implementation logic
│   └── index.ts                 # Exports for tool components
├── ui/
│   ├── floating-assistant.tsx   # Main floating assistant component
│   ├── assistant-card.tsx       # Card component for the assistant
│   ├── tool-visualizer.tsx      # Component to visualize tool calls
│   ├── styles.module.css        # CSS module for styling
│   └── index.ts                 # Exports for UI components
└── state/
    ├── assistant-context.tsx    # Context provider for state management
    ├── hooks.ts                 # Custom hooks for the assistant
    └── index.ts                 # Exports for state components
```

## Key Features

### 1. Tool Integration for Administrative Actions

The assistant can perform administrative actions using function calling:

- **Schedule Sessions**: Schedule therapy sessions with patients
- **Create Reminders**: Create reminders for the therapist
- **Search Patients**: Search for patients by name, ID, or other criteria
- **Generate Reports**: Generate clinical reports for patients

### 2. Enhanced UI/UX

The UI has been improved with:

- **Floating Chat Interface**: A floating chat interface that can be opened from anywhere in the application
- **Voice Input**: Support for voice input using the Web Speech API
- **Real-time Streaming**: Responses are streamed in real-time for a more interactive experience
- **Tool Visualization**: Visual representation of tool calls and their results
- **Responsive Design**: Works well on all screen sizes

### 3. Context Awareness

The assistant is aware of the user's context:

- **User Context**: Knows who the user is and their preferences
- **Application Context**: Aware of the current section and page
- **Data Context**: Knows which patient the user is working with

## Usage

### Basic Usage

```tsx
import { AssistantProvider, FloatingAssistant } from '@/lib/testing-floating';

// In your component or layout
<AssistantProvider>
  <FloatingAssistant />
</AssistantProvider>
```

### With Custom Initial Question

```tsx
<AssistantProvider>
  <FloatingAssistant 
    initialQuestion="¿Cómo puedo ayudarte con tus pacientes hoy?" 
  />
</AssistantProvider>
```

### As a Card Component

```tsx
import { AssistantCard } from '@/lib/testing-floating';

// In your component
<AssistantCard 
  question="¿Necesitas ayuda con la documentación clínica?" 
/>
```

### With Context

```tsx
<AssistantProvider>
  <FloatingAssistant 
    patientName="Juan Pérez"
    currentSection="Pacientes"
    currentPage="Historial Clínico"
  />
</AssistantProvider>
```

## Configuration

The AI Assistant uses the following environment variables:

- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key.

## Implementation Details

### Core Service Layer

The core service layer consists of:

- **GeminiClient**: Handles communication with the Gemini API
- **AssistantService**: Provides a high-level interface for sending messages, streaming responses, and handling function calls

### Context Management Layer

The context management layer consists of:

- **ContextGatherer**: Gathers context about the user, application, and data
- **Context Types**: Defines types for different context objects

### Tool Integration Layer

The tool integration layer consists of:

- **Tool Declarations**: Defines the tools that the assistant can use
- **Tool Implementations**: Implements the actual functionality of the tools

### UI Layer

The UI layer consists of:

- **FloatingAssistant**: Main floating assistant component
- **AssistantCard**: Card component that opens the floating assistant when clicked
- **ToolVisualizer**: Component to visualize tool calls and their results

### State Management Layer

The state management layer consists of:

- **AssistantProvider**: Context provider for managing assistant state
- **useAssistant**: Hook for interacting with the assistant
- **useVoiceInput**: Hook for voice input
- **useFloatingAssistant**: Hook for managing the floating assistant UI

## Accessibility

The AI Assistant is designed to be fully accessible:

- **Keyboard Navigation**: All interactive elements can be navigated using the keyboard
- **Screen Reader Support**: Proper ARIA labels and roles for screen readers
- **Focus Management**: Proper focus management for modals and dialogs
- **Color Contrast**: Sufficient color contrast for readability
