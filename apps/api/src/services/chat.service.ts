import { prisma } from '../lib/prisma.js';

type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * Chat Service
 * Handles conversation and message persistence (CRUD).
 */

export async function createConversation(userId: string, title?: string) {
    return prisma.conversation.create({
        data: {
            userId,
            title: title || 'New Conversation',
            status: 'active',
        },
    });
}

export async function getConversation(conversationId: string) {
    return prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
}

export async function listConversations(
    userId: string,
    limit = 20,
    offset = 0
) {
    const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip: offset,
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: { content: true },
                },
                _count: { select: { messages: true } },
            },
        }),
        prisma.conversation.count({ where: { userId } }),
    ]);

    return {
        conversations: conversations.map((c: typeof conversations[number]) => ({
            id: c.id,
            title: c.title,
            status: c.status,
            lastAgentType: c.lastAgentType,
            lastMessage: c.messages[0]?.content || null,
            messageCount: c._count.messages,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
        })),
        total,
    };
}

export async function deleteConversation(conversationId: string) {
    // Messages are cascade-deleted via the relation
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
    });

    if (!conversation) return null;

    await prisma.conversation.delete({
        where: { id: conversationId },
    });

    return { id: conversationId, deleted: true };
}

export async function addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    agentType?: string | null,
    toolCalls?: unknown,
    metadata?: unknown
) {
    const message = await prisma.message.create({
        data: {
            conversationId,
            role,
            content,
            agentType,
            toolCalls: toolCalls ? (toolCalls as any) : undefined,
            metadata: metadata ? (metadata as any) : undefined,
        },
    });

    // Update conversation's updatedAt and lastAgentType
    await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            lastAgentType: agentType || undefined,
            updatedAt: new Date(),
        },
    });

    return message;
}

export async function getMessages(conversationId: string) {
    return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
    });
}

export async function updateConversationSummary(
    conversationId: string,
    summary: string
) {
    return prisma.conversation.update({
        where: { id: conversationId },
        data: { contextSummary: summary },
    });
}
