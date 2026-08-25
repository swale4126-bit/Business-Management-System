import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import supplierService from '../../services/supplierService';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  contactPerson: z.string().min(1, 'Contact Person is required'),
  address: z.string().optional(),
});

export default function SupplierForm({ isOpen, onClose, supplier }) {
  const queryClient = useQueryClient();
  const isEditing = !!supplier;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: supplier || { name: '', email: '', phone: '', contactPerson: '', address: '' }
  });

  useEffect(() => {
    if (supplier) {
      reset(supplier);
    } else {
      reset({ name: '', email: '', phone: '', contactPerson: '', address: '' });
    }
  }, [supplier, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? supplierService.update(supplier.id, data) : supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(isEditing ? 'Supplier updated' : 'Supplier created');
      onClose();
    },
    onError: () => toast.error('Failed to save supplier')
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Supplier' : 'Add Supplier'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <Input label="Contact Person" {...register('contactPerson')} error={errors.contactPerson?.message} />
        <Input label="Address" {...register('address')} error={errors.address?.message} />

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
