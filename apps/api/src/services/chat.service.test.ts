import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as chatService from './chat.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
    prisma: {
        conversation: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
        },
        message: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe('Chat Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createConversation', () => {
        it('should create a new conversation', async () => {
            const mockConversation = {
                id: '123',
                userId: 'user1',
                title: 'New Conversation',
                status: 'active',
            };
            vi.mocked(prisma.conversation.create).mockResolvedValue(mockConversation as any);

            const result = await chatService.createConversation('user1');
            expect(prisma.conversation.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user1',
                    title: 'New Conversation',
                    status: 'active',
                },
            });
            expect(result).toEqual(mockConversation);
        });
    });

    describe('getConversation', () => {
        it('should return a conversation with messages', async () => {
            const mockConversation = {
                id: '123',
                userId: 'user1',
                messages: [],
            };
            vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as any);

            const result = await chatService.getConversation('123');
            expect(prisma.conversation.findUnique).toHaveBeenCalledWith({
                where: { id: '123' },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                    },
                },
            });
            expect(result).toEqual(mockConversation);
        });
    });

    describe('addMessage', () => {
        it('should add a message and update conversation', async () => {
            const mockMessage = {
                id: 'msg1',
                conversationId: '123',
                role: 'user',
                content: 'Hello',
            };
            vi.mocked(prisma.message.create).mockResolvedValue(mockMessage as any);
            vi.mocked(prisma.conversation.update).mockResolvedValue({} as any);

            const result = await chatService.addMessage('123', 'user', 'Hello');

            expect(prisma.message.create).toHaveBeenCalledWith({
                data: {
                    conversationId: '123',
                    role: 'user',
                    content: 'Hello',
                    agentType: undefined,
                    toolCalls: undefined,
                    metadata: undefined,
                },
            });

            expect(prisma.conversation.update).toHaveBeenCalledWith({
                where: { id: '123' },
                data: {
                    lastAgentType: undefined,
                    updatedAt: expect.any(Date),
                },
            });

            expect(result).toEqual(mockMessage);
        });
    });
});
