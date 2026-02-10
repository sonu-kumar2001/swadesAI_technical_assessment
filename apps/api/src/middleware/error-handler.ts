import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export interface AppError {
    code: string;
    message: string;
    details?: unknown;
}

/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns structured JSON responses.
 */
export const errorHandler = async (c: Context, next: Next) => {
    try {
        await next();
    } catch (err) {
        console.error('[Error]', err);

        if (err instanceof HTTPException) {
            return c.json(
                {
                    error: {
                        code: 'HTTP_ERROR',
                        message: err.message,
                    } satisfies AppError,
                },
                err.status
            );
        }

        if (err instanceof Error) {
            // Prisma-specific errors
            if (err.name === 'PrismaClientKnownRequestError') {
                return c.json(
                    {
                        error: {
                            code: 'DATABASE_ERROR',
                            message: 'A database error occurred',
                            details:
                                process.env.NODE_ENV === 'development' ? err.message : undefined,
                        } satisfies AppError,
                    },
                    500
                );
            }

            // Zod / validation errors
            if (err.name === 'ZodError') {
                return c.json(
                    {
                        error: {
                            code: 'VALIDATION_ERROR',
                            message: 'Invalid request data',
                            details: err,
                        } satisfies AppError,
                    },
                    422
                );
            }

            // AI SDK / OpenAI Quota Errors
            if (err.message?.includes('exceeded your current quota') || err.message?.includes('insufficient_quota')) {
                return c.json(
                    {
                        error: {
                            code: 'API_LIMIT_EXCEEDED',
                            message: 'api limit exceeded',
                        } satisfies AppError,
                    },
                    429
                );
            }

            return c.json(
                {
                    error: {
                        code: 'INTERNAL_ERROR',
                        message:
                            process.env.NODE_ENV === 'development'
                                ? err.message
                                : 'An internal error occurred',
                    } satisfies AppError,
                },
                500
            );
        }

        return c.json(
            {
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred',
                } satisfies AppError,
            },
            500
        );
    }
};
