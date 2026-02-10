import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './middleware/logger.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { chatRoutes } from './routes/chat.routes.js';
import { agentRoutes } from './routes/agent.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { RATE_LIMITS } from '@repo/shared';

// ========================
// Create Hono App
// ========================
const app = new Hono();

// ========================
// Global Middleware
// ========================
app.use('*', logger);
app.use('*', errorHandler);
app.use(
    '*',
    cors({
        origin: ['http://localhost:5173', 'https://swades-ai-technical-assessment-web.vercel.app'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        exposeHeaders: [
            'X-Conversation-Id',
            'X-Agent-Type',
            'X-Intent',
            'X-Intent-Confidence',
            'X-Intent-Reasoning',
            'X-RateLimit-Limit',
            'X-RateLimit-Remaining',
            'X-RateLimit-Reset',
        ],
        maxAge: 86400,
    })
);

// General rate limiting
app.use('/api/*', rateLimiter(RATE_LIMITS.GENERAL.maxRequests, RATE_LIMITS.GENERAL.windowMs));

// ========================
// Routes
// ========================
app.route('/api/chat', chatRoutes);
app.route('/api/agents', agentRoutes);
app.route('/api/health', healthRoutes);

// Root
app.get('/', (c) =>
    c.json({
        name: 'AI Customer Support API',
        version: '1.0.0',
        docs: '/api/health',
    })
);

// ========================
// Export type for Hono RPC
// ========================
export type AppType = typeof app;

// ========================
// Start Server
// ========================
const port = parseInt(process.env.PORT || '3001', 10);

console.log(`\n🚀 AI Customer Support API`);
console.log(`   Server:  http://localhost:${port}`);
console.log(`   Health:  http://localhost:${port}/api/health`);
console.log(`   Env:     ${process.env.NODE_ENV || 'development'}\n`);

serve({
    fetch: app.fetch,
    port,
});

export default app;
