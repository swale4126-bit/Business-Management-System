const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

exports.getProducts = async (req, res) => {
    const { page, limit, search, categoryId, supplierId, status, sort } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    let orderBy = { createdAt: 'desc' };
    if (sort) {
        const [field, order] = sort.split(':');
        if (['name', 'sellingPrice', 'quantity', 'createdAt'].includes(field)) {
            orderBy = { [field]: order === 'desc' ? 'desc' : 'asc' };
        }
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                category: { select: { name: true } },
                supplier: { select: { name: true } }
            }
        }),
        prisma.product.count({ where })
    ]);

    sendPaginated(res, products, buildPaginationMeta(total, page, limit));
};

exports.getProductById = async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: {
            category: { select: { name: true } },
            supplier: { select: { name: true } }
        }
    });

    if (!product) return sendError(res, 'Product not found', 404);
    sendSuccess(res, product);
};

exports.createProduct = async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
        data.image = `/uploads/products/${req.file.filename}`;
    }

    // Convert string numbers from multipart form-data to correct types
    if (data.sellingPrice !== undefined) data.sellingPrice = parseFloat(data.sellingPrice);
    if (data.buyingPrice !== undefined)  data.buyingPrice  = parseFloat(data.buyingPrice);
    if (data.quantity    !== undefined)  data.quantity     = parseInt(data.quantity, 10);
    if (data.minStock    !== undefined)  data.minStock     = parseInt(data.minStock, 10);

    const product = await prisma.product.create({ data });
    sendSuccess(res, product, 'Product created successfully', 201);
};

exports.updateProduct = async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
        data.image = `/uploads/products/${req.file.filename}`;
    }

    // Convert string numbers from multipart form-data to correct types
    if (data.sellingPrice !== undefined) data.sellingPrice = parseFloat(data.sellingPrice);
    if (data.buyingPrice  !== undefined) data.buyingPrice  = parseFloat(data.buyingPrice);
    if (data.quantity     !== undefined) data.quantity     = parseInt(data.quantity, 10);
    if (data.minStock     !== undefined) data.minStock     = parseInt(data.minStock, 10);

    const product = await prisma.product.update({
        where: { id: req.params.id },
        data
    });
    sendSuccess(res, product, 'Product updated successfully');
};

exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;
    
    const saleItemsCount = await prisma.saleItem.count({ where: { productId } });
    if (saleItemsCount > 0) {
        const product = await prisma.product.update({
            where: { id: productId },
            data: { status: 'DISCONTINUED' }
        });
        return sendSuccess(res, product, 'Product discontinued due to existing sales records');
    }

    await prisma.product.delete({ where: { id: productId } });
    sendSuccess(res, null, 'Product deleted successfully');
};
