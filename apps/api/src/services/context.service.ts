import { generateText, type CoreMessage } from 'ai';
import { DEFAULT_MODEL } from '../lib/ai.js';
import { estimateMessagesTokens } from '../lib/token-counter.js';
import { TOKEN_CONFIG } from '@repo/shared';

/**
 * Context Service
 * Manages conversation context including token counting and compaction.
 */

/**
 * Prepare the message context for an agent call.
 * If the message history is too long, compact older messages into a summary.
 */
export async function prepareContext(
    messages: { role: string; content: string }[],
    existingSummary?: string | null
): Promise<CoreMessage[]> {
    const coreMessages: CoreMessage[] = [];

    // If there's an existing compacted summary, prepend it
    if (existingSummary) {
        coreMessages.push({
            role: 'system',
            content: `Previous conversation summary: ${existingSummary}`,
        });
    }

    // Convert DB messages to CoreMessage format
    for (const msg of messages) {
        if (msg.role === 'user') {
            coreMessages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'assistant') {
            coreMessages.push({ role: 'assistant', content: msg.content });
        } else if (msg.role === 'system') {
            coreMessages.push({ role: 'system', content: msg.content });
        }
        // Skip 'tool' role messages — handled internally by AI SDK
    }

    // Check if compaction is needed
    const totalTokens = estimateMessagesTokens(
        coreMessages.map((m) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : '',
        }))
    );

    if (totalTokens > TOKEN_CONFIG.MAX_CONTEXT_TOKENS) {
        return await compactMessages(coreMessages);
    }

    return coreMessages;
}

/**
 * Compact older messages into a summary to stay within token limits.
 * Keeps the most recent messages intact and summarizes older ones.
 */
async function compactMessages(
    messages: CoreMessage[]
): Promise<CoreMessage[]> {
    // Keep the last 4 messages (2 user-assistant pairs) intact
    const keepCount = Math.min(4, messages.length);
    const oldMessages = messages.slice(0, messages.length - keepCount);
    const recentMessages = messages.slice(messages.length - keepCount);

    if (oldMessages.length === 0) {
        return recentMessages;
    }

    // Summarize old messages
    const conversationText = oldMessages
        .map((m) => `${m.role}: ${typeof m.content === 'string' ? m.content : '[complex content]'}`)
        .join('\n');

    try {
        const { text: summary } = await generateText({
            model: DEFAULT_MODEL,
            system:
                'You are a conversation summarizer. Create a concise summary of the conversation below, preserving key details like order numbers, issue descriptions, refund amounts, agent actions taken, and any unresolved issues. Keep it to 2-3 sentences.',
            prompt: conversationText,
        });

        return [
            {
                role: 'system',
                content: `Previous conversation summary: ${summary}`,
            },
            ...recentMessages,
        ];
    } catch (error) {
        console.error('[ContextService] Compaction failed:', error);
        // Fallback: just keep recent messages without summary
        return recentMessages;
    }
}

/**
 * Generate a conversation title from the first user message.
 */
export async function generateTitle(userMessage: string): Promise<string> {
    try {
        const { text } = await generateText({
            model: DEFAULT_MODEL,
            system:
                'Generate a very short title (3-6 words) for a customer support conversation based on the user\'s first message. Return only the title, nothing else.',
            prompt: userMessage,
        });
        return text.trim().slice(0, 100);
    } catch {
        return 'New Conversation';
    }
}
