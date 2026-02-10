import type { Context, Next } from 'hono';

interface RateWindow {
    count: number;
    resetAt: number;
}

const windows = new Map<string, RateWindow>();

// Periodic cleanup of expired windows (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, window] of windows) {
        if (now > window.resetAt) {
            windows.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Sliding window rate limiter middleware.
 * In-memory — suitable for single-instance deployments.
 * For multi-instance, replace with Redis-backed solution.
 */
export const rateLimiter = (maxRequests: number, windowMs: number) => {
    return async (c: Context, next: Next) => {
        const ip =
            c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
            c.req.header('x-real-ip') ||
            'unknown';

        const key = `${ip}:${c.req.path}`;
        const now = Date.now();
        const window = windows.get(key);

        if (!window || now > window.resetAt) {
            windows.set(key, { count: 1, resetAt: now + windowMs });
            c.header('X-RateLimit-Limit', String(maxRequests));
            c.header('X-RateLimit-Remaining', String(maxRequests - 1));
            c.header('X-RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
            await next();
            return;
        }

        if (window.count >= maxRequests) {
            const retryAfter = Math.ceil((window.resetAt - now) / 1000);
            c.header('Retry-After', String(retryAfter));
            c.header('X-RateLimit-Limit', String(maxRequests));
            c.header('X-RateLimit-Remaining', '0');
            c.header('X-RateLimit-Reset', String(Math.ceil(window.resetAt / 1000)));
            return c.json(
                {
                    error: {
                        code: 'RATE_LIMITED',
                        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
                    },
                },
                429
            );
        }

        window.count++;
        c.header('X-RateLimit-Limit', String(maxRequests));
        c.header('X-RateLimit-Remaining', String(maxRequests - window.count));
        c.header('X-RateLimit-Reset', String(Math.ceil(window.resetAt / 1000)));
        await next();
    };
};
