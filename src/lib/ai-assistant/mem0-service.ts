/**
 * Mem0 Service for interacting with mem0.ai for memory capabilities
 * This service provides persistent memory across conversations for the AI assistant
 */

import { MemoryClient } from 'mem0ai';
import { Message } from './ai-assistant-service';
import { logger } from '@/lib/logger';
import { getMemoryCache } from './memory-cache';

// Maximum number of retries for API calls
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 1000;
// Default page size for memory retrieval
const DEFAULT_PAGE_SIZE = 50;
// Minimum query length for memory search
const MIN_QUERY_LENGTH = 5;

// Define the configuration interface
export interface Mem0Config {
  apiKey?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  maxCacheSize?: number;
}

// Memory metadata interface
export interface MemoryMetadata {
  source?: string;
  category?: string;
  importance?: number;
  [key: string]: any;
}

/**
 * Service for interacting with mem0.ai for memory capabilities
 */
export class Mem0Service {
  private client: MemoryClient;

  private cacheEnabled: boolean;
  private memoryCache: any;

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

    // Initialize cache if enabled
    this.cacheEnabled = config.cacheEnabled !== false;
    if (this.cacheEnabled) {
      this.memoryCache = getMemoryCache({
        ttl: config.cacheTTL || 5 * 60 * 1000, // 5 minutes by default
        maxSize: config.maxCacheSize || 100 // 100 entries by default
      });
      logger.info('Memory cache initialized');
    }

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
   * @param metadata Optional metadata to associate with the memory
   * @returns Promise resolving to the result of the operation
   */
  async addConversation(messages: Message[], userId: string, metadata: MemoryMetadata = {}): Promise<any> {
    try {
      // Skip if messages are too short
      const hasValidMessages = messages.some(msg => msg.content && msg.content.trim().length > MIN_QUERY_LENGTH);
      if (!hasValidMessages) {
        logger.info('Skipping memory storage for short messages', { userId });
        return { success: true, skipped: true, reason: 'Messages too short' };
      }

      // Format messages for mem0
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add default metadata
      const enhancedMetadata = {
        source: 'conversation',
        timestamp: new Date().toISOString(),
        ...metadata
      };

      // Add to mem0 with contextual add (v2)
      const result = await this.retryOperation(async () => {
        return await this.client.add(formattedMessages, {
          user_id: userId,
          version: "v2",
          metadata: enhancedMetadata
        });
      });

      logger.info('Added conversation to mem0', {
        messageCount: messages.length,
        userId
      });

      // Invalidate cache for this user
      if (this.cacheEnabled) {
        this.memoryCache.delete(`all_memories_${userId}`);
      }

      return result;
    } catch (error) {
      logger.error('Error adding conversation to mem0', { error });
      // Return empty result instead of throwing to prevent breaking the assistant
      return { success: false, error };
    }
  }

  /**
   * Add a single memory
   * @param memory The memory text to add
   * @param userId User ID to associate with the memory
   * @param metadata Optional metadata to associate with the memory
   * @returns Promise resolving to the result of the operation
   */
  async addMemory(memory: string, userId: string, metadata: MemoryMetadata = {}): Promise<any> {
    try {
      // Skip if memory is too short
      if (!memory || memory.trim().length <= MIN_QUERY_LENGTH) {
        logger.info('Skipping memory storage for short memory', { userId });
        return { success: true, skipped: true, reason: 'Memory too short' };
      }

      // Add default metadata
      const enhancedMetadata = {
        source: 'manual',
        timestamp: new Date().toISOString(),
        ...metadata
      };

      // Add to mem0
      const result = await this.retryOperation(async () => {
        return await this.client.add_memory(memory, {
          user_id: userId,
          version: "v2",
          metadata: enhancedMetadata
        });
      });

      logger.info('Added memory to mem0', {
        userId
      });

      // Invalidate cache for this user
      if (this.cacheEnabled) {
        this.memoryCache.delete(`all_memories_${userId}`);
      }

      return result;
    } catch (error) {
      logger.error('Error adding memory to mem0', { error });
      // Return empty result instead of throwing to prevent breaking the assistant
      return { success: false, error };
    }
  }

  /**
   * Search for relevant memories
   * @param query Query to search for
   * @param userId User ID to search memories for
   * @param limit Maximum number of results to return
   * @param filters Additional filters to apply
   * @returns Promise resolving to an array of relevant memories
   */
  async searchMemories(query: string, userId: string, limit: number = 5, filters: any = {}): Promise<any[]> {
    try {
      // Skip if query is too short
      if (!query || query.trim().length <= MIN_QUERY_LENGTH) {
        logger.info('Skipping memory search for short query', { userId, queryLength: query?.trim().length });
        return [];
      }

      // Check cache first
      const cacheKey = `search_${userId}_${query}`;
      if (this.cacheEnabled) {
        const cachedResults = this.memoryCache.get(cacheKey);
        if (cachedResults) {
          logger.info('Retrieved memories from cache', {
            count: cachedResults.length,
            userId,
            query
          });
          return cachedResults;
        }
      }

      // Combine filters
      const combinedFilters = {
        AND: [
          { user_id: userId },
          ...(filters.AND || [])
        ],
        ...filters
      };

      const results = await this.retryOperation(async () => {
        return await this.client.search(query, {
          user_id: userId,
          version: "v2",
          filters: combinedFilters,
          limit
        });
      });

      // Filter out any invalid results
      const validResults = Array.isArray(results)
        ? results.filter(r => r && r.memory)
        : [];

      logger.info('Retrieved memories from mem0', {
        count: validResults.length,
        userId,
        query
      });

      // Cache the results
      if (this.cacheEnabled && validResults.length > 0) {
        this.memoryCache.set(cacheKey, validResults);
      }

      return validResults;
    } catch (error) {
      logger.error('Error searching memories in mem0', { error, query });
      return [];
    }
  }

  /**
   * Get all memories for a user
   * @param userId User ID to get memories for
   * @param page Page number (1-based)
   * @param pageSize Number of memories per page
   * @param filters Additional filters to apply
   * @returns Promise resolving to an array of memories
   */
  async getAllMemories(
    userId: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE,
    filters: any = {}
  ): Promise<any[]> {
    try {
      // Check cache first
      const cacheKey = `all_memories_${userId}_${page}_${pageSize}`;
      if (this.cacheEnabled) {
        const cachedMemories = this.memoryCache.get(cacheKey);
        if (cachedMemories) {
          logger.info('Retrieved memories from cache', {
            count: cachedMemories.length,
            userId,
            page
          });
          return cachedMemories;
        }
      }

      // Combine filters
      const combinedFilters = {
        AND: [
          { user_id: userId },
          ...(filters.AND || [])
        ],
        ...filters
      };

      const memories = await this.retryOperation(async () => {
        return await this.client.get_all({
          user_id: userId,
          version: "v2",
          filters: combinedFilters,
          page,
          page_size: pageSize
        });
      });

      const results = memories.results || [];

      // Cache the results
      if (this.cacheEnabled && results.length > 0) {
        this.memoryCache.set(cacheKey, results);
      }

      return results;
    } catch (error) {
      logger.error('Error getting all memories from mem0', { error, userId });
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

      // Invalidate cache for this user
      if (this.cacheEnabled) {
        // Clear all cache entries for this user
        const cacheKeys = [];
        for (let i = 0; i < this.memoryCache.size(); i++) {
          const key = `all_memories_${userId}_${i+1}_${DEFAULT_PAGE_SIZE}`;
          cacheKeys.push(key);
        }
        cacheKeys.forEach(key => this.memoryCache.delete(key));
        this.memoryCache.delete(`all_memories_${userId}`);
      }

      return result;
    } catch (error) {
      logger.error('Error deleting memory from mem0', { error, memoryId });
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

      // Invalidate all cache entries for this user
      if (this.cacheEnabled) {
        // Clear all cache keys that contain this user ID
        for (let i = 0; i < 10; i++) { // Assume max 10 pages for simplicity
          const key = `all_memories_${userId}_${i+1}_${DEFAULT_PAGE_SIZE}`;
          this.memoryCache.delete(key);
        }
        this.memoryCache.delete(`all_memories_${userId}`);
      }

      return result;
    } catch (error) {
      logger.error('Error deleting all memories from mem0', { error, userId });
      return { success: false, error };
    }
  }

  /**
   * Check if the memory service is available
   * @returns Promise resolving to true if the service is available, false otherwise
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try a simple operation to check if the service is available
      await this.client.get_all({
        user_id: 'test',
        version: "v2",
        page: 1,
        page_size: 1
      });
      return true;
    } catch (error) {
      logger.warn('Mem0 service is not available', { error });
      return false;
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
