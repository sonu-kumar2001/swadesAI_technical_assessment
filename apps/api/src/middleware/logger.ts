import type { Context, Next } from 'hono';

/**
 * Request logging middleware.
 * Logs method, path, status, and response time.
 */
export const logger = async (c: Context, next: Next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;

    console.log(`→ ${method} ${path}`);

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    console.log(`← ${method} ${path} ${status} ${duration}ms`);
};
