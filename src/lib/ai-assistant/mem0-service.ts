/**
 * Mem0 Service for interacting with mem0.ai for memory capabilities
 * This service provides persistent memory across conversations for the AI assistant
 */

import { MemoryClient } from 'mem0ai';
import { Message } from './ai-assistant-service';
import { logger } from '@/lib/logger';

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;

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
      logger.warn('No Mem0 API key provided. Memory capabilities will be limited.');
    }

    // Initialize the Mem0 client
    this.client = new MemoryClient({ apiKey });

    logger.info('Mem0 service initialized');
  }

  /**
   * Helper method to retry API calls with exponential backoff
   * @param operation Function to retry
   * @param retries Number of retries
   * @returns Promise resolving to the result of the operation
   */
  private async retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      logger.warn(`Operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, { error });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));

      return this.retryOperation(operation, retries - 1);
    }
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
      const result = await this.retryOperation(async () => {
        return await this.client.add(formattedMessages, {
          user_id: userId,
          version: "v2"
        });
      });

      logger.info('Added conversation to mem0', {
        messageCount: messages.length,
        userId
      });

      return result;
    } catch (error) {
      logger.error('Error adding conversation to mem0', { error });
      // Return empty result instead of throwing to prevent breaking the assistant
      return { success: false, error };
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
      const results = await this.retryOperation(async () => {
        return await this.client.search(query, {
          user_id: userId,
          version: "v2",
          filters: {
            AND: [{ user_id: userId }]
          }
        });
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
      const memories = await this.retryOperation(async () => {
        return await this.client.get_all({
          user_id: userId,
          version: "v2",
          filters: {
            AND: [{ user_id: userId }]
          },
          page: 1,
          page_size: 50
        });
      });

      return memories.results || [];
    } catch (error) {
      logger.error('Error getting all memories from mem0', { error });
      return [];
    }
  }

  /**
   * Delete a memory by ID
   * @param memoryId ID of the memory to delete
   * @param userId User ID associated with the memory
   * @returns Promise resolving to the result of the operation
   */
  async deleteMemory(memoryId: string, userId: string): Promise<any> {
    try {
      const result = await this.retryOperation(async () => {
        return await this.client.delete(memoryId, {
          user_id: userId,
          version: "v2"
        });
      });

      logger.info('Deleted memory from mem0', {
        memoryId,
        userId
      });

      return result;
    } catch (error) {
      logger.error('Error deleting memory from mem0', { error });
      return { success: false, error };
    }
  }

  /**
   * Delete all memories for a user
   * @param userId User ID to delete memories for
   * @returns Promise resolving to the result of the operation
   */
  async deleteAllMemories(userId: string): Promise<any> {
    try {
      const result = await this.retryOperation(async () => {
        return await this.client.delete_all({
          user_id: userId,
          version: "v2",
          filters: {
            AND: [{ user_id: userId }]
          }
        });
      });

      logger.info('Deleted all memories for user from mem0', {
        userId
      });

      return result;
    } catch (error) {
      logger.error('Error deleting all memories from mem0', { error });
      return { success: false, error };
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
