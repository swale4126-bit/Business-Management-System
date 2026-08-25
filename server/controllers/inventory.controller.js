const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

exports.getInventory = async (req, res) => {
    const { page, limit, search } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                sku: true,
                quantity: true,
                minStock: true,
                status: true,
                category: { select: { name: true } }
            },
            skip,
            take,
            orderBy: { quantity: 'asc' }
        }),
        prisma.product.count({ where })
    ]);

    sendPaginated(res, products, buildPaginationMeta(total, page, limit));
};

exports.getLowStockProducts = async (req, res) => {
    // Use a raw query to compare quantity against minStock (field-level comparison not supported in Prisma findMany)
    const products = await prisma.$queryRaw`
        SELECT p.*, c.name as "categoryName", s.name as "supplierName"
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        LEFT JOIN suppliers s ON p."supplierId" = s.id
        WHERE p.quantity <= p."minStock"
        ORDER BY p.quantity ASC
    `;

    sendSuccess(res, products);
};

exports.getStockHistory = async (req, res) => {
    const { page, limit, productId, type, startDate, endDate } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const where = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (startDate && endDate) {
        where.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate)
        };
    }

    const [history, total] = await Promise.all([
        prisma.stockMovement.findMany({
            where,
            include: {
                product: { select: { name: true, sku: true } },
                supplier: { select: { name: true } }
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.stockMovement.count({ where })
    ]);

    sendPaginated(res, history, buildPaginationMeta(total, page, limit));
};

async function handleStockMovement(productId, quantity, type, notes, userId, reference) {
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) throw new Error('Product not found');

        let newQuantity = product.quantity;
        if (type === 'IN') newQuantity += quantity;
        else if (type === 'OUT') {
            if (product.quantity < quantity) throw new Error('Insufficient stock');
            newQuantity -= quantity;
        } else if (type === 'ADJUSTMENT') {
            newQuantity = quantity;
        }

        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: { quantity: newQuantity }
        });

        const movement = await tx.stockMovement.create({
            data: {
                productId,
                quantity: type === 'ADJUSTMENT' ? Math.abs(newQuantity - product.quantity) : quantity,
                previousQty: product.quantity,
                newQty: newQuantity,
                type,
                reason: notes,
                reference,
            }
        });

        if (updatedProduct.quantity <= updatedProduct.minStock) {
            const admins = await tx.user.findMany({ where: { role: 'ADMIN' } });
            if (admins.length > 0) {
                await tx.notification.createMany({
                    data: admins.map(admin => ({
                        userId: admin.id,
                        type: 'LOW_STOCK',
                        title: 'Low Stock Alert',
                        message: `Product ${product.name} is low on stock (${updatedProduct.quantity} remaining).`
                    }))
                });
            }
        }

        return { product: updatedProduct, movement };
    });
}

exports.stockIn = async (req, res) => {
    const { productId, quantity, reason, reference } = req.body;
    try {
        const result = await handleStockMovement(productId, quantity, 'IN', reason, req.user.id, reference);
        sendSuccess(res, result, 'Stock added successfully');
    } catch (err) {
        sendError(res, err.message, 400);
    }
};

exports.stockOut = async (req, res) => {
    const { productId, quantity, reason, reference } = req.body;
    try {
        const result = await handleStockMovement(productId, quantity, 'OUT', reason, req.user.id, reference);
        sendSuccess(res, result, 'Stock removed successfully');
    } catch (err) {
        sendError(res, err.message, 400);
    }
};

exports.adjustStock = async (req, res) => {
    const { productId, newQuantity, reason } = req.body;
    try {
        const result = await handleStockMovement(productId, newQuantity, 'ADJUSTMENT', reason || 'Manual Adjustment', req.user.id, null);
        sendSuccess(res, result, 'Stock adjusted successfully');
    } catch (err) {
        sendError(res, err.message, 400);
    }
};
