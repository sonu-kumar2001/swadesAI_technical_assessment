import { streamText, type CoreMessage } from 'ai';
import { DEFAULT_MODEL } from '../lib/ai.js';
import { billingTools } from '../tools/billing.tools.js';

const BILLING_SYSTEM_PROMPT = `You are a specialized billing and payments agent for customer support.

Your capabilities:
- Look up invoice details by invoice number (e.g., INV-001)
- Check refund status for specific orders or list all refunds for a user
- List all invoices for a user with optional status filtering (pending, paid, overdue, cancelled)

Guidelines:
- Handle payment inquiries with sensitivity and accuracy
- Always verify invoice or order numbers before providing billing information
- For refund inquiries, provide clear status updates with expected timelines
- If a refund is rejected, explain this empathetically and suggest next steps
- For overdue invoices, notify the user and provide payment guidance
- Keep financial information accurate — do not make up amounts
- If the user needs to take action (e.g., pay an overdue invoice), clearly explain what they need to do
- Format financial data clearly, using currency formatting ($X.XX)
- For complex billing disputes, acknowledge the issue and explain the resolution process`;

/**
 * Billing Agent
 * Handles invoices, refunds, and payment-related queries.
 */
export function createBillingStream(
    messages: CoreMessage[],
    userId: string
) {
    const systemWithContext = `${BILLING_SYSTEM_PROMPT}\n\nCurrent user ID: ${userId}`;

    return streamText({
        model: DEFAULT_MODEL,
        system: systemWithContext,
        messages,
        tools: billingTools,
        maxSteps: 5,
    });
}
