import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiArrowLeft, HiPrinter, HiReceiptRefund } from 'react-icons/hi2';

import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import saleService from '../../services/saleService';

export default function SaleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: saleData, isLoading, isError } = useQuery({
    queryKey: ['sales', id],
    queryFn: () => saleService.getById(id),
  });

  const sale = saleData?.data || saleData;

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="p-12 text-center text-red-500 font-medium">
        Sale order or invoice details could not be found.
      </div>
    );
  }

  const statusBadge = (status) => {
    if (status === 'COMPLETED') return <Badge variant="green" dot>Completed</Badge>;
    if (status === 'PENDING')   return <Badge variant="amber" dot>Pending</Badge>;
    if (status === 'CANCELLED') return <Badge variant="red"   dot>Cancelled</Badge>;
    return <Badge variant="gray" dot>{status}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/sales')} leftIcon={<HiArrowLeft className="w-4 h-4" />}>
            Back to Sales
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice #{sale.invoiceNumber}</h1>
        </div>
        <Button onClick={() => window.print()} leftIcon={<HiPrinter className="w-4 h-4" />}>
          Print Invoice
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm print-section">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 dark:border-gray-800 pb-6 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">BMS Enterprise</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Invoice Number: <strong className="text-gray-900 dark:text-white">{sale.invoiceNumber}</strong></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Date: {new Date(sale.createdAt).toLocaleDateString()}</p>
            <div className="mt-2">{statusBadge(sale.status)}</div>
          </div>
          <div className="sm:text-right">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">BMS Headquarters</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">123 Business Avenue<br/>City, State 12345</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Bill To:</h3>
          <p className="font-semibold text-gray-900 dark:text-white">{sale.customer?.name || 'Walk-in Customer'}</p>
          {sale.customer?.email && <p className="text-xs text-gray-500 dark:text-gray-400">{sale.customer.email}</p>}
          {sale.customer?.phone && <p className="text-xs text-gray-500 dark:text-gray-400">{sale.customer.phone}</p>}
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sale.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.product?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 text-right whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 text-right whitespace-nowrap">${Number(item.unitPrice || item.price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right whitespace-nowrap">${(Number(item.unitPrice || item.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 w-full sm:w-1/2 ml-auto space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Subtotal:</span>
            <span>${Number(sale.subtotalAmount || sale.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Tax:</span>
            <span>${Number(sale.taxAmount || sale.tax || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Discount:</span>
            <span>${Number(sale.discountAmount || sale.discount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-800 pt-2">
            <span>Total:</span>
            <span>${Number(sale.totalAmount || sale.total || 0).toFixed(2)}</span>
          </div>
          <div className="text-right text-xs text-gray-500 dark:text-gray-400 pt-1">
            Payment Method: <span className="font-semibold uppercase text-gray-700 dark:text-gray-300">{sale.paymentMethod?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
