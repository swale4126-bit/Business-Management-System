import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import StatsCard from '../../components/ui/StatsCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerForm from './CustomerForm';
import customerService from '../../services/customerService';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiPencil, HiTrash, HiEye, HiMagnifyingGlass, HiUsers, HiCurrencyDollar } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await customerService.getAll({ isActive: true });
      setCustomers(Array.isArray(res) ? res : (res?.data || []));
    } catch { 
      toast.error('Failed to fetch customers'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    const name = (c.name || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + Number(c.totalSpent || 0), 0);

  const columns = [
    { header: 'Customer', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {row.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{row.email || 'No email'}</p>
        </div>
      </div>
    )},
    { header: 'Phone', accessor: (row) => row.phone || '—' },
    { header: 'City/Country', accessor: (row) => row.city ? `${row.city}${row.country ? `, ${row.country}` : ''}` : '—' },
    { 
      header: 'Total Spent', 
      render: (row) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          ${Number(row.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    { header: 'Actions', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate(`/customers/${row.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View Details">
          <HiEye className="w-4 h-4" />
        </button>
        <button onClick={() => { setSelectedCustomer(row); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit">
          <HiPencil className="w-4 h-4" />
        </button>
        <button onClick={() => { setCustomerToDelete(row); setIsDeleteOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
          <HiTrash className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Customers"
        description="Manage customer profiles, contact info, and transaction totals."
        actions={<Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => { setSelectedCustomer(null); setIsFormOpen(true); }}>Add Customer</Button>}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Registered Customers"
          value={customers.length.toString()}
          icon={HiUsers} iconColor="green"
        />
        <StatsCard
          title="Cumulative Revenue"
          value={`$${totalSpentAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={HiCurrencyDollar} iconColor="blue"
        />
        <StatsCard
          title="Active Customer Base"
          value={customers.filter(c => c.isActive !== false).length.toString()}
          icon={HiUsers} iconColor="purple"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filteredCustomers} isLoading={isLoading} />
      </div>

      <CustomerForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} customer={selectedCustomer} onSuccess={() => { setIsFormOpen(false); fetchCustomers(); }} />
      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={async () => { try { const res = await customerService.delete(customerToDelete.id); toast.success(res.message || 'Customer deleted successfully'); fetchCustomers(); } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); } }} title="Delete Customer" message={`Delete customer ${customerToDelete?.name}? This action cannot be undone.`} isDanger={true} />
    </div>
  );
};

export default CustomersPage;
