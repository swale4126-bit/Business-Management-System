import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiArrowLeft, HiOutlineTag, HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineCurrencyDollar, HiOutlineQrcode } from 'react-icons/hi';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import productService from '../../services/productService';
import inventoryService from '../../services/inventoryService';
import { getImageUrl } from '../../utils/image';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getById(id),
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['inventory', 'history', id],
    queryFn: () => inventoryService.getHistory(id),
  });

  const product = productData?.data || productData;
  const history = historyData?.data || historyData || [];

  const columns = [
    { header: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { 
      header: 'Type', 
      render: (row) => (
        <Badge variant={
          row.type === 'IN' ? 'green' : 
          row.type === 'OUT' || row.type === 'SALE' ? 'blue' : 
          row.type === 'RETURN' ? 'purple' : 'amber'
        }>
          {row.type}
        </Badge>
      )
    },
    { 
      header: 'Quantity Change', 
      render: (row) => {
        const isPositive = row.newQty > row.previousQty;
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{row.quantity}
          </span>
        );
      }
    },
    { header: 'Reason', accessor: 'reason' }
  ];

  if (isLoadingProduct) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!product) return <div className="p-8 text-center text-red-500">Product not found.</div>;

  const isLowStock = product.quantity <= product.minStock;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/products')}>
          <HiArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader 
          title="Product Details"
          subtitle={`Detailed information for ${product.name}`} 
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row gap-8">
          {/* Image */}
          <div className="w-full md:w-64 h-64 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
            {product.image ? (
              <img 
                src={getImageUrl(product.image)} 
                alt={product.name} 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
                }}
                className="w-full h-full object-cover" 
              />
            ) : null}
            <div className={`text-gray-400 dark:text-gray-500 flex-col items-center ${product.image ? 'hidden' : 'flex'}`}>
              <HiOutlineCube className="w-12 h-12 mb-2" />
              <span className="text-xs">No Image Provided</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h2>
                <Badge variant={product.status === 'ACTIVE' ? 'green' : product.status === 'DISCONTINUED' ? 'red' : 'gray'}>
                  {product.status}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{product.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  <HiOutlineTag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.sku}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <HiOutlineQrcode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Barcode</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.barcode || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <HiOutlineCurrencyDollar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Selling Price</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${Number(product.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <HiOutlineCube className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Quantity</p>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-lg ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {product.quantity}
                    </p>
                    {isLowStock && <Badge variant="red">Low Stock</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <HiOutlineTag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.category?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400">
                  <HiOutlineOfficeBuilding className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{product.supplier?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Stock Movement History</h3>
        <DataTable
          columns={columns}
          data={history}
          isLoading={isLoadingHistory}
        />
      </div>
    </div>
  );
}
