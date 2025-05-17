import { Mem0Service } from '@/lib/ai-assistant/mem0-service';
import { MemoryClient } from 'mem0ai';

// Mock the mem0ai package
jest.mock('mem0ai', () => ({
  MemoryClient: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ success: true }),
    search: jest.fn().mockResolvedValue([
      { id: '1', memory: 'Test memory 1', created_at: new Date().toISOString() },
      { id: '2', memory: 'Test memory 2', created_at: new Date().toISOString() }
    ]),
    get_all: jest.fn().mockResolvedValue({
      results: [
        { id: '1', memory: 'Test memory 1', created_at: new Date().toISOString() },
        { id: '2', memory: 'Test memory 2', created_at: new Date().toISOString() }
      ]
    }),
    delete: jest.fn().mockResolvedValue({ success: true }),
    delete_all: jest.fn().mockResolvedValue({ success: true })
  }))
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Mem0Service', () => {
  let mem0Service: Mem0Service;
  const mockUserId = 'test-user-id';
  const mockMessages = [
    { id: '1', role: 'user', content: 'Hello' },
    { id: '2', role: 'assistant', content: 'Hi there!' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mem0Service = new Mem0Service({ apiKey: 'test-api-key' });
  });

  describe('constructor', () => {
    it('should initialize with the provided API key', () => {
      expect(MemoryClient).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    });

    it('should use the environment variable if no API key is provided', () => {
      process.env.NEXT_PUBLIC_MEM0_API_KEY = 'env-api-key';
      new Mem0Service();
      expect(MemoryClient).toHaveBeenCalledWith({ apiKey: 'env-api-key' });
      delete process.env.NEXT_PUBLIC_MEM0_API_KEY;
    });

    it('should log a warning if no API key is provided', () => {
      delete process.env.NEXT_PUBLIC_MEM0_API_KEY;
      const { logger } = require('@/lib/logger');
      new Mem0Service();
      expect(logger.warn).toHaveBeenCalledWith('No Mem0 API key provided. Memory capabilities will be limited.');
    });
  });

  describe('addConversation', () => {
    it('should add a conversation to mem0', async () => {
      const result = await mem0Service.addConversation(mockMessages, mockUserId);
      
      expect(result).toEqual({ success: true });
      expect(mem0Service['client'].add).toHaveBeenCalledWith(
        [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ],
        { user_id: mockUserId, version: 'v2' }
      );
    });

    it('should handle errors when adding a conversation', async () => {
      const error = new Error('Failed to add conversation');
      (mem0Service['client'].add as jest.Mock).mockRejectedValueOnce(error);
      
      await expect(mem0Service.addConversation(mockMessages, mockUserId)).rejects.toThrow(error);
      
      const { logger } = require('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith('Error adding conversation to mem0', { error });
    });
  });

  describe('searchMemories', () => {
    it('should search for memories', async () => {
      const query = 'test query';
      const result = await mem0Service.searchMemories(query, mockUserId);
      
      expect(result).toHaveLength(2);
      expect(mem0Service['client'].search).toHaveBeenCalledWith(
        query,
        { user_id: mockUserId, version: 'v2' }
      );
    });

    it('should handle errors when searching for memories', async () => {
      const error = new Error('Failed to search memories');
      (mem0Service['client'].search as jest.Mock).mockRejectedValueOnce(error);
      
      const result = await mem0Service.searchMemories('test', mockUserId);
      
      expect(result).toEqual([]);
      const { logger } = require('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith('Error searching memories in mem0', { error });
    });
  });

  describe('getAllMemories', () => {
    it('should get all memories for a user', async () => {
      const result = await mem0Service.getAllMemories(mockUserId);
      
      expect(result).toHaveLength(2);
      expect(mem0Service['client'].get_all).toHaveBeenCalledWith(
        { user_id: mockUserId, version: 'v2' }
      );
    });

    it('should handle errors when getting all memories', async () => {
      const error = new Error('Failed to get all memories');
      (mem0Service['client'].get_all as jest.Mock).mockRejectedValueOnce(error);
      
      const result = await mem0Service.getAllMemories(mockUserId);
      
      expect(result).toEqual([]);
      const { logger } = require('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith('Error getting all memories from mem0', { error });
    });
  });

  describe('deleteMemory', () => {
    it('should delete a memory', async () => {
      const memoryId = 'memory-id';
      const result = await mem0Service.deleteMemory(memoryId, mockUserId);
      
      expect(result).toEqual({ success: true });
      expect(mem0Service['client'].delete).toHaveBeenCalledWith(
        memoryId,
        { user_id: mockUserId, version: 'v2' }
      );
    });

    it('should handle errors when deleting a memory', async () => {
      const error = new Error('Failed to delete memory');
      (mem0Service['client'].delete as jest.Mock).mockRejectedValueOnce(error);
      
      await expect(mem0Service.deleteMemory('memory-id', mockUserId)).rejects.toThrow(error);
      
      const { logger } = require('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith('Error deleting memory from mem0', { error });
    });
  });

  describe('deleteAllMemories', () => {
    it('should delete all memories for a user', async () => {
      const result = await mem0Service.deleteAllMemories(mockUserId);
      
      expect(result).toEqual({ success: true });
      expect(mem0Service['client'].delete_all).toHaveBeenCalledWith(
        { user_id: mockUserId, version: 'v2' }
      );
    });

    it('should handle errors when deleting all memories', async () => {
      const error = new Error('Failed to delete all memories');
      (mem0Service['client'].delete_all as jest.Mock).mockRejectedValueOnce(error);
      
      await expect(mem0Service.deleteAllMemories(mockUserId)).rejects.toThrow(error);
      
      const { logger } = require('@/lib/logger');
      expect(logger.error).toHaveBeenCalledWith('Error deleting all memories from mem0', { error });
    });
  });
});
