const prisma = require('../config/db');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { getPaginationParams, buildPaginationMeta } = require('../utils/pagination');

/**
 * GET /api/reports/sales
 */
exports.getSalesReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const where = { status: 'COMPLETED' };

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    };
  }

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true } },
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  const data = sales.map((s) => ({
    invoiceNumber: s.invoiceNumber,
    date: new Date(s.createdAt).toLocaleDateString(),
    customer: s.customer?.name || 'Guest',
    processedBy: `${s.createdBy?.firstName || ''} ${s.createdBy?.lastName || ''}`.trim() || 'System',
    paymentMethod: s.paymentMethod,
    subtotal: `$${Number(s.subtotal).toFixed(2)}`,
    tax: `$${Number(s.taxAmount).toFixed(2)}`,
    total: `$${Number(s.totalAmount).toFixed(2)}`,
  }));

  sendSuccess(res, data, 'Sales report generated');
};

/**
 * GET /api/reports/products
 */
exports.getProductReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const where = {};
  if (startDate && endDate) {
    where.sale = {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
      },
    };
  }

  const groupedItems = await prisma.saleItem.groupBy({
    by: ['productId', 'productName'],
    where,
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: 'desc' } },
  });

  const data = groupedItems.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    unitsSold: item._sum.quantity || 0,
    totalRevenue: `$${Number(item._sum.total || 0).toFixed(2)}`,
  }));

  sendSuccess(res, data, 'Products report generated');
};

/**
 * GET /api/reports/customers
 */
exports.getCustomerReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const where = { status: 'COMPLETED', customerId: { not: null } };
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    };
  }

  const grouped = await prisma.sale.groupBy({
    by: ['customerId'],
    where,
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
  });

  const data = await Promise.all(
    grouped.map(async (g) => {
      const cust = await prisma.customer.findUnique({
        where: { id: g.customerId },
        select: { name: true, email: true, phone: true },
      });
      return {
        customerName: cust?.name || 'Unknown',
        email: cust?.email || 'N/A',
        phone: cust?.phone || 'N/A',
        ordersCount: g._count.id,
        totalSpent: `$${Number(g._sum.totalAmount || 0).toFixed(2)}`,
      };
    })
  );

  sendSuccess(res, data, 'Customers report generated');
};

/**
 * GET /api/reports/employees
 */
exports.getEmployeeReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const where = { status: 'COMPLETED' };
  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
    };
  }

  const grouped = await prisma.sale.groupBy({
    by: ['createdById'],
    where,
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
  });

  const data = await Promise.all(
    grouped.map(async (g) => {
      const user = await prisma.user.findUnique({
        where: { id: g.createdById },
        select: { firstName: true, lastName: true, role: true, email: true },
      });
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'System';
      return {
        employeeName: name,
        role: user?.role || 'STAFF',
        salesProcessed: g._count.id,
        totalSalesVolume: `$${Number(g._sum.totalAmount || 0).toFixed(2)}`,
      };
    })
  );

  sendSuccess(res, data, 'Employee sales report generated');
};

/**
 * GET /api/reports/inventory
 */
exports.getInventoryReport = async (req, res) => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      quantity: true,
      minStock: true,
      buyingPrice: true,
      sellingPrice: true,
      category: { select: { name: true } },
    },
    orderBy: { name: 'asc' },
  });

  const data = products.map((p) => {
    const costVal = Number(p.quantity || 0) * Number(p.buyingPrice || 0);
    const retailVal = Number(p.quantity || 0) * Number(p.sellingPrice || 0);
    return {
      sku: p.sku,
      productName: p.name,
      category: p.category?.name || 'Uncategorized',
      quantityInStock: p.quantity,
      status: p.quantity <= 0 ? 'Out of Stock' : p.quantity <= p.minStock ? 'Low Stock' : 'Healthy',
      costValuation: `$${costVal.toFixed(2)}`,
      retailValuation: `$${retailVal.toFixed(2)}`,
    };
  });

  sendSuccess(res, data, 'Inventory valuation report generated');
};
