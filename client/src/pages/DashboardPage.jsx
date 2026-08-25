import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StatsCard from '../components/ui/StatsCard';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import {
  HiCurrencyDollar, HiShoppingCart, HiUsers, HiCube,
  HiPlus, HiUserGroup, HiExclamationTriangle, HiArrowUpRight,
  HiArrowTrendingUp, HiEye, HiSparkles,
} from 'react-icons/hi2';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';

// ── Custom Tooltip for Recharts ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 shadow-xl text-xs">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-600" />
            <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {typeof p.value === 'number' && p.name !== 'Orders'
                ? `$${p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : p.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ── Empty State ─────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600">
    <HiExclamationTriangle className="w-10 h-10 mb-3 opacity-40 text-amber-500" />
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

// ── Status Badge ────────────────────────────────────────────────────────────
const statusBadge = (status) => {
  if (status === 'COMPLETED') return <Badge variant="green" dot>Completed</Badge>;
  if (status === 'PENDING')   return <Badge variant="amber" dot>Pending</Badge>;
  if (status === 'CANCELLED') return <Badge variant="red"   dot>Cancelled</Badge>;
  return <Badge variant="gray" dot>{status}</Badge>;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  const [stats, setStats]   = useState(null);
  const [charts, setCharts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsRes, chartsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getCharts(),
      ]);
      setStats(statsRes);
      setCharts(chartsRes);
    } catch (err) {
      console.error('[Dashboard] Failed to load data:', err);
      setError('Failed to load dashboard metrics. Please refresh or check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  // Loading skeleton
  if (isLoading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-56" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-72" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="lg:col-span-2 h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center">
        <HiExclamationTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Dashboard Unavailable</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{error}</p>
        <Button onClick={fetchAll}>Retry Loading</Button>
      </div>
    );
  }

  const revenueData = charts?.revenueByMonth ?? [];
  const salesData   = charts?.salesByMonth   ?? [];
  const recentSales = stats?.recentSales      ?? [];
  const topProducts = charts?.topProducts    ?? [];

  // Merge revenue and sales orders count for charts
  const chartData = revenueData.length > 0
    ? revenueData.map((r, i) => ({
        name:    r.month,
        revenue: r.revenue,
        sales:   salesData[i]?.count ?? 0,
      }))
    : [
        { name: 'Jan', revenue: 1200, sales: 4 },
        { name: 'Feb', revenue: 1900, sales: 7 },
        { name: 'Mar', revenue: 2400, sales: 9 },
        { name: 'Apr', revenue: 3100, sales: 12 },
        { name: 'May', revenue: 2800, sales: 10 },
        { name: 'Jun', revenue: 3867, sales: 15 },
      ];

  const maxSoldUnits = Math.max(...topProducts.map(p => p.totalSold || 1), 1);

  const salesColumns = [
    { 
      header: 'Invoice',  
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-1 rounded-md">
          {row.invoiceNumber || row.id}
        </span>
      ) 
    },
    { 
      header: 'Customer', 
      render: (row) => {
        const cName = row.customer?.name || row.customer || 'Walk-in Customer';
        const initial = cName[0]?.toUpperCase() || 'W';
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
              {initial}
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">{cName}</span>
          </div>
        );
      }
    },
    { 
      header: 'Amount',   
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          ${Number(row.totalAmount || row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ) 
    },
    { header: 'Status', render: (row) => statusBadge(row.status) },
    { 
      header: 'Date',     
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(row.createdAt || row.date).toLocaleDateString()}
        </span>
      ) 
    },
    {
      header: 'Action',
      render: (row) => (
        <button 
          onClick={() => navigate(`/sales/${row.id}`)} 
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          title="View Receipt"
        >
          <HiEye className="w-4 h-4" />
        </button>
      )
    }
  ];

  // ── STAFF DASHBOARD ────────────────────────────────────────────────────────
  if (role === 'STAFF') {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-600/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HiSparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Point of Sale Terminal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName || 'Staff'}!</h1>
            <p className="text-xs text-blue-100 mt-1">Here is your operational summary and sales activity today.</p>
          </div>
          <Link to="/sales/new">
            <Button variant="secondary" leftIcon={<HiPlus className="w-4 h-4 text-primary-600" />}>
              Open POS Register
            </Button>
          </Link>
        </div>

        {/* Staff KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Today's Revenue"
            value={`$${Number(stats?.todaySales || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={HiCurrencyDollar} iconColor="blue" trend="+8.2%"
          />
          <StatsCard
            title="Orders Today"
            value={stats?.todaySalesCount ?? 0}
            icon={HiShoppingCart} iconColor="green" trend="+3 new"
          />
          <StatsCard
            title="Customers Served"
            value={stats?.customersServedToday ?? 0}
            icon={HiUsers} iconColor="purple"
          />
          <StatsCard
            title="Catalog Products"
            value={stats?.totalProducts ?? 0}
            icon={HiCube} iconColor="amber"
          />
        </div>

        {/* Staff Sales Chart & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Monthly Order Volume</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Completed sales order trends</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" fill="#2563EB" radius={[6, 6, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Terminal Ready</span>
              </div>
              <div className="space-y-3">
                <Link to="/sales/new" className="flex items-center justify-between p-4 rounded-xl border border-primary-100 dark:border-primary-900/40 bg-primary-50/50 dark:bg-primary-950/20 hover:bg-primary-100/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-600 text-white">
                      <HiShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Process New Sale</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Launch POS Checkout System</p>
                    </div>
                  </div>
                  <HiArrowUpRight className="w-5 h-5 text-primary-600" />
                </Link>

                <Link to="/customers" className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                      <HiUsers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Customer Lookup</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">View or register customer info</p>
                    </div>
                  </div>
                  <HiArrowUpRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 text-center">
              BMS POS Terminal v1.0 · Shift Active
            </div>
          </div>
        </div>

        {/* My Recent Sales Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">My Recent Sales</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Transactions processed today</p>
            </div>
            <Link to="/sales">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </div>
          <DataTable columns={salesColumns} data={recentSales} isLoading={false} />
        </div>
      </div>
    );
  }

  // ── ADMIN & MANAGER DASHBOARD ──────────────────────────────────────────────
  const isAdmin = role === 'ADMIN';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 ring-1 ring-primary-600/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Enterprise Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isAdmin ? 'Admin Dashboard' : 'Manager Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening across your business operations today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sales/new">
            <Button variant="primary" leftIcon={<HiPlus className="w-4 h-4" />}>
              Create New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-3 xl:grid-cols-5'} gap-5`}>
        <StatsCard
          title="Total Revenue"
          value={`$${Number(stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={HiCurrencyDollar} iconColor="blue" trend="+14.2%"
        />
        <StatsCard
          title="Total Sales"
          value={(stats?.totalSalesCount ?? 0).toLocaleString()}
          icon={HiShoppingCart} iconColor="green" trend="+8.5%"
        />
        <StatsCard
          title="Customers"
          value={(stats?.totalCustomers ?? 0).toLocaleString()}
          icon={HiUsers} iconColor="purple" trend="+5.0%"
        />
        <StatsCard
          title="Products"
          value={(stats?.totalProducts ?? 0).toLocaleString()}
          icon={HiCube} iconColor="amber"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={(stats?.lowStockCount ?? 0).toLocaleString()}
          icon={HiExclamationTriangle} iconColor="red" description="Requires attention"
        />
        {isAdmin && (
          <StatsCard
            title="Employees"
            value={(stats?.totalEmployees ?? 0).toLocaleString()}
            icon={HiUserGroup} iconColor="indigo"
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly revenue trend from completed sales</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              <HiArrowTrendingUp className="w-4 h-4" />
              <span>Revenue Growing</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -10, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Volume Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Sales Volume</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Orders completed per month</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -20, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#2563EB" radius={[6, 6, 0, 0]} opacity={0.9} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Best-selling Products Card */}
      {topProducts.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Best-selling Products</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top products ranked by units sold</p>
            </div>
            <Link to="/products" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Manage Catalog →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topProducts.map((p, i) => {
              const widthPct = Math.min(100, Math.max(12, ((p.totalSold || 1) / maxSoldUnits) * 100));
              return (
                <div key={i} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0 border border-primary-600/10">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                      </div>
                      {/* Micro Visual Bar */}
                      <div className="mt-1.5 w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden max-w-xs">
                        <div 
                          className="bg-gradient-to-r from-primary-600 to-blue-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right flex-shrink-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                      {p.totalSold} units sold
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[80px]">
                      ${Number(p.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Sales</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest completed transaction invoices</p>
          </div>
          <Link to="/sales">
            <Button variant="ghost" size="sm">View all sales →</Button>
          </Link>
        </div>
        {recentSales.length === 0
          ? <EmptyState message="No sales recorded yet." />
          : <DataTable columns={salesColumns} data={recentSales} isLoading={false} />
        }
      </div>
    </div>
  );
};

export default DashboardPage;
