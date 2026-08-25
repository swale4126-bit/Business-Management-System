import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import { HiLockClosed, HiEye, HiEyeSlash, HiArrowLeft } from 'react-icons/hi2';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be 8–12 characters long')
    .max(12, 'Password must be 8–12 characters long')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const token = searchParams.get('token') || params.token;
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema)
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    try {
      setIsLoading(true);
      await authService.resetPassword({ token, newPassword: data.password });
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center animate-fade-in py-4">
        <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
        <p className="text-xs text-gray-400 mb-6">This password reset link is missing a valid security token.</p>
        <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 font-semibold">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Set New Password</h1>
        <p className="mt-1 text-xs text-gray-400">Choose a strong new password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="e.g. Manager@2026"
            iconLeft={HiLockClosed}
            disabled={isLoading}
            error={errors.password?.message}
            hint="8-12 chars with uppercase, lowercase, number & special char"
            className="bg-white/10 text-white placeholder-gray-500 border-white/10 focus:border-primary-500 focus:ring-primary-500/40 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
          </button>
        </div>

        <Input
          label="Confirm New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter password"
          iconLeft={HiLockClosed}
          disabled={isLoading}
          error={errors.confirmPassword?.message}
          className="bg-white/10 text-white placeholder-gray-500 border-white/10 focus:border-primary-500 focus:ring-primary-500/40"
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full mt-2 font-semibold text-sm shadow-lg shadow-primary-600/30"
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors">
          <HiArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
