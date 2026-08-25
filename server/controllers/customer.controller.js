const prisma = require('../config/db');
const { sendSuccess, sendPaginated, sendError } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

exports.getCustomers = async (req, res) => {
    const { search, isActive } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);
    const take = limit;

    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
        ];
    }
    if (isActive !== undefined) {
        where.isActive = isActive === 'true';
    }

    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count({ where })
    ]);

    sendPaginated(res, customers, buildPaginationMeta(total, page, limit));
};

exports.getCustomerById = async (req, res) => {
    const customer = await prisma.customer.findUnique({
        where: { id: req.params.id },
        include: {
            _count: {
                select: { sales: true }
            }
        }
    });

    if (!customer) return sendError(res, 'Customer not found', 404);

    // Calculate total spent
    const sales = await prisma.sale.aggregate({
        where: { customerId: req.params.id, status: 'COMPLETED' },
        _sum: { totalAmount: true }
    });

    const totalSpent = sales._sum.totalAmount || 0;

    sendSuccess(res, { ...customer, totalSpent });
};

exports.getCustomerPurchases = async (req, res) => {
    const { page, limit } = req.query;
    const { skip, take } = getPaginationParams(page, limit);

    const [sales, total] = await Promise.all([
        prisma.sale.findMany({
            where: { customerId: req.params.id },
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.sale.count({ where: { customerId: req.params.id } })
    ]);

    sendPaginated(res, sales, buildPaginationMeta(total, page, limit));
};

exports.createCustomer = async (req, res) => {
    const customer = await prisma.customer.create({
        data: req.body
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                type: 'NEW_CUSTOMER',
                title: 'New Customer Created',
                message: `Customer ${customer.name} was added to the system.`
            }))
        });
    }

    sendSuccess(res, customer, 'Customer created successfully', 201);
};

exports.updateCustomer = async (req, res) => {
    const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: req.body
    });
    sendSuccess(res, customer, 'Customer updated successfully');
};

exports.deleteCustomer = async (req, res) => {
    const customerId = req.params.id;
    
    const salesCount = await prisma.sale.count({ where: { customerId } });
    
    if (salesCount > 0) {
        const customer = await prisma.customer.update({
            where: { id: customerId },
            data: { isActive: false }
        });
        return sendSuccess(res, customer, 'Customer deactivated due to existing sales records');
    }

    await prisma.customer.delete({ where: { id: customerId } });
    sendSuccess(res, null, 'Customer deleted successfully');
};
