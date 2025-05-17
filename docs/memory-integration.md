# Memory Integration Documentation

This document provides an overview of the memory integration for the AI assistant using mem0.ai.

## Overview

The memory integration allows the AI assistant to remember previous conversations with users, providing a more personalized and contextual experience. The integration uses mem0.ai as the memory storage service, which provides semantic search capabilities to retrieve relevant memories based on the current conversation.

## Architecture

The memory integration consists of the following components:

1. **Mem0Service**: A service that interacts with the mem0.ai API to store and retrieve memories.
2. **AI Assistant Service**: The core service that uses the Mem0Service to enhance the AI assistant's responses with relevant memories.
3. **Memory API Endpoints**: API endpoints for managing memories from the client side.
4. **Memory Management UI**: A user interface for viewing and managing memories.

## Components

### Mem0Service

The `Mem0Service` is responsible for interacting with the mem0.ai API. It provides methods for:

- Adding conversations to memory
- Searching for relevant memories
- Getting all memories for a user
- Deleting specific memories
- Deleting all memories for a user

The service is implemented as a singleton to ensure consistent access across the application.

### AI Assistant Service

The AI Assistant Service has been enhanced to:

1. Retrieve relevant memories based on the user's message
2. Include these memories in the context provided to the AI model
3. Store new conversations in memory after receiving a response

The service uses the user ID to associate memories with specific users, ensuring that memories are personalized and private.

### Memory API Endpoints

The following API endpoints have been implemented for memory management:

- `GET /api/memory`: Get all memories for the authenticated user
- `DELETE /api/memory`: Delete a specific memory or all memories for the authenticated user
- `POST /api/memory/add`: Add a conversation to memory
- `GET /api/memory/search`: Search for memories based on a query

All endpoints require authentication and use the user's ID from the session to ensure that users can only access and manage their own memories.

### Memory Management UI

The memory management UI consists of:

1. **Memory Manager Component**: A component for viewing and managing memories
2. **Memory Settings Page**: A page for configuring memory settings
3. **User Menu**: A menu with a link to the memory settings page

## Configuration

The memory integration requires the following configuration:

1. **Mem0 API Key**: The API key for accessing the mem0.ai service. This is configured in the environment variable `NEXT_PUBLIC_MEM0_API_KEY`.

## Usage

### Adding Memories

Memories are automatically added to the system when a user interacts with the AI assistant. Each conversation is stored in mem0.ai and associated with the user's ID.

### Retrieving Memories

When a user sends a message to the AI assistant, the system automatically searches for relevant memories based on the message content. These memories are included in the context provided to the AI model, allowing it to generate more personalized and contextual responses.

### Managing Memories

Users can manage their memories through the memory settings page, which allows them to:

- View all stored memories
- Delete specific memories
- Delete all memories
- Enable or disable memory functionality

## Security Considerations

The memory integration includes several security measures:

1. **User Authentication**: All memory operations require authentication, ensuring that users can only access and manage their own memories.
2. **User ID Association**: Memories are associated with user IDs, preventing unauthorized access to memories.
3. **Error Handling**: Proper error handling is implemented to prevent information leakage and ensure system stability.

## Testing

The memory integration includes comprehensive tests:

1. **Unit Tests**: Tests for the Mem0Service to ensure proper functionality.
2. **Integration Tests**: Tests for the memory API endpoints to ensure proper integration with the rest of the system.

## Fallback Mechanisms

The memory integration includes fallback mechanisms to handle cases where the mem0.ai service is unavailable or returns errors:

1. **Error Logging**: Errors are logged for monitoring and debugging.
2. **Graceful Degradation**: The AI assistant continues to function even if memory retrieval fails, falling back to non-personalized responses.
3. **Retry Logic**: Critical operations include retry logic to handle temporary service disruptions.

## Future Improvements

Potential future improvements for the memory integration include:

1. **Memory Categorization**: Categorizing memories to improve retrieval relevance.
2. **Memory Summarization**: Summarizing memories to reduce storage requirements and improve retrieval efficiency.
3. **Memory Expiration**: Implementing memory expiration to automatically remove old or irrelevant memories.
4. **Enhanced Privacy Controls**: Providing more granular privacy controls for users to manage their memories.
