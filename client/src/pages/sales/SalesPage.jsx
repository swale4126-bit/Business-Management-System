import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiEye, HiReceiptRefund, HiCurrencyDollar, HiShoppingCart, HiCalculator, HiMagnifyingGlass } from 'react-icons/hi2';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatsCard from '../../components/ui/StatsCard';
import saleService from '../../services/saleService';

export default function SalesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const { data: rawSales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: saleService.getAll,
  });

  const salesList = Array.isArray(rawSales) ? rawSales : (rawSales?.data || []);

  const totalSalesCount = salesList.length;
  const totalRevenue = salesList.reduce((acc, s) => acc + Number(s.totalAmount || 0), 0);
  const avgOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  const filteredSales = salesList.filter(s => {
    const term = searchTerm.toLowerCase();
    const inv = (s.invoiceNumber || '').toLowerCase();
    const cust = (s.customer?.name || 'Walk-in Customer').toLowerCase();

    const matchesSearch = inv.includes(term) || cust.includes(term);
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || s.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const columns = [
    { header: 'Invoice Number', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <HiReceiptRefund className="w-5 h-5" />
        </div>
        <div>
          <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md">
            {row.invoiceNumber}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    )},
    { 
      header: 'Customer', 
      render: (row) => {
        const cName = row.customer?.name || 'Walk-in Customer';
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
              {cName[0]?.toUpperCase()}
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">{cName}</span>
          </div>
        );
      }
    },
    { header: 'Total Amount', render: (row) => <span className="font-extrabold text-gray-900 dark:text-white text-sm">${Number(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> },
    { 
      header: 'Status', 
      render: (row) => {
        if (row.status === 'COMPLETED') return <Badge variant="green" dot>Completed</Badge>;
        if (row.status === 'PENDING') return <Badge variant="amber" dot>Pending</Badge>;
        if (row.status === 'CANCELLED') return <Badge variant="red" dot>Cancelled</Badge>;
        return <Badge variant="gray" dot>{row.status}</Badge>;
      } 
    },
    { 
      header: 'Payment Method', 
      render: (row) => (
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
          {row.paymentMethod?.replace('_', ' ') || 'CASH'}
        </span>
      ) 
    },
    {
      header: 'Action',
      render: (row) => (
        <button onClick={() => navigate(`/sales/${row.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View Invoice">
          <HiEye className="w-5 h-5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Sales Invoices" 
        description="Monitor completed sales orders, customer transactions, and payment methods."
        action={
          <Button onClick={() => navigate('/sales/new')} leftIcon={<HiPlus className="w-4 h-4" />}>
            Create New Sale
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Total Sales Completed"
          value={totalSalesCount.toLocaleString()}
          icon={HiShoppingCart} iconColor="blue"
        />
        <StatsCard
          title="Total Revenue Generated"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={HiCurrencyDollar} iconColor="green"
        />
        <StatsCard
          title="Average Order Value"
          value={`$${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={HiCalculator} iconColor="purple"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by invoice number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredSales} isLoading={isLoading} />
      </div>
    </div>
  );
}

