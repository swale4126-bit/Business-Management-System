import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiEye, HiPencil, HiTrash, HiBuildingOffice, HiMagnifyingGlass, HiTruck, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatsCard from '../../components/ui/StatsCard';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import supplierService from '../../services/supplierService';
import SupplierForm from './SupplierForm';

export default function SuppliersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: rawSuppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierService.getAll,
  });

  const suppliers = Array.isArray(rawSuppliers) ? rawSuppliers : (rawSuppliers?.data || []);

  const deleteMutation = useMutation({
    mutationFn: supplierService.delete,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(res?.message || 'Supplier deleted successfully');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete supplier';
      toast.error(msg);
    },
  });

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => (s.status || 'ACTIVE') === 'ACTIVE').length;
  const inactiveSuppliers = totalSuppliers - activeSuppliers;

  const filteredSuppliers = suppliers.filter(s => {
    const term = searchTerm.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const contact = (s.contactPerson || '').toLowerCase();
    const matchesSearch = name.includes(term) || email.includes(term) || contact.includes(term);
    const matchesStatus = statusFilter === 'ALL' || (s.status || 'ACTIVE') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { header: 'Supplier', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 ring-1 ring-indigo-500/20">
          <HiBuildingOffice className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{row.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.email || 'No email'}</p>
        </div>
      </div>
    )},
    { header: 'Contact Person', render: (row) => (
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{row.contactPerson || '—'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{row.phone || '—'}</p>
      </div>
    )},
    { header: 'Location', accessor: (row) => {
      const parts = [row.city, row.country].filter(Boolean);
      return parts.length ? parts.join(', ') : '—';
    }},
    { header: 'Status', render: (row) => (
      <Badge variant={(row.status || 'ACTIVE') === 'ACTIVE' ? 'green' : 'gray'} dot>
        {row.status || 'ACTIVE'}
      </Badge>
    )},
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/suppliers/${row.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View Details">
            <HiEye className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditingSupplier(row); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit">
            <HiPencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Suppliers"
        description="Manage vendor contacts, partner records, and supply chain relationships."
        actions={
          <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => { setEditingSupplier(null); setIsFormOpen(true); }}>
            Add Supplier
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Total Suppliers"
          value={totalSuppliers.toString()}
          icon={HiTruck}
          iconColor="indigo"
        />
        <StatsCard
          title="Active Suppliers"
          value={activeSuppliers.toString()}
          icon={HiCheckCircle}
          iconColor="green"
        />
        <StatsCard
          title="Inactive Suppliers"
          value={inactiveSuppliers.toString()}
          icon={HiBuildingOffice}
          iconColor="gray"
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/20 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by company name, email, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredSuppliers} isLoading={isLoading} emptyMessage="No suppliers found" emptySubMessage="Add your first supplier to get started." />
      </div>

      <SupplierForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} supplier={editingSupplier} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        isDanger={true}
      />
    </div>
  );
}
