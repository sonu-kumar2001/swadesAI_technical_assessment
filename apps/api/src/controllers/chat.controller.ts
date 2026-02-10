import type { Context } from 'hono';
import { z } from 'zod';
import * as agentService from '../services/agent.service.js';
import * as chatService from '../services/chat.service.js';

const sendMessageSchema = z.object({
    conversationId: z.string().nullable(),
    message: z.string().min(1, 'Message content is required'),
    userId: z.string().min(1, 'User ID is required'),
});

/**
 * Chat Controller
 * Handles HTTP concerns: validation, response formatting, streaming.
 */
export const chatController = {
    /**
     * POST /api/chat/messages
     * Send a message and stream the AI response.
     */
    async sendMessage(c: Context) {
        const body = await c.req.json();
        const parsed = sendMessageSchema.parse(body);

        const { stream, conversationId, agentType, intent } =
            await agentService.processMessage(
                parsed.userId,
                parsed.message,
                parsed.conversationId
            );

        // Set headers for streaming
        c.header('X-Conversation-Id', conversationId);
        c.header('X-Agent-Type', agentType);
        c.header('X-Intent', intent.intent);
        c.header('X-Intent-Confidence', String(intent.confidence));

        // Collect the full response text for persistence
        // We use the stream's callbacks to save after completion
        stream.text.then(async (fullText) => {
            try {
                await agentService.saveAssistantResponse(
                    conversationId,
                    agentType,
                    fullText
                );
            } catch (error) {
                console.error('[ChatController] Failed to save response:', error);
            }
        });

        // Return the streaming response using Vercel AI SDK format
        return stream.toDataStreamResponse({
            headers: {
                'X-Conversation-Id': conversationId,
                'X-Agent-Type': agentType,
                'X-Intent': intent.intent,
                'X-Intent-Confidence': String(intent.confidence),
                'X-Intent-Reasoning': intent.reasoning,
            },
        });
    },

    /**
     * GET /api/chat/conversations/:id
     */
    async getConversation(c: Context) {
        const id = c.req.param('id');
        const conversation = await chatService.getConversation(id);

        if (!conversation) {
            return c.json(
                { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
                404
            );
        }

        return c.json({ data: conversation });
    },

    /**
     * GET /api/chat/conversations
     */
    async listConversations(c: Context) {
        const userId = c.req.query('userId');
        if (!userId) {
            return c.json(
                { error: { code: 'VALIDATION_ERROR', message: 'userId query parameter is required' } },
                422
            );
        }

        const limit = parseInt(c.req.query('limit') || '20', 10);
        const offset = parseInt(c.req.query('offset') || '0', 10);

        const { conversations, total } = await chatService.listConversations(
            userId,
            limit,
            offset
        );

        return c.json({
            data: conversations,
            pagination: { total, limit, offset },
        });
    },

    /**
     * DELETE /api/chat/conversations/:id
     */
    async deleteConversation(c: Context) {
        const id = c.req.param('id');
        const result = await chatService.deleteConversation(id);

        if (!result) {
            return c.json(
                { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
                404
            );
        }

        return c.json({ data: result });
    },
};
