import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, HiExclamationCircle, HiSparkles } from 'react-icons/hi2';

const loginSchema = z.object({
  email: z.string()
    .min(1, { message: 'Please enter your email address.' })
    .email({ message: 'Invalid email address.' }),
  password: z.string()
    .min(1, { message: 'Please enter your password.' }),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Clear auth error when user starts typing again
  useEffect(() => {
    if (authError) {
      setAuthError('');
    }
  }, [emailValue, passwordValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (data) => {
    if (isLoading) return; // Prevent duplicate submissions
    setAuthError('');
    
    try {
      setIsLoading(true);
      const loggedInUser = await login(data.email, data.password, !!data.rememberMe);
      
      if (loggedInUser?.mustChangePassword) {
        navigate('/force-change-password', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      if (!error.response) {
        setAuthError('Network error or server unreachable.');
      } else {
        // Use generic message for 401s per requirements, though backend already does this
        const status = error.response.status;
        const msg = error.response.data?.message || 'Invalid email or password.';
        setAuthError(status === 401 || status === 403 ? msg : 'An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (isLoading || isDemoLoading) return;
    setAuthError('');
    try {
      setIsDemoLoading(true);
      await demoLogin();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (!error.response) {
        setAuthError('Network error or server unreachable.');
      } else {
        const msg = error.response.data?.message || 'Failed to start demo session. Please try again.';
        setAuthError(msg);
      }
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Welcome Back!</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to access your dashboard and continue managing your business.</p>
      </div>

      {authError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900/50 flex items-start gap-3 animate-fade-in">
          <HiExclamationCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          iconLeft={HiEnvelope}
          autoComplete="email"
          disabled={isLoading}
          error={errors.email?.message}
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
            className="pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-primary-600 focus:ring-primary-500 cursor-pointer"
              {...register('rememberMe')}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Remember Me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading || isDemoLoading}
          className="w-full mt-4 font-bold text-sm shadow-md"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        {/* Guest Exploration Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500 font-medium tracking-wider">
              Or explore as guest
            </span>
          </div>
        </div>

        {/* Explore Demo Button */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleDemoLogin}
          isLoading={isDemoLoading}
          disabled={isLoading || isDemoLoading}
          className="w-full font-bold text-sm border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm"
          leftIcon={<HiSparkles className="w-4 h-4 text-amber-500" />}
        >
          {isDemoLoading ? 'Entering Demo...' : 'Explore Demo (Read-Only)'}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
