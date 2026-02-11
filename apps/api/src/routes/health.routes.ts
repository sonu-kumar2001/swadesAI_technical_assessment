import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

const healthRoutes = new Hono();

healthRoutes.get('/health', async (c) => {
    let dbStatus = 'disconnected';

    try {
        await prisma.$queryRaw`SELECT 1`;
        dbStatus = 'connected';
    } catch {
        dbStatus = 'error';
    }

    return c.json({
        status: dbStatus === 'connected' ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbStatus,
    });
});

export { healthRoutes };
