# Detailed Plan for Integrating mem0.ai with HopeAI Chat Assistant

## Current Architecture Overview

Your current AI assistant implementation consists of:

1. **AI Service Layer**: `AIAssistantService` class that interacts with Google's Gemini API
2. **Context Provider**: `AIAssistantProvider` that manages the chat state and conversation flow
3. **Conversation Management**: `ConversationSessionManager` that stores conversations in localStorage
4. **UI Components**: `PersistentAIPanel` and `FloatingAIAssistant` for user interaction
5. **Context Gathering**: Utilities to gather application and user context for better responses

The current implementation has these limitations:
- Conversations are stored only in localStorage, which has size limitations
- No long-term memory capabilities across sessions or devices
- Limited ability to recall specific information from past conversations

## Integration Strategy

We'll implement a hybrid approach that:
1. Maintains compatibility with your existing architecture
2. Adds mem0.ai for enhanced memory capabilities
3. Preserves the current localStorage-based session management for immediate context
4. Uses mem0.ai for long-term memory and cross-session knowledge

## Implementation Plan

### 1. Install Required Dependencies

```bash
pnpm add mem0ai
```

### 2. Create Environment Variables

Add the following to your `.env.alpha` file:

```
NEXT_PUBLIC_MEM0_API_KEY=your-mem0-api-key
```

### 3. Create a Mem0 Service

Create a new service file to handle interactions with mem0.ai:

```typescript
// src/lib/ai-assistant/mem0-service.ts
import { MemoryClient } from 'mem0ai';
import { Message } from './ai-assistant-service';
import { logger } from '@/lib/logger';

// Define the configuration interface
export interface Mem0Config {
  apiKey?: string;
}

/**
 * Service for interacting with mem0.ai for memory capabilities
 */
export class Mem0Service {
  private client: MemoryClient;
  
  /**
   * Constructor
   * @param config Configuration for the Mem0 service
   */
  constructor(config: Mem0Config = {}) {
    const apiKey = config.apiKey || process.env.NEXT_PUBLIC_MEM0_API_KEY;
    
    if (!apiKey) {
      console.warn('No Mem0 API key provided. Memory capabilities will be limited.');
    }
    
    // Initialize the Mem0 client
    this.client = new MemoryClient({ apiKey });
    
    logger.info('Mem0 service initialized');
  }
  
  /**
   * Add conversation messages to memory
   * @param messages Array of messages to add
   * @param userId User ID to associate with the memories
   * @returns Promise resolving to the result of the operation
   */
  async addConversation(messages: Message[], userId: string): Promise<any> {
    try {
      // Format messages for mem0
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add to mem0 with contextual add (v2)
      const result = await this.client.add(formattedMessages, { 
        user_id: userId,
        version: "v2" 
      });
      
      logger.info('Added conversation to mem0', { 
        messageCount: messages.length,
        userId
      });
      
      return result;
    } catch (error) {
      logger.error('Error adding conversation to mem0', { error });
      throw error;
    }
  }
  
  /**
   * Search for relevant memories
   * @param query Query to search for
   * @param userId User ID to search memories for
   * @returns Promise resolving to an array of relevant memories
   */
  async searchMemories(query: string, userId: string): Promise<any[]> {
    try {
      const results = await this.client.search(query, { 
        user_id: userId,
        version: "v2" 
      });
      
      logger.info('Retrieved memories from mem0', { 
        count: results.length,
        userId
      });
      
      return results;
    } catch (error) {
      logger.error('Error searching memories in mem0', { error });
      return [];
    }
  }
  
  /**
   * Get all memories for a user
   * @param userId User ID to get memories for
   * @returns Promise resolving to an array of memories
   */
  async getAllMemories(userId: string): Promise<any[]> {
    try {
      const memories = await this.client.get_all({ 
        user_id: userId,
        version: "v2" 
      });
      
      return memories.results || [];
    } catch (error) {
      logger.error('Error getting all memories from mem0', { error });
      return [];
    }
  }
}

// Singleton instance
let mem0ServiceInstance: Mem0Service | null = null;

/**
 * Get the singleton instance of the Mem0Service
 * @returns The Mem0Service instance
 */
export function getMem0Service(): Mem0Service {
  if (!mem0ServiceInstance) {
    mem0ServiceInstance = new Mem0Service();
  }
  
  return mem0ServiceInstance;
}
```

### 4. Update the AI Assistant Service

Modify the existing `AIAssistantService` to integrate with mem0.ai:

```typescript
// src/lib/ai-assistant/ai-assistant-service.ts (modifications)

// Import the mem0 service
import { getMem0Service } from './mem0-service';
import { generateUniqueId } from '@/lib/utils/id-generator';

// In the sendMessage method, add memory retrieval
async sendMessage(
  message: string,
  conversationHistory: Message[] = [],
  contextParams?: {
    // existing params
    userId?: string; // Add userId parameter
  },
  enableFunctionCalling: boolean = true
): Promise<{
  text: string;
  functionCalls?: any[];
  status?: 'success' | 'fallback_success' | 'error';
  error?: { message: string; code: string };
}> {
  try {
    // Get relevant memories if userId is provided
    let relevantMemories: any[] = [];
    let memoryContext = '';
    
    if (contextParams?.userId) {
      try {
        const mem0Service = getMem0Service();
        relevantMemories = await mem0Service.searchMemories(message, contextParams.userId);
        
        if (relevantMemories.length > 0) {
          // Format memories for inclusion in the prompt
          memoryContext = relevantMemories
            .map(m => `- ${m.memory}`)
            .join('\n');
          
          logger.info('Retrieved memories for context', { 
            count: relevantMemories.length,
            userId: contextParams.userId 
          });
        }
      } catch (error) {
        logger.error('Error retrieving memories', { error });
        // Continue without memories if there's an error
      }
    }
    
    // Get the standard context
    const context = contextParams ? getClientAIContext(
      contextParams.currentSection,
      contextParams.currentPage,
      contextParams.patientId,
      contextParams.patientName,
      contextParams.userName
    ) : {};
    
    // Add memories to context if available
    if (memoryContext) {
      context.memories = memoryContext;
    }
    
    // Rest of the existing method...
    
    // After getting the response, store the conversation in mem0
    if (contextParams?.userId) {
      try {
        // Add the new message and response to the history
        const updatedHistory = [
          { id: generateUniqueId('user'), role: 'user', content: message },
          { id: generateUniqueId('assistant'), role: 'assistant', content: response.text }
        ];
        
        // Store in mem0 (don't await to avoid blocking)
        const mem0Service = getMem0Service();
        mem0Service.addConversation(updatedHistory, contextParams.userId)
          .catch(error => logger.error('Failed to store conversation in mem0', { error }));
      } catch (error) {
        logger.error('Error storing conversation in mem0', { error });
        // Continue even if storing fails
      }
    }
    
    // Return the response
    return response;
  } catch (error) {
    // Existing error handling...
  }
}

// Similarly update the streamMessage method
```

### 5. Update the System Prompt Generator

Modify the system prompt to include memories:

```typescript
// src/lib/ai-assistant/prompts.ts (or wherever your system prompt is defined)

export function getEnhancedSystemPrompt(context: Record<string, any>): string {
  // Base system prompt
  let systemPrompt = `Eres HopeAI, un asistente de IA especializado en salud mental...`;
  
  // Add memories to the prompt if available
  if (context.memories) {
    systemPrompt += `\n\nRecuerdos relevantes sobre el usuario o conversaciones anteriores:\n${context.memories}\n\nUtiliza estos recuerdos para personalizar tus respuestas y proporcionar un servicio más contextualizado. Cuando sea relevante, puedes hacer referencia a información de conversaciones anteriores.`;
  }
  
  return systemPrompt;
}
```

### 6. Update the AI Assistant Context Provider

Modify the context provider to integrate with mem0.ai:

```typescript
// src/contexts/ai-assistant-context.tsx (modifications)

// Import the mem0 service
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';

// Add to the context type
interface AIAssistantContextType {
  // Existing properties
  
  // Add mem0 related properties
  memories: any[];
  isLoadingMemories: boolean;
  refreshMemories: () => Promise<void>;
}

export function AIAssistantProvider({
  children,
  maxMessages = 50
}: AIAssistantProviderProps) {
  // Existing state
  
  // Add mem0 related state
  const [memories, setMemories] = useState<any[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState<boolean>(false);
  
  // Get the auth session to access user information
  const { user, loading: authLoading } = useAuth();
  
  // Get the user ID from the session
  const userId = user?.id || user?.email || '';
  
  // Function to refresh memories
  const refreshMemories = async () => {
    if (!userId) return;
    
    setIsLoadingMemories(true);
    try {
      const mem0Service = getMem0Service();
      const userMemories = await mem0Service.getAllMemories(userId);
      setMemories(userMemories);
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setIsLoadingMemories(false);
    }
  };
  
  // Load memories when the user ID changes
  useEffect(() => {
    if (userId && !authLoading) {
      refreshMemories();
    }
  }, [userId, authLoading]);
  
  // Modify the sendMessage function to include userId
  const sendMessage = async (content: string, contextParams?: any) => {
    // Existing implementation
    
    try {
      // Add userId to contextParams
      const enhancedContextParams = {
        ...contextParams,
        userId
      };
      
      // Use the enhanced context params
      const response = await aiService.sendMessage(
        content,
        conversationHistory,
        enhancedContextParams
      );
      
      // Existing implementation
    } catch (error) {
      // Existing error handling
    }
  };
  
  // Similarly update streamMessage
  const streamMessage = async (content: string, contextParams?: any) => {
    // Existing implementation
    
    try {
      // Add userId to contextParams
      const enhancedContextParams = {
        ...contextParams,
        userId
      };
      
      // Use the enhanced context params
      await aiService.streamMessage(
        content,
        conversationHistory,
        onChunk,
        enhancedContextParams,
        onFunctionCall,
        enableFunctionCalling
      );
      
      // Existing implementation
    } catch (error) {
      // Existing error handling
    }
  };
  
  // Update the context value
  const contextValue: AIAssistantContextType = {
    // Existing properties
    memories,
    isLoadingMemories,
    refreshMemories,
    sendMessage,
    streamMessage,
    // Other existing properties
  };
  
  return (
    <AIAssistantContext.Provider value={contextValue}>
      {children}
    </AIAssistantContext.Provider>
  );
}
```

### 7. Add a Visual Indicator for Memory Usage

Update the UI to show when the assistant is using memories:

```tsx
// src/components/ai/PersistentAIPanel.tsx (modifications)

// In the message rendering section
{group.role === 'assistant' && group.messages.some(msg => 
  msg.content.includes('Basado en nuestras conversaciones anteriores') || 
  msg.content.includes('Recuerdo que mencionaste') ||
  msg.content.includes('Como mencionaste antes')
) && (
  <div className="text-xs text-muted-foreground flex items-center gap-1 ml-2 mt-1">
    <Zap className="h-3 w-3" />
    <span>Usando memoria</span>
  </div>
)}
```

### 8. Create a Memory Management Component (Optional)

Create a component to allow users to view and manage their memories:

```tsx
// src/components/ai/MemoryManager.tsx

import { useState } from 'react';
import { useAIAssistant } from '@/contexts/ai-assistant-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RefreshCw } from 'lucide-react';

export function MemoryManager() {
  const { memories, isLoadingMemories, refreshMemories } = useAIAssistant();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2 border-b">
        <CardTitle className="text-lg">Memorias del Asistente</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshMemories}
          disabled={isLoadingMemories}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingMemories ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {memories.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No hay memorias almacenadas
            </div>
          ) : (
            <div className="divide-y">
              {memories.map((memory) => (
                <div key={memory.id} className="p-3 hover:bg-muted/50">
                  <div className="text-sm">{memory.memory}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(memory.created_at).toLocaleString()}
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
```

### 9. Add Memory Extraction Utilities (Optional)

Create utilities to extract important information from conversations:

```typescript
// src/lib/ai-assistant/memory-extractor.ts

import { Message } from './ai-assistant-service';
import { logger } from '@/lib/logger';

/**
 * Extract important information from a conversation
 * @param messages Array of messages to extract information from
 * @returns Promise resolving to extracted information
 */
export async function extractImportantInformation(messages: Message[]): Promise<string[]> {
  try {
    // This is a simple implementation that could be enhanced with AI
    const extractedInfo: string[] = [];
    
    // Look for patterns that might indicate important information
    for (const message of messages) {
      if (message.role === 'user') {
        // Extract preferences
        if (message.content.includes('prefiero') || 
            message.content.includes('me gusta') || 
            message.content.includes('no me gusta')) {
          extractedInfo.push(message.content);
        }
        
        // Extract personal information
        if (message.content.includes('mi nombre es') || 
            message.content.includes('me llamo') || 
            message.content.includes('soy')) {
          extractedInfo.push(message.content);
        }
      }
    }
    
    return extractedInfo;
  } catch (error) {
    logger.error('Error extracting important information', { error });
    return [];
  }
}
```

## Implementation Timeline

1. **Day 1**: Set up mem0.ai account, get API key, and install dependencies
2. **Day 2**: Create the Mem0Service and integrate with AI Assistant Service
3. **Day 3**: Update the context provider and system prompts
4. **Day 4**: Test the integration and fix any issues
5. **Day 5**: Add UI enhancements and optional memory management features

## Testing Plan

1. **Basic Memory Storage**: Verify that conversations are being stored in mem0.ai
2. **Memory Retrieval**: Test that relevant memories are being retrieved for new queries
3. **Cross-Session Memory**: Test that the assistant remembers information across different sessions
4. **UI Indicators**: Verify that the UI correctly shows when memories are being used
5. **Error Handling**: Test behavior when mem0.ai is unavailable or returns errors

## Fallback Mechanisms

1. **Local Storage Fallback**: Continue using localStorage if mem0.ai is unavailable
2. **Graceful Degradation**: Provide meaningful responses even without memory context
3. **Error Logging**: Log errors for debugging and monitoring

## Conclusion

This integration plan provides a comprehensive approach to adding memory capabilities to your HopeAI chat assistant using mem0.ai. The implementation:

1. **Preserves Existing Functionality**: Maintains compatibility with your current architecture
2. **Enhances User Experience**: Adds long-term memory for more personalized interactions
3. **Provides Scalability**: Leverages mem0.ai's cloud-based storage for growing memory needs
4. **Offers Flexibility**: Allows for future enhancements like memory management and extraction

By following this plan, we'll create a more intelligent and contextually aware AI assistant that can better serve our users by remembering important information across conversations and sessions.
