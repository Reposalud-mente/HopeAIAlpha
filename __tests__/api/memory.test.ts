import { NextRequest } from 'next/server';
import { GET, DELETE } from '@/app/api/memory/route';
import { POST } from '@/app/api/memory/add/route';
import { GET as SEARCH_GET } from '@/app/api/memory/search/route';
import { getMem0Service } from '@/lib/ai-assistant/mem0-service';

// Mock the Mem0Service
jest.mock('@/lib/ai-assistant/mem0-service', () => ({
  getMem0Service: jest.fn().mockReturnValue({
    getAllMemories: jest.fn().mockResolvedValue([
      { id: '1', memory: 'Test memory 1', created_at: new Date().toISOString() },
      { id: '2', memory: 'Test memory 2', created_at: new Date().toISOString() }
    ]),
    searchMemories: jest.fn().mockResolvedValue([
      { id: '1', memory: 'Test memory 1', created_at: new Date().toISOString() }
    ]),
    addConversation: jest.fn().mockResolvedValue({ success: true }),
    deleteMemory: jest.fn().mockResolvedValue({ success: true }),
    deleteAllMemories: jest.fn().mockResolvedValue({ success: true })
  })
}));

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn().mockReturnValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com'
            }
          }
        }
      })
    }
  })
}));

// Mock the cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({})
}));

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Memory API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/memory', () => {
    it('should return memories for the authenticated user', async () => {
      const req = new NextRequest('http://localhost/api/memory');
      const res = await GET(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.memories).toHaveLength(2);
      expect(getMem0Service().getAllMemories).toHaveBeenCalledWith('test-user-id');
    });

    it('should return 401 if user is not authenticated', async () => {
      const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs');
      createRouteHandlerClient.mockReturnValueOnce({
        auth: {
          getSession: jest.fn().mockResolvedValue({
            data: { session: null }
          })
        }
      });
      
      const req = new NextRequest('http://localhost/api/memory');
      const res = await GET(req);
      const data = await res.json();
      
      expect(res.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/memory', () => {
    it('should delete a specific memory', async () => {
      const req = new NextRequest('http://localhost/api/memory?id=memory-id');
      const res = await DELETE(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getMem0Service().deleteMemory).toHaveBeenCalledWith('memory-id', 'test-user-id');
    });

    it('should delete all memories if no ID is provided', async () => {
      const req = new NextRequest('http://localhost/api/memory');
      const res = await DELETE(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getMem0Service().deleteAllMemories).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('POST /api/memory/add', () => {
    it('should add a conversation to memory', async () => {
      const mockMessages = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi there!' }
      ];
      
      const req = new NextRequest('http://localhost/api/memory/add', {
        method: 'POST',
        body: JSON.stringify({ messages: mockMessages })
      });
      
      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(getMem0Service().addConversation).toHaveBeenCalledWith(mockMessages, 'test-user-id');
    });

    it('should return 400 if messages are not provided', async () => {
      const req = new NextRequest('http://localhost/api/memory/add', {
        method: 'POST',
        body: JSON.stringify({})
      });
      
      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(400);
      expect(data.error).toBe('Invalid request body. Expected an array of messages.');
    });
  });

  describe('GET /api/memory/search', () => {
    it('should search for memories', async () => {
      const req = new NextRequest('http://localhost/api/memory/search?q=test');
      const res = await SEARCH_GET(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.memories).toHaveLength(1);
      expect(getMem0Service().searchMemories).toHaveBeenCalledWith('test', 'test-user-id');
    });

    it('should return 400 if query is not provided', async () => {
      const req = new NextRequest('http://localhost/api/memory/search');
      const res = await SEARCH_GET(req);
      const data = await res.json();
      
      expect(res.status).toBe(400);
      expect(data.error).toBe('Query parameter "q" is required');
    });
  });
});
