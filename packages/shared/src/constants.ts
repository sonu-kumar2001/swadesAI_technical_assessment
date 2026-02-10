// Agent Registry Constants
export const AGENTS = {
    router: {
        type: 'router' as const,
        name: 'Router Agent',
        description: 'Analyzes incoming customer queries, classifies intent, and delegates to the appropriate specialized agent.',
    },
    support: {
        type: 'support' as const,
        name: 'Support Agent',
        description: 'Handles general support inquiries, FAQs, troubleshooting, and product guidance.',
    },
    order: {
        type: 'order' as const,
        name: 'Order Agent',
        description: 'Handles order status inquiries, delivery tracking, modifications, and cancellations.',
    },
    billing: {
        type: 'billing' as const,
        name: 'Billing Agent',
        description: 'Handles payment issues, refund requests, invoice inquiries, and subscription queries.',
    },
} as const;

export const AGENT_CAPABILITIES = {
    support: {
        tools: [
            { name: 'queryConversationHistory', description: 'Search past conversations for context and previous solutions' },
            { name: 'searchFAQ', description: 'Search frequently asked questions and troubleshooting guides' },
        ],
        capabilities: [
            'General product support',
            'FAQ answers',
            'Troubleshooting guidance',
            'Account help',
            'Conversation history lookup',
        ],
    },
    order: {
        tools: [
            { name: 'getOrderDetails', description: 'Fetch full details of an order by order number' },
            { name: 'checkDeliveryStatus', description: 'Check delivery/shipping status and tracking info' },
            { name: 'getUserOrders', description: 'List all orders for a user with optional status filter' },
        ],
        capabilities: [
            'Order status lookup',
            'Delivery tracking',
            'Order modification requests',
            'Cancellation processing',
            'Order history listing',
        ],
    },
    billing: {
        tools: [
            { name: 'getInvoiceDetails', description: 'Fetch invoice details by invoice number' },
            { name: 'checkRefundStatus', description: 'Check the status of refund requests' },
            { name: 'getUserInvoices', description: 'List all invoices for a user with optional status filter' },
        ],
        capabilities: [
            'Invoice lookup',
            'Refund status checking',
            'Payment issue resolution',
            'Billing history',
            'Subscription management guidance',
        ],
    },
} as const;

// Token Limits
export const TOKEN_CONFIG = {
    MAX_CONTEXT_TOKENS: 3000,
    COMPACTION_THRESHOLD: 0.7, // Compact when 70% of max is used
    SUMMARY_MAX_TOKENS: 300,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
    GENERAL: { maxRequests: 100, windowMs: 60_000 },
    CHAT: { maxRequests: 20, windowMs: 60_000 },
} as const;
