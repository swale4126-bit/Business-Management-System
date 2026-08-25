import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';

const schema = z.object({
  productId: z.string().min(1, 'Product is required'),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().min(0, 'Quantity must be at least 0')),
  notes: z.string().optional()
});

export default function StockMovementForm({ isOpen, onClose, type, product }) {
  const queryClient = useQueryClient();

  const { data: productsData } = useQuery({ queryKey: ['products'], queryFn: productService.getAll });
  const products = Array.isArray(productsData) ? productsData : (productsData?.data?.data || productsData?.data || []);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: '',
      type: 'IN',
      quantity: 1,
      notes: ''
    }
  });

  const selectedProductId = watch('productId');
  const selectedType = watch('type');

  const targetProduct = product || products.find(p => p.id === selectedProductId);

  useEffect(() => {
    reset({
      productId: product?.id || '',
      type: type || 'IN',
      quantity: type === 'ADJUSTMENT' ? (product?.quantity || 0) : 1,
      notes: ''
    });
  }, [product, type, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (data.type === 'OUT' && targetProduct && data.quantity > targetProduct.quantity) {
        throw new Error(`Cannot remove ${data.quantity} units. Only ${targetProduct.quantity} units currently in stock.`);
      }

      const payload = {
        productId: data.productId,
        quantity: data.quantity,
        newQuantity: data.quantity,
        reason: data.notes || (data.type === 'IN' ? 'Stock In' : data.type === 'OUT' ? 'Stock Out' : 'Manual Adjustment')
      };

      if (data.type === 'IN') {
        return inventoryService.stockIn(payload);
      } else if (data.type === 'OUT') {
        return inventoryService.stockOut(payload);
      } else {
        return inventoryService.adjustStock(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockHistory'] });
      toast.success('Stock movement recorded successfully');
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || err.response?.data?.message || 'Failed to record stock movement');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quick Stock Movement - ${selectedType}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <Select label="Product" {...register('productId')} error={errors.productId?.message} disabled={!!product}>
          <option value="">Select Product</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku} · Current Stock: {p.quantity})</option>)}
        </Select>
        
        {/* Enabled Movement Type Select */}
        <Select label="Movement Type" {...register('type')} error={errors.type?.message}>
          <option value="IN">Stock In (Add Stock)</option>
          <option value="OUT">Stock Out (Remove Stock)</option>
          <option value="ADJUSTMENT">Adjustment (Set Exact Total Stock)</option>
        </Select>

        <Input 
          label={selectedType === 'ADJUSTMENT' ? "New Total Stock Quantity" : "Quantity"} 
          type="number" 
          min="0" 
          {...register('quantity')} 
          error={errors.quantity?.message} 
        />
        <Input label="Reason / Reference Notes (Optional)" placeholder="e.g. Received shipment, Damage adjustment" {...register('notes')} error={errors.notes?.message} />

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save Movement</Button>
        </div>
      </form>
    </Modal>
  );
}
