import { generateObject } from 'ai';
import { z } from 'zod';
import { ROUTER_MODEL } from '../lib/ai.js';
import type { IntentClassification } from '@repo/shared';

const intentSchema = z.object({
    intent: z.enum(['support', 'order', 'billing', 'general']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
});

const ROUTER_SYSTEM_PROMPT = `You are a customer support intent classifier. Analyze the user's message and classify it into one of the following categories.

Classification rules:
- "support": General product support, FAQs, troubleshooting, how-to questions, account help, setup guides
- "order": Order status inquiries, delivery tracking, order modifications, cancellations, shipping questions about specific orders
- "billing": Payment issues, refund requests/status, invoice inquiries, subscription management, charges, billing history
- "general": Greetings, off-topic messages, unclear intent that doesn't fit the above categories

Guidelines:
- Consider the full context of the conversation, not just keywords
- If a message mentions both order and billing (e.g., "refund for order X"), classify as "billing" since the primary action is billing-related
- Simple greetings like "hi" or "hello" should be "general"
- If unsure, lean toward "general" with lower confidence
- Confidence should reflect how certain you are: >0.8 = very clear, 0.5-0.8 = likely, <0.5 = uncertain`;

/**
 * Router Agent
 * Uses structured output (generateObject) to classify intent.
 * This is faster and cheaper than a full streaming response for classification.
 */
export async function classifyIntent(
    userMessage: string,
    conversationContext?: string
): Promise<IntentClassification> {
    try {
        const prompt = conversationContext
            ? `Previous conversation context:\n${conversationContext}\n\nNew user message: "${userMessage}"`
            : `User message: "${userMessage}"`;

        const { object } = await generateObject({
            model: ROUTER_MODEL,
            schema: intentSchema,
            system: ROUTER_SYSTEM_PROMPT,
            prompt,
        });

        return object;
    } catch (error) {
        console.error('[RouterAgent] Classification failed:', error);
        // Fallback to "general" on error
        return {
            intent: 'general',
            confidence: 0.3,
            reasoning: 'Classification failed, defaulting to general support.',
        };
    }
}
