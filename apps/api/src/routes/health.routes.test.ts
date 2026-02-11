import { describe, it, expect, vi } from 'vitest';
import { healthRoutes } from './health.routes';
import { prisma } from '../lib/prisma';

// Mock the prisma client
vi.mock('../lib/prisma', () => ({
    prisma: {
        $queryRaw: vi.fn(),
    },
}));

describe('Health Routes', () => {
    it('GET / should return ok when database is connected', async () => {
        // Mock successful DB connection
        vi.mocked(prisma.$queryRaw).mockResolvedValue([1]);

        const res = await healthRoutes.request('/');
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({
            status: 'ok',
            timestamp: expect.any(String),
            database: 'connected',
        });
    });

    it('GET / should return degraded when database is disconnected', async () => {
        // Mock failed DB connection
        vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('DB Error'));

        const res = await healthRoutes.request('/');
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body).toEqual({
            status: 'degraded',
            timestamp: expect.any(String),
            database: 'error',
        });
    });
});
