import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiArrowLeft } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import inventoryService from '../../services/inventoryService';
import Badge from '../../components/ui/Badge';

export default function InventoryHistory() {
  const navigate = useNavigate();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['inventory', 'history', 'all'],
    queryFn: () => inventoryService.getHistory('all'),
  });

  const columns = [
    { header: 'Date', accessor: (row) => new Date(row.createdAt).toLocaleString() },
    { header: 'Product', accessor: (row) => row.product?.name },
    { header: 'SKU', accessor: (row) => row.product?.sku },
    { 
      header: 'Type', 
      accessor: (row) => {
        if (row.type === 'IN') return <Badge variant="success">IN</Badge>;
        if (row.type === 'OUT') return <Badge variant="danger">OUT</Badge>;
        return <Badge variant="warning">ADJUST</Badge>;
      } 
    },
    { header: 'Qty', accessor: 'quantity' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'User', accessor: (row) => row.user?.name || 'System' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/inventory')}>
          <HiArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="Inventory History" 
          subtitle="Chronological log of all stock movements."
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <DataTable
          columns={columns}
          data={history}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
