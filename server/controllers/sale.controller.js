const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

exports.getSales = async (req, res) => {
    const { page, limit, status, paymentStatus, paymentMethod, customerId, startDate, endDate, search } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (customerId) where.customerId = customerId;
    if (search) where.invoiceNumber = { contains: search, mode: 'insensitive' };
    if (startDate && endDate) {
        where.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }

    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where,
            include: {
                customer: { select: { name: true } },
                createdBy: { select: { firstName: true, lastName: true } }
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.sale.count({ where })
    ]);

    sendPaginated(res, sales, buildPaginationMeta(total, page, limit));
};

exports.getSaleById = async (req, res) => {
    const sale = await prisma.sale.findUnique({
        where: { id: req.params.id },
        include: {
            saleItems: {
                include: { product: { select: { name: true, sku: true } } }
            },
            customer: true,
            createdBy: { select: { firstName: true, lastName: true } },
            payments: true
        }
    });

    if (!sale) return sendError(res, 'Sale not found', 404);
    sendSuccess(res, sale);
};

exports.createSale = async (req, res) => {
    const { items, customerId, discount = 0, discountAmount = 0, taxRate = 0, paymentMethod, notes, reference, amountPaid } = req.body;
    const finalDiscount = discountAmount || discount || 0;
    
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Generate invoice number with random suffix to prevent transaction race conditions
            const lastSale = await tx.sale.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            let lastNum = 0;
            if (lastSale && lastSale.invoiceNumber) {
                const parts = lastSale.invoiceNumber.split('-');
                if (parts.length >= 3) {
                    lastNum = parseInt(parts[2], 10) || 0;
                }
            }
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const invoiceNumber = `INV-${new Date().getFullYear()}-${String(lastNum + 1).padStart(4, '0')}-${randomSuffix}`;

            let subtotal = 0;
            const saleItemsData = [];
            const productSnapshots = [];

            // 2. Pre-verify all items and calculate totals
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error(`Product not found (ID: ${item.productId})`);
                if (product.status !== 'ACTIVE') throw new Error(`Product "${product.name}" is not active.`);
                if (product.quantity < item.quantity) {
                    throw new Error(`Only ${product.quantity} units of "${product.name}" are available.`);
                }

                const itemUnitPrice = Number(item.unitPrice || product.sellingPrice);
                const itemDiscount = Number(item.discount || 0);
                const itemTotal = (itemUnitPrice * item.quantity) - itemDiscount;
                subtotal += itemTotal;

                saleItemsData.push({
                    productId: product.id,
                    productName: product.name,
                    quantity: item.quantity,
                    unitPrice: itemUnitPrice,
                    discount: itemDiscount,
                    total: itemTotal
                });

                productSnapshots.push({ product, quantitySold: item.quantity });
            }

            // 3. Totals calculation
            const taxAmount = subtotal * (Number(taxRate) / 100);
            const totalAmount = Math.max(0, subtotal + taxAmount - Number(finalDiscount));
            
            let paymentStatus = 'PENDING';
            const paid = amountPaid !== undefined ? Number(amountPaid) : totalAmount;
            if (paid >= totalAmount) paymentStatus = 'PAID';
            else if (paid > 0) paymentStatus = 'PARTIAL';

            // 4. Create Sale with relations
            const sale = await tx.sale.create({
                data: {
                    invoiceNumber,
                    customerId: customerId || null,
                    createdById: req.user.id,
                    subtotal,
                    taxRate: Number(taxRate),
                    taxAmount,
                    discountAmount: Number(finalDiscount),
                    totalAmount,
                    paymentMethod: paymentMethod || 'CASH',
                    paymentStatus,
                    status: 'COMPLETED',
                    notes: notes || null,
                    saleItems: {
                        create: saleItemsData
                    }
                },
                include: {
                    saleItems: true,
                    customer: true,
                    createdBy: { select: { firstName: true, lastName: true, email: true } }
                }
            });

            // 5. Create Payment record if paid > 0 (using valid Prisma Payment schema fields)
            if (paid > 0) {
                await tx.payment.create({
                    data: {
                        saleId: sale.id,
                        amount: paid,
                        method: paymentMethod || 'CASH',
                        reference: reference || invoiceNumber,
                        notes: notes || null
                    }
                });
            }

            // 6. Decrement stock, create StockMovement history, and prepare low stock alerts
            const admins = await tx.user.findMany({ where: { role: 'ADMIN', isActive: true } });
            const notifications = [];

            for (const { product, quantitySold } of productSnapshots) {
                const updatedProduct = await tx.product.update({
                    where: { id: product.id },
                    data: { quantity: { decrement: quantitySold } }
                });

                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        quantity: quantitySold,
                        previousQty: product.quantity,
                        newQty: updatedProduct.quantity,
                        type: 'SALE',
                        reason: `Sale ${invoiceNumber}`,
                        reference: invoiceNumber,
                        createdById: req.user.id
                    }
                });

                if (updatedProduct.quantity <= updatedProduct.minStock) {
                    admins.forEach(admin => {
                        notifications.push({
                            userId: admin.id,
                            type: 'LOW_STOCK',
                            title: 'Low Stock Alert',
                            message: `Product "${updatedProduct.name}" is low on stock (${updatedProduct.quantity} remaining).`,
                            data: { productId: product.id }
                        });
                    });
                }
            }

            // 7. Create NEW_SALE notification
            admins.forEach(admin => {
                notifications.push({
                    userId: admin.id,
                    type: 'NEW_SALE',
                    title: 'New Sale Created',
                    message: `Sale ${invoiceNumber} created for $${totalAmount.toFixed(2)}.`,
                    data: { saleId: sale.id }
                });
            });

            if (notifications.length > 0) {
                await tx.notification.createMany({ data: notifications });
            }

            // Return full sale details with payments
            return await tx.sale.findUnique({
                where: { id: sale.id },
                include: {
                    saleItems: true,
                    customer: true,
                    createdBy: { select: { firstName: true, lastName: true, email: true } },
                    payments: true
                }
            });
        });

        sendSuccess(res, result, 'Sale created successfully', 201);
    } catch (err) {
        sendError(res, err.message, 400);
    }
};
