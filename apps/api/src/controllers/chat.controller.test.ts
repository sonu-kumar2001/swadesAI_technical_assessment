import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatController } from './chat.controller';
import * as agentService from '../services/agent.service';
import * as chatService from '../services/chat.service';

vi.mock('../services/agent.service');
vi.mock('../services/chat.service');

describe('Chat Controller', () => {
    let c: any;

    beforeEach(() => {
        vi.clearAllMocks();
        c = {
            req: {
                json: vi.fn(),
                param: vi.fn(),
                query: vi.fn(),
            },
            json: vi.fn(),
            header: vi.fn(),
        };
    });

    describe('sendMessage', () => {
        it('should process message and return stream', async () => {
            const mockBody = { userId: 'user1', message: 'Hello', conversationId: null };
            c.req.json.mockResolvedValue(mockBody);

            const mockStream = {
                text: Promise.resolve('Response'),
                toDataStreamResponse: vi.fn().mockReturnValue(new Response('stream')),
            };

            vi.mocked(agentService.processMessage).mockResolvedValue({
                stream: mockStream as any,
                conversationId: 'conv1',
                agentType: 'support',
                intent: { intent: 'general', confidence: 0.9, reasoning: '' },
            });

            const response = await chatController.sendMessage(c);

            expect(agentService.processMessage).toHaveBeenCalledWith('user1', 'Hello', null);
            expect(c.header).toHaveBeenCalledWith('X-Conversation-Id', 'conv1');
            expect(response).toBeInstanceOf(Response);
        });
    });

    describe('getConversation', () => {
        it('should return conversation if found', async () => {
            c.req.param.mockReturnValue('123');
            const mockConv = { id: '123' };
            vi.mocked(chatService.getConversation).mockResolvedValue(mockConv as any);

            await chatController.getConversation(c);

            expect(c.json).toHaveBeenCalledWith({ data: mockConv });
        });

        it('should return 404 if not found', async () => {
            c.req.param.mockReturnValue('123');
            vi.mocked(chatService.getConversation).mockResolvedValue(null);

            await chatController.getConversation(c);

            expect(c.json).toHaveBeenCalledWith(
                { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
                404
            );
        });
    });

    describe('listConversations', () => {
        it('should return list of conversations', async () => {
            c.req.query.mockImplementation((key: string) => {
                if (key === 'userId') return 'user1';
                if (key === 'limit') return '10';
                return undefined;
            });

            const mockResult = {
                conversations: [],
                total: 0
            };
            vi.mocked(chatService.listConversations).mockResolvedValue(mockResult as any);

            await chatController.listConversations(c);

            expect(chatService.listConversations).toHaveBeenCalledWith('user1', 10, 0);
            expect(c.json).toHaveBeenCalledWith({
                data: [],
                pagination: { total: 0, limit: 10, offset: 0 }
            });
        });

        it('should return 422 if userId missing', async () => {
            c.req.query.mockReturnValue(undefined); // No userId

            await chatController.listConversations(c);

            expect(c.json).toHaveBeenCalledWith(
                { error: { code: 'VALIDATION_ERROR', message: 'userId query parameter is required' } },
                422
            );
        });
    });
});
