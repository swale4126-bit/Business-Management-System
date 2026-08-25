import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiClock, HiMagnifyingGlass, HiFunnel } from 'react-icons/hi2';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import inventoryService from '../../services/inventoryService';

export default function InventoryHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['stockHistory'],
    queryFn: () => inventoryService.getHistory(),
  });

  const history = Array.isArray(historyRes) 
    ? historyRes 
    : (historyRes?.data?.data || historyRes?.data || []);

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const productName = (item.product?.name || '').toLowerCase();
    const productSku = (item.product?.sku || '').toLowerCase();
    const reason = (item.reason || '').toLowerCase();

    const matchesSearch = productName.includes(term) || productSku.includes(term) || reason.includes(term);
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const typeBadge = (type) => {
    switch (type) {
      case 'IN':
        return <Badge variant="green" dot>Stock In</Badge>;
      case 'OUT':
        return <Badge variant="amber" dot>Stock Out</Badge>;
      case 'SALE':
        return <Badge variant="blue" dot>Sale</Badge>;
      case 'ADJUSTMENT':
        return <Badge variant="purple" dot>Adjustment</Badge>;
      default:
        return <Badge variant="gray">{type}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Product',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.product?.name || '—'}</p>
          <p className="text-xs text-gray-400 font-mono">SKU: {row.product?.sku || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Movement Type',
      render: (row) => typeBadge(row.type),
    },
    {
      header: 'Quantity',
      render: (row) => (
        <span className={`font-bold ${row.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : row.type === 'OUT' || row.type === 'SALE' ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400'}`}>
          {row.type === 'IN' ? `+${row.quantity}` : row.type === 'OUT' || row.type === 'SALE' ? `-${row.quantity}` : `${row.quantity}`}
        </span>
      ),
    },
    {
      header: 'Stock Change',
      render: (row) => (
        <span className="text-xs text-gray-600 dark:text-gray-300 font-mono">
          {row.previousQty ?? '—'} → <strong className="text-gray-900 dark:text-white">{row.newQty ?? '—'}</strong>
        </span>
      ),
    },
    {
      header: 'Reason / Reference',
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs block">
          {row.reason || row.reference || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/inventory')}>
          <HiArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="Stock Movement History" 
          subtitle="Audit log of all stock increases, decreases, adjustments, and automated sales records." 
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search history by product name, SKU, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
              <option value="SALE">Sales</option>
              <option value="ADJUSTMENT">Adjustments</option>
            </Select>
          </div>
        </div>

        <DataTable columns={columns} data={filteredHistory} isLoading={isLoading} />
      </div>
    </div>
  );
}
