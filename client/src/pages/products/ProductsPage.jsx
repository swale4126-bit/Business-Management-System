 import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiEye, HiPencil, HiTrash, HiMagnifyingGlass, HiCube } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/image';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import ProductForm from './ProductForm';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(res?.message || 'Product deleted');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete product';
      toast.error(msg);
    },
  });

  const stockBadge = (qty, minStock) => {
    if (qty <= 0)         return <Badge variant="red" dot>Out of Stock</Badge>;
    if (qty <= minStock)  return <Badge variant="amber" dot>Low Stock</Badge>;
    return <Badge variant="green" dot>In Stock</Badge>;
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const name = (p.name || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();
    const barcode = (p.barcode || '').toLowerCase();

    const matchesSearch = name.includes(term) || sku.includes(term) || barcode.includes(term);
    const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory || p.category?.name === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'IN') matchesStock = p.quantity > (p.minStock || 10);
    else if (stockFilter === 'LOW') matchesStock = p.quantity > 0 && p.quantity <= (p.minStock || 10);
    else if (stockFilter === 'OUT') matchesStock = p.quantity <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const columns = [
    { header: 'Product', render: (row) => {
      const imgPath = row.image || row.imageUrl;
      return (
        <div className="flex items-center gap-3">===
          {imgPath ? (
            <img 
              src={getImageUrl(imgPath)} 
              alt={row.name} 
              onError={(e) => { 
                e.currentTarget.style.display = 'none'; 
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex'; 
              }}
              className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-700 flex-shrink-0" 
            />
          ) : null}
          <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 ${imgPath ? 'hidden' : 'flex'}`}>
            <HiCube className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">{row.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">SKU: {row.sku}</p>
          </div>
        </div>
      );
    }},
    { header: 'Category', accessor: (row) => row.category?.name || '—' },
    { header: 'Buying Price', accessor: (row) => row.buyingPrice ? `$${Number(row.buyingPrice).toFixed(2)}` : '—' },
    { header: 'Selling Price', render: (row) => <span className="font-semibold text-gray-900 dark:text-white">${Number(row.sellingPrice || 0).toFixed(2)}</span> },
    { header: 'Stock Level', render: (row) => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.quantity}</span>
        {stockBadge(row.quantity, row.minStock || 10)}
      </div>
    )},
    { header: 'Actions', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => navigate(`/products/${row.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View Details"><HiEye className="w-4 h-4" /></button>
        <button onClick={() => { setEditingProduct(row); setIsFormOpen(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Edit"><HiPencil className="w-4 h-4" /></button>
        <button onClick={() => setDeleteTarget(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><HiTrash className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Products Catalog"
        description="View and manage catalog items, pricing, SKU details, and inventory status."
        actions={<Button leftIcon={<HiPlus className="w-4 h-4" />} onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>Add Product</Button>}
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Search & Filtering Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search product by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="IN">In Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredProducts} isLoading={isLoading} />
      </div>

      <ProductForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} product={editingProduct} />
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteMutation.mutate(deleteTarget?.id)} title="Delete Product" message={`Delete product "${deleteTarget?.name}"? This action cannot be undone.`} isDanger={true} />
    </div>
  );
}
