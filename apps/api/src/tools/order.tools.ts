import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Order Agent Tools
 * - getOrderDetails: fetch full order details by order number
 * - checkDeliveryStatus: check delivery/shipping status
 * - getUserOrders: list all orders for a user
 */

export const getOrderDetails = tool({
    description:
        'Fetch full details of an order by its order number, including items purchased, current status, shipping info, and associated invoice/refunds. Use when a customer asks about a specific order.',
    parameters: z.object({
        orderNumber: z
            .string()
            .describe('The order number (e.g., ORD-001) to look up'),
    }),
    execute: async ({ orderNumber }) => {
        try {
            const order = await prisma.order.findUnique({
                where: { orderNumber },
                include: {
                    items: {
                        include: {
                            product: {
                                select: { name: true, category: true },
                            },
                        },
                    },
                    invoice: {
                        select: { invoiceNumber: true, amount: true, status: true, dueDate: true, paidAt: true },
                    },
                    refunds: {
                        select: { id: true, amount: true, status: true, reason: true, requestedAt: true, processedAt: true },
                    },
                    user: {
                        select: { name: true, email: true },
                    },
                },
            });

            if (!order) {
                return {
                    error: `Order "${orderNumber}" not found. Please check the order number and try again.`,
                    data: null,
                };
            }

            return { error: null, data: order };
        } catch (error) {
            console.error('[Tool:getOrderDetails]', error);
            return { error: 'Failed to fetch order details. Please try again.', data: null };
        }
    },
});

export const checkDeliveryStatus = tool({
    description:
        'Check the delivery and shipping status of an order, including tracking number and estimated delivery date. Use when a customer asks about delivery or tracking.',
    parameters: z.object({
        orderNumber: z
            .string()
            .describe('The order number to check delivery status for'),
    }),
    execute: async ({ orderNumber }) => {
        try {
            const order = await prisma.order.findUnique({
                where: { orderNumber },
                select: {
                    orderNumber: true,
                    status: true,
                    trackingNumber: true,
                    estimatedDelivery: true,
                    shippingAddress: true,
                    updatedAt: true,
                },
            });

            if (!order) {
                return {
                    error: `Order "${orderNumber}" not found.`,
                    data: null,
                };
            }

            // Add human-readable status message
            const statusMessages: Record<string, string> = {
                pending: 'Your order is pending and has not been processed yet.',
                confirmed: 'Your order has been confirmed and is being prepared.',
                processing: 'Your order is being prepared for shipment.',
                shipped: `Your order has been shipped! Tracking number: ${order.trackingNumber || 'Not available yet'}.`,
                delivered: 'Your order has been delivered.',
                cancelled: 'This order has been cancelled.',
            };

            return {
                error: null,
                data: {
                    ...order,
                    statusMessage: statusMessages[order.status] || 'Status unknown.',
                },
            };
        } catch (error) {
            console.error('[Tool:checkDeliveryStatus]', error);
            return { error: 'Failed to check delivery status.', data: null };
        }
    },
});

export const getUserOrders = tool({
    description:
        'List all orders for a specific user, optionally filtered by order status. Use when a customer wants to see their order history or find a specific order.',
    parameters: z.object({
        userId: z.string().describe('The user ID to list orders for'),
        status: z
            .enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
            .optional()
            .describe('Optional filter by order status'),
    }),
    execute: async ({ userId, status }) => {
        try {
            const orders = await prisma.order.findMany({
                where: {
                    userId,
                    ...(status && { status }),
                },
                include: {
                    items: {
                        include: {
                            product: { select: { name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            if (orders.length === 0) {
                return {
                    error: null,
                    data: [],
                    message: status
                        ? `No ${status} orders found for this user.`
                        : 'No orders found for this user.',
                };
            }

            return { error: null, data: orders };
        } catch (error) {
            console.error('[Tool:getUserOrders]', error);
            return { error: 'Failed to fetch user orders.', data: null };
        }
    },
});

export const orderTools = {
    getOrderDetails,
    checkDeliveryStatus,
    getUserOrders,
};
