import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import categoryService from '../../services/categoryService';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export default function CategoryForm({ isOpen, onClose, category }) {
  const queryClient = useQueryClient();
  const isEditing = !!category;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: category || { name: '', description: '' }
  });

  useEffect(() => {
    if (category) {
      reset(category);
    } else {
      reset({ name: '', description: '' });
    }
  }, [category, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEditing ? categoryService.update(category.id, data) : categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEditing ? 'Category updated' : 'Category created');
      onClose();
    },
    onError: () => toast.error('Failed to save category')
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Category' : 'Add Category'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" {...register('name')} error={errors.name?.message} />
        <Input label="Description" {...register('description')} error={errors.description?.message} />

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={mutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
