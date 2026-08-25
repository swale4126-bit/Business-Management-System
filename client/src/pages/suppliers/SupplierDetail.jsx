import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiArrowLeft, HiBuildingOffice, HiEnvelope, HiPhone, HiUserCircle, HiMapPin } from 'react-icons/hi2';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import supplierService from '../../services/supplierService';

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: supplierData, isLoading: isLoadingSupplier, isError } = useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => supplierService.getById(id),
  });

  const { data: productsData = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['suppliers', id, 'products'],
    queryFn: () => supplierService.getProducts(id),
  });

  const supplier = supplierData?.data || supplierData;
  const products = Array.isArray(productsData) ? productsData : (productsData?.data || []);

  const columns = [
    { 
      header: 'Product Name', 
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
      ) 
    },
    { header: 'SKU', accessor: 'sku' },
    { 
      header: 'Selling Price', 
      render: (row) => `$${Number(row.sellingPrice || row.price || 0).toFixed(2)}` 
    },
    { 
      header: 'Current Stock', 
      render: (row) => (
        <span className={`font-semibold ${row.quantity <= (row.minStock || 10) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {row.quantity ?? row.stockQuantity ?? 0}
        </span>
      ) 
    }
  ];

  if (isLoadingSupplier) {
    return (
      <div className="p-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <div className="p-12 text-center text-red-500 font-medium">
        Supplier information not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={supplier.name} 
        subtitle="Supplier Profile & Supplied Products Catalog"
        actions={
          <Button variant="secondary" onClick={() => navigate('/suppliers')} leftIcon={<HiArrowLeft className="w-4 h-4" />}>
            Back to Suppliers
          </Button>
        }
      />

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xl font-bold flex-shrink-0">
            <HiBuildingOffice className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{supplier.name}</h2>
              <Badge variant={supplier.status === 'ACTIVE' ? 'green' : 'gray'} dot>
                {supplier.status || 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Supplier Partner</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <HiEnvelope className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{supplier.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HiPhone className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{supplier.phone || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HiUserCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contact Person</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{supplier.contactPerson || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HiMapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Address</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{supplier.address || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Supplied Products</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Products sourced from this supplier</p>
        </div>
        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoadingProducts}
        />
      </div>
    </div>
  );
}
