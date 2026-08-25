import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import customerService from '../../services/customerService';
import toast from 'react-hot-toast';

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional()
});

const CustomerForm = ({ isOpen, onClose, customer, onSuccess }) => {
  const isEditing = !!customer;
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: '', email: '', phone: '' }
  });

  useEffect(() => {
    if (customer && isOpen) {
      reset({ name: customer.name, email: customer.email || '', phone: customer.phone || '' });
    } else if (isOpen) {
      reset({ name: '', email: '', phone: '' });
    }
  }, [customer, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await customerService.update(customer.id, data);
        toast.success('Customer updated');
      } else {
        await customerService.create(data);
        toast.success('Customer created');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Customer' : 'Add Customer'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} />
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;
