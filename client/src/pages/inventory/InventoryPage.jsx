import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiArrowsRightLeft, HiClock, HiClipboardDocumentList, HiExclamationTriangle, HiCheckCircle, HiMagnifyingGlass } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatsCard from '../../components/ui/StatsCard';
import inventoryService from '../../services/inventoryService';
import StockMovementForm from './StockMovementForm';

export default function InventoryPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movementType, setMovementType] = useState('IN');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const navigate = useNavigate();

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAll,
  });
  const inventory = inventoryData?.data?.data || inventoryData?.data || inventoryData || [];

  const handleMovement = (type, product = null) => {
    setMovementType(type);
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const totalProducts = inventory.length;
  const totalStockCount = inventory.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const lowStockCount = inventory.filter(p => p.quantity > 0 && p.quantity <= (p.minStock || 10)).length;
  const outOfStockCount = inventory.filter(p => p.quantity <= 0).length;

  const filteredInventory = inventory.filter(p => {
    const term = searchTerm.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();

    const matchesSearch = name.includes(term) || sku.includes(term);
    let matchesStock = true;
    if (stockFilter === 'HEALTHY') matchesStock = p.quantity > (p.minStock || 10);
    else if (stockFilter === 'LOW') matchesStock = p.quantity > 0 && p.quantity <= (p.minStock || 10);
    else if (stockFilter === 'OUT') matchesStock = p.quantity <= 0;

    return matchesSearch && matchesStock;
  });

  const stockBadge = (qty, threshold = 10) => {
    if (qty <= 0) return <Badge variant="red" dot>Out of Stock</Badge>;
    if (qty <= threshold) return <Badge variant="amber" dot>Low Stock</Badge>;
    return <Badge variant="green" dot>Healthy</Badge>;
  };

  const columns = [
    { header: 'Product', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
          <HiClipboardDocumentList className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{row.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">SKU: {row.sku}</p>
        </div>
      </div>
    )},
    { 
      header: 'Current Stock', 
      render: (row) => (
        <span className={`font-semibold text-base ${row.quantity <= (row.minStock || 10) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {row.quantity}
        </span>
      )
    },
    { 
      header: 'Min Threshold', 
      accessor: (row) => <span className="text-sm text-gray-500 dark:text-gray-400">{row.minStock || 10}</span> 
    },
    {
      header: 'Status',
      render: (row) => stockBadge(row.quantity, row.minStock || 10)
    },
    {
      header: 'Stock Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="xs" onClick={() => handleMovement('IN', row)}>
            Stock In
          </Button>
          <Button variant="secondary" size="xs" onClick={() => handleMovement('OUT', row)}>
            Stock Out
          </Button>
          <Button variant="ghost" size="xs" onClick={() => handleMovement('ADJUSTMENT', row)}>
            Adjust
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Inventory Management" 
        description="Track real-time stock levels, record stock movements, and resolve inventory alerts."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/inventory/history')} leftIcon={<HiClock className="w-4 h-4" />}>
              Movement History
            </Button>
            <Button onClick={() => handleMovement('IN')} leftIcon={<HiArrowsRightLeft className="w-4 h-4" />}>
              Quick Movement
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={HiClipboardDocumentList} iconColor="blue"
        />
        <StatsCard
          title="Total Units in Stock"
          value={totalStockCount.toLocaleString()}
          icon={HiCheckCircle} iconColor="green"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockCount.toString()}
          icon={HiExclamationTriangle} iconColor="amber"
        />
        <StatsCard
          title="Out of Stock Items"
          value={outOfStockCount.toString()}
          icon={HiExclamationTriangle} iconColor="red"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search inventory by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="HEALTHY">Healthy Stock</option>
            <option value="LOW">Low Stock Alert</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredInventory} isLoading={isLoading} />
      </div>

      <StockMovementForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} type={movementType} product={selectedProduct} />
    </div>
  );
}
