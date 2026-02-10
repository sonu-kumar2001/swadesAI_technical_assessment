import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Billing Agent Tools
 * - getInvoiceDetails: fetch invoice details by invoice number
 * - checkRefundStatus: check refund status for an order or user
 * - getUserInvoices: list all invoices for a user
 */

export const getInvoiceDetails = tool({
    description:
        'Fetch detailed invoice information by invoice number, including the associated order and items. Use when a customer asks about a specific invoice or payment.',
    parameters: z.object({
        invoiceNumber: z
            .string()
            .describe('The invoice number (e.g., INV-001) to look up'),
    }),
    execute: async ({ invoiceNumber }) => {
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { invoiceNumber },
                include: {
                    order: {
                        include: {
                            items: {
                                include: {
                                    product: { select: { name: true, category: true } },
                                },
                            },
                        },
                    },
                    user: { select: { name: true, email: true } },
                },
            });

            if (!invoice) {
                return {
                    error: `Invoice "${invoiceNumber}" not found. Please check the invoice number and try again.`,
                    data: null,
                };
            }

            return { error: null, data: invoice };
        } catch (error) {
            console.error('[Tool:getInvoiceDetails]', error);
            return { error: 'Failed to fetch invoice details.', data: null };
        }
    },
});

export const checkRefundStatus = tool({
    description:
        'Check the status of refund requests. Can search by order ID or user ID. Use when a customer asks about their refund status.',
    parameters: z.object({
        orderId: z
            .string()
            .optional()
            .describe('Order ID to check refunds for a specific order'),
        userId: z
            .string()
            .optional()
            .describe('User ID to list all refunds for a user'),
    }),
    execute: async ({ orderId, userId }) => {
        try {
            if (!orderId && !userId) {
                return { error: 'Please provide either an order ID or user ID to check refunds.', data: null };
            }

            const refunds = await prisma.refund.findMany({
                where: {
                    ...(orderId && { orderId }),
                    ...(userId && { userId }),
                },
                include: {
                    order: {
                        select: { orderNumber: true, totalAmount: true, status: true },
                    },
                },
                orderBy: { requestedAt: 'desc' },
            });

            if (refunds.length === 0) {
                return {
                    error: null,
                    data: [],
                    message: 'No refund requests found.',
                };
            }

            // Add human-readable status messages
            const refundsWithMessages = refunds.map((r) => {
                const statusMessages: Record<string, string> = {
                    requested: 'Your refund request has been received and is awaiting review.',
                    processing: 'Your refund is being processed. This typically takes 3-5 business days.',
                    approved: 'Your refund has been approved and will be credited to your account shortly.',
                    rejected: 'Your refund request was not approved. Please contact support for more details.',
                    completed: 'Your refund has been completed and the amount has been credited to your account.',
                };
                return {
                    ...r,
                    statusMessage: statusMessages[r.status] || 'Unknown status.',
                };
            });

            return { error: null, data: refundsWithMessages };
        } catch (error) {
            console.error('[Tool:checkRefundStatus]', error);
            return { error: 'Failed to check refund status.', data: null };
        }
    },
});

export const getUserInvoices = tool({
    description:
        'List all invoices for a specific user, optionally filtered by payment status. Use when a customer wants to see their billing history.',
    parameters: z.object({
        userId: z.string().describe('The user ID to list invoices for'),
        status: z
            .enum(['pending', 'paid', 'overdue', 'cancelled'])
            .optional()
            .describe('Optional filter by invoice status'),
    }),
    execute: async ({ userId, status }) => {
        try {
            const invoices = await prisma.invoice.findMany({
                where: {
                    userId,
                    ...(status && { status }),
                },
                include: {
                    order: {
                        select: { orderNumber: true, status: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });

            if (invoices.length === 0) {
                return {
                    error: null,
                    data: [],
                    message: status
                        ? `No ${status} invoices found for this user.`
                        : 'No invoices found for this user.',
                };
            }

            return { error: null, data: invoices };
        } catch (error) {
            console.error('[Tool:getUserInvoices]', error);
            return { error: 'Failed to fetch invoices.', data: null };
        }
    },
});

export const billingTools = {
    getInvoiceDetails,
    checkRefundStatus,
    getUserInvoices,
};
