import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    if (isLoading) return; // Prevent duplicate submissions
    try {
      setIsLoading(true);
      const loggedInUser = await login(data.email, data.password, !!data.rememberMe);
      toast.success('Signed in successfully');
      if (loggedInUser?.mustChangePassword) {
        navigate('/force-change-password', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      if (!error.response) {
        toast.error('Network error or server unreachable');
      } else {
        toast.error(error.response.data?.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign in to your account</h1>
        <p className="mt-1 text-xs text-gray-400">Enter your credentials to access your Business Management workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          iconLeft={HiEnvelope}
          autoComplete="email"
          disabled={isLoading}
          error={errors.email?.message}
          className="bg-white/10 text-white placeholder-gray-500 border-white/10 focus:border-primary-500 focus:ring-primary-500/40"
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            iconLeft={HiLockClosed}
            autoComplete="current-password"
            disabled={isLoading}
            error={errors.password?.message}
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

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={isLoading}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-primary-600 focus:ring-primary-500 cursor-pointer"
              {...register('rememberMe')}
            />
            <span className="text-xs text-gray-300">Remember Me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full mt-3 font-semibold text-sm shadow-lg shadow-primary-600/30"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
