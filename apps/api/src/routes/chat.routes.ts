import { Hono } from 'hono';
import { chatController } from '../controllers/chat.controller.js';
import { rateLimiter } from '../middleware/rate-limiter.js';
import { RATE_LIMITS } from '@repo/shared';

const chatRoutes = new Hono();

// Apply stricter rate limiting to message sending (LLM calls are expensive)
chatRoutes.post(
    '/messages',
    rateLimiter(RATE_LIMITS.CHAT.maxRequests, RATE_LIMITS.CHAT.windowMs),
    (c) => chatController.sendMessage(c)
);

chatRoutes.get('/conversations', (c) => chatController.listConversations(c));
chatRoutes.get('/conversations/:id', (c) => chatController.getConversation(c));
chatRoutes.delete('/conversations/:id', (c) => chatController.deleteConversation(c));

export { chatRoutes };
