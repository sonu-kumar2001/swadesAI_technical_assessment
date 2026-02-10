import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.refund.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // ========================
    // Users
    // ========================
    const users = await Promise.all([
        prisma.user.create({
            data: { id: 'user-001', email: 'alice@example.com', name: 'Alice Johnson' },
        }),
        prisma.user.create({
            data: { id: 'user-002', email: 'bob@example.com', name: 'Bob Smith' },
        }),
        prisma.user.create({
            data: { id: 'user-003', email: 'carol@example.com', name: 'Carol Davis' },
        }),
    ]);
    console.log(`  ✓ Created ${users.length} users`);

    // ========================
    // Products
    // ========================
    const products = await Promise.all([
        prisma.product.create({
            data: { id: 'prod-001', name: 'Wireless Headphones Pro', description: 'Premium noise-cancelling wireless headphones with 40hr battery life', price: 199.99, category: 'Electronics' },
        }),
        prisma.product.create({
            data: { id: 'prod-002', name: 'Mechanical Keyboard RGB', description: 'Full-size mechanical keyboard with customizable RGB backlighting', price: 149.99, category: 'Electronics' },
        }),
        prisma.product.create({
            data: { id: 'prod-003', name: 'Ultrawide Monitor 34"', description: '34-inch curved ultrawide monitor, 3440x1440 resolution', price: 549.99, category: 'Electronics' },
        }),
        prisma.product.create({
            data: { id: 'prod-004', name: 'Ergonomic Office Chair', description: 'Adjustable lumbar support, breathable mesh, 5-year warranty', price: 399.99, category: 'Furniture' },
        }),
        prisma.product.create({
            data: { id: 'prod-005', name: 'Standing Desk Converter', description: 'Height-adjustable desk converter, fits on existing desk', price: 279.99, category: 'Furniture' },
        }),
        prisma.product.create({
            data: { id: 'prod-006', name: 'Cotton T-Shirt Pack (3)', description: 'Premium cotton crew neck t-shirts, assorted colors', price: 49.99, category: 'Clothing' },
        }),
        prisma.product.create({
            data: { id: 'prod-007', name: 'Running Shoes Elite', description: 'Lightweight performance running shoes with carbon plate', price: 179.99, category: 'Clothing' },
        }),
        prisma.product.create({
            data: { id: 'prod-008', name: 'Smart Home Hub', description: 'Central smart home controller, compatible with all major ecosystems', price: 129.99, category: 'Home' },
        }),
    ]);
    console.log(`  ✓ Created ${products.length} products`);

    // ========================
    // Orders
    // ========================
    const orders = await Promise.all([
        // Alice's orders
        prisma.order.create({
            data: {
                id: 'order-001', userId: 'user-001', orderNumber: 'ORD-001',
                status: 'delivered', totalAmount: 349.98, shippingAddress: '123 Main St, Springfield, IL 62701',
                trackingNumber: 'TRK-1001-ABCD', estimatedDelivery: new Date('2025-01-10'),
                items: {
                    create: [
                        { productId: 'prod-001', quantity: 1, unitPrice: 199.99 },
                        { productId: 'prod-002', quantity: 1, unitPrice: 149.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-002', userId: 'user-001', orderNumber: 'ORD-002',
                status: 'shipped', totalAmount: 549.99, shippingAddress: '123 Main St, Springfield, IL 62701',
                trackingNumber: 'TRK-1002-EFGH', estimatedDelivery: new Date('2025-02-15'),
                items: {
                    create: [
                        { productId: 'prod-003', quantity: 1, unitPrice: 549.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-003', userId: 'user-001', orderNumber: 'ORD-003',
                status: 'processing', totalAmount: 229.98, shippingAddress: '123 Main St, Springfield, IL 62701',
                items: {
                    create: [
                        { productId: 'prod-006', quantity: 1, unitPrice: 49.99 },
                        { productId: 'prod-007', quantity: 1, unitPrice: 179.99 },
                    ]
                },
            },
        }),
        // Bob's orders
        prisma.order.create({
            data: {
                id: 'order-004', userId: 'user-002', orderNumber: 'ORD-004',
                status: 'delivered', totalAmount: 399.99, shippingAddress: '456 Oak Ave, Portland, OR 97201',
                trackingNumber: 'TRK-1004-IJKL', estimatedDelivery: new Date('2025-01-05'),
                items: {
                    create: [
                        { productId: 'prod-004', quantity: 1, unitPrice: 399.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-005', userId: 'user-002', orderNumber: 'ORD-005',
                status: 'cancelled', totalAmount: 279.99, shippingAddress: '456 Oak Ave, Portland, OR 97201',
                items: {
                    create: [
                        { productId: 'prod-005', quantity: 1, unitPrice: 279.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-006', userId: 'user-002', orderNumber: 'ORD-006',
                status: 'pending', totalAmount: 329.98, shippingAddress: '456 Oak Ave, Portland, OR 97201',
                items: {
                    create: [
                        { productId: 'prod-001', quantity: 1, unitPrice: 199.99 },
                        { productId: 'prod-008', quantity: 1, unitPrice: 129.99 },
                    ]
                },
            },
        }),
        // Carol's orders
        prisma.order.create({
            data: {
                id: 'order-007', userId: 'user-003', orderNumber: 'ORD-007',
                status: 'shipped', totalAmount: 179.99, shippingAddress: '789 Pine Rd, Austin, TX 78701',
                trackingNumber: 'TRK-1007-MNOP', estimatedDelivery: new Date('2025-02-20'),
                items: {
                    create: [
                        { productId: 'prod-007', quantity: 1, unitPrice: 179.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-008', userId: 'user-003', orderNumber: 'ORD-008',
                status: 'confirmed', totalAmount: 679.98, shippingAddress: '789 Pine Rd, Austin, TX 78701',
                items: {
                    create: [
                        { productId: 'prod-003', quantity: 1, unitPrice: 549.99 },
                        { productId: 'prod-008', quantity: 1, unitPrice: 129.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-009', userId: 'user-003', orderNumber: 'ORD-009',
                status: 'delivered', totalAmount: 149.99, shippingAddress: '789 Pine Rd, Austin, TX 78701',
                trackingNumber: 'TRK-1009-QRST', estimatedDelivery: new Date('2024-12-20'),
                items: {
                    create: [
                        { productId: 'prod-002', quantity: 1, unitPrice: 149.99 },
                    ]
                },
            },
        }),
        prisma.order.create({
            data: {
                id: 'order-010', userId: 'user-001', orderNumber: 'ORD-010',
                status: 'pending', totalAmount: 129.99, shippingAddress: '123 Main St, Springfield, IL 62701',
                items: {
                    create: [
                        { productId: 'prod-008', quantity: 1, unitPrice: 129.99 },
                    ]
                },
            },
        }),
    ]);
    console.log(`  ✓ Created ${orders.length} orders with items`);

    // ========================
    // Invoices
    // ========================
    const invoices = await Promise.all([
        prisma.invoice.create({ data: { id: 'inv-001', orderId: 'order-001', userId: 'user-001', invoiceNumber: 'INV-001', amount: 349.98, status: 'paid', dueDate: new Date('2025-01-15'), paidAt: new Date('2025-01-08') } }),
        prisma.invoice.create({ data: { id: 'inv-002', orderId: 'order-002', userId: 'user-001', invoiceNumber: 'INV-002', amount: 549.99, status: 'pending', dueDate: new Date('2025-02-20') } }),
        prisma.invoice.create({ data: { id: 'inv-003', orderId: 'order-003', userId: 'user-001', invoiceNumber: 'INV-003', amount: 229.98, status: 'pending', dueDate: new Date('2025-02-25') } }),
        prisma.invoice.create({ data: { id: 'inv-004', orderId: 'order-004', userId: 'user-002', invoiceNumber: 'INV-004', amount: 399.99, status: 'paid', dueDate: new Date('2025-01-10'), paidAt: new Date('2025-01-03') } }),
        prisma.invoice.create({ data: { id: 'inv-005', orderId: 'order-005', userId: 'user-002', invoiceNumber: 'INV-005', amount: 279.99, status: 'cancelled', dueDate: new Date('2025-01-20') } }),
        prisma.invoice.create({ data: { id: 'inv-006', orderId: 'order-007', userId: 'user-003', invoiceNumber: 'INV-006', amount: 179.99, status: 'pending', dueDate: new Date('2025-02-25') } }),
        prisma.invoice.create({ data: { id: 'inv-007', orderId: 'order-008', userId: 'user-003', invoiceNumber: 'INV-007', amount: 679.98, status: 'overdue', dueDate: new Date('2025-01-30') } }),
        prisma.invoice.create({ data: { id: 'inv-008', orderId: 'order-009', userId: 'user-003', invoiceNumber: 'INV-008', amount: 149.99, status: 'paid', dueDate: new Date('2024-12-25'), paidAt: new Date('2024-12-22') } }),
    ]);
    console.log(`  ✓ Created ${invoices.length} invoices`);

    // ========================
    // Refunds
    // ========================
    const refunds = await Promise.all([
        prisma.refund.create({ data: { id: 'ref-001', orderId: 'order-005', userId: 'user-002', amount: 279.99, status: 'completed', reason: 'Order cancelled by customer - changed mind', requestedAt: new Date('2025-01-12'), processedAt: new Date('2025-01-15') } }),
        prisma.refund.create({ data: { id: 'ref-002', orderId: 'order-001', userId: 'user-001', amount: 199.99, status: 'processing', reason: 'Headphones defective - left ear not working', requestedAt: new Date('2025-01-20') } }),
        prisma.refund.create({ data: { id: 'ref-003', orderId: 'order-004', userId: 'user-002', amount: 399.99, status: 'requested', reason: 'Chair armrest broken on arrival', requestedAt: new Date('2025-02-01') } }),
        prisma.refund.create({ data: { id: 'ref-004', orderId: 'order-009', userId: 'user-003', amount: 149.99, status: 'rejected', reason: 'Keyboard not as described', requestedAt: new Date('2025-01-25'), processedAt: new Date('2025-01-28') } }),
    ]);
    console.log(`  ✓ Created ${refunds.length} refunds`);

    // ========================
    // Sample Conversations
    // ========================
    const conversations = await Promise.all([
        prisma.conversation.create({
            data: {
                id: 'conv-001', userId: 'user-001', title: 'Order status inquiry', lastAgentType: 'order',
                messages: {
                    create: [
                        { role: 'user', content: 'Hi, I want to check my order ORD-002 status', createdAt: new Date('2025-02-01T10:00:00Z') },
                        { role: 'assistant', content: 'I found your order ORD-002. It is currently shipped and being delivered to 123 Main St, Springfield. Your tracking number is TRK-1002-EFGH and estimated delivery is February 15, 2025.', agentType: 'order', createdAt: new Date('2025-02-01T10:00:05Z') },
                    ]
                },
            },
        }),
        prisma.conversation.create({
            data: {
                id: 'conv-002', userId: 'user-002', title: 'Refund request', lastAgentType: 'billing',
                messages: {
                    create: [
                        { role: 'user', content: 'I need a refund for my chair order. The armrest was broken.', createdAt: new Date('2025-02-01T14:00:00Z') },
                        { role: 'assistant', content: 'I\'m sorry to hear about the damaged chair. I can see your order ORD-004 for the Ergonomic Office Chair. I\'ve initiated a refund request for $399.99. The refund is currently being reviewed and you should hear back within 3-5 business days.', agentType: 'billing', createdAt: new Date('2025-02-01T14:00:08Z') },
                    ]
                },
            },
        }),
        prisma.conversation.create({
            data: {
                id: 'conv-003', userId: 'user-003', title: 'Product inquiry', lastAgentType: 'support',
                messages: {
                    create: [
                        { role: 'user', content: 'How do I set up my new smart home hub?', createdAt: new Date('2025-02-02T09:00:00Z') },
                        { role: 'assistant', content: 'Great question! To set up your Smart Home Hub, follow these steps:\n1. Plug in the hub and wait for the LED to turn blue\n2. Download our companion app from AppStore or Google Play\n3. Create an account or sign in\n4. Tap "Add New Device" and select "Smart Home Hub"\n5. Follow the on-screen pairing instructions\n\nIf you run into any issues, feel free to ask!', agentType: 'support', createdAt: new Date('2025-02-02T09:00:10Z') },
                    ]
                },
            },
        }),
    ]);
    console.log(`  ✓ Created ${conversations.length} conversations with messages`);

    console.log('\n✅ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
