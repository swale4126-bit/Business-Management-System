import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiEye, HiReceiptRefund } from 'react-icons/hi2';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import saleService from '../../services/saleService';

export default function SalesPage() {
  const navigate = useNavigate();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: saleService.getAll,
  });

  const columns = [
    { header: 'Invoice', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
          <HiReceiptRefund className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.invoiceNumber}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(row.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    )},
    { header: 'Customer', accessor: (row) => row.customer?.name || 'Walk-in' },
    { header: 'Total', render: (row) => <span className="font-semibold text-gray-900 dark:text-white">${Number(row.totalAmount).toFixed(2)}</span> },
    { 
      header: 'Status', 
      render: (row) => {
        if (row.status === 'COMPLETED') return <Badge variant="green" dot>Completed</Badge>;
        if (row.status === 'PENDING') return <Badge variant="amber" dot>Pending</Badge>;
        return <Badge variant="red" dot>{row.status}</Badge>;
      } 
    },
    { header: 'Payment', accessor: (row) => <span className="capitalize">{row.paymentMethod?.toLowerCase()}</span> },
    {
      header: 'Actions',
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
        title="Sales" 
        subtitle="Manage sales orders and invoices."
        action={
          <Button onClick={() => navigate('/sales/new')} leftIcon={<HiPlus className="w-4 h-4" />}>
            New Sale
          </Button>
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <DataTable columns={columns} data={sales} isLoading={isLoading} />
      </div>
    </div>
  );
}
