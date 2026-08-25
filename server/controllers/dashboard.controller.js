const prisma = require('../config/db');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/dashboard/stats
 * Returns role-appropriate stats for the logged-in user.
 * ADMIN / MANAGER  → full business stats
 * STAFF            → personal stats (their own sales today, products, customers today)
 */
exports.getDashboardStats = async (req, res) => {
  const role = req.user?.role;
  const userId = req.user?.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (role === 'STAFF') {
    // ── Staff: only their own sales today ──────────────────────────────────
    const [todaySalesAgg, todaySalesCount, totalProductsActive, recentMySales] =
      await Promise.all([
        prisma.sale.aggregate({
          where: { status: 'COMPLETED', createdById: userId, createdAt: { gte: today, lt: tomorrow } },
          _sum: { totalAmount: true },
        }),
        prisma.sale.count({
          where: { status: 'COMPLETED', createdById: userId, createdAt: { gte: today, lt: tomorrow } },
        }),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.sale.findMany({
          where: { createdById: userId, status: 'COMPLETED' },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true } },
            saleItems: { select: { productName: true, quantity: true } },
          },
        }),
      ]);

    // Count distinct customers served today
    const customersServedRaw = await prisma.sale.findMany({
      where: { createdById: userId, createdAt: { gte: today, lt: tomorrow }, customerId: { not: null } },
      select: { customerId: true },
      distinct: ['customerId'],
    });

    return sendSuccess(res, {
      role: 'STAFF',
      todaySales: Number(todaySalesAgg._sum.totalAmount) || 0,
      todaySalesCount,
      customersServedToday: customersServedRaw.length,
      totalProducts: totalProductsActive,
      recentSales: recentMySales.map(formatSaleRow),
    });
  }

  // ── Admin / Manager: full business stats ──────────────────────────────────

  // Low-stock: products where quantity <= minStock — use raw SQL for cross-column comparison
  const lowStockResult = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count FROM products WHERE quantity <= "minStock" AND status = 'ACTIVE'
  `;
  const lowStockCount = lowStockResult[0]?.count ?? 0;

  const [
    totalRevenueAgg,
    todaySalesAgg,
    monthlySalesAgg,
    totalSalesCount,
    totalCustomers,
    totalEmployees,
    totalProducts,
    recentSales,
  ] = await Promise.all([
    prisma.sale.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } }),
    prisma.sale.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: firstDayOfMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.sale.count({ where: { status: 'COMPLETED' } }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.employee.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.sale.findMany({
      where: { status: 'COMPLETED' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        saleItems: { select: { productName: true, quantity: true } },
      },
    }),
  ]);

  return sendSuccess(res, {
    role,
    totalRevenue: Number(totalRevenueAgg._sum.totalAmount) || 0,
    todaySales: Number(todaySalesAgg._sum.totalAmount) || 0,
    monthlySales: Number(monthlySalesAgg._sum.totalAmount) || 0,
    totalSalesCount,
    totalCustomers,
    totalEmployees,
    totalProducts,
    lowStockCount: Number(lowStockCount),
    recentSales: recentSales.map(formatSaleRow),
  });
};

/**
 * GET /api/dashboard/charts
 * Returns chart data. Staff only sees their own sales volume.
 * Manager/Admin see full business charts.
 */
exports.getDashboardCharts = async (req, res) => {
  const role = req.user?.role;
  const userId = req.user?.id;

  const isStaff = role === 'STAFF';

  // ── Revenue / Sales by month (last 12 months) ─────────────────────────────
  const revenueByMonth = [];
  const salesByMonth = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const whereClause = {
      status: 'COMPLETED',
      createdAt: { gte: start, lte: end },
      ...(isStaff && { createdById: userId }),
    };

    const monthSales = await prisma.sale.aggregate({
      where: whereClause,
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    revenueByMonth.push({ month: monthStr, revenue: Number(monthSales._sum.totalAmount) || 0 });
    salesByMonth.push({ month: monthStr, count: monthSales._count.id || 0 });
  }

  // Staff don't get top-products / top-customers / category breakdown
  if (isStaff) {
    return sendSuccess(res, { revenueByMonth, salesByMonth, topProducts: [], topCustomers: [], categoryDistribution: [] });
  }

  // ── Top products ──────────────────────────────────────────────────────────
  const topProductsRaw = await prisma.saleItem.groupBy({
    by: ['productId', 'productName'],
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  const topProducts = topProductsRaw.map((p) => ({
    name: p.productName,
    totalSold: p._sum.quantity || 0,
    revenue: Number(p._sum.total) || 0,
  }));

  // ── Top customers ─────────────────────────────────────────────────────────
  const topCustomersRaw = await prisma.sale.groupBy({
    by: ['customerId'],
    where: { status: 'COMPLETED', customerId: { not: null } },
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: 5,
  });

  const topCustomers = await Promise.all(
    topCustomersRaw.map(async (c) => {
      const cust = await prisma.customer.findUnique({
        where: { id: c.customerId },
        select: { name: true },
      });
      return {
        name: cust?.name || 'Walk-in',
        totalSpent: Number(c._sum.totalAmount) || 0,
        orderCount: c._count.id,
      };
    })
  );

  // ── Category distribution ─────────────────────────────────────────────────
  const categoriesRaw = await prisma.category.findMany({
    include: {
      products: {
        include: {
          saleItems: { select: { total: true } },
        },
      },
    },
  });

  const categoryDistribution = categoriesRaw
    .map((cat) => {
      let revenue = 0;
      cat.products.forEach((p) => {
        p.saleItems.forEach((si) => { revenue += Number(si.total); });
      });
      return { name: cat.name, productCount: cat.products.length, revenue };
    })
    .filter((c) => c.productCount > 0);

  return sendSuccess(res, {
    revenueByMonth,
    salesByMonth,
    topProducts,
    topCustomers,
    categoryDistribution,
  });
};

// ── Helper ────────────────────────────────────────────────────────────────────
function formatSaleRow(sale) {
  return {
    id: sale.invoiceNumber,
    customer: sale.customer?.name || 'Walk-in',
    amount: Number(sale.totalAmount),
    status: sale.status,
    date: sale.createdAt,
  };
}
