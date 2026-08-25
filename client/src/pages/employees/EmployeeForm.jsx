import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import employeeService from '../../services/employeeService';
import toast from 'react-hot-toast';

// ── Schemas must mirror the backend (server/models/schemas.js) ──────────────
const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName:  z.string().min(1, 'Last name is required').max(50),
  email:     z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(12, 'Password must be at most 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role:      z.enum(['MANAGER', 'STAFF']),
  phone:     z.string().max(20).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
  position:   z.string().max(100).optional().or(z.literal('')),
});

const updateEmployeeSchema = z.object({
  firstName:  z.string().min(1, 'First name is required').max(50).optional(),
  lastName:   z.string().min(1, 'Last name is required').max(50).optional(),
  phone:      z.string().max(20).optional().or(z.literal('')),
  role:       z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  department: z.string().max(100).optional().or(z.literal('')),
  position:   z.string().max(100).optional().or(z.literal('')),
  status:     z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED']).optional(),
});

const EmployeeForm = ({ isOpen, onClose, employee, onSuccess }) => {
  const isEditing = !!employee;

  const schema = isEditing ? updateEmployeeSchema : createEmployeeSchema;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: isEditing
      ? {
          firstName:  employee?.user?.firstName ?? '',
          lastName:   employee?.user?.lastName  ?? '',
          phone:      employee?.user?.phone      ?? '',
          role:       employee?.user?.role       ?? 'STAFF',
          department: employee?.department       ?? '',
          position:   employee?.position         ?? '',
          status:     employee?.status           ?? 'ACTIVE',
        }
      : {
          firstName:  '',
          lastName:   '',
          email:      '',
          password:   '',
          role:       'STAFF',
          phone:      '',
          department: '',
          position:   '',
        },
  });

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        reset({
          firstName:  employee.user?.firstName ?? '',
          lastName:   employee.user?.lastName  ?? '',
          phone:      employee.user?.phone      ?? '',
          role:       employee.user?.role       ?? 'STAFF',
          department: employee.department       ?? '',
          position:   employee.position         ?? '',
          status:     employee.status           ?? 'ACTIVE',
        });
      } else {
        reset({
          firstName:  '',
          lastName:   '',
          email:      '',
          password:   '',
          role:       'STAFF',
          phone:      '',
          department: '',
          position:   '',
        });
      }
    }
  }, [employee, isOpen, reset]);

  const onSubmit = async (data) => {
    // Strip empty optional strings so backend doesn't choke on them
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '')
    );

    try {
      if (isEditing) {
        await employeeService.update(employee.id, payload);
        toast.success('Employee updated successfully');
      } else {
        await employeeService.create(payload);
        toast.success('Employee created successfully');
      }
      onSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors?.length) {
        toast.error(`${msg}: ${fieldErrors.map(e => e.message).join(', ')}`);
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Employee' : 'Add Employee'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="e.g. John"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            placeholder="e.g. Doe"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        {/* Email — only on create */}
        {!isEditing && (
          <Input
            label="Email Address"
            type="email"
            placeholder="employee@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
        )}

        {/* Temporary password — only on create */}
        {!isEditing && (
          <Input
            label="Temporary Password"
            type="password"
            placeholder="e.g. Manager@2026"
            {...register('password')}
            error={errors.password?.message}
          />
        )}

        {/* Role */}
        <Select
          label="Role"
          {...register('role')}
          error={errors.role?.message}
          options={
            isEditing
              ? [
                  { label: 'Admin',   value: 'ADMIN'   },
                  { label: 'Manager', value: 'MANAGER' },
                  { label: 'Staff',   value: 'STAFF'   },
                ]
              : [
                  { label: 'Manager', value: 'MANAGER' },
                  { label: 'Staff',   value: 'STAFF'   },
                ]
          }
        />

        {/* Status — only when editing */}
        {isEditing && (
          <Select
            label="Status"
            {...register('status')}
            error={errors.status?.message}
            options={[
              { label: 'Active',      value: 'ACTIVE'      },
              { label: 'Inactive',    value: 'INACTIVE'    },
              { label: 'On Leave',    value: 'ON_LEAVE'    },
              { label: 'Terminated',  value: 'TERMINATED'  },
            ]}
          />
        )}

        {/* Optional fields */}
        <Input
          label="Phone (optional)"
          type="tel"
          placeholder="+1 234 567 8900"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Department (optional)"
            placeholder="e.g. Sales"
            {...register('department')}
            error={errors.department?.message}
          />
          <Input
            label="Position (optional)"
            placeholder="e.g. Sales Rep"
            {...register('position')}
            error={errors.position?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Employee' : 'Save Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeForm;
