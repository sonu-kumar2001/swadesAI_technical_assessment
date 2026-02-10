import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Support Agent Tools
 * - queryConversationHistory: search past conversations for context
 * - searchFAQ: search frequently asked questions
 */

export const queryConversationHistory = tool({
    description:
        'Search past conversations for a specific user to find relevant context, previous issues discussed, or solutions provided before. Use this when the user references past interactions.',
    parameters: z.object({
        userId: z.string().describe('The user ID to search conversations for'),
        query: z
            .string()
            .optional()
            .describe('Optional keyword to search in message content'),
        limit: z
            .number()
            .default(5)
            .describe('Maximum number of conversations to return'),
    }),
    execute: async ({ userId, query, limit }) => {
        try {
            const conversations = await prisma.conversation.findMany({
                where: {
                    userId,
                    ...(query && {
                        messages: {
                            some: { content: { contains: query, mode: 'insensitive' } },
                        },
                    }),
                },
                include: {
                    messages: {
                        take: 3,
                        orderBy: { createdAt: 'desc' },
                        select: { role: true, content: true, agentType: true, createdAt: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
                take: limit,
            });

            if (conversations.length === 0) {
                return { error: null, data: [], message: 'No past conversations found for this user.' };
            }

            return { error: null, data: conversations };
        } catch (error) {
            console.error('[Tool:queryConversationHistory]', error);
            return { error: 'Failed to search conversation history', data: null };
        }
    },
});

// In-memory FAQ database (could be moved to DB for production)
const FAQ_DATABASE = [
    {
        id: 'faq-001',
        question: 'How do I track my order?',
        answer: 'You can track your order by providing your order number (e.g., ORD-001). I can look up the current status, tracking number, and estimated delivery date for you.',
        tags: ['track', 'order', 'delivery', 'shipping', 'status'],
    },
    {
        id: 'faq-002',
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for most items. Items must be in original packaging and unused condition. To initiate a return, provide your order number and we will guide you through the process.',
        tags: ['return', 'policy', 'refund', 'exchange'],
    },
    {
        id: 'faq-003',
        question: 'How do I request a refund?',
        answer: 'To request a refund, provide your order number. We will check the order status and initiate the refund process. Refunds typically take 5-10 business days to process after approval.',
        tags: ['refund', 'money', 'payment', 'return'],
    },
    {
        id: 'faq-004',
        question: 'How do I cancel an order?',
        answer: 'You can cancel an order if it has not been shipped yet. Provide your order number and we will check if cancellation is possible. Orders in "pending" or "confirmed" status can usually be cancelled.',
        tags: ['cancel', 'order', 'stop'],
    },
    {
        id: 'faq-005',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. All transactions are securely processed.',
        tags: ['payment', 'credit card', 'pay', 'methods'],
    },
    {
        id: 'faq-006',
        question: 'How do I contact customer support?',
        answer: 'You are already talking to our AI-powered customer support! I can help with order inquiries, billing questions, and general support. For complex issues, I can escalate to a human agent.',
        tags: ['contact', 'support', 'help', 'agent', 'human'],
    },
    {
        id: 'faq-007',
        question: 'How do I set up my smart home hub?',
        answer: 'To set up your Smart Home Hub: 1) Plug it in and wait for the blue LED, 2) Download our companion app, 3) Create an account, 4) Tap "Add New Device" and select "Smart Home Hub", 5) Follow pairing instructions.',
        tags: ['setup', 'smart home', 'hub', 'install', 'configure'],
    },
    {
        id: 'faq-008',
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship to over 50 countries. International shipping typically takes 7-14 business days. Shipping costs vary by destination and are calculated at checkout.',
        tags: ['international', 'shipping', 'global', 'worldwide'],
    },
];

export const searchFAQ = tool({
    description:
        'Search frequently asked questions and common troubleshooting solutions. Use this for general product questions, how-to guides, or policy inquiries.',
    parameters: z.object({
        topic: z.string().describe('The topic or keywords to search for in FAQs'),
    }),
    execute: async ({ topic }) => {
        try {
            const topicLower = topic.toLowerCase();
            const results = FAQ_DATABASE.filter(
                (faq) =>
                    faq.question.toLowerCase().includes(topicLower) ||
                    faq.answer.toLowerCase().includes(topicLower) ||
                    faq.tags.some((tag) => tag.includes(topicLower))
            );

            if (results.length === 0) {
                return {
                    error: null,
                    data: [],
                    message: `No FAQ entries found for "${topic}". Try rephrasing or I can help directly.`,
                };
            }

            return { error: null, data: results.slice(0, 5) };
        } catch (error) {
            console.error('[Tool:searchFAQ]', error);
            return { error: 'Failed to search FAQs', data: null };
        }
    },
});

export const supportTools = {
    queryConversationHistory,
    searchFAQ,
};
