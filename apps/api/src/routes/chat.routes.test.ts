import { describe, it, expect, vi } from 'vitest';
import { chatRoutes } from './chat.routes';
import { chatController } from '../controllers/chat.controller';

vi.mock('../controllers/chat.controller', () => ({
    chatController: {
        sendMessage: vi.fn(),
        listConversations: vi.fn(),
        getConversation: vi.fn(),
        deleteConversation: vi.fn(),
    },
}));

vi.mock('../middleware/rate-limiter', () => ({
    rateLimiter: () => (c: any, next: any) => next(),
}));

// Mock @repo/shared if used directly in routes (it is for RATE_LIMITS but we mocked rateLimiter factory)
vi.mock('@repo/shared', () => ({
    RATE_LIMITS: {
        CHAT: { maxRequests: 10, windowMs: 60000 },
        GENERAL: { maxRequests: 100, windowMs: 60000 },
    },
}));

describe('Chat Routes', () => {
    it('POST /messages should call sendMessage controller', async () => {
        vi.mocked(chatController.sendMessage).mockResolvedValue(new Response('ok') as any);
        const res = await chatRoutes.request('/messages', { method: 'POST' });
        expect(chatController.sendMessage).toHaveBeenCalled();
        expect(res.status).toBe(200);
    });

    it('GET /conversations should call listConversations controller', async () => {
        vi.mocked(chatController.listConversations).mockResolvedValue(new Response('ok') as any);
        const res = await chatRoutes.request('/conversations');
        expect(chatController.listConversations).toHaveBeenCalled();
    });

    it('GET /conversations/:id should call getConversation controller', async () => {
        vi.mocked(chatController.getConversation).mockResolvedValue(new Response('ok') as any);
        const res = await chatRoutes.request('/conversations/123');
        expect(chatController.getConversation).toHaveBeenCalled();
    });

    it('DELETE /conversations/:id should call deleteConversation controller', async () => {
        vi.mocked(chatController.deleteConversation).mockResolvedValue(new Response('ok') as any);
        const res = await chatRoutes.request('/conversations/123', { method: 'DELETE' });
        expect(chatController.deleteConversation).toHaveBeenCalled();
    });
});
