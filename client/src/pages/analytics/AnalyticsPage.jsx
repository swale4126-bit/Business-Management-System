import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

import PageHeader from '../../components/ui/PageHeader';
import dashboardService from '../../services/dashboardService';

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#0EA5E9'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-gray-600 dark:text-gray-300">
            {p.name}: <span className="font-bold text-primary-600 dark:text-primary-400">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: charts, isLoading } = useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: () => dashboardService.getCharts(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Fallback data structure if API doesn't return full charts
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Analytics Dashboard" 
        subtitle="In-depth real-time insights into your business performance and revenue trends."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales Comparison */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Monthly Sales Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" fill="#16A34A" radius={[6, 6, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Product Category Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Top Selling Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="totalSold" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
