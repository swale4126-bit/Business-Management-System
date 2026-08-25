const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

exports.getSuppliers = async (req, res) => {
    const { page, limit, search } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.supplier.count({ where })
    ]);

    sendPaginated(res, suppliers, buildPaginationMeta(total, page, limit));
};

exports.getSupplierById = async (req, res) => {
    const supplier = await prisma.supplier.findUnique({
        where: { id: req.params.id },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    if (!supplier) return sendError(res, 'Supplier not found', 404);
    sendSuccess(res, supplier);
};

exports.getSupplierProducts = async (req, res) => {
    const { page, limit } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where: { supplierId: req.params.id },
            skip,
            take,
            orderBy: { name: 'asc' }
        }),
        prisma.product.count({ where: { supplierId: req.params.id } })
    ]);

    sendPaginated(res, products, buildPaginationMeta(total, page, limit));
};

exports.createSupplier = async (req, res) => {
    const supplier = await prisma.supplier.create({
        data: req.body
    });
    sendSuccess(res, supplier, 'Supplier created successfully', 201);
};

exports.updateSupplier = async (req, res) => {
    const supplier = await prisma.supplier.update({
        where: { id: req.params.id },
        data: req.body
    });
    sendSuccess(res, supplier, 'Supplier updated successfully');
};

exports.deleteSupplier = async (req, res) => {
    const supplierId = req.params.id;
    
    const productCount = await prisma.product.count({ where: { supplierId } });
    if (productCount > 0) {
        return sendError(res, 'Cannot delete supplier with associated products', 400);
    }

    await prisma.supplier.delete({ where: { id: supplierId } });
    sendSuccess(res, null, 'Supplier deleted successfully');
};
