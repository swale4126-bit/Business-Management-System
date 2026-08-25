import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiPhoto, HiXMark } from 'react-icons/hi2';

import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import supplierService from '../../services/supplierService';
import { getImageUrl } from '../../utils/image';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  buyingPrice: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().min(0)),
  sellingPrice: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().min(0)),
  quantity: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().min(0)),
  minStock: z.string().or(z.number()).transform(val => Number(val)).pipe(z.number().min(0)),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  image: z.any().optional(),
});

export default function ProductForm({ isOpen, onClose, product }) {
  const queryClient = useQueryClient();
  const isEditing = !!product;
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });
  const { data: suppliersData } = useQuery({ queryKey: ['suppliers'], queryFn: supplierService.getAll });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data?.data || categoriesData?.data || []);
  const suppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.data?.data || suppliersData?.data || []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', sku: '', description: '', buyingPrice: 0, sellingPrice: 0, quantity: 0, minStock: 0, categoryId: '', supplierId: ''
    }
  });

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        categoryId: product.categoryId || '',
        supplierId: product.supplierId || '',
      });
      setImagePreview(product.image ? getImageUrl(product.image) : null);
    } else {
      reset({ name: '', sku: '', description: '', buyingPrice: 0, sellingPrice: 0, quantity: 0, minStock: 0, categoryId: '', supplierId: '' });
      setImagePreview(null);
    }
    setSelectedFile(null);
  }, [product, reset, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImagePreview = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'image' && data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      return isEditing ? productService.update(product.id, formData) : productService.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to save product';
      toast.error(msg);
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Product' : 'Add New Product'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Product Name" {...register('name')} error={errors.name?.message} />
        <Input label="SKU / Item Code" {...register('sku')} error={errors.sku?.message} />
        <Input label="Description" {...register('description')} error={errors.description?.message} />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Buying Price ($)" type="number" step="0.01" {...register('buyingPrice')} error={errors.buyingPrice?.message} />
          <Input label="Selling Price ($)" type="number" step="0.01" {...register('sellingPrice')} error={errors.sellingPrice?.message} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Initial Stock Qty" type="number" {...register('quantity')} error={errors.quantity?.message} />
          <Input label="Min Threshold Stock" type="number" {...register('minStock')} error={errors.minStock?.message} />
        </div>
        
        <Select label="Category" {...register('categoryId')} error={errors.categoryId?.message}>
          <option value="">Select Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <Select label="Supplier" {...register('supplierId')} error={errors.supplierId?.message}>
          <option value="">Select Supplier</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>

        {/* Product Image Input & Live Preview */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Product Image
          </label>

          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImagePreview}
                className="absolute top-1 right-1 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Remove image"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="block w-full text-xs text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save Product</Button>
        </div>
      </form>
    </Modal>
  );
}
