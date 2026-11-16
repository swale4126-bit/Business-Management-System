import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { 
  HiEnvelope, HiLockClosed, HiEye, HiEyeSlash, 
  HiExclamationCircle, HiSparkles, HiArrowRight, HiShieldCheck 
} from 'react-icons/hi2';

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
        setAuthError('Network error or server unreachable. Please check your internet connection.');
      } else if (error.response.status === 404) {
        setAuthError('Backend service update is finishing deployment on Render. Please wait 1–2 minutes for the server to finish updating, then click Explore Demo again.');
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
      {/* Elevated Form Card */}
      <div className="bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-9 transition-all">
        
        {/* Card Header */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 mb-3.5">
            <HiShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Enterprise Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Sign in to access your business operations, inventory, and sales terminal.
          </p>
        </div>

        {/* Dynamic Alerts */}
        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/50 flex items-start gap-3 animate-fade-in">
            <HiExclamationCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-snug">
                {authError}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            iconLeft={HiEnvelope}
            autoComplete="email"
            disabled={isLoading || isDemoLoading}
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
              disabled={isLoading || isDemoLoading}
              error={errors.password?.message}
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                disabled={isLoading || isDemoLoading}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                {...register('rememberMe')}
              />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
            className="w-full mt-2 font-bold text-sm shadow-md shadow-blue-500/20 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          {/* Guest Exploration Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold tracking-wider text-[10px]">
                Instant Guest Access
              </span>
            </div>
          </div>

          {/* Interactive VIP Demo Card */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading || isDemoLoading}
            className="w-full p-4 rounded-2xl border border-amber-500/30 dark:border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/15 hover:to-amber-500/10 hover:border-amber-500/50 transition-all text-left group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                  {isDemoLoading ? (
                    <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HiSparkles className="w-5 h-5 animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {isDemoLoading ? 'Launching Demo...' : 'Explore Live Demo'}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 tracking-wider">
                      1-Click
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tour Manager Dashboard, Products, Sales & Reports (Read-Only)
                  </p>
                </div>
              </div>
              <HiArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
