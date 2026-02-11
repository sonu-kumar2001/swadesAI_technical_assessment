import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as agentService from './agent.service';
import * as routerAgent from '../agents/router.agent';
import * as chatService from './chat.service';
import * as contextService from './context.service';
import * as supportAgent from '../agents/support.agent';
import * as orderAgent from '../agents/order.agent';
import * as billingAgent from '../agents/billing.agent';

vi.mock('../agents/router.agent');
vi.mock('./chat.service');
vi.mock('./context.service');
vi.mock('../agents/support.agent');
vi.mock('../agents/order.agent');
vi.mock('../agents/billing.agent');

describe('Agent Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('processMessage', () => {
        it('should create a new conversation if no ID provided', async () => {
            const userId = 'user1';
            const message = 'Hello';
            const title = 'New Chat';
            const conversation = { id: 'conv1', contextSummary: '' };

            vi.mocked(contextService.generateTitle).mockResolvedValue(title);
            vi.mocked(chatService.createConversation).mockResolvedValue(conversation as any);
            vi.mocked(chatService.getMessages).mockResolvedValue([]);
            vi.mocked(routerAgent.classifyIntent).mockResolvedValue({
                intent: 'general',
                confidence: 0.9,
                reasoning: 'general query'
            });
            vi.mocked(contextService.prepareContext).mockResolvedValue([]);
            vi.mocked(supportAgent.createSupportStream).mockReturnValue({} as any);

            await agentService.processMessage(userId, message, null);

            expect(contextService.generateTitle).toHaveBeenCalledWith(message);
            expect(chatService.createConversation).toHaveBeenCalledWith(userId, title);
        });

        it('should route to order agent if intent is order', async () => {
            const userId = 'user1';
            const message = 'Where is my order?';
            const conversation = { id: 'conv1', contextSummary: '' };

            vi.mocked(chatService.getConversation).mockResolvedValue(conversation as any);
            vi.mocked(chatService.getMessages).mockResolvedValue([]);
            vi.mocked(routerAgent.classifyIntent).mockResolvedValue({
                intent: 'order',
                confidence: 0.9,
                reasoning: 'order query'
            });
            vi.mocked(contextService.prepareContext).mockResolvedValue([]);
            vi.mocked(orderAgent.createOrderStream).mockReturnValue({} as any);

            const result = await agentService.processMessage(userId, message, 'conv1');

            expect(orderAgent.createOrderStream).toHaveBeenCalled();
            expect(result.agentType).toBe('order');
        });

        it('should route to billing agent if intent is billing', async () => {
            const userId = 'user1';
            const message = 'Payment failed';
            const conversation = { id: 'conv1', contextSummary: '' };

            vi.mocked(chatService.getConversation).mockResolvedValue(conversation as any);
            vi.mocked(chatService.getMessages).mockResolvedValue([]);
            vi.mocked(routerAgent.classifyIntent).mockResolvedValue({
                intent: 'billing',
                confidence: 0.9,
                reasoning: 'billing query'
            });
            vi.mocked(contextService.prepareContext).mockResolvedValue([]);
            vi.mocked(billingAgent.createBillingStream).mockReturnValue({} as any);

            const result = await agentService.processMessage(userId, message, 'conv1');

            expect(billingAgent.createBillingStream).toHaveBeenCalled();
            expect(result.agentType).toBe('billing');
        });
    });
});
