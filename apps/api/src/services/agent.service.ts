import { type StreamTextResult } from 'ai';
import { classifyIntent } from '../agents/router.agent.js';
import { createSupportStream } from '../agents/support.agent.js';
import { createOrderStream } from '../agents/order.agent.js';
import { createBillingStream } from '../agents/billing.agent.js';
import * as chatService from './chat.service.js';
import { prepareContext, generateTitle } from './context.service.js';
import type { IntentType } from '@repo/shared';

export interface AgentResponse {
    stream: StreamTextResult<any, any>;
    conversationId: string;
    agentType: string;
    intent: { intent: IntentType; confidence: number; reasoning: string };
}

/**
 * Agent Service
 * Orchestrates the full flow: classify → route → stream.
 */
export async function processMessage(
    userId: string,
    message: string,
    conversationId: string | null
): Promise<AgentResponse> {
    // 1. Get or create conversation
    let conversation;
    if (conversationId) {
        conversation = await chatService.getConversation(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
    } else {
        const title = await generateTitle(message);
        conversation = await chatService.createConversation(userId, title);
    }

    // 2. Save user message
    await chatService.addMessage(conversation.id, 'user', message);

    // 3. Load conversation history
    const dbMessages = await chatService.getMessages(conversation.id);
    const historyForContext = dbMessages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
    }));

    // 4. Prepare context summary for router (last few messages)
    const recentContext = historyForContext
        .slice(-6)
        .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
        .join('\n');

    // 5. Classify intent
    const intent = await classifyIntent(message, recentContext);
    console.log(
        `[AgentService] Intent: ${intent.intent} (${intent.confidence}) — ${intent.reasoning}`
    );

    // 6. Prepare context-managed messages for the agent
    const contextMessages = await prepareContext(
        historyForContext,
        conversation.contextSummary
    );

    // 7. Route to the appropriate agent
    let agentType: string;
    let stream: StreamTextResult<any, any>;

    switch (intent.intent) {
        case 'order':
            agentType = 'order';
            stream = createOrderStream(contextMessages, userId);
            break;
        case 'billing':
            agentType = 'billing';
            stream = createBillingStream(contextMessages, userId);
            break;
        case 'support':
            agentType = 'support';
            stream = createSupportStream(contextMessages, userId);
            break;
        case 'general':
        default:
            // Low confidence or general → fallback to support
            agentType = 'support';
            stream = createSupportStream(contextMessages, userId);
            break;
    }

    return {
        stream,
        conversationId: conversation.id,
        agentType,
        intent,
    };
}

/**
 * Save the assistant's response after streaming completes.
 */
export async function saveAssistantResponse(
    conversationId: string,
    agentType: string,
    content: string,
    toolCalls?: unknown
) {
    return chatService.addMessage(
        conversationId,
        'assistant',
        content,
        agentType,
        toolCalls
    );
}
