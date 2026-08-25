import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { HiArrowTrendingUp, HiShoppingCart, HiTag, HiStar } from 'react-icons/hi2';

import PageHeader from '../../components/ui/PageHeader';
import dashboardService from '../../services/dashboardService';

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 shadow-xl text-xs ring-1 ring-gray-900/5">
        <p className="font-semibold text-gray-900 dark:text-white mb-1.5">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-gray-500 dark:text-gray-400">{p.name}:</span>
            <span className="font-bold text-gray-900 dark:text-white">
              {typeof p.value === 'number' && (p.name?.includes('Revenue') || p.name?.includes('$'))
                ? `$${p.value.toLocaleString()}`
                : p.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Chart card wrapper for consistent styling
const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 shadow-sm">
    <div className="mb-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="h-72">
      {children}
    </div>
  </div>
);

export default function AnalyticsPage() {
  const { data: charts, isLoading } = useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: () => dashboardService.getCharts(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded-lg w-56" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const revenueData = charts?.revenueByMonth || charts?.revenue || [
    { month: 'Jan', revenue: 4000 }, { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 }, { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 }, { month: 'Jun', revenue: 7000 },
  ];
  const salesData = charts?.salesByMonth || charts?.sales || [
    { month: 'Week 1', count: 40 }, { month: 'Week 2', count: 30 },
    { month: 'Week 3', count: 50 }, { month: 'Week 4', count: 45 },
  ];
  const categoryData = charts?.categories || [
    { name: 'Electronics', value: 400 }, { name: 'Clothing', value: 300 },
    { name: 'Food', value: 300 }, { name: 'Furniture', value: 200 },
  ];
  const topProductsData = charts?.topProducts || [
    { name: 'Laptop', totalSold: 120 }, { name: 'Phone', totalSold: 98 },
    { name: 'Desk', totalSold: 86 }, { name: 'Chair', totalSold: 75 },
  ];

  const totalRevenue = revenueData.reduce((acc, r) => acc + (r.revenue || 0), 0);
  const totalOrders = salesData.reduce((acc, s) => acc + (s.count || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics Dashboard"
        description="In-depth real-time insights into business performance, revenue, and growth trends."
      />

      {/* Summary metrics strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: HiArrowTrendingUp, color: 'text-blue-600 bg-blue-500/10 ring-blue-500/20' },
          { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: HiShoppingCart, color: 'text-emerald-600 bg-emerald-500/10 ring-emerald-500/20' },
          { label: 'Product Categories', value: categoryData.length.toString(), icon: HiTag, color: 'text-amber-600 bg-amber-500/10 ring-amber-500/20' },
          { label: 'Top Sellers', value: topProductsData.length.toString(), icon: HiStar, color: 'text-purple-600 bg-purple-500/10 ring-purple-500/20' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ${color}`}>
              <Icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue from completed sales">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ left: -10, right: 10, top: 5 }}>
              <defs>
                <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="url(#revLine)" strokeWidth={3} dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#2563EB' }} name="Revenue ($)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Sales Volume" subtitle="Number of completed orders per period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ left: -20, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} name="Orders" maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product Category Distribution" subtitle="Revenue share by product category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="48%"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Selling Products" subtitle="Products ranked by total units sold">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsData} layout="vertical" margin={{ left: 0, right: 20, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalSold" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Units Sold" maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
