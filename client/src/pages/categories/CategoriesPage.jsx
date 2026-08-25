import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiPlus, HiPencil, HiTrash, HiTag, HiMagnifyingGlass } from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import categoryService from '../../services/categoryService';
import CategoryForm from './CategoryForm';

export default function CategoriesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const queryClient = useQueryClient();

  const { data: rawCategories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(res?.message || 'Category deleted');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
    },
  });

  const filteredCategories = categories.filter(c => {
    const term = searchTerm.toLowerCase();
    const name = (c.name || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    return name.includes(term) || desc.includes(term);
  });

  const columns = [
    { header: 'Category', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
          <HiTag className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">{row.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{row.description || 'No description'}</p>
        </div>
      </div>
    )},
    { header: 'Product Count', accessor: (row) => row._count?.products ?? row.productCount ?? 0 },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditingCategory(row); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit">
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
        title="Categories" 
        subtitle="Manage product categories and catalog structure."
        actions={
          <Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => { setEditingCategory(null); setIsFormOpen(true); }}>
            Add Category
          </Button>
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search category by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>
        </div>

        <DataTable columns={columns} data={filteredCategories} isLoading={isLoading} />
      </div>

      <CategoryForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} category={editingCategory} />
      
      <ConfirmDialog 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)} 
        title="Delete Category" 
        message={`Are you sure you want to delete the category "${deleteTarget?.name}"?`} 
        isDanger={true}
      />
    </div>
  );
}
