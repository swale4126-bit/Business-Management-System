import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import customerService from '../../services/customerService';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineCurrencyDollar } from 'react-icons/hi';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: customerData, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id)
  });

  const { data: purchasesData, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['customerPurchases', id],
    queryFn: () => customerService.getPurchases(id)
  });

  if (isLoadingCustomer) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  
  const customer = customerData?.data || customerData;
  if (!customer) return <div className="p-8 text-center text-red-500">Customer not found.</div>;

  const purchases = purchasesData?.data?.data || purchasesData?.data || purchasesData || [];

  const columns = [
    { header: 'Invoice Number', accessor: 'invoiceNumber' },
    { 
      header: 'Date', 
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    { 
      header: 'Total Amount', 
      render: (row) => `$${Number(row.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { 
      header: 'Payment Method', 
      render: (row) => <Badge variant="gray">{row.paymentMethod?.replace('_', ' ')}</Badge>
    },
    { 
      header: 'Status', 
      render: (row) => (
        <Badge variant={row.status === 'COMPLETED' ? 'green' : row.status === 'PENDING' ? 'amber' : 'red'}>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Customer Details"
        subtitle={`Profile and purchase history for ${customer.name}`}
        actions={<Button variant="secondary" onClick={() => navigate('/customers')}>Back to List</Button>}
      />
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-300 text-3xl font-bold uppercase shrink-0">
          {customer.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {customer.name}
            {!customer.isActive && (
              <Badge variant="red" className="ml-3 align-middle">INACTIVE</Badge>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <HiOutlineMail className="w-5 h-5 mr-2" />
              {customer.email || 'N/A'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <HiOutlinePhone className="w-5 h-5 mr-2" />
              {customer.phone || 'N/A'}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <HiOutlineLocationMarker className="w-5 h-5 mr-2" />
              {customer.city ? `${customer.city}${customer.country ? `, ${customer.country}` : ''}` : 'N/A'}
            </div>
            <div className="flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400">
              <HiOutlineCurrencyDollar className="w-5 h-5 mr-2" />
              Total Spent: ${Number(customer.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineCalendar className="w-5 h-5 text-gray-500" />
            Purchase History
          </h3>
        </div>
        <DataTable columns={columns} data={purchases} isLoading={isLoadingPurchases} />
      </div>
    </div>
  );
};

export default CustomerDetail;
